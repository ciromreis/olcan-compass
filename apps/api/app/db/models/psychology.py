import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Boolean, Integer, Float, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects import postgresql

from app.db.base import Base


class PsychQuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SCALE = "scale"
    TEXT = "text"
    BINARY = "binary"


class PsychCategory(str, enum.Enum):
    CONFIDENCE = "confidence"
    ANXIETY = "anxiety"
    DISCIPLINE = "discipline"
    RISK_TOLERANCE = "risk_tolerance"
    NARRATIVE_CLARITY = "narrative_clarity"
    INTERVIEW_ANXIETY = "interview_anxiety"
    DECISION_STYLE = "decision_style"
    CULTURAL_ADAPTABILITY = "cultural_adaptability"
    FINANCIAL_RESILIENCE = "financial_resilience"
    COMMUNICATION_STYLE = "communication_style"


class PsychProfile(Base):
    __tablename__ = "user_psych_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Composite scores (0-100)
    confidence_index: Mapped[float] = mapped_column(Float, default=0.0)
    anxiety_score: Mapped[float] = mapped_column(Float, default=0.0)
    discipline_score: Mapped[float] = mapped_column(Float, default=0.0)
    narrative_maturity_score: Mapped[float] = mapped_column(Float, default=0.0)
    interview_anxiety_score: Mapped[float] = mapped_column(Float, default=0.0)
    cultural_adaptability_score: Mapped[float] = mapped_column(Float, default=0.0)
    financial_resilience_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Enums
    risk_profile: Mapped[str] = mapped_column(String(20), default="medium")
    decision_style: Mapped[str] = mapped_column(String(50), default="analytical")
    
    # Computed states
    mobility_state: Mapped[str] = mapped_column(String(20), default="exploring")
    psychological_state: Mapped[str] = mapped_column(String(20), default="uncertain")
    
    # JSON data
    fear_clusters: Mapped[list] = mapped_column(JSON, default=list)
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    growth_areas: Mapped[list] = mapped_column(JSON, default=list)
    
    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_assessment_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class PsychQuestion(Base):
    __tablename__ = "psych_questions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Question data
    text_en: Mapped[str] = mapped_column(Text, nullable=False)
    text_pt: Mapped[str] = mapped_column(Text, nullable=False)
    text_es: Mapped[str] = mapped_column(Text, nullable=False)
    
    question_type: Mapped[PsychQuestionType] = mapped_column(Enum(PsychQuestionType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    category: Mapped[PsychCategory] = mapped_column(Enum(PsychCategory, values_callable=lambda x: [e.value for e in x]), nullable=False)
    
    # Options for multiple choice
    options: Mapped[list] = mapped_column(JSON, default=list)
    
    # Scoring
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    reverse_scored: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Metadata
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PsychAnswer(Base):
    __tablename__ = "psych_answers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("psych_assessment_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("psych_questions.id", ondelete="CASCADE"), nullable=False)
    
    # Answer data
    answer_value: Mapped[str] = mapped_column(Text, nullable=False)
    answer_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Score computed for this answer
    computed_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PsychAssessmentSession(Base):
    __tablename__ = "psych_assessment_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Session status
    status: Mapped[str] = mapped_column(String(20), default="in_progress")
    
    # Progress
    current_question_index: Mapped[int] = mapped_column(Integer, default=0)
    total_questions: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timing
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Results snapshot (computed after completion)
    scores_snapshot: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PsychScoreHistory(Base):
    __tablename__ = "psych_score_history"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Score components at this point in time
    confidence_index: Mapped[float] = mapped_column(Float, nullable=False)
    anxiety_score: Mapped[float] = mapped_column(Float, nullable=False)
    discipline_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_profile: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Context
    assessment_type: Mapped[str] = mapped_column(String(50), default="onboarding")
    trigger_event: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
