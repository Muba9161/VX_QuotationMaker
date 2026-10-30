/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listTemplates, POST as createTemplate } from "@/app/api/v1/templates/route";
import {
  GET as getTemplate,
  PATCH as updateTemplate,
  DELETE as deleteTemplate,
} from "@/app/api/v1/templates/[id]/route";
import * as sessionModule from "@/lib/auth/session";
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

vi.mock("@/lib/prisma", () => ({
  prisma: {
    template: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    templateItem: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    templateClause: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe("Phase 3: Template Management API & Tenant Isolation", () => {
  const mockOrgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    status: "ACTIVE",
  };

  const mockOrgB = {
    id: "org_beta_222",
    name: "Beta Corp",
    status: "ACTIVE",
  };

  const mockUserAdminA = {
    id: "usr_admin_a",
    organizationId: "org_alpha_111",
    role: "ORG_ADMIN",
    name: "Alice Admin",
    email: "alice@alpha.com",
    isActive: true,
  };

  const mockTemplateQtn: any = {
    id: "tmpl_qtn_01",
    organizationId: "org_alpha_111",
    createdByUserId: "usr_admin_a",
    title: "Standard Software Proposal",
    type: "QUOTATION",
    description: "Standard template for web & mobile app quotes",
    isDefault: true,
    isActive: true,
    version: 1,
    contentSchema: {},
    items: [
      {
        id: "ti_01",
        description: "Discovery & UX Wireframing",
        defaultQuantity: 1,
        unit: "milestone",
        defaultRate: 50000,
        sortOrder: 1,
      },
    ],
    clauses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/templates", () => {
    it("returns active templates scoped to authenticated tenant organization", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.template.findMany).mockResolvedValue([mockTemplateQtn]);

      const req = new Request("http://localhost:3000/api/v1/templates?type=QUOTATION", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await listTemplates(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe("tmpl_qtn_01");

      expect(prisma.template.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org_alpha_111",
            type: "QUOTATION",
            isActive: true,
          }),
        })
      );
    });
  });

  describe("POST /api/v1/templates", () => {
    it("creates a quotation template, manages default flags, and creates audit log", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.template.create).mockResolvedValue({
        id: "tmpl_qtn_01",
        title: "Standard Software Proposal",
      } as any);

      vi.mocked(prisma.template.findUnique).mockResolvedValue(mockTemplateQtn);

      const req = new Request("http://localhost:3000/api/v1/templates", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          title: "Standard Software Proposal",
          type: "QUOTATION",
          description: "Standard template for web & mobile app quotes",
          isDefault: true,
          items: [
            {
              description: "Discovery & UX Wireframing",
              defaultQuantity: 1,
              unit: "milestone",
              defaultRate: 50000,
            },
          ],
        }),
      });

      const res = await createTemplate(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.title).toBe("Standard Software Proposal");

      // Verify unsetting previous defaults when isDefault is true
      expect(prisma.template.updateMany).toHaveBeenCalledWith({
        where: { organizationId: "org_alpha_111", type: "QUOTATION" },
        data: { isDefault: false },
      });

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: "org_alpha_111",
          createdByUserId: "usr_admin_a",
          title: "Standard Software Proposal",
          isDefault: true,
        }),
      });

      expect(prisma.platformAuditLog.create).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/templates/[id]", () => {
    it("returns template details for tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplateQtn);

      const req = new Request("http://localhost:3000/api/v1/templates/tmpl_qtn_01", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getTemplate(req, {
        params: Promise.resolve({ id: "tmpl_qtn_01" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.id).toBe("tmpl_qtn_01");
      expect(data.data.items).toHaveLength(1);
    });

    it("enforces tenant isolation: returns 404 for template belonging to another tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: { ...mockUserAdminA, organizationId: "org_beta_222" } as any,
        organization: mockOrgB as any,
        session: { id: "sess_2" } as any,
      });

      vi.mocked(prisma.template.findFirst).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/templates/tmpl_qtn_01", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getTemplate(req, {
        params: Promise.resolve({ id: "tmpl_qtn_01" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });
  });

  describe("DELETE /api/v1/templates/[id]", () => {
    it("deletes template and returns success", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplateQtn);
      vi.mocked(prisma.template.delete).mockResolvedValue(mockTemplateQtn);

      const req = new Request("http://localhost:3000/api/v1/templates/tmpl_qtn_01", {
        method: "DELETE",
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await deleteTemplate(req, {
        params: Promise.resolve({ id: "tmpl_qtn_01" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.message).toContain("deleted successfully");
      expect(prisma.template.delete).toHaveBeenCalledWith({
        where: { id: "tmpl_qtn_01" },
      });
    });
  });
});
