/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { resolveShareByToken, generateShareToken } from "@/lib/services/share-token";
import { hashOtp } from "@/lib/services/otp";
import { processDocumentSignature } from "@/lib/services/signing-service";
import { generateSignedDocumentPdf } from "@/lib/pdf/signed-pdf-generator";
import { hashSnapshotContent } from "@/lib/services/document-snapshot";
import { GET as getPublicShare } from "@/app/api/v1/public/shares/[token]/route";
import { POST as signPublicShare } from "@/app/api/v1/public/shares/[token]/sign/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    documentShare: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn(),
    },
    documentSnapshot: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    documentOtp: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    documentSignature: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    documentAccessEvent: {
      create: vi.fn(),
    },
    document: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/email-templates/sharing-emails", () => ({
  sendOtpVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendDocumentSignedEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/audit", () => ({
  recordAuditLog: vi.fn().mockResolvedValue({ id: "audit_1" }),
}));

describe("Phase 4 Security Audit & Multi-Tenant Isolation Tests", () => {
  beforeEach(() => {
    process.env.OTP_SECRET = "test-otp-secret-with-minimum-32-characters-entropy";
    vi.clearAllMocks();
  });

  describe("1. Multi-Tenant Isolation & Token Resolution", () => {
    it("rejects token resolution if share record does not exist", async () => {
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue(null);

      const fakeToken = "a".repeat(64);
      const res = await resolveShareByToken(fakeToken);
      expect(res.valid).toBe(false);
      if (!res.valid) {
        expect(res.reason).toBe("NOT_FOUND");
      }
    });

    it("rejects revoked share tokens with explicit REVOKED status", async () => {
      const revokedToken = "b".repeat(64);
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue({
        id: "share_revoked_1",
        status: "REVOKED",
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
        document: { id: "doc_1", organizationId: "org_alpha" },
        organization: { id: "org_alpha" },
        signatures: [],
      } as any);

      const res = await resolveShareByToken(revokedToken);
      expect(res.valid).toBe(false);
      if (!res.valid) {
        expect(res.reason).toBe("REVOKED");
      }
    });

    it("rejects expired share tokens with explicit EXPIRED status", async () => {
      const expiredToken = "c".repeat(64);
      vi.mocked(prisma.documentShare.update).mockResolvedValue({ id: "share_expired_1", status: "EXPIRED" } as any);
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue({
        id: "share_expired_1",
        status: "PENDING",
        revokedAt: null,
        expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
        document: { id: "doc_1", organizationId: "org_alpha" },
        organization: { id: "org_alpha" },
        signatures: [],
      } as any);

      const res = await resolveShareByToken(expiredToken);
      expect(res.valid).toBe(false);
      if (!res.valid) {
        expect(res.reason).toBe("EXPIRED");
      }
    });

    it("strictly isolates tenant document data: public resolution delivers frozen document belonging to tenant", async () => {
      const validToken = "d".repeat(64);
      const mockShare = {
        id: "share_org_beta",
        status: "PENDING",
        recipientName: "Beta Client",
        recipientEmail: "client@betacorp.com",
        recipientRole: "Signer",
        signingOrder: 1,
        allowDownload: true,
        expiresAt: new Date(Date.now() + 60000),
        document: {
          id: "doc_beta_001",
          organizationId: "org_beta_id",
          docNumber: "Q-BETA-001",
          title: "Beta Proposal",
          type: "QUOTATION",
          status: "SENT",
          items: [],
          clauses: [],
        },
        organization: {
          id: "org_beta_id",
          name: "Beta Corp",
          slug: "beta-corp",
        },
        snapshot: {
          id: "snap_1",
          documentId: "doc_beta_001",
          version: 1,
          contentHash: "hash_beta_123",
          contentJson: { total: 50000, clientName: "Beta Client" },
        },
        signatures: [],
      };

      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue(mockShare as any);

      const res = await resolveShareByToken(validToken);
      expect(res.valid).toBe(true);
      if (res.valid) {
        expect(res.organization.id).toBe("org_beta_id");
        expect(res.document.id).toBe("doc_beta_001");
        expect(res.snapshot?.contentHash).toBe("hash_beta_123");
      }
    });
  });

  describe("2. Sequential Multi-Party MOU Signing Enforcement", () => {
    it("blocks Signer 2 from signing when Signer 1 has not completed signing", async () => {
      const rawToken = generateShareToken();

      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue({
        id: "share_party_2",
        status: "PENDING",
        signingOrder: 2, // Signer 2
        recipientRole: "Party B (Vendor)",
        recipientEmail: "john@example.com",
        document: {
          id: "mou_001",
          type: "MOU",
          status: "SENT",
          organizationId: "org_1",
          docNumber: "MOU-2026-001",
        },
        organization: { id: "org_1", name: "Org 1" },
        signatures: [],
        expiresAt: new Date(Date.now() + 60000),
      } as any);

      // Prior incomplete share for Signer 1
      vi.mocked(prisma.documentShare.findFirst).mockResolvedValue({
        id: "share_party_1",
        signingOrder: 1,
        status: "PENDING", // Not completed yet!
      } as any);

      const result = await processDocumentSignature({
        rawToken,
        signerName: "John Doe",
        signerEmail: "john@example.com",
        signatureType: "DRAWN",
        signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        consentAccepted: true,
        consentStatement: "I agree to sign.",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ORDER_RESTRICTED");
        expect(result.message).toContain("sequential signing");
      }
    });

    it("allows Signer 1 to sign, transitioning MOU to PENDING_SIGNATURE instead of premature SIGNED", async () => {
      const rawToken = generateShareToken();

      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue({
        id: "share_party_1",
        status: "PENDING",
        signingOrder: 1,
        recipientRole: "Party A (Client)",
        recipientEmail: "one@org1.com",
        document: {
          id: "mou_002",
          type: "MOU",
          status: "SENT",
          organizationId: "org_1",
          docNumber: "MOU-2026-002",
        },
        organization: { id: "org_1", name: "Org 1", email: "admin@org1.com" },
        signatures: [],
        expiresAt: new Date(Date.now() + 60000),
      } as any);

      // No prior incomplete shares for Signer 1
      vi.mocked(prisma.documentShare.findFirst).mockResolvedValue(null);

      // In the transaction, mock $transaction callback execution
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const txMock = {
          documentSignature: {
            create: vi.fn().mockResolvedValue({ id: "sig_1" }),
          },
          documentShare: {
            update: vi.fn().mockResolvedValue({ id: "share_party_1", status: "COMPLETED" }),
            findMany: vi.fn().mockResolvedValue([
              { id: "share_party_1", status: "COMPLETED" },
              { id: "share_party_2", status: "PENDING" }, // Party 2 still pending!
            ]),
          },
          documentAccessEvent: {
            create: vi.fn().mockResolvedValue({ id: "evt_1" }),
          },
          document: {
            update: vi.fn().mockResolvedValue({ id: "mou_002", status: "PENDING_SIGNATURE" }),
          },
        };
        return cb(txMock);
      });

      vi.mocked(prisma.documentSignature.findMany).mockResolvedValue([
        {
          id: "sig_1",
          signerName: "Signer One",
          signerEmail: "one@org1.com",
          signerRole: "Party A",
          signatureType: "DRAWN",
          signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
          consentStatement: "I agree.",
          consentAcceptedAt: new Date(),
          ipAddress: "127.0.0.1",
          userAgent: "TestAgent",
          snapshotHash: "hash_mou_002",
        } as any,
      ]);

      vi.mocked(prisma.documentSignature.update).mockResolvedValue({ id: "sig_1" } as any);

      const result = await processDocumentSignature({
        rawToken,
        signerName: "Signer One",
        signerEmail: "one@org1.com",
        signatureType: "DRAWN",
        signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        consentAccepted: true,
        consentStatement: "I agree.",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.isFullySigned).toBe(false);
        expect(result.documentStatus).toBe("PENDING_SIGNATURE");
      }
    });
  });

  describe("3. OTP Cryptographic Blindness & Protection", () => {
    it("computes keyed HMAC preventing plain SHA-256 rainbow-table attacks", () => {
      const code = "789123";
      const hmacHash = hashOtp(code);

      expect(hmacHash).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hmacHash)).toBe(true);
      // Keyed HMAC is not equal to plain unkeyed sha256
      const plainSha256 = crypto.createHash("sha256").update(code).digest("hex");
      expect(hmacHash).not.toBe(plainSha256);
    });
  });

  describe("4. Cryptographic Seal & PDF Execution Certificate", () => {
    it("generates tamper-evident digital certificate with valid SHA-256 seal", () => {
      const mockSnapshotHash = hashSnapshotContent({
        id: "doc_test_1",
        docNumber: "Q-AUDIT-001",
        title: "Security Audit Quotation",
        type: "QUOTATION",
        organizationId: "org_1",
        clientName: "Audit Client",
        currency: "INR",
        currencySymbol: "₹",
        subtotal: 100000,
        taxRate: 18,
        taxAmount: 18000,
        discountValue: 0,
        discountAmount: 0,
        total: 118000,
        issueDate: "2026-10-30T00:00:00.000Z",
        items: [],
        clauses: [],
      });

      const { pdfBytes, pdfHash } = generateSignedDocumentPdf({
        docType: "QUOTATION",
        signatures: [
          {
            signerName: "Alice Audit",
            signerEmail: "alice@example.com",
            signerRole: "Authorized Client Signatory",
            signatureType: "DRAWN",
            signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
            consentStatement: "I confirm and execute.",
            consentAcceptedAt: new Date(),
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            snapshotHash: mockSnapshotHash,
          },
        ],
        snapshotHash: mockSnapshotHash,
      });

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);
      expect(pdfHash).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(pdfHash)).toBe(true);
    });
  });

  describe("5. Public Sharing & Signing Route Handlers (/api/v1/public/shares/*)", () => {
    it("GET /api/v1/public/shares/[token] returns 404 for invalid token format", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/shares/short-token");
      const res = await getPublicShare(req, {
        params: Promise.resolve({ token: "short-token" }),
      });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe("NOT_FOUND");
      expect(res.headers.get("Cache-Control")).toContain("no-store");
    });

    it("GET /api/v1/public/shares/[token] returns 410 when share link is revoked", async () => {
      const revokedToken = "e".repeat(64);
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue({
        id: "share_revoked_99",
        status: "REVOKED",
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
        document: { id: "doc_1", organizationId: "org_alpha" },
        organization: { id: "org_alpha" },
        signatures: [],
      } as any);

      const req = new NextRequest(`http://localhost:3000/api/v1/public/shares/${revokedToken}`);
      const res = await getPublicShare(req, {
        params: Promise.resolve({ token: revokedToken }),
      });
      const json = await res.json();

      expect(res.status).toBe(410);
      expect(json.error).toBe("REVOKED");
    });

    it("POST /api/v1/public/shares/[token]/sign rejects submissions without legal consent", async () => {
      const validToken = "f".repeat(64);
      const req = new NextRequest(`http://localhost:3000/api/v1/public/shares/${validToken}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: "Bob Tester",
          signerEmail: "bob@tester.com",
          signatureType: "DRAWN",
          signatureData: "data:image/png;base64,abc",
          consentAccepted: false, // Not accepted!
        }),
      });

      // Mock valid token resolution
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue({
        id: "share_valid_1",
        status: "PENDING",
        signingOrder: 1,
        recipientRole: "CLIENT",
        recipientEmail: "bob@tester.com",
        document: {
          id: "doc_q_1",
          type: "QUOTATION",
          status: "SENT",
          organizationId: "org_1",
          docNumber: "Q-001",
          items: [],
          clauses: [],
        },
        organization: { id: "org_1", name: "Org 1" },
        signatures: [],
        expiresAt: new Date(Date.now() + 60000),
      } as any);

      const res = await signPublicShare(req, {
        params: Promise.resolve({ token: validToken }),
      });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe("CONSENT_REQUIRED");
      expect(res.headers.get("Cache-Control")).toContain("no-store");
    });
  });
});
