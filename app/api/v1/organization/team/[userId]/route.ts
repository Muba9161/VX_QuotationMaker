import { prisma } from "@/lib/prisma";
import {
  requireTenantContext,
  requirePermission,
  requireTrustedOrigin,
  AuthError,
} from "@/lib/auth/guards";
import { updateMemberSchema } from "@/lib/validations/organization";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * PATCH /api/v1/organization/team/[userId]
 *
 * Updates an organization member's role or status.
 * Enforces last-admin protection, prevents self-lockout, and prevents privilege escalation.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    requireTrustedOrigin(req);
    await requirePermission(req, "org:manage_team");
    const { user, tenantId } = await requireTenantContext(req);

    const { userId } = await params;
    const body = await req.json();
    const result = updateMemberSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(result.error.issues)
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, organizationId: tenantId },
    });

    if (!targetUser) {
      return errorResponse("Team member not found in this organization.", "NOT_FOUND", 404);
    }

    const { name, role, status, title, phone } = result.data;

    // Self-modification protection: users cannot demote or deactivate themselves
    if (user.id === userId) {
      if (role && role !== user.role) {
        return errorResponse("You cannot modify your own administrative role.", "BAD_REQUEST", 400);
      }
      if (status && status !== "ACTIVE") {
        return errorResponse("You cannot deactivate or suspend your own account.", "BAD_REQUEST", 400);
      }
    }

    // Last admin protection
    const isDemotingAdmin = role && role !== "ORG_ADMIN" && targetUser.role === "ORG_ADMIN";
    const isDeactivatingAdmin =
      status && status !== "ACTIVE" && targetUser.role === "ORG_ADMIN" && targetUser.status === "ACTIVE";

    if (isDemotingAdmin || isDeactivatingAdmin) {
      const activeAdminCount = await prisma.user.count({
        where: {
          organizationId: tenantId,
          role: "ORG_ADMIN",
          status: "ACTIVE",
        },
      });

      if (activeAdminCount <= 1) {
        return errorResponse(
          "Cannot demote or deactivate the last Organization Administrator.",
          "VALIDATION_ERROR",
          400
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(title !== undefined ? { title: title?.trim() || null } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        phone: true,
        title: true,
        emailVerified: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      actorId: user.id,
      action: "UPDATED",
      resourceType: "user",
      resourceId: userId,
      description: `Updated member ${targetUser.email} (name: ${updatedUser.name}, role: ${updatedUser.role}, status: ${updatedUser.status})`,
      changes: {
        before: { name: targetUser.name, role: targetUser.role, status: targetUser.status },
        after: { name: updatedUser.name, role: updatedUser.role, status: updatedUser.status },
      },
    });

    return successResponse({ member: updatedUser });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/organization/team/[userId]
 *
 * Removes a member from the organization, unlinking their workspace affiliation
 * and revoking active sessions. Enforces last-admin protection.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    requireTrustedOrigin(req);
    await requirePermission(req, "org:manage_team");
    const { user, tenantId } = await requireTenantContext(req);

    const { userId } = await params;

    if (user.id === userId) {
      return errorResponse(
        "You cannot remove your own account from the organization.",
        "BAD_REQUEST",
        400
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, organizationId: tenantId },
    });

    if (!targetUser) {
      return errorResponse("Team member not found in this organization.", "NOT_FOUND", 404);
    }

    // Last admin protection
    if (targetUser.role === "ORG_ADMIN" && targetUser.status === "ACTIVE") {
      const activeAdminCount = await prisma.user.count({
        where: {
          organizationId: tenantId,
          role: "ORG_ADMIN",
          status: "ACTIVE",
        },
      });

      if (activeAdminCount <= 1) {
        return errorResponse(
          "Cannot remove the last Organization Administrator.",
          "VALIDATION_ERROR",
          400
        );
      }
    }

    // Safely disassociate user from organization and revoke active sessions
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: null,
          status: "INACTIVE",
        },
      });

      await tx.session.deleteMany({
        where: { userId },
      });

      await tx.organization.update({
        where: { id: tenantId },
        data: {
          currentUsersCount: { decrement: 1 },
        },
      });
    });

    await recordAuditLog({
      organizationId: tenantId,
      actorId: user.id,
      action: "UPDATED",
      resourceType: "user",
      resourceId: userId,
      description: `Removed member ${targetUser.email} from organization workspace`,
    });

    return successResponse({
      message: `Member ${targetUser.name} was removed from the organization.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}
