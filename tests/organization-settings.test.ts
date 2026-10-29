/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/v1/organization/settings/route";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { User, Organization, OrganizationSettings } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

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
    organizationSettings: {
      upsert: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe("Organization Settings API Handlers", () => {
  const mockOrg: Organization = {
    id: "org_111",
    planId: null,
    name: "Acme Corp",
    displayName: "Acme Technologies",
    slug: "acme-corp",
    domain: "acme.com",
    tagline: "Building the future",
    email: "contact@acme.com",
    phone: "+91 9876543210",
    website: "https://acme.com",
    address: "123 Tech Park, Bangalore",
    taxId: "GSTIN12345",
    cin: "U72200KA2026PTC123456",
    logoUrl: "/uploads/org_111/logo.png",
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    accentColor: "#06B6D4",
    letterheadUrl: null,
    letterheadHeaderText: "Acme Corp Header",
    letterheadFooterText: "Acme Corp Footer",
    letterheadLogoPosition: "left",
    defaultSignatoryName: "Jane Smith",
    defaultSignatoryTitle: "CEO",
    allowMemberRegistration: true,
    requireAdminApproval: true,
    defaultExpiryDays: 30,
    status: "ACTIVE",
    currentUsersCount: 2,
    currentDocumentsCount: 5,
    currentStorageBytes: BigInt(1024),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSettings: OrganizationSettings = {
    id: "set_111",
    organizationId: "org_111",
    defaultTaxRate: new Decimal("18.00"),
    defaultCurrency: "INR",
    defaultCurrencySymbol: "₹",
    defaultPaymentTerms: "50% advance",
    standardNotes: "Standard quotation notes",
    standardTermsConditions: "Standard T&C",
    enableWatermark: false,
    autoRemindersEnabled: true,
    reminderDaysBeforeExpiry: 3,
    notifyDocViewed: true,
    notifyDocSigned: true,
    notifyDocExpired: true,
    notifyMemberJoined: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser: User = {
    id: "usr_admin",
    organizationId: "org_111",
    name: "Admin User",
    email: "admin@acme.com",
    passwordHash: "hash",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    avatarUrl: null,
    phone: null,
    title: "Administrator",
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEditorUser: User = {
    id: "usr_editor",
    organizationId: "org_111",
    name: "Editor User",
    email: "editor@acme.com",
    passwordHash: "hash",
    role: "EDITOR",
    status: "ACTIVE",
    avatarUrl: null,
    phone: null,
    title: "Editor",
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/organization/settings", () => {
    it("rejects unauthenticated requests with 401", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/organization/settings");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("returns organization settings for authorized tenant user", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdminUser,
        organization: mockOrg,
        session: { id: "s_1" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ...mockOrg,
        settings: mockSettings,
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/settings", {
        headers: { Cookie: "vx_session=valid_token" },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organization.name).toBe("Acme Corp");
      expect(data.data.settings.defaultTaxRate).toBe(18);
      expect(data.data.settings.defaultCurrency).toBe("INR");
    });
  });

  describe("PATCH /api/v1/organization/settings", () => {
    it("rejects requests missing Origin/Referer header with 403", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdminUser,
        organization: mockOrg,
        session: { id: "s_1" } as any,
      });

      const req = new Request("http://localhost:3000/api/v1/organization/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ name: "Updated Acme" }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error.code).toBe("CSRF_ORIGIN_REJECTED");
    });

    it("rejects requests from users without org:manage_settings permission with 403", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockEditorUser,
        organization: mockOrg,
        session: { id: "s_1" } as any,
      });

      const req = new Request("http://localhost:3000/api/v1/organization/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ name: "Updated Acme" }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("rejects invalid input schema (e.g. tax rate > 100) with 400", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdminUser,
        organization: mockOrg,
        session: { id: "s_1" } as any,
      });

      const req = new Request("http://localhost:3000/api/v1/organization/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ defaultTaxRate: 150 }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("successfully updates organization profile and settings for ORG_ADMIN", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdminUser,
        organization: mockOrg,
        session: { id: "s_1" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ...mockOrg,
        settings: mockSettings,
      } as any);
      vi.mocked(prisma.organization.update).mockResolvedValue({
        ...mockOrg,
        name: "Acme Global",
      } as any);
      vi.mocked(prisma.organizationSettings.upsert).mockResolvedValue({
        ...mockSettings,
        defaultTaxRate: new Decimal("12.00"),
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          name: "Acme Global",
          defaultTaxRate: 12,
          defaultPaymentTerms: "100% advance",
        }),
      });
      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organization.name).toBe("Acme Global");
      expect(data.data.settings.defaultTaxRate).toBe(12);
      expect(prisma.platformAuditLog.create).toHaveBeenCalled();
    });
  });
});
