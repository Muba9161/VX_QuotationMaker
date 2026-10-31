import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { updateClientSchema } from "@/lib/validations/client";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/clients/[id]
 * Retrieves single client with associated quotations and MOUs, enforcing tenant isolation.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const client = await prisma.contact.findFirst({
      where: {
        id,
        organizationId: tenantId,
      },
      include: {
        documents: {
          select: {
            id: true,
            docNumber: true,
            title: true,
            type: true,
            status: true,
            total: true,
            createdAt: true,
            validTill: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!client) {
      return errorResponse("Client not found.", "NOT_FOUND", 404);
    }

    const quotations = client.documents.filter((d) => d.type === "QUOTATION");
    const mous = client.documents.filter((d) => d.type === "MOU");

    return successResponse({
      ...client,
      quotations,
      mous,
      quotationsCount: quotations.length,
      mousCount: mous.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/clients/[id]
 * Updates client details, enforcing tenant isolation and recording audit history.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const existing = await prisma.contact.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!existing) {
      return errorResponse("Client not found.", "NOT_FOUND", 404);
    }

    const body = await req.json();
    const parse = updateClientSchema.safeParse(body);

    if (!parse.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parse.error.issues)
      );
    }

    const data = parse.data;

    // Enforce client duplication prevention mechanism on update
    // 1. Check duplicate email if email is being updated to a different value
    if (data.email && data.email.trim() && data.email.toLowerCase() !== existing.email?.toLowerCase()) {
      const duplicate = await prisma.contact.findFirst({
        where: {
          organizationId: tenantId,
          email: { equals: data.email.trim(), mode: "insensitive" },
          id: { not: id },
          status: "ACTIVE",
        },
      });

      if (duplicate) {
        return errorResponse(
          `Another client with email "${data.email.trim()}" already exists in this organization (${duplicate.name}).`,
          "DUPLICATE_CLIENT",
          409
        );
      }
    }

    // 2. Check duplicate taxId if updated to a different value
    if (data.taxId && data.taxId.trim() && data.taxId.trim().toLowerCase() !== existing.taxId?.toLowerCase()) {
      const duplicateTax = await prisma.contact.findFirst({
        where: {
          organizationId: tenantId,
          taxId: { equals: data.taxId.trim(), mode: "insensitive" },
          id: { not: id },
          status: "ACTIVE",
        },
      });

      if (duplicateTax) {
        return errorResponse(
          `Another client with Tax/GST ID "${data.taxId.trim()}" already exists in this organization (${duplicateTax.name}).`,
          "DUPLICATE_CLIENT",
          409
        );
      }
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.companyName !== undefined && { companyName: data.companyName ? data.companyName.trim() : null }),
        ...(data.email !== undefined && { email: data.email ? data.email.trim() : null }),
        ...(data.phone !== undefined && { phone: data.phone ? data.phone.trim() : null }),
        ...(data.address !== undefined && { address: data.address ? data.address.trim() : null }),
        ...(data.city !== undefined && { city: data.city ? data.city.trim() : null }),
        ...(data.state !== undefined && { state: data.state ? data.state.trim() : null }),
        ...(data.country !== undefined && { country: data.country || "India" }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode ? data.postalCode.trim() : null }),
        ...(data.taxId !== undefined && { taxId: data.taxId ? data.taxId.trim() : null }),
        ...(data.website !== undefined && { website: data.website ? data.website.trim() : null }),
        ...(data.notes !== undefined && { notes: data.notes ? data.notes.trim() : null }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "CLIENT_UPDATED",
      resourceType: "client",
      resourceId: id,
      details: `Updated client "${updated.name}" (${updated.companyName || "Individual"}).`,
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/clients/[id]
 * Safely archives client if documents are associated, or deletes if zero documents exist.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    requireTrustedOrigin(req);
    const { user, tenantId } = await requireTenantContext(req);
    const { id } = await params;

    const client = await prisma.contact.findFirst({
      where: { id, organizationId: tenantId },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!client) {
      return errorResponse("Client not found.", "NOT_FOUND", 404);
    }

    // Prefer archiving over hard deletion if documents exist
    if (client._count.documents > 0) {
      const archived = await prisma.contact.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      await recordAuditLog({
        organizationId: tenantId,
        userId: user.id,
        userName: user.name,
        action: "CLIENT_ARCHIVED",
        resourceType: "client",
        resourceId: id,
        details: `Archived client "${client.name}" (${client._count.documents} linked documents preserved).`,
      });

      return successResponse({
        archived: true,
        message: "Client has been archived because existing documents are linked to it.",
        client: archived,
      });
    }

    // Hard delete if zero documents attached
    await prisma.contact.delete({ where: { id } });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "CLIENT_DELETED",
      resourceType: "client",
      resourceId: id,
      details: `Deleted client "${client.name}".`,
    });

    return successResponse({
      deleted: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

