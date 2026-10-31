import { prisma } from "@/lib/prisma";
import { requireTenantContext, AuthError } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/organization/team
 *
 * Lists all active and inactive members of the authenticated organization workspace,
 * alongside pending team invitations.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);

    const [members, invitations] = await Promise.all([
      prisma.user.findMany({
        where: { organizationId: tenantId },
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
          createdAt: true,
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      }),
      prisma.teamInvitation.findMany({
        where: {
          organizationId: tenantId,
          status: "pending",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          inviteToken: true,
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return successResponse({
      members,
      invitations,
      totalMembers: members.length,
      totalPendingInvites: invitations.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}
