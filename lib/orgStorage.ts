export interface OrgDocumentItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface OrgMOUClause {
  id: string;
  title: string;
  content: string;
}

export interface OrgRecipient {
  id: string;
  name: string;
  email: string;
  role: 'Signer' | 'CC';
  hasSigned?: boolean;
  signedAt?: string;
  signatureData?: string;
}

export interface OrgDocument {
  id: string;
  docNumber: string;
  title: string;
  type: 'quotation' | 'mou';
  customerName: string;
  customerAddress?: string;
  date: string;
  validTill: string;
  items: OrgDocumentItem[];
  clauses: OrgMOUClause[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentTerms: string;
  notes: string;
  status: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  createdAt: string;
  recipients: OrgRecipient[];
  signToken?: string;
}

export interface OrgTeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Org Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Invited';
  inviteToken?: string;
}

export interface OrgBranding {
  name: string;
  tagline: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  allowRegistration: boolean;
  requireApproval: boolean;
  defaultExpiryDays: number;
  letterheadHeaderStyle?: 'Modern Accent' | 'Classic Centered' | 'Minimal';
  letterheadSignatoryName?: string;
  letterheadSignatoryTitle?: string;
  letterheadShowLogo?: boolean;
  letterheadShowAddress?: boolean;
  letterheadShowTagline?: boolean;
}

const ORG_STORAGE_KEY = 'vorldx_org_admin_store';

interface OrgStore {
  documents: OrgDocument[];
  team: OrgTeamMember[];
  branding: OrgBranding;
}

const DEFAULT_ORG_STORE: OrgStore = {
  branding: {
    name: 'Acme Technologies Pvt Ltd',
    tagline: 'Innovating for a Better Tomorrow',
    website: 'https://www.acme.com',
    email: 'contact@acme.com',
    phone: '+91 9876543210',
    address: 'A-123, Sector 62, Noida, U.P. 201301',
    primaryColor: '#2563EB',
    secondaryColor: '#10B981',
    logoUrl: '',
    allowRegistration: true,
    requireApproval: true,
    defaultExpiryDays: 30,
    letterheadHeaderStyle: 'Modern Accent',
    letterheadSignatoryName: '',
    letterheadSignatoryTitle: '',
    letterheadShowLogo: true,
    letterheadShowAddress: true,
    letterheadShowTagline: true,
  },
  team: [
    { id: 'tm-1', name: 'Rahul Sharma', email: 'rahul@acme.com', role: 'Org Admin', status: 'Active' },
    { id: 'tm-2', name: 'Priya Singh', email: 'priya@acme.com', role: 'Editor', status: 'Active' },
    { id: 'tm-3', name: 'Amit Verma', email: 'amit@acme.com', role: 'Editor', status: 'Active' },
    { id: 'tm-4', name: 'Neha Gupta', email: 'neha@acme.com', role: 'Editor', status: 'Invited' },
    { id: 'tm-5', name: 'Karan Mehta', email: 'karan@acme.com', role: 'Viewer', status: 'Active' },
  ],
  documents: [
    {
      id: 'doc-1',
      docNumber: 'Q-001',
      title: 'Website Development',
      type: 'quotation',
      customerName: 'Tech Solutions Pvt Ltd',
      customerAddress: 'A-123, Sector 62, Noida, U.P. 201301',
      date: '28-10-2026',
      validTill: '28-11-2026',
      items: [
        { id: 'item-1', description: 'Website Development', quantity: 1, unit: 'Nos', rate: 25000, amount: 25000 },
        { id: 'item-2', description: 'Hosting Setup', quantity: 1, unit: 'Nos', rate: 5000, amount: 5000 },
      ],
      clauses: [],
      subtotal: 30000,
      taxRate: 18,
      taxAmount: 5400,
      discount: 0,
      total: 35400,
      paymentTerms: '50% advance, 50% on delivery',
      notes: 'Thank you for your business.',
      status: 'Sent',
      createdAt: '28 Oct 2026',
      signToken: 'token-q-001',
      recipients: [
        { id: 'rec-1', name: 'John Doe', email: 'john@techsolutions.com', role: 'Signer', hasSigned: false },
        { id: 'rec-2', name: 'Priya Mehta', email: 'priya@techsolutions.com', role: 'CC' },
      ],
    },
    {
      id: 'doc-2',
      docNumber: 'MOU-001',
      title: 'Partnership Agreement',
      type: 'mou',
      customerName: 'Global Systems',
      customerAddress: 'Whitefield, Bengaluru, Karnataka',
      date: '26-10-2026',
      validTill: '26-11-2026',
      items: [],
      clauses: [
        { id: 'c-1', title: 'Purpose of Agreement', content: 'Collaboration on cloud transformation.' },
        { id: 'c-2', title: 'Scope of Collaboration', content: 'Joint solution delivery and architecture.' },
        { id: 'c-3', title: 'Responsibilities of Parties', content: 'Provisioning resources, sharing roadmaps.' },
        { id: 'c-4', title: 'Confidentiality', content: 'Strict non-disclosure of proprietary information.' },
        { id: 'c-5', title: 'Termination', content: '30 days written notice.' },
      ],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      paymentTerms: 'Quarterly settlement',
      notes: 'Both parties agree to execute under Indian jurisdiction.',
      status: 'Signed',
      createdAt: '26 Oct 2026',
      signToken: 'token-mou-001',
      recipients: [
        { id: 'rec-3', name: 'Rajesh Gupta', email: 'rajesh@globalsystems.com', role: 'Signer', hasSigned: true, signedAt: '27 Oct 2026 14:15' },
      ],
    },
    {
      id: 'doc-3',
      docNumber: 'Q-002',
      title: 'IT Support Services',
      type: 'quotation',
      customerName: 'NextGen Digital',
      customerAddress: 'Cyber City, Gurugram, Haryana',
      date: '25-10-2026',
      validTill: '25-11-2026',
      items: [
        { id: 'item-3', description: 'Annual Maintenance Support', quantity: 1, unit: 'Year', rate: 75000, amount: 75000 },
      ],
      clauses: [],
      subtotal: 75000,
      taxRate: 18,
      taxAmount: 13500,
      discount: 2500,
      total: 86000,
      paymentTerms: '100% advance upon contract signing',
      notes: 'SLA guarantees 4 hour response time.',
      status: 'Draft',
      createdAt: '25 Oct 2026',
      signToken: 'token-q-002',
      recipients: [
        { id: 'rec-4', name: 'Alok Nath', email: 'alok@nextgen.com', role: 'Signer', hasSigned: false },
      ],
    },
    {
      id: 'doc-4',
      docNumber: 'MOU-002',
      title: 'Strategic Collaboration',
      type: 'mou',
      customerName: 'Innovate India',
      customerAddress: 'BKC, Mumbai, Maharashtra',
      date: '24-10-2026',
      validTill: '24-11-2026',
      items: [],
      clauses: [
        { id: 'c-6', title: 'Purpose of Agreement', content: 'Promoting digital research innovations.' },
        { id: 'c-7', title: 'Scope of Collaboration', content: 'Incubation mentorship and technical seminars.' },
      ],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      paymentTerms: 'Non-financial goodwill agreement',
      notes: 'Signed in good faith.',
      status: 'Draft',
      createdAt: '24 Oct 2026',
      signToken: 'token-mou-002',
      recipients: [],
    },
  ],
};

function getOrgStore(): OrgStore {
  if (typeof window === 'undefined') return DEFAULT_ORG_STORE;
  try {
    const raw = localStorage.getItem(ORG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(DEFAULT_ORG_STORE));
      return DEFAULT_ORG_STORE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ORG_STORE;
  }
}

function saveOrgStore(store: OrgStore) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(store));
}

export function getOrgDocuments(): OrgDocument[] {
  return getOrgStore().documents;
}

export function getOrgDocumentById(id: string): OrgDocument | undefined {
  if (!id) return undefined;
  const norm = id.toLowerCase();
  return getOrgDocuments().find(
    d => d.id.toLowerCase() === norm ||
         d.docNumber.toLowerCase() === norm ||
         d.signToken?.toLowerCase() === norm ||
         d.id.toLowerCase().replace(/[^a-z0-9]/g, '') === norm.replace(/[^a-z0-9]/g, '')
  );
}

export function saveOrgDocument(doc: OrgDocument) {
  const store = getOrgStore();
  const idx = store.documents.findIndex(d => d.id === doc.id);
  if (idx >= 0) {
    store.documents[idx] = doc;
  } else {
    store.documents.unshift(doc);
  }
  saveOrgStore(store);
}

export function deleteOrgDocument(id: string) {
  const store = getOrgStore();
  store.documents = store.documents.filter(d => d.id !== id);
  saveOrgStore(store);
}

export function getOrgTeam(): OrgTeamMember[] {
  return getOrgStore().team;
}

export function saveOrgTeamMember(member: OrgTeamMember) {
  const store = getOrgStore();
  const idx = store.team.findIndex((m) => m.id === member.id);
  if (idx >= 0) {
    store.team[idx] = member;
  } else {
    store.team.push(member);
  }
  saveOrgStore(store);
}

export function deleteOrgTeamMember(id: string) {
  const store = getOrgStore();
  store.team = store.team.filter((m) => m.id !== id);
  saveOrgStore(store);
}

export function getOrgBranding(): OrgBranding {
  const branding = getOrgStore().branding;
  if (branding && branding.logoUrl && branding.logoUrl.includes('dicebear')) {
    branding.logoUrl = '';
  }
  return branding;
}

export function saveOrgBranding(branding: OrgBranding) {
  const store = getOrgStore();
  store.branding = branding;
  saveOrgStore(store);
}
