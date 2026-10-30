import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { quotationStatusSchema } from "@/lib/validations/quotation";
import { normalizeDocumentStatus, validateStatusTransition } from "@/lib/services/lifecycle";
import { recordAuditLog } from "@/lib/audit";
import { DocumentStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/quotations/[id]/status
 * Enforces quotation status transitions and lifecycle rules.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const quotation = await prisma.document.findFirst({
      where: { id, organizationId: tenantId, type: "QUOTATION" },
    });

    if (!quotation) {
      return errorResponse("Quotation not found.", "NOT_FOUND", 404);
    }

    const body = await req.json();
    const parse = quotationStatusSchema.safeParse(body);
    if (!parse.success) {
      return errorResponse("Valid status is required.", "BAD_REQUEST", 400);
    }

    const targetStatus = normalizeDocumentStatus(parse.data.status);
    const validation = validateStatusTransition("QUOTATION", quotation.status, targetStatus);

    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid status transition.", "INVALID_TRANSITION", 400);
    }

    const timestampUpdates: Record<string, Date> = {};
    if (targetStatus === DocumentStatus.SENT && !quotation.sentAt) {
      timestampUpdates.sentAt = new Date();
    } else if (targetStatus === DocumentStatus.VIEWED && !quotation.viewedAt) {
      timestampUpdates.viewedAt = new Date();
    } else if (targetStatus === DocumentStatus.APPROVED && !quotation.approvedAt) {
      timestampUpdates.approvedAt = new Date();
      timestampUpdates.approvedByUserId = user.id as unknown as Date; // handled below
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: targetStatus,
        ...(targetStatus === DocumentStatus.APPROVED && {
          approvedAt: new Date(),
          approvedByUserId: user.id,
        }),
        ...(targetStatus === DocumentStatus.SENT && { sentAt: new Date() }),
        ...(targetStatus === DocumentStatus.VIEWED && { viewedAt: new Date() }),
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "QUOTATION_STATUS_CHANGED",
      resourceType: "quotation",
      resourceId: id,
      details: `Changed status of quotation ${quotation.docNumber} from ${quotation.status} to ${targetStatus}.${parse.data.remarks ? ` Remarks: ${parse.data.remarks}` : ""}`,
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

