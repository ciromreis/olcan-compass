# Getting Started: Development Setup

This guide provides technical instructions for setting up the Olcan Compass full-stack environment.

## Architecture Context

- **Backend**: FastAPI (Python 3.12)
- **Frontend**: React 18 + Vite + TypeScript (Strict)
- **Database**: PostgreSQL with SQLAlchemy 2.0 (asyncpg)
- **Styling**: Tailwind CSS + MMXD Design Tokens

---

## 1. Quick Start (Dockerized)

The recommended way to run the full stack locally.

```bash
docker compose up --build
docker compose run --rm api alembic upgrade head
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 2. Manual Setup

### Backend (Python)

```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit DATABASE_URL for your local Postgres
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React/Vite)

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

---

## 3. Database Migrations

All schema changes must be handled via Alembic.

```bash
# Apply all migrations
docker compose run --rm api alembic upgrade head

# Create a new migration
docker compose run --rm api alembic revision -m "description" --autogenerate
```

---

## 4. Maintenance Scripts

Located in `/scripts/`:

- `backup_database.sh`: Snapshot the Postgres state.
- `deploy-v2.sh`: Production deployment trigger.
- `verify_marketplace.py`: Diagnostic for provider data consistency.

---

## 5. Development Policy

- **No TODOs**: Track tasks in Notion/Backlog.
- **Linting**: All code must pass `npm run lint` (frontend) or equivalent before PR.
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
