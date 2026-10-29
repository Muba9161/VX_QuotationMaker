import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  authenticateRequest,
  requireTenantContext,
  requirePermission,
  requirePlatformAdmin,
  AuthError,
} from "@/lib/auth/guards";
import * as sessionModule from "@/lib/auth/session";
import type { User, Organization, Session } from "@prisma/client";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session"
  );
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

describe("Server-Side Authentication & Tenant Isolation Guards", () => {
  const mockUser: User = {
    id: "usr_1",
    organizationId: "org_1",
    name: "John Doe",
    email: "john@acme.com",
    passwordHash: "hash",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    avatarUrl: null,
    phone: null,
    title: null,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrg: Organization = {
    id: "org_1",
    planId: null,
    name: "Acme Corp",
    displayName: "Acme",
    slug: "acme",
    domain: null,
    tagline: null,
    email: "info@acme.com",
    phone: null,
    website: null,
    address: null,
    taxId: null,
    cin: null,
    logoUrl: null,
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    accentColor: "#333333",
    letterheadUrl: null,
    letterheadHeaderText: null,
    letterheadFooterText: null,
    letterheadLogoPosition: "left",
    defaultSignatoryName: null,
    defaultSignatoryTitle: null,
    allowMemberRegistration: true,
    requireAdminApproval: false,
    defaultExpiryDays: 30,
    status: "ACTIVE",
    currentUsersCount: 1,
    currentDocumentsCount: 0,
    currentStorageBytes: BigInt(0),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession: Session = {
    id: "sess_1",
    userId: "usr_1",
    sessionToken: "sha256hash",
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
    expiresAt: new Date(Date.now() + 3600 * 1000),
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authenticateRequest", () => {
    it("throws 401 AuthError when no session cookie or header is present", async () => {
      const req = new Request("https://example.com/api/test");
      await expect(authenticateRequest(req)).rejects.toThrow(AuthError);
      await expect(authenticateRequest(req)).rejects.toMatchObject({
        status: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("throws 401 when token fails validation or is expired", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue(null);
      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=invalid_token" },
      });
      await expect(authenticateRequest(req)).rejects.toThrow(AuthError);
    });

    it("returns session context when valid cookie is presented", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: mockUser,
        organization: mockOrg,
      });

      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=valid_token" },
      });

      const context = await authenticateRequest(req);
      expect(context.user.id).toBe("usr_1");
      expect(context.organization?.id).toBe("org_1");
    });
  });

  describe("requireTenantContext (Multi-Tenant Isolation)", () => {
    it("pins tenantId strictly to the user's organizationId", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: mockUser,
        organization: mockOrg,
      });

      // User belongs to org_1, but attempts to request org_999 via headers
      const req = new Request("https://example.com/api/test", {
        headers: {
          cookie: "vx_session=valid_token",
          "x-tenant-id": "org_999_attacker",
        },
      });

      const tenantContext = await requireTenantContext(req);
      // The tenant context MUST be pinned to org_1, completely ignoring malicious header
      expect(tenantContext.tenantId).toBe("org_1");
      expect(tenantContext.organization.id).toBe("org_1");
    });

    it("rejects user whose organization is suspended or inactive", async () => {
      const suspendedOrg: Organization = { ...mockOrg, status: "SUSPENDED" };
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: mockUser,
        organization: suspendedOrg,
      });

      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=valid_token" },
      });

      await expect(requireTenantContext(req)).rejects.toMatchObject({
        status: 403,
        code: "ORGANIZATION_INACTIVE",
      });
    });

    it("rejects user without organization association", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: { ...mockUser, organizationId: null, role: "VIEWER" },
        organization: null,
      });

      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=valid_token" },
      });

      await expect(requireTenantContext(req)).rejects.toMatchObject({
        status: 403,
        code: "TENANT_REQUIRED",
      });
    });
  });

  describe("requirePermission", () => {
    it("allows user with granted permission", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: mockUser, // ORG_ADMIN
        organization: mockOrg,
      });

      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=valid_token" },
      });

      const context = await requirePermission(req, "org:manage_team");
      expect(context.user.id).toBe("usr_1");
    });

    it("throws 403 when user lacks permission", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: { ...mockUser, role: "VIEWER" },
        organization: mockOrg,
      });

      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=valid_token" },
      });

      await expect(requirePermission(req, "doc:delete")).rejects.toMatchObject({
        status: 403,
        code: "FORBIDDEN",
      });
    });
  });

  describe("requirePlatformAdmin", () => {
    it("allows SUPER_ADMIN and SUPPORT_ADMIN", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: { ...mockUser, role: "SUPER_ADMIN" },
        organization: null,
      });

      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=valid_token" },
      });

      const context = await requirePlatformAdmin(req);
      expect(context.user.role).toBe("SUPER_ADMIN");
    });

    it("rejects ORG_ADMIN from accessing platform governance controls", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        session: mockSession,
        user: mockUser, // ORG_ADMIN
        organization: mockOrg,
      });

      const req = new Request("https://example.com/api/test", {
        headers: { cookie: "vx_session=valid_token" },
      });

      await expect(requirePlatformAdmin(req)).rejects.toMatchObject({
        status: 403,
        code: "FORBIDDEN",
      });
    });
  });
});
