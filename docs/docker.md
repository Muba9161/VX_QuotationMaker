# Docker Infrastructure & Operational Guide

This document details container orchestration, service dependencies, persistent volumes, and operational commands for the local Docker environment.

---

## 1. Services Architecture

| Service | Image / Build | Port | Role | Health Check |
|---|---|---|---|---|
| `postgres` | `postgres:16-alpine` | `5432` | Authoritative PostgreSQL relational database | `pg_isready` |
| `redis` | `redis:7-alpine` | `6379` | In-memory cache, rate limiting, and queue broker | `redis-cli ping` |
| `app` | Multi-stage `Dockerfile` | `3000` | Next.js App Router Web & REST API application | HTTP `/api/v1/health` probe |
| `worker` | Multi-stage `Dockerfile` | N/A | BullMQ background worker (email, pdf, cleanup) | Process supervision |

### Persistent Storage Volumes

- `vx_postgres_data`: Preserves database records, schemas, and transactions across container restarts.
- `vx_redis_data`: Preserves Redis AOF (Append-Only File) snapshots for queue recovery.
- `vx_document_storage`: Preserves locally uploaded templates, logos, and generated/signed PDF documents.

> **Caution:** Never run `docker compose down -v` in production or development if you intend to preserve existing database records and generated documents.

---

## 2. Standard Operational Commands

### Building and Starting Services

```bash
# Build images without cache
docker compose build

# Start all services in background
docker compose up -d

# Start only infrastructure dependencies (PostgreSQL + Redis)
docker compose up -d postgres redis
```

### Checking Status and Health

```bash
# Check status of all containers
docker compose ps

# Inspect detailed health status
docker inspect --format='{{json .State.Health}}' vx_app
docker inspect --format='{{json .State.Health}}' vx_postgres
docker inspect --format='{{json .State.Health}}' vx_redis
```

### Viewing Logs

```bash
# View combined logs
docker compose logs -f

# View application logs
docker compose logs -f app

# View background worker logs
docker compose logs -f worker

# View database logs
docker compose logs -f postgres
```

### Stopping and Restarting Services

```bash
# Stop all services gracefully (preserves volumes)
docker compose stop

# Restart a specific service (e.g., worker after code change)
docker compose restart worker

# Tear down containers and network (preserves volumes)
docker compose down
```

---

## 3. Database Migration inside Containers

To execute Prisma migrations inside the running app container:

```bash
docker compose exec app npx prisma migrate deploy
```

