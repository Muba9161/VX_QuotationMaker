import { requireTenantContext, AuthError } from "@/lib/auth/guards";
import { getTenantRecipients } from "@/lib/bulk-email/bulk-email-service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/emails/recipients
 *
 * Retrieves eligible client contacts for the authenticated organization.
 * Strictly scoped to the requesting tenant.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);

    const recipients = await getTenantRecipients(tenantId);

    return successResponse({ recipients });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error, "Failed to retrieve organization recipients");
  }
}

