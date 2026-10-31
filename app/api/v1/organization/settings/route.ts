import { prisma } from "@/lib/prisma";
import { requireTenantContext, requirePermission, requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { updateSettingsSchema } from "@/lib/validations/organization";
import { formatZodIssues } from "@/lib/validations/auth";
import { recordAuditLog } from "@/lib/audit";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import {
  getTenantCache,
  setTenantCache,
  invalidateTenantResource,
} from "@/lib/cache/tenant-cache";

/**
 * GET /api/v1/organization/settings
 *
 * Retrieves the current organization workspace profile, commercial settings,
 * default quotation terms, and tax preferences.
 */
export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext(req);

    const cached = await getTenantCache<Record<string, unknown>>(tenantId, "settings", "profile");
    if (cached) {
      return successResponse(cached);
    }

    const org = await prisma.organization.findUnique({
      where: { id: tenantId },
      include: {
        settings: true,
      },
    });

    if (!org) {
      return errorResponse("Organization workspace not found.", "NOT_FOUND", 404);
    }

    const responseData = {
      organization: {
        id: org.id,
        name: org.name,
        displayName: org.displayName,
        slug: org.slug,
        domain: org.domain,
        tagline: org.tagline,
        email: org.email,
        phone: org.phone,
        website: org.website,
        address: org.address,
        taxId: org.taxId,
        cin: org.cin,
        defaultExpiryDays: org.defaultExpiryDays,
        allowMemberRegistration: org.allowMemberRegistration,
        requireAdminApproval: org.requireAdminApproval,
        status: org.status,
      },
      settings: org.settings
        ? {
            defaultTaxRate: Number(org.settings.defaultTaxRate),
            defaultCurrency: org.settings.defaultCurrency,
            defaultCurrencySymbol: org.settings.defaultCurrencySymbol,
            defaultPaymentTerms: org.settings.defaultPaymentTerms,
            standardNotes: org.settings.standardNotes,
            standardTermsConditions: org.settings.standardTermsConditions,
            enableWatermark: org.settings.enableWatermark,
            autoRemindersEnabled: org.settings.autoRemindersEnabled,
            reminderDaysBeforeExpiry: org.settings.reminderDaysBeforeExpiry,
            notifyDocViewed: org.settings.notifyDocViewed,
            notifyDocSigned: org.settings.notifyDocSigned,
            notifyDocExpired: org.settings.notifyDocExpired,
          }
        : null,
    };

    await setTenantCache(tenantId, "settings", "profile", responseData, 300);
    return successResponse(responseData);
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to fetch organization settings.");
  }
}

/**
 * PATCH /api/v1/organization/settings
 *
 * Updates organization profile and commercial settings in a transactional operation.
 * Enforces 'org:manage_settings' permission and records an audit log.
 */
export async function PATCH(req: Request) {
  try {
    requireTrustedOrigin(req);
    const { tenantId, user } = await requireTenantContext(req);
    await requirePermission(req, "org:manage_settings");

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON payload.", "INVALID_JSON", 400);
    }

    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed. Please verify your settings.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parsed.error.issues)
      );
    }

    const data = parsed.data;

    // Transactional update across Organization and OrganizationSettings
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Organization Profile Fields
      const orgUpdateData: Record<string, unknown> = {};
      if (data.name !== undefined) orgUpdateData.name = data.name;
      if (data.displayName !== undefined) orgUpdateData.displayName = data.displayName;
      if (data.tagline !== undefined) orgUpdateData.tagline = data.tagline;
      if (data.email !== undefined) orgUpdateData.email = data.email;
      if (data.phone !== undefined) orgUpdateData.phone = data.phone;
      if (data.website !== undefined) orgUpdateData.website = data.website;
      if (data.address !== undefined) orgUpdateData.address = data.address;
      if (data.taxId !== undefined) orgUpdateData.taxId = data.taxId;
      if (data.cin !== undefined) orgUpdateData.cin = data.cin;
      if (data.defaultExpiryDays !== undefined) orgUpdateData.defaultExpiryDays = data.defaultExpiryDays;
      if (data.allowMemberRegistration !== undefined) orgUpdateData.allowMemberRegistration = data.allowMemberRegistration;
      if (data.requireAdminApproval !== undefined) orgUpdateData.requireAdminApproval = data.requireAdminApproval;

      const updatedOrg = await tx.organization.update({
        where: { id: tenantId },
        data: orgUpdateData,
      });

      // 2. Upsert OrganizationSettings
      const settingsUpdateData: Record<string, unknown> = {};
      if (data.defaultTaxRate !== undefined) settingsUpdateData.defaultTaxRate = data.defaultTaxRate;
      if (data.defaultCurrency !== undefined) settingsUpdateData.defaultCurrency = data.defaultCurrency;
      if (data.defaultCurrencySymbol !== undefined) settingsUpdateData.defaultCurrencySymbol = data.defaultCurrencySymbol;
      if (data.defaultPaymentTerms !== undefined) settingsUpdateData.defaultPaymentTerms = data.defaultPaymentTerms;
      if (data.standardNotes !== undefined) settingsUpdateData.standardNotes = data.standardNotes;
      if (data.standardTermsConditions !== undefined) settingsUpdateData.standardTermsConditions = data.standardTermsConditions;
      if (data.autoRemindersEnabled !== undefined) settingsUpdateData.autoRemindersEnabled = data.autoRemindersEnabled;
      if (data.reminderDaysBeforeExpiry !== undefined) settingsUpdateData.reminderDaysBeforeExpiry = data.reminderDaysBeforeExpiry;
      if (data.notifyDocViewed !== undefined) settingsUpdateData.notifyDocViewed = data.notifyDocViewed;
      if (data.notifyDocSigned !== undefined) settingsUpdateData.notifyDocSigned = data.notifyDocSigned;
      if (data.notifyDocExpired !== undefined) settingsUpdateData.notifyDocExpired = data.notifyDocExpired;

      const updatedSettings = await tx.organizationSettings.upsert({
        where: { organizationId: tenantId },
        update: settingsUpdateData,
        create: {
          organizationId: tenantId,
          ...settingsUpdateData,
        },
      });

      return { org: updatedOrg, settings: updatedSettings };
    });

    // 3. Invalidate tenant cache on update
    await invalidateTenantResource(tenantId, "settings");

    // 4. Record Audit Log
    await recordAuditLog({
      userId: user.id,
      organizationId: tenantId,
      userName: user.name,
      action: "WORKSPACE_SETTINGS_UPDATED",
      details: `Updated workspace settings for organization '${updated.org.name}'`,
      ipAddress: req.headers.get("x-real-ip") || null,
    });

    return successResponse({
      message: "Workspace settings updated successfully.",
      organization: {
        id: updated.org.id,
        name: updated.org.name,
        displayName: updated.org.displayName,
        email: updated.org.email,
        phone: updated.org.phone,
        website: updated.org.website,
        address: updated.org.address,
        taxId: updated.org.taxId,
        defaultExpiryDays: updated.org.defaultExpiryDays,
      },
      settings: {
        defaultTaxRate: Number(updated.settings.defaultTaxRate),
        defaultCurrency: updated.settings.defaultCurrency,
        defaultCurrencySymbol: updated.settings.defaultCurrencySymbol,
        defaultPaymentTerms: updated.settings.defaultPaymentTerms,
        standardNotes: updated.settings.standardNotes,
        standardTermsConditions: updated.settings.standardTermsConditions,
      },
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to update workspace settings.");
  }
}

