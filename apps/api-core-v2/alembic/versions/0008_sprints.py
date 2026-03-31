"""add_readiness_and_sprints

Revision ID: 0008_sprints
Revises: 0007_applications
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0008_sprints"
down_revision = "0007_applications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # sprint_templates table
    op.create_table(
        "sprint_templates",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_gap_category", sa.String(length=50), nullable=False),
        sa.Column("target_readiness_threshold", sa.Float(), nullable=False, server_default='0'),
        sa.Column("duration_days", sa.Integer(), nullable=False, server_default='14'),
        sa.Column("estimated_effort_hours", sa.Integer(), nullable=False, server_default='20'),
        sa.Column("default_tasks", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("suggested_resources", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sprint_templates"))
    )

    # user_sprints table
    op.create_table(
        "user_sprints",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("route_id", sa.UUID(), nullable=True),
        sa.Column("template_id", sa.UUID(), nullable=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("gap_category", sa.String(length=50), nullable=False),
        sa.Column("gap_description", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum("planned", "active", "completed", "abandoned", name="sprintstatus"), nullable=False, server_default='planned'),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("target_end_date", sa.Date(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_tasks", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("completed_tasks", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("completion_percentage", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("estimated_effort_hours", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("actual_effort_hours", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("ai_guidance", sa.Text(), nullable=True),
        sa.Column("personalized_tips", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("linked_milestone_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], name=op.f("fk_user_sprints_route_id_routes"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["template_id"], ["sprint_templates.id"], name=op.f("fk_user_sprints_template_id_sprint_templates"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_user_sprints_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_sprints"))
    )
    op.create_index(op.f("ix_user_sprints_route_id"), "user_sprints", ["route_id"], unique=False)
    op.create_index(op.f("ix_user_sprints_user_id"), "user_sprints", ["user_id"], unique=False)

    # sprint_tasks table
    op.create_table(
        "sprint_tasks",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("sprint_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("task_type", sa.String(length=50), nullable=False, server_default='action'),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("status", sa.Enum("todo", "in_progress", "blocked", "completed", "skipped", name="sprinttaskstatus"), nullable=False, server_default='todo'),
        sa.Column("priority", sa.Enum("low", "medium", "high", "critical", name="sprinttaskpriority"), nullable=False, server_default='medium'),
        sa.Column("estimated_minutes", sa.Integer(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("prerequisite_task_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("linked_milestone_id", sa.UUID(), nullable=True),
        sa.Column("linked_narrative_id", sa.UUID(), nullable=True),
        sa.Column("linked_application_id", sa.UUID(), nullable=True),
        sa.Column("external_url", sa.String(length=500), nullable=True),
        sa.Column("resource_links", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("user_notes", sa.Text(), nullable=True),
        sa.Column("completion_notes", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["linked_application_id"], ["user_applications.id"], name=op.f("fk_sprint_tasks_linked_application_id_user_applications"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["linked_milestone_id"], ["route_milestones.id"], name=op.f("fk_sprint_tasks_linked_milestone_id_route_milestones"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["linked_narrative_id"], ["narratives.id"], name=op.f("fk_sprint_tasks_linked_narrative_id_narratives"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["sprint_id"], ["user_sprints.id"], name=op.f("fk_sprint_tasks_sprint_id_user_sprints"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sprint_tasks"))
    )
    op.create_index(op.f("ix_sprint_tasks_sprint_id"), "sprint_tasks", ["sprint_id"], unique=False)

    # readiness_assessments table
    op.create_table(
        "readiness_assessments",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("route_id", sa.UUID(), nullable=True),
        sa.Column("overall_readiness", sa.Float(), nullable=False, server_default='0'),
        sa.Column("confidence_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("documentation_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("financial_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("language_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("experience_score", sa.Float(), nullable=False, server_default='0'),
        sa.Column("gaps_identified", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("strengths", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("assessment_type", sa.String(length=50), nullable=False, server_default='self_assessment'),
        sa.Column("ai_model_version", sa.String(length=50), nullable=True),
        sa.Column("recommended_sprint_template_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], name=op.f("fk_readiness_assessments_route_id_routes"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_readiness_assessments_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_readiness_assessments"))
    )
    op.create_index(op.f("ix_readiness_assessments_route_id"), "readiness_assessments", ["route_id"], unique=False)
    op.create_index(op.f("ix_readiness_assessments_user_id"), "readiness_assessments", ["user_id"], unique=False)

    # gap_analyses table
    op.create_table(
        "gap_analyses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("route_id", sa.UUID(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column("missing_items", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("missing_document_types", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("required_level", sa.String(length=100), nullable=True),
        sa.Column("current_level", sa.String(length=100), nullable=True),
        sa.Column("blocking", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("estimated_resolution_days", sa.Integer(), nullable=True),
        sa.Column("suggested_sprint_template_id", sa.UUID(), nullable=True),
        sa.Column("is_resolved", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by_sprint_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["resolved_by_sprint_id"], ["user_sprints.id"], name=op.f("fk_gap_analyses_resolved_by_sprint_id_user_sprints"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], name=op.f("fk_gap_analyses_route_id_routes"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["suggested_sprint_template_id"], ["sprint_templates.id"], name=op.f("fk_gap_analyses_suggested_sprint_template_id_sprint_templates"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_gap_analyses_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_gap_analyses"))
    )
    op.create_index(op.f("ix_gap_analyses_route_id"), "gap_analyses", ["route_id"], unique=False)
    op.create_index(op.f("ix_gap_analyses_user_id"), "gap_analyses", ["user_id"], unique=False)

    # sprint_activity_logs table
    op.create_table(
        "sprint_activity_logs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("sprint_id", sa.UUID(), nullable=False),
        sa.Column("task_id", sa.UUID(), nullable=True),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("activity_type", sa.String(length=50), nullable=False),
        sa.Column("previous_status", sa.String(length=50), nullable=True),
        sa.Column("new_status", sa.String(length=50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["sprint_id"], ["user_sprints.id"], name=op.f("fk_sprint_activity_logs_sprint_id_user_sprints"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["task_id"], ["sprint_tasks.id"], name=op.f("fk_sprint_activity_logs_task_id_sprint_tasks"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_sprint_activity_logs_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sprint_activity_logs"))
    )
    op.create_index(op.f("ix_sprint_activity_logs_sprint_id"), "sprint_activity_logs", ["sprint_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_sprint_activity_logs_sprint_id"), table_name="sprint_activity_logs")
    op.drop_table("sprint_activity_logs")
    op.drop_index(op.f("ix_gap_analyses_user_id"), table_name="gap_analyses")
    op.drop_index(op.f("ix_gap_analyses_route_id"), table_name="gap_analyses")
    op.drop_table("gap_analyses")
    op.drop_index(op.f("ix_readiness_assessments_user_id"), table_name="readiness_assessments")
    op.drop_index(op.f("ix_readiness_assessments_route_id"), table_name="readiness_assessments")
    op.drop_table("readiness_assessments")
    op.drop_index(op.f("ix_sprint_tasks_sprint_id"), table_name="sprint_tasks")
    op.drop_table("sprint_tasks")
    op.drop_index(op.f("ix_user_sprints_user_id"), table_name="user_sprints")
    op.drop_index(op.f("ix_user_sprints_route_id"), table_name="user_sprints")
    op.drop_table("user_sprints")
    op.drop_table("sprint_templates")
    op.execute("DROP TYPE IF EXISTS sprintstatus")
    op.execute("DROP TYPE IF EXISTS sprinttaskstatus")
    op.execute("DROP TYPE IF EXISTS sprinttaskpriority")
