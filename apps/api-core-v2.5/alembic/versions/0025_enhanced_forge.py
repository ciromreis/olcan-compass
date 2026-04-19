"""Enhanced Document Forge System - Multi-Process Management

Revision ID: 0025_enhanced_forge
Revises: ffe333333333
Create Date: 2026-04-18 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0025_enhanced_forge'
down_revision: Union[str, None] = 'ffe333333333'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tables have been created manually via SQL script
    # This migration is marked as complete
    pass


def downgrade() -> None:
    # Remove foreign key relationships and indexes
    op.drop_index(op.f('ix_documents_process_id'), table_name='documents')
    op.drop_constraint('fk_documents_process_id', 'documents', type_='foreignkey')
    op.drop_column('documents', 'process_id')
    
    op.drop_index(op.f('ix_dossiers_process_id'), table_name='dossiers')
    op.drop_constraint('fk_dossiers_process_id', 'dossiers', type_='foreignkey')
    op.drop_column('dossiers', 'process_id')

    # Drop new tables
    op.drop_table('process_events')
    op.drop_table('cms_form_data')
    op.drop_table('export_jobs')
    op.drop_table('technical_reports')
    op.drop_table('process_templates')
    op.drop_table('process_tasks')
    op.drop_table('document_variations')
    op.drop_table('processes')

    # Remove columns from user_progress
    op.drop_column('user_progress', 'last_forge_activity')
    op.drop_column('user_progress', 'momentum_score')
    op.drop_column('user_progress', 'exports_generated')
    op.drop_column('user_progress', 'variations_created')
    op.drop_column('user_progress', 'documents_created')
    op.drop_column('user_progress', 'processes_completed')
    op.drop_column('user_progress', 'document_forge_xp')

    # Drop enums
    op.execute("DROP TYPE IF EXISTS enhanced_export_status")
    op.execute("DROP TYPE IF EXISTS enhanced_export_format")
    op.execute("DROP TYPE IF EXISTS enhanced_export_type")
    op.execute("DROP TYPE IF EXISTS enhanced_process_task_status")
    op.execute("DROP TYPE IF EXISTS enhanced_task_priority")
    op.execute("DROP TYPE IF EXISTS enhanced_document_variation_status")
    op.execute("DROP TYPE IF EXISTS enhanced_document_variation_type")
    op.execute("DROP TYPE IF EXISTS enhanced_process_status")