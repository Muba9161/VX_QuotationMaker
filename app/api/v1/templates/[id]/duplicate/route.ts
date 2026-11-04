import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

/**
 * POST /api/v1/templates/[id]/duplicate
 * Clones an existing organization template into a new template for the current tenant.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    if (id.startsWith("sample-")) {
      return errorResponse("Template not found.", "NOT_FOUND", 404);
    }

    // Otherwise duplicate an existing org template
    const sourceTemplate = await prisma.template.findFirst({
      where: { id, organizationId: tenantId, isActive: true, isSample: false },
      include: {
        items: true,
        clauses: true,
      },
    });

    if (!sourceTemplate) {
      return errorResponse("Template not found.", "NOT_FOUND", 404);
    }

    const duplicated = await prisma.$transaction(async (tx) => {
      const t = await tx.template.create({
        data: {
          organizationId: tenantId,
          isSample: false,
          createdByUserId: user.id,
          title: `Copy of ${sourceTemplate.title}`,
          type: sourceTemplate.type,
          category: sourceTemplate.category,
          description: sourceTemplate.description,
          isDefault: false,
          fileUrl: sourceTemplate.fileUrl,
          fileSource: sourceTemplate.fileSource,
          tags: sourceTemplate.tags,
          imageUrl: sourceTemplate.imageUrl,
          imageFilename: sourceTemplate.imageFilename,
          imageMimeType: sourceTemplate.imageMimeType,
          contentSchema: (sourceTemplate.contentSchema as object) || {},
        },
      });

      for (const item of sourceTemplate.items) {
        await tx.templateItem.create({
          data: {
            templateId: t.id,
            description: item.description,
            unit: item.unit,
            defaultQuantity: item.defaultQuantity,
            defaultRate: item.defaultRate,
            sortOrder: item.sortOrder,
          },
        });
      }

      for (const clause of sourceTemplate.clauses) {
        await tx.templateClause.create({
          data: {
            templateId: t.id,
            title: clause.title,
            content: clause.content,
            sortOrder: clause.sortOrder,
          },
        });
      }

      return tx.template.findUnique({
        where: { id: t.id },
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          clauses: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "TEMPLATE_CREATED",
      resourceType: "template",
      resourceId: duplicated?.id,
      details: `Duplicated template "${sourceTemplate.title}" as "${duplicated?.title}" for ${organization.name}.`,
    });

    return successResponse(duplicated, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
