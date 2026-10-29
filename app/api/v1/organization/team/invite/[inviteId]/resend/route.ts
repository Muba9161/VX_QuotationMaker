import { prisma } from "@/lib/prisma";
import {
  requireTenantContext,
  requirePermission,
  requireTrustedOrigin,
  AuthError,
} from "@/lib/auth/guards";
import { sendInvitationEmail } from "@/lib/email";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/organization/team/invite/[inviteId]/resend
 *
 * Resends a team invitation email via SMTP and refreshes the 7-day expiration window.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    requireTrustedOrigin(req);
    await requirePermission(req, "org:invite_members");
    const { user, organization, tenantId } = await requireTenantContext(req);

    const { inviteId } = await params;

    const invitation = await prisma.teamInvitation.findFirst({
      where: {
        id: inviteId,
        organizationId: tenantId,
      },
    });

    if (!invitation) {
      return errorResponse("Invitation not found in this organization.", "NOT_FOUND", 404);
    }

    if (invitation.status !== "pending") {
      return errorResponse(
        `Cannot resend invitation with status "${invitation.status}".`,
        "BAD_REQUEST",
        400
      );
    }

    // Refresh expiration to 7 days from now
    const refreshedExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updatedInvitation = await prisma.teamInvitation.update({
      where: { id: inviteId },
      data: {
        expiresAt: refreshedExpiresAt,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
      },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite?token=${invitation.inviteToken}`;

    const emailResult = await sendInvitationEmail({
      to: invitation.email,
      organizationName: organization?.name || "your organization",
      role: invitation.role,
      inviteUrl,
      invitedByName: user.name,
    });

    await recordAuditLog({
      organizationId: tenantId,
      actorId: user.id,
      action: "UPDATED",
      resourceType: "team_invitation",
      resourceId: inviteId,
      description: emailResult.success
        ? `Resent invitation email accepted by SMTP server for ${invitation.email}`
        : `Resending invitation email failed for ${invitation.email}: ${emailResult.error || "Unknown error"}`,
    });

    if (!emailResult.success) {
      return errorResponse(
        `Failed to deliver invitation email via SMTP: ${emailResult.error || "Delivery failed"}. The invitation expiry has been refreshed to 7 days.`,
        "EMAIL_DELIVERY_FAILED",
        502
      );
    }

    return successResponse({
      invitation: updatedInvitation,
      inviteUrl,
      emailSent: true,
      emailDelivery: {
        attempted: true,
        delivered: true,
        messageId: emailResult.messageId || null,
      },
      message: `Invitation resent to ${invitation.email}.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}

