"""add_narrative_engine

Revision ID: 0005_narratives
Revises: 0004_verification
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005_narratives"
down_revision = "0004_verification"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create narratives table
    op.create_table(
        "narratives",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("route_id", sa.UUID(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("narrative_type", sa.Enum("motivation_letter", "personal_statement", "cover_letter", "research_proposal", "cv_summary", "scholarship_essay", "other", name="narrativetype"), nullable=False),
        sa.Column("status", sa.Enum("draft", "in_review", "ready", "submitted", "archived", name="narrativestatus"), nullable=False),
        sa.Column("target_country", sa.String(length=100), nullable=True),
        sa.Column("target_institution", sa.String(length=200), nullable=True),
        sa.Column("target_program", sa.String(length=200), nullable=True),
        sa.Column("current_version_id", sa.UUID(), nullable=True),
        sa.Column("version_count", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("latest_clarity_score", sa.Float(), nullable=True),
        sa.Column("latest_coherence_score", sa.Float(), nullable=True),
        sa.Column("latest_authenticity_score", sa.Float(), nullable=True),
        sa.Column("latest_overall_score", sa.Float(), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("key_strengths", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("improvement_areas", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_analyzed_at", sa.DateTime(timezone=True), nullable=True),

        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], name=op.f("fk_narratives_route_id_routes"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_narratives_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_narratives"))
    )
    op.create_index(op.f("ix_narratives_route_id"), "narratives", ["route_id"], unique=False)
    op.create_index(op.f("ix_narratives_user_id"), "narratives", ["user_id"], unique=False)

    # Create narrative_versions table
    op.create_table(
        "narrative_versions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("narrative_id", sa.UUID(), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("content_plain", sa.Text(), nullable=True),
        sa.Column("word_count", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("change_summary", sa.String(length=500), nullable=True),
        sa.Column("clarity_score", sa.Float(), nullable=True),
        sa.Column("coherence_score", sa.Float(), nullable=True),
        sa.Column("authenticity_score", sa.Float(), nullable=True),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("analysis_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),

        sa.ForeignKeyConstraint(["narrative_id"], ["narratives.id"], name=op.f("fk_narrative_versions_narrative_id_narratives"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_narrative_versions"))
    )
    op.create_index(op.f("ix_narrative_versions_narrative_id"), "narrative_versions", ["narrative_id"], unique=False)

    # Add back the circular foreign key to narratives
    op.create_foreign_key(
        op.f("fk_narratives_current_version_id_narrative_versions"),
        "narratives", "narrative_versions",
        ["current_version_id"], ["id"],
        ondelete="SET NULL"
    )

    # Create narrative_analyses table
    op.create_table(
        "narrative_analyses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("narrative_id", sa.UUID(), nullable=False),
        sa.Column("version_id", sa.UUID(), nullable=True),
        sa.Column("clarity_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("coherence_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("alignment_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("authenticity_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("cultural_fit_score", sa.Float(), nullable=True),
        sa.Column("cliche_density_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("authenticity_risk", sa.String(length=20), nullable=False, server_default='low'),
        sa.Column("overall_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("key_strengths", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("improvement_actions", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("suggested_edits", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("ai_model", sa.String(length=50), nullable=True),
        sa.Column("prompt_version", sa.String(length=20), nullable=True),
        sa.Column("token_usage", sa.Integer(), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("raw_ai_output", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["narrative_id"], ["narratives.id"], name=op.f("fk_narrative_analyses_narrative_id_narratives"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["version_id"], ["narrative_versions.id"], name=op.f("fk_narrative_analyses_version_id_narrative_versions"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_narrative_analyses"))
    )
    op.create_index(op.f("ix_narrative_analyses_narrative_id"), "narrative_analyses", ["narrative_id"], unique=False)
    op.create_index(op.f("ix_narrative_analyses_version_id"), "narrative_analyses", ["version_id"], unique=False)

    # Add back the circular foreign key to narrative_versions
    op.create_foreign_key(
        op.f("fk_narrative_versions_analysis_id_narrative_analyses"),
        "narrative_versions", "narrative_analyses",
        ["analysis_id"], ["id"],
        ondelete="SET NULL"
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_narrative_analyses_version_id"), table_name="narrative_analyses")
    op.drop_index(op.f("ix_narrative_analyses_narrative_id"), table_name="narrative_analyses")
    op.drop_table("narrative_analyses")
    op.drop_index(op.f("ix_narrative_versions_narrative_id"), table_name="narrative_versions")
    op.drop_table("narrative_versions")
    op.drop_index(op.f("ix_narratives_user_id"), table_name="narratives")
    op.drop_index(op.f("ix_narratives_route_id"), table_name="narratives")
    op.drop_table("narratives")
    op.execute("DROP TYPE IF EXISTS narrativetype")
    op.execute("DROP TYPE IF EXISTS narrativestatus")
