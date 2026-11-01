/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as registerOrg } from "@/app/api/v1/auth/register/route";
import * as uploadModule from "@/lib/storage/upload";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/storage/upload", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage/upload")>(
    "@/lib/storage/upload"
  );
  return {
    ...actual,
    saveTenantAssetBuffer: vi.fn().mockResolvedValue({
      filename: "company-logo.png",
      publicUrl: "/api/v1/organization/branding/asset/company-logo.png",
      filePath: "/mock/path/company-logo.png",
      mimeType: "image/png",
      sizeBytes: 1024,
      category: "logo",
    }),
    deleteTenantAsset: vi.fn().mockResolvedValue(true),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: "usr_new_123", name: "Admin", email: "admin@test.com" }),
    },
    organization: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    organizationSettings: {
      create: vi.fn(),
    },
    subscriptionPlan: {
      findFirst: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password_123"),
}));

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session"
  );
  return {
    ...actual,
    createSession: vi.fn().mockResolvedValue({
      session: { id: "sess_123" },
      rawToken: "session_token_123",
    }),
    attachSessionCookie: vi.fn(),
  };
});

describe("Feature 4: Optional Logo Upload during Organization Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Successfully registers an organization WITHOUT a logo", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.organization.create).mockResolvedValue({
      id: "org_new_123",
      name: "Acme Logistics",
      slug: "acme-logistics",
      logoUrl: null,
      users: [{ id: "usr_123", email: "founder@acme.com", name: "Founder", role: "ORG_ADMIN" }],
    } as any);

    const req = new Request("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        orgName: "Acme Logistics",
        adminName: "Founder",
        email: "founder@acme.com",
        password: "Password123!",
      }),
    });

    const res = await registerOrg(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.data.organization.name).toBe("Acme Logistics");
    expect(uploadModule.saveTenantAssetBuffer).not.toHaveBeenCalled();
  });

  it("2. Successfully registers an organization WITH a valid PNG logo", async () => {
    const createdOrgObj = {
      id: "org_new_456",
      name: "Star Tech",
      slug: "star-tech",
      logoUrl: "/api/v1/organization/branding/asset/company-logo.png",
      users: [{ id: "usr_456", email: "ceo@star.com", name: "CEO", role: "ORG_ADMIN" }],
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.organization.create).mockResolvedValue(createdOrgObj as any);
    vi.mocked(prisma.organization.update).mockResolvedValue(createdOrgObj as any);

    const base64Data = Buffer.from("fake-png-binary-stream").toString("base64");

    const req = new Request("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        orgName: "Star Tech",
        adminName: "CEO",
        email: "ceo@star.com",
        password: "Password123!",
        logoBase64: `data:image/png;base64,${base64Data}`,
        logoFilename: "company-logo.png",
        logoMimeType: "image/png",
      }),
    });

    const res = await registerOrg(req);
    expect(res.status).toBe(201);
    expect(uploadModule.saveTenantAssetBuffer).toHaveBeenCalledWith(
      expect.any(String), // tenant ID
      expect.any(Buffer),
      "company-logo.png",
      "image/png",
      "logo"
    );
  });

  it("3. Rejects invalid logo MIME type (e.g. image/gif)", async () => {
    const req = new Request("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        orgName: "Star Tech",
        adminName: "CEO",
        email: "ceo@star.com",
        password: "Password123!",
        logoBase64: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        logoFilename: "logo.gif",
        logoMimeType: "image/gif",
      }),
    });

    const res = await registerOrg(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("INVALID_LOGO_TYPE");
  });
});
