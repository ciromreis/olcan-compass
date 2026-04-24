"""Add readiness_domain column to dossier_tasks

Revision ID: aaa111111111
Revises: ffe333333333
Create Date: 2026-04-25 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'aaa111111111'
down_revision: Union[str, None] = 'ffe333333333'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Defensive: IF NOT EXISTS guard for idempotency on Render
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'dossier_tasks' AND column_name = 'readiness_domain'
            ) THEN
                ALTER TABLE dossier_tasks
                ADD COLUMN readiness_domain VARCHAR(32) DEFAULT 'logistical';
            END IF;
        END
        $$;
    """)


def downgrade() -> None:
    op.drop_column('dossier_tasks', 'readiness_domain')
