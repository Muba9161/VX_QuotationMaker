/**
 * Financial Calculation Engine
 *
 * Implements authoritative server-side calculation for quotations and commercial documents.
 * Ensures decimal-safe arithmetic, prevents client total manipulation, and validates financial bounds.
 */

export interface LineItemInput {
  name?: string;
  description: string;
  quantity: number;
  unit?: string;
  rate: number;
  discount?: number;
  taxPercent?: number;
  sortOrder?: number;
}

export interface CalculatedLineItem {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxPercent: number;
  lineSubtotal: number;
  taxableAmount: number;
  taxAmount: number;
  amount: number;
  sortOrder: number;
}

export interface QuotationFinancialsInput {
  items: LineItemInput[];
  taxRate?: number;
  discountType?: "percentage" | "fixed" | "none";
  discountValue?: number;
}

export interface CalculatedQuotationFinancials {
  items: CalculatedLineItem[];
  subtotal: number;
  itemDiscountsTotal: number;
  overallDiscountAmount: number;
  totalDiscountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
}

/**
 * Rounds a number to exactly two decimal places using standard commercial rounding.
 */
export function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Validates and calculates complete quotation financial breakdown server-side.
 * Rejects negative rates, negative quantities, or invalid discounts.
 */
export function calculateQuotationFinancials(
  input: QuotationFinancialsInput
): CalculatedQuotationFinancials {
  const itemsInput = input.items || [];
  if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
    throw new Error("Quotation must contain at least one line item.");
  }

  const defaultDocTaxRate = typeof input.taxRate === "number" && !isNaN(input.taxRate)
    ? Math.max(0, input.taxRate)
    : 18.0;

  let calculatedSubtotal = 0;
  let calculatedItemDiscounts = 0;

  const calculatedItems: CalculatedLineItem[] = itemsInput.map((rawItem, idx) => {
    const quantity = Number(rawItem.quantity);
    const rate = Number(rawItem.rate);
    const discount = Number(rawItem.discount || 0);
    const taxPercent = typeof rawItem.taxPercent === "number" && !isNaN(rawItem.taxPercent)
      ? Math.max(0, rawItem.taxPercent)
      : defaultDocTaxRate;

    if (isNaN(quantity) || quantity <= 0) {
      throw new Error(`Item #${idx + 1}: Quantity must be greater than zero.`);
    }
    if (isNaN(rate) || rate < 0) {
      throw new Error(`Item #${idx + 1}: Unit price cannot be negative.`);
    }
    if (isNaN(discount) || discount < 0) {
      throw new Error(`Item #${idx + 1}: Discount cannot be negative.`);
    }

    const lineSubtotal = roundCurrency(quantity * rate);
    if (discount > lineSubtotal) {
      throw new Error(
        `Item #${idx + 1}: Discount (${discount}) cannot exceed line subtotal (${lineSubtotal}).`
      );
    }

    const taxableAmount = roundCurrency(lineSubtotal - discount);
    const taxAmount = roundCurrency(taxableAmount * (taxPercent / 100));
    const amount = roundCurrency(taxableAmount + taxAmount);

    calculatedSubtotal += lineSubtotal;
    calculatedItemDiscounts += discount;

    return {
      name: (rawItem.name || "").trim(),
      description: (rawItem.description || "").trim(),
      quantity: roundCurrency(quantity),
      unit: (rawItem.unit || "Nos").trim(),
      rate: roundCurrency(rate),
      discount: roundCurrency(discount),
      taxPercent: roundCurrency(taxPercent),
      lineSubtotal,
      taxableAmount,
      taxAmount,
      amount,
      sortOrder: typeof rawItem.sortOrder === "number" ? rawItem.sortOrder : idx,
    };
  });

  calculatedSubtotal = roundCurrency(calculatedSubtotal);
  calculatedItemDiscounts = roundCurrency(calculatedItemDiscounts);

  // Overall discount calculation
  let overallDiscountAmount = 0;
  const discountType = input.discountType || "none";
  const rawDiscountValue = Math.max(0, Number(input.discountValue || 0));

  const remainingAfterItemDiscounts = Math.max(0, calculatedSubtotal - calculatedItemDiscounts);

  if (discountType === "percentage") {
    if (rawDiscountValue > 100) {
      throw new Error("Quotation overall discount percentage cannot exceed 100%.");
    }
    overallDiscountAmount = roundCurrency(
      remainingAfterItemDiscounts * (rawDiscountValue / 100)
    );
  } else if (discountType === "fixed") {
    if (rawDiscountValue > remainingAfterItemDiscounts) {
      throw new Error(
        `Quotation fixed discount (${rawDiscountValue}) cannot exceed eligible amount (${remainingAfterItemDiscounts}).`
      );
    }
    overallDiscountAmount = roundCurrency(rawDiscountValue);
  }

  const totalDiscountAmount = roundCurrency(
    calculatedItemDiscounts + overallDiscountAmount
  );
  const taxableAmount = roundCurrency(
    Math.max(0, calculatedSubtotal - totalDiscountAmount)
  );
  const taxAmount = roundCurrency(taxableAmount * (defaultDocTaxRate / 100));
  const grandTotal = roundCurrency(taxableAmount + taxAmount);

  return {
    items: calculatedItems,
    subtotal: calculatedSubtotal,
    itemDiscountsTotal: calculatedItemDiscounts,
    overallDiscountAmount,
    totalDiscountAmount,
    taxableAmount,
    taxRate: roundCurrency(defaultDocTaxRate),
    taxAmount,
    grandTotal,
  };
}

