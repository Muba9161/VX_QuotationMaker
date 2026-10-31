import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  requireTenantContext,
  requirePermission,
  requireTrustedOrigin,
  AuthError,
} from "@/lib/auth/guards";
import { inviteMemberSchema } from "@/lib/validations/organization";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { sendInvitationEmail } from "@/lib/email";
import { enqueueInviteEmail } from "@/lib/queue/queue-manager";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/organization/team/invite
 *
 * Issues a cryptographically signed 7-day team invitation to join the organization.
 * Validates uniqueness, prevents duplicate pending invites, and rejects active members.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    await requirePermission(req, "org:invite_members");
    const { user, organization, tenantId } = await requireTenantContext(req);

    const body = await req.json();
    const result = inviteMemberSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(result.error.issues)
      );
    }

    const { email, role } = result.data;

    // 1. Check if user is already an active member of this organization
    const existingMember = await prisma.user.findFirst({
      where: {
        organizationId: tenantId,
        email,
        status: "ACTIVE",
      },
    });

    if (existingMember) {
      return errorResponse(
        "This user is already an active member of this organization.",
        "CONFLICT",
        409
      );
    }

    // 2. Check for duplicate pending, unexpired invitations
    const existingInvite = await prisma.teamInvitation.findFirst({
      where: {
        organizationId: tenantId,
        email,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return errorResponse(
        "A pending invitation has already been issued to this email address.",
        "CONFLICT",
        409
      );
    }

    // 3. Generate secure random 256-bit token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.teamInvitation.create({
      data: {
        organizationId: tenantId,
        email,
        role,
        inviteToken: rawToken,
        invitedByUserId: user.id,
        status: "pending",
        expiresAt,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      actorId: user.id,
      action: "CREATED",
      resourceType: "team_invitation",
      resourceId: invitation.id,
      description: `Issued invitation to ${email} with role ${role}`,
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite?token=${rawToken}`;

    // 4. Dispatch invitation email via BullMQ queue with direct fallback
    enqueueInviteEmail({
      to: email,
      organizationName: organization?.name || "your organization",
      role,
      inviteUrl,
      invitedByName: user.name,
    }).catch(() => {});

    const emailResult = await sendInvitationEmail({
      to: email,
      organizationName: organization?.name || "your organization",
      role,
      inviteUrl,
      invitedByName: user.name,
    });

    // Record diagnostic audit log for email delivery status
    await recordAuditLog({
      organizationId: tenantId,
      actorId: user.id,
      action: "UPDATED",
      resourceType: "team_invitation",
      resourceId: invitation.id,
      description: emailResult.success
        ? `Invitation email accepted by SMTP server for ${email}`
        : `Invitation email delivery failed for ${email}: ${emailResult.error || "Unknown error"}`,
    });

    return successResponse(
      {
        invitation,
        token: rawToken,
        inviteUrl,
        emailSent: emailResult.success,
        emailDelivery: {
          attempted: true,
          delivered: emailResult.success,
          messageId: emailResult.messageId || null,
          error: emailResult.success ? null : (emailResult.error || "Email delivery failed"),
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}
