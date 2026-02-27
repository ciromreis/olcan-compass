# Olcan Compass

Mobility intelligence platform for international students and professionals.

## Start Here

- Project map: `docs/INDEX.md`
- Engineering guide: `AGENTS.md`
- Build/run handoff: `HANDOFF.md`
- Live status snapshot: `STATUS.md`

## Repository Layout

```text
olcan-compass/
├── apps/
│   ├── api/          FastAPI backend
│   └── web/          React + Vite frontend
├── docs/
│   ├── main/         Canonical product docs (read-only)
│   ├── operations/   Runbooks, deployment readiness, checklists
│   ├── planning/     Implementation plans and roadmap docs
│   ├── audit/        Assessment reports and quality snapshots
│   ├── session/      Session artifacts and working notes
│   └── reference/    Supporting technical references
├── scripts/          Project and maintenance scripts
└── archive/          Legacy prototypes and exports
```

## Quick Run

```bash
docker compose up --build
docker compose run --rm api alembic upgrade head
```

### Frontend (monorepo convenience)

From repo root:

```bash
npm run install:web
npm run dev:web
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- Health: `http://localhost:8000/api/health`

## Documentation Policy

- Canonical requirements stay in `docs/main/`.
- Operational docs stay in `docs/operations/`.
- Long-term plans stay in `docs/planning/`.
- Audits and session outputs are archived under `docs/audit/` and `docs/session/`.

This structure is intended to make audits, debugging, deployment, and iterative improvements easier.
