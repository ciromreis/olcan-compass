"""add_prompt_registry_and_ai_job_queue

Revision ID: 0009_prompts
Revises: 0008_sprints
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0009_prompts"
down_revision = "0008_sprints"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # prompt_templates table
    op.create_table(
        "prompt_templates",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.Enum("narrative_analysis", "narrative_generation", "interview_feedback", "interview_question_generation", "readiness_assessment", "gap_analysis", "sprint_generation", "opportunity_matching", "general", name="promptcategory"), nullable=False, server_default='general'),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("version", sa.Integer(), nullable=False, server_default='1'),
        sa.Column("parent_version_id", sa.UUID(), nullable=True),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("user_prompt_template", sa.Text(), nullable=False),
        sa.Column("response_schema", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("expected_response_format", sa.String(length=50), nullable=False, server_default='json'),
        sa.Column("default_model", sa.String(length=100), nullable=True),
        sa.Column("default_temperature", sa.Float(), nullable=False, server_default='0.7'),
        sa.Column("max_tokens", sa.Integer(), nullable=True),
        sa.Column("variables", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("status", sa.Enum("draft", "active", "deprecated", "archived", name="prompttemplatestatus"), nullable=False, server_default='draft'),
        sa.Column("usage_count", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("average_latency_ms", sa.Integer(), nullable=True),
        sa.Column("success_rate", sa.Float(), nullable=False, server_default='1.0'),
        sa.Column("content_warning", sa.Text(), nullable=True),
        sa.Column("requires_review", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], name=op.f("fk_prompt_templates_created_by_id_users"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["parent_version_id"], ["prompt_templates.id"], name=op.f("fk_prompt_templates_parent_version_id_prompt_templates"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_prompt_templates"))
    )
    op.create_index(op.f("ix_prompt_templates_category"), "prompt_templates", ["category"], unique=False)
    op.create_index(op.f("ix_prompt_templates_name"), "prompt_templates", ["name"], unique=False)
    op.create_index(op.f("ix_prompt_templates_slug"), "prompt_templates", ["slug"], unique=True)

    # prompt_execution_logs table
    op.create_table(
        "prompt_execution_logs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("template_id", sa.UUID(), nullable=True),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("related_entity_type", sa.String(length=50), nullable=True),
        sa.Column("related_entity_id", sa.UUID(), nullable=True),
        sa.Column("input_variables", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column("rendered_prompt", sa.Text(), nullable=False),
        sa.Column("response_content", sa.Text(), nullable=True),
        sa.Column("response_status", sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("prompt_tokens", sa.Integer(), nullable=True),
        sa.Column("completion_tokens", sa.Integer(), nullable=True),
        sa.Column("total_tokens", sa.Integer(), nullable=True),
        sa.Column("model_used", sa.String(length=100), nullable=True),
        sa.Column("provider_used", sa.String(length=50), nullable=False, server_default='simulation'),
        sa.Column("user_rating", sa.Integer(), nullable=True),
        sa.Column("user_feedback", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["template_id"], ["prompt_templates.id"], name=op.f("fk_prompt_execution_logs_template_id_prompt_templates"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_prompt_execution_logs_user_id_users"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_prompt_execution_logs"))
    )
    op.create_index(op.f("ix_prompt_execution_logs_template_id"), "prompt_execution_logs", ["template_id"], unique=False)
    op.create_index(op.f("ix_prompt_execution_logs_user_id"), "prompt_execution_logs", ["user_id"], unique=False)

    # ai_job_queue table
    op.create_table(
        "ai_job_queue",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("job_type", sa.String(length=50), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default='5'),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("prompt_template_id", sa.UUID(), nullable=True),
        sa.Column("custom_prompt", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column("result_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("max_retries", sa.Integer(), nullable=False, server_default='3'),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("worker_id", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["prompt_template_id"], ["prompt_templates.id"], name=op.f("fk_ai_job_queue_prompt_template_id_prompt_templates"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_ai_job_queue_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ai_job_queue"))
    )
    op.create_index(op.f("ix_ai_job_queue_job_type"), "ai_job_queue", ["job_type"], unique=False)
    op.create_index(op.f("ix_ai_job_queue_status"), "ai_job_queue", ["status"], unique=False)
    op.create_index(op.f("ix_ai_job_queue_user_id"), "ai_job_queue", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_job_queue_user_id"), table_name="ai_job_queue")
    op.drop_index(op.f("ix_ai_job_queue_status"), table_name="ai_job_queue")
    op.drop_index(op.f("ix_ai_job_queue_job_type"), table_name="ai_job_queue")
    op.drop_table("ai_job_queue")
    op.drop_index(op.f("ix_prompt_execution_logs_user_id"), table_name="prompt_execution_logs")
    op.drop_index(op.f("ix_prompt_execution_logs_template_id"), table_name="prompt_execution_logs")
    op.drop_table("prompt_execution_logs")
    op.drop_index(op.f("ix_prompt_templates_slug"), table_name="prompt_templates")
    op.drop_index(op.f("ix_prompt_templates_name"), table_name="prompt_templates")
    op.drop_index(op.f("ix_prompt_templates_category"), table_name="prompt_templates")
    op.drop_table("prompt_templates")
    op.execute("DROP TYPE IF EXISTS promptcategory")
    op.execute("DROP TYPE IF EXISTS prompttemplatestatus")
