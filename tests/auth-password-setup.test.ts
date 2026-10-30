/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as setPasswordHandler } from "@/app/api/v1/auth/set-password/route";
import { GET as inviteVerifyHandler } from "@/app/api/v1/organization/team/invite/verify/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
    },
    teamInvitation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Password Setup & Invitation Verification Tests", () => {
  const origin = "http://localhost:3000";
  const dummySessionToken = "test-session-token-xyz";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/set-password", () => {
    it("rejects request from untrusted origin with 403", async () => {
      const req = new Request("http://localhost:3000/api/v1/auth/set-password", {
        method: "POST",
        headers: {
          Origin: "https://malicious-site.com",
        },
        body: JSON.stringify({
          newPassword: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        }),
      });

      const res = await setPasswordHandler(req);
      expect(res.status).toBe(403);
    });

    it("rejects unauthenticated request with 401", async () => {
      const req = new Request("http://localhost:3000/api/v1/auth/set-password", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        }),
      });

      const res = await setPasswordHandler(req);
      expect(res.status).toBe(401);
    });

    it("rejects password shorter than 8 characters with 400", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValueOnce({
        id: "sess-1",
        sessionToken: dummySessionToken,
        userId: "user-1",
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "EDITOR",
          organizationId: "org-1",
          status: "ACTIVE",
          passwordHash: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-1",
            name: "Org",
            slug: "org",
            status: "ACTIVE",
          },
        },
      } as any);

      const req = new Request("http://localhost:3000/api/v1/auth/set-password", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: `vx_session=${dummySessionToken}`,
        },
        body: JSON.stringify({
          newPassword: "short",
          confirmPassword: "short",
        }),
      });

      const res = await setPasswordHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects mismatched confirm password with 400", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValueOnce({
        id: "sess-1",
        sessionToken: dummySessionToken,
        userId: "user-1",
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "EDITOR",
          organizationId: "org-1",
          status: "ACTIVE",
          passwordHash: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-1",
            name: "Org",
            slug: "org",
            status: "ACTIVE",
          },
        },
      } as any);

      const req = new Request("http://localhost:3000/api/v1/auth/set-password", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: `vx_session=${dummySessionToken}`,
        },
        body: JSON.stringify({
          newPassword: "ValidPassword123!",
          confirmPassword: "DifferentPassword123!",
        }),
      });

      const res = await setPasswordHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("allows Google OAuth user (passwordHash: null) to set initial password without currentPassword", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValueOnce({
        id: "sess-1",
        sessionToken: dummySessionToken,
        userId: "user-google",
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: "user-google",
          email: "googleuser@example.com",
          name: "Google User",
          role: "EDITOR",
          organizationId: "org-1",
          status: "ACTIVE",
          passwordHash: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-1",
            name: "Org",
            slug: "org",
            status: "ACTIVE",
          },
        },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-google",
        email: "googleuser@example.com",
        passwordHash: null,
        organizationId: "org-1",
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({
        id: "user-google",
        email: "googleuser@example.com",
      } as any);

      const req = new Request("http://localhost:3000/api/v1/auth/set-password", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: `vx_session=${dummySessionToken}`,
        },
        body: JSON.stringify({
          newPassword: "BrandNewPassword123!",
          confirmPassword: "BrandNewPassword123!",
        }),
      });

      const res = await setPasswordHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("password has been set successfully");

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-google" },
          data: expect.objectContaining({
            passwordHash: expect.any(String),
          }),
        })
      );
    });

    it("rejects request if user with existing password provides incorrect current password", async () => {
      const existingHash = await bcrypt.hash("ExistingPassword123!", 10);

      vi.mocked(prisma.session.findUnique).mockResolvedValueOnce({
        id: "sess-1",
        sessionToken: dummySessionToken,
        userId: "user-pwd",
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: "user-pwd",
          email: "pwduser@example.com",
          name: "Password User",
          role: "ADMIN",
          organizationId: "org-1",
          status: "ACTIVE",
          passwordHash: existingHash,
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-1",
            name: "Org",
            slug: "org",
            status: "ACTIVE",
          },
        },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-pwd",
        email: "pwduser@example.com",
        passwordHash: existingHash,
        organizationId: "org-1",
      } as any);

      const req = new Request("http://localhost:3000/api/v1/auth/set-password", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: `vx_session=${dummySessionToken}`,
        },
        body: JSON.stringify({
          currentPassword: "WrongPassword999!",
          newPassword: "NewValidPassword123!",
          confirmPassword: "NewValidPassword123!",
        }),
      });

      const res = await setPasswordHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.message).toContain("Current password is incorrect");
    });

    it("successfully updates password when user provides correct current password", async () => {
      const existingHash = await bcrypt.hash("CorrectCurrentPassword123!", 10);

      vi.mocked(prisma.session.findUnique).mockResolvedValueOnce({
        id: "sess-1",
        sessionToken: dummySessionToken,
        userId: "user-pwd",
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: "user-pwd",
          email: "pwduser@example.com",
          name: "Password User",
          role: "ADMIN",
          organizationId: "org-1",
          status: "ACTIVE",
          passwordHash: existingHash,
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-1",
            name: "Org",
            slug: "org",
            status: "ACTIVE",
          },
        },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-pwd",
        email: "pwduser@example.com",
        passwordHash: existingHash,
        organizationId: "org-1",
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({
        id: "user-pwd",
        email: "pwduser@example.com",
      } as any);

      const req = new Request("http://localhost:3000/api/v1/auth/set-password", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: `vx_session=${dummySessionToken}`,
        },
        body: JSON.stringify({
          currentPassword: "CorrectCurrentPassword123!",
          newPassword: "BrandNewPassword456!",
          confirmPassword: "BrandNewPassword456!",
        }),
      });

      const res = await setPasswordHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("password has been updated successfully");
    });
  });

  describe("GET /api/v1/organization/team/invite/verify", () => {
    it("returns 400 if token parameter is missing", async () => {
      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/verify");
      const res = await inviteVerifyHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.message).toContain("Invitation token is required");
    });

    it("returns 404 if invitation is not found", async () => {
      vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValueOnce(null);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/verify?token=nonexistent");
      const res = await inviteVerifyHandler(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe("INVALID_TOKEN");
    });

    it("returns 400 if invitation is already accepted", async () => {
      vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValueOnce({
        id: "inv-1",
        inviteToken: "token-accepted",
        email: "accepted@example.com",
        status: "accepted",
        expiresAt: new Date(Date.now() + 86400000),
        organization: { status: "ACTIVE" },
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/verify?token=token-accepted");
      const res = await inviteVerifyHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe("ALREADY_ACCEPTED");
    });

    it("returns 400 if invitation is revoked", async () => {
      vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValueOnce({
        id: "inv-1",
        inviteToken: "token-revoked",
        email: "revoked@example.com",
        status: "revoked",
        expiresAt: new Date(Date.now() + 86400000),
        organization: { status: "ACTIVE" },
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/verify?token=token-revoked");
      const res = await inviteVerifyHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe("REVOKED_TOKEN");
    });

    it("returns 400 if invitation is expired", async () => {
      vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValueOnce({
        id: "inv-1",
        inviteToken: "token-expired",
        email: "expired@example.com",
        status: "pending",
        expiresAt: new Date(Date.now() - 86400000), // yesterday
        organization: { status: "ACTIVE" },
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/verify?token=token-expired");
      const res = await inviteVerifyHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe("EXPIRED_TOKEN");
    });

    it("returns 200 with organization details and user password status for valid pending token", async () => {
      vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValueOnce({
        id: "inv-1",
        inviteToken: "token-valid",
        email: "invited@example.com",
        role: "EDITOR",
        status: "pending",
        expiresAt: new Date(Date.now() + 86400000),
        organization: {
          id: "org-1",
          name: "Acme Corp",
          displayName: "Acme Corporation",
          status: "ACTIVE",
        },
        invitedBy: {
          name: "Admin User",
          email: "admin@acme.com",
        },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-1",
        name: "Invited User",
        email: "invited@example.com",
        passwordHash: null, // Google user without password yet
      } as any);

      const req = new Request("http://localhost:3000/api/v1/organization/team/invite/verify?token=token-valid");
      const res = await inviteVerifyHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.email).toBe("invited@example.com");
      expect(data.data.role).toBe("EDITOR");
      expect(data.data.organizationName).toBe("Acme Corporation");
      expect(data.data.inviterName).toBe("Admin User");
      expect(data.data.hasExistingAccount).toBe(true);
      expect(data.data.hasPassword).toBe(false);
    });
  });
});
