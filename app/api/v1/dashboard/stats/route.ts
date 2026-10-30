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
      // 1. Client counts
      totalClients,
      activeClients,
      recentClients,

      // 2. Quotation counts & totals
      allQuotations,

      // 3. MOU counts
      allMous,
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

      // Quotations query
      prisma.document.findMany({
        where: {
          organizationId: tenantId,
          type: "QUOTATION",
        },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          validTill: true,
        },
      }),

      // MOUs query
      prisma.document.findMany({
        where: {
          organizationId: tenantId,
          type: "MOU",
        },
        select: {
          id: true,
          status: true,
          expiryDate: true,
          createdAt: true,
        },
      }),
    ]);

    // Aggregate Quotations
    let draftQuotations = 0;
    let sentQuotations = 0;
    let acceptedQuotations = 0;
    let rejectedQuotations = 0;
    let expiredQuotations = 0;
    let cancelledQuotations = 0;
    let totalQuotationValue = 0;

    for (const q of allQuotations) {
      const numTotal = Number(q.total);

      // Only active and accepted proposals contribute to live pipeline value
      if (q.status !== DocumentStatus.REVOKED && q.status !== DocumentStatus.DECLINED) {
        totalQuotationValue += numTotal;
      }

      switch (q.status) {
        case DocumentStatus.DRAFT:
          draftQuotations++;
          break;
        case DocumentStatus.SENT:
        case DocumentStatus.VIEWED:
          sentQuotations++;
          break;
        case DocumentStatus.APPROVED:
          acceptedQuotations++;
          break;
        case DocumentStatus.DECLINED:
          rejectedQuotations++;
          break;
        case DocumentStatus.EXPIRED:
          expiredQuotations++;
          break;
        case DocumentStatus.REVOKED:
          cancelledQuotations++;
          break;
        default:
          break;
      }
    }

    // Aggregate MOUs
    let draftMous = 0;
    let readyMous = 0;
    let sentMous = 0;
    let signedMous = 0;
    let expiringMous = 0;
    let cancelledMous = 0;

    for (const m of allMous) {
      switch (m.status) {
        case DocumentStatus.DRAFT:
          draftMous++;
          break;
        case DocumentStatus.PENDING_APPROVAL:
          readyMous++;
          break;
        case DocumentStatus.SENT:
        case DocumentStatus.VIEWED:
        case DocumentStatus.PENDING_SIGNATURE:
          sentMous++;
          break;
        case DocumentStatus.SIGNED:
          signedMous++;
          break;
        case DocumentStatus.REVOKED:
          cancelledMous++;
          break;
        default:
          break;
      }

      if (
        m.expiryDate &&
        m.expiryDate >= now &&
        m.expiryDate <= thirtyDaysAhead &&
        m.status !== DocumentStatus.REVOKED
      ) {
        expiringMous++;
      }
    }

    // Phase 4: Document Sharing & Digital Signatures counts
    let totalShares = 0;
    let activeShares = 0;
    let completedShares = 0;
    let totalSignatures = 0;

    if (prisma.documentShare?.count) {
      try {
        [totalShares, activeShares, completedShares] = await Promise.all([
          prisma.documentShare.count({ where: { organizationId: tenantId } }),
          prisma.documentShare.count({ where: { organizationId: tenantId, status: "ACTIVE" } }),
          prisma.documentShare.count({ where: { organizationId: tenantId, status: "COMPLETED" } }),
        ]);
      } catch {}
    }

    if (prisma.documentSignature?.count) {
      try {
        totalSignatures = await prisma.documentSignature.count({ where: { organizationId: tenantId } });
      } catch {}
    }

    return successResponse({
      clients: {
        total: totalClients,
        active: activeClients,
        recent: recentClients,
      },
      quotations: {
        total: allQuotations.filter((q) => q.status !== DocumentStatus.REVOKED).length,
        draft: draftQuotations,
        sent: sentQuotations,
        accepted: acceptedQuotations,
        rejected: rejectedQuotations,
        expired: expiredQuotations,
        cancelled: cancelledQuotations,
        totalValue: Math.round(totalQuotationValue * 100) / 100,
      },
      mous: {
        total: allMous.filter((m) => m.status !== DocumentStatus.REVOKED).length,
        draft: draftMous,
        ready: readyMous,
        sent: sentMous,
        signed: signedMous,
        expiring: expiringMous,
        cancelled: cancelledMous,
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

