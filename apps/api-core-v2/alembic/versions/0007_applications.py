"""add_application_engine

Revision ID: 0007_applications
Revises: 0006_interviews
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0007_applications"
down_revision = "0006_interviews"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # opportunities table
    op.create_table(
        "opportunities",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("opportunity_type", sa.Enum("scholarship", "job", "research_position", "exchange_program", "grant", "fellowship", "internship", "conference", name="opportunitytype"), nullable=False),
        sa.Column("status", sa.Enum("draft", "published", "closed", "archived", name="opportunitystatus"), nullable=False, server_default='published'),
        sa.Column("organization_name", sa.String(length=200), nullable=True),
        sa.Column("organization_country", sa.String(length=100), nullable=True),
        sa.Column("organization_website", sa.String(length=500), nullable=True),
        sa.Column("location_type", sa.String(length=20), nullable=False, server_default='onsite'),
        sa.Column("location_country", sa.String(length=100), nullable=True),
        sa.Column("location_city", sa.String(length=100), nullable=True),
        sa.Column("application_deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("duration_months", sa.Integer(), nullable=True),
        sa.Column("funding_amount", sa.Float(), nullable=True),
        sa.Column("funding_currency", sa.String(length=3), nullable=True),
        sa.Column("funding_details", sa.Text(), nullable=True),
        sa.Column("required_documents", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("eligibility_criteria", sa.Text(), nullable=True),
        sa.Column("required_languages", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("application_url", sa.String(length=500), nullable=True),
        sa.Column("application_instructions", sa.Text(), nullable=True),
        sa.Column("relevant_fields", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("required_experience_years", sa.Integer(), nullable=True),
        sa.Column("education_level", sa.String(length=50), nullable=True),
        sa.Column("source", sa.String(length=200), nullable=True),
        sa.Column("external_id", sa.String(length=200), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], name=op.f("fk_opportunities_created_by_id_users"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_opportunities"))
    )
    op.create_index(op.f("ix_opportunities_application_deadline"), "opportunities", ["application_deadline"], unique=False)
    op.create_index(op.f("ix_opportunities_opportunity_type"), "opportunities", ["opportunity_type"], unique=False)

    # user_applications table
    op.create_table(
        "user_applications",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("opportunity_id", sa.UUID(), nullable=False),
        sa.Column("status", sa.Enum("watching", "planned", "in_progress", "submitted", "under_review", "accepted", "rejected", "withdrawn", name="applicationstatus"), nullable=False, server_default='watching'),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("checklist_progress", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column("completion_percentage", sa.Integer(), nullable=False, server_default='0'),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("response_received_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("outcome", sa.String(length=50), nullable=True),
        sa.Column("feedback_received", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"], name=op.f("fk_user_applications_opportunity_id_opportunities"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_user_applications_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_applications"))
    )
    op.create_index(op.f("ix_user_applications_opportunity_id"), "user_applications", ["opportunity_id"], unique=False)
    op.create_index(op.f("ix_user_applications_user_id"), "user_applications", ["user_id"], unique=False)

    # application_documents table
    op.create_table(
        "application_documents",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("application_id", sa.UUID(), nullable=False),
        sa.Column("document_type", sa.Enum("motivation_letter", "cv", "transcript", "recommendation_letter", "language_certificate", "portfolio", "research_proposal", "other", name="applicationdocumenttype"), nullable=False),
        sa.Column("narrative_id", sa.UUID(), nullable=True),
        sa.Column("file_url", sa.String(length=500), nullable=True),
        sa.Column("file_name", sa.String(length=255), nullable=True),
        sa.Column("is_submitted", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("submitted_version_id", sa.UUID(), nullable=True),
        sa.Column("validation_status", sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column("validation_notes", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["user_applications.id"], name=op.f("fk_application_documents_application_id_user_applications"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["narrative_id"], ["narratives.id"], name=op.f("fk_application_documents_narrative_id_narratives"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["submitted_version_id"], ["narrative_versions.id"], name=op.f("fk_application_documents_submitted_version_id_narrative_versions"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_application_documents"))
    )
    op.create_index(op.f("ix_application_documents_application_id"), "application_documents", ["application_id"], unique=False)

    # opportunity_watchlists table
    op.create_table(
        "opportunity_watchlists",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("opportunity_id", sa.UUID(), nullable=False),
        sa.Column("reminder_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reminder_sent", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"], name=op.f("fk_opportunity_watchlists_opportunity_id_opportunities"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_opportunity_watchlists_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_opportunity_watchlists"))
    )
    op.create_index(op.f("ix_opportunity_watchlists_opportunity_id"), "opportunity_watchlists", ["opportunity_id"], unique=False)
    op.create_index(op.f("ix_opportunity_watchlists_user_id"), "opportunity_watchlists", ["user_id"], unique=False)

    # application_deadline_reminders table
    op.create_table(
        "application_deadline_reminders",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("application_id", sa.UUID(), nullable=False),
        sa.Column("days_before", sa.Integer(), nullable=False),
        sa.Column("reminder_type", sa.String(length=50), nullable=False, server_default='email'),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_sent", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["user_applications.id"], name=op.f("fk_application_deadline_reminders_application_id_user_applications"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_application_deadline_reminders_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_application_deadline_reminders"))
    )
    op.create_index(op.f("ix_application_deadline_reminders_application_id"), "application_deadline_reminders", ["application_id"], unique=False)
    op.create_index(op.f("ix_application_deadline_reminders_user_id"), "application_deadline_reminders", ["user_id"], unique=False)

    # opportunity_matches table
    op.create_table(
        "opportunity_matches",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("opportunity_id", sa.UUID(), nullable=False),
        sa.Column("match_score", sa.Float(), nullable=False),
        sa.Column("fit_score", sa.Float(), nullable=True),
        sa.Column("interest_score", sa.Float(), nullable=True),
        sa.Column("match_reasons", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("missing_requirements", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column("user_feedback", sa.String(length=20), nullable=True),
        sa.Column("feedback_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_dismissed", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"], name=op.f("fk_opportunity_matches_opportunity_id_opportunities"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_opportunity_matches_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_opportunity_matches"))
    )
    op.create_index(op.f("ix_opportunity_matches_opportunity_id"), "opportunity_matches", ["opportunity_id"], unique=False)
    op.create_index(op.f("ix_opportunity_matches_user_id"), "opportunity_matches", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_opportunity_matches_user_id"), table_name="opportunity_matches")
    op.drop_index(op.f("ix_opportunity_matches_opportunity_id"), table_name="opportunity_matches")
    op.drop_table("opportunity_matches")
    op.drop_index(op.f("ix_application_deadline_reminders_user_id"), table_name="application_deadline_reminders")
    op.drop_index(op.f("ix_application_deadline_reminders_application_id"), table_name="application_deadline_reminders")
    op.drop_table("application_deadline_reminders")
    op.drop_index(op.f("ix_opportunity_watchlists_user_id"), table_name="opportunity_watchlists")
    op.drop_index(op.f("ix_opportunity_watchlists_opportunity_id"), table_name="opportunity_watchlists")
    op.drop_table("opportunity_watchlists")
    op.drop_index(op.f("ix_application_documents_application_id"), table_name="application_documents")
    op.drop_table("application_documents")
    op.drop_index(op.f("ix_user_applications_user_id"), table_name="user_applications")
    op.drop_index(op.f("ix_user_applications_opportunity_id"), table_name="user_applications")
    op.drop_table("user_applications")
    op.drop_index(op.f("ix_opportunities_opportunity_type"), table_name="opportunities")
    op.drop_index(op.f("ix_opportunities_application_deadline"), table_name="opportunities")
    op.drop_table("opportunities")
    op.execute("DROP TYPE IF EXISTS opportunitytype")
    op.execute("DROP TYPE IF EXISTS opportunitystatus")
    op.execute("DROP TYPE IF EXISTS applicationstatus")
    op.execute("DROP TYPE IF EXISTS applicationdocumenttype")
