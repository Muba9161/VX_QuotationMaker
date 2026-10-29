import { prisma } from "@/lib/prisma";
import {
  requireTenantContext,
  requirePermission,
  requireTrustedOrigin,
  AuthError,
} from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * DELETE /api/v1/organization/team/invite/[inviteId]
 *
 * Revokes a pending team invitation, preventing it from being redeemed.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    requireTrustedOrigin(req);
    await requirePermission(req, "org:invite_members");
    const { user, tenantId } = await requireTenantContext(req);

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
        `Cannot revoke invitation with status "${invitation.status}".`,
        "BAD_REQUEST",
        400
      );
    }

    await prisma.teamInvitation.update({
      where: { id: inviteId },
      data: { status: "revoked" },
    });

    await recordAuditLog({
      organizationId: tenantId,
      actorId: user.id,
      action: "REVOKED",
      resourceType: "team_invitation",
      resourceId: inviteId,
      description: `Revoked pending invitation for ${invitation.email}`,
    });

    return successResponse({
      message: `Invitation for ${invitation.email} has been revoked.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}
