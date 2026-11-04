import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { saveTenantAsset, deleteTenantAsset, UploadError } from "@/lib/storage/upload";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/templates/[id]/image
 *
 * Secure multipart upload for template branding / header image.
 * Validates tenant ownership, image format (PNG, JPG, WebP), 5MB size limit,
 * safely stores asset locally, and associates reference with template.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    const { id } = await params;

    // Verify template existence and organization isolation
    const template = await prisma.template.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!template) {
      return errorResponse("Template not found.", "NOT_FOUND", 404);
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return errorResponse("Invalid multipart form data.", "INVALID_FORM_DATA", 400);
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return errorResponse("No image file was provided.", "FILE_REQUIRED", 400);
    }

    // Save new asset with multi-tenant directory partitioning
    const stored = await saveTenantAsset(tenantId, file, "template");

    // Update template record with image metadata
    const updated = await prisma.template.update({
      where: { id },
      data: {
        imageUrl: stored.publicUrl,
        imageFilename: stored.filename,
        imageMimeType: stored.mimeType,
      },
      select: {
        id: true,
        title: true,
        type: true,
        imageUrl: true,
        imageFilename: true,
        imageMimeType: true,
        updatedAt: true,
      },
    });

    if (template.imageFilename) {
      const linkedDocument = await prisma.document.findFirst({
        where: { templateId: id, organizationId: tenantId },
        select: { id: true },
      });
      if (!linkedDocument) {
        await deleteTenantAsset(tenantId, template.imageFilename, "template");
      }
    }

    await recordAuditLog({
      userId: user.id,
      organizationId: tenantId,
      userName: user.name,
      action: "TEMPLATE_IMAGE_UPLOADED",
      resourceType: "template",
      resourceId: id,
      details: `Uploaded new image for template '${template.title}': ${stored.filename}`,
    });

    return successResponse(
      {
        message: "Template image uploaded successfully.",
        template: updated,
        imageUrl: stored.publicUrl,
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
    return handleApiError(err, "Failed to upload template image.");
  }
}

/**
 * DELETE /api/v1/templates/[id]/image
 *
 * Removes associated template image and cleans up disk asset.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    const { id } = await params;

    const template = await prisma.template.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!template) {
      return errorResponse("Template not found.", "NOT_FOUND", 404);
    }

    if (template.imageFilename) {
      const linkedDocument = await prisma.document.findFirst({
        where: { templateId: id, organizationId: tenantId },
        select: { id: true },
      });
      if (!linkedDocument) {
        await deleteTenantAsset(tenantId, template.imageFilename, "template");
      }
    }

    await prisma.template.update({
      where: { id },
      data: {
        imageUrl: null,
        imageFilename: null,
        imageMimeType: null,
      },
    });

    await recordAuditLog({
      userId: user.id,
      organizationId: tenantId,
      userName: user.name,
      action: "TEMPLATE_IMAGE_REMOVED",
      resourceType: "template",
      resourceId: id,
      details: `Removed image from template '${template.title}'`,
    });

    return successResponse({
      message: "Template image removed successfully.",
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to remove template image.");
  }
}
