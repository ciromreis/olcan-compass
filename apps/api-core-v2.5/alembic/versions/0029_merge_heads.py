"""Merge all diverged heads into a single head

Merges:
  - 0028_seed_psychology_questions  (auth fix + OIOS seeds)
  - aaa111111111                    (readiness_domain column on dossier_tasks — EC-1)
  - 5d7b157b1dca                    (merge_heads: narrative_interview_loop + gamification)

Revision ID: 0029_merge_heads
Revises: 0028_seed_psychology_questions, aaa111111111, 5d7b157b1dca
Create Date: 2026-04-25 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0029_merge_heads"
down_revision: Union[str, None] = (
    "0028_seed_psychology_questions",
    "aaa111111111",
    "5d7b157b1dca",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
