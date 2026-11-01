import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { saveTenantAsset, UploadError } from "@/lib/storage/upload";
import { recordAuditLog } from "@/lib/audit";

const VALID_ASSET_CATEGORIES = [
  "LOGO",
  "ALT_LOGO",
  "HEADER",
  "FOOTER",
  "WATERMARK",
  "SIGNATURE",
  "DECORATIVE",
  "OTHER"
];

/**
 * GET /api/v1/organization/assets
 * Lists visual assets for the current organization, optionally filtered by category.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category")?.toUpperCase();

    const where: { organizationId: string; category?: string } = {
      organizationId: tenantId,
    };

    if (categoryParam && VALID_ASSET_CATEGORIES.includes(categoryParam)) {
      where.category = categoryParam;
    }

    const assets = await prisma.organizationAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse({
      assets,
      count: assets.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/organization/assets
 * Uploads a visual asset (logo, signature, header, footer, watermark, etc.)
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string)?.trim() || file?.name || "Asset";
    const rawCategory = (formData.get("category") as string)?.toUpperCase() || "OTHER";
    const category = VALID_ASSET_CATEGORIES.includes(rawCategory) ? rawCategory : "OTHER";
    const dimensions = (formData.get("dimensions") as string)?.trim() || null;

    if (!file) {
      return errorResponse("Asset file is required.", "FILE_REQUIRED", 400);
    }

    let stored;
    try {
      stored = await saveTenantAsset(tenantId, file, "asset");
    } catch (err) {
      if (err instanceof UploadError) {
        return errorResponse(err.message, err.code, err.status);
      }
      throw err;
    }

    const asset = await prisma.organizationAsset.create({
      data: {
        organizationId: tenantId,
        name,
        category,
        fileUrl: stored.publicUrl,
        filename: stored.filename,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        dimensions,
        createdByUserId: user.id,
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "ASSET_UPLOADED",
      resourceType: "asset",
      resourceId: asset.id,
      details: `Uploaded ${category} asset "${name}" (${file.name}) for ${organization.name}.`,
    });

    return successResponse(asset, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

