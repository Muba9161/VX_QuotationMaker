/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listClients, POST as createClient } from "@/app/api/v1/clients/route";
import {
  GET as getClient,
  PATCH as updateClient,
  DELETE as deleteClient,
} from "@/app/api/v1/clients/[id]/route";
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
    contact: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe("Phase 3: Client Management API & Tenant Isolation", () => {
  const mockOrgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
    slug: "alpha-corp",
    status: "ACTIVE",
  };

  const mockOrgB = {
    id: "org_beta_222",
    name: "Beta Industries",
    slug: "beta-industries",
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

  const mockUserMemberA = {
    id: "usr_member_a",
    organizationId: "org_alpha_111",
    role: "MEMBER",
    name: "Mark Member",
    email: "mark@alpha.com",
    isActive: true,
  };

  const mockClientA1 = {
    id: "cnt_101",
    organizationId: "org_alpha_111",
    name: "John Doe",
    companyName: "Acme Supplies",
    email: "john@acme.com",
    phone: "+1-555-0100",
    address: "123 Market St",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    postalCode: "94103",
    website: "https://acme.com",
    taxId: "TAX-12345",
    notes: "Key client",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/clients", () => {
    it("rejects unauthenticated requests with 401", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/clients", {
        headers: { Origin: origin },
      });

      const res = await listClients(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("lists clients strictly scoped to the authenticated tenant organization", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.contact.findMany).mockResolvedValue([mockClientA1 as any]);
      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const req = new Request("http://localhost:3000/api/v1/clients?page=1&limit=10", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await listClients(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe("John Doe");
      expect(data.meta.pagination.total).toBe(1);

      // Verify the query where clause enforces organizationId
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org_alpha_111",
          }),
        })
      );
    });

    it("applies search filtering when search query is provided", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.contact.findMany).mockResolvedValue([]);
      vi.mocked(prisma.contact.count).mockResolvedValue(0);

      const req = new Request("http://localhost:3000/api/v1/clients?search=Acme", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      await listClients(req);

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org_alpha_111",
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: "Acme", mode: "insensitive" } }),
            ]),
          }),
        })
      );
    });
  });

  describe("POST /api/v1/clients", () => {
    it("rejects untrusted CSRF origins with 403", async () => {
      const req = new Request("http://localhost:3000/api/v1/clients", {
        method: "POST",
        headers: {
          Origin: "https://evil-attacker.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Malicious Client" }),
      });

      const res = await createClient(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error.code).toBe("CSRF_ORIGIN_REJECTED");
    });

    it("rejects creation if name is missing", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      const req = new Request("http://localhost:3000/api/v1/clients", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ companyName: "Nameless Co." }),
      });

      const res = await createClient(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects duplicate email within the same organization with 409", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      // Existing contact with same email in org_alpha_111
      vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockClientA1 as any);

      const req = new Request("http://localhost:3000/api/v1/clients", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          name: "Another Person",
          email: "john@acme.com",
        }),
      });

      const res = await createClient(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.code).toBe("DUPLICATE_CLIENT");
      expect(data.error.message).toContain("already exists");
    });

    it("successfully creates client with tenant isolation and audit logging", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.contact.create).mockResolvedValue(mockClientA1 as any);

      const req = new Request("http://localhost:3000/api/v1/clients", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({
          name: "John Doe",
          companyName: "Acme Supplies",
          email: "john@acme.com",
          phone: "+1-555-0100",
        }),
      });

      const res = await createClient(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.name).toBe("John Doe");

      // Verify organizationId was forced to the session tenant, not client request
      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: "org_alpha_111",
          createdByUserId: "usr_admin_a",
          name: "John Doe",
        }),
      });

      expect(prisma.platformAuditLog.create).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/clients/[id]", () => {
    it("returns client details with document counts for authenticated org", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserMemberA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.contact.findFirst).mockResolvedValue({
        ...mockClientA1,
        documents: [],
      } as any);

      const req = new Request("http://localhost:3000/api/v1/clients/cnt_101", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getClient(req, {
        params: Promise.resolve({ id: "cnt_101" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.id).toBe("cnt_101");
      expect(data.data.quotationsCount).toBe(0);
    });

    it("enforces tenant isolation: returns 404 if client belongs to a different org", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: { ...mockUserAdminA, organizationId: "org_beta_222" } as any,
        organization: mockOrgB as any,
        session: { id: "sess_2" } as any,
      });

      // Query checks organizationId: "org_beta_222", returns null
      vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/v1/clients/cnt_101", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getClient(req, {
        params: Promise.resolve({ id: "cnt_101" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /api/v1/clients/[id]", () => {
    it("updates client successfully and returns updated entity", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockClientA1 as any);
      vi.mocked(prisma.contact.update).mockResolvedValue({
        ...mockClientA1,
        phone: "+1-555-9999",
      } as any);

      const req = new Request("http://localhost:3000/api/v1/clients/cnt_101", {
        method: "PATCH",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ phone: "+1-555-9999" }),
      });

      const res = await updateClient(req, {
        params: Promise.resolve({ id: "cnt_101" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.phone).toBe("+1-555-9999");
    });

    it("prevents changing email to one already in use in the same org", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      // Target client exists
      vi.mocked(prisma.contact.findFirst)
        .mockResolvedValueOnce(mockClientA1 as any) // existing client check
        .mockResolvedValueOnce({ id: "cnt_other", email: "existing@acme.com" } as any); // duplicate check

      const req = new Request("http://localhost:3000/api/v1/clients/cnt_101", {
        method: "PATCH",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          Cookie: "vx_session=valid_token",
        },
        body: JSON.stringify({ email: "existing@acme.com" }),
      });

      const res = await updateClient(req, {
        params: Promise.resolve({ id: "cnt_101" }),
      });
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.code).toBe("DUPLICATE_CLIENT");
    });
  });

  describe("DELETE /api/v1/clients/[id]", () => {
    it("soft-archives client when linked documents exist", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.contact.findFirst).mockResolvedValue({
        ...mockClientA1,
        _count: { documents: 2 },
      } as any);

      vi.mocked(prisma.contact.update).mockResolvedValue({
        ...mockClientA1,
        status: "ARCHIVED",
      } as any);

      const req = new Request("http://localhost:3000/api/v1/clients/cnt_101", {
        method: "DELETE",
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await deleteClient(req, {
        params: Promise.resolve({ id: "cnt_101" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.archived).toBe(true);
      expect(prisma.contact.update).toHaveBeenCalledWith({
        where: { id: "cnt_101" },
        data: { status: "ARCHIVED" },
      });
    });

    it("hard-deletes client when no documents are linked", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.contact.findFirst).mockResolvedValue({
        ...mockClientA1,
        _count: { documents: 0 },
      } as any);

      const req = new Request("http://localhost:3000/api/v1/clients/cnt_101", {
        method: "DELETE",
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await deleteClient(req, {
        params: Promise.resolve({ id: "cnt_101" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.deleted).toBe(true);
      expect(prisma.contact.delete).toHaveBeenCalledWith({
        where: { id: "cnt_101" },
      });
    });
  });
});
