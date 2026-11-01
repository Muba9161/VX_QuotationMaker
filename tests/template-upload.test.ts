/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as uploadTemplate } from "@/app/api/v1/templates/upload/route";
import { POST as duplicateTemplate } from "@/app/api/v1/templates/[id]/duplicate/route";
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
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    template: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    templateItem: {
      create: vi.fn(),
    },
    templateClause: {
      create: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe("Template Upload & Duplication Workflows", () => {
  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/v1/templates/upload saves document and creates template record", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", name: "Admin", isActive: true } as any,
      organization: { id: "org_1", name: "Acme", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    vi.mocked(uploadModule.saveTenantAsset).mockResolvedValue({
      filename: "template-123.pdf",
      relativePath: "storage/uploads/templates/org_1/template-123.pdf",
      publicUrl: "/api/v1/templates/asset/org_1/template-123.pdf",
      sizeBytes: 102400,
      mimeType: "application/pdf",
    });

    const mockCreated = {
      id: "tmpl_new_1",
      organizationId: "org_1",
      title: "Master Services Agreement 2026",
      type: "MOU",
      fileUrl: "/api/v1/templates/asset/org_1/template-123.pdf",
      fileSource: "UPLOAD_PDF",
      isSample: false,
    };

    vi.mocked(prisma.template.create).mockResolvedValue(mockCreated as any);

    const formData = new FormData();
    const blob = new Blob(["dummy pdf content"], { type: "application/pdf" });
    const file = new File([blob], "msa-contract.pdf", { type: "application/pdf" });
    formData.append("file", file);
    formData.append("title", "Master Services Agreement 2026");
    formData.append("category", "MOU");

    const req = new Request("http://localhost:3000/api/v1/templates/upload", {
      method: "POST",
      headers: {
        Origin: origin,
        Cookie: "vx_session=valid_token",
      },
      body: formData,
    });

    const res = await uploadTemplate(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe("Master Services Agreement 2026");
    expect(json.data.fileSource).toBe("UPLOAD_PDF");
    expect(uploadModule.saveTenantAsset).toHaveBeenCalledWith("org_1", expect.any(File), "template");
  });

  it("POST /api/v1/templates/[id]/duplicate clones a platform sample template into tenant templates", async () => {
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: { id: "u_1", organizationId: "org_1", role: "ORG_ADMIN", name: "Admin", isActive: true } as any,
      organization: { id: "org_1", name: "Acme", status: "ACTIVE" } as any,
      session: { id: "s_1" } as any,
    });

    vi.mocked(prisma.template.create).mockResolvedValue({
      id: "cloned_tmpl_1",
      title: "Modern Corporate Quotation (Custom)",
    } as any);

    vi.mocked(prisma.template.findUnique).mockResolvedValue({
      id: "cloned_tmpl_1",
      title: "Modern Corporate Quotation (Custom)",
      items: [{ id: "i1" }, { id: "i2" }],
      clauses: [],
    } as any);

    const req = new Request("http://localhost:3000/api/v1/templates/sample-quote-modern-corp/duplicate", {
      method: "POST",
      headers: {
        Origin: origin,
        Cookie: "vx_session=valid_token",
      },
    });

    const res = await duplicateTemplate(req, {
      params: Promise.resolve({ id: "sample-quote-modern-corp" }),
    });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toContain("Modern Corporate Quotation");
    expect(prisma.template.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          type: "QUOTATION",
        }),
      })
    );
  });
});
