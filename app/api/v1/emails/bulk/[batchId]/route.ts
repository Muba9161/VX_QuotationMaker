import { requireTenantContext, AuthError } from "@/lib/auth/guards";
import { getBatchDetails } from "@/lib/bulk-email/bulk-email-service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ batchId: string }>;
}

/**
 * GET /api/v1/emails/bulk/[batchId]
 * Retrieves specific batch status, progress breakdown, and recipient delivery logs.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { batchId } = await params;

    if (!batchId) {
      return errorResponse("Batch ID is required.", "INVALID_INPUT", 400);
    }

    const batch = await getBatchDetails(batchId, tenantId);

    if (!batch) {
      return errorResponse("Bulk email batch not found.", "NOT_FOUND", 404);
    }

    return successResponse({ batch });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error, "Failed to retrieve batch details");
  }
}

