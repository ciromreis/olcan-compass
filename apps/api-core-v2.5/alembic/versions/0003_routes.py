"""add_route_engine_tables

Revision ID: 0003_routes
Revises: 0002_psych
Create Date: 2026-02-22

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003_routes"
down_revision = "0002_psych"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    route_type_enum = postgresql.ENUM(
        'scholarship', 'job_relocation', 'research', 'startup_visa',
        'exchange', 'digital_nomad', 'investor_visa',
        name='routetype',
        create_type=False
    )
    route_type_enum.create(op.get_bind(), checkfirst=True)
    
    route_status_enum = postgresql.ENUM(
        'draft', 'active', 'completed', 'archived', 'on_hold',
        name='routestatus',
        create_type=False
    )
    route_status_enum.create(op.get_bind(), checkfirst=True)
    
    milestone_status_enum = postgresql.ENUM(
        'locked', 'available', 'in_progress', 'completed', 'skipped',
        name='milestonestatus',
        create_type=False
    )
    milestone_status_enum.create(op.get_bind(), checkfirst=True)
    
    milestone_category_enum = postgresql.ENUM(
        'documentation', 'finance', 'language', 'application',
        'preparation', 'visa', 'logistics',
        name='milestonecategory',
        create_type=False
    )
    milestone_category_enum.create(op.get_bind(), checkfirst=True)
    
    # Table: route_templates
    op.create_table(
        "route_templates",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("route_type", route_type_enum, unique=True, nullable=False),
        sa.Column("name_en", sa.String(length=200), nullable=False),
        sa.Column("name_pt", sa.String(length=200), nullable=False),
        sa.Column("name_es", sa.String(length=200), nullable=False),
        sa.Column("description_en", sa.Text(), nullable=False),
        sa.Column("description_pt", sa.Text(), nullable=False),
        sa.Column("description_es", sa.Text(), nullable=False),
        sa.Column("estimated_duration_months", sa.Integer(), nullable=False, server_default='6'),
        sa.Column("competitiveness_level", sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column("typical_cost_usd", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("version", sa.Integer(), nullable=False, server_default='1'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_route_templates_route_type'), 'route_templates', ['route_type'])
    
    # Table: route_milestone_templates
    op.create_table(
        "route_milestone_templates",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("route_template_id", sa.UUID(as_uuid=True), sa.ForeignKey("route_templates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name_en", sa.String(length=200), nullable=False),
        sa.Column("name_pt", sa.String(length=200), nullable=False),
        sa.Column("name_es", sa.String(length=200), nullable=False),
        sa.Column("description_en", sa.Text(), nullable=False),
        sa.Column("description_pt", sa.Text(), nullable=False),
        sa.Column("description_es", sa.Text(), nullable=False),
        sa.Column("category", milestone_category_enum, nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("estimated_days", sa.Integer(), nullable=False, server_default='30'),
        sa.Column("prerequisites", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("required_evidence", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_route_milestone_templates_route_template_id'), 'route_milestone_templates', ['route_template_id'])
    
    # Table: routes
    op.create_table(
        "routes",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("template_id", sa.UUID(as_uuid=True), sa.ForeignKey("route_templates.id"), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("target_country", sa.String(length=100), nullable=True),
        sa.Column("target_organization", sa.String(length=200), nullable=True),
        sa.Column("target_deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", route_status_enum, nullable=False, server_default='draft'),
        sa.Column("completion_percentage", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("milestones_completed", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("total_milestones", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("readiness_score", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("risk_level", sa.String(length=20), nullable=False, server_default='low'),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_routes_user_id'), 'routes', ['user_id'])
    op.create_index(op.f('ix_routes_template_id'), 'routes', ['template_id'])
    op.create_index(op.f('ix_routes_status'), 'routes', ['status'])
    
    # Table: route_milestones
    op.create_table(
        "route_milestones",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("route_id", sa.UUID(as_uuid=True), sa.ForeignKey("routes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("template_id", sa.UUID(as_uuid=True), sa.ForeignKey("route_milestone_templates.id"), nullable=False),
        sa.Column("status", milestone_status_enum, nullable=False, server_default='locked'),
        sa.Column("completion_percentage", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("evidence_submitted", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("evidence_approved", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("user_notes", sa.Text(), nullable=True),
        sa.Column("completion_notes", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index(op.f('ix_route_milestones_route_id'), 'route_milestones', ['route_id'])
    op.create_index(op.f('ix_route_milestones_status'), 'route_milestones', ['status'])


def downgrade() -> None:
    op.drop_index(op.f('ix_route_milestones_status'), table_name='route_milestones')
    op.drop_index(op.f('ix_route_milestones_route_id'), table_name='route_milestones')
    op.drop_table("route_milestones")
    
    op.drop_index(op.f('ix_routes_status'), table_name='routes')
    op.drop_index(op.f('ix_routes_template_id'), table_name='routes')
    op.drop_index(op.f('ix_routes_user_id'), table_name='routes')
    op.drop_table("routes")
    
    op.drop_index(op.f('ix_route_milestone_templates_route_template_id'), table_name='route_milestone_templates')
    op.drop_table("route_milestone_templates")
    
    op.drop_index(op.f('ix_route_templates_route_type'), table_name='route_templates')
    op.drop_table("route_templates")
    
    op.execute("DROP TYPE IF EXISTS milestonecategory")
    op.execute("DROP TYPE IF EXISTS milestonestatus")
    op.execute("DROP TYPE IF EXISTS routestatus")
    op.execute("DROP TYPE IF EXISTS routetype")
