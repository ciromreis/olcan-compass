"""documents: add route_id FK and scope column

Revision ID: e1a7c3f9b2d8
Revises: d299cf0b84a7
Create Date: 2026-04-16 10:00:00.000000

Adds two additive columns to the `documents` table:
  - route_id: nullable FK to routes.id — binds a document to a specific mobility route
  - scope: 'universal' | 'route' — universal docs (CV, passport) appear in all dossiers;
    route-scoped docs are contextual to the linked route

Both columns are nullable/have defaults so existing rows are unaffected.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'e1a7c3f9b2d8'
down_revision: Union[str, None] = 'd299cf0b84a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add route_id FK — nullable, SET NULL on route delete
    op.add_column(
        'documents',
        sa.Column(
            'route_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('routes.id', ondelete='SET NULL'),
            nullable=True,
        )
    )
    op.create_index('ix_documents_route_id', 'documents', ['route_id'], unique=False)

    # Add scope column — 'universal' (default) or 'route'
    op.add_column(
        'documents',
        sa.Column(
            'scope',
            sa.String(length=20),
            nullable=False,
            server_default='universal',
        )
    )


def downgrade() -> None:
    op.drop_index('ix_documents_route_id', table_name='documents')
    op.drop_column('documents', 'route_id')
    op.drop_column('documents', 'scope')
