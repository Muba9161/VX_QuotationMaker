import { AppStore, Organization, User, Template, Document, AuthSession, AuditEvent } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORE_KEY = 'vorldx_app_store';
const SESSION_KEY = 'vorldx_session';

function getStore(): AppStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) { const s = seedStore(); saveStore(s); return s; }
    return JSON.parse(raw);
  } catch { return emptyStore(); }
}
function emptyStore(): AppStore {
  return { organizations: [], users: [], templates: [], documents: [], auditLogs: [] };
}
function saveStore(store: AppStore) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
function seedStore(): AppStore {
  const orgId = uuidv4();
  const adminId = uuidv4();
  const now = new Date().toISOString();
  const org: Organization = {
    id: orgId, name: 'vorldx', displayName: 'VorldX Industries', email: 'hello@vorldx.com',
    phone: '+91-9999999999', address: 'Lucknow, U.P., India', website: 'https://vorldx.com',
    cin: 'U62099UP2026PTC245598', primaryColor: '#0f172a', secondaryColor: '#6366f1',
    accentColor: '#f59e0b', logoUrl: '', letterheadHeader: '', letterheadFooter: '',
    signatory: 'Authorized Signatory', signatoryDesignation: 'Director',
    registrationEnabled: true, createdAt: now, updatedAt: now,
  };
  const user: User = {
    id: adminId, orgId, name: 'Admin User', email: 'admin@vorldx.com',
    passwordHash: btoa('admin123'), role: 'org_admin', isActive: true, createdAt: now,
  };
  const qtmpl: Template = {
    id: uuidv4(), orgId, name: 'Standard Quotation', type: 'quotation',
    content: `<h2>Quotation for {{client_name}}</h2><p>Dear {{client_name}},</p><p>We are pleased to submit our quotation for {{project_name}}.</p><p>Please find the details below:</p>`,
    variables: [{ key: 'client_name', label: 'Client Name' }, { key: 'project_name', label: 'Project Name' }],
    isApproved: true, version: 1, createdBy: adminId, createdAt: now, updatedAt: now,
  };
  const moutmpl: Template = {
    id: uuidv4(), orgId, name: 'Standard MOU', type: 'mou',
    content: `<h2>Memorandum of Understanding</h2><p>This MOU is entered into on {{effective_date}} between the parties mentioned herein.</p><h3>Purpose</h3><p>{{purpose}}</p><h3>Terms</h3><p>{{terms}}</p>`,
    variables: [{ key: 'effective_date', label: 'Effective Date' }, { key: 'purpose', label: 'Purpose' }, { key: 'terms', label: 'Terms' }],
    isApproved: true, version: 1, createdBy: adminId, createdAt: now, updatedAt: now,
  };
  return { organizations: [org], users: [user], templates: [qtmpl, moutmpl], documents: [], auditLogs: [] };
}

export type { Organization, User, Template, Document, AuthSession, AuditEvent, AppStore };

// ── Session ──────────────────────────────────────
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try { const r = sessionStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
export function setSession(s: AuthSession) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
export function clearSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

// ── Auth ─────────────────────────────────────────
export function login(email: string, password: string): AuthSession | null {
  const store = getStore();
  const user = store.users.find(u => u.email === email && u.isActive);
  if (!user) return null;
  if (user.passwordHash !== btoa(password)) return null;
  const org = store.organizations.find(o => o.id === user.orgId);
  if (!org) return null;
  const session: AuthSession = {
    userId: user.id, orgId: user.orgId, role: user.role,
    name: user.name, email: user.email,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
  setSession(session); return session;
}
export function register(orgName: string, adminName: string, email: string, password: string): AuthSession | null {
  const store = getStore();
  if (store.users.find(u => u.email === email)) return null;
  const orgId = uuidv4(); const userId = uuidv4(); const now = new Date().toISOString();
  const org: Organization = {
    id: orgId, name: orgName.toLowerCase().replace(/\s+/g, '-'), displayName: orgName,
    email, primaryColor: '#0f172a', secondaryColor: '#6366f1', accentColor: '#f59e0b',
    registrationEnabled: false, createdAt: now, updatedAt: now,
  };
  const user: User = {
    id: userId, orgId, name: adminName, email, passwordHash: btoa(password),
    role: 'org_admin', isActive: true, createdAt: now,
  };
  store.organizations.push(org); store.users.push(user); saveStore(store);
  const session: AuthSession = { userId, orgId, role: 'org_admin', name: adminName, email, expiresAt: new Date(Date.now() + 8 * 3600000).toISOString() };
  setSession(session); return session;
}

// ── Organizations ─────────────────────────────────
export function getOrg(orgId: string): Organization | undefined {
  return getStore().organizations.find(o => o.id === orgId);
}
export function updateOrg(orgId: string, data: Partial<Organization>) {
  const store = getStore();
  const idx = store.organizations.findIndex(o => o.id === orgId);
  if (idx >= 0) { store.organizations[idx] = { ...store.organizations[idx], ...data, updatedAt: new Date().toISOString() }; saveStore(store); }
}

// ── Users ─────────────────────────────────────────
export function getOrgUsers(orgId: string): User[] {
  return getStore().users.filter(u => u.orgId === orgId);
}
export function addUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const store = getStore();
  const newUser: User = { ...user, id: uuidv4(), createdAt: new Date().toISOString() };
  store.users.push(newUser); saveStore(store); return newUser;
}
export function updateUser(userId: string, data: Partial<User>) {
  const store = getStore();
  const idx = store.users.findIndex(u => u.id === userId);
  if (idx >= 0) { store.users[idx] = { ...store.users[idx], ...data }; saveStore(store); }
}

// ── Templates ─────────────────────────────────────
export function getTemplates(orgId: string): Template[] {
  return getStore().templates.filter(t => t.orgId === orgId);
}
export function saveTemplate(tmpl: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
  const store = getStore(); const now = new Date().toISOString();
  const t: Template = { ...tmpl, id: uuidv4(), createdAt: now, updatedAt: now };
  store.templates.push(t); saveStore(store); return t;
}
export function updateTemplate(id: string, data: Partial<Template>) {
  const store = getStore();
  const idx = store.templates.findIndex(t => t.id === id);
  if (idx >= 0) { store.templates[idx] = { ...store.templates[idx], ...data, updatedAt: new Date().toISOString() }; saveStore(store); }
}
export function deleteTemplate(id: string) {
  const store = getStore(); store.templates = store.templates.filter(t => t.id !== id); saveStore(store);
}

// ── Documents ─────────────────────────────────────
export function getDocuments(orgId: string): Document[] {
  return getStore().documents.filter(d => d.orgId === orgId);
}
export function getDocumentByToken(token: string): Document | undefined {
  return getStore().documents.find(d => d.shareToken === token);
}
export function getDocument(id: string): Document | undefined {
  return getStore().documents.find(d => d.id === id);
}
export function saveDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'shareToken' | 'signatures' | 'auditLog'>): Document {
  const store = getStore(); const now = new Date().toISOString();
  const newDoc = { ...doc, id: uuidv4(), shareToken: uuidv4(), signatures: [], auditLog: [], createdAt: now, updatedAt: now } as unknown as Document;
  store.documents.push(newDoc); saveStore(store); return newDoc;
}
export function updateDocument(id: string, data: Partial<Document>) {
  const store = getStore();
  const idx = store.documents.findIndex(d => d.id === id);
  if (idx >= 0) { store.documents[idx] = { ...store.documents[idx], ...data, updatedAt: new Date().toISOString() } as unknown as Document; saveStore(store); }
}
export function addSignature(docId: string, sig: Signature) {
  const store = getStore();
  const idx = store.documents.findIndex(d => d.id === docId);
  if (idx >= 0) {
    (store.documents[idx] as Document).signatures.push(sig);
    store.documents[idx].status = 'signed';
    store.documents[idx].updatedAt = new Date().toISOString();
    saveStore(store);
  }
}
export function addAuditLog(docId: string, event: string, actor: string, metadata?: Record<string, string>) {
  const store = getStore();
  const idx = store.documents.findIndex(d => d.id === docId);
  const entry: AuditEvent = { id: uuidv4(), documentId: docId, event, actor, timestamp: new Date().toISOString(), metadata };
  if (idx >= 0) { store.documents[idx].auditLog.push(entry); saveStore(store); }
}
export function deleteDocument(id: string) {
  const store = getStore(); store.documents = store.documents.filter(d => d.id !== id); saveStore(store);
}

import { Signature } from './types';
