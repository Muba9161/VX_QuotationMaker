/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getDashboardStats } from "@/app/api/v1/dashboard/stats/route";
import { GET as getDashboardActivity } from "@/app/api/v1/dashboard/activity/route";
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

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contact: {
      count: vi.fn(),
    },
    document: {
      findMany: vi.fn(),
    },
    platformAuditLog: {
      findMany: vi.fn(),
    },
  },
}));

describe("Phase 3: Real Dashboard Metrics & Activity Feed", () => {
  const mockOrgA = {
    id: "org_alpha_111",
    name: "Alpha Corp",
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

  const origin = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/dashboard/stats", () => {
    it("aggregates real metrics strictly scoped to authenticated tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      // Contact count mocks: total, active, recent
      vi.mocked(prisma.contact.count)
        .mockResolvedValueOnce(25) // total
        .mockResolvedValueOnce(20) // active
        .mockResolvedValueOnce(5); // recent

      // Quotations query mock
      vi.mocked(prisma.document.findMany)
        .mockResolvedValueOnce([
          {
            id: "q_1",
            status: DocumentStatus.APPROVED,
            total: 100000,
            createdAt: new Date(),
            validTill: new Date(),
          },
          {
            id: "q_2",
            status: DocumentStatus.SENT,
            total: 50000,
            createdAt: new Date(),
            validTill: new Date(),
          },
          {
            id: "q_3",
            status: DocumentStatus.DRAFT,
            total: 25000,
            createdAt: new Date(),
            validTill: new Date(),
          },
        ] as any)
        // MOUs query mock
        .mockResolvedValueOnce([
          {
            id: "m_1",
            status: DocumentStatus.SIGNED,
            expiryDate: new Date(Date.now() + 15 * 86400000),
            createdAt: new Date(),
          },
          {
            id: "m_2",
            status: DocumentStatus.DRAFT,
            expiryDate: null,
            createdAt: new Date(),
          },
        ] as any);

      const req = new Request("http://localhost:3000/api/v1/dashboard/stats", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getDashboardStats(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.clients.total).toBe(25);
      expect(data.data.clients.active).toBe(20);
      expect(data.data.clients.recent).toBe(5);

      expect(data.data.quotations.total).toBe(3);
      expect(data.data.quotations.accepted).toBe(1);
      expect(data.data.quotations.sent).toBe(1);
      expect(data.data.quotations.draft).toBe(1);
      expect(data.data.quotations.totalValue).toBe(175000);

      expect(data.data.mous.total).toBe(2);
      expect(data.data.mous.signed).toBe(1);
      expect(data.data.mous.draft).toBe(1);
      expect(data.data.mous.expiring).toBe(1);

      // Verify tenant isolation in queries
      expect(prisma.contact.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: "org_alpha_111" }),
        })
      );
      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: "org_alpha_111", type: "QUOTATION" }),
        })
      );
    });
  });

  describe("GET /api/v1/dashboard/activity", () => {
    it("returns real audit log activities strictly scoped to tenant", async () => {
      vi.mocked(sessionModule.validateSession).mockResolvedValue({
        user: mockUserAdminA as any,
        organization: mockOrgA as any,
        session: { id: "sess_1" } as any,
      });

      vi.mocked(prisma.platformAuditLog.findMany).mockResolvedValue([
        {
          id: "log_1",
          action: "QUOTATION_CREATED",
          details: 'Created quotation VX-QTN-2026-0001 ("Cloud Migration")',
          userName: "Alice Admin",
          createdAt: new Date("2026-10-30T10:00:00Z"),
        },
        {
          id: "log_2",
          action: "CLIENT_CREATED",
          details: 'Created client "Jane Smith"',
          userName: "Alice Admin",
          createdAt: new Date("2026-10-30T09:30:00Z"),
        },
      ] as any);

      const req = new Request("http://localhost:3000/api/v1/dashboard/activity?limit=10", {
        headers: {
          Origin: origin,
          Cookie: "vx_session=valid_token",
        },
      });

      const res = await getDashboardActivity(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].action).toBe("QUOTATION_CREATED");
      expect(data.data[0].userName).toBe("Alice Admin");
      expect(data.data[1].action).toBe("CLIENT_CREATED");
      expect(data.data[1].iconType).toBe("client");

      expect(prisma.platformAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: "org_alpha_111" },
        })
      );
    });
  });
});
