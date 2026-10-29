import { UserRole } from "@prisma/client";
import type { User, Organization } from "@prisma/client";

/**
 * Role-Based Access Control (RBAC) & Permission Matrix
 *
 * Enforces server-side permissions across 6 distinct user roles:
 * - SUPER_ADMIN: Full platform-wide governance.
 * - SUPPORT_ADMIN: Cross-tenant monitoring and support management.
 * - ORG_ADMIN: Full administrative authority within a single organization.
 * - EDITOR: Document creation, line item editing, and sending within an organization.
 * - VIEWER: Read-only access within an organization.
 * - RECIPIENT: Document-specific recipient permissions.
 */

export type Permission =
  // Platform administration
  | "platform:manage_orgs"
  | "platform:manage_plans"
  | "platform:manage_settings"
  | "platform:view_audit_logs"
  | "platform:support_tickets"
  // Organization management
  | "org:manage_branding"
  | "org:manage_settings"
  | "org:manage_team"
  | "org:invite_members"
  | "org:view_reports"
  // Document operations
  | "doc:create"
  | "doc:edit"
  | "doc:approve"
  | "doc:send"
  | "doc:delete"
  | "doc:view"
  // External recipient operations
  | "recipient:sign"
  | "recipient:change_request"
  | "recipient:decline";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "platform:manage_orgs",
    "platform:manage_plans",
    "platform:manage_settings",
    "platform:view_audit_logs",
    "platform:support_tickets",
    "org:manage_branding",
    "org:manage_settings",
    "org:manage_team",
    "org:invite_members",
    "org:view_reports",
    "doc:create",
    "doc:edit",
    "doc:approve",
    "doc:send",
    "doc:delete",
    "doc:view",
  ],
  SUPPORT_ADMIN: [
    "platform:manage_orgs",
    "platform:support_tickets",
    "platform:view_audit_logs",
    "doc:view",
  ],
  ORG_ADMIN: [
    "org:manage_branding",
    "org:manage_settings",
    "org:manage_team",
    "org:invite_members",
    "org:view_reports",
    "doc:create",
    "doc:edit",
    "doc:approve",
    "doc:send",
    "doc:delete",
    "doc:view",
  ],
  EDITOR: [
    "doc:create",
    "doc:edit",
    "doc:send",
    "doc:view",
  ],
  VIEWER: [
    "doc:view",
  ],
  RECIPIENT: [
    "recipient:sign",
    "recipient:change_request",
    "recipient:decline",
  ],
};

/**
 * Returns the complete list of authorized permissions for a user role.
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Checks whether a given role is granted a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return Boolean(permissions && permissions.includes(permission));
}

/**
 * Returns true if the role possesses platform-level governance authority.
 */
export function isPlatformAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "SUPPORT_ADMIN";
}

/**
 * Returns true if the role is an organization administrator.
 */
export function isOrgAdmin(role: UserRole): boolean {
  return role === "ORG_ADMIN";
}

export interface SafeUser {
  id: string;
  organizationId: string | null;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  avatarUrl: string | null;
  phone: string | null;
  title: string | null;
  emailVerified: boolean;
  hasPassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface SafeOrganization {
  id: string;
  name: string;
  displayName: string | null;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  status: string;
}

/**
 * Strips password hashes and internal tokens from a user model.
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    organizationId: user.organizationId,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    title: user.title,
    emailVerified: user.emailVerified,
    hasPassword: Boolean(user.passwordHash),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

/**
 * Strips sensitive internal metadata from an organization model.
 */
export function toSafeOrganization(org: Organization): SafeOrganization {
  return {
    id: org.id,
    name: org.name,
    displayName: org.displayName,
    slug: org.slug,
    domain: org.domain,
    logoUrl: org.logoUrl,
    primaryColor: org.primaryColor,
    secondaryColor: org.secondaryColor,
    status: org.status,
  };
}

