import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { deleteTenantAsset } from "@/lib/storage/upload";
import { recordAuditLog } from "@/lib/audit";

/**
 * DELETE /api/v1/organization/assets/[id]
 * Removes an asset from storage and deletes its database record.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const asset = await prisma.organizationAsset.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!asset) {
      return errorResponse("Asset not found.", "NOT_FOUND", 404);
    }

    // Delete from disk
    await deleteTenantAsset(tenantId, asset.filename, "asset");

    // Delete DB record
    await prisma.organizationAsset.delete({
      where: { id },
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "ASSET_DELETED",
      resourceType: "asset",
      resourceId: id,
      details: `Deleted ${asset.category} asset "${asset.name}" for ${organization.name}.`,
    });

    return successResponse({ message: "Asset deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}

