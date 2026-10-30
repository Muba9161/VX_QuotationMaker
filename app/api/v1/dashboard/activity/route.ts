import { prisma } from "@/lib/prisma";
import { requireTenantContext } from "@/lib/auth/guards";
import { successResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/dashboard/activity
 * Retrieves recent organization activity events and audit logs from live PostgreSQL records.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 15)));

    const auditLogs = await prisma.platformAuditLog.findMany({
      where: { organizationId: tenantId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        details: true,
        userName: true,
        createdAt: true,
      },
    });

    const activities = auditLogs.map((log) => {
      let iconType = "document";
      if (log.action.startsWith("CLIENT_")) {
        iconType = "client";
      } else if (log.action.startsWith("MOU_")) {
        iconType = "mou";
      } else if (log.action.includes("PDF")) {
        iconType = "pdf";
      } else if (log.action.includes("STATUS")) {
        iconType = "status";
      }

      return {
        id: log.id,
        action: log.action,
        title: formatActionTitle(log.action),
        description: log.details || "",
        userName: log.userName || "User",
        timestamp: log.createdAt.toISOString(),
        iconType,
      };
    });

    return successResponse(activities);
  } catch (error) {
    return handleApiError(error);
  }
}

function formatActionTitle(action: string): string {
  switch (action) {
    case "CLIENT_CREATED":
      return "Client Added";
    case "CLIENT_UPDATED":
      return "Client Updated";
    case "CLIENT_ARCHIVED":
      return "Client Archived";
    case "CLIENT_DELETED":
      return "Client Deleted";
    case "QUOTATION_CREATED":
      return "Quotation Created";
    case "QUOTATION_UPDATED":
      return "Quotation Updated";
    case "QUOTATION_STATUS_CHANGED":
      return "Quotation Status Updated";
    case "QUOTATION_PDF_GENERATED":
      return "Quotation PDF Downloaded";
    case "QUOTATION_CANCELLED":
      return "Quotation Cancelled";
    case "MOU_CREATED":
      return "MOU Created";
    case "MOU_UPDATED":
      return "MOU Updated";
    case "MOU_STATUS_CHANGED":
      return "MOU Status Updated";
    case "MOU_PDF_GENERATED":
      return "MOU PDF Downloaded";
    case "MOU_CANCELLED":
      return "MOU Cancelled";
    case "TEMPLATE_CREATED":
      return "Template Created";
    case "TEMPLATE_UPDATED":
      return "Template Updated";
    case "TEMPLATE_DELETED":
      return "Template Deleted";
    default:
      return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

