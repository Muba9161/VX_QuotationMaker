/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listQuotations, POST as createQuotation } from "@/app/api/v1/quotations/route";
import {
  GET as getQuotation,
  PATCH as updateQuotation,
  DELETE as deleteQuotation,
} from "@/app/api/v1/quotations/[id]/route";
import { POST as updateStatus } from "@/app/api/v1/quotations/[id]/status/route";
import { GET as downloadPdf } from "@/app/api/v1/quotations/[id]/pdf/route";
import * as sessionModule from "@/lib/auth/session";
import * as uploadModule from "@/lib/storage/upload";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";
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

vi.mock("@/lib/services/document-numbering", () => ({
  generateNextDocumentNumber: vi.fn().mockResolvedValue("VX-QTN-2026-0001"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    documentItem: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    template: {
      findFirst: vi.fn(),
    },
    documentSnapshot: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe("Phase 3: Quotation Management API & Lifecycle Verification", () => {
  const mockOrgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    displayName: "Alpha Corp Inc",
    email: "billing@alpha.com",
    phone: "+1-555-0100",
    address: "100 Market St, SF",
    taxId: "GST-ALPHA",
    primaryColor: "#2563eb",
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

  const mockQuotationA1: any = {
    id: "doc_qtn_001",
    organizationId: "org_alpha_111",
    createdByUserId: "usr_admin_a",
    docNumber: "VX-QTN-2026-0001",
    title: "Enterprise Cloud Migration",
    type: "QUOTATION",
    status: DocumentStatus.DRAFT,
    clientName: "Jane Smith",
    clientCompany: "Acme Logistics",
    clientEmail: "jane@acme.com",
    clientPhone: "+1-555-0199",
    clientAddress: "500 Logistics Way, Chicago, IL",
    currency: "INR",
    currencySymbol: "₹",
    subtotal: 100000,
    taxRate: 18,
    taxAmount: 18000,
    discountType: "none",
    discountValue: 0,
    discountAmount: 0,
    total: 118000,
    paymentTerms: "Net 30",
    notes: "Thank you for your business.",
    termsAndConditions: "Standard service terms apply.",
    issueDate: new Date("2026-10-01"),
    validTill: new Date("2026-10-31"),
    shareToken: "token_abc123",
    templateId: null,
    snapshots: [],
    clauses: [],
    items: [
      {
        id: "item_01",
        documentId: "doc_qtn_001",
        name: "Cloud Architecture Design",
        description: "Initial cloud setup and VPC topology",
        quantity: 1,
        unit: "service",
        rate: 100000,
        discount: 0,
        taxPercent: 18,
        amount: 100000,
        sortOrder: 1,
      },
    ],
    contact: {
      name: "Jane Smith",
      companyName: "Acme Logistics",
      email: "jane@acme.com",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/quotations", () => {
    it("returns quotations list strictly isolated to tenant organization", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findMany).mockResolvedValue([mockQuotationA1]);
      vi.mocked(prisma.document.count).mockResolvedValue(1);

      const req = new Request("http://localhost:3000/api/v1/quotations?page=1&limit=20", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await listQuotations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].docNumber).toBe("VX-QTN-2026-0001");
      expect(data.meta.pagination.total).toBe(1);

      // Verify tenant boundary
      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org_alpha_111",
            type: "QUOTATION",
          }),
        })
      );
    });
  });

  describe("POST /api/v1/quotations", () => {
    it("creates quotation with verified financial calculations and atomic numbering", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.create).mockResolvedValue({
        id: "doc_qtn_001",
        docNumber: "VX-QTN-2026-0001",
      } as any);
      vi.mocked(prisma.template.findFirst).mockResolvedValue({
        id: "11111111-1111-4111-8111-111111111111",
      } as any);

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockQuotationA1);
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        templateId: "11111111-1111-4111-8111-111111111111",
        template: {
          id: "11111111-1111-4111-8111-111111111111",
          title: "VorldX Purple",
          version: 3,
          type: "QUOTATION",
          category: "QUOTATION",
          fileSource: "UPLOAD_PDF",
          fileUrl:
            "/api/v1/templates/asset/org_alpha_111/quotation-template.pdf",
          imageUrl: null,
          imageFilename: "quotation-template.pdf",
          imageMimeType: "application/pdf",
          contentSchema: { accentColor: "#6d28d9" },
          items: [],
          clauses: [],
        },
      } as any);
      vi.mocked(prisma.documentSnapshot.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.documentSnapshot.create).mockResolvedValue({} as any);

      const req = new Request("http://localhost:3000/api/v1/quotations", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          title: "Enterprise Cloud Migration",
          clientName: "Jane Smith",
          clientCompany: "Acme Logistics",
          currency: "INR",
          currencySymbol: "₹",
          taxRate: 18,
          templateId: "11111111-1111-4111-8111-111111111111",
          items: [
            {
              description: "Initial cloud setup and VPC topology",
              quantity: 1,
              unit: "service",
              rate: 100000,
            },
          ],
        }),
      });

      const res = await createQuotation(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.docNumber).toBe("VX-QTN-2026-0001");
      expect(data.data.total).toBe(118000);
      expect(prisma.template.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org_alpha_111",
            type: { in: ["QUOTATION", "MOU"] },
            isActive: true,
            isSample: false,
          }),
        })
      );

      // Verify atomic document creation inside transaction
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: "org_alpha_111",
          docNumber: "VX-QTN-2026-0001",
          subtotal: 100000,
          taxAmount: 18000,
          total: 118000,
          templateId: "11111111-1111-4111-8111-111111111111",
        }),
      });
      expect(prisma.documentSnapshot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contentJson: expect.objectContaining({
              templateSnapshotOrigin: "selected",
              template: expect.objectContaining({
                id: "11111111-1111-4111-8111-111111111111",
                version: 3,
                imageFilename: "quotation-template.pdf",
              }),
              items: expect.arrayContaining([
                expect.objectContaining({
                  name: "Cloud Architecture Design",
                }),
              ]),
            }),
          }),
        })
      );
    });

    it("creates a saved final quotation as SENT and records its sent timestamp", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });
      vi.mocked(prisma.document.create).mockResolvedValue(mockQuotationA1 as any);
      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockQuotationA1);
      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockQuotationA1);
      vi.mocked(prisma.documentSnapshot.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.documentSnapshot.create).mockResolvedValue({} as any);

      const req = new Request("http://localhost:3000/api/v1/quotations", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          title: "Final quotation",
          clientName: "Jane Smith",
          status: "SENT",
          items: [{ description: "Consulting", quantity: 1, rate: 100 }],
        }),
      });

      const res = await createQuotation(req);

      expect(res.status).toBe(201);
      expect(prisma.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DocumentStatus.SENT,
            sentAt: expect.any(Date),
          }),
        })
      );
    });

    it("rejects quotation creation when title or line items are missing", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      const req = new Request("http://localhost:3000/api/v1/quotations", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          title: "",
          items: [],
        }),
      });

      const res = await createQuotation(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PATCH /api/v1/quotations/[id]", () => {
    it("transitions a saved draft to SENT and records its sent timestamp", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });
      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockQuotationA1);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockQuotationA1,
        status: DocumentStatus.SENT,
        sentAt: new Date(),
      });
      vi.mocked(prisma.documentSnapshot.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.documentSnapshot.create).mockResolvedValue({} as any);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001", {
        method: "PATCH",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "SENT" }),
      });

      const res = await updateQuotation(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });

      expect(res.status).toBe(200);
      expect(prisma.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DocumentStatus.SENT,
            sentAt: expect.any(Date),
          }),
        })
      );
    });

    it("rejects invalid status transitions while updating a quotation", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        status: DocumentStatus.SENT,
      });

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001", {
        method: "PATCH",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "DRAFT" }),
      });

      const res = await updateQuotation(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TRANSITION");
      expect(prisma.document.update).not.toHaveBeenCalled();
    });

    it("persists a selected organization quotation template", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });
      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockQuotationA1);
      vi.mocked(prisma.template.findFirst).mockResolvedValue({
        id: "11111111-1111-4111-8111-111111111111",
      } as any);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockQuotationA1,
        templateId: "11111111-1111-4111-8111-111111111111",
      });

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001", {
        method: "PATCH",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ templateId: "11111111-1111-4111-8111-111111111111" }),
      });

      const res = await updateQuotation(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });

      expect(res.status).toBe(200);
      expect(prisma.template.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org_alpha_111",
            type: { in: ["QUOTATION", "MOU"] },
          }),
        })
      );
      expect(prisma.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            templateId: "11111111-1111-4111-8111-111111111111",
          }),
        })
      );
    });

    it("keeps the original template version when editing an existing quotation", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });
      const originalTemplate = {
        id: "11111111-1111-4111-8111-111111111111",
        title: "Original template",
        version: 3,
        type: "QUOTATION",
        category: "QUOTATION",
        fileSource: "UPLOAD_PDF",
        fileUrl:
          "/api/v1/templates/asset/org_alpha_111/quotation-template.pdf",
        imageUrl: null,
        imageFilename: "quotation-template.pdf",
        imageMimeType: "application/pdf",
        contentSchema: { accentColor: "#6d28d9" },
        items: [],
        clauses: [],
      };
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        templateId: originalTemplate.id,
        snapshots: [{
          contentJson: {
            template: originalTemplate,
            templateSnapshotOrigin: "selected",
          },
        }],
      } as any);
      vi.mocked(prisma.documentSnapshot.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.documentSnapshot.create).mockResolvedValue({} as any);
      vi.mocked(prisma.document.update).mockResolvedValue(mockQuotationA1);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001", {
        method: "PATCH",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ notes: "Updated notes" }),
      });

      const res = await updateQuotation(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });

      expect(res.status).toBe(200);
      expect(prisma.documentSnapshot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contentJson: expect.objectContaining({
              templateSnapshotOrigin: "selected",
              template: expect.objectContaining({
                version: 3,
                imageFilename: "quotation-template.pdf",
              }),
            }),
          }),
        })
      );
    });
  });

  describe("GET /api/v1/quotations/[id]", () => {
    it("returns single quotation with line items for tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockQuotationA1);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getQuotation(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.id).toBe("doc_qtn_001");
      expect(data.data.items).toHaveLength(1);
      expect(data.data.templateSnapshotReliable).toBe(true);
    });

    it("marks a historical quotation without a template snapshot as unverifiable", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        templateId: "11111111-1111-4111-8111-111111111111",
        template: { id: "11111111-1111-4111-8111-111111111111", title: "Current template" },
        snapshots: [],
      } as any);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });
      const res = await getQuotation(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.templateSnapshotAvailable).toBe(false);
      expect(data.data.templateSnapshotReliable).toBe(false);
    });

    it("enforces tenant isolation: returns 404 for quotation belonging to another tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: { ...mockUserAdminA, organizationId: "org_beta_222" } as any,
        organization: mockOrgB as any,
        session: { id: "sess_2" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getQuotation(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });
  });

  describe("POST /api/v1/quotations/[id]/status", () => {
    it("successfully transitions from DRAFT to SENT", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockQuotationA1);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockQuotationA1,
        status: DocumentStatus.SENT,
        sentAt: new Date(),
      });

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001/status", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "SENT" }),
      });

      const res = await updateStatus(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.status).toBe("SENT");
    });

    it("rejects invalid lifecycle transition (ACCEPTED -> DRAFT) with 400", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      // Existing document is already APPROVED (Accepted)
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        status: DocumentStatus.APPROVED,
      });

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001/status", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ status: "DRAFT" }),
      });

      const res = await updateStatus(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TRANSITION");
    });
  });

  describe("GET /api/v1/quotations/[id]/pdf", () => {
    it("generates and streams valid binary PDF with application/pdf header", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockQuotationA1);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/pdf");
      expect(res.headers.get("Content-Disposition")).toContain("VX-QTN-2026-0001");

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Valid PDF files start with %PDF
      const header = buffer.subarray(0, 5).toString("ascii");
      expect(header).toBe("%PDF-");
    });

    it("does not silently fall back when a saved template asset is missing", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });
      const readAssetSpy = vi.spyOn(uploadModule, "readTenantAsset").mockResolvedValue(null);
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        templateId: "11111111-1111-4111-8111-111111111111",
        snapshots: [{
          contentJson: {
            templateSnapshotOrigin: "selected",
            template: {
              id: "11111111-1111-4111-8111-111111111111",
              title: "Uploaded image",
              version: 1,
              type: "QUOTATION",
              category: "QUOTATION",
              fileSource: "UPLOAD_IMAGE",
              fileUrl:
                "/api/v1/templates/asset/org_alpha_111/quotation-template.png",
              imageUrl: "/template.png",
              imageFilename: "quotation-template.png",
              imageMimeType: "image/png",
              contentSchema: {},
              items: [],
              clauses: [],
            },
          },
        }],
      } as any);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });
      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.code).toBe("TEMPLATE_ASSET_UNAVAILABLE");
      readAssetSpy.mockRestore();
    });

    it("applies the selected uploaded PDF template to the generated quotation", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      const sourceTemplate = await PDFDocument.create();
      sourceTemplate.addPage([595.28, 841.89]).drawText("Original uploaded template");
      vi.spyOn(uploadModule, "readTenantAsset").mockResolvedValue({
        buffer: Buffer.from(await sourceTemplate.save()),
        mimeType: "application/pdf",
        sizeBytes: 1024,
      } as any);
      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        templateId: "11111111-1111-4111-8111-111111111111",
        template: {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Updated template",
          version: 4,
          type: "QUOTATION",
          category: "QUOTATION",
          fileSource: "UPLOAD_PDF",
          fileUrl:
            "/api/v1/templates/asset/org_alpha_111/updated-template.pdf",
          imageUrl: null,
          imageFilename: "updated-template.pdf",
          imageMimeType: "application/pdf",
          contentSchema: { accentColor: "#2563eb" },
          items: [],
          clauses: [],
        },
        snapshots: [{
          contentJson: {
            templateSnapshotOrigin: "selected",
            template: {
              id: "11111111-1111-4111-8111-111111111111",
              title: "Original template",
              version: 3,
              type: "QUOTATION",
              category: "QUOTATION",
              fileSource: "UPLOAD_PDF",
              fileUrl:
                "/api/v1/templates/asset/org_alpha_111/quotation-template.pdf",
              imageUrl: null,
              imageFilename: "template-logo.png",
              imageMimeType: "image/png",
              contentSchema: { accentColor: "#6d28d9" },
              items: [],
              clauses: [],
            },
          },
        }],
      } as any);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });

      expect(res.status).toBe(200);
      expect(uploadModule.readTenantAsset).toHaveBeenCalledWith(
        mockOrgA.id,
        "quotation-template.pdf",
        "template"
      );
      const generatedPdf = await PDFDocument.load(await res.arrayBuffer());
      expect(generatedPdf.getPageCount()).toBe(1);
      vi.mocked(uploadModule.readTenantAsset).mockRestore();
    });

    it("enforces tenant isolation: rejects download of PDF belonging to another tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: { ...mockUserAdminA, organizationId: "org_beta_222" } as any,
        organization: mockOrgB as any,
        session: { id: "sess_2" } as any,
      });

      // findFirst returns null because organizationId doesn't match
      vi.mocked(prisma.document.findFirst).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("generates multi-page quotation PDF with pagination when items exceed single page", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        id: `item_${i + 1}`,
        name: `Professional Deliverable #${i + 1}`,
        description: `Detailed technical specification for milestone deliverable #${i + 1} with extensive descriptive text that exercises line wrapping.`,
        quantity: 1,
        unit: "Milestone",
        rate: 5000,
        discount: 0,
        taxPercent: 18,
        amount: 5900,
        sortOrder: i + 1,
      }));

      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockQuotationA1,
        items: manyItems,
      });

      const req = new Request("http://localhost:3000/api/v1/quotations/doc_qtn_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_qtn_001" }),
      });

      expect(res.status).toBe(200);
      const buffer = Buffer.from(await res.arrayBuffer());
      expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
      // Multi-page document is significantly larger in byte length
      expect(buffer.length).toBeGreaterThan(5000);
    });
  });
});
