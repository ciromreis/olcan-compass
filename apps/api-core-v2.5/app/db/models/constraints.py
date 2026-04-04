"""User Constraints Model

Armazena restrições "hard" do usuário (capital, idioma, tempo e banda) para
habilitar pruning determinístico de oportunidades e chunking de sprints.
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, JSON, Numeric, Boolean, Float, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PruningReason(str, enum.Enum):
    BUDGET_EXCEEDED = "budget_exceeded"
    TIMELINE_TOO_LONG = "timeline_too_long"
    LANGUAGE_REQUIREMENT = "language_requirement"
    LOCATION_MISMATCH = "location_mismatch"
    EDUCATION_INSUFFICIENT = "education_insufficient"
    EXPERIENCE_INSUFFICIENT = "experience_insufficient"
    ALREADY_APPLIED = "already_applied"
    DEADLINE_PASSED = "deadline_passed"
    REQUIREMENT_MISSING = "requirement_missing"


class UserConstraintProfile(Base):
    __tablename__ = "user_constraint_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Capital / tempo (valores usam semântica do produto, não financeira contábil)
    budget_max: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    time_available_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weekly_bandwidth_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Perfil operacional
    languages: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    target_countries: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    excluded_countries: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    education_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    years_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Additional constraints for deterministic pruning
    visa_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    citizenship_countries: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    commitment_level: Mapped[str] = mapped_column(String(20), default="flexible")  # full_time, part_time, flexible
    risk_tolerance: Mapped[str] = mapped_column(String(20), default="moderate")  # conservative, moderate, aggressive
    
    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class OpportunityPruningLog(Base):
    """Log of why opportunities were pruned for transparency"""
    __tablename__ = "opportunity_pruning_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Pruning decision
    is_pruned: Mapped[bool] = mapped_column(Boolean, nullable=False)  # True = pruned/hidden, False = shown
    pruning_reason: Mapped[PruningReason | None] = mapped_column(String(50), nullable=True)  # Why pruned (if applicable)
    
    # Constraint details
    violated_constraints: Mapped[list] = mapped_column(JSON, default=list)  # List of violated constraint types
    constraint_details: Mapped[dict] = mapped_column(JSON, default=dict)  # Detailed violation info
    
    # Scoring
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100 compatibility score
    constraint_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100 constraint satisfaction
    
    # Explanation (user-facing)
    explanation_title: Mapped[str | None] = mapped_column(String(200), nullable=True)  # Short explanation
    explanation_detail: Mapped[str | None] = mapped_column(Text, nullable=True)  # Detailed explanation
    
    # Metadata
    pruning_algorithm_version: Mapped[str] = mapped_column(String(20), default="v1.0")  # Algorithm version
    processing_time_ms: Mapped[int] = mapped_column(Integer, nullable=True)  # Processing time in milliseconds
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ConstraintFeedback(Base):
    """User feedback on pruning decisions to improve the algorithm"""
    __tablename__ = "constraint_feedback"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pruning_log_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("opportunity_pruning_logs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Feedback
    feedback_type: Mapped[str] = mapped_column(String(20), nullable=False)  # correct_pruning, incorrect_pruning, show_anyway
    feedback_detail: Mapped[str | None] = mapped_column(Text, nullable=True)  # User comments
    
    # Constraint adjustments (if user wants to update)
    suggested_constraints: Mapped[dict] = mapped_column(JSON, default=dict)  # Suggested constraint changes
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

