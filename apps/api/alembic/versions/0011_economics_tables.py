"""economics tables

Revision ID: 0011
Revises: 0010
Create Date: 2026-02-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '0011'
down_revision = '0010_marketplace'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create verification_credentials table
    op.create_table(
        'verification_credentials',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('credential_type', sa.String(50), nullable=False),  # readiness, expertise, achievement
        sa.Column('credential_name', sa.String(200), nullable=False),
        sa.Column('verification_hash', sa.String(64), nullable=False, unique=True, index=True),  # SHA-256 hash
        sa.Column('verification_url', sa.String(500), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revocation_reason', sa.Text, nullable=True),
        sa.Column('credential_metadata', postgresql.JSON, default=dict, nullable=False),  # Score, level, etc.
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_verification_credentials_user_id_active', 'verification_credentials', ['user_id', 'is_active'])
    op.create_index('ix_verification_credentials_type', 'verification_credentials', ['credential_type'])

    # Create escrow_transactions table
    op.create_table(
        'escrow_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False, unique=True, index=True),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('provider_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('provider_profiles.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='USD', nullable=False),
        sa.Column('status', sa.String(20), nullable=False, index=True),  # pending, held, released, refunded, disputed
        sa.Column('stripe_payment_intent_id', sa.String(200), nullable=True),
        sa.Column('stripe_transfer_id', sa.String(200), nullable=True),
        sa.Column('performance_bound', postgresql.JSON, nullable=False),  # Release conditions
        sa.Column('readiness_before', sa.Float, nullable=True),
        sa.Column('readiness_after', sa.Float, nullable=True),
        sa.Column('improvement_achieved', sa.Float, nullable=True),
        sa.Column('release_condition_met', sa.Boolean, nullable=True),
        sa.Column('held_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('released_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('refunded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('dispute_reason', sa.Text, nullable=True),
        sa.Column('resolution_notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    # Remove explicit index creation because column is defined with index=True

    # Create scenario_simulations table
    op.create_table(
        'scenario_simulations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('simulation_name', sa.String(200), nullable=True),
        sa.Column('constraints', postgresql.JSON, nullable=False),  # Budget, time, skills, etc.
        sa.Column('opportunity_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=False),
        sa.Column('pareto_optimal_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=False),
        sa.Column('selected_opportunity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('decision_quality_score', sa.Float, nullable=True),
        sa.Column('decision_rationale', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_scenario_simulations_user_id_created', 'scenario_simulations', ['user_id', 'created_at'])

    # Create credential_usage_tracking table
    op.create_table(
        'credential_usage_tracking',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('credential_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('verification_credentials.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('event_type', sa.String(50), nullable=False),  # verification_click, application_attached
        sa.Column('application_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('user_applications.id', ondelete='SET NULL'), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),  # IPv6 support
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('event_metadata', postgresql.JSON, default=dict, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    # index created implicitly by index=True for credential_id
    op.create_index('ix_credential_usage_tracking_event_type', 'credential_usage_tracking', ['event_type'])

    # Create opportunity_cost_widget_events table
    op.create_table(
        'opportunity_cost_widget_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('event_type', sa.String(50), nullable=False),  # impression, click, conversion, dismiss
        sa.Column('opportunity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('opportunities.id', ondelete='SET NULL'), nullable=True),
        sa.Column('opportunity_cost_shown', sa.Numeric(10, 2), nullable=True),
        sa.Column('momentum_score', sa.Integer, nullable=True),
        sa.Column('days_since_last_milestone', sa.Integer, nullable=True),
        sa.Column('conversion_type', sa.String(50), nullable=True),  # upgrade_pro, upgrade_premium, milestone_completed
        sa.Column('event_metadata', postgresql.JSON, default=dict, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    # index created implicitly by index=True for user_id
    op.create_index('ix_opportunity_cost_widget_events_event_type', 'opportunity_cost_widget_events', ['event_type'])
    op.create_index('ix_opportunity_cost_widget_events_created_at', 'opportunity_cost_widget_events', ['created_at'])


def downgrade() -> None:
    op.drop_table('opportunity_cost_widget_events')
    op.drop_table('credential_usage_tracking')
    op.drop_table('scenario_simulations')
    op.drop_table('escrow_transactions')
    op.drop_table('verification_credentials')
