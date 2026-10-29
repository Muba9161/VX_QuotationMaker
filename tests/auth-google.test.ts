import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as googleInitHandler } from "@/app/api/v1/auth/google/route";
import { GET as googleCallbackHandler } from "@/app/api/v1/auth/google/callback/route";
import {
  generateOAuthState,
  buildGoogleAuthUrl,
  decodeIdTokenPayload,
  verifyIdTokenClaims,
  getOAuthStateFromRequest,
  verifyGoogleIdToken,
  OAUTH_STATE_COOKIE_NAME,
} from "@/lib/auth/google";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import * as googleAuthModule from "@/lib/auth/google";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
    },
    teamInvitation: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    organization: {
      update: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Google OAuth 2.0 Authentication", () => {
  const originalEnv = process.env;
  const mockClientId = "mock-google-client-id.apps.googleusercontent.com";
  const mockClientSecret = "mock-google-client-secret";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/vx_test?schema=public",
      APP_URL: "http://localhost:3000",
      GOOGLE_CLIENT_ID: mockClientId,
      GOOGLE_CLIENT_SECRET: mockClientSecret,
      GOOGLE_CALLBACK_URL: "http://localhost:3000/api/v1/auth/google/callback",
    };
  });

  describe("Cryptographic ID Token & OAuth Helper Utilities", () => {
    it("generates a 64-character high-entropy hex state", () => {
      const state1 = generateOAuthState();
      const state2 = generateOAuthState();

      expect(state1).toHaveLength(64);
      expect(state2).toHaveLength(64);
      expect(state1).not.toBe(state2);
      expect(/^[0-9a-f]{64}$/.test(state1)).toBe(true);
    });

    it("constructs the correct Google authorization URL", () => {
      const state = "a".repeat(64);
      const url = buildGoogleAuthUrl({
        clientId: "my-client-id",
        redirectUri: "http://localhost:3000/callback",
        state,
      });

      const parsed = new URL(url);
      expect(parsed.origin).toBe("https://accounts.google.com");
      expect(parsed.pathname).toBe("/o/oauth2/v2/auth");
      expect(parsed.searchParams.get("client_id")).toBe("my-client-id");
      expect(parsed.searchParams.get("redirect_uri")).toBe("http://localhost:3000/callback");
      expect(parsed.searchParams.get("response_type")).toBe("code");
      expect(parsed.searchParams.get("scope")).toBe("openid email profile");
      expect(parsed.searchParams.get("state")).toBe(state);
      expect(parsed.searchParams.get("prompt")).toBe("select_account");
    });

    it("cryptographically verifies a valid Google ID token using OAuth2Client", async () => {
      const mockPayload = {
        iss: "https://accounts.google.com",
        aud: mockClientId,
        sub: "google-sub-98765",
        email: "verified.user@example.com",
        email_verified: true,
        name: "Verified User",
        picture: "https://example.com/avatar.jpg",
      };

      vi.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValueOnce({
        getPayload: () => mockPayload,
      } as unknown as never);

      const result = await verifyGoogleIdToken({
        idToken: "valid.id.token",
        clientId: mockClientId,
      });

      expect(result.sub).toBe("google-sub-98765");
      expect(result.email).toBe("verified.user@example.com");
      expect(result.emailVerified).toBe(true);
      expect(result.name).toBe("Verified User");
    });

    it("rejects token when signature verification fails", async () => {
      vi.spyOn(OAuth2Client.prototype, "verifyIdToken").mockRejectedValueOnce(
        new Error("Invalid token signature")
      );

      await expect(
        verifyGoogleIdToken({
          idToken: "tampered.id.token",
          clientId: mockClientId,
        })
      ).rejects.toThrow("Invalid token signature");
    });

    it("rejects token with audience mismatch", async () => {
      vi.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValueOnce({
        getPayload: () => ({
          iss: "https://accounts.google.com",
          aud: "wrong-client-id.apps.googleusercontent.com",
          sub: "google-sub-123",
          email: "user@example.com",
          email_verified: true,
        }),
      } as unknown as never);

      await expect(
        verifyGoogleIdToken({
          idToken: "id.token.wrong.aud",
          clientId: mockClientId,
        })
      ).rejects.toThrow("ID token audience mismatch");
    });

    it("rejects token with untrusted issuer", async () => {
      vi.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValueOnce({
        getPayload: () => ({
          iss: "https://evil-attacker.com",
          aud: mockClientId,
          sub: "google-sub-123",
          email: "user@example.com",
          email_verified: true,
        }),
      } as unknown as never);

      await expect(
        verifyGoogleIdToken({
          idToken: "id.token.evil.iss",
          clientId: mockClientId,
        })
      ).rejects.toThrow("Invalid ID token issuer");
    });

    it("rejects token with missing subject identifier (sub)", async () => {
      vi.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValueOnce({
        getPayload: () => ({
          iss: "https://accounts.google.com",
          aud: mockClientId,
          sub: "",
          email: "user@example.com",
          email_verified: true,
        }),
      } as unknown as never);

      await expect(
        verifyGoogleIdToken({
          idToken: "id.token.no.sub",
          clientId: mockClientId,
        })
      ).rejects.toThrow("Missing subject identifier (sub)");
    });

    it("decodes valid ID token payload for debug claims inspection", () => {
      const payload = {
        sub: "12345",
        email: "test@example.com",
        email_verified: true,
        aud: "my-client-id",
        iss: "accounts.google.com",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const dummyToken = `header.${base64UrlPayload}.sig`;

      const decoded = decodeIdTokenPayload(dummyToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe("12345");
      expect(decoded?.email).toBe("test@example.com");
    });

    it("verifies ID token claims correctly", () => {
      const validPayload = {
        aud: "my-client-id",
        iss: "https://accounts.google.com",
        exp: Math.floor(Date.now() / 1000) + 1000,
      };

      expect(verifyIdTokenClaims(validPayload, "my-client-id").valid).toBe(true);

      // Mismatched aud
      expect(verifyIdTokenClaims(validPayload, "different-client").valid).toBe(false);

      // Invalid issuer
      expect(
        verifyIdTokenClaims(
          { ...validPayload, iss: "https://evil.com" },
          "my-client-id"
        ).valid
      ).toBe(false);

      // Expired token
      expect(
        verifyIdTokenClaims(
          { ...validPayload, exp: Math.floor(Date.now() / 1000) - 120 },
          "my-client-id"
        ).valid
      ).toBe(false);
    });

    it("extracts OAuth state from Cookie header", () => {
      const state = "abcdef123456";
      const req = new Request("http://localhost:3000", {
        headers: {
          cookie: `foo=bar; ${OAUTH_STATE_COOKIE_NAME}=${state}; baz=qux`,
        },
      });

      expect(getOAuthStateFromRequest(req)).toBe(state);
    });
  });

  describe("GET /api/v1/auth/google (Initiation Route)", () => {
    it("redirects to /login?error=google_auth_not_configured if client ID is missing", async () => {
      delete process.env.GOOGLE_CLIENT_ID;

      const req = new Request("http://localhost:3000/api/v1/auth/google");
      const res = await googleInitHandler(req);

      expect(res.status).toBe(307); // NextResponse.redirect
      const location = res.headers.get("location");
      expect(location).toContain("/login?error=google_auth_not_configured");
    });

    it("redirects to Google consent screen and sets anti-CSRF state cookie", async () => {
      const req = new Request("http://localhost:3000/api/v1/auth/google");
      const res = await googleInitHandler(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("https://accounts.google.com/o/oauth2/v2/auth");
      expect(location).toContain(`client_id=${mockClientId}`);

      // Verify state cookie is attached
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain(`${OAUTH_STATE_COOKIE_NAME}=`);
      expect(setCookie?.toLowerCase()).toContain("httponly");
      expect(setCookie?.toLowerCase()).toContain("samesite=lax");
    });
  });

  describe("GET /api/v1/auth/google/callback (Callback Route)", () => {
    const validState = "f".repeat(64);

    it("redirects to login with error if Google returns an access error", async () => {
      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?error=access_denied`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=access_denied");
    });

    it("rejects request if state query param does not match cookie", async () => {
      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=mismatched_state`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=invalid_state");
    });

    it("rejects request if code query param is missing", async () => {
      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=missing_code");
    });

    it("rejects request if token exchange fails", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockRejectedValueOnce(
        new Error("Token exchange failed")
      );

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=token_exchange_failed");
    });

    it("rejects request if ID token is missing from token exchange", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        expires_in: 3600,
        token_type: "Bearer",
        // id_token missing
      });

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=missing_id_token");
    });

    it("rejects request if ID token cryptographic verification fails", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "invalid.forged.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockRejectedValueOnce(
        new Error("Invalid cryptographic signature")
      );

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=invalid_id_token");
    });

    it("rejects request if user's Google email is not verified by Google", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "valid.id.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockResolvedValueOnce({
        sub: "google-123",
        email: "unverified@example.com",
        emailVerified: false,
      });

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=email_not_verified");
    });

    it("successfully logs in existing active user and redirects to /dashboard", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "valid.id.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockResolvedValueOnce({
        sub: "google-sub-priya",
        email: "priya@acme.com",
        emailVerified: true,
        name: "Priya Singh",
        picture: "https://example.com/priya.jpg",
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-uuid-1",
        name: "Priya Singh",
        email: "priya@acme.com",
        passwordHash: "somehash",
        role: "EDITOR",
        status: "ACTIVE",
        avatarUrl: null,
        phone: null,
        title: "Editor",
        emailVerified: false,
        lastLoginAt: null,
        organizationId: "org-uuid-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: {
          id: "org-uuid-1",
          name: "Acme Corp",
          slug: "acme-corp",
          status: "ACTIVE",
        } as unknown as never,
      } as unknown as never);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({} as unknown as never);
      vi.mocked(prisma.session.create).mockResolvedValueOnce({
        id: "session-uuid-1",
        userId: "user-uuid-1",
        sessionToken: "hashed-session-token",
        ipAddress: null,
        userAgent: null,
        expiresAt: new Date(Date.now() + 28800000),
        createdAt: new Date(),
      });

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");

      // Verify vx_session cookie is attached
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("vx_session=");
      expect(setCookie).toContain("HttpOnly");

      // Verify state cookie was cleared
      expect(setCookie).toContain(`${OAUTH_STATE_COOKIE_NAME}=;`);
    });

    it("redirects SUPER_ADMIN user to /admin/dashboard and preserves role", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "valid.id.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockResolvedValueOnce({
        sub: "google-superadmin-sub",
        email: "admin@vorldx.com",
        emailVerified: true,
        name: "Super Admin",
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "admin-uuid",
        name: "Super Admin",
        email: "admin@vorldx.com",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        organizationId: null,
        organization: null,
      } as unknown as never);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({} as unknown as never);
      vi.mocked(prisma.session.create).mockResolvedValueOnce({
        id: "admin-session-uuid",
        userId: "admin-uuid",
        sessionToken: "hashed-token",
        expiresAt: new Date(Date.now() + 28800000),
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null,
      });

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/admin/dashboard");
    });

    it("rejects inactive user with account_inactive", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "valid.id.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockResolvedValueOnce({
        sub: "google-inactive-user",
        email: "suspended@acme.com",
        emailVerified: true,
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "suspended-user-id",
        email: "suspended@acme.com",
        status: "SUSPENDED",
        role: "EDITOR",
      } as unknown as never);

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=account_inactive");
    });

    it("rejects user belonging to inactive organization", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "valid.id.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockResolvedValueOnce({
        sub: "google-user-sub",
        email: "user@inactiveorg.com",
        emailVerified: true,
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-id",
        email: "user@inactiveorg.com",
        status: "ACTIVE",
        role: "EDITOR",
        organization: {
          id: "inactive-org-id",
          status: "SUSPENDED",
        },
      } as unknown as never);

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=organization_inactive");
    });

    it("rejects unknown user without invite with account_not_found (never auto-creates orgs or admins)", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "valid.id.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockResolvedValueOnce({
        sub: "google-stranger",
        email: "stranger@unknown.com",
        emailVerified: true,
        name: "Stranger Danger",
      });

      // User does not exist in DB
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      // No active invitation found
      vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValueOnce(null);

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login?error=account_not_found");
    });

    it("claims pending team invitation for a new user and joins their organization", async () => {
      vi.spyOn(googleAuthModule, "exchangeGoogleCode").mockResolvedValueOnce({
        access_token: "mock-access-token",
        id_token: "valid.id.token",
        expires_in: 3600,
        token_type: "Bearer",
      });

      vi.spyOn(googleAuthModule, "verifyGoogleIdToken").mockResolvedValueOnce({
        sub: "google-new-member-sub",
        email: "invited.member@acme.com",
        emailVerified: true,
        name: "Invited Member",
        picture: "https://example.com/pic.jpg",
      });

      // User not in DB
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      // Pending invitation exists
      vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValueOnce({
        id: "invite-uuid-1",
        email: "invited.member@acme.com",
        organizationId: "org-uuid-1",
        role: "EDITOR",
        status: "pending",
        expiresAt: new Date(Date.now() + 86400000),
        organization: {
          id: "org-uuid-1",
          name: "Acme Corp",
          status: "ACTIVE",
        } as unknown as never,
      } as unknown as never);

      const createdUser = {
        id: "new-user-uuid",
        name: "Invited Member",
        email: "invited.member@acme.com",
        role: "EDITOR",
        organizationId: "org-uuid-1",
        status: "ACTIVE",
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const txMock = {
          user: { create: vi.fn().mockResolvedValue(createdUser) },
          teamInvitation: { update: vi.fn().mockResolvedValue({}) },
          organization: { update: vi.fn().mockResolvedValue({}) },
        };
        // @ts-expect-error Mocking tx interface
        return callback(txMock);
      });

      vi.mocked(prisma.session.create).mockResolvedValueOnce({
        id: "new-session-uuid",
        userId: "new-user-uuid",
        sessionToken: "hashed-token",
        expiresAt: new Date(Date.now() + 28800000),
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null,
      });

      const req = new Request(
        `http://localhost:3000/api/v1/auth/google/callback?code=mock-code&state=${validState}`,
        {
          headers: {
            cookie: `${OAUTH_STATE_COOKIE_NAME}=${validState}`,
          },
        }
      );

      const res = await googleCallbackHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("vx_session=");
    });
  });
});
