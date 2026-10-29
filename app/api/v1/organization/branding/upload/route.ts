import { prisma } from "@/lib/prisma";
import { requireTenantContext, requirePermission, requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { saveTenantAsset, UploadError } from "@/lib/storage/upload";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/organization/branding/upload
 *
 * Secure multipart file upload for organization branding assets (logo, letterhead background).
 * Enforces MIME-type validation, 5MB limit, unguessable filenames, and local disk storage.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    await requirePermission(req, "org:manage_branding");

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return errorResponse("Invalid multipart form data.", "INVALID_FORM_DATA", 400);
    }

    const file = formData.get("file");
    const categoryRaw = formData.get("category");
    const category = categoryRaw === "letterhead" ? "letterhead" : "logo";

    if (!file || !(file instanceof File)) {
      return errorResponse("No file was uploaded.", "FILE_REQUIRED", 400);
    }

    // Save asset to local filesystem storage with path traversal checks
    const stored = await saveTenantAsset(tenantId, file, category);

    // Persist asset URL to organization model
    await prisma.organization.update({
      where: { id: tenantId },
      data: category === "letterhead" ? { letterheadUrl: stored.publicUrl } : { logoUrl: stored.publicUrl },
    });

    // Record Audit Log
    await recordAuditLog({
      userId: user.id,
      organizationId: tenantId,
      userName: user.name,
      action: category === "letterhead" ? "LETTERHEAD_UPLOADED" : "LOGO_UPLOADED",
      details: `Uploaded new ${category} asset: ${stored.filename} (${(stored.sizeBytes / 1024).toFixed(1)} KB)`,
      ipAddress: req.headers.get("x-real-ip") || null,
    });

    return successResponse(
      {
        message: `${category === "letterhead" ? "Letterhead" : "Logo"} uploaded successfully.`,
        assetUrl: stored.publicUrl,
        filename: stored.filename,
        sizeBytes: stored.sizeBytes,
      },
      201
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    if (err instanceof UploadError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to upload branding asset.");
  }
}

