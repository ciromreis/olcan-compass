"""0018 — Analytics layer: product events, experiments, user attributes.

Revision ID: 0018_analytics_layer
Revises: 0017_subscription_fields
Create Date: 2026-04-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0018_analytics_layer"
down_revision = "0017_subscription_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("event_name", sa.String(120), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("properties", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("session_id", sa.String(64), nullable=True),
        sa.Column("client_source", sa.String(32), nullable=True),
        sa.Column("app_release", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_product_events_user_id", "product_events", ["user_id"])
    op.create_index("ix_product_events_event_name", "product_events", ["event_name"])
    op.create_index("ix_product_events_occurred_at", "product_events", ["occurred_at"])
    op.create_index("ix_product_events_session_id", "product_events", ["session_id"])
    op.create_index("ix_pe_user_occurred", "product_events", ["user_id", "occurred_at"])
    op.create_index("ix_pe_name_occurred", "product_events", ["event_name", "occurred_at"])

    op.create_table(
        "experiments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.String(80), nullable=False, unique=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("variant_labels", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("split_a_percent", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_experiments_slug", "experiments", ["slug"])
    op.create_index("ix_experiments_status", "experiments", ["status"])

    op.create_table(
        "experiment_assignments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("experiment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("variant", sa.String(64), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("experiment_id", "user_id", name="uq_experiment_assignment_user"),
    )
    op.create_index("ix_experiment_assignments_experiment_id", "experiment_assignments", ["experiment_id"])
    op.create_index("ix_experiment_assignments_user_id", "experiment_assignments", ["user_id"])

    op.create_table(
        "user_attributes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("namespace", sa.String(48), nullable=False, server_default="analytics"),
        sa.Column("key", sa.String(80), nullable=False),
        sa.Column("value_text", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", "namespace", "key", name="uq_user_attribute_ns_key"),
    )
    op.create_index("ix_user_attributes_user_id", "user_attributes", ["user_id"])
    op.create_index("ix_user_attributes_ns_key", "user_attributes", ["namespace", "key"])


def downgrade() -> None:
    op.drop_index("ix_user_attributes_ns_key", table_name="user_attributes")
    op.drop_index("ix_user_attributes_user_id", table_name="user_attributes")
    op.drop_table("user_attributes")

    op.drop_index("ix_experiment_assignments_user_id", table_name="experiment_assignments")
    op.drop_index("ix_experiment_assignments_experiment_id", table_name="experiment_assignments")
    op.drop_table("experiment_assignments")

    op.drop_index("ix_experiments_status", table_name="experiments")
    op.drop_index("ix_experiments_slug", table_name="experiments")
    op.drop_table("experiments")

    op.drop_index("ix_pe_name_occurred", table_name="product_events")
    op.drop_index("ix_pe_user_occurred", table_name="product_events")
    op.drop_index("ix_product_events_session_id", table_name="product_events")
    op.drop_index("ix_product_events_occurred_at", table_name="product_events")
    op.drop_index("ix_product_events_event_name", table_name="product_events")
    op.drop_index("ix_product_events_user_id", table_name="product_events")
    op.drop_table("product_events")
