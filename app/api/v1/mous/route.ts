import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { createMouSchema, mouFilterSchema } from "@/lib/validations/mou";
import { formatZodIssues } from "@/lib/validations/auth";
import { generateNextDocumentNumber } from "@/lib/services/document-numbering";
import { recordAuditLog } from "@/lib/audit";
import { Prisma, DocumentStatus } from "@prisma/client";
import crypto from "crypto";

/**
 * GET /api/v1/mous
 * Lists MOUs for authenticated tenant with pagination, search, and status filtering.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { searchParams } = new URL(req.url);

    const filterParse = mouFilterSchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      contactId: searchParams.get("contactId") || undefined,
    });

    if (!filterParse.success) {
      return errorResponse("Invalid query parameters.", "BAD_REQUEST", 400);
    }

    const { page, limit, search, status, contactId } = filterParse.data;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      organizationId: tenantId,
      type: "MOU",
    };

    if (contactId) {
      where.contactId = contactId;
    }

    if (status && status !== "ALL") {
      const upperStatus = status.toUpperCase();
      let mappedStatus: DocumentStatus | undefined;
      if (upperStatus === "EXECUTED" || upperStatus === "SIGNED") mappedStatus = DocumentStatus.SIGNED;
      else if (upperStatus === "CANCELLED") mappedStatus = DocumentStatus.REVOKED;
      else if (Object.values(DocumentStatus).includes(upperStatus as DocumentStatus)) {
        mappedStatus = upperStatus as DocumentStatus;
      }
      if (mappedStatus) {
        where.status = mappedStatus;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { docNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { clientName: { contains: q, mode: "insensitive" } },
        { clientCompany: { contains: q, mode: "insensitive" } },
        { purpose: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, mous] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
              phone: true,
            },
          },
          clauses: {
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: { clauses: true },
          },
        },
      }),
    ]);

    return successResponse(mous, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/mous
 * Creates a structured MOU with clauses and concurrency-safe reference numbering.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);

    const body = await req.json();
    const parse = createMouSchema.safeParse(body);

    if (!parse.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parse.error.issues)
      );
    }

    const data = parse.data;

    // Concurrency-safe unique MOU numbering
    const mouNumber = await generateNextDocumentNumber(tenantId, "MOU");
    const shareToken = crypto.randomBytes(32).toString("hex");
    const effectiveContactId = data.contactId || data.clientId || null;

    const mou = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          organizationId: tenantId,
          createdByUserId: user.id,
          contactId: effectiveContactId,
          templateId: data.templateId || null,
          docNumber: mouNumber,
          title: data.title.trim(),
          type: "MOU",
          status: DocumentStatus.DRAFT,
          clientName: data.clientName.trim(),
          clientCompany: data.clientCompany ? data.clientCompany.trim() : null,
          clientEmail: data.clientEmail ? data.clientEmail.trim() : null,
          clientPhone: data.clientPhone ? data.clientPhone.trim() : null,
          clientAddress: data.clientAddress ? data.clientAddress.trim() : null,

          purpose: data.purpose || null,
          governingLaw: data.governingLaw || "Indian Jurisdiction",
          notes: data.notes || null,
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          shareToken,
        },
      });

      // Insert structured clauses
      for (let idx = 0; idx < data.clauses.length; idx++) {
        const c = data.clauses[idx];
        await tx.documentClause.create({
          data: {
            documentId: doc.id,
            title: c.title.trim(),
            content: c.content.trim(),
            sortOrder: typeof c.sortOrder === "number" ? c.sortOrder : idx,
          },
        });
      }

      return tx.document.findUnique({
        where: { id: doc.id },
        include: {
          clauses: { orderBy: { sortOrder: "asc" } },
          contact: true,
        },
      });
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "MOU_CREATED",
      resourceType: "mou",
      resourceId: mou?.id,
      details: `Created Memorandum of Understanding ${mouNumber} ("${data.title}") with ${data.clauses.length} structured sections for ${organization.name}.`,
    });

    return successResponse(mou, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

