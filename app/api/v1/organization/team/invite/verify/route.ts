import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/organization/team/invite/verify?token=...
 *
 * Verifies a team invitation token for the public onboarding / invite redemption page.
 * Returns organization details, invited role, and email without exposing sensitive data.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return errorResponse("Invitation token is required.", "BAD_REQUEST", 400);
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { inviteToken: token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            displayName: true,
            logoUrl: true,
            status: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return errorResponse(
        "Invalid invitation token. The invitation may have been removed.",
        "INVALID_TOKEN",
        404
      );
    }

    if (invitation.status === "accepted") {
      return errorResponse(
        "This invitation has already been accepted. Please sign in to your workspace.",
        "ALREADY_ACCEPTED",
        400
      );
    }

    if (invitation.status === "revoked") {
      return errorResponse(
        "This invitation has been revoked by an administrator.",
        "REVOKED_TOKEN",
        400
      );
    }

    if (new Date() > invitation.expiresAt || invitation.status === "expired") {
      if (invitation.status !== "expired") {
        await prisma.teamInvitation.update({
          where: { id: invitation.id },
          data: { status: "expired" },
        });
      }
      return errorResponse(
        "This invitation link has expired (valid for 7 days). Please request a new invitation.",
        "EXPIRED_TOKEN",
        400
      );
    }

    if (invitation.organization.status !== "ACTIVE") {
      return errorResponse(
        "The inviting organization workspace is currently inactive or suspended.",
        "ORGANIZATION_INACTIVE",
        403
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    return successResponse({
      valid: true,
      email: invitation.email,
      name: (invitation as any).name || existingUser?.name || null,
      role: invitation.role,
      organizationName: invitation.organization.displayName || invitation.organization.name,
      inviterName: invitation.invitedBy?.name || "Your administrator",
      expiresAt: invitation.expiresAt,
      hasExistingAccount: Boolean(existingUser),
      hasPassword: Boolean(existingUser?.passwordHash),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

