# VorldX White-Label Quotation & MOU Platform (Backend)

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

Backend application foundation for the **VorldX Industries Private Limited White-Label Quotation & MOU Creation and Digital Signing Platform**.

---

## 1. Architecture & Technology Stack

- **Runtime & Language**: Node.js (>= 20) with strict TypeScript (`strict: true`, zero implicit `any`).
- **Framework**: Express.js with a modular, layered service architecture.
- **Validation**: Schema-first validation powered by [Zod](https://zod.dev) with static type inference.
- **Database**: PostgreSQL with connection pooling (`pg.Pool`), transaction safety, and a deterministic migration runner.
- **Cache & Queues**: Redis via `ioredis` (resilient configuration; failure does not crash core application).
- **Storage**: Local filesystem storage (`LOCAL_STORAGE_PATH=./storage`). Cloud object storage (S3) is strictly prohibited by client specification.
- **Logging**: Structured JSON logging via [Pino](https://getpino.io) with strict credential and token redaction.
- **Testing**: [Vitest](https://vitest.dev) + [Supertest](https://github.com/ladjs/supertest).
- **Modularity Constraint**: Enforced maximum of 800 lines per application source file with automated CI enforcement (`npm run check:size`).

---

## 2. Directory Structure

```text
VX_QuotationMaker/
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierrc
├── Dockerfile
├── docker-compose.yml
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── docs/
│   └── project-requirements.pdf
├── migrations/
│   └── 001_create_schema_migrations.sql
├── scripts/
│   ├── check-file-sizes.ts
│   └── migrate.ts
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod validation of process.env
│   │   ├── database.ts         # Database pool configuration
│   │   ├── redis.ts            # Redis client options
│   │   └── index.ts            # Typed unified configuration export
│   ├── core/
│   │   ├── database/
│   │   │   ├── connection.ts   # Pool lifecycle, query helpers, health checks
│   │   │   ├── migrator.ts     # Transactional SQL migration engine
│   │   │   └── types.ts        # Database types
│   │   ├── redis/
│   │   │   └── client.ts       # Resilient Redis client
│   │   ├── errors/
│   │   │   ├── app-error.ts    # Custom error classes (AppError, NotFound, etc.)
│   │   │   └── http-status.ts  # Standard HTTP status code constants
│   │   ├── logger/
│   │   │   └── logger.ts       # Redacted structured JSON logger
│   │   ├── middleware/
│   │   │   ├── request-id.ts   # X-Request-ID propagation
│   │   │   ├── request-logger.ts # HTTP request logger
│   │   │   ├── validate.ts     # Zod schema request validation middleware
│   │   │   └── error-handler.ts # Safe centralized error handler
│   │   ├── types/
│   │   │   ├── api-response.ts # Standard API envelope & factory helpers
│   │   │   └── context.ts      # Multi-tenant context and user role definitions
│   │   └── utils/
│   │       └── shutdown.ts     # Graceful process termination handler
│   ├── modules/
│   │   └── health/
│   │       ├── health.controller.ts
│   │       ├── health.service.ts
│   │       ├── health.routes.ts
│   │       └── index.ts
│   ├── app.ts                  # Express application factory
│   └── index.ts                # Application bootstrap entry point
└── tests/
    ├── setup.ts
    ├── unit/
    │   ├── env.test.ts
    │   ├── errors.test.ts
    │   └── validate.test.ts
    └── integration/
        ├── app.test.ts
        ├── database.test.ts
        └── health.test.ts
```

---

## 3. Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (`v24.x` recommended).
- **PostgreSQL**: `v14` or higher (running locally or via Docker).
- **Redis** *(Optional for Phase 1)*: Caching is resilient and can be disabled locally via `REDIS_ENABLED=false`.

### Local Development Setup

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your local PostgreSQL credentials:
   ```dotenv
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=vx_quotation_maker
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_db_password
   REDIS_ENABLED=false
   ```

3. **Check Database Migrations (Development Database)**:
   View migration status on your development database (`vx_quotation_maker`):
   ```bash
   npm run migrate:status
   ```
   Apply pending migrations to your development database:
   ```bash
   npm run migrate:up
   ```

4. **Prepare the Dedicated Test Database**:
   Integration tests strictly require an isolated test database (`vx_quotation_maker_test`) and will refuse to run against the development database to prevent accidental data loss.
   Create the test database safely without modifying or touching any existing databases:
   ```bash
   npm run db:create:test
   ```
   *(Alternatively, in psql: `CREATE DATABASE vx_quotation_maker_test;`)*

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:4000`.

---

## 4. Docker Workflow

If you prefer to run the entire backend stack (application, PostgreSQL, and Redis) in Docker:

```bash
# Start all services in the background
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop all services
docker compose down
```

---

## 5. API Standards

All endpoints are versioned under `/api/v1`.

### Health Check Endpoint
`GET /api/v1/health`

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptimeSeconds": 42,
    "environment": "development",
    "version": "1.0.0",
    "timestamp": "2026-10-27T15:00:00.000Z",
    "services": {
      "database": {
        "status": "up",
        "latencyMs": 2
      },
      "redis": {
        "status": "disabled",
        "latencyMs": null
      }
    }
  },
  "requestId": "4c6d9a93-c917-45e3-997f-25597fc0aa67",
  "timestamp": "2026-10-27T15:00:00.000Z"
}
```

#### Degraded Response (200 OK)
Returned when PostgreSQL is up, but Redis is enabled and unreachable:
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "services": {
      "database": { "status": "up", "latencyMs": 2 },
      "redis": { "status": "down" }
    }
  }
}
```

#### Unhealthy Response (503 Service Unavailable)
Returned when the critical persistence layer (PostgreSQL) is down.

---

## 6. Scripts & Quality Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts server with live auto-reload via `tsx`. |
| `npm run build` | Compiles TypeScript to production `dist/`. |
| `npm start` | Runs the compiled production server. |
| `npm test` | Runs the full Vitest test suite. |
| `npm run test:unit` | Runs isolated unit tests (no database required). |
| `npm run test:integration` | Runs API and database integration tests. |
| `npm run test:db` | Runs live PostgreSQL integration tests against `vx_quotation_maker_test`. |
| `npm run test:coverage` | Generates test coverage reports. |
| `npm run typecheck` | Strict TypeScript compiler check (`tsc --noEmit`). |
| `npm run lint` | Runs ESLint over `src/`, `tests/`, and `scripts/`. |
| `npm run format:check` | Verifies Prettier code style. |
| `npm run format` | Auto-formats code with Prettier. |
| `npm run check:size` | Verifies that no source file exceeds the 800-line constraint. |
| `npm run db:create:test`| Safely checks and creates `vx_quotation_maker_test` if missing. |
| `npm run migrate:status`| Checks database migration status on development database. |
| `npm run migrate:up` | Executes pending SQL migrations on development database. |

---

## 7. Multi-Tenant Security Model (Upcoming Phases)

- **Isolated Tenancy**: All organization entities are scoped by `organization_id`.
- **Public Recipient Links**: High-entropy cryptographically unguessable links; recipients sign documents without workspace accounts.
- **Letterhead Uniformity**: Quotations and MOUs share the organization's single configured letterhead asset.
- **Local Storage**: All files are stored in `LOCAL_STORAGE_PATH` under private directories with permission checks.
