import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as registerHandler } from "@/app/api/v1/auth/register/route";
import { POST as loginHandler } from "@/app/api/v1/auth/login/route";
import { GET as meHandler } from "@/app/api/v1/auth/me/route";
import { POST as logoutHandler } from "@/app/api/v1/auth/logout/route";
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
      findUnique: vi.fn(),
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

describe("Complete Authentication Lifecycle Integration (10 Steps)", () => {
  const validOrigin = "http://localhost:3000";
  const userPassword = "SecurePassword123!";
  let passwordHash: string;

  // In-memory test store simulating PostgreSQL persistence during lifecycle
  const dbState = {
    users: new Map<string, Record<string, unknown>>(),
    organizations: new Map<string, Record<string, unknown>>(),
    sessions: new Map<string, Record<string, unknown>>(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    _resetRateLimiter();
    dbState.users.clear();
    dbState.organizations.clear();
    dbState.sessions.clear();

    passwordHash = await bcrypt.hash(userPassword, 10);
  });

  it("successfully completes all 10 steps of the authentication lifecycle", async () => {
    // -------------------------------------------------------------------------
    // STEP 1 & 2: Validate input fields on registration
    // -------------------------------------------------------------------------
    const invalidRegReq = new Request("https://example.com/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        orgName: "", // Invalid empty name
        adminName: "A", // Too short
        email: "not-an-email",
        password: "short",
      }),
      headers: { "content-type": "application/json", origin: validOrigin },
    });

    const invalidRegRes = await registerHandler(invalidRegReq);
    const invalidRegJson = await invalidRegRes.json();
    expect(invalidRegRes.status).toBe(400);
    expect(invalidRegJson.error.code).toBe("VALIDATION_ERROR");

    // -------------------------------------------------------------------------
    // STEP 3: Transactional Registration of Organization + Admin
    // -------------------------------------------------------------------------
    const testOrg = {
      id: "org_alpha_123",
      name: "Alpha Corp",
      displayName: "Alpha Corp",
      slug: "alpha-corp-abc",
      status: "ACTIVE",
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      accentColor: "#06B6D4",
      defaultExpiryDays: 30,
      allowMemberRegistration: true,
      requireAdminApproval: true,
    };

    const testUser = {
      id: "usr_alpha_456",
      organizationId: testOrg.id,
      name: "Alpha Admin",
      email: "admin@alphacorp.com",
      passwordHash,
      role: "ORG_ADMIN",
      status: "ACTIVE",
      emailVerified: false,
      avatarUrl: null,
      phone: null,
      title: null,
      lastLoginAt: null,
      createdAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        organization: {
          create: vi.fn().mockImplementation(async () => {
            dbState.organizations.set(testOrg.id, testOrg);
            return testOrg;
          }),
        },
        organizationSettings: {
          create: vi.fn().mockResolvedValue({}),
        },
        user: {
          create: vi.fn().mockImplementation(async () => {
            dbState.users.set(testUser.email, testUser);
            return testUser;
          }),
        },
        platformAuditLog: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      // @ts-expect-error Mocking transaction callback
      return callback(tx);
    });

    // @ts-expect-error Mocking Prisma session client
    vi.mocked(prisma.session.create).mockImplementation(async ({ data }) => {
      const sess = {
        id: "sess_reg_1",
        userId: data.userId,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt,
        createdAt: new Date(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      };
      dbState.sessions.set(data.sessionToken, sess);
      return sess as unknown as never;
    });

    const validRegReq = new Request("https://example.com/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        orgName: "Alpha Corp",
        adminName: "Alpha Admin",
        email: "admin@alphacorp.com",
        password: userPassword,
      }),
      headers: { "content-type": "application/json", origin: validOrigin },
    });

    const regRes = await registerHandler(validRegReq);
    const regJson = await regRes.json();

    expect(regRes.status).toBe(201);
    expect(regJson.success).toBe(true);
    expect(regJson.data.user.role).toBe("ORG_ADMIN");
    expect(regJson.data.user.email).toBe("admin@alphacorp.com");
    expect(regJson.data.user.passwordHash).toBeUndefined();
    expect(regRes.headers.get("set-cookie")).toContain("vx_session=");

    // -------------------------------------------------------------------------
    // STEP 4: Duplicate Registration Rejection (409)
    // -------------------------------------------------------------------------
    vi.mocked(prisma.user.findUnique).mockResolvedValue(testUser as unknown as never);

    const dupRegReq = new Request("https://example.com/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        orgName: "Alpha Corp",
        adminName: "Alpha Admin",
        email: "admin@alphacorp.com",
        password: userPassword,
      }),
      headers: { "content-type": "application/json", origin: validOrigin },
    });

    const dupRes = await registerHandler(dupRegReq);
    const dupJson = await dupRes.json();
    expect(dupRes.status).toBe(409);
    expect(dupJson.error.code).toBe("ACCOUNT_ALREADY_EXISTS");

    // -------------------------------------------------------------------------
    // STEP 5 & 6: Login - Valid Credentials vs Invalid Credentials
    // -------------------------------------------------------------------------
    // 6. Test invalid credentials
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...testUser,
      organization: testOrg,
    } as unknown as never);

    const invalidLoginReq = new Request("https://example.com/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@alphacorp.com",
        password: "WrongPassword999!",
      }),
      headers: { "content-type": "application/json", origin: validOrigin },
    });

    const invalidLoginRes = await loginHandler(invalidLoginReq);
    expect(invalidLoginRes.status).toBe(401);
    expect((await invalidLoginRes.json()).error.code).toBe("INVALID_CREDENTIALS");

    // 5. Test valid credentials
    let issuedRawToken = "";
    // @ts-expect-error Mocking Prisma session client
    vi.mocked(prisma.session.create).mockImplementation(async ({ data }) => {
      const sess = {
        id: "sess_login_2",
        userId: data.userId,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt,
        createdAt: new Date(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      };
      dbState.sessions.set(data.sessionToken, sess);
      return sess as unknown as never;
    });

    vi.mocked(prisma.user.update).mockResolvedValue({} as unknown as never);

    const validLoginReq = new Request("https://example.com/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@alphacorp.com",
        password: userPassword,
      }),
      headers: { "content-type": "application/json", origin: validOrigin },
    });

    const loginRes = await loginHandler(validLoginReq);
    const loginJson = await loginRes.json();

    expect(loginRes.status).toBe(200);
    expect(loginJson.success).toBe(true);
    expect(loginJson.data.user.email).toBe("admin@alphacorp.com");
    expect(loginJson.data.permissions).toContain("org:manage_team");

    // Extract cookie
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const match = setCookie.match(/vx_session=([^;]+)/);
    expect(match).not.toBeNull();
    issuedRawToken = match![1];

    // -------------------------------------------------------------------------
    // STEP 7: Authenticated Profile Retrieval via GET /api/v1/auth/me
    // -------------------------------------------------------------------------
    // Setup session lookup in DB mock
    // @ts-expect-error Mocking Prisma session findUnique
    vi.mocked(prisma.session.findUnique).mockImplementation(async ({ where }) => {
      const found = dbState.sessions.get(where.sessionToken as string);
      if (!found) return null;
      return {
        ...found,
        user: {
          ...testUser,
          organization: testOrg,
        },
      } as unknown as never;
    });

    const meReq = new Request("https://example.com/api/v1/auth/me", {
      method: "GET",
      headers: {
        cookie: `vx_session=${issuedRawToken}`,
      },
    });

    const meRes = await meHandler(meReq);
    const meJson = await meRes.json();

    expect(meRes.status).toBe(200);
    expect(meJson.success).toBe(true);
    expect(meJson.data.user.email).toBe("admin@alphacorp.com");
    expect(meJson.data.user.passwordHash).toBeUndefined();
    expect(meJson.data.organization.name).toBe("Alpha Corp");

    // -------------------------------------------------------------------------
    // STEP 8: Logout Revokes Session in DB and Expires Cookie
    // -------------------------------------------------------------------------
    // @ts-expect-error Mocking Prisma session deleteMany
    vi.mocked(prisma.session.deleteMany).mockImplementation(async (args?: unknown) => {
      const where = (args as { where?: { sessionToken?: string } })?.where;
      let count = 0;
      if (where?.sessionToken) {
        if (dbState.sessions.has(where.sessionToken)) {
          dbState.sessions.delete(where.sessionToken);
          count++;
        }
      }
      return { count } as unknown as never;
    });

    const logoutReq = new Request("https://example.com/api/v1/auth/logout", {
      method: "POST",
      headers: {
        cookie: `vx_session=${issuedRawToken}`,
        origin: validOrigin,
      },
    });

    const logoutRes = await logoutHandler(logoutReq);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers.get("set-cookie")).toContain("vx_session=;");
    expect(logoutRes.headers.get("set-cookie")).toContain("Max-Age=0");

    // -------------------------------------------------------------------------
    // STEP 9: Revoked Session Cannot Be Reused (401)
    // -------------------------------------------------------------------------
    const reuseReq = new Request("https://example.com/api/v1/auth/me", {
      method: "GET",
      headers: {
        cookie: `vx_session=${issuedRawToken}`,
      },
    });

    const reuseRes = await meHandler(reuseReq);
    expect(reuseRes.status).toBe(401);
    expect((await reuseRes.json()).error.code).toBe("UNAUTHORIZED");

    // -------------------------------------------------------------------------
    // STEP 10: Protected Requests Reject Unauthenticated Users (401)
    // -------------------------------------------------------------------------
    const unauthReq = new Request("https://example.com/api/v1/auth/me", {
      method: "GET",
    });

    const unauthRes = await meHandler(unauthReq);
    expect(unauthRes.status).toBe(401);
    expect((await unauthRes.json()).error.code).toBe("UNAUTHORIZED");
  });
});
