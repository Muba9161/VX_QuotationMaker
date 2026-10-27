-- ==============================================================================
-- Migration: 001_create_schema_migrations
-- Description: Establishes schema migration history tracking table
-- Applied in: Phase 1 (Backend Foundation)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
