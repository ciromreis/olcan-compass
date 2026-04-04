"""add_interview_engine

Revision ID: 0006_interviews
Revises: 0005_narratives
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006_interviews"
down_revision = "0005_narratives"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # interview_questions table
    op.create_table(
        "interview_questions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("question_text_en", sa.Text(), nullable=False),
        sa.Column("question_text_pt", sa.Text(), nullable=False),
        sa.Column("question_text_es", sa.Text(), nullable=False),
        sa.Column("question_type", sa.Enum("motivation", "background", "challenge", "goals", "cultural_fit", "technical", "scenario", "question_for_panel", name="interviewquestiontype"), nullable=False),
        sa.Column("route_types", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("difficulty", sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column("what_assessors_look_for", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column("common_mistakes", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("version", sa.Integer(), nullable=False, server_default='1'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_interview_questions"))
    )
    op.create_index(op.f("ix_interview_questions_question_type"), "interview_questions", ["question_type"], unique=False)

    # interview_sessions table
    op.create_table(
        "interview_sessions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("route_id", sa.UUID(), nullable=True),
        sa.Column("session_type", sa.String(length=50), nullable=False),
        sa.Column("target_institution", sa.String(length=200), nullable=True),
        sa.Column("status", sa.Enum("scheduled", "in_progress", "completed", "abandoned", name="interviewsessionstatus"), nullable=False, server_default='scheduled'),
        sa.Column("question_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("current_question_index", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("total_questions", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("estimated_duration_minutes", sa.Integer(), nullable=False, server_default='30'),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("clarity_score", sa.Float(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("relevance_score", sa.Float(), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("top_strengths", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("improvement_areas", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], name=op.f("fk_interview_sessions_route_id_routes"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_interview_sessions_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_interview_sessions"))
    )
    op.create_index(op.f("ix_interview_sessions_route_id"), "interview_sessions", ["route_id"], unique=False)
    op.create_index(op.f("ix_interview_sessions_user_id"), "interview_sessions", ["user_id"], unique=False)

    # interview_answers table
    op.create_table(
        "interview_answers",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("session_id", sa.UUID(), nullable=False),
        sa.Column("question_id", sa.UUID(), nullable=False),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("audio_url", sa.String(length=500), nullable=True),
        sa.Column("video_url", sa.String(length=500), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("word_count", sa.Integer(), nullable=True),
        sa.Column("status", sa.Enum("pending", "recorded", "analyzed", name="interviewanswerstatus"), nullable=False, server_default='pending'),
        sa.Column("clarity_score", sa.Float(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("relevance_score", sa.Float(), nullable=True),
        sa.Column("structure_score", sa.Float(), nullable=True),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("content_feedback", sa.Text(), nullable=True),
        sa.Column("delivery_feedback", sa.Text(), nullable=True),
        sa.Column("improvement_suggestions", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("key_strengths", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("ai_model", sa.String(length=50), nullable=True),
        sa.Column("token_usage", sa.Integer(), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("analyzed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["question_id"], ["interview_questions.id"], name=op.f("fk_interview_answers_question_id_interview_questions"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["session_id"], ["interview_sessions.id"], name=op.f("fk_interview_answers_session_id_interview_sessions"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_interview_answers"))
    )
    op.create_index(op.f("ix_interview_answers_question_id"), "interview_answers", ["question_id"], unique=False)
    op.create_index(op.f("ix_interview_answers_session_id"), "interview_answers", ["session_id"], unique=False)

    # interview_feedback_templates table
    op.create_table(
        "interview_feedback_templates",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("feedback_type", sa.String(length=50), nullable=False),
        sa.Column("question_types", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("title_en", sa.String(length=200), nullable=False),
        sa.Column("title_pt", sa.String(length=200), nullable=False),
        sa.Column("title_es", sa.String(length=200), nullable=False),
        sa.Column("description_en", sa.Text(), nullable=False),
        sa.Column("description_pt", sa.Text(), nullable=False),
        sa.Column("description_es", sa.Text(), nullable=False),
        sa.Column("suggestions_en", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("suggestions_pt", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("suggestions_es", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("trigger_score_range", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column("trigger_keywords", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("priority", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_interview_feedback_templates"))
    )


def downgrade() -> None:
    op.drop_table("interview_feedback_templates")
    op.drop_index(op.f("ix_interview_answers_session_id"), table_name="interview_answers")
    op.drop_index(op.f("ix_interview_answers_question_id"), table_name="interview_answers")
    op.drop_table("interview_answers")
    op.drop_index(op.f("ix_interview_sessions_user_id"), table_name="interview_sessions")
    op.drop_index(op.f("ix_interview_sessions_route_id"), table_name="interview_sessions")
    op.drop_table("interview_sessions")
    op.drop_index(op.f("ix_interview_questions_question_type"), table_name="interview_questions")
    op.drop_table("interview_questions")
    op.execute("DROP TYPE IF EXISTS interviewquestiontype")
    op.execute("DROP TYPE IF EXISTS interviewsessionstatus")
    op.execute("DROP TYPE IF EXISTS interviewanswerstatus")
