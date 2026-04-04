"""init

Revision ID: 0001_init
Revises: 
Create Date: 2026-02-21

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum type for user roles
    user_role_enum = postgresql.ENUM(
        'user', 'provider', 'org_member', 'org_coordinator', 'org_admin', 'super_admin',
        name='userrole',
        create_type=False
    )
    user_role_enum.create(op.get_bind(), checkfirst=True)
    
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        
        # Status
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("role", user_role_enum, nullable=False, server_default='user'),
        
        # Profile fields
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("language", sa.String(length=10), nullable=False, server_default='en'),
        sa.Column("timezone", sa.String(length=50), nullable=False, server_default='UTC'),
        
        # Security
        sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        
        # Timestamps
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
    )
    
    # Create indexes
    op.create_index(op.f('ix_users_email'), 'users', ['email'])
    op.create_index(op.f('ix_users_role'), 'users', ['role'])


def downgrade() -> None:
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table("users")
    
    # Drop enum
    op.execute("DROP TYPE IF EXISTS userrole")
