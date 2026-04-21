"""add username column to users

Revision ID: 0026_add_users_username
Revises: 0025_enhanced_forge
Create Date: 2026-04-21

The ``users.username`` column was present in the ORM model but never created
by a migration. Production PostgreSQL therefore rejects every SELECT that
loads a ``User`` row, breaking ``/auth/login``, ``/auth/register``,
``/auth/me`` and every other authenticated endpoint with
``UndefinedColumnError: column users.username does not exist``.

This migration adds the column (nullable so existing rows survive),
back-fills it from the local part of the email with a numeric suffix on
collision, and adds a unique index. The ORM keeps the column nullable so
callers that don't supply one continue to work.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0026_add_users_username"
down_revision: Union[str, None] = "0025_enhanced_forge"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table: str, column: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column in {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    if _column_exists("users", "username"):
        return

    op.add_column(
        "users",
        sa.Column("username", sa.String(length=100), nullable=True),
    )

    op.execute(
        sa.text(
            """
            WITH ranked AS (
                SELECT
                    id,
                    split_part(email, '@', 1) AS base,
                    ROW_NUMBER() OVER (
                        PARTITION BY split_part(email, '@', 1)
                        ORDER BY created_at NULLS LAST, id
                    ) AS rn
                FROM users
            )
            UPDATE users
            SET username = CASE
                WHEN ranked.rn = 1 THEN ranked.base
                ELSE ranked.base || '-' || ranked.rn::text
            END
            FROM ranked
            WHERE users.id = ranked.id
            """
        )
    )

    op.create_index(
        "ix_users_username",
        "users",
        ["username"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_column("users", "username")
