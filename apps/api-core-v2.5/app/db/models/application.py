"""Application Management Engine Models"""

import uuid
import enum
from datetime import datetime, timezone, date

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Float, Integer, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OpportunityType(str, enum.Enum):
    SCHOLARSHIP = "scholarship"
    JOB = "job"
    RESEARCH_POSITION = "research_position"
    EXCHANGE_PROGRAM = "exchange_program"
    GRANT = "grant"
    FELLOWSHIP = "fellowship"
    INTERNSHIP = "internship"
    CONFERENCE = "conference"


class OpportunityStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class ApplicationStatus(str, enum.Enum):
    WATCHING = "watching"
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationDocumentType(str, enum.Enum):
    MOTIVATION_LETTER = "motivation_letter"
    CV = "cv"
    TRANSCRIPT = "transcript"
    RECOMMENDATION_LETTER = "recommendation_letter"
    LANGUAGE_CERTIFICATE = "language_certificate"
    PORTFOLIO = "portfolio"
    RESEARCH_PROPOSAL = "research_proposal"
    OTHER = "other"


class Opportunity(Base):
    """Scholarships, jobs, programs, grants - opportunities to apply for"""
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Opportunity metadata
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    opportunity_type: Mapped[OpportunityType] = mapped_column(Enum(OpportunityType, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)
    status: Mapped[OpportunityStatus] = mapped_column(Enum(OpportunityStatus, values_callable=lambda x: [e.value for e in x]), default=OpportunityStatus.PUBLISHED, nullable=False)
    
    # Organization offering the opportunity
    organization_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    organization_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    organization_website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Location
    location_type: Mapped[str] = mapped_column(String(20), default="onsite")  # onsite, remote, hybrid
    location_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Important dates
    application_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    duration_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Financials
    funding_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    funding_currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    funding_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Requirements
    required_documents: Mapped[list] = mapped_column(JSON, default=list)  # List of ApplicationDocumentType
    eligibility_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    required_languages: Mapped[list] = mapped_column(JSON, default=list)
    
    # Application link/info
    application_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    application_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Matching criteria (for AI matching)
    relevant_fields: Mapped[list] = mapped_column(JSON, default=list)  # Academic fields
    required_experience_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    education_level: Mapped[str | None] = mapped_column(String(50), nullable=True)  # bachelor, master, phd, etc.
    
    # Metadata
    source: Mapped[str | None] = mapped_column(String(200), nullable=True)  # Where found
    external_id: Mapped[str | None] = mapped_column(String(200), nullable=True)  # ID from external source
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class UserApplication(Base):
    """User's application to an opportunity"""
    __tablename__ = "user_applications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Application status tracking
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus, values_callable=lambda x: [e.value for e in x]), default=ApplicationStatus.WATCHING, nullable=False)
    
    # User's internal status tracking
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Progress tracking
    checklist_progress: Mapped[dict] = mapped_column(JSON, default=dict)  # { "cv": true, "transcript": false, ... }
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    response_received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Outcome
    outcome: Mapped[str | None] = mapped_column(String(50), nullable=True)  # accepted, rejected, waitlisted, etc.
    feedback_received: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class ApplicationDocument(Base):
    """Documents attached to a specific application"""
    __tablename__ = "application_documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Document reference (links to narrative or file storage)
    document_type: Mapped[ApplicationDocumentType] = mapped_column(Enum(ApplicationDocumentType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    narrative_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("narratives.id", ondelete="SET NULL"), nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Document status
    is_submitted: Mapped[bool] = mapped_column(Boolean, default=False)
    submitted_version_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("narrative_versions.id", ondelete="SET NULL"), nullable=True)
    
    # Validation
    validation_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, valid, invalid
    validation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class OpportunityWatchlist(Base):
    """User's watchlist of opportunities they're interested in"""
    __tablename__ = "opportunity_watchlists"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Watchlist metadata
    reminder_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Unique constraint handled via indexes


class ApplicationDeadlineReminder(Base):
    """Reminders for upcoming deadlines"""
    __tablename__ = "application_deadline_reminders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Reminder configuration
    days_before: Mapped[int] = mapped_column(Integer, nullable=False)  # 7, 3, 1 days
    reminder_type: Mapped[str] = mapped_column(String(50), default="email")  # email, push, sms
    
    # Status
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class OpportunityMatch(Base):
    """AI-generated matches between users and opportunities"""
    __tablename__ = "opportunity_matches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Match scoring
    match_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    fit_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # How well user fits criteria
    interest_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # How likely user is to be interested
    
    # Match reasoning
    match_reasons: Mapped[list] = mapped_column(JSON, default=list)
    missing_requirements: Mapped[list] = mapped_column(JSON, default=list)
    
    # User feedback
    user_feedback: Mapped[str | None] = mapped_column(String(20), nullable=True)  # interested, not_interested, applied
    feedback_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Unique constraint on user_id + opportunity_id
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )
