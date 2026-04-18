"""add subscription_cancel_at column to users

Revision ID: 0022_subscription_cancel_at
Revises: d299cf0b84a7
Create Date: 2026-04-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0022_subscription_cancel_at"
down_revision: Union[str, None] = "d299cf0b84a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("subscription_cancel_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "subscription_cancel_at")
