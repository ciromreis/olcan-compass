"""0017 — Add subscription fields to users table.

Adds: is_premium, subscription_plan, stripe_customer_id,
      stripe_subscription_id, subscription_status.

Revision ID: 0017_subscription_fields
Revises: 0016_billing_credits
Create Date: 2026-04-11
"""

from alembic import op
import sqlalchemy as sa

revision = "0017_subscription_fields"
down_revision = "0016_billing_credits"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_premium", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "users",
        sa.Column("subscription_plan", sa.String(20), nullable=False, server_default="free"),
    )
    op.add_column(
        "users",
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("subscription_status", sa.String(30), nullable=False, server_default="inactive"),
    )
    op.create_unique_constraint("uq_users_stripe_customer_id", "users", ["stripe_customer_id"])


def downgrade() -> None:
    op.drop_constraint("uq_users_stripe_customer_id", "users", type_="unique")
    op.drop_column("users", "subscription_status")
    op.drop_column("users", "stripe_subscription_id")
    op.drop_column("users", "stripe_customer_id")
    op.drop_column("users", "subscription_plan")
    op.drop_column("users", "is_premium")
