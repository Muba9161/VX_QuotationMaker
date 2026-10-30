import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { mouStatusSchema } from "@/lib/validations/mou";
import { normalizeDocumentStatus, validateStatusTransition } from "@/lib/services/lifecycle";
import { recordAuditLog } from "@/lib/audit";
import { DocumentStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/mous/[id]/status
 * Enforces MOU status transitions and lifecycle rules.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const mou = await prisma.document.findFirst({
      where: { id, organizationId: tenantId, type: "MOU" },
    });

    if (!mou) {
      return errorResponse("MOU not found.", "NOT_FOUND", 404);
    }

    const body = await req.json();
    const parse = mouStatusSchema.safeParse(body);
    if (!parse.success) {
      return errorResponse("Valid status is required.", "BAD_REQUEST", 400);
    }

    const targetStatus = normalizeDocumentStatus(parse.data.status);
    const validation = validateStatusTransition("MOU", mou.status, targetStatus);

    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid status transition.", "INVALID_TRANSITION", 400);
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: targetStatus,
        ...(targetStatus === DocumentStatus.SENT && { sentAt: new Date() }),
        ...(targetStatus === DocumentStatus.VIEWED && { viewedAt: new Date() }),
        ...(targetStatus === DocumentStatus.SIGNED && { signedAt: new Date() }),
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "MOU_STATUS_CHANGED",
      resourceType: "mou",
      resourceId: id,
      details: `Changed status of MOU ${mou.docNumber} from ${mou.status} to ${targetStatus}.${parse.data.remarks ? ` Remarks: ${parse.data.remarks}` : ""}`,
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

