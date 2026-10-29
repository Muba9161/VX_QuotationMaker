/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/v1/organization/branding/route";
import { readTenantAsset, saveTenantAsset } from "@/lib/storage/upload";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { User, Organization } from "@prisma/client";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session"
  );
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Organization Branding & Centralized Letterhead Handlers", () => {
  const mockOrg: Organization = {
    id: "org_222",
    planId: null,
    name: "Nexus Labs",
    displayName: "Nexus Technologies",
    slug: "nexus-labs",
    domain: "nexus.io",
    tagline: "Connecting Intelligence",
    email: "contact@nexus.io",
    phone: "+91 9999999999",
    website: "https://nexus.io",
    address: "45 Innovation Way, Mumbai",
    taxId: "GSTIN99999",
    cin: "U72200MH2026PTC999999",
    logoUrl: "/api/v1/organization/branding/asset/org_222/logo.png",
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    accentColor: "#06B6D4",
    letterheadUrl: "/api/v1/organization/branding/asset/org_222/letterhead.png",
    letterheadHeaderText: "Nexus Official Quotation & MOU",
    letterheadFooterText: "Confidential - For authorized eyes only",
    letterheadLogoPosition: "left",
    defaultSignatoryName: "Alice Director",
    defaultSignatoryTitle: "Managing Director",
    allowMemberRegistration: true,
    requireAdminApproval: true,
    defaultExpiryDays: 30,
    status: "ACTIVE",
    currentUsersCount: 3,
    currentDocumentsCount: 8,
    currentStorageBytes: BigInt(2048),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser: User = {
    id: "usr_admin2",
    organizationId: "org_222",
    name: "Admin Alice",
    email: "alice@nexus.io",
    passwordHash: "hash",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    avatarUrl: null,
    phone: null,
    title: "Managing Director",
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/organization/branding", () => {
    it("returns branding and centralized letterhead details", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdminUser,
        organization: mockOrg,
        session: { id: "s_2" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

      const req = new Request("http://localhost:3000/api/v1/organization/branding", {
        headers: { Cookie: "vx_session=valid_token" },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.branding.primaryColor).toBe("#2563EB");
      expect(data.data.letterhead.headerText).toBe("Nexus Official Quotation & MOU");
      expect(data.data.letterhead.defaultSignatoryName).toBe("Alice Director");
    });
  });

  describe("PATCH /api/v1/organization/branding", () => {
    it("rejects invalid hex colors with 400", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdminUser,
        organization: mockOrg,
        session: { id: "s_2" } as any,
      });

      const req = new Request("http://localhost:3000/api/v1/organization/branding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ primaryColor: "blue" }), // invalid hex
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("updates centralized letterhead configuration shared by quotations and MOUs", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdminUser,
        organization: mockOrg,
        session: { id: "s_2" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.organization.update).mockResolvedValue({
        ...mockOrg,
        primaryColor: "#4F46E5",
        letterheadHeaderText: "Unified Header For Quotes & MOUs",
        letterheadLogoPosition: "center",
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/branding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          primaryColor: "#4F46E5",
          letterheadHeaderText: "Unified Header For Quotes & MOUs",
          letterheadLogoPosition: "center",
          defaultSignatoryName: "Alice Director",
          defaultSignatoryTitle: "Managing Director",
        }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.branding.primaryColor).toBe("#4F46E5");
      expect(data.data.letterhead.headerText).toBe("Unified Header For Quotes & MOUs");
      expect(data.data.letterhead.logoPosition).toBe("center");
      expect(prisma.platformAuditLog.create).toHaveBeenCalled();
    });
  });

  describe("File Storage Security & Traversal Defense", () => {
    it("blocks directory traversal attacks when reading tenant assets", async () => {
      const traversalAttempts = [
        "../../etc/passwd",
        "..\\..\\windows\\win.ini",
        "%2e%2e%2fsecret.txt",
        "nested/../../../boot.ini",
      ];

      for (const attempt of traversalAttempts) {
        const asset = await readTenantAsset("org_222", attempt);
        expect(asset).toBeNull();
      }
    });

    it("rejects file uploads exceeding size limits or with forbidden MIME types", async () => {
      // 10MB dummy buffer
      const oversizedBuffer = Buffer.alloc(10 * 1024 * 1024);
      const oversizedFile = new File([oversizedBuffer], "big.png", { type: "image/png" });

      await expect(
        saveTenantAsset("org_222", oversizedFile, "logo")
      ).rejects.toThrow("exceeds maximum allowed size of 5MB");

      // Disallowed executable MIME type
      const exeBuffer = Buffer.from("MZ");
      const exeFile = new File([exeBuffer], "payload.exe", { type: "application/x-msdownload" });

      await expect(
        saveTenantAsset("org_222", exeFile, "logo")
      ).rejects.toThrow("Unsupported file type");
    });
  });
});
