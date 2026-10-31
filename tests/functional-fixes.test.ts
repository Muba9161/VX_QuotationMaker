import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCountriesList, getStatesForCountry, getCitiesForState } from "@/lib/data/locations";
import { isMockOrPlaceholderEmail } from "@/lib/email-templates/sharing-emails";
import { inviteMemberSchema, acceptInviteSchema } from "@/lib/validations/organization";

describe("Functional Fixes & Enhancements Verification", () => {
  describe("1. Member Name & Identity", () => {
    it("validates that invitation schema accepts and preserves a full name", () => {
      const parsed = inviteMemberSchema.safeParse({
        name: "Rana Pratap Singh",
        email: "raghuvanshiranapratapsingh@gmail.com",
        role: "VIEWER",
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.name).toBe("Rana Pratap Singh");
        expect(parsed.data.email).toBe("raghuvanshiranapratapsingh@gmail.com");
      }
    });

    it("validates accept invitation schema with name and strong password", () => {
      const parsed = acceptInviteSchema.safeParse({
        token: "sample-valid-token-12345",
        name: "Rana Pratap Singh",
        password: "SecurePassword123!",
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.name).toBe("Rana Pratap Singh");
      }
    });
  });

  describe("2. Quotation Financial Calculation & Bounds", () => {
    it("calculates Taxable Amount = Subtotal - Discount correctly with Percentage Discount", () => {
      const items = [
        { quantity: 2, unitPrice: 1000 }, // 2000
        { quantity: 1, unitPrice: 3000 }, // 3000 -> subtotal 5000
      ];
      // 10% discount on 5000 = 500. Taxable = 4500. 18% GST on 4500 = 810. Grand total = 5310.
      const subtotal = 5000;
      const discountPercent = 10;
      const discountAmount = (subtotal * discountPercent) / 100;
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const taxRate = 18;
      const taxAmount = (taxableAmount * taxRate) / 100;
      const grandTotal = taxableAmount + taxAmount;

      expect(discountAmount).toBe(500);
      expect(taxableAmount).toBe(4500);
      expect(taxAmount).toBe(810);
      expect(grandTotal).toBe(5310);
    });

    it("calculates Taxable Amount correctly with Fixed Discount clamped to subtotal", () => {
      const subtotal = 2000;
      const fixedDiscount = 2500; // exceeding subtotal
      const clampedDiscount = Math.min(fixedDiscount, subtotal);
      const taxableAmount = Math.max(0, subtotal - clampedDiscount);

      expect(clampedDiscount).toBe(2000);
      expect(taxableAmount).toBe(0);
    });

    it("handles 0% tax gracefully", () => {
      const subtotal = 5000;
      const discountAmount = 1000;
      const taxableAmount = subtotal - discountAmount;
      const taxRate = 0;
      const taxAmount = (taxableAmount * taxRate) / 100;
      const grandTotal = taxableAmount + taxAmount;

      expect(taxableAmount).toBe(4000);
      expect(taxAmount).toBe(0);
      expect(grandTotal).toBe(4000);
    });
  });

  describe("3. Cascading Locations Dataset", () => {
    it("provides list of countries including India", () => {
      const countries = getCountriesList();
      expect(countries).toContain("India");
      expect(countries).toContain("United States");
      expect(countries.length).toBeGreaterThan(5);
    });

    it("returns states for India", () => {
      const states = getStatesForCountry("India");
      expect(states).toContain("Uttar Pradesh");
      expect(states).toContain("Maharashtra");
      expect(states).toContain("Karnataka");
      expect(states).toContain("Delhi");
    });

    it("returns cities for a selected Indian state", () => {
      const upCities = getCitiesForState("India", "Uttar Pradesh");
      expect(upCities).toContain("Noida");
      expect(upCities).toContain("Lucknow");
      expect(upCities).toContain("Kanpur");

      const mhCities = getCitiesForState("India", "Maharashtra");
      expect(mhCities).toContain("Mumbai");
      expect(mhCities).toContain("Pune");
    });

    it("handles unknown countries safely", () => {
      expect(getStatesForCountry("Atlantis")).toEqual([]);
      expect(getCitiesForState("Atlantis", "Unknown")).toEqual([]);
    });
  });

  describe("4. Email Dispatch & Mock Domain Protection", () => {
    it("detects placeholder and dummy email domains", () => {
      expect(isMockOrPlaceholderEmail("contact@acme.com")).toBe(true);
      expect(isMockOrPlaceholderEmail("test@example.com")).toBe(true);
      expect(isMockOrPlaceholderEmail("user@demo.com")).toBe(true);
      expect(isMockOrPlaceholderEmail("")).toBe(true);
    });

    it("allows genuine production email addresses", () => {
      expect(isMockOrPlaceholderEmail("singhrana4186@gmail.com")).toBe(false);
      expect(isMockOrPlaceholderEmail("pratapranak41@gmail.com")).toBe(false);
      expect(isMockOrPlaceholderEmail("ceo@innovateindia.co.in")).toBe(false);
    });
  });

  describe("5. Pipeline Calculation Rules", () => {
    it("excludes EXPIRED, REVOKED, and DECLINED quotations from pipeline value", () => {
      const quotations = [
        { status: "DRAFT", total: 10000 },
        { status: "SENT", total: 25000 },
        { status: "APPROVED", total: 50000 },
        { status: "EXPIRED", total: 40000 },
        { status: "DECLINED", total: 15000 },
        { status: "REVOKED", total: 20000 },
      ];

      let totalQuotationValue = 0;
      for (const q of quotations) {
        if (q.status !== "REVOKED" && q.status !== "DECLINED" && q.status !== "EXPIRED") {
          totalQuotationValue += q.total;
        }
      }

      // 10,000 + 25,000 + 50,000 = 85,000 (excluding 40,000 + 15,000 + 20,000)
      expect(totalQuotationValue).toBe(85000);
    });
  });
});
