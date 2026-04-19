"""Add dossier system and documents tables

Revision ID: ffe333333333
Revises: d27e8b370665
Create Date: 2026-04-18 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'ffe333333333'
down_revision: Union[str, None] = 'd27e8b370665'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Documents table (needed by DossierDocument)
    # Check if table exists first to be safe, though alembic should handle it
    op.create_table('documents',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('document_type', sa.Enum('essay', 'cover_letter', 'personal_statement', 'motivation_letter', 'resume', 'other', name='documenttype'), nullable=False),
        sa.Column('status', sa.Enum('draft', 'in_progress', 'polished', 'final', 'submitted', name='documentstatus'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('content_html', sa.Text(), nullable=True),
        sa.Column('current_character_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_word_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('route_id', sa.Uuid(), nullable=True),
        sa.Column('scope', sa.String(length=20), nullable=False, server_default='universal'),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_user_id'), 'documents', ['user_id'], unique=False)

    # 2. Create Dossiers table
    op.create_table('dossiers',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('draft', 'active', 'finalizing', 'completed', 'archived', name='dossierstatus'), nullable=False, server_default='draft'),
        sa.Column('opportunity_id', sa.Uuid(), nullable=True),
        sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('profile_snapshot', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('opportunity_context', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('readiness_evaluation', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('target_readiness', sa.Float(), nullable=False, server_default='90.0'),
        sa.Column('current_readiness', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('is_favorite', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dossiers_user_id'), 'dossiers', ['user_id'], unique=False)

    # 3. Create Dossier Documents table
    op.create_table('dossier_documents',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('dossier_id', sa.Uuid(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('empty', 'draft', 'review', 'polished', 'final', name='dossierdocumentstatus'), nullable=False, server_default='empty'),
        sa.Column('completion_percentage', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('word_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('metrics', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('ats_score', sa.Float(), nullable=True),
        sa.Column('original_document_id', sa.Uuid(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['original_document_id'], ['documents.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dossier_documents_dossier_id'), 'dossier_documents', ['dossier_id'], unique=False)

    # 4. Create Dossier Tasks table
    op.create_table('dossier_tasks',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('dossier_id', sa.Uuid(), nullable=False),
        sa.Column('document_id', sa.Uuid(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False, server_default='generic'),
        sa.Column('status', sa.Enum('todo', 'in_progress', 'done', 'blocked', name='dossiertaskstatus'), nullable=False, server_default='todo'),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['document_id'], ['dossier_documents.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dossier_tasks_dossier_id'), 'dossier_tasks', ['dossier_id'], unique=False)


def downgrade() -> None:
    op.drop_table('dossier_tasks')
    op.drop_table('dossier_documents')
    op.drop_table('dossiers')
    op.drop_table('documents')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS dossierstatus")
    op.execute("DROP TYPE IF EXISTS dossierdocumentstatus")
    op.execute("DROP TYPE IF EXISTS dossiertaskstatus")
    op.execute("DROP TYPE IF EXISTS documenttype")
    op.execute("DROP TYPE IF EXISTS documentstatus")
