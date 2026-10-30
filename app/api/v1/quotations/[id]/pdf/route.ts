import { prisma } from "@/lib/prisma";
import { requireTenantContext } from "@/lib/auth/guards";
import { errorResponse, handleApiError } from "@/lib/api-response";
import { generateQuotationPdf } from "@/lib/pdf/quotation-pdf";
import { recordAuditLog } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/quotations/[id]/pdf
 * Generates and streams a downloadable binary PDF for a quotation.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { user, organization, tenantId } = await requireTenantContext(req);
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
        items: { orderBy: { sortOrder: "asc" } },
        contact: true,
      },
    });

    if (!quotation) {
      return errorResponse("Quotation not found.", "NOT_FOUND", 404);
    }

    const pdfBuffer = generateQuotationPdf({
      quotationNumber: quotation.docNumber,
      title: quotation.title,
      issueDate: quotation.issueDate.toISOString().split("T")[0],
      validTill: quotation.validTill ? quotation.validTill.toISOString().split("T")[0] : null,
      currencySymbol: quotation.currencySymbol,
      subtotal: Number(quotation.subtotal),
      discountAmount: Number(quotation.discountAmount),
      taxRate: Number(quotation.taxRate),
      taxAmount: Number(quotation.taxAmount),
      grandTotal: Number(quotation.total),
      paymentTerms: quotation.paymentTerms,
      deliveryTerms: null,
      notes: quotation.notes,
      termsAndConditions: quotation.termsAndConditions,
      client: {
        name: quotation.clientName,
        company: quotation.clientCompany || quotation.contact?.companyName,
        email: quotation.clientEmail || quotation.contact?.email,
        phone: quotation.clientPhone || quotation.contact?.phone,
        address: quotation.clientAddress || quotation.contact?.address,
      },
      organization: {
        name: organization.name,
        displayName: organization.displayName,
        email: organization.email,
        phone: organization.phone,
        address: organization.address,
        taxId: organization.taxId,
        primaryColor: organization.primaryColor,
      },
      items: quotation.items.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: Number(i.quantity),
        unit: i.unit,
        rate: Number(i.rate),
        discount: Number(i.discount),
        taxPercent: Number(i.taxPercent),
        amount: Number(i.amount),
      })),
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "QUOTATION_PDF_GENERATED",
      resourceType: "quotation",
      resourceId: id,
      details: `Generated and downloaded PDF for quotation ${quotation.docNumber}.`,
    });

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Quotation-${quotation.docNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

