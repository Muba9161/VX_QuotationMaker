import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { updateQuotationSchema } from "@/lib/validations/quotation";
import { formatZodIssues } from "@/lib/validations/auth";
import { calculateQuotationFinancials } from "@/lib/services/financial-calculator";
import { recordAuditLog } from "@/lib/audit";
import { DocumentStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/quotations/[id]
 * Retrieves single quotation with calculated items, client details, and audit history.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const quotation = await prisma.document.findFirst({
      where: {
        organizationId: tenantId,
        type: "QUOTATION",
        ...(isUuid
          ? { id }
          : {
              OR: [
                { docNumber: { equals: id, mode: "insensitive" } },
                { docNumber: { contains: id, mode: "insensitive" } },
              ],
            }),
      },
      include: {
        contact: true,
        items: {
          orderBy: { sortOrder: "asc" },
        },
        template: {
          select: { id: true, title: true },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!quotation) {
      return errorResponse("Quotation not found.", "NOT_FOUND", 404);
    }

    return successResponse(quotation);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/quotations/[id]
 * Updates quotation and recalculates financial fields authoritatively.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const existing = await prisma.document.findFirst({
      where: {
        organizationId: tenantId,
        type: "QUOTATION",
        ...(isUuid
          ? { id }
          : {
              OR: [
                { docNumber: { equals: id, mode: "insensitive" } },
                { docNumber: { contains: id, mode: "insensitive" } },
              ],
            }),
      },
      include: { items: true },
    });

    if (!existing) {
      return errorResponse("Quotation not found.", "NOT_FOUND", 404);
    }

    if (existing.status === DocumentStatus.APPROVED || existing.status === DocumentStatus.SIGNED) {
      return errorResponse("Accepted or signed quotations cannot be modified.", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const parse = updateQuotationSchema.safeParse(body);

    if (!parse.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parse.error.issues)
      );
    }

    const data = parse.data;

    // Recalculate financials if items, discounts, or taxRate are updated
    let financialsUpdate: Record<string, unknown> = {};
    const shouldRecalculate =
      data.items !== undefined ||
      data.taxRate !== undefined ||
      data.discountType !== undefined ||
      data.discountValue !== undefined;

    let newItemsToSave = data.items;

    if (shouldRecalculate) {
      const itemsForCalc = data.items || existing.items.map((i) => ({
        name: i.name || undefined,
        description: i.description,
        quantity: Number(i.quantity),
        unit: i.unit,
        rate: Number(i.rate),
        discount: Number(i.discount),
        taxPercent: Number(i.taxPercent),
        sortOrder: i.sortOrder,
      }));

      const taxRate = data.taxRate !== undefined ? data.taxRate : Number(existing.taxRate);
      const discountType = data.discountType || (existing.discountType as "percentage" | "fixed" | "none") || "none";
      const discountValue = data.discountValue !== undefined ? data.discountValue : Number(existing.discountValue);

      const calculated = calculateQuotationFinancials({
        items: itemsForCalc,
        taxRate,
        discountType,
        discountValue,
      });

      financialsUpdate = {
        subtotal: calculated.subtotal,
        taxRate: calculated.taxRate,
        taxAmount: calculated.taxAmount,
        discountType,
        discountValue,
        discountAmount: calculated.totalDiscountAmount,
        total: calculated.grandTotal,
      };

      newItemsToSave = calculated.items;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If line items updated, replace them
      if (newItemsToSave) {
        await tx.documentItem.deleteMany({ where: { documentId: id } });
        for (const item of newItemsToSave) {
          const itemQuantity = Number(item.quantity);
          const itemRate = Number(item.rate);
          const itemDiscount = Number(item.discount || 0);
          const itemTaxPercent = Number(item.taxPercent || 18);
          const lineTaxable = Math.max(0, itemQuantity * itemRate - itemDiscount);
          const lineAmount =
            "amount" in item && typeof (item as { amount: unknown }).amount === "number"
              ? (item as { amount: number }).amount
              : Math.round(
                  (lineTaxable + lineTaxable * (itemTaxPercent / 100) + Number.EPSILON) * 100
                ) / 100;

          await tx.documentItem.create({
            data: {
              documentId: id,
              name: item.name || null,
              description: item.description,
              quantity: itemQuantity,
              unit: item.unit || "Nos",
              rate: itemRate,
              discount: itemDiscount,
              taxPercent: itemTaxPercent,
              amount: lineAmount,
              sortOrder: item.sortOrder || 0,
            },
          });
        }
      }

      return tx.document.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title.trim() }),
          ...(data.contactId !== undefined && { contactId: data.contactId }),
          ...(data.clientName && { clientName: data.clientName.trim() }),
          ...(data.clientCompany !== undefined && { clientCompany: data.clientCompany ? data.clientCompany.trim() : null }),
          ...(data.clientEmail !== undefined && { clientEmail: data.clientEmail ? data.clientEmail.trim() : null }),
          ...(data.clientPhone !== undefined && { clientPhone: data.clientPhone ? data.clientPhone.trim() : null }),
          ...(data.clientAddress !== undefined && { clientAddress: data.clientAddress ? data.clientAddress.trim() : null }),
          ...(data.paymentTerms !== undefined && { paymentTerms: data.paymentTerms }),
          ...(data.deliveryTerms !== undefined && { deliveryTerms: data.deliveryTerms }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.termsAndConditions !== undefined && { termsAndConditions: data.termsAndConditions }),
          ...(data.validTill !== undefined && { validTill: data.validTill ? new Date(data.validTill) : null }),
          ...financialsUpdate,
        },
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
      action: "QUOTATION_UPDATED",
      resourceType: "quotation",
      resourceId: id,
      details: `Updated quotation ${existing.docNumber} (${updated.title}).`,
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/quotations/[id]
 * Cancels or deletes a quotation.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const existing = await prisma.document.findFirst({
      where: {
        organizationId: tenantId,
        type: "QUOTATION",
        ...(isUuid
          ? { id }
          : {
              OR: [
                { docNumber: { equals: id, mode: "insensitive" } },
                { docNumber: { contains: id, mode: "insensitive" } },
              ],
            }),
      },
    });

    if (!existing) {
      return errorResponse("Quotation not found.", "NOT_FOUND", 404);
    }

    // If draft, can hard delete; otherwise mark as REVOKED (cancelled)
    if (existing.status === DocumentStatus.DRAFT) {
      await prisma.document.delete({ where: { id: existing.id } });
    } else {
      await prisma.document.update({
        where: { id: existing.id },
        data: { status: DocumentStatus.REVOKED },
      });
    }

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "QUOTATION_CANCELLED",
      resourceType: "quotation",
      resourceId: id,
      details: `Cancelled / deleted quotation ${existing.docNumber}.`,
    });

    return successResponse({
      message: `Quotation ${existing.docNumber} has been ${existing.status === DocumentStatus.DRAFT ? "deleted" : "cancelled"}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

