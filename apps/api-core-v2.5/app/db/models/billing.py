"""Billing models — Forge credits, usage log, credit purchases."""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, String, Integer, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ForgeUsageLog(Base):
    """One row per AI polish call — tracks credit consumption."""
    __tablename__ = "forge_usage_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    narrative_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("narratives.id", ondelete="SET NULL"), nullable=True)
    credits_used: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    ai_provider: Mapped[str] = mapped_column(String(50), nullable=False, default="simulation")
    methodology: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    input_word_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    output_word_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="forge_usage_logs")


class CreditPurchase(Base):
    """Tracks Stripe Checkout sessions for credit pack purchases."""
    __tablename__ = "credit_purchases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stripe_session_id: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    credits_purchased: Mapped[int] = mapped_column(Integer, nullable=False)
    amount_brl: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, paid, expired
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="credit_purchases")
