export type UserRole = 'platform_admin' | 'org_admin' | 'editor';
export type DocumentType = 'quotation' | 'mou';
export type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'viewed' | 'signed' | 'declined' | 'revision_requested' | 'expired' | 'revoked';
export type SignatureMethod = 'draw' | 'type' | 'upload';

export interface Organization {
  id: string; name: string; displayName: string; email: string; phone?: string;
  address?: string; website?: string; taxId?: string; cin?: string;
  logoUrl?: string; primaryColor: string; secondaryColor: string; accentColor: string;
  letterheadUrl?: string; letterheadHeader?: string; letterheadFooter?: string;
  letterheadLogoPosition?: string; signatory?: string; signatoryDesignation?: string;
  registrationEnabled: boolean; createdAt: string; updatedAt: string;
}
export interface User {
  id: string; orgId: string; name: string; email: string; passwordHash: string;
  role: UserRole; isActive: boolean; createdAt: string;
}
export interface TemplateVariable { key: string; label: string; defaultValue?: string; }
export interface Template {
  id: string; orgId: string; name: string; type: DocumentType; content: string;
  variables: TemplateVariable[]; isApproved: boolean; version: number;
  createdBy: string; createdAt: string; updatedAt: string;
}
export interface LineItem {
  id: string; description: string; quantity: number; unitPrice: number;
  taxPercent: number; total: number;
}
export interface MouParty {
  id: string; name: string; designation?: string; organization?: string;
  email: string; signatureToken?: string;
}
export interface Signature {
  signerName: string; signerEmail: string; method: SignatureMethod; data: string;
  timestamp: string; token: string; partyId?: string;
}
export interface AuditEvent {
  id: string; documentId: string; event: string; actor: string;
  timestamp: string; metadata?: Record<string, string>;
}
export interface QuotationDocument {
  id: string; orgId: string; type: 'quotation'; title: string; number?: string;
  clientName: string; clientEmail: string; clientAddress?: string; clientPhone?: string;
  templateId?: string; content: string; lineItems: LineItem[];
  subtotal: number; taxTotal: number; discount: number; grandTotal: number;
  currency: string; validUntil?: string; notes?: string; termsAndConditions?: string;
  status: DocumentStatus; shareToken: string; signatures: Signature[];
  auditLog: AuditEvent[]; createdBy: string; createdAt: string; updatedAt: string;
  approvedBy?: string; approvedAt?: string;
}
export interface MouDocument {
  id: string; orgId: string; type: 'mou'; title: string; number?: string;
  parties: MouParty[]; templateId?: string; content: string;
  effectiveDate?: string; expiryDate?: string; governingLaw?: string; purpose?: string;
  status: DocumentStatus; shareToken: string; signatures: Signature[];
  auditLog: AuditEvent[]; createdBy: string; createdAt: string; updatedAt: string;
  approvedBy?: string; approvedAt?: string;
}
export type Document = QuotationDocument | MouDocument;
export interface AuthSession {
  userId: string; orgId: string; role: UserRole; name: string; email: string; expiresAt: string;
}
export interface AppStore {
  organizations: Organization[]; users: User[]; templates: Template[];
  documents: Document[]; auditLogs: AuditEvent[];
}
