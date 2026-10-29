import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerOrgSchema, formatZodIssues } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { createSession, attachSessionCookie } from "@/lib/auth/session";
import {
  toSafeUser,
  toSafeOrganization,
  getRolePermissions,
} from "@/lib/auth/permissions";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * POST /api/v1/auth/register
 *
 * Atomically onboards a new organization workspace, assigns the initial Org Admin,
 * creates default commercial workspace settings, and establishes the initial session.
 */
export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON request body.", "INVALID_JSON", 400);
    }

    const parsed = registerOrgSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed. Please verify your registration details.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parsed.error.issues)
      );
    }

    const { orgName, adminName, email, password, phone } = parsed.data;

    // Check if an account already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(
        "An account with this email address already exists. Please sign in instead.",
        "ACCOUNT_ALREADY_EXISTS",
        409
      );
    }

    // Generate unique organization slug
    const baseSlug = slugify(orgName) || "organization";
    const slugSuffix = crypto.randomBytes(3).toString("hex");
    const slug = `${baseSlug}-${slugSuffix}`;

    // Hash admin password
    const passwordHash = await hashPassword(password);

    // Network metadata for audit
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    // Atomic database onboarding transaction
    const { createdOrg, createdUser } = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: orgName,
          displayName: orgName,
          slug,
          email,
          phone: phone || null,
          status: "ACTIVE",
          primaryColor: "#2563EB",
          secondaryColor: "#10B981",
          accentColor: "#06B6D4",
          defaultExpiryDays: 30,
          allowMemberRegistration: true,
          requireAdminApproval: true,
        },
      });

      // 2. Create Default Workspace Settings
      await tx.organizationSettings.create({
        data: {
          organizationId: org.id,
          defaultTaxRate: 18.0,
          defaultCurrency: "INR",
          defaultCurrencySymbol: "₹",
          defaultPaymentTerms: "50% advance, 50% on milestone delivery",
          standardNotes: "Thank you for your business. Valid for 30 days.",
          standardTermsConditions:
            "• Payment within 30 days.\n• This quotation is valid for 30 days.",
          autoRemindersEnabled: true,
          reminderDaysBeforeExpiry: 3,
        },
      });

      // 3. Create Initial Organization Admin
      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          name: adminName,
          email,
          passwordHash,
          role: "ORG_ADMIN", // Strictly assigned server-side; client escalation impossible
          status: "ACTIVE",
          emailVerified: false,
          phone: phone || null,
        },
      });

      // 4. Record Initial Platform Audit Log
      await tx.platformAuditLog.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          userName: adminName,
          action: "ORGANIZATION_REGISTERED",
          details: `Registered organization workspace '${orgName}' (${org.id})`,
          ipAddress,
        },
      });

      return { createdOrg: org, createdUser: user };
    });

    // Create session for immediate post-registration sign-in
    const { rawToken } = await createSession(createdUser.id, {
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
    });

    const res = successResponse(
      {
        user: toSafeUser(createdUser),
        organization: toSafeOrganization(createdOrg),
        permissions: getRolePermissions(createdUser.role),
        message: "Organization registered successfully.",
      },
      201
    );

    // Attach secure session cookie
    attachSessionCookie(res, rawToken);

    return res;
  } catch (err: unknown) {
    return handleApiError(err, "Failed to register organization.");
  }
}

