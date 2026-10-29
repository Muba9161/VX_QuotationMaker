import { describe, it, expect } from "vitest";
import {
  getRolePermissions,
  hasPermission,
  isPlatformAdmin,
  isOrgAdmin,
  toSafeUser,
  toSafeOrganization,
} from "@/lib/auth/permissions";
import type { User, Organization } from "@prisma/client";

describe("Role-Based Permissions & Data Sanitization", () => {
  describe("Role Permissions & Checks", () => {
    it("provides SUPER_ADMIN with platform and org management permissions", () => {
      const perms = getRolePermissions("SUPER_ADMIN");
      expect(perms).toContain("platform:manage_orgs");
      expect(perms).toContain("platform:manage_settings");
      expect(perms).toContain("org:manage_branding");
      expect(perms).toContain("doc:create");
      expect(isPlatformAdmin("SUPER_ADMIN")).toBe(true);
      expect(isOrgAdmin("SUPER_ADMIN")).toBe(false);
    });

    it("provides SUPPORT_ADMIN with support & monitoring permissions", () => {
      const perms = getRolePermissions("SUPPORT_ADMIN");
      expect(perms).toContain("platform:support_tickets");
      expect(perms).toContain("platform:view_audit_logs");
      expect(perms).not.toContain("org:manage_branding");
      expect(isPlatformAdmin("SUPPORT_ADMIN")).toBe(true);
    });

    it("provides ORG_ADMIN with full organization permissions but no platform permissions", () => {
      const perms = getRolePermissions("ORG_ADMIN");
      expect(perms).toContain("org:manage_branding");
      expect(perms).toContain("org:manage_team");
      expect(perms).toContain("doc:create");
      expect(perms).toContain("doc:delete");
      expect(perms).not.toContain("platform:manage_settings");
      expect(isPlatformAdmin("ORG_ADMIN")).toBe(false);
      expect(isOrgAdmin("ORG_ADMIN")).toBe(true);
    });

    it("provides EDITOR with document creation and editing only", () => {
      expect(hasPermission("EDITOR", "doc:create")).toBe(true);
      expect(hasPermission("EDITOR", "doc:edit")).toBe(true);
      expect(hasPermission("EDITOR", "doc:delete")).toBe(false);
      expect(hasPermission("EDITOR", "org:manage_team")).toBe(false);
    });

    it("provides VIEWER with view-only permissions", () => {
      expect(hasPermission("VIEWER", "doc:view")).toBe(true);
      expect(hasPermission("VIEWER", "doc:create")).toBe(false);
      expect(hasPermission("VIEWER", "doc:edit")).toBe(false);
    });

    it("provides RECIPIENT with signature and change request actions", () => {
      expect(hasPermission("RECIPIENT", "recipient:sign")).toBe(true);
      expect(hasPermission("RECIPIENT", "recipient:change_request")).toBe(true);
      expect(hasPermission("RECIPIENT", "doc:create")).toBe(false);
    });
  });

  describe("toSafeUser and toSafeOrganization", () => {
    it("strips passwordHash and returns public user profile", () => {
      const mockUser: User = {
        id: "usr_123",
        organizationId: "org_456",
        name: "Test Admin",
        email: "admin@vorldx.com",
        passwordHash: "$2a$12$invaliddummypasswordhash",
        role: "ORG_ADMIN",
        status: "ACTIVE",
        avatarUrl: "https://example.com/avatar.png",
        phone: "+91 9876543210",
        title: "CTO",
        emailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const safe = toSafeUser(mockUser);
      expect((safe as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
      expect(safe.id).toBe("usr_123");
      expect(safe.email).toBe("admin@vorldx.com");
      expect(safe.role).toBe("ORG_ADMIN");
      expect(safe.title).toBe("CTO");
    });

    it("sanitizes organization model", () => {
      const mockOrg: Organization = {
        id: "org_456",
        planId: null,
        name: "Acme Corp",
        displayName: "Acme Corporation",
        slug: "acme-corp",
        domain: "acme.com",
        tagline: null,
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#2563EB",
        secondaryColor: "#10B981",
        accentColor: "#06B6D4",
        email: "contact@acme.com",
        phone: "+91 1234567890",
        website: null,
        address: "123 Business St",
        taxId: "GSTIN12345",
        cin: null,
        letterheadUrl: null,
        letterheadHeaderText: null,
        letterheadFooterText: null,
        letterheadLogoPosition: "left",
        defaultSignatoryName: null,
        defaultSignatoryTitle: null,
        status: "ACTIVE",
        defaultExpiryDays: 30,
        allowMemberRegistration: true,
        requireAdminApproval: true,
        currentUsersCount: 1,
        currentDocumentsCount: 0,
        currentStorageBytes: BigInt(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const safe = toSafeOrganization(mockOrg);
      expect(safe.id).toBe("org_456");
      expect(safe.slug).toBe("acme-corp");
      expect(safe.primaryColor).toBe("#2563EB");
    });
  });
});
