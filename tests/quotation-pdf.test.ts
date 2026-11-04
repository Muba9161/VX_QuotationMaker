import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { generateQuotationPdf, type QuotationPdfData } from "@/lib/pdf/quotation-pdf";

const quotationData: QuotationPdfData = {
  quotationNumber: "VX-QTN-2026-0004",
  title: "Website development",
  issueDate: "2026-11-04",
  validTill: "2026-11-18",
  currencySymbol: "₹",
  subtotal: 45000,
  discountAmount: 0,
  taxRate: 18,
  taxAmount: 8100,
  grandTotal: 53100,
  paymentTerms: "50% advance, 50% upon delivery",
  notes: "Thank you for choosing our services.",
  organization: {
    name: "VorldX Industries Pvt Ltd",
    displayName: "VorldX Industries Pvt Ltd",
    address: "BBD University, Lucknow, Uttar Pradesh",
    email: "vorldx@gmail.com",
    phone: "+91939083844",
    taxId: "U62099UP2026PTC245598",
    primaryColor: "#10b981",
  },
  client: {
    name: "Ravindra Yadav",
    company: "Vorldx",
    address: "BBD University, Lucknow, Uttar Pradesh",
    email: "vorldx@gmail.com",
    phone: "+91939083844",
  },
  items: [
    {
      description: "Website UI/UX Design & Development",
      quantity: 1,
      unit: "Nos",
      rate: 45000,
      amount: 45000,
    },
  ],
};

describe("Quotation PDF layout", () => {
  it("generates a readable one-page quotation with correctly formatted currency", async () => {
    const bytes = generateQuotationPdf(quotationData);
    const pdf = await PDFDocument.load(bytes);
    const source = Buffer.from(bytes).toString("latin1");

    expect(pdf.getPageCount()).toBe(1);
    expect(source).toContain("INR 53,100.00");
    expect(source).toContain("Grand Total:");
    expect(source).toContain("Tax / GST \\(18%\\):");
    expect(source).not.toContain("₹");
  });

  it("keeps a short quotation below the configured letterhead area", async () => {
    const bytes = generateQuotationPdf({ ...quotationData, letterheadApplied: true });
    const pdf = await PDFDocument.load(bytes);
    const source = Buffer.from(bytes).toString("latin1");

    expect(pdf.getPageCount()).toBe(1);
    expect(source).toContain("QUOTATION");
    expect(source).toContain("INR 53,100.00");
  });

  it("paginates long item lists and long terms without clipping the PDF page bounds", async () => {
    const longQuotation: QuotationPdfData = {
      ...quotationData,
      discountAmount: 2500,
      taxRate: 18,
      taxAmount: 7650,
      grandTotal: 50150,
      letterheadApplied: true,
      termsAndConditions: "Additional terms. ".repeat(260),
      items: Array.from({ length: 42 }, (_, index) => ({
        description: `Service ${index + 1} - ${"Detailed quotation line description ".repeat(3)}`,
        quantity: index + 1,
        unit: "Hours",
        rate: 1200,
        amount: (index + 1) * 1200,
      })),
    };

    const bytes = generateQuotationPdf(longQuotation);
    const pdf = await PDFDocument.load(bytes);
    const source = Buffer.from(bytes).toString("latin1");

    expect(pdf.getPageCount()).toBeGreaterThan(2);
    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize();
      expect(width).toBeGreaterThan(500);
      expect(height).toBeGreaterThan(800);
    }
    const tableHeaderYs = [...source.matchAll(/([0-9.]+)\s+([0-9.]+)\s+Td\n\(Item & Description\) Tj/g)]
      .map((match) => Number(match[2]));
    expect(tableHeaderYs.length).toBeGreaterThan(2);
    expect(tableHeaderYs.slice(1).every((pageY) => pageY < 700)).toBe(true);
  });
});
