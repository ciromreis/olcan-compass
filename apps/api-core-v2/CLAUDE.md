# ⛔ STABLE v2 API — READ ONLY

This is `api-core-v2`, the **production-stable v2 backend**.

## DO NOT

- Modify any source files
- Change models, routes, or migrations
- Run experiments here
- Modify the database (app.db)

## You May

- Read files to understand existing patterns and data models
- Reference endpoints when building v2.5 features

## Status

- **Tech stack:** FastAPI, SQLAlchemy, Alembic, Python 3.x
- **Auth:** JWT, working
- **Companion system:** Basic CRUD, working (feed, train, play, rest)
- **Evolution logic:** Partial
- **Databases:** app.db (SQLite dev), production config available

## If You Need to Work on the Backend

Go to `apps/api-core-v2.5/` instead.
Read `olcan-compass/CLAUDE.md` for full context.
