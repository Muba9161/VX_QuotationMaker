import { prisma } from "@/lib/prisma";
import { loginSchema, formatZodIssues } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, attachSessionCookie } from "@/lib/auth/session";
import {
  toSafeUser,
  toSafeOrganization,
  getRolePermissions,
} from "@/lib/auth/permissions";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/auth/login
 *
 * Validates credentials against PostgreSQL, checks account status,
 * establishes a revocable hashed session, and sets a secure HTTP-only cookie.
 */
export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON request body.", "INVALID_JSON", 400);
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Validation failed. Please verify your inputs.",
        "VALIDATION_ERROR",
        400,
        formatZodIssues(parsed.error.issues)
      );
    }

    const { email, password } = parsed.data;

    // Query user by email with organization relation
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    // Timing-safe style: verify credentials without leaking email existence
    const isValid = user && user.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : false;

    if (!user || !isValid) {
      return errorResponse(
        "Invalid email or password.",
        "INVALID_CREDENTIALS",
        401
      );
    }

    // Check user account status
    if (user.status !== "ACTIVE") {
      return errorResponse(
        "Your account is inactive or has been suspended. Please contact your administrator.",
        "ACCOUNT_INACTIVE",
        403
      );
    }

    // Check organization status if user is an organization member
    if (user.organization && user.organization.status !== "ACTIVE") {
      return errorResponse(
        "Your organization workspace is currently suspended or pending verification.",
        "ORGANIZATION_INACTIVE",
        403
      );
    }

    // Extract client network metadata
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    // Create session in PostgreSQL
    const { rawToken } = await createSession(user.id, {
      ipAddress,
      userAgent,
    });

    // Update user's last login timestamp
    await prisma.user
      .update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      .catch(() => {});

    // Prepare response payload
    const safeUser = toSafeUser(user);
    const safeOrg = user.organization ? toSafeOrganization(user.organization) : null;
    const permissions = getRolePermissions(user.role);

    const res = successResponse({
      user: safeUser,
      organization: safeOrg,
      permissions,
    });

    // Attach secure HTTP-only cookie
    attachSessionCookie(res, rawToken);

    return res;
  } catch (err: unknown) {
    return handleApiError(err, "An error occurred during authentication.");
  }
}

