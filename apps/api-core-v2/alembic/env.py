from __future__ import annotations

import os
import re
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.db.base import Base
from app.db import models  # noqa: F401


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def _sync_database_url(url: str) -> str:
    """Convert asyncpg URL to psycopg and deduplicate query params."""
    url = url.replace("postgresql+asyncpg://", "postgresql+psycopg://")
    # Strip channel_binding (psycopg3 doesn't support it from Neon URLs)
    url = re.sub(r"[?&]channel_binding=[^&]*", "", url)
    # Deduplicate sslmode — keep only the first occurrence
    sslmode_matches = re.findall(r"[?&](sslmode=[^&]+)", url)
    if len(sslmode_matches) > 1:
        # Remove all but the first sslmode param
        for extra in sslmode_matches[1:]:
            url = url.replace("&" + extra, "").replace("?" + extra, "")
    # Clean up query string artifacts
    url = re.sub(r"\?&", "?", url)
    url = url.rstrip("?&")
    return url


def get_url() -> str:
    url = os.getenv("DATABASE_URL", "")
    if not url:
        raise RuntimeError("DATABASE_URL is required for migrations")
    return _sync_database_url(url)


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
