"""manual oios gamification logic

Revision ID: 91e881fee226
Revises: 0013_organizations
Create Date: 2026-03-24 05:15:26.611244

Fills the OIOS Archetype and Fear Cluster enums, and adds gamification
columns to user_psych_profiles. All new columns are nullable (additive
migration — zero disruption to V2 production data).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '91e881fee226'
down_revision: Union[str, None] = '0013_organizations'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ── OIOS 12 Archetypes ────────────────────────────────────────
OIOS_ARCHETYPE_VALUES = [
    'institutional_escapee',   # Freedom / Autonomy
    'scholarship_cartographer', # Success / Status
    'career_pivot',             # Growth / Mastery
    'global_nomad',             # Adventure / Experience
    'technical_bridge_builder', # Stability / Security
    'insecure_corporate_dev',   # Safety / Validation
    'exhausted_solo_mother',    # Security / Future
    'trapped_public_servant',   # Purpose / Impact
    'academic_hermit',          # Knowledge / Truth
    'executive_refugee',        # Peace / Balance
    'creative_visionary',       # Self-Expression
    'lifestyle_optimizer',      # Efficiency / Quality
]

# ── Fear Clusters (4 primary motivational axes) ───────────────
FEAR_CLUSTER_VALUES = [
    'freedom',      # Fear of constraints / loss of autonomy
    'success',      # Fear of failure / inadequacy
    'stability',    # Fear of uncertainty / loss of security
    'validation',   # Fear of rejection / competence doubt
]

oiosarchetype = postgresql.ENUM(
    *OIOS_ARCHETYPE_VALUES,
    name='oiosarchetype',
    create_type=False,
)

fearcluster = postgresql.ENUM(
    *FEAR_CLUSTER_VALUES,
    name='fearcluster',
    create_type=False,
)


def upgrade() -> None:
    # Create enum types first
    oiosarchetype_type = postgresql.ENUM(*OIOS_ARCHETYPE_VALUES, name='oiosarchetype')
    oiosarchetype_type.create(op.get_bind(), checkfirst=True)

    fearcluster_type = postgresql.ENUM(*FEAR_CLUSTER_VALUES, name='fearcluster')
    fearcluster_type.create(op.get_bind(), checkfirst=True)

    # Add gamification columns — all nullable (additive migration)
    op.add_column(
        'user_psych_profiles',
        sa.Column('dominant_archetype', oiosarchetype, nullable=True, comment='Primary OIOS archetype identified from diagnostic'),
    )
    op.add_column(
        'user_psych_profiles',
        sa.Column('primary_fear_cluster', fearcluster, nullable=True, comment='Dominant motivational fear axis'),
    )
    op.add_column(
        'user_psych_profiles',
        sa.Column('evolution_stage', sa.Integer(), nullable=True, server_default='1', comment='Gamification stage: 1=Rookie, 2=Champion, 3=Mega'),
    )
    op.add_column(
        'user_psych_profiles',
        sa.Column('kinetic_energy_level', sa.Float(), nullable=True, server_default='0.0', comment='Accumulated momentum score driving digievolution'),
    )


def downgrade() -> None:
    op.drop_column('user_psych_profiles', 'kinetic_energy_level')
    op.drop_column('user_psych_profiles', 'evolution_stage')
    op.drop_column('user_psych_profiles', 'primary_fear_cluster')
    op.drop_column('user_psych_profiles', 'dominant_archetype')

    op.execute('DROP TYPE IF EXISTS oiosarchetype')
    op.execute('DROP TYPE IF EXISTS fearcluster')

