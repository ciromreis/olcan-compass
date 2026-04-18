"""0019 — CRM identity links (Twenty/Mautic).

Revision ID: 0019_crm_identity_links
Revises: 0018_analytics_layer
Create Date: 2026-04-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0019_crm_identity_links"
down_revision = "0018_analytics_layer"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "crm_identity_links",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("system", sa.String(32), nullable=False),
        sa.Column("external_id", sa.String(128), nullable=False),
        sa.Column("external_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("system", "external_id", name="uq_crm_identity_system_external"),
        sa.UniqueConstraint("user_id", "system", name="uq_crm_identity_user_system"),
    )

    op.create_index("ix_crm_identity_links_user_id", "crm_identity_links", ["user_id"])
    op.create_index("ix_crm_identity_links_system", "crm_identity_links", ["system"])


def downgrade() -> None:
    op.drop_index("ix_crm_identity_links_system", table_name="crm_identity_links")
    op.drop_index("ix_crm_identity_links_user_id", table_name="crm_identity_links")
    op.drop_table("crm_identity_links")

