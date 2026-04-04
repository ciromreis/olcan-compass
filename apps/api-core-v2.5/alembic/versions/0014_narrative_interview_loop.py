"""add narrative interview loop insights and narrative links

Revision ID: 0014_narrative_interview_loop
Revises: 0013_organizations
Create Date: 2026-03-27
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0014_narrative_interview_loop"
down_revision = "0013_organizations"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("interview_sessions", sa.Column("source_narrative_id", sa.UUID(), nullable=True))
    op.add_column("interview_sessions", sa.Column("source_narrative_title", sa.String(length=200), nullable=True))
    op.create_index(op.f("ix_interview_sessions_source_narrative_id"), "interview_sessions", ["source_narrative_id"], unique=False)
    op.create_foreign_key(
        op.f("fk_interview_sessions_source_narrative_id_narratives"),
        "interview_sessions",
        "narratives",
        ["source_narrative_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "narrative_interview_loop_insights",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("narrative_id", sa.UUID(), nullable=False),
        sa.Column("route_id", sa.UUID(), nullable=True),
        sa.Column("latest_session_id", sa.UUID(), nullable=True),
        sa.Column("linked_session_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_session_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("average_overall_score", sa.Float(), nullable=True),
        sa.Column("alignment_score", sa.Float(), nullable=True),
        sa.Column("evidence_coverage_score", sa.Float(), nullable=True),
        sa.Column("average_answer_duration_seconds", sa.Float(), nullable=True),
        sa.Column("strongest_signals", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("focus_areas", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("summary", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["latest_session_id"], ["interview_sessions.id"], name=op.f("fk_narrative_interview_loop_insights_latest_session_id_interview_sessions"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["narrative_id"], ["narratives.id"], name=op.f("fk_narrative_interview_loop_insights_narrative_id_narratives"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], name=op.f("fk_narrative_interview_loop_insights_route_id_routes"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_narrative_interview_loop_insights_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_narrative_interview_loop_insights")),
        sa.UniqueConstraint("narrative_id", name=op.f("uq_narrative_interview_loop_insights_narrative_id")),
    )
    op.create_index(op.f("ix_narrative_interview_loop_insights_user_id"), "narrative_interview_loop_insights", ["user_id"], unique=False)
    op.create_index(op.f("ix_narrative_interview_loop_insights_narrative_id"), "narrative_interview_loop_insights", ["narrative_id"], unique=True)
    op.create_index(op.f("ix_narrative_interview_loop_insights_route_id"), "narrative_interview_loop_insights", ["route_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_narrative_interview_loop_insights_route_id"), table_name="narrative_interview_loop_insights")
    op.drop_index(op.f("ix_narrative_interview_loop_insights_narrative_id"), table_name="narrative_interview_loop_insights")
    op.drop_index(op.f("ix_narrative_interview_loop_insights_user_id"), table_name="narrative_interview_loop_insights")
    op.drop_table("narrative_interview_loop_insights")

    op.drop_constraint(op.f("fk_interview_sessions_source_narrative_id_narratives"), "interview_sessions", type_="foreignkey")
    op.drop_index(op.f("ix_interview_sessions_source_narrative_id"), table_name="interview_sessions")
    op.drop_column("interview_sessions", "source_narrative_title")
    op.drop_column("interview_sessions", "source_narrative_id")
