import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { updateTemplateSchema } from "@/lib/validations/template";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/templates/[id]
 * Retrieves single template with items and clauses.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const template = await prisma.template.findFirst({
      where: { id, organizationId: tenantId },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        clauses: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!template) {
      return errorResponse("Template not found.", "NOT_FOUND", 404);
    }

    return successResponse(template);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/templates/[id]
 * Updates template metadata, default items, or default clauses.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const existing = await prisma.template.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!existing) {
      return errorResponse("Template not found.", "NOT_FOUND", 404);
    }

    const body = await req.json();
    const parse = updateTemplateSchema.safeParse(body);

    if (!parse.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parse.error.issues)
      );
    }

    const data = parse.data;

    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.template.updateMany({
          where: { organizationId: tenantId, type: existing.type },
          data: { isDefault: false },
        });
      }

      if (data.items) {
        await tx.templateItem.deleteMany({ where: { templateId: id } });
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          await tx.templateItem.create({
            data: {
              templateId: id,
              description: item.description,
              defaultQuantity: item.defaultQuantity,
              unit: item.unit,
              defaultRate: item.defaultRate,
              sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : i,
            },
          });
        }
      }

      if (data.clauses) {
        await tx.templateClause.deleteMany({ where: { templateId: id } });
        for (let i = 0; i < data.clauses.length; i++) {
          const c = data.clauses[i];
          await tx.templateClause.create({
            data: {
              templateId: id,
              title: c.title,
              content: c.content,
              sortOrder: typeof c.sortOrder === "number" ? c.sortOrder : i,
            },
          });
        }
      }

      return tx.template.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title.trim() }),
          ...(data.description !== undefined && { description: data.description ? data.description.trim() : null }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          ...(data.contentSchema && { contentSchema: data.contentSchema as object }),
          version: existing.version + 1,
        },
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
      action: "TEMPLATE_UPDATED",
      resourceType: "template",
      resourceId: id,
      details: `Updated template "${updated.title}" (version ${updated.version}).`,
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/templates/[id]
 * Deletes a template.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const existing = await prisma.template.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!existing) {
      return errorResponse("Template not found.", "NOT_FOUND", 404);
    }

    await prisma.template.delete({ where: { id } });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "TEMPLATE_DELETED",
      resourceType: "template",
      resourceId: id,
      details: `Deleted template "${existing.title}".`,
    });

    return successResponse({ message: "Template deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}

