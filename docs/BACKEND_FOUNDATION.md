# Backend Foundation & Database Connectivity (Phase 0)

This document outlines the backend architecture foundation established for the **VorldX / VorldX White-Label Quotation, MOU & Digital Signing Platform**.

---

## 1. Selected Database Client & Strategy

- **Client:** Prisma ORM (`@prisma/client` v6.19.3) with PostgreSQL datasource.
- **Singleton Implementation:** [`lib/prisma.ts`](file:///c:/Users/Rana/Desktop/VX_QuotationMaker/lib/prisma.ts) prevents multiple client instances during Next.js development hot-reloads via the global namespace pattern.
- **Legacy Helper Migration:** The obsolete [`lib/db.ts`](file:///c:/Users/Rana/Desktop/VX_QuotationMaker/lib/db.ts) (which previously caught import errors and silently returned empty arrays) has been refactored and deprecated (`@deprecated`). It now delegates raw SQL queries safely through Prisma (`prisma.$queryRawUnsafe`) and throws descriptive errors on failure rather than swallowing them.
- **Access Rule:** Database operations are restricted to server-side Node.js runtimes (`route.ts`, server functions, background jobs). The client must never be imported into client components (`"use client"`).

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Required Variables:
- `DATABASE_URL`: Standard PostgreSQL connection string (e.g., `postgresql://postgres:postgres@localhost:5432/worldx_quotation_db?schema=public`).
- `APP_URL`: Base application URL for shareable document links (default: `http://localhost:3000`).
- `LOCAL_STORAGE_PATH`: Directory on the server filesystem for storing uploaded logos, letterheads, and signed artifacts (default: `./storage`).

### Reserved Variables (Phases 1 & 6):
- `REDIS_URL`: Redis connection URL for caching, rate limiting, and background BullMQ queues.
- `JWT_SECRET`: 32+ byte cryptographic secret for signing session tokens and password resets.
- `SESSION_MAX_AGE_SECONDS`: Session validity duration in seconds (default: `28800` / 8 hours).

---

## 3. How to Generate Prisma Client

Whenever the database schema is updated in `prisma/schema.prisma`, regenerate the TypeScript client:
```bash
npm run prisma:generate
# or
npx prisma generate
```

---

## 4. How to Start the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Health-Check API Endpoint

- **URL:** `GET /api/v1/health`
- **File:** [`app/api/v1/health/route.ts`](file:///c:/Users/Rana/Desktop/VX_QuotationMaker/app/api/v1/health/route.ts)
- **Runtime:** Node.js App Router route handler (`force-dynamic`).
- **Headers:** Sets `Cache-Control: no-store, no-cache, must-revalidate`.

### Expected Responses:
- **Healthy (HTTP 200):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-29T18:30:00.000Z",
    "services": {
      "database": "connected"
    },
    "latencyMs": 8
  }
  ```
- **Degraded / Database Offline (HTTP 503):**
  ```json
  {
    "status": "degraded",
    "timestamp": "2026-10-29T18:30:00.000Z",
    "services": {
      "database": "disconnected"
    }
  }
  ```
*Note: The health endpoint never returns connection strings, passwords, SQL errors, or internal stack traces to the caller.*

---

## 6. How to Run Tests

The test suite runs via **Vitest**:
```bash
npm test
```
To run tests in watch mode during development:
```bash
npx vitest
```

---

## 7. Database Connectivity Status & Limitations

- **Schema Reconciled:** `db/schema.sql` and `prisma/schema.prisma` have been analyzed in detail.
- **Client Generated:** Prisma Client v6.19.3 is generated and ready in `node_modules/@prisma/client`.
- **Live Connection Status:** **Unverified at runtime against a real database.** No live PostgreSQL database was connected, mutated, or migrated during Phase 0 per audit constraints.
- **Unit Test Verification:** Real unit tests (11 tests across 4 test suites) mock database availability and failure states to verify endpoint behavior deterministically.

---

## 8. Schema Reconciliation Findings & Known Discrepancies

1. **`platform_audit_logs` Table:** Exists in `db/schema.sql` (lines 519–528) for system-wide super admin event logging, but is omitted from `prisma/schema.prisma`.
2. **Missing Foreign Key References in Prisma Schema:**
   - `support_tickets.user_id` (the ticket reporter) is in SQL DDL but missing in Prisma model.
   - `document_change_requests.resolved_by_user_id` is in SQL DDL but missing in Prisma model.
   - `document_audit_logs.actor_user_id` & `actor_recipient_id` are in SQL DDL but missing in Prisma model.
3. **Database-Level Features Beyond Prisma:**
   - **Full-Text Search Index:** `idx_documents_search` uses PostgreSQL `gin(to_tsvector(...))` expression indexing, which must be created via SQL migration rather than Prisma schema attributes.
   - **Timestamp Triggers:** PostgreSQL `set_updated_at()` trigger functions and triggers in `db/schema.sql` handle updates at the database level, whereas Prisma relies on application-level `@updatedAt`.
   - **Analytical Views:** `v_recipient_documents` and `v_organization_summary` are SQL views defined in `db/schema.sql` and cannot be mutated through Prisma.

---

## 9. Operations Intentionally Not Yet Implemented (Out of Scope for Phase 0)

The following capabilities are scheduled for subsequent implementation phases:
- User authentication, login/register API endpoints, password hashing, and session tokens (Phase 1).
- Multi-tenant isolation middleware and organization authorization guards (Phase 1).
- Organization white-label asset uploads and local filesystem storage (Phase 2).
- Quotation and MOU CRUD routes and document numbering engines (Phase 3).
- Server-side headless PDF generation and snapshot hashing (Phase 4).
- Secure document share tokens, recipient signing API, and audit log persistence (Phase 5).
- Redis caching, BullMQ job queues, and email delivery workers (Phase 6).

