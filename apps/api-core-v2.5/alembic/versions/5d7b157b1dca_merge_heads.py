"""merge_heads

Revision ID: 5d7b157b1dca
Revises: 0014_narrative_interview_loop, 91e881fee226
Create Date: 2026-04-10 11:15:37.522813

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '5d7b157b1dca'
down_revision: Union[str, None] = ('0014_narrative_interview_loop', '91e881fee226')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
