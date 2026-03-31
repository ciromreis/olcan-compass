"""add_verification_and_reset_fields

Revision ID: 0004_verification
Revises: 0003_routes
Create Date: 2026-02-22

"""

from alembic import op
import sqlalchemy as sa


revision = "0004_verification"
down_revision = "0003_routes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add email verification fields
    op.add_column("users", sa.Column("verification_token", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("verification_token_expires", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))
    
    # Add password reset fields
    op.add_column("users", sa.Column("password_reset_token", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("password_reset_token_expires", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("password_reset_count", sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column("users", "password_reset_count")
    op.drop_column("users", "password_reset_token_expires")
    op.drop_column("users", "password_reset_token")
    op.drop_column("users", "verified_at")
    op.drop_column("users", "verification_token_expires")
    op.drop_column("users", "verification_token")
