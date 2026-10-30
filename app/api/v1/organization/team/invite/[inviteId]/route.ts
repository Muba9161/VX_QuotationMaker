import { prisma } from "@/lib/prisma";
import {
  requireTenantContext,
  requirePermission,
  requireTrustedOrigin,
  AuthError,
} from "@/lib/auth/guards";
import { updateInviteSchema } from "@/lib/validations/organization";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * PATCH /api/v1/organization/team/invite/[inviteId]
 *
 * Updates a pending team invitation (e.g. role).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    requireTrustedOrigin(req);
    await requirePermission(req, "org:invite_members");
    const { user, tenantId } = await requireTenantContext(req);

    const { inviteId } = await params;
    const body = await req.json();
    const result = updateInviteSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(result.error.issues)
      );
    }

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
        `Cannot edit invitation with status "${invitation.status}".`,
        "BAD_REQUEST",
        400
      );
    }

    const updatedInvitation = await prisma.teamInvitation.update({
      where: { id: inviteId },
      data: {
        role: result.data.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        inviteToken: true,
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      actorId: user.id,
      action: "UPDATED",
      resourceType: "team_invitation",
      resourceId: inviteId,
      description: `Updated invitation role for ${invitation.email} to ${result.data.role}`,
    });

    return successResponse({ invitation: updatedInvitation });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}

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
