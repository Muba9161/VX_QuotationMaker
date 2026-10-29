import {
  getSessionTokenFromRequest,
  revokeSession,
  clearSessionCookie,
} from "@/lib/auth/session";
import { successResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/auth/logout
 *
 * Revokes the active session from PostgreSQL and expires the HTTP-only cookie.
 */
export async function POST(req: Request) {
  try {
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
    return handleApiError(err, "An error occurred while signing out.");
  }
}

