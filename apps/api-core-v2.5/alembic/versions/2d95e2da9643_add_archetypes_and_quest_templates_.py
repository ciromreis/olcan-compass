"""add_archetypes_and_quest_templates_tables

Revision ID: 2d95e2da9643
Revises: d299cf0b84a7
Create Date: 2026-04-14 21:04:05.983638

Creates the missing archetypes and quest_templates tables needed for seeding.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '2d95e2da9643'
down_revision: Union[str, None] = 'd299cf0b84a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types for quest system
    quest_type_enum = postgresql.ENUM(
        'DAILY', 'WEEKLY', 'MONTHLY', 'ONE_TIME', 'RECURRING',
        name='questtype',
        create_type=False
    )
    quest_type_enum.create(op.get_bind(), checkfirst=True)
    
    quest_category_enum = postgresql.ENUM(
        'PROGRESSION', 'CONSISTENCY', 'CATEGORY_SPECIFIC', 'SPECIAL',
        name='questcategory', 
        create_type=False
    )
    quest_category_enum.create(op.get_bind(), checkfirst=True)
    
    # Create archetypes table
    op.create_table(
        'archetypes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('motivator', sa.String(length=50), nullable=False),
        sa.Column('companion_type', sa.String(length=50), nullable=False),
        sa.Column('base_abilities', sa.JSON(), nullable=True),
        sa.Column('evolution_path', sa.JSON(), nullable=True),
        sa.Column('base_stats', sa.JSON(), nullable=True),
        sa.Column('color_scheme', sa.JSON(), nullable=True),
        sa.Column('visual_description', sa.String(length=255), nullable=True),
        sa.Column('companion_description', sa.String(length=500), nullable=False),
        sa.Column('is_active', sa.String(length=10), nullable=False, server_default='True'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_archetypes_id'), 'archetypes', ['id'], unique=False)
    op.create_index(op.f('ix_archetypes_name'), 'archetypes', ['name'], unique=True)
    
    # Create quest_templates table
    op.create_table(
        'quest_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('name_en', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=10), nullable=False),
        sa.Column('quest_type', quest_type_enum, nullable=False, server_default='DAILY'),
        sa.Column('category', quest_category_enum, nullable=False, server_default='PROGRESSION'),
        sa.Column('requirement_type', sa.String(length=50), nullable=False),
        sa.Column('requirement_target', sa.Integer(), nullable=False),
        sa.Column('requirement_metadata', sa.JSON(), nullable=True),
        sa.Column('xp_reward', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('coin_reward', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('item_reward_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('duration_hours', sa.Integer(), nullable=True),
        sa.Column('cooldown_hours', sa.Integer(), nullable=True),
        sa.Column('max_completions', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('difficulty', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quest_templates_quest_type'), 'quest_templates', ['quest_type'], unique=False)
    op.create_index(op.f('ix_quest_templates_is_active'), 'quest_templates', ['is_active'], unique=False)


def downgrade() -> None:
    # Drop tables
    op.drop_index(op.f('ix_quest_templates_is_active'), table_name='quest_templates')
    op.drop_index(op.f('ix_quest_templates_quest_type'), table_name='quest_templates')
    op.drop_table('quest_templates')
    
    op.drop_index(op.f('ix_archetypes_name'), table_name='archetypes')
    op.drop_index(op.f('ix_archetypes_id'), table_name='archetypes')
    op.drop_table('archetypes')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS questcategory')
    op.execute('DROP TYPE IF EXISTS questtype')
