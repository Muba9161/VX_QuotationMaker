/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as uploadImage, DELETE as removeImage } from "@/app/api/v1/templates/[id]/image/route";
import { GET as serveAsset } from "@/app/api/v1/templates/asset/[orgId]/[filename]/route";
import * as sessionModule from "@/lib/auth/session";
import * as uploadModule from "@/lib/storage/upload";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>(
    "@/lib/auth/session"
  );
  return {
    ...actual,
    validateSession: vi.fn(),
  };
});

vi.mock("@/lib/storage/upload", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage/upload")>(
    "@/lib/storage/upload"
  );
  return {
    ...actual,
    saveTenantAssetBuffer: vi.fn().mockResolvedValue({
      filename: "template-logo.png",
      filePath: "/mock/path/template-logo.png",
      mimeType: "image/png",
      sizeBytes: 1024,
      category: "template",
    }),
    saveTenantAsset: vi.fn().mockImplementation((tenantId, file) => {
      const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
      if (!allowed.includes(file.type)) {
        throw new uploadModule.UploadError(
          `Unsupported file type '${file.type}'. Allowed types: PNG, JPEG, WebP, SVG.`,
          "UNSUPPORTED_FILE_TYPE",
          400
        );
      }
      return Promise.resolve({
        filename: "template-logo.png",
        publicUrl: `/api/v1/templates/asset/${tenantId}/template-logo.png`,
        mimeType: file.type,
        sizeBytes: 1024,
        category: "template",
      });
    }),
    deleteTenantAsset: vi.fn().mockResolvedValue(true),
    readTenantAsset: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
    },
    template: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    document: {
      findFirst: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Feature 2: Template Image Upload & Lifecycle", () => {
  const orgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    status: "ACTIVE",
  };

  const userAdmin = {
    id: "usr_admin_1",
    organizationId: orgA.id,
    role: "ORG_ADMIN",
    name: "Admin User",
    email: "admin@alpha.com",
    isActive: true,
  };

  const sessionAdmin = {
    session: { id: "sess_admin" },
    user: userAdmin,
    organization: orgA,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Accepts and saves valid PNG template image upload", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.template.findFirst).mockResolvedValue({
      id: "tmpl_123",
      organizationId: orgA.id,
      name: "Standard Quotation",
      imageFilename: null,
    } as any);

    vi.mocked(prisma.template.update).mockResolvedValue({
      id: "tmpl_123",
      imageUrl: "/api/v1/templates/asset/org_alpha_111/template-logo.png",
      imageFilename: "template-logo.png",
      imageMimeType: "image/png",
    } as any);

    const formData = new FormData();
    const fakeBlob = new Blob(["fake png data"], { type: "image/png" });
    formData.append("file", fakeBlob, "header-graphic.png");

    const req = new Request("http://localhost:3000/api/v1/templates/tmpl_123/image", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
      },
      body: formData,
    });

    const res = await uploadImage(req, { params: Promise.resolve({ id: "tmpl_123" }) });
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.data.filename).toBe("template-logo.png");
    expect(uploadModule.saveTenantAsset).toHaveBeenCalled();
  });

  it("retains the previous template asset while a saved quotation references it", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.template.findFirst).mockResolvedValue({
      id: "tmpl_123",
      organizationId: orgA.id,
      title: "Uploaded quotation",
      imageFilename: "original-template.pdf",
    } as any);
    vi.mocked(prisma.template.update).mockResolvedValue({
      id: "tmpl_123",
      imageFilename: "template-logo.png",
    } as any);
    vi.mocked(prisma.document.findFirst).mockResolvedValue({ id: "doc_qtn_001" } as any);

    const formData = new FormData();
    formData.append("file", new Blob(["new image"], { type: "image/png" }), "logo.png");
    const req = new Request("http://localhost:3000/api/v1/templates/tmpl_123/image", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
      },
      body: formData,
    });

    const res = await uploadImage(req, { params: Promise.resolve({ id: "tmpl_123" }) });

    expect(res.status).toBe(201);
    expect(prisma.document.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { templateId: "tmpl_123", organizationId: orgA.id },
      })
    );
    expect(uploadModule.deleteTenantAsset).not.toHaveBeenCalled();
  });

  it("2. Rejects unsupported MIME type (e.g. text/plain)", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.template.findFirst).mockResolvedValue({
      id: "tmpl_123",
      organizationId: orgA.id,
    } as any);

    const formData = new FormData();
    const fakeBlob = new Blob(["invalid plain text"], { type: "text/plain" });
    formData.append("file", fakeBlob, "malicious.txt");

    const req = new Request("http://localhost:3000/api/v1/templates/tmpl_123/image", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
      },
      body: formData,
    });

    const res = await uploadImage(req, { params: Promise.resolve({ id: "tmpl_123" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("Unsupported file type");
  });

  it("3. Enforces cross-tenant isolation when template belongs to another organization", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    // findFirst scoped to orgA returns null for template belonging to orgB
    vi.mocked(prisma.template.findFirst).mockResolvedValue(null);

    const formData = new FormData();
    const fakeBlob = new Blob(["fake png data"], { type: "image/png" });
    formData.append("file", fakeBlob, "header.png");

    const req = new Request("http://localhost:3000/api/v1/templates/tmpl_other_org/image", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
      },
      body: formData,
    });

    const res = await uploadImage(req, { params: Promise.resolve({ id: "tmpl_other_org" }) });
    expect(res.status).toBe(404);
  });

  it("4. Deletes template image and resets template database fields", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.document.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.template.findFirst).mockResolvedValue({
      id: "tmpl_123",
      organizationId: orgA.id,
      imageFilename: "existing-asset.png",
    } as any);

    const req = new Request("http://localhost:3000/api/v1/templates/tmpl_123/image", {
      method: "DELETE",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
      },
    });

    const res = await removeImage(req, { params: Promise.resolve({ id: "tmpl_123" }) });
    expect(res.status).toBe(200);
    expect(uploadModule.deleteTenantAsset).toHaveBeenCalledWith(orgA.id, "existing-asset.png", "template");
    expect(prisma.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          imageUrl: null,
          imageFilename: null,
          imageMimeType: null,
        }),
      })
    );
  });

  it("5. Serves asset with proper cache-control and Content-Type headers", async () => {
    vi.mocked(uploadModule.readTenantAsset).mockResolvedValue({
      buffer: Buffer.from("image binary data"),
      mimeType: "image/png",
    });

    const req = new Request("http://localhost/api/v1/templates/asset/org_alpha_111/header.png");
    const res = await serveAsset(req, {
      params: Promise.resolve({ orgId: "org_alpha_111", filename: "header.png" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toContain("public");
  });
});
