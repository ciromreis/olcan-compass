"""fix_quest_enum_values

Revision ID: 2750cc7930ac
Revises: 2d95e2da9643
Create Date: 2026-04-14 21:07:13.624635

Fix quest enum values to match the model definitions.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '2750cc7930ac'
down_revision: Union[str, None] = '2d95e2da9643'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop and recreate the enum types with correct values
    op.execute('DROP TYPE IF EXISTS questtype CASCADE')
    op.execute('DROP TYPE IF EXISTS questcategory CASCADE')
    
    # Create enum types with correct values matching the model
    quest_type_enum = postgresql.ENUM(
        'daily', 'weekly', 'monthly', 'special', 'event',
        name='questtype',
        create_type=False
    )
    quest_type_enum.create(op.get_bind(), checkfirst=True)
    
    quest_category_enum = postgresql.ENUM(
        'progression', 'consistency', 'category_specific', 'special',
        name='questcategory', 
        create_type=False
    )
    quest_category_enum.create(op.get_bind(), checkfirst=True)
    
    # Recreate the quest_templates table with correct enum types
    op.drop_table('quest_templates')
    
    op.create_table(
        'quest_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('name_en', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=10), nullable=False),
        sa.Column('quest_type', quest_type_enum, nullable=False, server_default='daily'),
        sa.Column('category', quest_category_enum, nullable=False, server_default='progression'),
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
    
    # Recreate with old enum values
    op.execute('DROP TYPE IF EXISTS questcategory')
    op.execute('DROP TYPE IF EXISTS questtype')
    
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
