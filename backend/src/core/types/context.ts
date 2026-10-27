/**
 * User roles defined by the VorldX specification:
 * - Platform Admin (internal operator: manages organizations, support, abuse)
 * - Organization Admin (owns organization workspace, branding, templates, settings)
 * - Editor (workspace member preparing drafts and quotations/MOUs)
 * - External Recipient (invited via secure document link, no workspace account)
 * - Registered User (optional organization member with scoped permissions)
 */
export type UserRole =
  'PLATFORM_ADMIN' | 'ORGANIZATION_ADMIN' | 'EDITOR' | 'REGISTERED_USER' | 'EXTERNAL_RECIPIENT';

export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

export interface TenantContext {
  organizationId: string;
  tenantSlug?: string;
  isActive: boolean;
}

export interface DocumentRecipientContext {
  documentId: string;
  recipientEmail: string;
  tokenHash: string;
  expiresAt: Date;
}
