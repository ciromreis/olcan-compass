import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class NarrativeType(str, enum.Enum):
    MOTIVATION_LETTER = "motivation_letter"
    PERSONAL_STATEMENT = "personal_statement"
    COVER_LETTER = "cover_letter"
    RESEARCH_PROPOSAL = "research_proposal"
    CV_SUMMARY = "cv_summary"
    SCHOLARSHIP_ESSAY = "scholarship_essay"
    OTHER = "other"


class NarrativeStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    READY = "ready"
    SUBMITTED = "submitted"
    ARCHIVED = "archived"


class Narrative(Base):
    """Main narrative document container"""
    __tablename__ = "narratives"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    route_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("routes.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Document metadata
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    narrative_type: Mapped[NarrativeType] = mapped_column(Enum(NarrativeType, values_callable=lambda x: [e.value for e in x]), default=NarrativeType.MOTIVATION_LETTER, nullable=False)
    status: Mapped[NarrativeStatus] = mapped_column(Enum(NarrativeStatus, values_callable=lambda x: [e.value for e in x]), default=NarrativeStatus.DRAFT, nullable=False)
    
    # Target information
    target_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_institution: Mapped[str | None] = mapped_column(String(200), nullable=True)
    target_program: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    # Version tracking - current version reference
    current_version_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("narrative_versions.id", ondelete="SET NULL"), nullable=True)
    version_count: Mapped[int] = mapped_column(default=0, nullable=False)
    
    # Analysis summary (denormalized for quick access)
    latest_clarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    latest_coherence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    latest_authenticity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    latest_overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # AI-generated summary
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_strengths: Mapped[list] = mapped_column(JSON, default=list)
    improvement_areas: Mapped[list] = mapped_column(JSON, default=list)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_analyzed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    versions: Mapped[list["NarrativeVersion"]] = relationship("NarrativeVersion", back_populates="narrative", cascade="all, delete-orphan", foreign_keys="NarrativeVersion.narrative_id")
    analyses: Mapped[list["NarrativeAnalysis"]] = relationship("NarrativeAnalysis", back_populates="narrative", cascade="all, delete-orphan", foreign_keys="NarrativeAnalysis.narrative_id")
    interview_loop_insights: Mapped[list["NarrativeInterviewLoopInsight"]] = relationship(
        "NarrativeInterviewLoopInsight",
        back_populates="narrative",
        cascade="all, delete-orphan",
        foreign_keys="NarrativeInterviewLoopInsight.narrative_id",
    )


class NarrativeVersion(Base):
    """Immutable version of a narrative document"""
    __tablename__ = "narrative_versions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    narrative_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("narratives.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Version number (sequential)
    version_number: Mapped[int] = mapped_column(nullable=False)
    
    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_plain: Mapped[str | None] = mapped_column(Text, nullable=True)  # Plain text for analysis
    word_count: Mapped[int] = mapped_column(default=0, nullable=False)
    
    # Change description
    change_summary: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Analysis results at this version
    clarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    coherence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    authenticity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Analysis ID reference
    analysis_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("narrative_analyses.id", ondelete="SET NULL"), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationship
    narrative: Mapped["Narrative"] = relationship("Narrative", back_populates="versions", foreign_keys=[narrative_id])
    analysis: Mapped["NarrativeAnalysis"] = relationship("NarrativeAnalysis", back_populates="version", foreign_keys="NarrativeAnalysis.version_id")
    
    __table_args__ = (
        # Ensure version numbers are unique per narrative
        {'sqlite_autoincrement': True},
    )


class NarrativeAnalysis(Base):
    """AI analysis of a narrative version"""
    __tablename__ = "narrative_analyses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    narrative_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("narratives.id", ondelete="CASCADE"), nullable=False, index=True)
    version_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("narrative_versions.id", ondelete="CASCADE"), nullable=True)
    
    # Scores (0-100)
    clarity_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    coherence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    alignment_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # Alignment with route/purpose
    authenticity_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cultural_fit_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # For target country
    
    # Cliché and risk detection
    cliche_density_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    authenticity_risk: Mapped[str] = mapped_column(String(20), default="low", nullable=False)  # low, medium, high
    
    # Overall score (weighted composite)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    # Structured feedback
    key_strengths: Mapped[list] = mapped_column(JSON, default=list)
    improvement_actions: Mapped[list] = mapped_column(JSON, default=list)
    suggested_edits: Mapped[list] = mapped_column(JSON, default=list)  # Specific text suggestions
    
    # AI metadata
    ai_model: Mapped[str | None] = mapped_column(String(50), nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String(20), nullable=True)
    token_usage: Mapped[int | None] = mapped_column(nullable=True)
    processing_time_ms: Mapped[int | None] = mapped_column(nullable=True)
    
    # Raw AI output (for debugging/reproducibility)
    raw_ai_output: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    narrative: Mapped["Narrative"] = relationship("Narrative", back_populates="analyses", foreign_keys=[narrative_id])
    version: Mapped["NarrativeVersion"] = relationship("NarrativeVersion", back_populates="analysis", foreign_keys=[version_id])


class NarrativeInterviewLoopInsight(Base):
    """Persisted calibration summary between a narrative and related interview sessions"""
    __tablename__ = "narrative_interview_loop_insights"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    narrative_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("narratives.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    route_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("routes.id", ondelete="SET NULL"), nullable=True, index=True)
    latest_session_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("interview_sessions.id", ondelete="SET NULL"), nullable=True)

    linked_session_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_session_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    alignment_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    evidence_coverage_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    average_answer_duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)

    strongest_signals: Mapped[list] = mapped_column(JSON, default=list)
    focus_areas: Mapped[list] = mapped_column(JSON, default=list)
    summary: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    narrative: Mapped["Narrative"] = relationship(
        "Narrative",
        back_populates="interview_loop_insights",
        foreign_keys=[narrative_id],
    )
