# WorldX PostgreSQL Database Architecture

Complete production-grade PostgreSQL database schema for the **WorldX Multi-tenant Quotation, MOU, and Digital Document Signing Platform**.

---

## 🏗️ Architecture Overview

The database is structured across 6 core domains:
1. **Multi-Tenancy & Platform Administration**: Subscription tiers, organization branding, custom domains, quotas, and support.
2. **Access Control & Team**: Organizations, users, roles (`super_admin`, `org_admin`, `editor`, `viewer`, `recipient`), invitations, and active sessions.
3. **Document Core**: Quotations, MOUs, Service Agreements, and NDAs with automatic versioning, calculations, and statuses.
4. **Line Items & Clauses**: Normalized item pricing tables and structured legal clauses with sort orders.
5. **Recipients & Digital Signatures**: Multi-party signing orders, secure share tokens, drawn/typed/uploaded signature vectors, IP/User-Agent tracking.
6. **Audit Trail & Compliance**: Immutable cryptographic audit logs for legal admissibility.

---

## 📊 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    subscription_plans ||--o{ organizations : "subscribed to"
    organizations ||--o{ organization_settings : "configures"
    organizations ||--o{ users : "employs"
    organizations ||--o{ team_invitations : "invites"
    organizations ||--o{ contacts : "maintains"
    organizations ||--o{ templates : "owns"
    organizations ||--o{ documents : "creates"
    organizations ||--o{ notifications : "dispatches"

    templates ||--o{ template_items : "contains"
    templates ||--o{ template_clauses : "contains"

    documents ||--o{ document_items : "itemizes"
    documents ||--o{ document_clauses : "includes"
    documents ||--o{ document_recipients : "shared with"
    documents ||--o{ signatures : "contains"
    documents ||--o{ document_audit_logs : "audited by"
    documents ||--o{ document_change_requests : "receives"

    document_recipients ||--o{ signatures : "signs"
    document_recipients ||--o{ document_change_requests : "requests"
```

---

## 🗄️ Tables Reference

| Table | Description |
| :--- | :--- |
| `subscription_plans` | Platform tiers (Basic, Pro, Enterprise) with quotas and pricing. |
| `system_settings` | Global platform parameters, maintenance mode, and upload limits. |
| `organizations` | Tenants with white-label branding, logo, colors, and letterhead. |
| `organization_settings` | Default tax rates, currency, standard terms, and reminder policies. |
| `users` | Accounts across platform admins, organization members, and external signers. |
| `sessions` | Active authentication sessions with IP tracking and device user agents. |
| `team_invitations` | Pending team invites with cryptographic validation tokens. |
| `contacts` | Client address book with tax IDs and company details. |
| `templates` | Reusable quotation and MOU boilerplate layouts. |
| `template_items` | Default line items pre-populated into templates. |
| `template_clauses` | Standard legal clauses pre-populated into templates. |
| `documents` | Core documents (Quotations, MOUs, Agreements, NDAs) with lifecycle states. |
| `document_items` | Specific line items with quantity, rate, tax, and calculated amounts. |
| `document_clauses` | Document-specific legal terms and agreements. |
| `document_recipients` | External signers, CC recipients, and approval status. |
| `document_change_requests` | Feedback and revision notes requested by recipients. |
| `signatures` | Legal digital signature vectors (draw/type/upload), timestamps, and hashes. |
| `document_audit_logs` | Immutable audit log (created, sent, viewed, signed, declined). |
| `platform_audit_logs` | System-wide administrative action logging. |
| `notifications` | In-app notification feed for users. |
| `support_tickets` | Tenant support ticketing system. |

---

## 🚀 Quickstart & Setup Guide

### Option 1: Direct SQL Execution (`psql`)

```bash
# 1. Create the database
createdb worldx_quotation_db

# 2. Run the schema creation script
psql -d worldx_quotation_db -f db/schema.sql

# 3. Seed demo data (ACME, Rahul Sharma, Quotations, MOUs)
psql -d worldx_quotation_db -f db/seed.sql
```

### Option 2: Docker Setup

Run PostgreSQL in a single Docker container:

```bash
docker run --name worldx-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=worldx_quotation_db \
  -p 5432:5432 -d postgres:16-alpine

# Execute schema and seed
docker exec -i worldx-postgres psql -U postgres -d worldx_quotation_db < db/schema.sql
docker exec -i worldx-postgres psql -U postgres -d worldx_quotation_db < db/seed.sql
```

### Option 3: Prisma ORM Integration

Add your connection string to `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/worldx_quotation_db?schema=public"
```

Push the schema with Prisma:
```bash
npx prisma db push
```

---

## 🔍 Useful Pre-built Views

### 1. External Recipient Portal View (`v_recipient_documents`)
Powers the recipient's **Shared with Me** and **Pending Signature** tabs:
```sql
SELECT * FROM v_recipient_documents WHERE recipient_email = 'john.doe@email.com';
```

### 2. Organization Dashboard Summary (`v_organization_summary`)
Provides instant metrics (total documents, signed count, revenue, pending actions):
```sql
SELECT * FROM v_organization_summary WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
```
