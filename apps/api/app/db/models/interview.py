"""Interview Intelligence Engine Models"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Float, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InterviewQuestionType(str, enum.Enum):
    MOTIVATION = "motivation"
    BACKGROUND = "background"
    CHALLENGE = "challenge"
    GOALS = "goals"
    CULTURAL_FIT = "cultural_fit"
    TECHNICAL = "technical"
    SCENARIO = "scenario"
    QUESTION_FOR_PANEL = "question_for_panel"


class InterviewSessionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class InterviewAnswerStatus(str, enum.Enum):
    PENDING = "pending"
    RECORDED = "recorded"
    ANALYZED = "analyzed"


class InterviewQuestion(Base):
    """Question bank for interviews, categorized by route type and question type"""
    __tablename__ = "interview_questions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Question content (multilingual)
    question_text_en: Mapped[str] = mapped_column(Text, nullable=False)
    question_text_pt: Mapped[str] = mapped_column(Text, nullable=False)
    question_text_es: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Categorization
    question_type: Mapped[InterviewQuestionType] = mapped_column(Enum(InterviewQuestionType, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)
    route_types: Mapped[list] = mapped_column(JSON, default=list)  # Applicable route types
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")  # easy, medium, hard
    
    # Context for AI scoring
    what_assessors_look_for: Mapped[dict] = mapped_column(JSON, default=dict)
    common_mistakes: Mapped[list] = mapped_column(JSON, default=list)
    
    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class InterviewSession(Base):
    """Mock interview session for a user"""
    __tablename__ = "interview_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    route_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("routes.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Session configuration
    session_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "scholarship_panel", "job_interview"
    target_institution: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    # Status tracking
    status: Mapped[InterviewSessionStatus] = mapped_column(Enum(InterviewSessionStatus, values_callable=lambda x: [e.value for e in x]), default=InterviewSessionStatus.SCHEDULED, nullable=False)
    
    # Question set
    question_ids: Mapped[list] = mapped_column(JSON, default=list)  # Ordered list of question IDs
    current_question_index: Mapped[int] = mapped_column(Integer, default=0)
    total_questions: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timing
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    
    # Results summary (denormalized)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    clarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    top_strengths: Mapped[list] = mapped_column(JSON, default=list)
    improvement_areas: Mapped[list] = mapped_column(JSON, default=list)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class InterviewAnswer(Base):
    """User's recorded answer to an interview question"""
    __tablename__ = "interview_answers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Answer content
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # S3/blob storage URL
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Answer metadata
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Status
    status: Mapped[InterviewAnswerStatus] = mapped_column(Enum(InterviewAnswerStatus, values_callable=lambda x: [e.value for e in x]), default=InterviewAnswerStatus.PENDING, nullable=False)
    
    # AI Analysis results
    clarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    structure_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Detailed feedback
    content_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    improvement_suggestions: Mapped[list] = mapped_column(JSON, default=list)
    key_strengths: Mapped[list] = mapped_column(JSON, default=list)
    
    # AI metadata
    ai_model: Mapped[str | None] = mapped_column(String(50), nullable=True)
    token_usage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    analyzed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class InterviewFeedbackTemplate(Base):
    """Templates for AI-generated feedback patterns"""
    __tablename__ = "interview_feedback_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Template metadata
    feedback_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "too_short", "vague", "excellent_opening"
    question_types: Mapped[list] = mapped_column(JSON, default=list)  # Applicable to which question types
    
    # Feedback content
    title_en: Mapped[str] = mapped_column(String(200), nullable=False)
    title_pt: Mapped[str] = mapped_column(String(200), nullable=False)
    title_es: Mapped[str] = mapped_column(String(200), nullable=False)
    
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_pt: Mapped[str] = mapped_column(Text, nullable=False)
    description_es: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Actionable advice
    suggestions_en: Mapped[list] = mapped_column(JSON, default=list)
    suggestions_pt: Mapped[list] = mapped_column(JSON, default=list)
    suggestions_es: Mapped[list] = mapped_column(JSON, default=list)
    
    # Trigger conditions (AI uses these to match)
    trigger_score_range: Mapped[dict] = mapped_column(JSON, default=dict)  # e.g., {"min": 0, "max": 40}
    trigger_keywords: Mapped[list] = mapped_column(JSON, default=list)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
