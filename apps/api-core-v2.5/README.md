# Olcan API Core v2.5

**Status:** ✅ Active Development  
**Documentation:** See [../../wiki/02_Arquitetura_Compass/API_Core_v2_5_Overview.md](../../wiki/02_Arquitetura_Compass/API_Core_v2_5_Overview.md)  
**Database:** PostgreSQL with Alembic migrations

## Quick Start

### Run with Docker (Recommended)

From repo root:

```bash
docker compose up --build
```

Open:
- Health: http://localhost:8000/api/health
- Docs: http://localhost:8000/docs

### Run Locally (Python)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database Migrations (Alembic)

Run migrations without installing Python locally:

```bash
# Apply migrations
docker compose run --rm api alembic upgrade head

# Create new migration
docker compose run --rm api alembic revision -m "your_message" --autogenerate
```

## Development Notes

- **Auth emails:** Transactional emails not integrated yet. In development mode, `/api/auth/forgot-password` returns `reset_url` for testing.
- **Environment:** Keep `ENV=development` in `.env` for local development.

**Full API documentation, architecture, and deployment guides in wiki.**
