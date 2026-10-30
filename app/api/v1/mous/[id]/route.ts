import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { updateMouSchema } from "@/lib/validations/mou";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { DocumentStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/mous/[id]
 * Retrieves single MOU with ordered clauses and partner details.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const mou = await prisma.document.findFirst({
      where: {
        id,
        organizationId: tenantId,
        type: "MOU",
      },
      include: {
        contact: true,
        clauses: {
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

    if (!mou) {
      return errorResponse("MOU not found.", "NOT_FOUND", 404);
    }

    return successResponse(mou);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/mous/[id]
 * Updates MOU metadata and structured clauses.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const existing = await prisma.document.findFirst({
      where: { id, organizationId: tenantId, type: "MOU" },
    });

    if (!existing) {
      return errorResponse("MOU not found.", "NOT_FOUND", 404);
    }

    if (existing.status === DocumentStatus.SIGNED) {
      return errorResponse("Signed / executed MOUs cannot be modified.", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const parse = updateMouSchema.safeParse(body);

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
      // If clauses provided, replace them
      if (data.clauses && Array.isArray(data.clauses)) {
        await tx.documentClause.deleteMany({ where: { documentId: id } });
        for (let idx = 0; idx < data.clauses.length; idx++) {
          const c = data.clauses[idx];
          await tx.documentClause.create({
            data: {
              documentId: id,
              title: c.title.trim(),
              content: c.content.trim(),
              sortOrder: typeof c.sortOrder === "number" ? c.sortOrder : idx,
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
          ...(data.purpose !== undefined && { purpose: data.purpose }),
          ...(data.governingLaw !== undefined && { governingLaw: data.governingLaw }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.effectiveDate !== undefined && { effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null }),
          ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate ? new Date(data.expiryDate) : null }),
        },
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
      action: "MOU_UPDATED",
      resourceType: "mou",
      resourceId: id,
      details: `Updated Memorandum of Understanding ${existing.docNumber} ("${updated.title}").`,
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/mous/[id]
 * Cancels or deletes an MOU.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const existing = await prisma.document.findFirst({
      where: { id, organizationId: tenantId, type: "MOU" },
    });

    if (!existing) {
      return errorResponse("MOU not found.", "NOT_FOUND", 404);
    }

    if (existing.status === DocumentStatus.DRAFT) {
      await prisma.document.delete({ where: { id } });
    } else {
      await prisma.document.update({
        where: { id },
        data: { status: DocumentStatus.REVOKED },
      });
    }

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "MOU_CANCELLED",
      resourceType: "mou",
      resourceId: id,
      details: `Cancelled / deleted MOU ${existing.docNumber}.`,
    });

    return successResponse({
      message: `MOU ${existing.docNumber} has been ${existing.status === DocumentStatus.DRAFT ? "deleted" : "cancelled"}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

