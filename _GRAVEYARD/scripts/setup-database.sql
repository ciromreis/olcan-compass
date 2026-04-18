-- Olcan Compass Database Setup
-- Creates schemas for all services in a single PostgreSQL database

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS medusa;
CREATE SCHEMA IF NOT EXISTS payload;

-- Create users (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'olcan_app') THEN
    CREATE USER olcan_app WITH PASSWORD 'olcan_app_password';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'olcan_medusa') THEN
    CREATE USER olcan_medusa WITH PASSWORD 'olcan_medusa_password';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'olcan_payload') THEN
    CREATE USER olcan_payload WITH PASSWORD 'olcan_payload_password';
  END IF;
END
$$;

-- Grant permissions
-- FastAPI (public schema)
GRANT ALL PRIVILEGES ON SCHEMA public TO olcan_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO olcan_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO olcan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO olcan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO olcan_app;

-- MedusaJS (medusa schema)
GRANT ALL PRIVILEGES ON SCHEMA medusa TO olcan_medusa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA medusa TO olcan_medusa;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA medusa TO olcan_medusa;
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa GRANT ALL ON TABLES TO olcan_medusa;
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa GRANT ALL ON SEQUENCES TO olcan_medusa;

-- Payload CMS (payload schema)
GRANT ALL PRIVILEGES ON SCHEMA payload TO olcan_payload;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA payload TO olcan_payload;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA payload TO olcan_payload;
ALTER DEFAULT PRIVILEGES IN SCHEMA payload GRANT ALL ON TABLES TO olcan_payload;
ALTER DEFAULT PRIVILEGES IN SCHEMA payload GRANT ALL ON SEQUENCES TO olcan_payload;

-- Allow cross-schema read access for integration
-- FastAPI can read from medusa and payload
GRANT USAGE ON SCHEMA medusa TO olcan_app;
GRANT SELECT ON ALL TABLES IN SCHEMA medusa TO olcan_app;
GRANT USAGE ON SCHEMA payload TO olcan_app;
GRANT SELECT ON ALL TABLES IN SCHEMA payload TO olcan_app;

-- MedusaJS can read from public (for user sync)
GRANT USAGE ON SCHEMA public TO olcan_medusa;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO olcan_medusa;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete!';
  RAISE NOTICE 'Schemas created: public, medusa, payload';
  RAISE NOTICE 'Users created: olcan_app, olcan_medusa, olcan_payload';
END
$$;
