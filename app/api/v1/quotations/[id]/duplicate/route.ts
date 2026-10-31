import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireTenantContext, AuthError } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { generateNextDocumentNumber } from "@/lib/services/document-numbering";
import { recordAuditLog } from "@/lib/audit";
import { DocumentStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/quotations/[id]/duplicate
 * Creates an independent clone of an existing quotation with:
 * - A brand-new sequential quotation number
 * - DRAFT status
 * - Fresh cryptographically secure shareToken
 * - Line items, pricing, discounts, tax, terms, and notes copied
 * - Zero signature artifacts, share links, OTPs, or historical audits
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { user, organization, tenantId } = await requireTenantContext(req);

    const { id } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const source = await prisma.document.findFirst({
      where: {
        organizationId: tenantId,
        type: "QUOTATION",
        ...(isUuid ? { id } : { docNumber: id }),
      },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!source) {
      return errorResponse("Source quotation not found.", "NOT_FOUND", 404);
    }

    // 1. Concurrency-safe unique quotation numbering
    const quotationNumber = await generateNextDocumentNumber(tenantId, "QUOTATION");
    const freshShareToken = crypto.randomBytes(32).toString("hex");

    // 2. Clone quotation atomically
    const duplicatedQuotation = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          organizationId: tenantId,
          createdByUserId: user.id,
          contactId: source.contactId,
          templateId: source.templateId,
          docNumber: quotationNumber,
          title: `${source.title} (Copy)`,
          type: "QUOTATION",
          status: DocumentStatus.DRAFT,
          clientName: source.clientName,
          clientCompany: source.clientCompany,
          clientEmail: source.clientEmail,
          clientPhone: source.clientPhone,
          clientAddress: source.clientAddress,

          currency: source.currency,
          currencySymbol: source.currencySymbol,
          subtotal: source.subtotal,
          taxRate: source.taxRate,
          taxAmount: source.taxAmount,
          discountType: source.discountType,
          discountValue: source.discountValue,
          discountAmount: source.discountAmount,
          total: source.total,

          paymentTerms: source.paymentTerms,
          notes: source.notes,
          termsAndConditions: source.termsAndConditions,
          governingLaw: source.governingLaw,
          purpose: source.purpose,
          issueDate: new Date(),
          validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          shareToken: freshShareToken,
        },
      });

      // Clone line items
      for (let idx = 0; idx < source.items.length; idx++) {
        const item = source.items[idx];
        await tx.documentItem.create({
          data: {
            documentId: doc.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            rate: item.rate,
            discount: item.discount,
            taxPercent: item.taxPercent,
            amount: item.amount,
            sortOrder: idx,
          },
        });
      }

      return doc;
    });

    // 3. Record audit log
    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "QUOTATION_CREATED",
      resourceType: "quotation",
      resourceId: duplicatedQuotation.id,
      details: `Duplicated quotation ${source.docNumber} -> ${quotationNumber} (${duplicatedQuotation.title}) in ${organization.name}.`,
    });

    return successResponse(duplicatedQuotation, 201);
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to duplicate quotation.");
  }
}

