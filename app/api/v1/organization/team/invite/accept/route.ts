import { prisma } from "@/lib/prisma";
import { requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { acceptInviteSchema } from "@/lib/validations/organization";
import { formatZodIssues } from "@/lib/validations/auth";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/organization/team/invite/accept
 *
 * Redeems a valid 7-day team invitation. If the invitee already has an account,
 * their tenant affiliation and role are updated. If new, their credentials are validated,
 * password securely hashed, and account created.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);

    const body = await req.json();
    const result = acceptInviteSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(result.error.issues)
      );
    }

    const { token, name, password } = result.data;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { inviteToken: token },
    });

    if (!invitation || invitation.status !== "pending") {
      return errorResponse(
        "Invalid or expired invitation token.",
        "INVALID_TOKEN",
        400
      );
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return errorResponse(
        "This invitation has expired. Please request a new one.",
        "EXPIRED_TOKEN",
        400
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    let userId: string;

    if (existingUser) {
      // User exists — affiliate with organization and assign role
      const updated = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            organizationId: invitation.organizationId,
            role: invitation.role,
            status: "ACTIVE",
            emailVerified: true,
          },
        });

        await tx.teamInvitation.update({
          where: { id: invitation.id },
          data: {
            status: "accepted",
            acceptedAt: new Date(),
          },
        });

        await tx.organization.update({
          where: { id: invitation.organizationId },
          data: { currentUsersCount: { increment: 1 } },
        });

        return u;
      });

      userId = updated.id;
    } else {
      // New user — requires name and password
      if (!name || !password) {
        return errorResponse(
          "Name and password are required to register your new account.",
          "BAD_REQUEST",
          400
        );
      }

      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.valid) {
        return errorResponse(
          passwordCheck.reason ?? "Password does not meet complexity requirements.",
          "WEAK_PASSWORD",
          400
        );
      }

      const passwordHash = await hashPassword(password);

      const created = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email: invitation.email,
            name: name.trim(),
            passwordHash,
            role: invitation.role,
            organizationId: invitation.organizationId,
            status: "ACTIVE",
            emailVerified: true,
          },
        });

        await tx.teamInvitation.update({
          where: { id: invitation.id },
          data: {
            status: "accepted",
            acceptedAt: new Date(),
          },
        });

        await tx.organization.update({
          where: { id: invitation.organizationId },
          data: { currentUsersCount: { increment: 1 } },
        });

        return u;
      });

      userId = created.id;
    }

    await recordAuditLog({
      organizationId: invitation.organizationId,
      actorId: userId,
      action: "UPDATED",
      resourceType: "user",
      resourceId: userId,
      description: `User ${invitation.email} accepted invitation and joined organization`,
    });

    return successResponse({
      message: "Invitation accepted successfully. You may now sign in.",
      email: invitation.email,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}
