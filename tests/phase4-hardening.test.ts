/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getOtpSecret } from "@/lib/services/otp";
import { extractClientIp } from "@/lib/utils/client-ip";
import { verifyPdfHash } from "@/lib/pdf/signed-pdf-generator";
import { processDocumentSignature } from "@/lib/services/signing-service";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import crypto from "crypto";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    documentShare: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    documentOtp: {
      findFirst: vi.fn(),
    },
    documentSignature: {
      create: vi.fn(),
    },
    documentAccessEvent: {
      create: vi.fn(),
    },
    document: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Phase 4 Hardening & Security Verifications", () => {
  const originalOtpSecret = process.env.OTP_SECRET;

  beforeEach(() => {
    process.env.OTP_SECRET = "test-otp-secret-with-minimum-32-characters-entropy";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.OTP_SECRET = originalOtpSecret;
    vi.clearAllMocks();
  });

  describe("1. OTP Secret Hardening (getOtpSecret)", () => {
    it("fails when OTP_SECRET is missing or undefined", () => {
      delete process.env.OTP_SECRET;
      expect(() => getOtpSecret()).toThrow(/OTP_SECRET.*not configured/i);
    });

    it("fails when OTP_SECRET is shorter than 32 characters", () => {
      process.env.OTP_SECRET = "too-short-secret";
      expect(() => getOtpSecret()).toThrow(/at least 32 characters/i);
    });

    it("succeeds and returns secret when OTP_SECRET is 32+ characters", () => {
      const validSecret = "a".repeat(32);
      process.env.OTP_SECRET = validSecret;
      expect(getOtpSecret()).toBe(validSecret);
    });
  });

  describe("2. Client IP Extraction and Sanitization", () => {
    it("extracts direct IPv4 from x-forwarded-for", () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "203.0.113.195" },
      });
      const result = extractClientIp(req);
      expect(result.ip).toBe("203.0.113.195");
      expect(result.source).toBe("header_forwarded");
    });

    it("extracts client IP from multi-hop x-forwarded-for chain", () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "198.51.100.42, 10.0.0.1, 192.168.1.1" },
      });
      const result = extractClientIp(req);
      expect(result.ip).toBe("198.51.100.42");
    });

    it("extracts IPv6 address accurately", () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        headers: { "x-real-ip": "2001:0db8:85a3:0000:0000:8a2e:0370:7334" },
      });
      const result = extractClientIp(req);
      expect(result.ip).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
      expect(result.source).toBe("header_real");
    });

    it("falls back to 127.0.0.1 when headers contain invalid or spoofed strings", () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "malicious<script>alert(1)</script>" },
      });
      const result = extractClientIp(req);
      expect(result.ip).toBe("127.0.0.1");
      expect(result.source).toBe("fallback");
    });

    it("falls back to 127.0.0.1 when no IP headers are present", () => {
      const req = new NextRequest("http://localhost:3000/api/test");
      const result = extractClientIp(req);
      expect(result.ip).toBe("127.0.0.1");
      expect(result.source).toBe("fallback");
    });
  });

  describe("3. Signer Identity Binding and OTP Enforcement", () => {
    const validToken = "a".repeat(64);

    const baseDbShare = {
      id: "share_audit_1",
      token: validToken,
      recipientEmail: "client@acme.com",
      recipientRole: "CLIENT",
      requireOtp: true,
      status: "PENDING",
      signingOrder: 1,
      organizationId: "org_1",
      expiresAt: new Date(Date.now() + 86400000),
      document: {
        id: "doc_1",
        organizationId: "org_1",
        type: "QUOTATION",
        status: "SENT",
        docNumber: "Q-100",
        items: [],
        clauses: [],
      },
      organization: { id: "org_1", name: "Org 1" },
      signatures: [],
    };

    it("rejects signing when signerEmail does not match share recipientEmail (IDENTITY_MISMATCH)", async () => {
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue(baseDbShare as any);

      const result = await processDocumentSignature({
        rawToken: validToken,
        signerName: "Alice Attacker",
        signerEmail: "attacker@evil.com", // Mismatch!
        signatureType: "DRAWN",
        signatureData: "data:image/png;base64,valid",
        consentAccepted: true,
        consentStatement: "I agree",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("IDENTITY_MISMATCH");
    });

    it("rejects signing if requireOtp is true but no verified OTP exists (OTP_REQUIRED)", async () => {
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue(baseDbShare as any);
      vi.mocked(prisma.documentOtp.findFirst).mockResolvedValue(null);

      const result = await processDocumentSignature({
        rawToken: validToken,
        signerName: "Alice Legitimate",
        signerEmail: "client@acme.com",
        signatureType: "DRAWN",
        signatureData: "data:image/png;base64,valid",
        consentAccepted: true,
        consentStatement: "I agree",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("OTP_REQUIRED");
    });

    it("rejects signing if legal name contains no alphabetical characters", async () => {
      vi.mocked(prisma.documentShare.findUnique).mockResolvedValue(baseDbShare as any);

      const result = await processDocumentSignature({
        rawToken: validToken,
        signerName: "123456", // Invalid legal name
        signerEmail: "client@acme.com",
        signatureType: "DRAWN",
        signatureData: "data:image/png;base64,valid",
        consentAccepted: true,
        consentStatement: "I agree",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("VALIDATION_ERROR");
    });
  });

  describe("4. Signed PDF SHA-256 Hash Verification", () => {
    it("returns true for matching PDF hash", () => {
      const mockPdfBytes = new TextEncoder().encode("%PDF-1.4 Mock Signed PDF Content");
      const expectedHash = crypto.createHash("sha256").update(mockPdfBytes).digest("hex");

      const result = verifyPdfHash(mockPdfBytes, expectedHash);
      expect(result.valid).toBe(true);
      expect(result.calculatedHash).toBe(expectedHash);
    });

    it("returns false for tampered PDF bytes or mismatched hash", () => {
      const mockPdfBytes = new TextEncoder().encode("%PDF-1.4 Mock Signed PDF Content");
      const tamperedBytes = new TextEncoder().encode("%PDF-1.4 Tampered Content");
      const originalHash = crypto.createHash("sha256").update(mockPdfBytes).digest("hex");

      const result = verifyPdfHash(tamperedBytes, originalHash);
      expect(result.valid).toBe(false);
      expect(result.calculatedHash).not.toBe(originalHash);
    });
  });
});
