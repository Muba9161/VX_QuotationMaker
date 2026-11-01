import { LineItemForm } from "./QuotationLineItemTable";

export interface QuotationFinancials {
  subtotal: number;
  totalDiscount: number;
  taxableBase: number;
  calculatedTax: number;
  grandTotal: number;
  calculatedItems: Array<{ lineSub: number; taxable: number }>;
}

export function calculatePreviewFinancials(
  items: LineItemForm[],
  discountType: "percentage" | "fixed" | "none",
  discountValue: number,
  taxRate: number
): QuotationFinancials {
  let subtotal = 0;
  let itemDiscounts = 0;
  const calculatedItems: Array<{ lineSub: number; taxable: number }> = [];

  for (const item of items) {
    const q = Math.max(0, Number(item.quantity) || 0);
    const r = Math.max(0, Number(item.rate) || 0);
    const d = Math.max(0, Number(item.discount) || 0);
    const lineSub = q * r;
    const taxable = Math.max(0, lineSub - d);
    subtotal += lineSub;
    itemDiscounts += d;
    calculatedItems.push({ lineSub, taxable });
  }

  const eligibleForOverall = Math.max(0, subtotal - itemDiscounts);
  let overallDiscount = 0;
  if (discountType === "percentage") {
    overallDiscount = eligibleForOverall * (Math.min(100, Math.max(0, discountValue)) / 100);
  } else if (discountType === "fixed") {
    overallDiscount = Math.min(eligibleForOverall, Math.max(0, discountValue));
  }

  const totalDiscount = itemDiscounts + overallDiscount;
  const taxableBase = Math.max(0, subtotal - totalDiscount);
  const calculatedTax = taxableBase * (Math.max(0, taxRate) / 100);
  const grandTotal = taxableBase + calculatedTax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    taxableBase: Math.round(taxableBase * 100) / 100,
    calculatedTax: Math.round(calculatedTax * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    calculatedItems,
  };
}

