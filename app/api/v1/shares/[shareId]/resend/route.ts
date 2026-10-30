import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { generateShareToken, hashShareToken } from "@/lib/services/share-token";
import { sendDocumentSharedEmail } from "@/lib/email-templates/sharing-emails";
import { recordAuditLog } from "@/lib/audit";

/**
 * POST /api/v1/shares/[shareId]/resend
 * Resends document share email with a fresh secure token or re-dispatches existing active share.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    const { shareId } = await params;

    const share = await prisma.documentShare.findFirst({
      where: { id: shareId, organizationId: tenantId },
      include: {
        document: {
          include: { organization: true },
        },
      },
    });

    if (!share) {
      return errorResponse("Share record not found.", "NOT_FOUND", 404);
    }

    if (share.status === "REVOKED") {
      return errorResponse("Cannot resend a revoked share link. Create a new share link instead.", "BAD_REQUEST", 400);
    }

    if (share.status === "COMPLETED") {
      return errorResponse("This document has already been signed.", "BAD_REQUEST", 400);
    }

    // Generate fresh 256-bit token
    const rawToken = generateShareToken();
    const tokenHash = hashShareToken(rawToken);

    // If expired, extend expiry by 30 days
    const now = new Date();
    let newExpiresAt = share.expiresAt;
    if (new Date(share.expiresAt) <= now) {
      newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    }

    const updated = await prisma.documentShare.update({
      where: { id: share.id },
      data: {
        tokenHash,
        status: "ACTIVE",
        expiresAt: newExpiresAt,
      },
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shareUrl = `${protocol}://${host}/share/${rawToken}`;

    const emailRes = await sendDocumentSharedEmail({
      to: share.recipientEmail,
      recipientName: share.recipientName,
      organizationName: share.document.organization.name,
      docTitle: share.document.title,
      docNumber: share.document.docNumber,
      docType: share.document.type,
      shareUrl,
      expiresAtFormatted: newExpiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      customMessage: share.customMessage,
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      action: "REMINDER_SENT",
      details: `Resent share invite for ${share.document.docNumber} to ${share.recipientEmail}`,
    });

    return successResponse({
      message: "Invitation link resent successfully.",
      shareId: updated.id,
      rawToken,
      shareUrl,
      emailSent: emailRes.success,
      emailError: emailRes.error,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
