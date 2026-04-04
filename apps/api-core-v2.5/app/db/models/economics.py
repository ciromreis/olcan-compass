"""Economics Models - Trust Signals, Escrow, Scenarios

Models for economics-driven intelligence features.
"""

import uuid
import enum
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Float, Integer, Boolean, Numeric, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class CredentialType(str, enum.Enum):
    READINESS = "readiness"  # High readiness score
    EXPERTISE = "expertise"  # Domain expertise
    ACHIEVEMENT = "achievement"  # Milestone completion


class EscrowStatus(str, enum.Enum):
    PENDING = "pending"  # Payment initiated
    HELD = "held"  # Funds held in escrow
    RELEASED = "released"  # Released to provider
    REFUNDED = "refunded"  # Refunded to client
    DISPUTED = "disputed"  # Under dispute resolution


class WidgetEventType(str, enum.Enum):
    IMPRESSION = "impression"  # Widget shown
    CLICK = "click"  # Widget clicked
    CONVERSION = "conversion"  # User took action
    DISMISS = "dismiss"  # User dismissed widget


class VerificationCredential(Base):
    """Trust signal credentials for high-readiness users"""
    __tablename__ = "verification_credentials"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Credential info
    credential_type: Mapped[str] = mapped_column(String(50), nullable=False)  # readiness, expertise, achievement
    credential_name: Mapped[str] = mapped_column(String(200), nullable=False)
    
    # Verification
    verification_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)  # SHA-256
    verification_url: Mapped[str] = mapped_column(String(500), nullable=False)
    
    # Validity
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Revocation
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revocation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Metadata
    credential_metadata: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)  # Score, level, etc.
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)


class EscrowTransaction(Base):
    """Escrow transactions for performance-bound marketplace services"""
    __tablename__ = "escrow_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # References
    booking_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("provider_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Payment
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # pending, held, released, refunded, disputed
    
    # Stripe integration
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    stripe_transfer_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    # Performance bound
    performance_bound: Mapped[dict] = mapped_column(JSON, nullable=False)  # Release conditions
    readiness_before: Mapped[float | None] = mapped_column(Float, nullable=True)
    readiness_after: Mapped[float | None] = mapped_column(Float, nullable=True)
    improvement_achieved: Mapped[float | None] = mapped_column(Float, nullable=True)
    release_condition_met: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    
    # Timestamps
    held_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    released_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    refunded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Dispute
    dispute_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)


class ScenarioSimulation(Base):
    """Scenario simulations for feasible frontier calculator"""
    __tablename__ = "scenario_simulations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Simulation
    simulation_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    constraints: Mapped[dict] = mapped_column(JSON, nullable=False)  # Budget, time, skills, etc.
    
    # Results
    opportunity_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(UUID(as_uuid=True)), nullable=False)
    pareto_optimal_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(UUID(as_uuid=True)), nullable=False)
    
    # Decision
    selected_opportunity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    decision_quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    decision_rationale: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)


class CredentialUsageTracking(Base):
    """Track credential verification clicks and usage"""
    __tablename__ = "credential_usage_tracking"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    credential_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("verification_credentials.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Event
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # verification_click, application_attached
    application_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user_applications.id", ondelete="SET NULL"), nullable=True)
    
    # Context
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv6 support
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    event_metadata: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class OpportunityCostWidgetEvent(Base):
    """Track opportunity cost widget impressions and conversions"""
    __tablename__ = "opportunity_cost_widget_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Event
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # impression, click, conversion, dismiss
    opportunity_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("opportunities.id", ondelete="SET NULL"), nullable=True)
    
    # Context
    opportunity_cost_shown: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    momentum_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    days_since_last_milestone: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Conversion
    conversion_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # upgrade_pro, upgrade_premium, milestone_completed
    event_metadata: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
