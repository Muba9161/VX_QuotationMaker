import {
  getSessionTokenFromRequest,
  revokeSession,
  clearSessionCookie,
} from "@/lib/auth/session";
import { requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/auth/logout
 *
 * Revokes the active session from PostgreSQL and expires the HTTP-only cookie.
 * Validates request origin to prevent cross-site logout CSRF.
 */
export async function POST(req: Request) {
  try {
    // Validate Origin/CSRF
    requireTrustedOrigin(req);

    const rawToken = getSessionTokenFromRequest(req);

    if (rawToken) {
      await revokeSession(rawToken).catch(() => {});
    }

    const res = successResponse({
      message: "Successfully signed out.",
    });

    // Clear session cookie
    clearSessionCookie(res);

    return res;
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "An error occurred while signing out.");
  }
}
