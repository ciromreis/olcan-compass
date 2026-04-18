"""Add task management tables

Revision ID: 0020_task_management
Revises: 0019_crm_identity_links
Create Date: 2026-04-13 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0020_task_management'
down_revision: Union[str, None] = '0019_crm_identity_links'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums will be created automatically by SQLAlchemy when creating tables
    
    # Create tasks table
    op.create_table('tasks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('route_id', sa.UUID(), nullable=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.Enum('DOCUMENTATION', 'LANGUAGE', 'FINANCE', 'HOUSING', 'NETWORKING', 'INTERVIEW', 'VISA', 'CULTURAL_PREP', 'HEALTH', 'EDUCATION', 'EMPLOYMENT', 'CUSTOM', name='taskcategory'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED', name='taskstatus'), nullable=False),
        sa.Column('priority', sa.Enum('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', name='taskpriority'), nullable=False),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('estimated_hours', sa.Integer(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('xp_reward', sa.Integer(), nullable=False),
        sa.Column('level_requirement', sa.Integer(), nullable=True),
        sa.Column('streak_count', sa.Integer(), nullable=False),
        sa.Column('completion_count', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'], unique=False)
    op.create_index('ix_tasks_route_id', 'tasks', ['route_id'], unique=False)
    op.create_index('ix_tasks_status', 'tasks', ['status'], unique=False)
    op.create_index('ix_tasks_category', 'tasks', ['category'], unique=False)
    op.create_index('ix_tasks_priority', 'tasks', ['priority'], unique=False)
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'], unique=False)

    # Create subtasks table
    op.create_table('subtasks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('task_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_subtasks_task_id', 'subtasks', ['task_id'], unique=False)

    # Create user_progress table
    op.create_table('user_progress',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('total_xp', sa.Integer(), nullable=False),
        sa.Column('current_level', sa.Integer(), nullable=False),
        sa.Column('streak_current', sa.Integer(), nullable=False),
        sa.Column('streak_best', sa.Integer(), nullable=False),
        sa.Column('last_activity_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('tasks_completed_today', sa.Integer(), nullable=False),
        sa.Column('tasks_completed_total', sa.Integer(), nullable=False),
        sa.Column('tasks_completed_this_week', sa.Integer(), nullable=False),
        sa.Column('tasks_completed_this_month', sa.Integer(), nullable=False),
        sa.Column('time_spent_minutes', sa.Integer(), nullable=False),
        sa.Column('longest_task_streak', sa.Integer(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_user_progress_user_id', 'user_progress', ['user_id'], unique=True)

    # Create achievements table
    op.create_table('achievements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('name_en', sa.String(100), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(10), nullable=False),
        sa.Column('xp_bonus', sa.Integer(), nullable=False),
        sa.Column('unlock_condition', sa.JSON(), nullable=False),
        sa.Column('category', sa.Enum('FIRST_STEPS', 'CONSISTENCY', 'MASTERY', 'SOCIAL', 'SPEED', 'SPECIAL', name='achievementcategory'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_achievements_category', 'achievements', ['category'], unique=False)
    op.create_index('ix_achievements_is_active', 'achievements', ['is_active'], unique=False)

    # Create user_achievements table
    op.create_table('user_achievements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('achievement_id', sa.UUID(), nullable=False),
        sa.Column('unlocked_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('progress', sa.Integer(), nullable=False),
        sa.Column('claimed', sa.Boolean(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_user_achievements_user_id', 'user_achievements', ['user_id'], unique=False)
    op.create_index('ix_user_achievements_unlocked_at', 'user_achievements', ['unlocked_at'], unique=False)


def downgrade() -> None:
    op.drop_table('user_achievements')
    op.drop_table('achievements')
    op.drop_table('user_progress')
    op.drop_table('subtasks')
    op.drop_table('tasks')
    
    # Drop enums
    op.execute("DROP TYPE achievementcategory")
    op.execute("DROP TYPE taskcategory")
    op.execute("DROP TYPE taskpriority")
    op.execute("DROP TYPE taskstatus")
