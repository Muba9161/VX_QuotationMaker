import { prisma } from "@/lib/prisma";
import { requireTenantContext, requirePermission, requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { updateBrandingSchema } from "@/lib/validations/organization";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/organization/branding
 *
 * Retrieves organization branding colors, logo, and the centrally active letterhead
 * configuration shared by all quotations and MOUs.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);

    const org = await prisma.organization.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        displayName: true,
        tagline: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        letterheadUrl: true,
        letterheadHeaderText: true,
        letterheadFooterText: true,
        letterheadLogoPosition: true,
        defaultSignatoryName: true,
        defaultSignatoryTitle: true,
      },
    });

    if (!org) {
      return errorResponse("Organization not found.", "NOT_FOUND", 404);
    }

    return successResponse({
      organization: {
        name: org.name,
        displayName: org.displayName,
        tagline: org.tagline,
        email: org.email,
        phone: org.phone,
        website: org.website,
        address: org.address,
      },
      branding: {
        primaryColor: org.primaryColor,
        secondaryColor: org.secondaryColor,
        accentColor: org.accentColor,
        logoUrl: org.logoUrl,
      },
      // Centrally active letterhead configuration shared across quotations and MOUs
      letterhead: {
        letterheadUrl: org.letterheadUrl,
        headerText: org.letterheadHeaderText,
        footerText: org.letterheadFooterText,
        logoPosition: org.letterheadLogoPosition,
        defaultSignatoryName: org.defaultSignatoryName,
        defaultSignatoryTitle: org.defaultSignatoryTitle,
      },
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to retrieve branding configuration.");
  }
}

/**
 * PATCH /api/v1/organization/branding
 *
 * Updates branding colors, logos, and centralized letterhead.
 * Enforces 'org:manage_branding' permission and records an audit log.
 */
export async function PATCH(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    await requirePermission(req, "org:manage_branding");

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON payload.", "INVALID_JSON", 400);
    }

    const parsed = updateBrandingSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed. Please check branding inputs.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parsed.error.issues)
      );
    }

    const data = parsed.data;

    const updated = await prisma.organization.update({
      where: { id: tenantId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.tagline !== undefined ? { tagline: data.tagline } : {}),
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.email !== undefined && data.email ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.primaryColor !== undefined ? { primaryColor: data.primaryColor } : {}),
        ...(data.secondaryColor !== undefined ? { secondaryColor: data.secondaryColor } : {}),
        ...(data.accentColor !== undefined ? { accentColor: data.accentColor } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        ...(data.letterheadUrl !== undefined ? { letterheadUrl: data.letterheadUrl } : {}),
        ...(data.letterheadHeaderText !== undefined ? { letterheadHeaderText: data.letterheadHeaderText } : {}),
        ...(data.letterheadFooterText !== undefined ? { letterheadFooterText: data.letterheadFooterText } : {}),
        ...(data.letterheadLogoPosition !== undefined ? { letterheadLogoPosition: data.letterheadLogoPosition } : {}),
        ...(data.defaultSignatoryName !== undefined ? { defaultSignatoryName: data.defaultSignatoryName } : {}),
        ...(data.defaultSignatoryTitle !== undefined ? { defaultSignatoryTitle: data.defaultSignatoryTitle } : {}),
      },
    });

    await recordAuditLog({
      userId: user.id,
      organizationId: tenantId,
      userName: user.name,
      action: "BRANDING_LETTERHEAD_UPDATED",
      details: `Updated branding and letterhead configuration for organization '${updated.name}'`,
      ipAddress: req.headers.get("x-real-ip") || null,
    });

    return successResponse({
      message: "Branding and centralized letterhead updated successfully.",
      organization: {
        name: updated.name,
        displayName: updated.displayName,
        tagline: updated.tagline,
        email: updated.email,
        phone: updated.phone,
        website: updated.website,
        address: updated.address,
      },
      branding: {
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
        accentColor: updated.accentColor,
        logoUrl: updated.logoUrl,
      },
      letterhead: {
        letterheadUrl: updated.letterheadUrl,
        headerText: updated.letterheadHeaderText,
        footerText: updated.letterheadFooterText,
        logoPosition: updated.letterheadLogoPosition,
        defaultSignatoryName: updated.defaultSignatoryName,
        defaultSignatoryTitle: updated.defaultSignatoryTitle,
      },
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to update branding settings.");
  }
}

