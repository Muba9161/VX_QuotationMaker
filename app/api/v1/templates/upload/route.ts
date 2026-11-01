import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { saveTenantAsset, UploadError } from "@/lib/storage/upload";
import { recordAuditLog } from "@/lib/audit";
import { DocumentType } from "@prisma/client";

/**
 * POST /api/v1/templates/upload
 * Uploads an organization-specific template file (PDF, Word DOCX, PNG, JPG)
 * and registers it in the template catalog.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string)?.trim();
    const category = (formData.get("category") as string)?.toUpperCase() || "QUOTATION";
    const description = (formData.get("description") as string)?.trim() || "";
    const tagsRaw = formData.get("tags") as string | null;

    if (!file) {
      return errorResponse("Template file is required.", "FILE_REQUIRED", 400);
    }

    if (!title || title.length < 2) {
      return errorResponse("Template title must be at least 2 characters.", "INVALID_TITLE", 400);
    }

    // Determine file source based on MIME / extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    let fileSource = "SYSTEM";
    if (ext === "pdf" || file.type === "application/pdf") {
      fileSource = "UPLOAD_PDF";
    } else if (ext === "docx" || ext === "doc" || file.type.includes("word") || file.type.includes("document")) {
      fileSource = "UPLOAD_DOCX";
    } else if (file.type.startsWith("image/")) {
      fileSource = "UPLOAD_IMAGE";
    }

    // Save asset to tenant filesystem storage
    let storedAsset;
    try {
      storedAsset = await saveTenantAsset(tenantId, file, "template");
    } catch (err) {
      if (err instanceof UploadError) {
        return errorResponse(err.message, err.code, err.status);
      }
      throw err;
    }

    // Parse tags if provided
    let tags: string[] = [];
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw);
      } catch {
        tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const docType: DocumentType = category === "MOU" ? DocumentType.MOU : DocumentType.QUOTATION;

    const template = await prisma.template.create({
      data: {
        organizationId: tenantId,
        createdByUserId: user.id,
        title,
        type: docType,
        category,
        description: description || null,
        fileUrl: storedAsset.publicUrl,
        fileSource,
        isSample: false,
        tags,
        imageFilename: storedAsset.filename,
        imageMimeType: storedAsset.mimeType,
        imageUrl: fileSource === "UPLOAD_IMAGE" ? storedAsset.publicUrl : null,
      },
      include: {
        items: true,
        clauses: true,
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "TEMPLATE_CREATED",
      resourceType: "template",
      resourceId: template.id,
      details: `Uploaded custom ${category} template "${title}" (${file.name}) for ${organization.name}.`,
    });

    return successResponse(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

