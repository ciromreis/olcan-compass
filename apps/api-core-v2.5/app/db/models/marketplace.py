"""Marketplace Models - Phase 3

Provider profiles, service listings, booking system, and reviews.
"""

import uuid
import enum
from datetime import datetime, timezone, date
from decimal import Decimal

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Float, Integer, Boolean, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProviderStatus(str, enum.Enum):
    PENDING = "pending"  # Applied, not yet verified
    UNDER_REVIEW = "under_review"  # Documents being checked
    APPROVED = "approved"  # Can list services
    REJECTED = "rejected"  # Application denied
    SUSPENDED = "suspended"  # Temporarily disabled
    INACTIVE = "inactive"  # Voluntarily paused


class ServiceType(str, enum.Enum):
    MENTORING = "mentoring"  # Ongoing guidance
    ESSAY_REVIEW = "essay_review"  # Document feedback
    INTERVIEW_PREP = "interview_prep"  # Mock interviews
    CV_REVIEW = "cv_review"  # Resume/CV feedback
    SOP_REVIEW = "sop_review"  # Statement of purpose
    RESEARCH_PROPOSAL = "research_proposal"  # Research plan review
    APPLICATION_STRATEGY = "application_strategy"  # Overall planning
    LANGUAGE_COACHING = "language_coaching"  # TOEFL/IELTS prep
    FINANCIAL_PLANNING = "financial_planning"  # Funding advice
    VISA_GUIDANCE = "visa_guidance"  # Visa application help


class ServiceDeliveryMethod(str, enum.Enum):
    VIDEO_CALL = "video_call"
    AUDIO_CALL = "audio_call"
    CHAT = "chat"
    DOCUMENT_REVIEW = "document_review"  # Async, no live meeting
    IN_PERSON = "in_person"


class PricingType(str, enum.Enum):
    FIXED = "fixed"  # Flat fee per service
    HOURLY = "hourly"  # Rate per hour
    PER_WORD = "per_word"  # For document reviews
    PACKAGE = "package"  # Bundle pricing


class BookingStatus(str, enum.Enum):
    PENDING = "pending"  # Awaiting provider confirmation
    CONFIRMED = "confirmed"  # Both parties agreed
    IN_PROGRESS = "in_progress"  # Meeting happening now
    COMPLETED = "completed"  # Service delivered
    CANCELLED = "cancelled"  # Either party cancelled
    NO_SHOW = "no_show"  # Client didn't attend
    DISPUTED = "disputed"  # Issue being resolved


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    HELD = "held"  # Escrow
    RELEASED = "released"  # To provider
    REFUNDED = "refunded"
    FAILED = "failed"


class ProviderProfile(Base):
    """Extended profile for marketplace providers"""
    __tablename__ = "provider_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Basic info
    headline: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Professional background
    current_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    current_organization: Mapped[str | None] = mapped_column(String(200), nullable=True)
    years_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Education
    education: Mapped[list] = mapped_column(JSON, default=list)  # [{"degree": "PhD", "field": "CS", "institution": "MIT"}]
    
    # Specializations
    specializations: Mapped[list] = mapped_column(JSON, default=list)  # ["graduate_admissions", "stem_fields"]
    target_regions: Mapped[list] = mapped_column(JSON, default=list)  # Countries/regions they help with
    target_institutions: Mapped[list] = mapped_column(JSON, default=list)  # Specific schools they know well
    
    # Languages
    languages_spoken: Mapped[list] = mapped_column(JSON, default=list)  # ["en", "pt", "es"]
    
    # Verification
    status: Mapped[ProviderStatus] = mapped_column(Enum(ProviderStatus, values_callable=lambda x: [e.value for e in x]), default=ProviderStatus.PENDING, nullable=False, index=True)
    
    # Stats
    total_bookings: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_bookings: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rating_average: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    response_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # % of inquiries responded to
    response_time_hours: Mapped[float | None] = mapped_column(Float, nullable=True)  # Average response time
    
    # Availability
    timezone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    typical_response_time: Mapped[str | None] = mapped_column(String(50), nullable=True)  # e.g., "within 24 hours"
    
    # Profile media
    profile_video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    portfolio_links: Mapped[list] = mapped_column(JSON, default=list)
    
    # Stripe Connect
    stripe_connect_account_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_connect_onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Application
    application_answers: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # Their responses to vetting questions
    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="provider_profile")


class ProviderCredential(Base):
    """Credentials and verification documents for providers"""
    __tablename__ = "provider_credentials"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Credential info
    credential_type: Mapped[str] = mapped_column(String(50), nullable=False)  # degree, certificate, employment, license
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    issuing_organization: Mapped[str | None] = mapped_column(String(200), nullable=True)
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    # Verification
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, verified, rejected
    verified_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verification_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ServiceListing(Base):
    """Services offered by providers"""
    __tablename__ = "service_listings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Service details
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    service_type: Mapped[ServiceType] = mapped_column(Enum(ServiceType, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)
    
    # Delivery
    delivery_method: Mapped[ServiceDeliveryMethod] = mapped_column(Enum(ServiceDeliveryMethod, values_callable=lambda x: [e.value for e in x]), nullable=False)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)  # For scheduled sessions
    
    # Pricing
    pricing_type: Mapped[PricingType] = mapped_column(Enum(PricingType, values_callable=lambda x: [e.value for e in x]), default=PricingType.FIXED, nullable=False)
    price_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # Base price
    price_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    
    # For variable pricing
    min_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    max_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_per_unit: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # For per-word or hourly
    
    # Scope
    includes: Mapped[list] = mapped_column(JSON, default=list)  # What's included in the service
    excludes: Mapped[list] = mapped_column(JSON, default=list)  # What's not included
    prerequisites: Mapped[list] = mapped_column(JSON, default=list)  # What client needs to prepare
    deliverables: Mapped[list] = mapped_column(JSON, default=list)  # What client receives
    
    # Scheduling
    advance_booking_days: Mapped[int] = mapped_column(Integer, default=2, nullable=False)  # How much notice needed
    max_bookings_per_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Stats
    total_bookings: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_revenue: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class ServiceAvailability(Base):
    """Provider's available time slots"""
    __tablename__ = "service_availability"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("service_listings.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Time slot
    date: Mapped["date"] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Status
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # Weekly recurring slot
    
    # Booking reference
    booking_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Booking(Base):
    """Service bookings between clients and providers"""
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Parties
    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("service_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Session details
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    scheduled_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Meeting info
    meeting_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    meeting_platform: Mapped[str | None] = mapped_column(String(50), nullable=True)  # zoom, meet, etc.
    
    # Status
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus, values_callable=lambda x: [e.value for e in x]), default=BookingStatus.PENDING, nullable=False, index=True)
    
    # Content
    client_notes: Mapped[str | None] = mapped_column(Text, nullable=True)  # What client wants to discuss
    provider_notes: Mapped[str | None] = mapped_column(Text, nullable=True)  # Provider's prep notes
    attachments: Mapped[list] = mapped_column(JSON, default=list)  # Documents shared
    
    # Outcome
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    provider_summary: Mapped[str | None] = mapped_column(Text, nullable=True)  # Post-session notes
    client_followup_needed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Pricing
    price_agreed: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    platform_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    provider_earnings: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Cancellation
    cancelled_by: Mapped[str | None] = mapped_column(String(20), nullable=True)  # client, provider
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Payment
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, values_callable=lambda x: [e.value for e in x]),
        default=PaymentStatus.PENDING,
        nullable=False,
    )
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="bookings_as_client")


class Review(Base):
    """Reviews and ratings for completed bookings"""
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # References
    booking_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True)
    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("service_listings.id", ondelete="CASCADE"), nullable=False)
    
    # Ratings (1-5 scale)
    overall_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    communication_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    expertise_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    value_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    would_recommend: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    
    # Review content
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Provider response
    provider_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Moderation
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)  # Verified purchase
    moderated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    moderation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="reviews")


class Conversation(Base):
    """Messaging between clients and providers before booking"""
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Participants
    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Context
    related_service_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("service_listings.id", ondelete="SET NULL"), nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Client actions
    client_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    provider_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Message(Base):
    """Individual messages in conversations"""
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(String(20), default="text")  # text, file, system
    
    # File attachment
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Edits
    edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
