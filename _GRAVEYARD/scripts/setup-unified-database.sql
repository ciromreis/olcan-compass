-- Unified Database Setup for Olcan Compass
-- Creates single PostgreSQL database with schema separation
-- Run this after starting PostgreSQL container

-- ============================================================
-- 1. Create Schemas
-- ============================================================

CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS medusa;
CREATE SCHEMA IF NOT EXISTS payload;

-- ============================================================
-- 2. Create Database Users
-- ============================================================

-- FastAPI user (full access to public schema, read-only to others)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'olcan_app') THEN
        CREATE USER olcan_app WITH PASSWORD 'olcan_app_secure_2026';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON SCHEMA public TO olcan_app;
GRANT USAGE ON SCHEMA medusa TO olcan_app;
GRANT SELECT ON ALL TABLES IN SCHEMA medusa TO olcan_app;
GRANT USAGE ON SCHEMA payload TO olcan_app;
GRANT SELECT ON ALL TABLES IN SCHEMA payload TO olcan_app;

-- MedusaJS user (full access to medusa schema, read users from public)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'olcan_medusa') THEN
        CREATE USER olcan_medusa WITH PASSWORD 'olcan_medusa_secure_2026';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON SCHEMA medusa TO olcan_medusa;
GRANT USAGE ON SCHEMA public TO olcan_medusa;
GRANT SELECT ON public.users TO olcan_medusa;

-- PayloadCMS user (full access to payload schema, read users and products)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'olcan_payload') THEN
        CREATE USER olcan_payload WITH PASSWORD 'olcan_payload_secure_2026';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON SCHEMA payload TO olcan_payload;
GRANT USAGE ON SCHEMA public TO olcan_payload;
GRANT SELECT ON public.users TO olcan_payload;
GRANT USAGE ON SCHEMA medusa TO olcan_payload;
GRANT SELECT ON ALL TABLES IN SCHEMA medusa TO olcan_payload;

-- ============================================================
-- 3. Install Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 4. Grant Future Permissions
-- ============================================================

-- Ensure new tables in medusa are readable by olcan_app
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa 
GRANT SELECT ON TABLES TO olcan_app;

-- Ensure new tables in payload are readable by olcan_app
ALTER DEFAULT PRIVILEGES IN SCHEMA payload 
GRANT SELECT ON TABLES TO olcan_app;

-- Ensure new tables in medusa are readable by olcan_payload
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa 
GRANT SELECT ON TABLES TO olcan_payload;

-- ============================================================
-- 5. Create Cross-Schema Link Tables (After Migrations)
-- ============================================================

-- Note: These will be added after FastAPI and MedusaJS migrations run
-- See setup-cross-schema-links.sql

-- ============================================================
-- 6. Verification Queries
-- ============================================================

-- Check schemas
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name IN ('public', 'medusa', 'payload');

-- Check users
SELECT usename FROM pg_user 
WHERE usename IN ('olcan_app', 'olcan_medusa', 'olcan_payload');

-- Check extensions
SELECT extname FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');
