# API (FastAPI)

## Run with Docker

From repo root:

```bash
docker compose up --build
```

Open:
- Health: http://localhost:8000/api/health

## Database migrations (Alembic)

You can run migrations without installing Python locally.

From repo root:

```bash
docker compose run --rm api alembic upgrade head
```

To create a new migration (for future development):

```bash
docker compose run --rm api alembic revision -m "your_message" --autogenerate
```

## Run locally (python)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Auth reset emails (dev note)

- Transactional emails (forgot-password / verify-email) are not integrated yet.
- For local development, keep `ENV=development` in `apps/api/.env`.
- When `ENV != production`, `/api/auth/forgot-password` may return a `reset_url` so you can complete the reset flow without email delivery.
