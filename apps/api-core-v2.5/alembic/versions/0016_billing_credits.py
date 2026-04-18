"""add forge credits and usage log

Revision ID: 0016_billing_credits
Revises: 0015_social_community
Create Date: 2026-04-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0016_billing_credits'
down_revision = '0015_social_community'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add forge_credits to users (3 free credits on signup)
    op.add_column(
        'users',
        sa.Column('forge_credits', sa.Integer(), nullable=False, server_default='3')
    )

    # Forge usage log — one row per AI polish call
    op.create_table(
        'forge_usage_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('narrative_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('narratives.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('credits_used', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('ai_provider', sa.String(50), nullable=False, server_default='simulation'),
        sa.Column('methodology', sa.String(20), nullable=True),  # STAR, CAR, free
        sa.Column('input_word_count', sa.Integer(), nullable=True),
        sa.Column('output_word_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_forge_usage_user_created', 'forge_usage_log', ['user_id', 'created_at'])

    # Stripe checkout sessions — tracks credit purchase flow
    op.create_table(
        'credit_purchases',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('stripe_session_id', sa.String(200), nullable=False, unique=True, index=True),
        sa.Column('credits_purchased', sa.Integer(), nullable=False),
        sa.Column('amount_brl', sa.Numeric(10, 2), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),  # pending, paid, expired
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('credit_purchases')
    op.drop_table('forge_usage_log')
    op.drop_column('users', 'forge_credits')
