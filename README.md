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
- **Bulk Email Functionality**: Scalable, private email distribution to client contacts via Redis & BullMQ queues with live delivery status tracking (Queued, Processing, Sent, Failed).
- **Template Image Management**: Upload, preview, replace, and remove template header graphics, dynamically rendered into quotations, MOUs, and PDF exports.
- **Branding & Letterhead Engine**: Corporate letterhead upload supporting both vector PDF and raster images, layered seamlessly into document backgrounds via `pdf-lib` with independent Quotation/MOU application scopes.
- **Optional Signup Logo Upload**: Frictionless tenant onboarding with instant logo upload, thumbnail preview, and client validation on the registration form.
- **Organization Identity & Strict Footer Attribution**: True white-labeling prioritizing organization company name and logo, with "Powered by VorldX" restricted strictly to application footers.
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
* **Scope**: Single Organization / Tenant Workspace (e.g., *VorldX Technologies Pvt Ltd*)
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
- **Seed Data File**: [`db/seed.sql`](file:///c:/Users/shreya/OneDrive/Desktop/quotation-maker-app/db/seed.sql) (Pre-configured demo data matching VorldX Technologies, Rahul Sharma, John Doe, and seed quotations/MOUs).
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

## Docker Desktop on Windows

The project is a full-stack Next.js application: its pages and `/api/v1` backend run in the same `app` service. Compose also runs PostgreSQL 16, Redis, and the existing BullMQ worker. Uploaded templates, logos, and generated or signed documents are stored in a persistent Docker volume.

### 1. Install Docker Desktop

Install [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/), enable its recommended WSL 2 backend, then start Docker Desktop and wait for it to report that the engine is running. Docker is not required for normal local development.

### 2. Configure environment variables

From the project directory, create the local environment file and edit it:

```powershell
Copy-Item .env.example .env
notepad .env
```

Replace the PostgreSQL password, `JWT_SECRET`, and `OTP_SECRET` with unique values. If you are reusing an existing Docker PostgreSQL volume, keep the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` values that initialized it; changing environment values does not change credentials or reset that volume. To generate URL-safe random values, run this command three times in PowerShell and paste each result into the corresponding setting:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Compose constructs `DATABASE_URL` with the internal PostgreSQL hostname `postgres` and `REDIS_URL` with the internal Redis hostname `redis`. Do not set these to `localhost` in the containers. Do not put credentials in any `NEXT_PUBLIC_*` variable. Google OAuth and SMTP settings are optional, but must be configured for those integrations to send email or authenticate.

### 3. Build and start

Start the database and queue service, build the application and worker images, then initialize the Prisma schema **only if this is a new, empty Docker database**:

```powershell
docker compose up -d postgres redis
docker compose build app worker
docker compose run --rm --no-deps app npx prisma db push
docker compose up -d app worker
```

This repository does not contain Prisma migration files; the Prisma schema is at `prisma/schema.prisma`. Do not run `prisma db push` against an existing or production database without first reviewing the schema changes and making a verified backup. No demo seed data is applied. Docker uses its own named PostgreSQL volume and does not import, replace, or reset an existing Windows PostgreSQL installation.

Open [http://localhost:3000](http://localhost:3000). Set `APP_PORT` and `APP_URL` in `.env` if you need a different local port or public URL. PostgreSQL is bound to the local machine only; Redis is not exposed on a host port.

### 4. Check status and logs

```powershell
docker compose ps
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f postgres
docker compose logs -f redis
```

The `app` health check calls `/api/v1/health`, which verifies PostgreSQL connectivity.

### 5. Stop and restart

```powershell
# Stop containers without removing persistent data
docker compose stop

# Start stopped containers
docker compose start

# Rebuild after application source or dependency changes
docker compose up -d --build

# Remove containers and the Compose network, but keep named volumes
docker compose down
```

**Do not use `docker compose down -v`** if you need to keep database, Redis, or uploaded-document data. The named volumes are `vx_postgres_data`, `vx_redis_data`, and `vx_document_storage`.

### 6. Back up and restore PostgreSQL

Create a compressed backup in the project directory. The commands first write inside the container and then copy the binary dump, avoiding PowerShell text-encoding corruption:

```powershell
docker compose exec postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/vx-quotation-maker.dump'
docker compose cp postgres:/tmp/vx-quotation-maker.dump .\vx-quotation-maker.dump
docker compose exec postgres rm -f /tmp/vx-quotation-maker.dump
```

Keep the backup in a protected location. To restore without overwriting the current database, create a separate database and restore into it:

```powershell
docker compose cp .\vx-quotation-maker.dump postgres:/tmp/vx-quotation-maker.dump
docker compose exec postgres sh -c 'createdb -U "$POSTGRES_USER" vx_restore'
docker compose exec postgres sh -c 'pg_restore --no-owner --no-acl -U "$POSTGRES_USER" -d vx_restore /tmp/vx-quotation-maker.dump'
docker compose exec postgres rm -f /tmp/vx-quotation-maker.dump
```

The restore fails rather than overwriting data if `vx_restore` already exists. To use the restored database, change `POSTGRES_DB` to `vx_restore` in `.env`, then run `docker compose up -d --force-recreate app worker`. Keep the original database until the restored instance has been verified.

### Runtime and PDF compatibility notes

- Next.js serves both the UI and backend API from the same container; the worker is a separate process using the same image, database, Redis service, and document-storage volume.
- The image uses Node 20 Alpine with OpenSSL and `libc6-compat`, and runs `npm ci` plus Prisma Client generation for the Linux image. Sharp's Linux musl binaries are included through the lockfile's platform-specific optional dependencies.
- `pdf-lib` is used for server-side PDF operations. `html2canvas` and `jspdf` are browser-side libraries; the current project does not depend on Chromium, Puppeteer, or Playwright for PDF generation.
- Docker Desktop is not installed in the environment where this configuration was prepared, so image builds, Compose startup, and container workflows have not been run or verified.

### Environment variables

| Variable(s) | Purpose |
|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Required PostgreSQL initialization credentials and database. Keep values URL-safe because Compose assembles a connection URL from them. |
| `POSTGRES_PORT` | Optional host-only PostgreSQL port; defaults to `5432`. |
| `JWT_SECRET`, `OTP_SECRET` | Required, separate application secrets; use unique random values of at least 32 characters. |
| `APP_URL`, `APP_PORT` | Public application URL and optional local host port. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Optional Google OAuth configuration. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, `SMTP_FROM` | Optional email transport settings. |
| `TRUST_PROXY`, `LOG_LEVEL`, `DEBUG` | Optional proxy and diagnostic settings. Keep `TRUST_PROXY=false` unless the app is behind a trusted reverse proxy. |
| `DATABASE_URL`, `REDIS_URL` | Set internally to the `postgres` and `redis` Compose service hostnames; do not override with `localhost`. |
| `LOCAL_STORAGE_PATH` | Set internally to `/app/storage`, backed by `vx_document_storage`. |
| `NODE_ENV`, `PORT`, `HOSTNAME` | Set by the production container configuration. |
| `NEXT_OUTPUT_STANDALONE` | Set to `true` during the Docker build to produce Next.js standalone output. |

The Redis client also supports `REDIS_HOST` and `REDIS_PORT` as non-Compose fallbacks; Compose uses `REDIS_URL` instead.

---

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


---

## 📚 Instructor-Requested Features Documentation
For in-depth architectural specifications, test proofs, and verification reports:
- [Instructor-Requested Features Specification](./docs/instructor-requested-features.md)
- [Comprehensive Implementation & Audit Report](./docs/instructor-features-implementation-report.md)

## 📄 License
Private & Proprietary. All rights reserved.
