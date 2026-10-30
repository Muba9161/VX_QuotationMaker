import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit";

/**
 * POST /api/v1/shares/[shareId]/revoke
 * Immediately revokes an active share link, preventing any future access or signing.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    const { shareId } = await params;

    const share = await prisma.documentShare.findFirst({
      where: { id: shareId, organizationId: tenantId },
      include: { document: true },
    });

    if (!share) {
      return errorResponse("Share record not found.", "NOT_FOUND", 404);
    }

    if (share.status === "REVOKED") {
      return successResponse({ message: "Share link is already revoked.", shareId: share.id, status: "REVOKED" });
    }

    const updated = await prisma.documentShare.update({
      where: { id: share.id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    // Record access event
    await prisma.documentAccessEvent.create({
      data: {
        shareId: share.id,
        documentId: share.documentId,
        eventType: "DOCUMENT_REVOKED",
        metadata: { revokedByUserId: user.id },
      },
    });

    // Record organization audit log
    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      action: "REVOKED",
      details: `Share link for document ${share.document.docNumber} revoked (recipient: ${share.recipientEmail})`,
    });

    return successResponse({
      message: "Share link successfully revoked.",
      shareId: updated.id,
      status: updated.status,
      revokedAt: updated.revokedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
