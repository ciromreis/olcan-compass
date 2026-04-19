"""Merge heads for v2.5 dossier system

Revision ID: d27e8b370665
Revises: 0023_stripe_connect_provider, 2750cc7930ac
Create Date: 2026-04-17 23:51:23.710879

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd27e8b370665'
down_revision: Union[str, None] = ('0023_stripe_connect_provider', '2750cc7930ac')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
