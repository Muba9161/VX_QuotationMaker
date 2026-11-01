import { requireTenantContext, requirePermission, requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { createBulkEmailBatchSchema } from "@/lib/validations/bulk-email";
import { formatZodIssues } from "@/lib/validations/auth";
import {
  createBulkEmailBatch,
  getTenantBatches,
} from "@/lib/bulk-email/bulk-email-service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/emails/bulk
 * Lists recent bulk email batches for the requesting tenant.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const result = await getTenantBatches(tenantId, page, limit);

    return successResponse(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    return handleApiError(error, "Failed to retrieve bulk email batches");
  }
}

/**
 * POST /api/v1/emails/bulk
 * Validates, records, and enqueues a bulk email campaign.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    await requirePermission(req, "doc:send");
    const tenantCtx = await requireTenantContext(req);

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return errorResponse("Malformed JSON request body.", "INVALID_INPUT", 400);
    }

    const parseResult = createBulkEmailBatchSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return errorResponse(
        "Validation failed for bulk email campaign.",
        "VALIDATION_ERROR",
        422,
        formatZodIssues(parseResult.error.issues)
      );
    }

    const { subject, message, recipients } = parseResult.data;

    const batch = await createBulkEmailBatch({
      tenantId: tenantCtx.tenantId,
      senderUserId: tenantCtx.user.id,
      senderUserName: tenantCtx.user.name,
      subject,
      message,
      recipients,
    });

    return successResponse(
      { batch, message: `Bulk email batch queued successfully for ${batch.totalRecipients} recipients.` },
      201
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.code, error.status);
    }
    if (error instanceof Error && error.message.includes("Unauthorized cross-tenant")) {
      return errorResponse(error.message, "FORBIDDEN", 403);
    }
    return handleApiError(error, "Failed to process bulk email batch");
  }
}
