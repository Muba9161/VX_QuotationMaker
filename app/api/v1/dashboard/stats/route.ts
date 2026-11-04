import { prisma } from "@/lib/prisma";
import { requireTenantContext } from "@/lib/auth/guards";
import { successResponse, handleApiError } from "@/lib/api-response";
import { DocumentStatus } from "@prisma/client";

/**
 * GET /api/v1/dashboard/stats
 * Aggregates real database statistics for Clients, Quotations, and MOUs with strict tenant isolation.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalClients,
      activeClients,
      recentClients,
      quotationStatusCounts,
      quotationValue,
      mouStatusCounts,
      expiringMous,
      totalShares,
      activeShares,
      completedShares,
      totalSignatures,
    ] = await Promise.all([
      prisma.contact.count({
        where: { organizationId: tenantId },
      }),
      prisma.contact.count({
        where: { organizationId: tenantId, status: "ACTIVE" },
      }),
      prisma.contact.count({
        where: {
          organizationId: tenantId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      prisma.document.groupBy({
        by: ["status"],
        where: {
          organizationId: tenantId,
          type: "QUOTATION",
        },
        _count: { _all: true },
      }),
      prisma.document.aggregate({
        where: {
          organizationId: tenantId,
          type: "QUOTATION",
          status: {
            notIn: [DocumentStatus.REVOKED, DocumentStatus.DECLINED, DocumentStatus.EXPIRED],
          },
        },
        _sum: { total: true },
      }),
      prisma.document.groupBy({
        by: ["status"],
        where: {
          organizationId: tenantId,
          type: "MOU",
        },
        _count: { _all: true },
      }),
      prisma.document.count({
        where: {
          organizationId: tenantId,
          type: "MOU",
          expiryDate: { gte: now, lte: thirtyDaysAhead },
          status: { not: DocumentStatus.REVOKED },
        },
      }),
      prisma.documentShare.count({ where: { organizationId: tenantId } }),
      prisma.documentShare.count({ where: { organizationId: tenantId, status: "ACTIVE" } }),
      prisma.documentShare.count({ where: { organizationId: tenantId, status: "COMPLETED" } }),
      prisma.documentSignature.count({ where: { organizationId: tenantId } }),
    ]);

    const quotationCounts = new Map(
      quotationStatusCounts.map(({ status, _count }) => [status, _count._all])
    );
    const mouCounts = new Map(
      mouStatusCounts.map(({ status, _count }) => [status, _count._all])
    );
    const quotationCount = [...quotationCounts.entries()]
      .filter(([status]) => status !== DocumentStatus.REVOKED)
      .reduce((total, [, count]) => total + count, 0);
    const mouCount = [...mouCounts.entries()]
      .filter(([status]) => status !== DocumentStatus.REVOKED)
      .reduce((total, [, count]) => total + count, 0);

    return successResponse({
      clients: {
        total: totalClients,
        active: activeClients,
        recent: recentClients,
      },
      quotations: {
        total: quotationCount,
        draft: quotationCounts.get(DocumentStatus.DRAFT) || 0,
        sent: (quotationCounts.get(DocumentStatus.SENT) || 0) + (quotationCounts.get(DocumentStatus.VIEWED) || 0),
        accepted: quotationCounts.get(DocumentStatus.APPROVED) || 0,
        rejected: quotationCounts.get(DocumentStatus.DECLINED) || 0,
        expired: quotationCounts.get(DocumentStatus.EXPIRED) || 0,
        cancelled: quotationCounts.get(DocumentStatus.REVOKED) || 0,
        totalValue: Math.round(Number(quotationValue._sum.total || 0) * 100) / 100,
      },
      mous: {
        total: mouCount,
        draft: mouCounts.get(DocumentStatus.DRAFT) || 0,
        ready: mouCounts.get(DocumentStatus.PENDING_APPROVAL) || 0,
        sent:
          (mouCounts.get(DocumentStatus.SENT) || 0) +
          (mouCounts.get(DocumentStatus.VIEWED) || 0) +
          (mouCounts.get(DocumentStatus.PENDING_SIGNATURE) || 0),
        signed: mouCounts.get(DocumentStatus.SIGNED) || 0,
        expiring: expiringMous,
        cancelled: mouCounts.get(DocumentStatus.REVOKED) || 0,
      },
      shares: {
        total: totalShares,
        active: activeShares,
        completed: completedShares,
        totalSignatures,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
