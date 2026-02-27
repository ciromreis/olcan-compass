"""economics extensions

Revision ID: 0012
Revises: 0011
Create Date: 2026-02-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0012'
down_revision = '0011'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Extend user_psych_profiles table
    op.add_column('user_psych_profiles', sa.Column('temporal_preference', sa.Float, nullable=True))
    op.add_column('user_psych_profiles', sa.Column('temporal_preference_updated_at', sa.DateTime(timezone=True), nullable=True))
    op.create_index('ix_user_psych_profiles_temporal_preference', 'user_psych_profiles', ['temporal_preference'])

    # Extend users table
    op.add_column('users', sa.Column('momentum_score', sa.Integer, default=0, nullable=False, server_default='0'))
    op.add_column('users', sa.Column('last_momentum_check', sa.DateTime(timezone=True), nullable=True))
    op.create_index('ix_users_momentum_score', 'users', ['momentum_score'])

    # Extend opportunities table
    op.add_column('opportunities', sa.Column('opportunity_cost_daily', sa.Numeric(10, 2), nullable=True))
    op.add_column('opportunities', sa.Column('target_salary', sa.Numeric(12, 2), nullable=True))
    op.add_column('opportunities', sa.Column('competitiveness_score', sa.Float, nullable=True))
    op.add_column('opportunities', sa.Column('resource_requirements_score', sa.Float, nullable=True))
    op.create_index('ix_opportunities_opportunity_cost', 'opportunities', ['opportunity_cost_daily'])
    op.create_index('ix_opportunities_competitiveness', 'opportunities', ['competitiveness_score'])

    # Extend route_templates table
    op.add_column('route_templates', sa.Column('recommended_temporal_range_min', sa.Float, nullable=True))
    op.add_column('route_templates', sa.Column('recommended_temporal_range_max', sa.Float, nullable=True))
    op.create_index('ix_route_templates_temporal_range', 'route_templates', ['recommended_temporal_range_min', 'recommended_temporal_range_max'])

    # Extend service_listings table
    op.add_column('service_listings', sa.Column('performance_bound', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('service_listings', sa.Column('performance_success_rate', sa.Float, nullable=True))
    op.create_index('ix_service_listings_performance_bound', 'service_listings', ['performance_bound'], postgresql_using='gin')


def downgrade() -> None:
    # Remove service_listings extensions
    op.drop_index('ix_service_listings_performance_bound', table_name='service_listings')
    op.drop_column('service_listings', 'performance_success_rate')
    op.drop_column('service_listings', 'performance_bound')

    # Remove route_templates extensions
    op.drop_index('ix_route_templates_temporal_range', table_name='route_templates')
    op.drop_column('route_templates', 'recommended_temporal_range_max')
    op.drop_column('route_templates', 'recommended_temporal_range_min')

    # Remove opportunities extensions
    op.drop_index('ix_opportunities_competitiveness', table_name='opportunities')
    op.drop_index('ix_opportunities_opportunity_cost', table_name='opportunities')
    op.drop_column('opportunities', 'resource_requirements_score')
    op.drop_column('opportunities', 'competitiveness_score')
    op.drop_column('opportunities', 'target_salary')
    op.drop_column('opportunities', 'opportunity_cost_daily')

    # Remove users extensions
    op.drop_index('ix_users_momentum_score', table_name='users')
    op.drop_column('users', 'last_momentum_check')
    op.drop_column('users', 'momentum_score')

    # Remove user_psych_profiles extensions
    op.drop_index('ix_user_psych_profiles_temporal_preference', table_name='user_psych_profiles')
    op.drop_column('user_psych_profiles', 'temporal_preference_updated_at')
    op.drop_column('user_psych_profiles', 'temporal_preference')
