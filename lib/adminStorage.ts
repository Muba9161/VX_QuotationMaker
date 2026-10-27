export interface PlatformOrg {
  id: string;
  name: string;
  displayName: string;
  domain: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  usersCount: number;
  maxUsers: number;
  documentsCount: number;
  maxDocuments: number;
  status: 'Active' | 'Suspended';
  joinedOn: string;
  validTill: string;
  tagline?: string;
  email: string;
  phone: string;
  address: string;
  storageLimit: string;
  logoUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  isFree: boolean;
  maxUsers: number;
  maxDocuments: number;
  storage: string;
  features: string[];
  status: 'Active' | 'Inactive';
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Support Admin' | 'Admin';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface PlatformAuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  dateTime: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  organization: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  maxUploadSizeMB: number;
  allowOrgRegistration: boolean;
  emailNotifications: boolean;
  maintenanceMode: boolean;
}

const STORAGE_KEY = 'vorldx_platform_admin_data';

interface PlatformAdminStore {
  organizations: PlatformOrg[];
  plans: SubscriptionPlan[];
  users: PlatformUser[];
  auditLogs: PlatformAuditLog[];
  supportTickets: SupportTicket[];
  settings: SystemSettings;
}

const DEFAULT_STORE: PlatformAdminStore = {
  organizations: [
    {
      id: 'org-1',
      name: 'acme',
      displayName: 'Acme Technologies Pvt Ltd',
      domain: 'acme.com',
      plan: 'Pro',
      usersCount: 12,
      maxUsers: 50,
      documentsCount: 145,
      maxDocuments: 5000,
      status: 'Active',
      joinedOn: '28 Oct 2026',
      validTill: '28 Oct 2027',
      tagline: 'Innovating for a Better Tomorrow',
      email: 'contact@acme.com',
      phone: '+91 9876543210',
      address: 'A-123, Sector 62, Noida, UP 201301',
      storageLimit: '10 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=acme'
    },
    {
      id: 'org-2',
      name: 'nextgen',
      displayName: 'NextGen Digital',
      domain: 'nextgen.com',
      plan: 'Basic',
      usersCount: 5,
      maxUsers: 5,
      documentsCount: 32,
      maxDocuments: 200,
      status: 'Active',
      joinedOn: '25 Oct 2026',
      validTill: '25 Oct 2027',
      tagline: 'Next Generation Software Services',
      email: 'info@nextgen.com',
      phone: '+91 9811223344',
      address: 'Cyber City, Gurugram, Haryana',
      storageLimit: '1 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=nextgen'
    },
    {
      id: 'org-3',
      name: 'global',
      displayName: 'Global Systems',
      domain: 'globalsystems.com',
      plan: 'Pro',
      usersCount: 18,
      maxUsers: 50,
      documentsCount: 210,
      maxDocuments: 5000,
      status: 'Active',
      joinedOn: '20 Oct 2026',
      validTill: '20 Oct 2027',
      tagline: 'Enterprise Cloud Solutions',
      email: 'hello@globalsystems.com',
      phone: '+91 9871122445',
      address: 'Whitefield, Bengaluru, Karnataka',
      storageLimit: '10 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=globalsys'
    },
    {
      id: 'org-4',
      name: 'techsolutions',
      displayName: 'Tech Solutions',
      domain: 'techsolutions.com',
      plan: 'Basic',
      usersCount: 8,
      maxUsers: 5,
      documentsCount: 64,
      maxDocuments: 200,
      status: 'Active',
      joinedOn: '18 Oct 2026',
      validTill: '18 Oct 2027',
      tagline: 'Delivering High Impact IT Results',
      email: 'contact@techsolutions.com',
      phone: '+91 9988776655',
      address: 'Hitec City, Hyderabad, Telangana',
      storageLimit: '1 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=techsol'
    },
    {
      id: 'org-5',
      name: 'innovate',
      displayName: 'Innovate India',
      domain: 'innovate.com',
      plan: 'Pro',
      usersCount: 15,
      maxUsers: 50,
      documentsCount: 98,
      maxDocuments: 5000,
      status: 'Suspended',
      joinedOn: '12 Oct 2026',
      validTill: '12 Oct 2027',
      tagline: 'Empowering Indian Creators',
      email: 'admin@innovate.com',
      phone: '+91 9911223388',
      address: 'BKC, Mumbai, Maharashtra',
      storageLimit: '10 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=innovate'
    },
    {
      id: 'org-6',
      name: 'brightfuture',
      displayName: 'Bright Future',
      domain: 'brightfuture.com',
      plan: 'Basic',
      usersCount: 6,
      maxUsers: 5,
      documentsCount: 41,
      maxDocuments: 200,
      status: 'Active',
      joinedOn: '08 Oct 2026',
      validTill: '08 Oct 2027',
      tagline: 'Shaping Tomorrow\'s Education',
      email: 'support@brightfuture.com',
      phone: '+91 9845001122',
      address: 'Koramangala, Bengaluru, Karnataka',
      storageLimit: '1 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=bright'
    },
    {
      id: 'org-7',
      name: 'codecraft',
      displayName: 'CodeCraft Solutions',
      domain: 'codecraft.com',
      plan: 'Pro',
      usersCount: 20,
      maxUsers: 50,
      documentsCount: 320,
      maxDocuments: 5000,
      status: 'Active',
      joinedOn: '01 Oct 2026',
      validTill: '01 Oct 2027',
      tagline: 'Modern Web & Mobile Architects',
      email: 'build@codecraft.com',
      phone: '+91 9870001234',
      address: 'Salt Lake Sector V, Kolkata, WB',
      storageLimit: '10 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=codecraft'
    },
    {
      id: 'org-8',
      name: 'datamind',
      displayName: 'DataMind Analytics',
      domain: 'datamind.com',
      plan: 'Basic',
      usersCount: 4,
      maxUsers: 5,
      documentsCount: 28,
      maxDocuments: 200,
      status: 'Active',
      joinedOn: '28 Sep 2026',
      validTill: '28 Sep 2027',
      tagline: 'Big Data & AI Analytics Solutions',
      email: 'data@datamind.com',
      phone: '+91 9922334455',
      address: 'Magarpatta City, Pune, Maharashtra',
      storageLimit: '1 GB',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=datamind'
    }
  ],
  plans: [
    {
      id: 'plan-basic',
      name: 'Basic',
      priceMonthly: 0,
      isFree: true,
      maxUsers: 5,
      maxDocuments: 200,
      storage: '1 GB',
      features: ['Basic document creation', 'Email support', 'Standard Quotations & MOUs'],
      status: 'Active'
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      priceMonthly: 2599,
      isFree: false,
      maxUsers: 50,
      maxDocuments: 5000,
      storage: '10 GB',
      features: ['Unlimited custom letterheads', 'Audit logs', 'Audit certificate', 'Priority support', 'Webhooks'],
      status: 'Active'
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      priceMonthly: 9999,
      isFree: false,
      maxUsers: 200,
      maxDocuments: 999999,
      storage: '50 GB',
      features: ['Dedicated Account Manager', 'Custom domain setup', 'Unlimited storage', 'SLA 99.9%'],
      status: 'Active'
    }
  ],
  users: [
    {
      id: 'u-1',
      name: 'Rahul Sharma',
      email: 'rahul@vorldx.com',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: '28 Oct 2026 10:30'
    },
    {
      id: 'u-2',
      name: 'Priya Singh',
      email: 'priya@vorldx.com',
      role: 'Support Admin',
      status: 'Active',
      lastLogin: '27 Oct 2026 16:20'
    },
    {
      id: 'u-3',
      name: 'Amit Verma',
      email: 'amit@vorldx.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '27 Oct 2026 11:45'
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      user: 'Rahul Sharma',
      action: 'Created Organization',
      details: 'Acme Technologies Pvt Ltd',
      dateTime: '28 Oct 2026 10:30'
    },
    {
      id: 'log-2',
      user: 'Priya Singh',
      action: 'Updated Plan',
      details: 'NextGen Digital -> Pro upgrade',
      dateTime: '27 Oct 2026 16:20'
    },
    {
      id: 'log-3',
      user: 'Amit Verma',
      action: 'Suspended Organization',
      details: 'Innovate India (Policy check)',
      dateTime: '27 Oct 2026 11:45'
    },
    {
      id: 'log-4',
      user: 'Rahul Sharma',
      action: 'Deleted Key',
      details: 'Soft Solutions API Token Revocation',
      dateTime: '26 Oct 2026 14:10'
    },
    {
      id: 'log-5',
      user: 'Priya Singh',
      action: 'Login Success',
      details: 'Web session from 103.22.45.19',
      dateTime: '26 Oct 2026 09:30'
    }
  ],
  supportTickets: [
    {
      id: 'tick-1',
      subject: 'Unable to generate PDF',
      organization: 'Acme Technologies',
      status: 'Open',
      priority: 'High',
      createdAt: '28 Oct 2026'
    },
    {
      id: 'tick-2',
      subject: 'Letterhead not showing on page 2',
      organization: 'NextGen Digital',
      status: 'In Progress',
      priority: 'Medium',
      createdAt: '27 Oct 2026'
    },
    {
      id: 'tick-3',
      subject: 'Need plan upgrade invoice',
      organization: 'Global Systems',
      status: 'Open',
      priority: 'Low',
      createdAt: '27 Oct 2026'
    },
    {
      id: 'tick-4',
      subject: 'Login issue with invited member',
      organization: 'Tech Solutions',
      status: 'Resolved',
      priority: 'Low',
      createdAt: '26 Oct 2026'
    },
    {
      id: 'tick-5',
      subject: 'Signature canvas touch offset on iPad',
      organization: 'Bright Future',
      status: 'Open',
      priority: 'High',
      createdAt: '25 Oct 2026'
    }
  ],
  settings: {
    platformName: 'VorldX',
    supportEmail: 'support@vorldx.com',
    maxUploadSizeMB: 10,
    allowOrgRegistration: true,
    emailNotifications: true,
    maintenanceMode: false
  }
};

function getAdminStore(): PlatformAdminStore {
  if (typeof window === 'undefined') return DEFAULT_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE));
      return DEFAULT_STORE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STORE;
  }
}

function saveAdminStore(store: PlatformAdminStore) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getOrganizations(): PlatformOrg[] {
  return getAdminStore().organizations;
}

export function getOrganizationById(id: string): PlatformOrg | undefined {
  return getOrganizations().find(o => o.id === id);
}

export function saveOrganization(org: PlatformOrg) {
  const store = getAdminStore();
  const idx = store.organizations.findIndex(o => o.id === org.id);
  if (idx >= 0) {
    store.organizations[idx] = org;
  } else {
    store.organizations.unshift(org);
  }
  saveAdminStore(store);
}

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return getAdminStore().plans;
}

export function saveSubscriptionPlan(plan: SubscriptionPlan) {
  const store = getAdminStore();
  const idx = store.plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) {
    store.plans[idx] = plan;
  } else {
    store.plans.push(plan);
  }
  saveAdminStore(store);
}

export function getPlatformUsers(): PlatformUser[] {
  return getAdminStore().users;
}

export function savePlatformUser(user: PlatformUser) {
  const store = getAdminStore();
  store.users.unshift(user);
  saveAdminStore(store);
}

export function getAuditLogs(): PlatformAuditLog[] {
  return getAdminStore().auditLogs;
}

export function getSupportTickets(): SupportTicket[] {
  return getAdminStore().supportTickets;
}

export function updateSupportTicketStatus(id: string, status: SupportTicket['status']) {
  const store = getAdminStore();
  const t = store.supportTickets.find(x => x.id === id);
  if (t) {
    t.status = status;
    saveAdminStore(store);
  }
}

export function getSystemSettings(): SystemSettings {
  return getAdminStore().settings;
}

export function saveSystemSettings(settings: SystemSettings) {
  const store = getAdminStore();
  store.settings = settings;
  saveAdminStore(store);
}

export function adminLogin(email: string, pass: string): boolean {
  if (email && pass) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vorldx_admin_auth', JSON.stringify({ email, role: 'Super Admin', name: 'Platform Admin' }));
    }
    return true;
  }
  return false;
}
