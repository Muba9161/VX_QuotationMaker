/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as uploadBrandingAsset } from "@/app/api/v1/organization/branding/upload/route";
import { GET as getBranding, PATCH as updateBranding } from "@/app/api/v1/organization/branding/route";
import { composePdfWithLetterhead } from "@/lib/pdf/letterhead-composer";
import * as sessionModule from "@/lib/auth/session";
import * as uploadModule from "@/lib/storage/upload";
import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";

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
      filename: "official-letterhead.pdf",
      filePath: "/mock/path/official-letterhead.pdf",
      mimeType: "application/pdf",
      sizeBytes: 4096,
      category: "letterhead",
    }),
    saveTenantAsset: vi.fn().mockImplementation((tenantId, file) => {
      const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"];
      if (!allowed.includes(file.type)) {
        throw new uploadModule.UploadError(
          `Unsupported file type '${file.type}'. Allowed types: PNG, JPEG, WebP, SVG, PDF.`,
          "UNSUPPORTED_FILE_TYPE",
          400
        );
      }
      return Promise.resolve({
        filename: file.name,
        publicUrl: `/api/v1/organization/branding/asset/${tenantId}/${file.name}`,
        mimeType: file.type,
        sizeBytes: 4096,
        category: "letterhead",
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
      update: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Feature 3: Branding Letterhead Upload & PDF Composition", () => {
  const orgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    displayName: "Alpha Legal",
    status: "ACTIVE",
    letterheadFilename: "letterhead.pdf",
    letterheadMimeType: "application/pdf",
    letterheadUploadedAt: new Date(),
    letterheadApplyQuotations: true,
    letterheadApplyMous: true,
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

  it("1. Uploads PDF letterhead and updates organization metadata", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.organization.update).mockResolvedValue({
      ...orgA,
      letterheadFilename: "official-letterhead.pdf",
      letterheadMimeType: "application/pdf",
    } as any);

    const formData = new FormData();
    const fakeBlob = new Blob(["%PDF-1.4 mock pdf data"], { type: "application/pdf" });
    formData.append("file", fakeBlob, "official-letterhead.pdf");

    const req = new Request("http://localhost:3000/api/v1/organization/branding/upload?category=letterhead", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
      },
      body: formData,
    });

    const res = await uploadBrandingAsset(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.data.filename).toBe("official-letterhead.pdf");
  });

  it("2. Rejects unsupported file types (e.g. application/zip)", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);

    const formData = new FormData();
    const fakeBlob = new Blob(["fake zip content"], { type: "application/zip" });
    formData.append("file", fakeBlob, "archive.zip");

    const req = new Request("http://localhost:3000/api/v1/organization/branding/upload?category=letterhead", {
      method: "POST",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
      },
      body: formData,
    });

    const res = await uploadBrandingAsset(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("Unsupported file type");
  });

  it("3. Updates letterhead application scope (Quotations vs MOUs)", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.organization.update).mockResolvedValue({
      ...orgA,
      letterheadApplyQuotations: true,
      letterheadApplyMous: false,
    } as any);

    const req = new Request("http://localhost:3000/api/v1/organization/branding", {
      method: "PATCH",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        letterheadApplyQuotations: true,
        letterheadApplyMous: false,
      }),
    });

    const res = await updateBranding(req);
    expect(res.status).toBe(200);
    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          letterheadApplyQuotations: true,
          letterheadApplyMous: false,
        }),
      })
    );
  });

  it("4. Removing letterhead clears database fields and deletes asset", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue(sessionAdmin as any);
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(orgA as any);
    vi.mocked(prisma.organization.update).mockResolvedValue({
      ...orgA,
      letterheadFilename: null,
      letterheadMimeType: null,
      letterheadUploadedAt: null,
    } as any);

    const req = new Request("http://localhost:3000/api/v1/organization/branding", {
      method: "PATCH",
      headers: {
        Cookie: "vx_session=valid_token",
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        removeLetterhead: true,
      }),
    });

    const res = await updateBranding(req);
    expect(res.status).toBe(200);
    expect(uploadModule.deleteTenantAsset).toHaveBeenCalledWith(orgA.id, "letterhead.pdf", "letterhead");
    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          letterheadFilename: null,
          letterheadMimeType: null,
          letterheadUploadedAt: null,
        }),
      })
    );
  });

  it("5. Composes PDF document with PDF letterhead preserving multi-page layers", async () => {
    // Generate valid base PDF
    const baseDoc = await PDFDocument.create();
    const page1 = baseDoc.addPage([595.28, 841.89]);
    page1.drawText("Quotation Content Page 1");
    const page2 = baseDoc.addPage([595.28, 841.89]);
    page2.drawText("Quotation Content Page 2");
    const baseBytes = await baseDoc.save();

    // Generate valid letterhead PDF
    const lhDoc = await PDFDocument.create();
    const lhPage = lhDoc.addPage([595.28, 841.89]);
    lhPage.drawText("Official Corporate Letterhead Banner");
    const lhBytes = await lhDoc.save();

    const resultBytes = await composePdfWithLetterhead({
      generatedPdfBytes: Buffer.from(baseBytes),
      letterheadBuffer: Buffer.from(lhBytes),
      letterheadMimeType: "application/pdf",
    });

    expect(resultBytes).toBeInstanceOf(Uint8Array);
    const loadedResult = await PDFDocument.load(resultBytes);
    expect(loadedResult.getPageCount()).toBe(2);
  });
});
