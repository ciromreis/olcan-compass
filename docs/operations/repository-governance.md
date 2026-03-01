# Repository Governance

This file defines the repository organization rules used to keep the codebase auditable, debuggable, deployable, and easy to evolve.

## Directory Responsibilities

- `apps/` - runnable application code only.
- `docs/main/` - canonical product requirements (no implementation edits).
- `docs/operations/` - runbooks, checklists, deployment and incident docs.
- `docs/planning/` - roadmaps, implementation plans, next-step strategy docs.
- `docs/audit/` - assessments, status snapshots, bug reports.
- `docs/session/` - temporary or session-specific notes and handover artifacts.
- `docs/reference/` - technical deep dives and supporting references.
- `scripts/` - curated scripts for diagnostics/maintenance.
- `scripts/archive/` - historical or one-off scripts retained for traceability.
- `archive/` - legacy prototypes and exports; not for deployment.

## File Placement Rules

- Keep root minimal: `README.md`, `AGENTS.md`.
- Do not place ephemeral notes in root.
- Keep executable scripts close to the owning app (`apps/api/scripts/...`) when app-specific.
- Keep Markdown in `docs/` unless it is one of the root runtime docs.

## Hygiene Rules

- Never commit `.env` files.
- Never commit generated artifacts (`.DS_Store`, `.pyc`, `*.bak`, transient schedules).
- Keep links in root docs pointed to `docs/INDEX.md` as the canonical navigation hub.

## Audit Workflow

1. Start from `docs/INDEX.md`.
2. Validate runtime docs (`docs/operations/HANDOFF.md`, `docs/operations/STATUS.md`) are current.
3. Review `docs/operations/integration-checklist.md` before deploy decisions.
4. Review `docs/audit/*` for historical context and risk notes.
