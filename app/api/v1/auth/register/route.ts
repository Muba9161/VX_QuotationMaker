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
import { requireTrustedOrigin, AuthError } from "@/lib/auth/guards";
import { checkDistributedAuthRateLimit } from "@/lib/auth/redis-rate-limiter";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { saveTenantAssetBuffer, deleteTenantAsset, UploadError } from "@/lib/storage/upload";

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
 * Enforces Origin validation (CSRF) and in-memory rate limiting.
 */
export async function POST(req: Request) {
  try {
    // 1. Enforce Origin/CSRF validation
    requireTrustedOrigin(req);

    // 2. Enforce distributed IP-based rate limiting
    const rateLimit = await checkDistributedAuthRateLimit(req, "register");
    if (!rateLimit.allowed) {
      return errorResponse(
        `Too many registration requests from your network. Please try again in ${rateLimit.resetInSeconds} seconds.`,
        "RATE_LIMIT_EXCEEDED",
        429,
        undefined,
        { "Retry-After": String(rateLimit.resetInSeconds) }
      );
    }

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

    // 3. Pre-validate optional logo upload if provided
    let logoBuffer: Buffer | null = null;
    let logoMime = "image/png";
    let logoName = "logo.png";

    if (parsed.data.logoBase64 && parsed.data.logoBase64.trim()) {
      const match = parsed.data.logoBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      const rawMime = match ? match[1] : (parsed.data.logoMimeType || "image/png");
      const base64Data = match ? match[2] : parsed.data.logoBase64;

      const allowedLogoMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedLogoMimes.includes(rawMime.toLowerCase())) {
        return errorResponse(
          "Invalid logo format. Supported formats: PNG, JPG, JPEG, WebP.",
          "INVALID_LOGO_TYPE",
          400
        );
      }

      try {
        logoBuffer = Buffer.from(base64Data, "base64");
      } catch {
        return errorResponse("Invalid logo file data.", "INVALID_LOGO_DATA", 400);
      }

      if (logoBuffer.length === 0) {
        return errorResponse("Logo image cannot be empty.", "EMPTY_LOGO_FILE", 400);
      }

      if (logoBuffer.length > 5 * 1024 * 1024) {
        return errorResponse(
          "Logo image exceeds maximum allowed size of 5MB.",
          "LOGO_TOO_LARGE",
          400
        );
      }

      logoMime = rawMime.toLowerCase();
      logoName = parsed.data.logoFilename || `logo${logoMime === "image/png" ? ".png" : logoMime === "image/webp" ? ".webp" : ".jpg"}`;
    }

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

      let orgWithLogo = org;
      if (logoBuffer) {
        const stored = await saveTenantAssetBuffer(org.id, logoBuffer, logoName, logoMime, "logo");
        orgWithLogo = await tx.organization.update({
          where: { id: org.id },
          data: { logoUrl: stored.publicUrl },
        });
      }

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

      return { createdOrg: orgWithLogo, createdUser: user };
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
    if (err instanceof AuthError) {
      return errorResponse(err.message, err.code, err.status);
    }
    return handleApiError(err, "Failed to register organization.");
  }
}
