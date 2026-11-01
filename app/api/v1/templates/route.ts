import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { createTemplateSchema } from "@/lib/validations/template";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { DocumentType } from "@prisma/client";
import { getSampleTemplates } from "@/lib/templates/sample-templates-catalog";

/**
 * GET /api/v1/templates
 * Lists reusable document templates for authenticated tenant along with optional platform samples.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");
    const categoryParam = searchParams.get("category");
    const includeSamples =
      searchParams.get("includeSamples") === "true" ||
      searchParams.get("scope") === "all" ||
      searchParams.get("scope") === "sample";
    const scopeOnlySample = searchParams.get("scope") === "sample";

    let orgTemplates: any[] = [];
    if (!scopeOnlySample) {
      const where: any = {
        organizationId: tenantId,
        isActive: true,
      };

      if (typeParam && (typeParam === "QUOTATION" || typeParam === "MOU")) {
        where.type = typeParam as DocumentType;
      } else if (categoryParam) {
        where.category = categoryParam;
      }

      orgTemplates = await prisma.template.findMany({
        where,
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          clauses: { orderBy: { sortOrder: "asc" } },
        },
      });
    }

    let sampleTemplates: any[] = [];
    if (includeSamples) {
      const effectiveType = (typeParam || categoryParam || "ALL").toUpperCase();
      const filterType = (effectiveType === "QUOTATION" || effectiveType === "MOU" || effectiveType === "LETTERHEAD")
        ? effectiveType
        : "ALL";
      sampleTemplates = getSampleTemplates(filterType);
    }

    const formattedOrg = orgTemplates.map((t) => ({
      ...t,
      isSample: false,
      category: t.category || t.type,
    }));

    return successResponse([...formattedOrg, ...sampleTemplates]);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/templates
 * Creates a reusable document template for the organization.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);

    const body = await req.json();
    const parse = createTemplateSchema.safeParse(body);

    if (!parse.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parse.error.issues)
      );
    }

    const data = parse.data;
    const category = body.category || data.type;

    const template = await prisma.$transaction(async (tx) => {
      // If setting as default, unset other defaults of the same type
      if (data.isDefault) {
        await tx.template.updateMany({
          where: { organizationId: tenantId, type: data.type },
          data: { isDefault: false },
        });
      }

      const t = await tx.template.create({
        data: {
          organizationId: tenantId,
          createdByUserId: user.id,
          title: data.title.trim(),
          type: data.type as DocumentType,
          category,
          description: data.description ? data.description.trim() : null,
          isDefault: data.isDefault,
          contentSchema: (data.contentSchema as object) || {},
          fileUrl: body.fileUrl || null,
          fileSource: body.fileSource || "SYSTEM",
          tags: Array.isArray(body.tags) ? body.tags : [],
        },
      });

      if (data.items && data.items.length > 0) {
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          await tx.templateItem.create({
            data: {
              templateId: t.id,
              description: item.description,
              defaultQuantity: item.defaultQuantity,
              unit: item.unit,
              defaultRate: item.defaultRate,
              sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : i,
            },
          });
        }
      }

      if (data.clauses && data.clauses.length > 0) {
        for (let i = 0; i < data.clauses.length; i++) {
          const c = data.clauses[i];
          await tx.templateClause.create({
            data: {
              templateId: t.id,
              title: c.title,
              content: c.content,
              sortOrder: typeof c.sortOrder === "number" ? c.sortOrder : i,
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
      resourceId: template?.id,
      details: `Created ${data.type} template "${data.title}" for ${organization.name}.`,
    });

    return successResponse(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
