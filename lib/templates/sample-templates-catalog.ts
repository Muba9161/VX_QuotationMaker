/**
 * Platform Curated Sample Templates Catalog
 * 
 * Provides professionally styled sample Quotation, MOU, and Letterhead templates.
 * These are platform-curated, globally immutable starting points for organizations.
 */

export interface SampleLineItem {
  description: string;
  unit: string;
  defaultQuantity: number;
  defaultRate: number;
}

export interface SampleClause {
  title: string;
  content: string;
  sortOrder: number;
  isMandatory?: boolean;
}

export interface SampleLetterheadDesign {
  layout: "left" | "right" | "center" | "split" | "minimal" | "modern";
  accentColor: string;
  headerBorder: boolean;
  footerBorder: boolean;
  headerTagline: string;
  footerNote: string;
}

export interface SampleTemplate {
  id: string;
  title: string;
  type: "QUOTATION" | "MOU" | "LETTERHEAD";
  category: "QUOTATION" | "MOU" | "LETTERHEAD";
  description: string;
  styleTag: string;
  accentColor: string;
  isSample: true;
  lineItems?: SampleLineItem[];
  clauses?: SampleClause[];
  letterheadConfig?: SampleLetterheadDesign;
  paymentTerms?: string;
  notes?: string;
  termsConditions?: string;
}

export const SAMPLE_QUOTATION_TEMPLATES: SampleTemplate[] = [
  {
    id: "sample-quote-modern-corp",
    title: "Modern Corporate Quotation",
    type: "QUOTATION",
    category: "QUOTATION",
    description: "Sleek, balanced enterprise estimate with clear milestone billing and structured deliverables.",
    styleTag: "Modern Corporate",
    accentColor: "#2563EB",
    isSample: true,
    paymentTerms: "40% advance on signing, 40% on milestone delivery, 20% on final client sign-off.",
    notes: "Rates are valid for 30 calendar days from quotation date.",
    termsConditions: "1. Scope changes will be quoted under separate change orders.\n2. Invoices are payable within 14 calendar days.\n3. Taxes will be charged as per applicable GST laws.",
    lineItems: [
      { description: "Enterprise Architecture & System Design", unit: "Phase", defaultQuantity: 1, defaultRate: 150000 },
      { description: "Cloud Infrastructure Setup & Kubernetes Orchestration", unit: "Setup", defaultQuantity: 1, defaultRate: 85000 },
      { description: "API Development & Third-Party System Integration", unit: "Module", defaultQuantity: 3, defaultRate: 65000 },
      { description: "Quality Assurance & Penetration Testing", unit: "Audit", defaultQuantity: 1, defaultRate: 45000 }
    ]
  },
  {
    id: "sample-quote-minimal-pro",
    title: "Minimal Professional Quotation",
    type: "QUOTATION",
    category: "QUOTATION",
    description: "Clean, high-density minimalist pricing sheet ideal for legal, advisory, and accounting retainers.",
    styleTag: "Minimal Professional",
    accentColor: "#475569",
    isSample: true,
    paymentTerms: "100% advance monthly retainer or 30 days net on milestone completion.",
    notes: "Applicable out-of-pocket travel and lodging expenses will be billed at actuals.",
    termsConditions: "Payment terms strictly Net 15. Late payments subject to 1.5% interest per month.",
    lineItems: [
      { description: "Senior Advisory & Strategic Direction", unit: "Hours", defaultQuantity: 20, defaultRate: 7500 },
      { description: "Quarterly Compliance & Audit Review", unit: "Quarter", defaultQuantity: 1, defaultRate: 90000 },
      { description: "Governance Framework Documentation", unit: "Deliverable", defaultQuantity: 1, defaultRate: 60000 }
    ]
  },
  {
    id: "sample-quote-premium-proposal",
    title: "Premium Business Proposal",
    type: "QUOTATION",
    category: "QUOTATION",
    description: "Executive presentation quotation with executive summary, premium typography, and structured scopes.",
    styleTag: "Premium Business",
    accentColor: "#0F766E",
    isSample: true,
    paymentTerms: "50% advance deposit upon contract execution, 50% upon deployment.",
    notes: "Includes 60 days of complimentary hyper-care maintenance and warranty support.",
    termsConditions: "All intellectual property rights transfer to the client upon full payment settlement.",
    lineItems: [
      { description: "Strategic Brand Positioning & Brand Architecture", unit: "Engagement", defaultQuantity: 1, defaultRate: 220000 },
      { description: "Full-Stack Custom Platform Implementation", unit: "Release", defaultQuantity: 1, defaultRate: 350000 },
      { description: "Dedicated DevOps Pipeline & Automated CI/CD", unit: "Setup", defaultQuantity: 1, defaultRate: 75000 },
      { description: "Performance Optimization & SEO Audit", unit: "Audit", defaultQuantity: 1, defaultRate: 40000 }
    ]
  },
  {
    id: "sample-quote-tech-services",
    title: "Technology Services Proposal",
    type: "QUOTATION",
    category: "QUOTATION",
    description: "Tailored for software engineering firms, SaaS onboarding, dev sprints, and IT infrastructure.",
    styleTag: "Tech Services",
    accentColor: "#7C3AED",
    isSample: true,
    paymentTerms: "Bi-weekly sprint billing with 15 days credit period.",
    notes: "Dedicated engineers allocated full-time (160 hours/month per sprint unit).",
    termsConditions: "Source code repository access provided upon sprint milestone acceptance.",
    lineItems: [
      { description: "Dedicated Senior React & Next.js Engineer (Sprint)", unit: "Sprints", defaultQuantity: 4, defaultRate: 95000 },
      { description: "Dedicated Backend & Database Architect (Sprint)", unit: "Sprints", defaultQuantity: 4, defaultRate: 110000 },
      { description: "DevOps & Production Monitoring Setup", unit: "Setup", defaultQuantity: 1, defaultRate: 55000 }
    ]
  },
  {
    id: "sample-quote-consulting-services",
    title: "Consulting & Professional Services",
    type: "QUOTATION",
    category: "QUOTATION",
    description: "Structured scope quotation with phase breakdown, milestones, and deliverable commitments.",
    styleTag: "Consulting",
    accentColor: "#0284C7",
    isSample: true,
    paymentTerms: "30% kickoff, 40% midpoint review, 30% final board presentation.",
    notes: "Deliverables include executive slide deck, financial models, and implementation playbook.",
    termsConditions: "All client proprietary data handled under strict NDA confidentiality terms.",
    lineItems: [
      { description: "Market Feasibility & Competitor Benchmarking", unit: "Phase", defaultQuantity: 1, defaultRate: 125000 },
      { description: "Operational Process Re-engineering Analysis", unit: "Phase", defaultQuantity: 1, defaultRate: 140000 },
      { description: "Executive Stakeholder Workshop & Roadmap Delivery", unit: "Sessions", defaultQuantity: 3, defaultRate: 35000 }
    ]
  },
  {
    id: "sample-quote-creative-agency",
    title: "Creative Agency Proposal",
    type: "QUOTATION",
    category: "QUOTATION",
    description: "Vibrant visual proposal for UI/UX design, media production, branding, and content campaigns.",
    styleTag: "Creative Agency",
    accentColor: "#EA580C",
    isSample: true,
    paymentTerms: "50% upfront to reserve creative team, 50% upon delivery of final source files.",
    notes: "Includes up to 3 rounds of creative revisions per concept deliverable.",
    termsConditions: "Final Figma design files and vector assets released upon full invoice clearance.",
    lineItems: [
      { description: "Design System, Component Library & UX Wireframes", unit: "Asset Pack", defaultQuantity: 1, defaultRate: 180000 },
      { description: "High-Fidelity Interactive Prototype (Figma)", unit: "Prototype", defaultQuantity: 1, defaultRate: 120000 },
      { description: "Custom 3D Illustrations & Motion Assets", unit: "Set", defaultQuantity: 5, defaultRate: 18000 }
    ]
  },
  {
    id: "sample-quote-detailed-commercial",
    title: "Detailed Commercial Quotation",
    type: "QUOTATION",
    category: "QUOTATION",
    description: "Itemized commercial quote with quantity breakdown, warranty details, and supply schedules.",
    styleTag: "Detailed Commercial",
    accentColor: "#16A34A",
    isSample: true,
    paymentTerms: "30% advance with purchase order, 60% on dispatch, 10% post-commissioning.",
    notes: "Includes 12 months comprehensive hardware warranty and SLA support.",
    termsConditions: "Delivery within 3-4 weeks from formal purchase order receipt.",
    lineItems: [
      { description: "Edge Computing Gateway Nodes (Industrial Grade)", unit: "Units", defaultQuantity: 10, defaultRate: 32000 },
      { description: "Sensor Array & Telemetry Modules", unit: "Units", defaultQuantity: 50, defaultRate: 4500 },
      { description: "On-site Installation, Calibration & Acceptance", unit: "Days", defaultQuantity: 5, defaultRate: 15000 }
    ]
  }
];

export const SAMPLE_MOU_TEMPLATES: SampleTemplate[] = [
  {
    id: "sample-mou-standard",
    title: "Standard Memorandum of Understanding",
    type: "MOU",
    category: "MOU",
    description: "General-purpose bilateral agreement outlining shared intentions, joint roles, and non-binding cooperation.",
    styleTag: "Standard Bilateral",
    accentColor: "#2563EB",
    isSample: true,
    clauses: [
      { sortOrder: 1, title: "1. Purpose and Objective", content: "This Memorandum of Understanding ('MOU') establishes a collaborative framework between the Parties to pursue mutually beneficial joint initiatives.", isMandatory: true },
      { sortOrder: 2, title: "2. Scope of Cooperation", content: "The Parties agree to exchange knowledge, explore commercial alignment, and conduct preliminary feasibility assessments.", isMandatory: true },
      { sortOrder: 3, title: "3. Non-Binding Intent", content: "Except for Confidentiality and Governing Law, this MOU represents mutual intent and does not create legally binding financial obligations.", isMandatory: true },
      { sortOrder: 4, title: "4. Confidentiality", content: "All proprietary business, technical, or financial information shared during this collaboration shall remain strictly confidential for 3 years.", isMandatory: true },
      { sortOrder: 5, title: "5. Term and Termination", content: "This MOU takes effect upon mutual digital execution and remains valid for 12 months unless terminated earlier with 30 days written notice.", isMandatory: true }
    ]
  },
  {
    id: "sample-mou-partnership",
    title: "Business Partnership MOU",
    type: "MOU",
    category: "MOU",
    description: "Framework for strategic joint ventures, co-marketing, and collaborative market expansion.",
    styleTag: "Strategic Partnership",
    accentColor: "#0D9488",
    isSample: true,
    clauses: [
      { sortOrder: 1, title: "1. Strategic Alliance Objective", content: "The Parties intend to partner in marketing, distribution, and client co-servicing across targeted operational territories.", isMandatory: true },
      { sortOrder: 2, title: "2. Respective Responsibilities", content: "Party A shall provide technology leadership and platform access; Party B shall lead business development and enterprise sales channels.", isMandatory: true },
      { sortOrder: 3, title: "3. Revenue & Commercial Principles", content: "Specific project engagements under this partnership shall be governed by mutually agreed Statements of Work (SOWs) with defined revenue splits.", isMandatory: true },
      { sortOrder: 4, title: "4. Brand & Trademark Guidelines", content: "Neither Party shall use the trademarks or logos of the other without prior written authorization.", isMandatory: true }
    ]
  },
  {
    id: "sample-mou-service-agreement",
    title: "Service Agreement MOU",
    type: "MOU",
    category: "MOU",
    description: "Preliminary service terms, service level baseline, and operational commitments prior to formal master services agreement.",
    styleTag: "Service Agreement",
    accentColor: "#6366F1",
    isSample: true,
    clauses: [
      { sortOrder: 1, title: "1. Service Engagement Scope", content: "Provider agrees to deliver professional software and infrastructure management services as detailed in associated project addenda.", isMandatory: true },
      { sortOrder: 2, title: "2. Performance Standards & SLAs", content: "Services will be executed with industry best practices, adhering to an uptime baseline of 99.5% for production systems.", isMandatory: true },
      { sortOrder: 3, title: "3. Service Review & Reporting", content: "Monthly operational review meetings will assess deliverable status, unresolved tickets, and velocity benchmarks.", isMandatory: true }
    ]
  },
  {
    id: "sample-mou-tech-collaboration",
    title: "Technology Collaboration MOU",
    type: "MOU",
    category: "MOU",
    description: "Designed for joint software R&D, API integrations, data exchange, and co-created IP boundaries.",
    styleTag: "Tech Collaboration",
    accentColor: "#9333EA",
    isSample: true,
    clauses: [
      { sortOrder: 1, title: "1. Joint Development Goals", content: "The Parties agree to collaboratively design and integrate their respective APIs and data processing modules.", isMandatory: true },
      { sortOrder: 2, title: "2. Background & Foreground Intellectual Property", content: "Pre-existing IP remains the exclusive property of the originating Party. Jointly created Foreground IP ownership will be specified in definitive agreements.", isMandatory: true },
      { sortOrder: 3, title: "3. Data Security and Privacy", content: "All data exchanges must strictly comply with applicable data protection laws, encryption standards, and privacy guidelines.", isMandatory: true }
    ]
  },
  {
    id: "sample-mou-consulting",
    title: "Consulting Engagement MOU",
    type: "MOU",
    category: "MOU",
    description: "Advisory collaboration agreement defining consultant deliverables, client inputs, and milestone approvals.",
    styleTag: "Advisory Consulting",
    accentColor: "#0284C7",
    isSample: true,
    clauses: [
      { sortOrder: 1, title: "1. Advisory Role", content: "Consultant will act as an independent strategic advisor to the Client leadership team on organizational scalability and digital transformation.", isMandatory: true },
      { sortOrder: 2, title: "2. Client Assistance & Information Access", content: "Client will furnish relevant internal documentation and ensure timely access to key project stakeholders.", isMandatory: true },
      { sortOrder: 3, title: "3. Conflict of Interest", content: "Consultant warrants that this engagement does not conflict with any existing professional or fiduciary obligations.", isMandatory: true }
    ]
  },
  {
    id: "sample-mou-vendor-collaboration",
    title: "Vendor/Client Collaboration MOU",
    type: "MOU",
    category: "MOU",
    description: "Establishes preferred vendor status, procurement workflows, and pricing frameworks.",
    styleTag: "Vendor Preferred",
    accentColor: "#15803D",
    isSample: true,
    clauses: [
      { sortOrder: 1, title: "1. Vendor Onboarding & Preferred Status", content: "Client recognizes Vendor as an approved preferred supplier for technical contracting and managed IT services.", isMandatory: true },
      { sortOrder: 2, title: "2. Order Workflow & Purchase Orders", content: "Individual assignments shall be initiated by formal written Purchase Orders referencing this collaborative MOU.", isMandatory: true },
      { sortOrder: 3, title: "3. Invoicing and Payment Terms", content: "Invoices shall be processed on Net 30 terms upon satisfactory milestone acceptance.", isMandatory: true }
    ]
  }
];

export const SAMPLE_LETTERHEAD_TEMPLATES: SampleTemplate[] = [
  {
    id: "sample-letterhead-minimal-corp",
    title: "Minimal Corporate Letterhead",
    type: "LETTERHEAD",
    category: "LETTERHEAD",
    description: "Classic clean layout with top-left logo, right-aligned corporate details, and clean divider rule.",
    styleTag: "Minimal Corporate",
    accentColor: "#1E293B",
    isSample: true,
    letterheadConfig: {
      layout: "split",
      accentColor: "#1E293B",
      headerBorder: true,
      footerBorder: true,
      headerTagline: "Enterprise Excellence & Scalable Innovation",
      footerNote: "Confidential Business Communication • Registered Office"
    }
  },
  {
    id: "sample-letterhead-modern-biz",
    title: "Modern Business Letterhead",
    type: "LETTERHEAD",
    category: "LETTERHEAD",
    description: "Contemporary header with subtle brand-colored top accent bar and structured contact ribbon.",
    styleTag: "Modern Business",
    accentColor: "#2563EB",
    isSample: true,
    letterheadConfig: {
      layout: "left",
      accentColor: "#2563EB",
      headerBorder: true,
      footerBorder: true,
      headerTagline: "Strategic Consulting & Digital Solutions",
      footerNote: "Corporate Identification Number (CIN) • GSTIN Compliant"
    }
  },
  {
    id: "sample-letterhead-premium-exec",
    title: "Premium Executive Letterhead",
    type: "LETTERHEAD",
    category: "LETTERHEAD",
    description: "Refined gold and deep slate accents with centered emblem placement for executive communications.",
    styleTag: "Executive Premium",
    accentColor: "#B45309",
    isSample: true,
    letterheadConfig: {
      layout: "center",
      accentColor: "#B45309",
      headerBorder: true,
      footerBorder: false,
      headerTagline: "Excellence • Integrity • Leadership",
      footerNote: "Strictly Private & Confidential • For Addressee Only"
    }
  },
  {
    id: "sample-letterhead-prof-services",
    title: "Professional Services Letterhead",
    type: "LETTERHEAD",
    category: "LETTERHEAD",
    description: "Formal structured header with dual-column company credentials, contact matrix, and legal registration.",
    styleTag: "Professional Services",
    accentColor: "#0F766E",
    isSample: true,
    letterheadConfig: {
      layout: "split",
      accentColor: "#0F766E",
      headerBorder: true,
      footerBorder: true,
      headerTagline: "Certified Advisory, Audit & Legal Consultants",
      footerNote: "This document is digitally signed and verifiable."
    }
  },
  {
    id: "sample-letterhead-clean-minimal",
    title: "Clean Minimal Letterhead",
    type: "LETTERHEAD",
    category: "LETTERHEAD",
    description: "Ultra-clean monochrome layout with generous whitespace and understated micro-typography.",
    styleTag: "Clean Minimal",
    accentColor: "#64748B",
    isSample: true,
    letterheadConfig: {
      layout: "minimal",
      accentColor: "#64748B",
      headerBorder: false,
      footerBorder: false,
      headerTagline: "",
      footerNote: "Page 1 of Document • Official Correspondence"
    }
  },
  {
    id: "sample-letterhead-modern-tech",
    title: "Modern Technology Company Letterhead",
    type: "LETTERHEAD",
    category: "LETTERHEAD",
    description: "Tech-forward letterhead with vibrant violet gradient accent, digital badge, and mono metadata headers.",
    styleTag: "Tech & SaaS",
    accentColor: "#7C3AED",
    isSample: true,
    letterheadConfig: {
      layout: "modern",
      accentColor: "#7C3AED",
      headerBorder: true,
      footerBorder: true,
      headerTagline: "Cloud Architecture • Next-Gen Software Engineering",
      footerNote: "VorldX Verified Partner • Digital Signature Enabled"
    }
  }
];

export const ALL_SAMPLE_TEMPLATES: SampleTemplate[] = [
  ...SAMPLE_QUOTATION_TEMPLATES,
  ...SAMPLE_MOU_TEMPLATES,
  ...SAMPLE_LETTERHEAD_TEMPLATES
];

export function getSampleTemplates(type?: "QUOTATION" | "MOU" | "LETTERHEAD" | "ALL"): SampleTemplate[] {
  if (!type || type === "ALL") return ALL_SAMPLE_TEMPLATES;
  return ALL_SAMPLE_TEMPLATES.filter((t) => t.category === type || t.type === type);
}

export function getSampleTemplateById(id: string): SampleTemplate | undefined {
  return ALL_SAMPLE_TEMPLATES.find((t) => t.id === id);
}

