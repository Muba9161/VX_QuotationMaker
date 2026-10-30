import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { createQuotationSchema, quotationFilterSchema } from "@/lib/validations/quotation";
import { formatZodIssues } from "@/lib/validations/auth";
import { calculateQuotationFinancials } from "@/lib/services/financial-calculator";
import { generateNextDocumentNumber } from "@/lib/services/document-numbering";
import { recordAuditLog } from "@/lib/audit";
import { Prisma, DocumentStatus } from "@prisma/client";
import crypto from "crypto";

/**
 * GET /api/v1/quotations
 * Lists quotations for authenticated tenant with pagination, search, and status filtering.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { searchParams } = new URL(req.url);

    const filterParse = quotationFilterSchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      contactId: searchParams.get("contactId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    });

    if (!filterParse.success) {
      return errorResponse("Invalid query parameters.", "BAD_REQUEST", 400);
    }

    const { page, limit, search, status, contactId, dateFrom, dateTo } = filterParse.data;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      organizationId: tenantId,
      type: "QUOTATION",
    };

    if (contactId) {
      where.contactId = contactId;
    }

    if (status && status !== "ALL") {
      const upperStatus = status.toUpperCase();
      // Map ACCEPTED to APPROVED, CANCELLED to REVOKED, REJECTED to DECLINED
      let mappedStatus: DocumentStatus | undefined;
      if (upperStatus === "ACCEPTED") mappedStatus = DocumentStatus.APPROVED;
      else if (upperStatus === "REJECTED") mappedStatus = DocumentStatus.DECLINED;
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
      ];
    }

    if (dateFrom || dateTo) {
      where.issueDate = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const [total, quotations] = await Promise.all([
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
          items: {
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    return successResponse(quotations, 200, {
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
 * POST /api/v1/quotations
 * Creates a quotation with server-side financial calculations and concurrency-safe numbering.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);

    const body = await req.json();
    const parse = createQuotationSchema.safeParse(body);

    if (!parse.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parse.error.issues)
      );
    }

    const data = parse.data;

    // Run authoritative server-side calculation engine
    const financials = calculateQuotationFinancials({
      items: data.items,
      taxRate: data.taxRate,
      discountType: data.discountType,
      discountValue: data.discountValue,
    });

    // Concurrency-safe unique quotation numbering
    const quotationNumber = await generateNextDocumentNumber(tenantId, "QUOTATION");
    const shareToken = crypto.randomBytes(32).toString("hex");

    const effectiveContactId = data.contactId || data.clientId || null;

    // Persist document and calculated line items atomically in database transaction
    const quotation = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          organizationId: tenantId,
          createdByUserId: user.id,
          contactId: effectiveContactId,
          templateId: data.templateId || null,
          docNumber: quotationNumber,
          title: data.title.trim(),
          type: "QUOTATION",
          status: DocumentStatus.DRAFT,
          clientName: data.clientName.trim(),
          clientCompany: data.clientCompany ? data.clientCompany.trim() : null,
          clientEmail: data.clientEmail ? data.clientEmail.trim() : null,
          clientPhone: data.clientPhone ? data.clientPhone.trim() : null,
          clientAddress: data.clientAddress ? data.clientAddress.trim() : null,

          currency: data.currency || "INR",
          currencySymbol: data.currencySymbol || "₹",
          subtotal: financials.subtotal,
          taxRate: financials.taxRate,
          taxAmount: financials.taxAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: financials.totalDiscountAmount,
          total: financials.grandTotal,

          paymentTerms: data.paymentTerms || null,
          notes: data.notes || null,
          termsAndConditions: data.termsAndConditions || null,
          issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
          validTill: data.validTill ? new Date(data.validTill) : null,
          shareToken,
        },
      });

      // Insert line items
      for (const item of financials.items) {
        await tx.documentItem.create({
          data: {
            documentId: doc.id,
            name: item.name || null,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            rate: item.rate,
            discount: item.discount,
            taxPercent: item.taxPercent,
            amount: item.amount,
            sortOrder: item.sortOrder,
          },
        });
      }

      return tx.document.findUnique({
        where: { id: doc.id },
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          contact: true,
        },
      });
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "QUOTATION_CREATED",
      resourceType: "quotation",
      resourceId: quotation?.id,
      details: `Created quotation ${quotationNumber} (${data.title}) for ₹${financials.grandTotal} in ${organization.name}.`,
    });

    return successResponse(quotation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

