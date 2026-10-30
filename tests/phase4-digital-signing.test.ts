import { describe, it, expect } from "vitest";
import { hashSnapshotContent, DocumentSnapshotContent } from "@/lib/services/document-snapshot";
import { validateStatusTransition } from "@/lib/services/lifecycle";
import { DocumentStatus } from "@prisma/client";

describe("Phase 4: Digital Signing Lifecycle & Integrity Verification", () => {
  const sampleSnapshot: DocumentSnapshotContent = {
    id: "doc-123",
    docNumber: "QUO-001",
    title: "Web Platform Development",
    type: "QUOTATION",
    organizationId: "org-1",
    clientName: "Global Media",
    currency: "INR",
    currencySymbol: "₹",
    subtotal: 50000,
    taxRate: 18,
    taxAmount: 9000,
    discountAmount: 0,
    discountValue: 0,
    total: 59000,
    issueDate: "2026-10-30T00:00:00.000Z",
    items: [
      {
        id: "item-1",
        description: "Core Web Architecture",
        quantity: 1,
        unit: "Nos",
        rate: 50000,
        taxPercent: 18,
        amount: 50000,
        sortOrder: 1,
      },
    ],
    clauses: [],
  };

  it("produces deterministic SHA-256 hash for document snapshots", () => {
    const hash1 = hashSnapshotContent(sampleSnapshot);
    const hash2 = hashSnapshotContent(sampleSnapshot);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
  });

  it("detects any modification to document snapshot content", () => {
    const modifiedSnapshot: DocumentSnapshotContent = {
      ...sampleSnapshot,
      subtotal: 55000,
      total: 64900,
    };

    const originalHash = hashSnapshotContent(sampleSnapshot);
    const modifiedHash = hashSnapshotContent(modifiedSnapshot);

    expect(originalHash).not.toBe(modifiedHash);
  });

  it("enforces that manual status updates cannot transition an MOU directly to SIGNED", () => {
    // Verified digital signing workflow in Phase 4 is required
    const result = validateStatusTransition("MOU", DocumentStatus.PENDING_SIGNATURE, DocumentStatus.SIGNED);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MOU cannot be marked as SIGNED via manual status updates");
  });

  it("permits standard lifecycle transitions for Quotations and MOUs", () => {
    const qTransition = validateStatusTransition("QUOTATION", DocumentStatus.SENT, DocumentStatus.APPROVED);
    expect(qTransition.valid).toBe(true);

    const mouTransition = validateStatusTransition("MOU", DocumentStatus.SENT, DocumentStatus.PENDING_SIGNATURE);
    expect(mouTransition.valid).toBe(true);
  });
});

