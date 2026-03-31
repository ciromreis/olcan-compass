"""Add archetype and happiness columns to companions table

Revision ID: v25_companion_archetype_happiness
Revises: ca4149cd5594
Create Date: 2026-03-31

"""
from alembic import op
import sqlalchemy as sa

revision = 'v25_companion_archetype_happiness'
down_revision = 'ca4149cd5594'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add archetype column (canonical slug like 'institutional_escapee')
    # Use server_default so existing rows get a value
    op.add_column('companions',
        sa.Column('archetype', sa.String(50), nullable=False,
                  server_default='institutional_escapee')
    )

    # Add happiness column
    op.add_column('companions',
        sa.Column('happiness', sa.Float(), nullable=False, server_default='100.0')
    )

    # Back-fill archetype from type for existing rows
    op.execute("""
        UPDATE companions
        SET archetype = COALESCE(type, 'institutional_escapee')
        WHERE archetype = 'institutional_escapee' AND type IS NOT NULL
    """)


def downgrade() -> None:
    op.drop_column('companions', 'happiness')
    op.drop_column('companions', 'archetype')
