import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as loginHandler } from "@/app/api/v1/auth/login/route";
import { POST as logoutHandler } from "@/app/api/v1/auth/logout/route";
import { GET as meHandler } from "@/app/api/v1/auth/me/route";
import { POST as registerHandler } from "@/app/api/v1/auth/register/route";
import { prisma } from "@/lib/prisma";
import { _resetRateLimiter } from "@/lib/auth/rate-limiter";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    organization: {
      create: vi.fn(),
    },
    organizationSettings: {
      create: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Authentication API Endpoints", () => {
  const dummyPassword = "ValidPassword123!";
  const validOrigin = "http://localhost:3000";
  let passwordHash: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    _resetRateLimiter();
    passwordHash = await bcrypt.hash(dummyPassword, 10);
  });

  describe("POST /api/v1/auth/login", () => {
    it("rejects request from untrusted origin with 403", async () => {
      const req = new Request("https://example.com/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@vorldx.com", password: dummyPassword }),
        headers: {
          "content-type": "application/json",
          origin: "https://evil-attacker.com",
        },
      });

      const res = await loginHandler(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("CSRF_ORIGIN_REJECTED");
    });

    it("returns 429 when rate limit is exceeded", async () => {
      const makeReq = () =>
        new Request("https://example.com/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: "invalid", password: "" }),
          headers: {
            "content-type": "application/json",
            origin: validOrigin,
            "x-real-ip": "192.0.2.1",
          },
        });

      // Exhaust 5 login attempts
      for (let i = 0; i < 5; i++) {
        await loginHandler(makeReq());
      }

      // 6th attempt must be rate-limited
      const res = await loginHandler(makeReq());
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(res.headers.get("retry-after")).toBeDefined();
    });

    it("returns 400 when body is malformed JSON", async () => {
      const req = new Request("https://example.com/api/v1/auth/login", {
        method: "POST",
        body: "not-json",
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await loginHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_JSON");
    });

    it("returns 400 when validation fails", async () => {
      const req = new Request("https://example.com/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email", password: "" }),
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await loginHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 401 when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const req = new Request("https://example.com/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "unknown@vorldx.com", password: dummyPassword }),
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await loginHandler(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("returns 401 when password is wrong", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr_1",
        email: "admin@vorldx.com",
        passwordHash,
        status: "ACTIVE",
        role: "ORG_ADMIN",
        name: "Admin",
        organizationId: "org_1",
        organization: { id: "org_1", status: "ACTIVE" },
      } as unknown as never);

      const req = new Request("https://example.com/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@vorldx.com", password: "WrongPassword999!" }),
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await loginHandler(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("returns 403 when user is inactive or suspended", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr_1",
        email: "admin@vorldx.com",
        passwordHash,
        status: "SUSPENDED",
        role: "ORG_ADMIN",
        name: "Admin",
        organizationId: "org_1",
        organization: { id: "org_1", status: "ACTIVE" },
      } as unknown as never);

      const req = new Request("https://example.com/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@vorldx.com", password: dummyPassword }),
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await loginHandler(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error.code).toBe("ACCOUNT_INACTIVE");
    });

    it("successfully logs in, issues session, and sets secure cookie", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr_1",
        email: "admin@vorldx.com",
        passwordHash,
        status: "ACTIVE",
        role: "ORG_ADMIN",
        name: "Admin",
        avatarUrl: null,
        phone: null,
        title: null,
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationId: "org_1",
        organization: {
          id: "org_1",
          name: "VorldX Client",
          displayName: "VorldX",
          slug: "vorldx-client",
          domain: null,
          logoUrl: null,
          primaryColor: "#2563EB",
          secondaryColor: "#10B981",
          status: "ACTIVE",
        },
      } as unknown as never);

      vi.mocked(prisma.session.create).mockResolvedValue({
        id: "sess_1",
        userId: "usr_1",
        sessionToken: "hashedtoken",
        expiresAt: new Date(Date.now() + 28800 * 1000),
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null,
      } as unknown as never);

      vi.mocked(prisma.user.update).mockResolvedValue({} as unknown as never);

      const req = new Request("https://example.com/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@vorldx.com", password: dummyPassword }),
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await loginHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.user.email).toBe("admin@vorldx.com");
      expect(json.data.user.passwordHash).toBeUndefined();
      expect(json.data.permissions).toContain("org:manage_team");

      // Verify Set-Cookie header contains vx_session
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain("vx_session=");
      expect(setCookie?.toLowerCase()).toContain("httponly");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("deletes session and expires session cookie", async () => {
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 });

      const req = new Request("https://example.com/api/v1/auth/logout", {
        method: "POST",
        headers: {
          cookie: "vx_session=test_raw_token",
          origin: validOrigin,
        },
      });

      const res = await logoutHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.session.deleteMany).toHaveBeenCalled();

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain("vx_session=;");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns 401 when no session cookie is supplied", async () => {
      const req = new Request("https://example.com/api/v1/auth/me");
      const res = await meHandler(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("returns sanitized profile and permissions when authenticated", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue({
        id: "sess_1",
        userId: "usr_1",
        sessionToken: "hash",
        expiresAt: new Date(Date.now() + 3600 * 1000),
        user: {
          id: "usr_1",
          email: "user@vorldx.com",
          name: "Test User",
          role: "EDITOR",
          status: "ACTIVE",
          organizationId: "org_1",
          passwordHash: "secret",
          avatarUrl: null,
          phone: null,
          title: "Editor",
          emailVerified: true,
          lastLoginAt: null,
          createdAt: new Date(),
          organization: {
            id: "org_1",
            name: "VorldX Org",
            displayName: "VorldX",
            slug: "vorldx-org",
            domain: null,
            logoUrl: null,
            primaryColor: "#000",
            secondaryColor: "#fff",
            status: "ACTIVE",
          },
        },
      } as unknown as never);

      const req = new Request("https://example.com/api/v1/auth/me", {
        headers: {
          cookie: "vx_session=valid_token",
        },
      });

      const res = await meHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.user.email).toBe("user@vorldx.com");
      expect(json.data.user.passwordHash).toBeUndefined();
      expect(json.data.permissions).toContain("doc:create");
      expect(json.data.permissions).not.toContain("org:manage_team");
    });
  });

  describe("POST /api/v1/auth/register", () => {
    it("returns 409 if email already registered", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr_existing",
        email: "existing@vorldx.com",
      } as unknown as never);

      const req = new Request("https://example.com/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          orgName: "New Org",
          adminName: "Org Admin",
          email: "existing@vorldx.com",
          password: "SecurePassword123!",
        }),
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await registerHandler(req);
      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json.error.code).toBe("ACCOUNT_ALREADY_EXISTS");
    });

    it("atomically creates organization, admin user, settings, audit log, and session", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const mockOrg = {
        id: "org_new",
        name: "Acme Innovations",
        displayName: "Acme Innovations",
        slug: "acme-innovations-abc",
        status: "ACTIVE",
        primaryColor: "#2563EB",
        secondaryColor: "#10B981",
        accentColor: "#06B6D4",
        email: "admin@acme.com",
      };

      const mockUser = {
        id: "usr_new",
        organizationId: "org_new",
        name: "Jane Doe",
        email: "admin@acme.com",
        role: "ORG_ADMIN",
        status: "ACTIVE",
        emailVerified: false,
        avatarUrl: null,
        phone: null,
        title: null,
        lastLoginAt: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const txMock = {
          organization: { create: vi.fn().mockResolvedValue(mockOrg) },
          organizationSettings: { create: vi.fn().mockResolvedValue({}) },
          user: { create: vi.fn().mockResolvedValue(mockUser) },
          platformAuditLog: { create: vi.fn().mockResolvedValue({}) },
        };
        // @ts-expect-error Mocking tx interface
        return callback(txMock);
      });

      vi.mocked(prisma.session.create).mockResolvedValue({
        id: "sess_new",
        userId: "usr_new",
        sessionToken: "token_hash",
        expiresAt: new Date(Date.now() + 28800 * 1000),
      } as unknown as never);

      const req = new Request("https://example.com/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          orgName: "Acme Innovations",
          adminName: "Jane Doe",
          email: "admin@acme.com",
          password: "SuperSecret123!",
        }),
        headers: {
          "content-type": "application/json",
          origin: validOrigin,
        },
      });

      const res = await registerHandler(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.user.role).toBe("ORG_ADMIN");
      expect(json.data.organization.name).toBe("Acme Innovations");

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain("vx_session=");
    });
  });
});
