/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentStatus, DocumentType } from "@prisma/client";
import { GET as getReports } from "@/app/api/v1/reports/route";
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
    document: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

describe("GET /api/v1/reports", () => {
  const tenantId = "org_alpha_111";
  const signedAt = new Date("2026-10-20T12:00:00.000Z");
  const createdAt = new Date("2026-10-18T12:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-04T12:00:00.000Z"));
    vi.mocked(sessionModule.validateSession).mockResolvedValue({
      user: {
        id: "usr_admin_a",
        organizationId: tenantId,
        role: "ORG_ADMIN",
        name: "Alice Admin",
        email: "alice@example.test",
        isActive: true,
      } as any,
      organization: { id: tenantId, status: "ACTIVE" } as any,
      session: { id: "sess_1" } as any,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns tenant-scoped metrics, dynamic status counts, signing trend and real activities", async () => {
    vi.mocked(prisma.document.groupBy).mockResolvedValue([
      {
        status: DocumentStatus.APPROVED,
        currency: "USD",
        currencySymbol: "$",
        _count: { _all: 2 },
        _sum: { total: 200 },
      },
      {
        status: DocumentStatus.SENT,
        currency: "USD",
        currencySymbol: "$",
        _count: { _all: 1 },
        _sum: { total: 300 },
      },
      {
        status: DocumentStatus.DECLINED,
        currency: "USD",
        currencySymbol: "$",
        _count: { _all: 1 },
        _sum: { total: 100 },
      },
      {
        status: DocumentStatus.REVOKED,
        currency: "USD",
        currencySymbol: "$",
        _count: { _all: 1 },
        _sum: { total: 900 },
      },
    ] as any);
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      {
        month: new Date("2026-10-01T00:00:00.000Z"),
        documentCount: 2,
        averageDays: 1.25,
      },
    ] as any);
    vi.mocked(prisma.document.findMany).mockResolvedValue([
      {
        id: "doc_1",
        title: "Real quotation",
        type: DocumentType.QUOTATION,
        status: DocumentStatus.APPROVED,
        clientName: "Actual Client",
        clientCompany: null,
        currencySymbol: "$",
        total: 200,
        createdAt,
        updatedAt: signedAt,
        signedAt,
        contact: { name: "Actual Client", companyName: null },
      },
      {
        id: "doc_2",
        title: "Real MOU",
        type: DocumentType.MOU,
        status: DocumentStatus.SIGNED,
        clientName: "Actual Partner",
        clientCompany: null,
        currencySymbol: "$",
        total: 0,
        createdAt,
        updatedAt: signedAt,
        signedAt,
        contact: { name: "Actual Partner", companyName: null },
      },
    ] as any);

    const response = await getReports(
      new Request("http://localhost:3000/api/v1/reports?range=Last%2030%20Days", {
        headers: {
          Cookie: "vx_session=valid_token",
          "x-tenant-id": "org_untrusted_override",
        },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.quotationStatus).toEqual({
      accepted: 2,
      pending: 1,
      declined: 1,
      expired: 0,
      total: 4,
    });
    expect(payload.data.metrics).toMatchObject({
      averageSignDays: 1.25,
      signedDocuments: 2,
      acceptanceRate: 50,
      acceptedQuotations: 2,
      eligibleQuotations: 4,
      pipelineByCurrency: [
        { currency: "USD", currencySymbol: "$", amount: 500 },
      ],
      activeQuotations: 1,
    });
    expect(payload.data.signTrend).toHaveLength(2);
    expect(payload.data.signTrend[0]).toMatchObject({
      key: "2026-10",
      averageDays: 1.25,
      documentCount: 2,
    });
    expect(payload.data.recentActivities).toHaveLength(2);
    expect(payload.data.recentActivities[0]).toMatchObject({
      id: "doc_1",
      docName: "Real quotation",
      client: "Actual Client",
      signTime: 2,
    });
    expect(prisma.document.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: tenantId,
          type: DocumentType.QUOTATION,
        }),
      })
    );
    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: tenantId,
          updatedAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
    expect(vi.mocked(prisma.$queryRaw).mock.calls[0]?.[0]).toMatchObject({
      values: expect.arrayContaining([tenantId]),
    });
  });

  it("rejects unsupported ranges instead of silently choosing another period", async () => {
    const response = await getReports(
      new Request("http://localhost:3000/api/v1/reports?range=All%20Time", {
        headers: { Cookie: "vx_session=valid_token" },
      })
    );

    expect(response.status).toBe(400);
    expect(prisma.document.groupBy).not.toHaveBeenCalled();
    expect(prisma.document.findMany).not.toHaveBeenCalled();
  });

  it("returns zero metrics and an empty trend/activity list when the tenant has no documents", async () => {
    vi.mocked(prisma.document.groupBy).mockResolvedValue([] as any);
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as any);
    vi.mocked(prisma.document.findMany).mockResolvedValue([] as any);

    const response = await getReports(
      new Request("http://localhost:3000/api/v1/reports?range=This%20Month", {
        headers: { Cookie: "vx_session=valid_token" },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.metrics).toEqual({
      averageSignDays: null,
      signedDocuments: 0,
      acceptanceRate: null,
      acceptedQuotations: 0,
      eligibleQuotations: 0,
      pipelineByCurrency: [],
      activeQuotations: 0,
    });
    expect(payload.data.quotationStatus).toEqual({
      accepted: 0,
      pending: 0,
      declined: 0,
      expired: 0,
      total: 0,
    });
    expect(payload.data.signTrend).toEqual([
      {
        key: "2026-11",
        label: "Nov",
        averageDays: null,
        documentCount: 0,
      },
    ]);
    expect(payload.data.recentActivities).toEqual([]);
  });
});
