# VorldX - White-Label Quotation, MOU & Digital Document Signing Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Project Description

**VorldX** (formerly *VORLDX*) is an enterprise-grade, multi-tenant **White-Label Quotation, MOU (Memorandum of Understanding), Agreement, and Digital Document Signing Platform**. 

Designed for B2B enterprises, product agencies, consulting firms, and service providers, VorldX streamlines the entire document lifecycle from draft creation, itemized costing, and legal clause assembly to external client delivery, revision negotiation, legally binding digital signatures, and PDF generation with cryptographic audit trails.

### 🌟 Key Capabilities:
- **Multi-Tenant White-Labeling**: Each organization customizes their own logo, brand colors (primary, secondary, accent), letterheads, headers/footers, and domain settings with real-time live A4 sheet preview.
- **Quotation & Commercial Engine**: Line-item builder with quantities, units, rates, automated GST/tax calculation, discounts, and currency formatting.
- **MOU & Legal Agreement Engine**: Structured clause management, governing law specification, party definitions, and non-disclosure terms.
- **External Recipient Signing Portal**: Dedicated, secure portal for clients and counterparties to review documents, request revisions, and execute digital signatures (Draw, Type, Upload).
- **Audit Trail & Legal Compliance**: Immutable logging of every document event (created, sent, viewed, revision requested, signed, declined) with IP address, timestamp, and device user agent.
- **Full PostgreSQL & Prisma Database Layer**: 18 normalized tables with foreign keys, cascading deletion rules, performance indexes, GIN full-text search, and pre-built analytical views.

---

## 👥 4 Role-Based Access Control (RBAC) System

VorldX implements a strict, 4-tier Role-Based Access Control architecture separating platform operations, tenant management, document authoring, and external client execution:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. SUPER ADMIN                                  │
│             (Platform Owner • Multi-Tenant Governance)                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      2. ORGANIZATION ADMIN                             │
│             (Tenant Owner • Branding • Team • Settings)                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          3. EDITOR                                     │
│            (Team Member • Document Creator • Quotations & MOUs)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    4. EXTERNAL RECIPIENT                               │
│              (Client / Signer • Review & Sign • Change Requests)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Detailed Breakdown of the 4 RBAC Roles:

### 1. Super Admin (`super_admin`)
* **Scope**: Entire VorldX Platform (Cross-Tenant)
* **Target Audience**: Platform Owners, DevOps, and Platform Operations Team
* **Key Permissions & Responsibilities**:
  - **Organization / Tenant Management**: Create, view, suspend, or reactivate organizations across the platform.
  - **Subscription Plans & Quotas**: Configure subscription tiers (Basic, Pro, Enterprise), monthly/yearly pricing, member limits, document quotas, and storage allocations.
  - **Platform-wide System Settings**: Manage platform branding, maintenance mode toggles, global upload size limits, and system support email.
  - **Global Audit & Monitoring**: Access platform-wide audit logs to trace system events across all tenants.
  - **Support Ticketing**: Monitor and resolve support requests submitted by tenant organization admins.

---

### 2. Organization Admin (`org_admin`)
* **Scope**: Single Organization / Tenant Workspace (e.g., *Acme Technologies Pvt Ltd*)
* **Target Audience**: Business Owners, Managing Directors, and Department Heads
* **Key Permissions & Responsibilities**:
  - **White-Label Branding & Letterhead**: Upload custom organization logos, configure brand color palettes (Primary, Secondary, Accent), customize official corporate letterhead headers and footers with a live A4 preview.
  - **Team Member Management**: Invite new team members via secure email tokens, assign roles (`org_admin`, `editor`, `viewer`), and manage active/invited member statuses.
  - **Workspace & Compliance Settings**: Set default tax rates (e.g., GST 18%), currency formats (INR ₹, USD $, EUR €), default document validity periods (days), and mandatory approval rules.
  - **Document Oversight & Approval**: Review, approve, or reject documents prepared by team editors before they are dispatched to clients.
  - **Analytics & Reporting**: View organization dashboard metrics, signed document volume, monthly revenue, and conversion statistics.

---

### 3. Editor (`editor`)
* **Scope**: Document Operations within the Organization
* **Target Audience**: Sales Executives, Account Managers, Legal Associates, and Project Managers
* **Key Permissions & Responsibilities**:
  - **Document Authoring**: Create and edit Quotations, MOUs, Service Agreements, and NDAs from scratch or using pre-approved templates.
  - **Commercial Line Items**: Add item descriptions, quantities, units, rates, item-level taxes, and discount values.
  - **Legal Clause Assembly**: Draft, reorder, and customize legal clauses and terms & conditions.
  - **Client & Recipient Assignment**: Link contacts from the address book, specify signer roles (`signer`, `cc`, `approver`), and set signing order.
  - **Dispatch & Reminders**: Send secure digital signing links to external clients and trigger automated reminder notifications.
  - **Document Tracking**: Track document states in real time (`Draft` → `Sent` → `Viewed` → `Signed` / `Changes Requested`).

---

### 4. External Recipient / Signer (`recipient`)
* **Scope**: External Client / Counterparty Portal (Restricted to Shared Documents)
* **Target Audience**: Clients, Customers, Legal Partners, and External Counterparties
* **Key Permissions & Responsibilities**:
  - **Dedicated Recipient Portal**: Access personalized views via `/recipient/dashboard`, `/recipient/shared`, `/recipient/pending`, and `/recipient/signed`.
  - **Document Review**: Securely view white-labeled documents with full formatting, line items, and terms.
  - **Legally Binding Digital Signature**: Execute digital signatures using three flexible methods:
    1. **Draw**: Hand-drawn signature canvas with stroke capture.
    2. **Type**: Stylized cursive cryptographic font generation.
    3. **Upload**: Official scanned signature image/stamp upload.
  - **Negotiation & Change Requests**: Submit inline comments and revision requests (`Changes Requested`) back to the sender before signing.
  - **Decline with Reason**: Formally decline documents with documented reasons for legal clarity.
  - **PDF Download**: Instantly download authenticated PDF copies containing verified cryptographic signature certificates and timestamp audit trails.

---

## 📊 RBAC Permissions Matrix

| Feature / Action | Super Admin | Org Admin | Editor | External Recipient |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Subscription Plans & Quotas** | ✅ | ❌ | ❌ | ❌ |
| **Manage Global System Settings** | ✅ | ❌ | ❌ | ❌ |
| **Create & Configure Organization Branding** | ✅ | ✅ | ❌ | ❌ |
| **Manage Team Members & Invitations** | ❌ | ✅ | ❌ | ❌ |
| **Configure Org Defaults (Taxes, Expiry, Currency)** | ❌ | ✅ | ❌ | ❌ |
| **Approve Documents Before Dispatch** | ❌ | ✅ | ❌ | ❌ |
| **Create & Edit Quotations & MOUs** | ❌ | ✅ | ✅ | ❌ |
| **Send Documents to External Signers** | ❌ | ✅ | ✅ | ❌ |
| **View Internal Organization Reports** | ✅ | ✅ | ❌ | ❌ |
| **Access Recipient Portal (`/recipient`)** | ❌ | ❌ | ❌ | ✅ |
| **Review & Digitally Sign Document** | ❌ | ❌ | ❌ | ✅ |
| **Submit Change / Revision Requests** | ❌ | ❌ | ❌ | ✅ |
| **Decline Document with Reason** | ❌ | ❌ | ❌ | ✅ |
| **Download Certified Signed PDF** | ❌ | ✅ | ✅ | ✅ |

---

## 🗄️ Database Architecture (PostgreSQL)

The database schema is fully defined and ready for production deployment:
- **DDL Schema File**: [`db/schema.sql`](file:///c:/Users/shreya/OneDrive/Desktop/quotation-maker-app/db/schema.sql) (18 tables, custom enums, performance indexes, GIN search, triggers, and analytical views).
- **Seed Data File**: [`db/seed.sql`](file:///c:/Users/shreya/OneDrive/Desktop/quotation-maker-app/db/seed.sql) (Pre-configured demo data matching ACME Technologies, Rahul Sharma, John Doe, and seed quotations/MOUs).
- **Prisma Schema**: [`prisma/schema.prisma`](file:///c:/Users/shreya/OneDrive/Desktop/quotation-maker-app/prisma/schema.prisma) (Type-safe ORM definitions for Next.js).
- **Database Architecture Guide**: [`db/README.md`](file:///c:/Users/shreya/OneDrive/Desktop/quotation-maker-app/db/README.md) (Complete Entity Relationship Diagram and query references).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Iconography** | [Lucide React](https://lucide.dev/) |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/) |
| **Database** | [PostgreSQL 14+](https://www.postgresql.org/) |
| **ORM & Client** | [Prisma ORM](https://www.prisma.io/) & Node.js `pg` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.0.0 or higher (Tested with v22.8.0)
- **npm**: v10.0.0 or higher
- **PostgreSQL**: v14 or higher (or Docker)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Muba9161/VX_QuotationMaker.git
   cd quotation-maker-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/worldx_quotation_db?schema=public"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize Database** (Optional, for persistent PostgreSQL backend):
   ```bash
   # Run schema and seed scripts
   psql -d worldx_quotation_db -f db/schema.sql
   psql -d worldx_quotation_db -f db/seed.sql
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
Private & Proprietary. All rights reserved.
