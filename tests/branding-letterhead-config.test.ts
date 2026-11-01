/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getBranding, PATCH as updateBranding } from "@/app/api/v1/organization/branding/route";
import { POST as uploadBrandingAsset } from "@/app/api/v1/organization/branding/upload/route";
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
    organization: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Branding & Letterhead Configuration (Alternate Logo & Default Letterhead)", () => {
  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/organization/branding includes alternateLogoUrl and defaultLetterheadId", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", isActive: true } as any,
      organization: { id: "org_1", name: "Acme Corp", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    const mockOrg = {
      id: "org_1",
      name: "Acme Corp",
      displayName: "Acme",
      tagline: "Excellence",
      email: "corp@acme.com",
      phone: "+91 9999999999",
      website: "https://acme.com",
      address: "123 Tech Way",
      logoUrl: "/uploads/logo.png",
      alternateLogoUrl: "/uploads/alt-logo.png",
      alternateLogoFilename: "alt-logo.png",
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      accentColor: "#06B6D4",
      defaultLetterheadId: "sample-letterhead-minimal-corp",
      letterheadUrl: "/uploads/letterhead.pdf",
      letterheadHeaderText: "Header",
      letterheadFooterText: "Footer",
      letterheadLogoPosition: "left",
      defaultSignatoryName: "Jane Doe",
      defaultSignatoryTitle: "CEO",
      letterheadFilename: "letterhead.pdf",
      letterheadMimeType: "application/pdf",
      letterheadUploadedAt: new Date(),
      letterheadApplyQuotations: true,
      letterheadApplyMous: true,
    };

    vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

    const req = new Request("http://localhost:3000/api/v1/organization/branding", {
      headers: {
        Origin: origin,
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await getBranding(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.branding.alternateLogoUrl).toBe("/uploads/alt-logo.png");
    expect(json.data.letterhead.defaultLetterheadId).toBe("sample-letterhead-minimal-corp");
  });

  it("PATCH /api/v1/organization/branding updates alternate logo and default letterhead", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", name: "Admin", isActive: true } as any,
      organization: { id: "org_1", name: "Acme Corp", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    const mockUpdated = {
      id: "org_1",
      name: "Acme Corp",
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      accentColor: "#06B6D4",
      logoUrl: "/uploads/logo.png",
      alternateLogoUrl: "/uploads/new-alt-logo.png",
      alternateLogoFilename: "new-alt-logo.png",
      defaultLetterheadId: "sample-letterhead-modern-biz",
      letterheadUrl: null,
    };

    vi.mocked(prisma.organization.update).mockResolvedValue(mockUpdated as any);

    const req = new Request("http://localhost:3000/api/v1/organization/branding", {
      method: "PATCH",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        Cookie: "vx_session=valid_token",
      },
      body: JSON.stringify({
        alternateLogoUrl: "/uploads/new-alt-logo.png",
        alternateLogoFilename: "new-alt-logo.png",
        defaultLetterheadId: "sample-letterhead-modern-biz",
      }),
    });

    const res = await updateBranding(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.branding.alternateLogoUrl).toBe("/uploads/new-alt-logo.png");
    expect(json.data.letterhead.defaultLetterheadId).toBe("sample-letterhead-modern-biz");
    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "org_1" },
        data: expect.objectContaining({
          alternateLogoUrl: "/uploads/new-alt-logo.png",
          defaultLetterheadId: "sample-letterhead-modern-biz",
        }),
      })
    );
  });

  it("POST /api/v1/organization/branding/upload with alternate_logo category persists alternateLogoUrl", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", name: "Admin", isActive: true } as any,
      organization: { id: "org_1", name: "Acme Corp", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    vi.mocked(uploadModule.saveTenantAsset).mockResolvedValue({
      filename: "logo-alt-uuid.png",
      relativePath: "storage/uploads/branding/org_1/logo-alt-uuid.png",
      publicUrl: "/api/v1/organization/branding/asset/org_1/logo-alt-uuid.png",
      sizeBytes: 32000,
      mimeType: "image/png",
    });

    vi.mocked(prisma.organization.update).mockResolvedValue({} as any);

    const formData = new FormData();
    const blob = new Blob(["alt logo image bytes"], { type: "image/png" });
    const file = new File([blob], "logo-dark.png", { type: "image/png" });
    formData.append("file", file);
    formData.append("category", "alternate_logo");

    const req = new Request("http://localhost:3000/api/v1/organization/branding/upload", {
      method: "POST",
      headers: {
        Origin: origin,
        Cookie: "vx_session=valid_token",
      },
      body: formData,
    });

    const res = await uploadBrandingAsset(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(prisma.organization.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "org_1" },
        data: expect.objectContaining({
          alternateLogoUrl: "/api/v1/organization/branding/asset/org_1/logo-alt-uuid.png",
          alternateLogoFilename: "logo-dark.png",
        }),
      })
    );
  });
});
