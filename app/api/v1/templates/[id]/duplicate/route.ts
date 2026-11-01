import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { getSampleTemplateById } from "@/lib/templates/sample-templates-catalog";
import { DocumentType } from "@prisma/client";

/**
 * POST /api/v1/templates/[id]/duplicate
 * Clones either a platform sample template or an existing organization template
 * into a new custom template for the current tenant.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    // Check if it is a platform sample template
    if (id.startsWith("sample-")) {
      const sample = getSampleTemplateById(id);
      if (!sample) {
        return errorResponse("Sample template not found.", "NOT_FOUND", 404);
      }

      const docType: DocumentType = sample.type === "MOU" ? DocumentType.MOU : DocumentType.QUOTATION;

      const newTemplate = await prisma.$transaction(async (tx) => {
        const t = await tx.template.create({
          data: {
            organizationId: tenantId,
            createdByUserId: user.id,
            title: `${sample.title} (Custom)`,
            type: docType,
            category: sample.category,
            description: sample.description,
            isDefault: false,
            fileSource: "SYSTEM",
            contentSchema: {
              accentColor: sample.accentColor,
              paymentTerms: sample.paymentTerms,
              notes: sample.notes,
              termsConditions: sample.termsConditions,
              letterheadConfig: sample.letterheadConfig,
            } as any,
          },
        });

        if (sample.lineItems && sample.lineItems.length > 0) {
          for (let i = 0; i < sample.lineItems.length; i++) {
            const item = sample.lineItems[i];
            await tx.templateItem.create({
              data: {
                templateId: t.id,
                description: item.description,
                unit: item.unit,
                defaultQuantity: item.defaultQuantity,
                defaultRate: item.defaultRate,
                sortOrder: i + 1,
              },
            });
          }
        }

        if (sample.clauses && sample.clauses.length > 0) {
          for (let i = 0; i < sample.clauses.length; i++) {
            const clause = sample.clauses[i];
            await tx.templateClause.create({
              data: {
                templateId: t.id,
                title: clause.title,
                content: clause.content,
                sortOrder: clause.sortOrder || i + 1,
              },
            });
          }
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
        resourceId: newTemplate?.id,
        details: `Cloned sample template "${sample.title}" into organization templates for ${organization.name}.`,
      });

      return successResponse(newTemplate, 201);
    }

    // Otherwise duplicate an existing org template
    const sourceTemplate = await prisma.template.findFirst({
      where: { id, organizationId: tenantId, isActive: true },
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
