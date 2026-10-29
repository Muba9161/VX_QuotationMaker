import { authenticateRequest, AuthError } from "@/lib/auth/guards";
import {
  toSafeUser,
  toSafeOrganization,
  getRolePermissions,
} from "@/lib/auth/permissions";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/auth/me
 *
 * Returns the currently authenticated user's profile, active organization context,
 * and authoritative server-side permissions.
 */
export async function GET(req: Request) {
  try {
    const { user, organization } = await authenticateRequest(req);

    return successResponse({
      user: toSafeUser(user),
      organization: organization ? toSafeOrganization(organization) : null,
      permissions: getRolePermissions(user.role),
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to retrieve session profile.");
  }
}

