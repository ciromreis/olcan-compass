"""merge quest system heads

Revision ID: d299cf0b84a7
Revises: 0020_task_management, 0021_deep_integration
Create Date: 2026-04-14 18:02:15.497627

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd299cf0b84a7'
down_revision: Union[str, None] = ('0020_task_management', '0021_deep_integration')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
