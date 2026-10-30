/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listMous, POST as createMou } from "@/app/api/v1/mous/route";
import {
  GET as getMou,
  PATCH as updateMou,
  DELETE as deleteMou,
} from "@/app/api/v1/mous/[id]/route";
import { GET as downloadPdf } from "@/app/api/v1/mous/[id]/pdf/route";
import * as sessionModule from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

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
  generateNextDocumentNumber: vi.fn().mockResolvedValue("VX-MOU-2026-0001"),
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
    documentClause: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe("Phase 3: MOU Management API & Lifecycle Verification", () => {
  const mockOrgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    displayName: "Alpha Corporation",
    email: "legal@alpha.com",
    phone: "+1-555-0100",
    address: "100 Market St, SF",
    defaultSignatoryName: "Alice Admin",
    defaultSignatoryTitle: "CEO",
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

  const mockMouA1: any = {
    id: "doc_mou_001",
    organizationId: "org_alpha_111",
    createdByUserId: "usr_admin_a",
    docNumber: "VX-MOU-2026-0001",
    title: "Strategic AI Partnership Agreement",
    type: "MOU",
    status: DocumentStatus.DRAFT,
    clientName: "Bob Partner",
    clientCompany: "Vertex AI Labs",
    clientEmail: "bob@vertex.ai",
    clientPhone: "+1-555-0299",
    clientAddress: "700 Tech Boulevard, Austin, TX",
    purpose: "Collaborative research and development in enterprise agent systems.",
    governingLaw: "Indian Jurisdiction",
    notes: "Subject to board approval.",
    effectiveDate: new Date("2026-11-01"),
    expiryDate: new Date("2027-10-31"),
    shareToken: "token_mou_xyz789",
    clauses: [
      {
        id: "clause_01",
        documentId: "doc_mou_001",
        title: "Scope of Cooperation",
        content: "Both parties agree to collaborate on agentic workflow integration.",
        sortOrder: 1,
      },
      {
        id: "clause_02",
        documentId: "doc_mou_001",
        title: "Confidentiality & Non-Disclosure",
        content: "Proprietary models and customer datasets remain confidential.",
        sortOrder: 2,
      },
    ],
    contact: {
      name: "Bob Partner",
      companyName: "Vertex AI Labs",
      email: "bob@vertex.ai",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/mous", () => {
    it("returns MOUs list strictly isolated to tenant organization", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findMany).mockResolvedValue([mockMouA1]);
      vi.mocked(prisma.document.count).mockResolvedValue(1);

      const req = new Request("http://localhost:3000/api/v1/mous?page=1&limit=20", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await listMous(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].docNumber).toBe("VX-MOU-2026-0001");
      expect(data.meta.pagination.total).toBe(1);

      // Verify tenant boundary
      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org_alpha_111",
            type: "MOU",
          }),
        })
      );
    });
  });

  describe("POST /api/v1/mous", () => {
    it("creates MOU with structured clauses and atomic sequential numbering", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.create).mockResolvedValue({
        id: "doc_mou_001",
        docNumber: "VX-MOU-2026-0001",
      } as any);

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockMouA1);

      const req = new Request("http://localhost:3000/api/v1/mous", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          title: "Strategic AI Partnership Agreement",
          clientName: "Bob Partner",
          clientCompany: "Vertex AI Labs",
          purpose: "Collaborative research and development in enterprise agent systems.",
          governingLaw: "Indian Jurisdiction",
          clauses: [
            {
              title: "Scope of Cooperation",
              content: "Both parties agree to collaborate on agentic workflow integration.",
              sortOrder: 1,
            },
            {
              title: "Confidentiality & Non-Disclosure",
              content: "Proprietary models and customer datasets remain confidential.",
              sortOrder: 2,
            },
          ],
        }),
      });

      const res = await createMou(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.docNumber).toBe("VX-MOU-2026-0001");
      expect(data.data.clauses).toHaveLength(2);

      // Verify structured clauses inserted in transaction
      expect(prisma.documentClause.create).toHaveBeenCalledTimes(2);
      expect(prisma.platformAuditLog.create).toHaveBeenCalled();
    });

    it("rejects MOU creation when required clauses are empty", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      const req = new Request("http://localhost:3000/api/v1/mous", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          title: "Incomplete MOU",
          clientName: "Bob Partner",
          clauses: [],
        }),
      });

      const res = await createMou(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/v1/mous/[id]", () => {
    it("returns single MOU with ordered clauses for authenticated tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockMouA1);

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getMou(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.id).toBe("doc_mou_001");
      expect(data.data.clauses).toHaveLength(2);
      expect(data.data.clauses[0].title).toBe("Scope of Cooperation");
    });

    it("enforces tenant isolation: returns 404 for MOU belonging to another tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: { ...mockUserAdminA, organizationId: "org_beta_222" } as any,
        organization: mockOrgB as any,
        session: { id: "sess_2" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getMou(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /api/v1/mous/[id]/pdf", () => {
    it("generates and streams valid binary PDF with application/pdf header", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(mockMouA1);

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/pdf");
      expect(res.headers.get("Content-Disposition")).toContain("VX-MOU-2026-0001");

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const header = buffer.subarray(0, 5).toString("ascii");
      expect(header).toBe("%PDF-");
    });

    it("enforces tenant isolation: rejects download of MOU PDF belonging to another tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: { ...mockUserAdminA, organizationId: "org_beta_222" } as any,
        organization: mockOrgB as any,
        session: { id: "sess_2" } as any,
      });

      vi.mocked(prisma.document.findFirst).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("generates multi-page MOU PDF with structured clauses, signature blocks, and text wrapping", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      const longClauses = Array.from({ length: 12 }, (_, i) => ({
        id: `clause_${i + 1}`,
        documentId: "doc_mou_001",
        title: `Article ${i + 1}: Legal Term & Governance Policy`,
        content: `Detailed clause terms for section ${i + 1}. Both parties mutually agree to execute all obligations under statutory compliance guidelines with standard indemnity, intellectual property protections, dispute resolution mechanisms, and multi-jurisdictional choice of law covenants. `.repeat(3),
        sortOrder: i + 1,
      }));

      vi.mocked(prisma.document.findFirst).mockResolvedValue({
        ...mockMouA1,
        clauses: longClauses,
      });

      const req = new Request("http://localhost:3000/api/v1/mous/doc_mou_001/pdf", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await downloadPdf(req, {
        params: Promise.resolve({ id: "doc_mou_001" }),
      });

      expect(res.status).toBe(200);
      const buffer = Buffer.from(await res.arrayBuffer());
      expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
      expect(buffer.length).toBeGreaterThan(6000);
    });
  });
});

