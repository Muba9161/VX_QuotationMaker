import { describe, it, expect } from "vitest";
import { generateSignedDocumentPdf } from "@/lib/pdf/signed-pdf-generator";
import { QuotationPdfData } from "@/lib/pdf/quotation-pdf";
import { MouPdfData } from "@/lib/pdf/mou-pdf";

describe("Phase 4: Signed PDF Generation & Execution Certificate", () => {
  const mockQuotationData: QuotationPdfData = {
    quotationNumber: "QUO-2026-001",
    title: "Enterprise Cloud Architecture",
    issueDate: new Date().toISOString(),
    validTill: new Date(Date.now() + 30 * 86400000).toISOString(),
    currencySymbol: "₹",
    subtotal: 100000,
    discountAmount: 5000,
    taxRate: 18,
    taxAmount: 17100,
    grandTotal: 112100,
    client: {
      name: "Acme Corp",
      email: "contact@acme.com",
    },
    organization: {
      name: "VorldX Technologies",
      primaryColor: "#2563eb",
    },
    items: [
      {
        description: "Cloud Architecture Design",
        quantity: 1,
        unit: "Nos",
        rate: 95000,
        amount: 95000,
      },
    ],
  };

  const mockMouData: MouPdfData = {
    mouNumber: "VX-MOU-2026-001",
    title: "Strategic Cooperation MOU",
    effectiveDate: new Date().toISOString(),
    purpose: "Strategic AI partnership",
    partyA: {
      name: "VorldX Inc",
      primaryColor: "#1e3a8a",
    },
    partyB: {
      name: "Partner Solutions Pvt Ltd",
      email: "partner@example.com",
    },
    clauses: [
      {
        title: "Scope of Cooperation",
        content: "Both parties agree to collaborate on technology integration.",
        sortOrder: 1,
      },
    ],
  };

  it("generates a signed Quotation PDF with cryptographic seal and audit stamp", () => {
    const { pdfBytes, pdfHash } = generateSignedDocumentPdf({
      docType: "QUOTATION",
      quotationData: mockQuotationData,
      snapshotHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      signatures: [
        {
          signerName: "John Doe",
          signerEmail: "john@acme.com",
          signerRole: "CLIENT",
          signatureType: "DRAWN",
          signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          consentStatement: "I agree to sign this electronically.",
          consentAcceptedAt: new Date().toISOString(),
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          snapshotHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
      ],
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);
    expect(pdfHash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(pdfHash)).toBe(true);
  });

  it("generates a signed MOU PDF supporting dual signatories", () => {
    const { pdfBytes, pdfHash } = generateSignedDocumentPdf({
      docType: "MOU",
      mouData: mockMouData,
      snapshotHash: "a4f1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852c999",
      signatures: [
        {
          signerName: "Alice Client",
          signerEmail: "alice@partner.com",
          signerRole: "CLIENT",
          signatureType: "TYPED",
          signatureData: "Alice Client",
          consentStatement: "I agree to sign this electronically.",
          consentAcceptedAt: new Date().toISOString(),
          ipAddress: "103.21.244.2",
          userAgent: "Chrome/120.0",
          snapshotHash: "a4f1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852c999",
        },
        {
          signerName: "Bob Representative",
          signerEmail: "bob@vorldx.com",
          signerRole: "ORGANIZATION",
          signatureType: "DRAWN",
          signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          consentStatement: "I agree to sign this electronically.",
          consentAcceptedAt: new Date().toISOString(),
          ipAddress: "103.21.244.5",
          userAgent: "Chrome/120.0",
          snapshotHash: "a4f1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852c999",
        },
      ],
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(2000);
    expect(pdfHash).toHaveLength(64);
  });
});

