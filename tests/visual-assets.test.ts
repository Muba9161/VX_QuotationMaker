/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listAssets, POST as uploadAsset } from "@/app/api/v1/organization/assets/route";
import { DELETE as deleteAsset } from "@/app/api/v1/organization/assets/[id]/route";
import * as sessionModule from "@/lib/auth/session";
import * as uploadModule from "@/lib/storage/upload";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>("@/lib/auth/session");
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

vi.mock("@/lib/storage/upload", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage/upload")>("@/lib/storage/upload");
  return {
    ...actual,
    saveTenantAsset: vi.fn(),
    deleteTenantAsset: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organizationAsset: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Organization Visual Assets Management", () => {
  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/organization/assets lists assets for tenant with category filter", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", name: "Admin", isActive: true } as any,
      organization: { id: "org_1", name: "Acme", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    const mockAssets = [
      {
        id: "asset_1",
        organizationId: "org_1",
        name: "Corporate Primary Logo",
        category: "LOGO",
        fileUrl: "/api/v1/organization/assets/file/org_1/asset-1.png",
      },
    ];

    vi.mocked(prisma.organizationAsset.findMany).mockResolvedValue(mockAssets as any);

    const req = new Request("http://localhost:3000/api/v1/organization/assets?category=LOGO", {
      headers: {
        Origin: origin,
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await listAssets(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.assets).toHaveLength(1);
    expect(json.data.assets[0].name).toBe("Corporate Primary Logo");
    expect(prisma.organizationAsset.findMany).toHaveBeenCalledWith({
      where: { organizationId: "org_1", category: "LOGO" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("POST /api/v1/organization/assets validates, uploads and saves asset record", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", name: "Admin", isActive: true } as any,
      organization: { id: "org_1", name: "Acme", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    vi.mocked(uploadModule.saveTenantAsset).mockResolvedValue({
      filename: "asset-signature.png",
      relativePath: "storage/uploads/assets/org_1/asset-signature.png",
      publicUrl: "/api/v1/organization/assets/file/org_1/asset-signature.png",
      sizeBytes: 45000,
      mimeType: "image/png",
    });

    const mockSaved = {
      id: "asset_sig_1",
      organizationId: "org_1",
      name: "Authorized CEO Signature",
      category: "SIGNATURE",
      fileUrl: "/api/v1/organization/assets/file/org_1/asset-signature.png",
      filename: "asset-signature.png",
      mimeType: "image/png",
      sizeBytes: 45000,
    };

    vi.mocked(prisma.organizationAsset.create).mockResolvedValue(mockSaved as any);

    const formData = new FormData();
    const blob = new Blob(["dummy png content"], { type: "image/png" });
    const file = new File([blob], "ceo-signature.png", { type: "image/png" });
    formData.append("file", file);
    formData.append("name", "Authorized CEO Signature");
    formData.append("category", "SIGNATURE");

    const req = new Request("http://localhost:3000/api/v1/organization/assets", {
      method: "POST",
      headers: {
        Origin: origin,
        Cookie: "vx_session=valid_token",
      },
      body: formData,
    });

    const res = await uploadAsset(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.name).toBe("Authorized CEO Signature");
    expect(json.data.category).toBe("SIGNATURE");
    expect(uploadModule.saveTenantAsset).toHaveBeenCalledWith("org_1", expect.any(File), "asset");
  });

  it("DELETE /api/v1/organization/assets/[id] deletes asset file and database record", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", name: "Admin", isActive: true } as any,
      organization: { id: "org_1", name: "Acme", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    const mockAsset = {
      id: "asset_del_1",
      organizationId: "org_1",
      filename: "asset-old.png",
      name: "Old Logo",
      category: "LOGO",
    };

    vi.mocked(prisma.organizationAsset.findFirst).mockResolvedValue(mockAsset as any);
    vi.mocked(prisma.organizationAsset.delete).mockResolvedValue(mockAsset as any);
    vi.mocked(uploadModule.deleteTenantAsset).mockResolvedValue(true);

    const req = new Request("http://localhost:3000/api/v1/organization/assets/asset_del_1", {
      method: "DELETE",
      headers: {
        Origin: origin,
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await deleteAsset(req, {
      params: Promise.resolve({ id: "asset_del_1" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(uploadModule.deleteTenantAsset).toHaveBeenCalledWith("org_1", "asset-old.png", "asset");
    expect(prisma.organizationAsset.delete).toHaveBeenCalledWith({
      where: { id: "asset_del_1" },
    });
  });
});
