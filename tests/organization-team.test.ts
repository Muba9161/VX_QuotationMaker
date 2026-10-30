/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getTeam } from "@/app/api/v1/organization/team/route";
import { PATCH as updateMember, DELETE as removeMember } from "@/app/api/v1/organization/team/[userId]/route";
import { POST as inviteMember } from "@/app/api/v1/organization/team/invite/route";
import { DELETE as revokeInvite } from "@/app/api/v1/organization/team/invite/[inviteId]/route";
import { POST as resendInvite } from "@/app/api/v1/organization/team/invite/[inviteId]/resend/route";
import { POST as acceptInvite } from "@/app/api/v1/organization/team/invite/accept/route";
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

vi.mock("@/lib/email", () => ({
  sendInvitationEmail: vi.fn().mockResolvedValue({
    success: true,
    messageId: "mock_msg_123",
  }),
  verifySmtpConnection: vi.fn().mockResolvedValue({
    configured: true,
    verified: true,
  }),
  maskEmail: vi.fn((email: string) => email),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    teamInvitation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe("Organization Team Management Handlers", () => {
  const mockOrg: Organization = {
    id: "org_333",
    planId: null,
    name: "Apex Global",
    displayName: "Apex",
    slug: "apex-global",
    domain: null,
    tagline: null,
    email: "corp@apex.com",
    phone: null,
    website: null,
    address: null,
    taxId: null,
    cin: null,
    logoUrl: null,
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    accentColor: "#06B6D4",
    letterheadUrl: null,
    letterheadHeaderText: null,
    letterheadFooterText: null,
    letterheadLogoPosition: "left",
    defaultSignatoryName: null,
    defaultSignatoryTitle: null,
    allowMemberRegistration: true,
    requireAdminApproval: true,
    defaultExpiryDays: 30,
    status: "ACTIVE",
    currentUsersCount: 2,
    currentDocumentsCount: 0,
    currentStorageBytes: BigInt(0),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin: User = {
    id: "usr_admin_1",
    organizationId: "org_333",
    name: "Admin Boss",
    email: "admin@apex.com",
    passwordHash: "hash",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    avatarUrl: null,
    phone: null,
    title: "Owner",
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMember: User = {
    id: "usr_editor_1",
    organizationId: "org_333",
    name: "Staff Member",
    email: "staff@apex.com",
    passwordHash: "hash",
    role: "EDITOR",
    status: "ACTIVE",
    avatarUrl: null,
    phone: null,
    title: "Staff",
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/organization/team", () => {
    it("returns members and pending invitations for tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockAdmin, mockMember] as any);
      vi.mocked(prisma.teamInvitation.findMany).mockResolvedValue([] as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team", {
        headers: { Cookie: "vx_session=valid_token" },
      });
      const res = await getTeam(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.members).toHaveLength(2);
      expect(data.data.totalMembers).toBe(2);
    });
  });

  describe("PATCH /api/v1/organization/team/[userId]", () => {
    it("prevents admin from modifying their own administrative role", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockAdmin as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/usr_admin_1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ role: "EDITOR" }),
      });

      const res = await updateMember(req, {
        params: Promise.resolve({ userId: "usr_admin_1" }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.message).toContain("cannot modify your own administrative role");
    });

    it("enforces last admin protection when demoting the only admin", async () => {
      const secondAdmin: User = {
        ...mockAdmin,
        id: "usr_admin_2",
        email: "admin2@apex.com",
      };

      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(secondAdmin as any);
      // Only 1 admin in org
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      const req = new Request("http://localhost:3000/api/v1/organization/team/usr_admin_2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ role: "VIEWER" }),
      });

      const res = await updateMember(req, {
        params: Promise.resolve({ userId: "usr_admin_2" }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.message).toContain("last Organization Administrator");
    });
  });

  describe("DELETE /api/v1/organization/team/[userId]", () => {
    it("prevents self-deletion from organization", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/usr_admin_1", {
        method: "DELETE",
        headers: {
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
      });

      const res = await removeMember(req, {
        params: Promise.resolve({ userId: "usr_admin_1" }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.message).toContain("cannot remove your own account");
    });

    it("successfully removes and unlinks non-admin member", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockMember as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockMember, organizationId: null } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/usr_editor_1", {
        method: "DELETE",
        headers: {
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
      });

      const res = await removeMember(req, {
        params: Promise.resolve({ userId: "usr_editor_1" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "usr_editor_1" } });
    });
  });

  describe("POST /api/v1/organization/team/invite", () => {
    it("rejects duplicate invite for an active member with 409", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockMember as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ email: "staff@apex.com", role: "EDITOR" }),
      });

      const res = await inviteMember(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.code).toBe("CONFLICT");
    });

    it("successfully creates 7-day invitation with secure random token", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.teamInvitation.create).mockResolvedValue({
        id: "inv_123",
        email: "newperson@apex.com",
        role: "VIEWER",
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 86400000),
        createdAt: new Date(),
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ email: "newperson@apex.com", role: "VIEWER" }),
      });

      const res = await inviteMember(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.token).toHaveLength(64);
      expect(data.data.inviteUrl).toContain(data.data.token);
    });

    it("rejects duplicate pending invitation for the same email with 409", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValue({
        id: "inv_already_pending",
        organizationId: "org_333",
        email: "pending@apex.com",
        status: "pending",
        expiresAt: new Date(Date.now() + 5 * 86400000),
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ email: "pending@apex.com", role: "EDITOR" }),
      });

      const res = await inviteMember(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.code).toBe("CONFLICT");
      expect(data.error.message).toContain("pending invitation has already been issued");
    });

    it("rejects invalid email address with 400 validation error", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ email: "not-an-email", role: "EDITOR" }),
      });

      const res = await inviteMember(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /api/v1/organization/team/invite/[inviteId]", () => {
    it("successfully revokes pending invitation", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValue({
        id: "inv_to_revoke",
        organizationId: "org_333",
        email: "revoke_me@apex.com",
        status: "pending",
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/inv_to_revoke", {
        method: "DELETE",
        headers: {
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
      });

      const res = await revokeInvite(req, {
        params: Promise.resolve({ inviteId: "inv_to_revoke" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.message).toContain("revoked");
      expect(prisma.teamInvitation.update).toHaveBeenCalledWith({
        where: { id: "inv_to_revoke" },
        data: { status: "revoked" },
      });
    });
  });

  describe("POST /api/v1/organization/team/invite/[inviteId]/resend", () => {
    it("successfully resends pending invitation email and refreshes expiry", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockAdmin,
        organization: mockOrg,
        session: { id: "s_3" } as any,
      });
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValue({
        id: "inv_to_resend",
        organizationId: "org_333",
        email: "resend_me@apex.com",
        role: "EDITOR",
        inviteToken: "token_resend_123",
        status: "pending",
      } as any);
      vi.mocked(prisma.teamInvitation.update).mockResolvedValue({
        id: "inv_to_resend",
        email: "resend_me@apex.com",
        role: "EDITOR",
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 86400000),
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/inv_to_resend/resend", {
        method: "POST",
        headers: {
          Cookie: "vx_session=valid_token",
          Origin: "http://localhost:3000",
        },
      });

      const res = await resendInvite(req, {
        params: Promise.resolve({ inviteId: "inv_to_resend" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.message).toContain("Invitation resent");
      expect(data.data.inviteUrl).toContain("token_resend_123");
    });
  });

  describe("POST /api/v1/organization/team/invite/accept", () => {
    it("rejects expired token with 400", async () => {
      vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValue({
        id: "inv_expired",
        email: "guest@example.com",
        role: "EDITOR",
        inviteToken: "token_exp",
        status: "pending",
        expiresAt: new Date(Date.now() - 10000), // expired
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ token: "token_exp" }),
      });

      const res = await acceptInvite(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("EXPIRED_TOKEN");
    });
  });
});
