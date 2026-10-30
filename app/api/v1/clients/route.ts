import { prisma } from "@/lib/prisma";
import { requireTenantContext, requireTrustedOrigin } from "@/lib/auth/guards";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { createClientSchema, clientFilterSchema } from "@/lib/validations/client";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

/**
 * GET /api/v1/clients
 * Lists clients/contacts with tenant isolation, pagination, search, and status filtering.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);
    const { searchParams } = new URL(req.url);

    const queryParse = clientFilterSchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || "ACTIVE",
    });

    if (!queryParse.success) {
      return errorResponse("Invalid query parameters.", "BAD_REQUEST", 400);
    }

    const { page, limit, search, status } = queryParse.data;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactWhereInput = {
      organizationId: tenantId,
    };

    if (status !== "ALL") {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, clients] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              documents: true,
            },
          },
        },
      }),
    ]);

    return successResponse(clients, 200, {
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
 * POST /api/v1/clients
 * Creates a new client record within the authenticated organization workspace.
 */
export async function POST(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { user, organization, tenantId } = await requireTenantContext(req);

    const body = await req.json();
    const parse = createClientSchema.safeParse(body);

    if (!parse.success) {
      return errorResponse(
        "Validation failed.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parse.error.issues)
      );
    }

    const data = parse.data;

    // Check for duplicate client email within the same organization if email is provided
    if (data.email && data.email.trim()) {
      const existing = await prisma.contact.findFirst({
        where: {
          organizationId: tenantId,
          email: { equals: data.email.trim(), mode: "insensitive" },
          status: "ACTIVE",
        },
      });

      if (existing) {
        return errorResponse(
          `A client with email ${data.email} already exists in this organization.`,
          "DUPLICATE_CLIENT",
          409
        );
      }
    }

    const client = await prisma.contact.create({
      data: {
        organizationId: tenantId,
        createdByUserId: user.id,
        name: data.name.trim(),
        companyName: data.companyName ? data.companyName.trim() : null,
        email: data.email ? data.email.trim() : null,
        phone: data.phone ? data.phone.trim() : null,
        address: data.address ? data.address.trim() : null,
        city: data.city ? data.city.trim() : null,
        state: data.state ? data.state.trim() : null,
        country: data.country || "India",
        postalCode: data.postalCode ? data.postalCode.trim() : null,
        taxId: data.taxId ? data.taxId.trim() : null,
        website: data.website ? data.website.trim() : null,
        notes: data.notes ? data.notes.trim() : null,
        status: "ACTIVE",
      },
    });

    await recordAuditLog({
      organizationId: tenantId,
      userId: user.id,
      userName: user.name,
      action: "CLIENT_CREATED",
      resourceType: "client",
      resourceId: client.id,
      details: `Created client "${client.name}" (${client.companyName || "Individual"}) for ${organization.name}.`,
    });

    return successResponse(client, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

