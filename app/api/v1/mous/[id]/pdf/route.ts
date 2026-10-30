import { prisma } from "@/lib/prisma";
import { requireTenantContext } from "@/lib/auth/guards";
import { errorResponse, handleApiError } from "@/lib/api-response";
import { generateMouPdf } from "@/lib/pdf/mou-pdf";
import { recordAuditLog } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/mous/[id]/pdf
 * Generates and streams a downloadable binary PDF for an MOU.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { user, organization, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const mou = await prisma.document.findFirst({
      where: {
        organizationId: tenantId,
        type: "MOU",
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
        clauses: { orderBy: { sortOrder: "asc" } },
        contact: true,
      },
    });

    if (!mou) {
      return errorResponse("MOU not found.", "NOT_FOUND", 404);
    }

    const pdfBuffer = generateMouPdf({
      mouNumber: mou.docNumber,
      title: mou.title,
      effectiveDate: mou.effectiveDate ? mou.effectiveDate.toISOString().split("T")[0] : null,
      expiryDate: mou.expiryDate ? mou.expiryDate.toISOString().split("T")[0] : null,
      purpose: mou.purpose,
      governingLaw: mou.governingLaw,
      notes: mou.notes,
      partyA: {
        name: organization.name,
        displayName: organization.displayName,
        email: organization.email,
        phone: organization.phone,
        address: organization.address,
        signatoryName: organization.defaultSignatoryName,
        signatoryTitle: organization.defaultSignatoryTitle,
        primaryColor: organization.primaryColor,
      },
      partyB: {
        name: mou.clientName,
        company: mou.clientCompany || mou.contact?.companyName,
        email: mou.clientEmail || mou.contact?.email,
        phone: mou.clientPhone || mou.contact?.phone,
        address: mou.clientAddress || mou.contact?.address,
      },
      clauses: mou.clauses.map((c) => ({
        title: c.title,
        content: c.content,
        sortOrder: c.sortOrder,
      })),
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "MOU_PDF_GENERATED",
      resourceType: "mou",
      resourceId: id,
      details: `Generated and downloaded PDF for MOU ${mou.docNumber}.`,
    });

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="MOU-${mou.docNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

