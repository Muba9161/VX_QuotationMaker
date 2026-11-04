# Docker deployment

The project is a full-stack Next.js application. Its UI and `/api/v1` backend run together in the `app` service; PostgreSQL 16, Redis, and the BullMQ worker run as separate Compose services.

The complete Windows Docker Desktop installation, configuration, startup, operations, backup, and restore guide is in the [README Docker Desktop section](../README.md#docker-desktop-on-windows).

Persistent volumes are named `vx_postgres_data`, `vx_redis_data`, and `vx_document_storage`. Use `docker compose down` to remove containers while retaining data. Do not use `docker compose down -v` when data must be preserved.

This repository currently has no Prisma migration directory. Follow the README's warning before running `prisma db push`; it is intended only for a new empty database unless schema changes have been reviewed and the data backed up.
