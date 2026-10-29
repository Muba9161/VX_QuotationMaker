import { getSessionTokenFromRequest, validateSession, SessionContext } from "./session";
import { hasPermission, isPlatformAdmin, Permission } from "./permissions";
import { prisma } from "@/lib/prisma";
import type { Organization } from "@prisma/client";

export { requireTrustedOrigin, validateRequestOrigin } from "./csrf";

/**
 * Server-Side Authentication & Tenant-Isolation Guards
 *
 * Guarantees that:
 * 1. Unauthenticated requests are rejected with HTTP 401.
 * 2. Tenant identity for organization members is strictly derived from verified
 *    session records in PostgreSQL (ignoring client-supplied headers).
 * 3. Platform administrators can inspect target tenants by providing an explicit
 *    `x-tenant-id` header which is validated against PostgreSQL.
 * 4. Role-based privileges are verified server-side on every request.
 */

export class AuthError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = "UNAUTHORIZED", status = 401) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Authenticates the current request from session cookie or Authorization header.
 * Throws AuthError(401) if no valid active session exists.
 */
export async function authenticateRequest(req: Request): Promise<SessionContext> {
  const token = getSessionTokenFromRequest(req);
  if (!token) {
    throw new AuthError("Authentication required. Please sign in.", "UNAUTHORIZED", 401);
  }

  const context = await validateSession(token);
  if (!context) {
    throw new AuthError("Session has expired or is invalid. Please sign in again.", "UNAUTHORIZED", 401);
  }

  return context;
}

export interface TenantContext extends SessionContext {
  organization: Organization;
  tenantId: string;
}

/**
 * Resolves the authorized organization context and enforces multi-tenant isolation.
 *
 * Rules:
 * - Organization users (Org Admin, Editor, Viewer) are strictly pinned to their
 *   session's `organizationId`. Client-supplied headers are completely ignored.
 * - Platform Super/Support Admins accessing tenant scope must specify target workspace
 *   via `x-tenant-id`, which is validated directly against PostgreSQL.
 * - An organization must have status === 'ACTIVE'.
 * - Throws AuthError(403/404) if the tenant is missing, suspended, or inaccessible.
 */
export async function requireTenantContext(req: Request): Promise<TenantContext> {
  const context = await authenticateRequest(req);
  const { user, organization } = context;

  // 1. Organization members (Org Admin, Editor, Viewer)
  // Strictly locked to session organization; client-supplied x-tenant-id is ignored
  if (!isPlatformAdmin(user.role)) {
    if (!user.organizationId) {
      throw new AuthError(
        "This operation requires an active organization membership.",
        "TENANT_REQUIRED",
        403
      );
    }

    if (!organization) {
      throw new AuthError("Associated organization could not be found.", "ORGANIZATION_NOT_FOUND", 404);
    }

    if (organization.status !== "ACTIVE") {
      throw new AuthError(
        "Your organization workspace is currently suspended or pending verification.",
        "ORGANIZATION_INACTIVE",
        403
      );
    }

    return {
      ...context,
      organization,
      tenantId: organization.id,
    };
  }

  // 2. Platform Admins (SUPER_ADMIN, SUPPORT_ADMIN)
  // May explicitly request tenant context via 'x-tenant-id' header
  const requestedTenantId = req.headers.get("x-tenant-id");
  if (requestedTenantId) {
    const targetOrg = await prisma.organization.findUnique({
      where: { id: requestedTenantId },
    });

    if (!targetOrg) {
      throw new AuthError(
        "Requested organization workspace not found.",
        "ORGANIZATION_NOT_FOUND",
        404
      );
    }

    if (targetOrg.status !== "ACTIVE") {
      throw new AuthError(
        "Requested organization workspace is currently suspended or pending verification.",
        "ORGANIZATION_INACTIVE",
        403
      );
    }

    return {
      ...context,
      organization: targetOrg,
      tenantId: targetOrg.id,
    };
  }

  // Fallback: If platform admin has an assigned home organization and did not specify x-tenant-id
  if (user.organizationId && organization && organization.status === "ACTIVE") {
    return {
      ...context,
      organization,
      tenantId: organization.id,
    };
  }

  throw new AuthError(
    "Platform administrator must specify target workspace via 'x-tenant-id' header.",
    "TENANT_REQUIRED",
    403
  );
}

/**
 * Enforces that the authenticated user possesses a required permission.
 * Throws AuthError(403) if the user's role lacks the permission.
 */
export async function requirePermission(
  req: Request,
  permission: Permission
): Promise<SessionContext> {
  const context = await authenticateRequest(req);

  if (!hasPermission(context.user.role, permission)) {
    throw new AuthError(
      `Access denied. Your role (${context.user.role}) lacks the required '${permission}' permission.`,
      "FORBIDDEN",
      403
    );
  }

  return context;
}

/**
 * Enforces that the authenticated user is a Platform Administrator (SUPER_ADMIN or SUPPORT_ADMIN).
 * Throws AuthError(403) if an organization member attempts to access platform-wide controls.
 */
export async function requirePlatformAdmin(req: Request): Promise<SessionContext> {
  const context = await authenticateRequest(req);

  if (!isPlatformAdmin(context.user.role)) {
    throw new AuthError(
      "Access denied. Platform administrator privileges are required.",
      "FORBIDDEN",
      403
    );
  }

  return context;
}
