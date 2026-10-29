import { prisma } from "@/lib/prisma";
import {
  authenticateRequest,
  requireTrustedOrigin,
  AuthError,
} from "@/lib/auth/guards";
import { setPasswordSchema } from "@/lib/validations/auth";
import { formatZodIssues } from "@/lib/validations/auth";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/auth/set-password
 *
 * Allows authenticated users (especially users authenticated via Google OAuth
 * who do not currently have a password) to securely set or update their account password.
 *
 * Security:
 * - Validates CSRF/trusted origin.
 * - Authenticates the request via session cookie (never allows targeting arbitrary emails).
 * - If user already has an established password, requires and verifies current password.
 * - If user authenticated via Google OAuth with no established password (passwordHash === null),
 *   allows establishing the initial password without requiring current password.
 * - Validates strict password complexity rules.
 * - Hashes password using bcrypt with 12 salt rounds.
 * - Never returns password hashes or logs plaintext passwords.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { user } = await authenticateRequest(req);

    const body = await req.json();
    const result = setPasswordSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(result.error.issues)
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Fetch fresh user record from PostgreSQL to inspect current passwordHash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, passwordHash: true, organizationId: true },
    });

    if (!dbUser) {
      return errorResponse("User account not found.", "NOT_FOUND", 404);
    }

    // If user already has a password, verify currentPassword
    if (dbUser.passwordHash) {
      if (!currentPassword) {
        return errorResponse(
          "Current password is required to change your existing password.",
          "BAD_REQUEST",
          400
        );
      }

      const isCurrentValid = await verifyPassword(currentPassword, dbUser.passwordHash);
      if (!isCurrentValid) {
        return errorResponse(
          "Current password is incorrect.",
          "INVALID_CREDENTIALS",
          400
        );
      }
    }

    // Validate password complexity
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return errorResponse(
        strength.reason || "Password does not meet complexity requirements.",
        "WEAK_PASSWORD",
        400
      );
    }

    // Securely hash new password
    const passwordHash = await hashPassword(newPassword);

    // Atomically persist new password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Record audit log
    await recordAuditLog({
      organizationId: dbUser.organizationId,
      actorId: user.id,
      action: "UPDATED",
      resourceType: "user",
      resourceId: user.id,
      description: dbUser.passwordHash
        ? "User updated their account password"
        : "User established a VorldX account password (previously Google-only)",
    });

    return successResponse({
      message: dbUser.passwordHash
        ? "Your password has been updated successfully."
        : "Your password has been set successfully. You can now sign in using your email and password as well as Google.",
      hasPassword: true,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error);
  }
}

