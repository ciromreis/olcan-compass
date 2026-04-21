"""Ensure ALL User model columns exist — defensive migration.

Revision ID: 0027_ensure_all_user_columns
Revises: 0026_add_users_username
Create Date: 2026-04-21

Root-cause fix for the auth 500 blocker:
 - Migration 0026 fixed the missing `username` column.
 - However the ORM model also declares `bio` and `preferences` columns that
   were NEVER created by any migration.  When SQLAlchemy does a SELECT on
   a User row (e.g. `db.refresh(new_user)` after register), PostgreSQL throws
   ``UndefinedColumn: column users.bio does not exist``.

This migration uses IF NOT EXISTS guards so it is safe to run regardless of
the current DB state.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0027_ensure_all_user_columns"
down_revision: Union[str, None] = "0026_add_users_username"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _col_exists(table: str, column: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column in {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    # --- Columns never created by any previous migration ---

    if not _col_exists("users", "bio"):
        op.add_column(
            "users",
            sa.Column("bio", sa.String(1000), nullable=True),
        )

    if not _col_exists("users", "preferences"):
        op.add_column(
            "users",
            sa.Column("preferences", sa.JSON(), nullable=True, server_default=sa.text("'{}'::jsonb")),
        )

    # --- Safety net: re-check columns from other migrations in case they
    #     failed silently on a prior deploy ---

    if not _col_exists("users", "username"):
        op.add_column(
            "users",
            sa.Column("username", sa.String(100), nullable=True),
        )

    if not _col_exists("users", "forge_credits"):
        op.add_column(
            "users",
            sa.Column("forge_credits", sa.Integer(), nullable=False, server_default="3"),
        )

    if not _col_exists("users", "is_premium"):
        op.add_column(
            "users",
            sa.Column("is_premium", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        )

    if not _col_exists("users", "subscription_plan"):
        op.add_column(
            "users",
            sa.Column("subscription_plan", sa.String(20), nullable=False, server_default="free"),
        )

    if not _col_exists("users", "stripe_customer_id"):
        op.add_column(
            "users",
            sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        )

    if not _col_exists("users", "stripe_subscription_id"):
        op.add_column(
            "users",
            sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
        )

    if not _col_exists("users", "subscription_status"):
        op.add_column(
            "users",
            sa.Column("subscription_status", sa.String(30), nullable=False, server_default="inactive"),
        )

    if not _col_exists("users", "subscription_cancel_at"):
        op.add_column(
            "users",
            sa.Column("subscription_cancel_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _col_exists("users", "verification_token"):
        op.add_column(
            "users",
            sa.Column("verification_token", sa.String(255), nullable=True),
        )

    if not _col_exists("users", "verification_token_expires"):
        op.add_column(
            "users",
            sa.Column("verification_token_expires", sa.DateTime(timezone=True), nullable=True),
        )

    if not _col_exists("users", "verified_at"):
        op.add_column(
            "users",
            sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _col_exists("users", "password_reset_token"):
        op.add_column(
            "users",
            sa.Column("password_reset_token", sa.String(255), nullable=True),
        )

    if not _col_exists("users", "password_reset_token_expires"):
        op.add_column(
            "users",
            sa.Column("password_reset_token_expires", sa.DateTime(timezone=True), nullable=True),
        )

    if not _col_exists("users", "password_reset_count"):
        op.add_column(
            "users",
            sa.Column("password_reset_count", sa.Integer(), nullable=False, server_default="0"),
        )


def downgrade() -> None:
    # Only drop the two columns that are new in THIS migration.
    # The rest were handled by their original migration downgrades.
    for col in ("bio", "preferences"):
        if _col_exists("users", col):
            op.drop_column("users", col)
