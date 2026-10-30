import { describe, it, expect } from "vitest";
import {
  calculateQuotationFinancials,
  roundCurrency,
} from "@/lib/services/financial-calculator";

describe("Financial Calculation Engine", () => {
  it("accurately calculates subtotal, taxes, and grand total for single item", () => {
    const result = calculateQuotationFinancials({
      items: [
        {
          description: "Web Development",
          quantity: 2,
          rate: 25000,
          discount: 0,
          taxPercent: 18,
        },
      ],
      taxRate: 18,
    });

    expect(result.subtotal).toBe(50000);
    expect(result.itemDiscountsTotal).toBe(0);
    expect(result.overallDiscountAmount).toBe(0);
    expect(result.taxableAmount).toBe(50000);
    expect(result.taxAmount).toBe(9000); // 18% of 50000
    expect(result.grandTotal).toBe(59000);
    expect(result.items[0].amount).toBe(59000);
  });

  it("calculates multiple items with item-level discounts correctly", () => {
    const result = calculateQuotationFinancials({
      items: [
        {
          description: "Service A",
          quantity: 1,
          rate: 10000,
          discount: 1000, // taxable 9000
        },
        {
          description: "Service B",
          quantity: 3,
          rate: 5000,
          discount: 2000, // taxable 13000
        },
      ],
      taxRate: 18,
    });

    expect(result.subtotal).toBe(25000);
    expect(result.itemDiscountsTotal).toBe(3000);
    expect(result.taxableAmount).toBe(22000);
    expect(result.taxAmount).toBe(3960); // 18% of 22000
    expect(result.grandTotal).toBe(25960);
  });

  it("accurately applies document-level percentage discount", () => {
    const result = calculateQuotationFinancials({
      items: [
        {
          description: "Consulting",
          quantity: 10,
          rate: 1000,
        },
      ],
      taxRate: 10,
      discountType: "percentage",
      discountValue: 15, // 15% discount
    });

    expect(result.subtotal).toBe(10000);
    expect(result.overallDiscountAmount).toBe(1500);
    expect(result.taxableAmount).toBe(8500);
    expect(result.taxAmount).toBe(850);
    expect(result.grandTotal).toBe(9350);
  });

  it("accurately applies document-level fixed discount", () => {
    const result = calculateQuotationFinancials({
      items: [
        {
          description: "License",
          quantity: 1,
          rate: 50000,
        },
      ],
      taxRate: 18,
      discountType: "fixed",
      discountValue: 5000,
    });

    expect(result.subtotal).toBe(50000);
    expect(result.overallDiscountAmount).toBe(5000);
    expect(result.taxableAmount).toBe(45000);
    expect(result.taxAmount).toBe(8100);
    expect(result.grandTotal).toBe(53100);
  });

  it("handles decimal precision and commercial rounding without floating point anomalies", () => {
    const result = calculateQuotationFinancials({
      items: [
        {
          description: "Fractional Item",
          quantity: 3,
          rate: 33.33,
        },
      ],
      taxRate: 18,
    });

    // 3 * 33.33 = 99.99
    expect(result.subtotal).toBe(99.99);
    // 99.99 * 0.18 = 17.9982 -> rounded 18.00
    expect(result.taxAmount).toBe(18.0);
    expect(result.grandTotal).toBe(117.99);
  });

  it("rejects quotation with zero line items", () => {
    expect(() =>
      calculateQuotationFinancials({
        items: [],
      })
    ).toThrow("Quotation must contain at least one line item.");
  });

  it("rejects non-positive quantity", () => {
    expect(() =>
      calculateQuotationFinancials({
        items: [{ description: "Test", quantity: 0, rate: 100 }],
      })
    ).toThrow("Quantity must be greater than zero");
  });

  it("rejects negative unit price", () => {
    expect(() =>
      calculateQuotationFinancials({
        items: [{ description: "Test", quantity: 1, rate: -50 }],
      })
    ).toThrow("Unit price cannot be negative");
  });

  it("rejects item discount exceeding line subtotal", () => {
    expect(() =>
      calculateQuotationFinancials({
        items: [{ description: "Test", quantity: 1, rate: 100, discount: 150 }],
      })
    ).toThrow("cannot exceed line subtotal");
  });

  it("handles fractional quantities, decimal unit prices, and zero-value promotional items", () => {
    const result = calculateQuotationFinancials({
      items: [
        {
          description: "Consulting Hours",
          quantity: 2.5,
          rate: 150.5, // 2.5 * 150.5 = 376.25
        },
        {
          description: "Free Onboarding Session",
          quantity: 1,
          rate: 0, // Zero-value promotional item
          discount: 0,
        },
      ],
      taxRate: 12,
    });

    expect(result.subtotal).toBe(376.25);
    expect(result.taxableAmount).toBe(376.25);
    // 376.25 * 0.12 = 45.15
    expect(result.taxAmount).toBe(45.15);
    expect(result.grandTotal).toBe(421.4);
    expect(result.items[1].amount).toBe(0);
  });

  it("rejects fixed discount exceeding eligible amount", () => {
    expect(() =>
      calculateQuotationFinancials({
        items: [{ description: "Basic Widget", quantity: 1, rate: 500 }],
        discountType: "fixed",
        discountValue: 600,
      })
    ).toThrow("cannot exceed eligible amount");
  });

  it("handles multiple tax tiers (5%, 12%, 18%, 28%) without floating-point drift", () => {
    const taxTiers = [5, 12, 18, 28];
    for (const rate of taxTiers) {
      const res = calculateQuotationFinancials({
        items: [{ description: "Tiered Product", quantity: 10, rate: 100.55 }],
        taxRate: rate,
      });
      // 10 * 100.55 = 1005.5
      expect(res.subtotal).toBe(1005.5);
      const expectedTax = roundCurrency(1005.5 * (rate / 100));
      expect(res.taxAmount).toBe(expectedTax);
      expect(res.grandTotal).toBe(roundCurrency(1005.5 + expectedTax));
    }
  });

  it("rejects percentage discount greater than 100%", () => {
    expect(() =>
      calculateQuotationFinancials({
        items: [{ description: "Test", quantity: 1, rate: 100 }],
        discountType: "percentage",
        discountValue: 120,
      })
    ).toThrow("cannot exceed 100%");
  });
});

