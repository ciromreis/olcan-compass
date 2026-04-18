"""deep integration phase 1 - archetype configs and dynamic routes

Revision ID: 0021_deep_integration
Revises: 91e881fee226
Create Date: 2026-04-14

Creates tables for:
- archetype_configs: Deep archetype metadata for personalization
- route_builders: Dynamic route creation system
- dynamic_milestones: Context-specific milestones
- companions: Archetype-aware tamagotchi companions (UUID-based)
- companion_activities: Tamagotchi mechanics tracking
- companion_evolutions: Evolution event history
- companion_messages: Archetype-specific communication

This migration implements the foundation for transforming olcan-compass
into an archetype-driven Swiss Army knife for professional journeys.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '0021_deep_integration'
down_revision: Union[str, None] = '91e881fee226'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create archetype_configs table
    op.create_table(
        'archetype_configs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('archetype', sa.String(50), unique=True, nullable=False),
        sa.Column('name_en', sa.String(100), nullable=False),
        sa.Column('name_pt', sa.String(100), nullable=False),
        sa.Column('name_es', sa.String(100), nullable=False),
        sa.Column('description_en', sa.Text, nullable=False),
        sa.Column('description_pt', sa.Text, nullable=False),
        sa.Column('description_es', sa.Text, nullable=False),
        sa.Column('primary_motivator', sa.String(100), nullable=False),
        sa.Column('primary_fear', sa.String(100), nullable=False),
        sa.Column('evolution_path', sa.String(200), nullable=False),
        sa.Column('preferred_route_types', postgresql.JSON, server_default='[]'),
        sa.Column('route_weights', postgresql.JSON, server_default='{}'),
        sa.Column('narrative_voice', postgresql.JSON, server_default='{}'),
        sa.Column('companion_traits', postgresql.JSON, server_default='{}'),
        sa.Column('interview_focus_areas', postgresql.JSON, server_default='[]'),
        sa.Column('service_preferences', postgresql.JSON, server_default='{}'),
        sa.Column('typical_risk_tolerance', sa.String(20), server_default='medium'),
        sa.Column('decision_speed', sa.String(20), server_default='moderate'),
        sa.Column('content_themes', postgresql.JSON, server_default='[]'),
        sa.Column('success_metrics', postgresql.JSON, server_default='[]'),
        sa.Column('preferred_quest_types', postgresql.JSON, server_default='[]'),
        sa.Column('achievement_priorities', postgresql.JSON, server_default='[]'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('version', sa.Integer, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Create route_builders table
    op.create_table(
        'route_builders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('archetype', sa.String(50), nullable=True),
        sa.Column('target_outcome', sa.String(300), nullable=False),
        sa.Column('target_location', sa.String(200), nullable=False),
        sa.Column('target_organization', sa.String(300), nullable=True),
        sa.Column('current_situation', postgresql.JSON, server_default='{}'),
        sa.Column('timeline_months', sa.Integer, server_default='12'),
        sa.Column('budget_usd', sa.Integer, server_default='0'),
        sa.Column('visa_requirements', postgresql.JSON, server_default='[]'),
        sa.Column('language_requirements', postgresql.JSON, server_default='[]'),
        sa.Column('route_config', postgresql.JSON, server_default='{}'),
        sa.Column('job_description', sa.Text, nullable=True),
        sa.Column('ats_analysis', postgresql.JSON, nullable=True),
        sa.Column('personalization', postgresql.JSON, server_default='{}'),
        sa.Column('status', sa.String(20), server_default='draft'),
        sa.Column('completion_percentage', sa.Integer, server_default='0'),
        sa.Column('current_milestone_index', sa.Integer, server_default='0'),
        sa.Column('name', sa.String(300), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('tags', postgresql.JSON, server_default='[]'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_route_builders_user_id', 'route_builders', ['user_id'])
    op.create_index('ix_route_builders_category', 'route_builders', ['category'])
    
    # Create dynamic_milestones table
    op.create_table(
        'dynamic_milestones',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('route_builder_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('route_builders.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(300), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('display_order', sa.Integer, nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('tasks', postgresql.JSON, server_default='[]'),
        sa.Column('status', sa.String(20), server_default='locked'),
        sa.Column('completion_percentage', sa.Integer, server_default='0'),
        sa.Column('archetype_message', sa.Text, nullable=True),
        sa.Column('companion_encouragement', sa.Text, nullable=True),
        sa.Column('ats_integration', sa.Boolean, server_default='false'),
        sa.Column('ats_target_score', sa.Integer, nullable=True),
        sa.Column('xp_reward', sa.Integer, server_default='0'),
        sa.Column('companion_evolution_trigger', postgresql.JSON, nullable=True),
        sa.Column('evidence_required', postgresql.JSON, server_default='[]'),
        sa.Column('evidence_submitted', postgresql.JSON, server_default='[]'),
        sa.Column('estimated_days', sa.Integer, server_default='7'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_dynamic_milestones_route_builder_id', 'dynamic_milestones', ['route_builder_id'])
    
    # Create companions table (new UUID-based version)
    op.create_table(
        'companions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('archetype', sa.String(50), nullable=False),
        sa.Column('archetype_config_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('archetype_configs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('personality_type', sa.String(50), server_default='supportive_guide'),
        sa.Column('communication_style', sa.String(50), server_default='supportive'),
        sa.Column('evolution_stage', sa.Integer, server_default='1'),
        sa.Column('evolution_path', sa.String(200), nullable=False),
        sa.Column('current_form', sa.String(50), server_default='egg'),
        sa.Column('level', sa.Integer, server_default='1'),
        sa.Column('xp', sa.Integer, server_default='0'),
        sa.Column('xp_to_next_level', sa.Integer, server_default='500'),
        sa.Column('happiness', sa.Integer, server_default='100'),
        sa.Column('energy', sa.Integer, server_default='100'),
        sa.Column('health', sa.Integer, server_default='100'),
        sa.Column('mood', sa.String(20), server_default='neutral'),
        sa.Column('abilities', postgresql.JSON, server_default='[]'),
        sa.Column('active_route_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('routes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('route_progress_percentage', sa.Integer, server_default='0'),
        sa.Column('last_interaction', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('interaction_count', sa.Integer, server_default='0'),
        sa.Column('messages_sent', sa.Integer, server_default='0'),
        sa.Column('last_fed', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_played', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('archetype_state', postgresql.JSON, server_default='{}'),
        sa.Column('visual_theme', sa.String(50), server_default='default'),
        sa.Column('accessories', postgresql.JSON, server_default='[]'),
        sa.Column('stats', postgresql.JSON, server_default='{}'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_companions_user_id', 'companions', ['user_id'])
    
    # Create companion_activities table
    op.create_table(
        'companion_activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('companion_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('activity_type', sa.String(20), nullable=False),
        sa.Column('description', sa.String(300), nullable=True),
        sa.Column('xp_reward', sa.Integer, server_default='0'),
        sa.Column('happiness_change', sa.Integer, server_default='0'),
        sa.Column('energy_change', sa.Integer, server_default='0'),
        sa.Column('related_route_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('routes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('related_milestone_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('route_milestones.id', ondelete='SET NULL'), nullable=True),
        sa.Column('activity_data', postgresql.JSON, server_default='{}'),
        sa.Column('completed_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_companion_activities_companion_id', 'companion_activities', ['companion_id'])
    
    # Create companion_evolutions table
    op.create_table(
        'companion_evolutions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('companion_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('from_stage', sa.Integer, nullable=False),
        sa.Column('to_stage', sa.Integer, nullable=False),
        sa.Column('from_form', sa.String(50), nullable=False),
        sa.Column('to_form', sa.String(50), nullable=False),
        sa.Column('evolution_trigger', sa.String(100), nullable=False),
        sa.Column('trigger_details', postgresql.JSON, server_default='{}'),
        sa.Column('level_at_evolution', sa.Integer, nullable=False),
        sa.Column('xp_at_evolution', sa.Integer, nullable=False),
        sa.Column('stats_before', postgresql.JSON, server_default='{}'),
        sa.Column('stats_after', postgresql.JSON, server_default='{}'),
        sa.Column('abilities_unlocked', postgresql.JSON, server_default='[]'),
        sa.Column('evolved_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_companion_evolutions_companion_id', 'companion_evolutions', ['companion_id'])
    
    # Create companion_messages table
    op.create_table(
        'companion_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('companion_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('companions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('message_type', sa.String(50), nullable=False),
        sa.Column('message_text', sa.Text, nullable=False),
        sa.Column('related_route_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('routes.id', ondelete='SET NULL'), nullable=True),
        sa.Column('related_milestone_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('route_milestones.id', ondelete='SET NULL'), nullable=True),
        sa.Column('archetype_tone', sa.String(50), nullable=False),
        sa.Column('is_read', sa.Boolean, server_default='false'),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('user_reaction', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_companion_messages_companion_id', 'companion_messages', ['companion_id'])


def downgrade() -> None:
    op.drop_table('companion_messages')
    op.drop_table('companion_evolutions')
    op.drop_table('companion_activities')
    op.drop_table('companions')
    op.drop_table('dynamic_milestones')
    op.drop_table('route_builders')
    op.drop_table('archetype_configs')
