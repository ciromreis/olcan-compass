"""add_psychological_engine_tables

Revision ID: 0002_psych
Revises: 0001_init
Create Date: 2026-02-22

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_psych"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    question_type_enum = postgresql.ENUM(
        'multiple_choice', 'scale', 'text', 'binary',
        name='psychquestiontype',
        create_type=False
    )
    question_type_enum.create(op.get_bind(), checkfirst=True)
    
    category_enum = postgresql.ENUM(
        'confidence', 'anxiety', 'discipline', 'risk_tolerance',
        'narrative_clarity', 'interview_anxiety', 'decision_style',
        'cultural_adaptability', 'financial_resilience', 'communication_style',
        name='psychcategory',
        create_type=False
    )
    category_enum.create(op.get_bind(), checkfirst=True)
    
    # Table: user_psych_profiles
    op.create_table(
        "user_psych_profiles",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        
        # Composite scores
        sa.Column("confidence_index", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("anxiety_score", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("discipline_score", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("narrative_maturity_score", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("interview_anxiety_score", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("cultural_adaptability_score", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("financial_resilience_score", sa.Float(), nullable=False, server_default='0.0'),
        
        # Enums
        sa.Column("risk_profile", sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column("decision_style", sa.String(length=50), nullable=False, server_default='analytical'),
        
        # States
        sa.Column("mobility_state", sa.String(length=20), nullable=False, server_default='exploring'),
        sa.Column("psychological_state", sa.String(length=20), nullable=False, server_default='uncertain'),
        
        # JSON
        sa.Column("fear_clusters", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("strengths", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("growth_areas", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        
        # Metadata
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("last_assessment_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_user_psych_profiles_user_id'), 'user_psych_profiles', ['user_id'])
    
    # Table: psych_questions
    op.create_table(
        "psych_questions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        
        # Text content
        sa.Column("text_en", sa.Text(), nullable=False),
        sa.Column("text_pt", sa.Text(), nullable=False),
        sa.Column("text_es", sa.Text(), nullable=False),
        
        # Classification
        sa.Column("question_type", question_type_enum, nullable=False),
        sa.Column("category", category_enum, nullable=False),
        
        # Options
        sa.Column("options", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        
        # Scoring
        sa.Column("weight", sa.Float(), nullable=False, server_default='1.0'),
        sa.Column("reverse_scored", sa.Boolean(), nullable=False, server_default='false'),
        
        # Metadata
        sa.Column("display_order", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("version", sa.Integer(), nullable=False, server_default='1'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_psych_questions_category'), 'psych_questions', ['category'])
    op.create_index(op.f('ix_psych_questions_is_active'), 'psych_questions', ['is_active'])
    
    # Table: psych_assessment_sessions
    op.create_table(
        "psych_assessment_sessions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        
        # Status
        sa.Column("status", sa.String(length=20), nullable=False, server_default='in_progress'),
        
        # Progress
        sa.Column("current_question_index", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("total_questions", sa.Integer(), nullable=False, server_default='0'),
        
        # Timing
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        
        # Results
        sa.Column("scores_snapshot", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_psych_assessment_sessions_user_id'), 'psych_assessment_sessions', ['user_id'])
    op.create_index(op.f('ix_psych_assessment_sessions_status'), 'psych_assessment_sessions', ['status'])
    
    # Table: psych_answers
    op.create_table(
        "psych_answers",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("session_id", sa.UUID(as_uuid=True), sa.ForeignKey("psych_assessment_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.UUID(as_uuid=True), sa.ForeignKey("psych_questions.id", ondelete="CASCADE"), nullable=False),
        
        # Answer
        sa.Column("answer_value", sa.Text(), nullable=False),
        sa.Column("answer_text", sa.Text(), nullable=True),
        
        # Score
        sa.Column("computed_score", sa.Float(), nullable=True),
        
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_psych_answers_session_id'), 'psych_answers', ['session_id'])
    op.create_index(op.f('ix_psych_answers_question_id'), 'psych_answers', ['question_id'])
    
    # Table: psych_score_history
    op.create_table(
        "psych_score_history",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        
        # Scores
        sa.Column("confidence_index", sa.Float(), nullable=False),
        sa.Column("anxiety_score", sa.Float(), nullable=False),
        sa.Column("discipline_score", sa.Float(), nullable=False),
        sa.Column("risk_profile", sa.String(length=20), nullable=False),
        
        # Context
        sa.Column("assessment_type", sa.String(length=50), nullable=False, server_default='onboarding'),
        sa.Column("trigger_event", sa.String(length=100), nullable=True),
        
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_psych_score_history_user_id'), 'psych_score_history', ['user_id'])
    op.create_index(op.f('ix_psych_score_history_created_at'), 'psych_score_history', ['created_at'])


def downgrade() -> None:
    # Drop in reverse order
    op.drop_index(op.f('ix_psych_score_history_created_at'), table_name='psych_score_history')
    op.drop_index(op.f('ix_psych_score_history_user_id'), table_name='psych_score_history')
    op.drop_table("psych_score_history")
    
    op.drop_index(op.f('ix_psych_answers_question_id'), table_name='psych_answers')
    op.drop_index(op.f('ix_psych_answers_session_id'), table_name='psych_answers')
    op.drop_table("psych_answers")
    
    op.drop_index(op.f('ix_psych_assessment_sessions_status'), table_name='psych_assessment_sessions')
    op.drop_index(op.f('ix_psych_assessment_sessions_user_id'), table_name='psych_assessment_sessions')
    op.drop_table("psych_assessment_sessions")
    
    op.drop_index(op.f('ix_psych_questions_is_active'), table_name='psych_questions')
    op.drop_index(op.f('ix_psych_questions_category'), table_name='psych_questions')
    op.drop_table("psych_questions")
    
    op.drop_index(op.f('ix_user_psych_profiles_user_id'), table_name='user_psych_profiles')
    op.drop_table("user_psych_profiles")
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS psychcategory")
    op.execute("DROP TYPE IF EXISTS psychquestiontype")
