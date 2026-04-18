"""add stripe connect fields to provider_profiles

Revision ID: 0023_stripe_connect_provider
Revises: 0022_subscription_cancel_at
Create Date: 2026-04-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0023_stripe_connect_provider"
down_revision: Union[str, None] = "0022_subscription_cancel_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "provider_profiles",
        sa.Column("stripe_connect_account_id", sa.String(255), nullable=True),
    )
    op.add_column(
        "provider_profiles",
        sa.Column(
            "stripe_connect_onboarding_complete",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )


def downgrade() -> None:
    op.drop_column("provider_profiles", "stripe_connect_onboarding_complete")
    op.drop_column("provider_profiles", "stripe_connect_account_id")
