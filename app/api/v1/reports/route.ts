import { DocumentStatus, DocumentType, Prisma } from "@prisma/client";
import { requireTenantContext } from "@/lib/auth/guards";
import { handleApiError, successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const REPORT_RANGES = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "This Month",
  "This Year",
] as const;

type ReportRange = (typeof REPORT_RANGES)[number];

function getRangeStart(range: ReportRange, now: Date): Date {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (range) {
    case "Last 7 Days":
      start.setUTCDate(start.getUTCDate() - 6);
      return start;
    case "Last 30 Days":
      start.setUTCDate(start.getUTCDate() - 29);
      return start;
    case "Last 90 Days":
      start.setUTCDate(start.getUTCDate() - 89);
      return start;
    case "This Month":
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    case "This Year":
      return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  }
}

function getMonthRange(start: Date, end: Date) {
  const months: { key: string; label: string }[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const lastMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  while (cursor <= lastMonth) {
    months.push({
      key: `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC",
      }).format(cursor),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
}

interface SignTrendRow {
  month: Date;
  documentCount: number;
  averageDays: number | null;
}

const ACTIVE_QUOTATION_STATUSES: DocumentStatus[] = [
  DocumentStatus.DRAFT,
  DocumentStatus.PENDING_APPROVAL,
  DocumentStatus.SENT,
  DocumentStatus.VIEWED,
  DocumentStatus.PENDING_SIGNATURE,
  DocumentStatus.CHANGES_REQUESTED,
];

const ACCEPTED_QUOTATION_STATUSES: DocumentStatus[] = [
  DocumentStatus.APPROVED,
  DocumentStatus.SIGNED,
];

const ELIGIBLE_QUOTATION_STATUSES: DocumentStatus[] = [
  DocumentStatus.SENT,
  DocumentStatus.VIEWED,
  DocumentStatus.PENDING_SIGNATURE,
  DocumentStatus.CHANGES_REQUESTED,
  DocumentStatus.APPROVED,
  DocumentStatus.SIGNED,
  DocumentStatus.DECLINED,
  DocumentStatus.EXPIRED,
];

const PIPELINE_EXCLUDED_STATUSES: DocumentStatus[] = [
  DocumentStatus.REVOKED,
  DocumentStatus.DECLINED,
  DocumentStatus.EXPIRED,
];

/**
 * GET /api/v1/reports?range=Last%2030%20Days
 * Returns report metrics and activity for the authenticated organization only.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const requestedRange = new URL(req.url).searchParams.get("range") || "Last 30 Days";

    if (!REPORT_RANGES.includes(requestedRange as ReportRange)) {
      return errorResponse("Invalid report date range.", "BAD_REQUEST", 400);
    }

    const range = requestedRange as ReportRange;
    const now = new Date();
    const start = getRangeStart(range, now);
    const documentWhere = {
      organizationId: tenantId,
      createdAt: { gte: start, lte: now },
      type: { in: [DocumentType.QUOTATION, DocumentType.MOU] },
    };
    const recentActivityWhere = {
      organizationId: tenantId,
      updatedAt: { gte: start, lte: now },
      type: { in: [DocumentType.QUOTATION, DocumentType.MOU] },
    };

    const [quotationGroups, signTrendRows, recentDocuments] = await Promise.all([
      prisma.document.groupBy({
        by: ["status", "currency", "currencySymbol"],
        where: {
          ...documentWhere,
          type: DocumentType.QUOTATION,
        },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.$queryRaw<SignTrendRow[]>(Prisma.sql`
        SELECT
          date_trunc('month', signed_at) AS month,
          COUNT(*)::int AS "documentCount",
          AVG(EXTRACT(EPOCH FROM (signed_at - created_at)) / 86400.0)::float8 AS "averageDays"
        FROM documents
        WHERE organization_id = ${tenantId}::uuid
          AND type::text IN ('quotation', 'mou')
          AND signed_at >= ${start}
          AND signed_at <= ${now}
          AND signed_at >= created_at
        GROUP BY date_trunc('month', signed_at)
        ORDER BY date_trunc('month', signed_at)
      `),
      prisma.document.findMany({
        where: recentActivityWhere,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 8,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          clientName: true,
          clientCompany: true,
          createdAt: true,
          signedAt: true,
          contact: {
            select: {
              name: true,
              companyName: true,
            },
          },
        },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    let activeQuotations = 0;
    let acceptedQuotations = 0;
    let eligibleQuotations = 0;
    const pipelineByCurrency = new Map<
      string,
      { currency: string; currencySymbol: string; amount: number }
    >();

    for (const group of quotationGroups) {
      const count = group._count._all;
      statusCounts[group.status] = (statusCounts[group.status] || 0) + count;

      if (ACTIVE_QUOTATION_STATUSES.includes(group.status)) {
        activeQuotations += count;
      }
      if (ACCEPTED_QUOTATION_STATUSES.includes(group.status)) {
        acceptedQuotations += count;
      }
      if (ELIGIBLE_QUOTATION_STATUSES.includes(group.status)) {
        eligibleQuotations += count;
      }
      if (!PIPELINE_EXCLUDED_STATUSES.includes(group.status)) {
        const currency = group.currencySymbol || "";
        const key = `${group.currency}\u0000${currency}`;
        const previous = pipelineByCurrency.get(key);
        pipelineByCurrency.set(key, {
          currency: group.currency,
          currencySymbol: currency,
          amount: (previous?.amount || 0) + Number(group._sum.total || 0),
        });
      }
    }

    const chartCounts = {
      accepted:
        (statusCounts[DocumentStatus.APPROVED] || 0) +
        (statusCounts[DocumentStatus.SIGNED] || 0),
      pending: [
        DocumentStatus.DRAFT,
        DocumentStatus.PENDING_APPROVAL,
        DocumentStatus.SENT,
        DocumentStatus.VIEWED,
        DocumentStatus.PENDING_SIGNATURE,
        DocumentStatus.CHANGES_REQUESTED,
      ].reduce((sum, status) => sum + (statusCounts[status] || 0), 0),
      declined: statusCounts[DocumentStatus.DECLINED] || 0,
      expired: statusCounts[DocumentStatus.EXPIRED] || 0,
    };
    const totalQuotations =
      chartCounts.accepted + chartCounts.pending + chartCounts.declined + chartCounts.expired;
    const months = getMonthRange(start, now);
    const trendsByMonth = new Map(
      signTrendRows.map((row) => {
        const monthDate = new Date(row.month);
        const key = `${monthDate.getUTCFullYear()}-${String(
          monthDate.getUTCMonth() + 1
        ).padStart(2, "0")}`;
        return [
          key,
          {
            documentCount: Number(row.documentCount),
            averageDays:
              row.averageDays === null ? null : Number(row.averageDays),
          },
        ];
      })
    );
    const signTrend = months.map((month) => ({
      ...month,
      averageDays: trendsByMonth.get(month.key)?.averageDays ?? null,
      documentCount: trendsByMonth.get(month.key)?.documentCount ?? 0,
    }));
    const signedCount = signTrend.reduce((sum, month) => sum + month.documentCount, 0);
    const averageSignDays =
      signedCount === 0
        ? null
        : signTrend.reduce(
            (sum, month) => sum + (month.averageDays || 0) * month.documentCount,
            0
          ) / signedCount;

    return successResponse({
      range,
      metrics: {
        averageSignDays,
        signedDocuments: signedCount,
        acceptanceRate:
          eligibleQuotations === 0
            ? null
            : (acceptedQuotations / eligibleQuotations) * 100,
        acceptedQuotations,
        eligibleQuotations,
        pipelineByCurrency: [...pipelineByCurrency.values()].sort((a, b) =>
          a.currency.localeCompare(b.currency)
        ),
        activeQuotations,
      },
      quotationStatus: {
        ...chartCounts,
        total: totalQuotations,
      },
      signTrend,
      recentActivities: recentDocuments.map((document) => ({
        id: document.id,
        docName: document.title,
        type: document.type === DocumentType.QUOTATION ? "Quotation" : "MOU",
        client:
          document.clientCompany ||
          document.contact?.companyName ||
          document.contact?.name ||
          document.clientName,
        status: document.status,
        signTime:
          document.signedAt && document.signedAt >= document.createdAt
            ? (document.signedAt.getTime() - document.createdAt.getTime()) /
              (24 * 60 * 60 * 1000)
            : null,
        createdOn: document.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
