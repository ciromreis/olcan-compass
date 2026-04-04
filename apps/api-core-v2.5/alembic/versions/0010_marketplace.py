"""add_marketplace_tables

Revision ID: 0010_marketplace
Revises: 0009_prompts
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from decimal import Decimal

revision = "0010_marketplace"
down_revision = "0009_prompts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # provider_profiles table
    op.create_table(
        "provider_profiles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("headline", sa.String(length=200), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("current_title", sa.String(length=200), nullable=True),
        sa.Column("current_organization", sa.String(length=200), nullable=True),
        sa.Column("years_experience", sa.Integer(), nullable=True),
        sa.Column("education", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("specializations", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("target_regions", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("target_institutions", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("languages_spoken", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("status", sa.Enum("pending", "under_review", "approved", "rejected", "suspended", "inactive", name="providerstatus"), nullable=False, server_default='pending'),
        sa.Column("total_bookings", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("completed_bookings", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("rating_average", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("review_count", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("response_rate", sa.Float(), nullable=False, server_default='0.0'),
        sa.Column("response_time_hours", sa.Float(), nullable=True),
        sa.Column("timezone", sa.String(length=50), nullable=True),
        sa.Column("typical_response_time", sa.String(length=50), nullable=True),
        sa.Column("profile_video_url", sa.String(length=500), nullable=True),
        sa.Column("portfolio_links", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("application_answers", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("reviewed_by_id", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], name=op.f("fk_provider_profiles_reviewed_by_id_users"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_provider_profiles_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_provider_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_provider_profiles_user_id"))
    )
    op.create_index(op.f("ix_provider_profiles_status"), "provider_profiles", ["status"], unique=False)
    op.create_index(op.f("ix_provider_profiles_user_id"), "provider_profiles", ["user_id"], unique=True)

    # provider_credentials table
    op.create_table(
        "provider_credentials",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("provider_id", sa.UUID(), nullable=False),
        sa.Column("credential_type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("issuing_organization", sa.String(length=200), nullable=True),
        sa.Column("issue_date", sa.Date(), nullable=True),
        sa.Column("expiry_date", sa.Date(), nullable=True),
        sa.Column("document_url", sa.String(length=500), nullable=True),
        sa.Column("verification_status", sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column("verified_by_id", sa.UUID(), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verification_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["provider_id"], ["provider_profiles.id"], name=op.f("fk_provider_credentials_provider_id_provider_profiles"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["verified_by_id"], ["users.id"], name=op.f("fk_provider_credentials_verified_by_id_users"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_provider_credentials"))
    )
    op.create_index(op.f("ix_provider_credentials_provider_id"), "provider_credentials", ["provider_id"], unique=False)

    # service_listings table
    op.create_table(
        "service_listings",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("provider_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("service_type", sa.Enum("mentoring", "essay_review", "interview_prep", "cv_review", "sop_review", "research_proposal", "application_strategy", "language_coaching", "financial_planning", "visa_guidance", name="servicetype"), nullable=False),
        sa.Column("delivery_method", sa.Enum("video_call", "audio_call", "chat", "document_review", "in_person", name="servicedeliverymethod"), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("pricing_type", sa.Enum("fixed", "hourly", "per_word", "package", name="pricingtype"), nullable=False, server_default='fixed'),
        sa.Column("price_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("price_currency", sa.String(length=3), nullable=False, server_default='USD'),
        sa.Column("min_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("max_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("price_per_unit", sa.Numeric(10, 2), nullable=True),
        sa.Column("includes", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("excludes", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("prerequisites", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("deliverables", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("advance_booking_days", sa.Integer(), nullable=False, server_default='2'),
        sa.Column("max_bookings_per_day", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("total_bookings", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("total_revenue", sa.Numeric(12, 2), nullable=False, server_default='0'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["provider_id"], ["provider_profiles.id"], name=op.f("fk_service_listings_provider_id_provider_profiles"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_service_listings"))
    )
    op.create_index(op.f("ix_service_listings_provider_id"), "service_listings", ["provider_id"], unique=False)
    op.create_index(op.f("ix_service_listings_service_type"), "service_listings", ["service_type"], unique=False)

    # service_availability table
    op.create_table(
        "service_availability",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("provider_id", sa.UUID(), nullable=False),
        sa.Column("service_id", sa.UUID(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("is_recurring", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("booking_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["provider_id"], ["provider_profiles.id"], name=op.f("fk_service_availability_provider_id_provider_profiles"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["service_listings.id"], name=op.f("fk_service_availability_service_id_service_listings"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_service_availability"))
    )
    op.create_index(op.f("ix_service_availability_date"), "service_availability", ["date"], unique=False)
    op.create_index(op.f("ix_service_availability_provider_id"), "service_availability", ["provider_id"], unique=False)
    op.create_index(op.f("ix_service_availability_service_id"), "service_availability", ["service_id"], unique=False)

    # bookings table
    op.create_table(
        "bookings",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("client_id", sa.UUID(), nullable=False),
        sa.Column("provider_id", sa.UUID(), nullable=False),
        sa.Column("service_id", sa.UUID(), nullable=False),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("scheduled_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("scheduled_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("timezone", sa.String(length=50), nullable=False),
        sa.Column("meeting_url", sa.String(length=500), nullable=True),
        sa.Column("meeting_platform", sa.String(length=50), nullable=True),
        sa.Column("status", sa.Enum("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show", "disputed", name="bookingstatus"), nullable=False, server_default='pending'),
        sa.Column("client_notes", sa.Text(), nullable=True),
        sa.Column("provider_notes", sa.Text(), nullable=True),
        sa.Column("attachments", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("provider_summary", sa.Text(), nullable=True),
        sa.Column("client_followup_needed", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("price_agreed", sa.Numeric(10, 2), nullable=False),
        sa.Column("platform_fee", sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column("provider_earnings", sa.Numeric(10, 2), nullable=False),
        sa.Column("cancelled_by", sa.String(length=20), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("payment_status", sa.Enum("pending", "held", "released", "refunded", "failed", name="paymentstatus"), nullable=False, server_default='pending'),
        sa.Column("payment_method", sa.String(length=50), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["client_id"], ["users.id"], name=op.f("fk_bookings_client_id_users"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["provider_id"], ["provider_profiles.id"], name=op.f("fk_bookings_provider_id_provider_profiles"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["service_listings.id"], name=op.f("fk_bookings_service_id_service_listings"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bookings"))
    )
    op.create_index(op.f("ix_bookings_client_id"), "bookings", ["client_id"], unique=False)
    op.create_index(op.f("ix_bookings_provider_id"), "bookings", ["provider_id"], unique=False)
    op.create_index(op.f("ix_bookings_service_id"), "bookings", ["service_id"], unique=False)
    op.create_index(op.f("ix_bookings_status"), "bookings", ["status"], unique=False)

    # Add back the foreign key to service_availability now that bookings exists
    op.create_foreign_key(
        op.f("fk_service_availability_booking_id_bookings"),
        "service_availability", "bookings",
        ["booking_id"], ["id"],
        ondelete="SET NULL"
    )

    # reviews table
    op.create_table(
        "reviews",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("booking_id", sa.UUID(), nullable=False),
        sa.Column("client_id", sa.UUID(), nullable=False),
        sa.Column("provider_id", sa.UUID(), nullable=False),
        sa.Column("service_id", sa.UUID(), nullable=False),
        sa.Column("overall_rating", sa.Integer(), nullable=False),
        sa.Column("communication_rating", sa.Integer(), nullable=True),
        sa.Column("expertise_rating", sa.Integer(), nullable=True),
        sa.Column("value_rating", sa.Integer(), nullable=True),
        sa.Column("would_recommend", sa.Boolean(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("provider_response", sa.Text(), nullable=True),
        sa.Column("provider_responded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("moderated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("moderation_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], name=op.f("fk_reviews_booking_id_bookings"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["client_id"], ["users.id"], name=op.f("fk_reviews_client_id_users"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["provider_id"], ["provider_profiles.id"], name=op.f("fk_reviews_provider_id_provider_profiles"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["service_listings.id"], name=op.f("fk_reviews_service_id_service_listings"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reviews")),
        sa.UniqueConstraint("booking_id", name=op.f("uq_reviews_booking_id"))
    )
    op.create_index(op.f("ix_reviews_client_id"), "reviews", ["client_id"], unique=False)
    op.create_index(op.f("ix_reviews_provider_id"), "reviews", ["provider_id"], unique=False)

    # conversations table
    op.create_table(
        "conversations",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("client_id", sa.UUID(), nullable=False),
        sa.Column("provider_id", sa.UUID(), nullable=False),
        sa.Column("related_service_id", sa.UUID(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default='true'),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("client_archived", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("provider_archived", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["client_id"], ["users.id"], name=op.f("fk_conversations_client_id_users"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["provider_id"], ["provider_profiles.id"], name=op.f("fk_conversations_provider_id_provider_profiles"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["related_service_id"], ["service_listings.id"], name=op.f("fk_conversations_related_service_id_service_listings"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_conversations"))
    )
    op.create_index(op.f("ix_conversations_client_id"), "conversations", ["client_id"], unique=False)
    op.create_index(op.f("ix_conversations_provider_id"), "conversations", ["provider_id"], unique=False)

    # messages table
    op.create_table(
        "messages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("conversation_id", sa.UUID(), nullable=False),
        sa.Column("sender_id", sa.UUID(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("message_type", sa.String(length=20), nullable=False, server_default='text'),
        sa.Column("file_url", sa.String(length=500), nullable=True),
        sa.Column("file_name", sa.String(length=200), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("edited_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], name=op.f("fk_messages_conversation_id_conversations"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], name=op.f("fk_messages_sender_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_messages"))
    )
    op.create_index(op.f("ix_messages_conversation_id"), "messages", ["conversation_id"], unique=False)
    op.create_index(op.f("ix_messages_sender_id"), "messages", ["sender_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_messages_sender_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_conversation_id"), table_name="messages")
    op.drop_table("messages")
    op.drop_index(op.f("ix_conversations_provider_id"), table_name="conversations")
    op.drop_index(op.f("ix_conversations_client_id"), table_name="conversations")
    op.drop_table("conversations")
    op.drop_index(op.f("ix_reviews_provider_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_client_id"), table_name="reviews")
    op.drop_table("reviews")
    op.drop_index(op.f("ix_bookings_status"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_service_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_provider_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_client_id"), table_name="bookings")
    op.drop_table("bookings")
    op.drop_index(op.f("ix_service_availability_service_id"), table_name="service_availability")
    op.drop_index(op.f("ix_service_availability_provider_id"), table_name="service_availability")
    op.drop_index(op.f("ix_service_availability_date"), table_name="service_availability")
    op.drop_table("service_availability")
    op.drop_index(op.f("ix_service_listings_service_type"), table_name="service_listings")
    op.drop_index(op.f("ix_service_listings_provider_id"), table_name="service_listings")
    op.drop_table("service_listings")
    op.drop_index(op.f("ix_provider_credentials_provider_id"), table_name="provider_credentials")
    op.drop_table("provider_credentials")
    op.drop_index(op.f("ix_provider_profiles_user_id"), table_name="provider_profiles")
    op.drop_index(op.f("ix_provider_profiles_status"), table_name="provider_profiles")
    op.drop_table("provider_profiles")
    op.execute("DROP TYPE IF EXISTS providerstatus")
    op.execute("DROP TYPE IF EXISTS servicetype")
    op.execute("DROP TYPE IF EXISTS servicedeliverymethod")
    op.execute("DROP TYPE IF EXISTS pricingtype")
    op.execute("DROP TYPE IF EXISTS bookingstatus")
    op.execute("DROP TYPE IF EXISTS paymentstatus")
