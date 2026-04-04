"""Readiness Engine and Sprint Management Models"""

import uuid
import enum
from datetime import datetime, timezone, date

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Float, Integer, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SprintStatus(str, enum.Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class SprintTaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class SprintTaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SprintTemplate(Base):
    """Reusable sprint templates for different readiness gaps"""
    __tablename__ = "sprint_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # What gap does this sprint address?
    target_gap_category: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "language", "documentation", "financial"
    target_readiness_threshold: Mapped[float] = mapped_column(Float, default=0.0)  # Minimum readiness to trigger this
    
    # Sprint characteristics
    duration_days: Mapped[int] = mapped_column(Integer, default=14)
    estimated_effort_hours: Mapped[int] = mapped_column(Integer, default=20)
    
    # Template content
    default_tasks: Mapped[list] = mapped_column(JSON, default=list)  # List of task templates
    suggested_resources: Mapped[list] = mapped_column(JSON, default=list)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class UserSprint(Base):
    """User's active or completed sprints"""
    __tablename__ = "user_sprints"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    route_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("routes.id", ondelete="SET NULL"), nullable=True, index=True)
    template_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sprint_templates.id", ondelete="SET NULL"), nullable=True)
    
    # Sprint info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Target gap this sprint addresses
    gap_category: Mapped[str] = mapped_column(String(50), nullable=False)
    gap_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Status and timing
    status: Mapped[SprintStatus] = mapped_column(Enum(SprintStatus, values_callable=lambda x: [e.value for e in x]), default=SprintStatus.PLANNED, nullable=False)
    
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    target_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Progress
    total_tasks: Mapped[int] = mapped_column(Integer, default=0)
    completed_tasks: Mapped[int] = mapped_column(Integer, default=0)
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    
    # Effort tracking
    estimated_effort_hours: Mapped[int] = mapped_column(Integer, default=0)
    actual_effort_hours: Mapped[int] = mapped_column(Integer, default=0)
    
    # AI-generated guidance
    ai_guidance: Mapped[str | None] = mapped_column(Text, nullable=True)
    personalized_tips: Mapped[list] = mapped_column(JSON, default=list)
    
    # Connection to milestones
    linked_milestone_ids: Mapped[list] = mapped_column(JSON, default=list)  # Route milestone IDs this sprint helps complete
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class SprintTask(Base):
    """Individual tasks within a sprint"""
    __tablename__ = "sprint_tasks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    sprint_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_sprints.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Task info
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Task categorization
    task_type: Mapped[str] = mapped_column(String(50), default="action")  # action, document, meeting, review
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # documentation, language, finance, etc.
    
    # Status and priority
    status: Mapped[SprintTaskStatus] = mapped_column(Enum(SprintTaskStatus, values_callable=lambda x: [e.value for e in x]), default=SprintTaskStatus.TODO, nullable=False)
    priority: Mapped[SprintTaskPriority] = mapped_column(Enum(SprintTaskPriority, values_callable=lambda x: [e.value for e in x]), default=SprintTaskPriority.MEDIUM, nullable=False)
    
    # Timing
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Dependencies (other task IDs that must be completed first)
    prerequisite_task_ids: Mapped[list] = mapped_column(JSON, default=list)
    
    # Linked entities
    linked_milestone_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("route_milestones.id", ondelete="SET NULL"), nullable=True)
    linked_narrative_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("narratives.id", ondelete="SET NULL"), nullable=True)
    linked_application_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user_applications.id", ondelete="SET NULL"), nullable=True)
    
    # Resources and links
    external_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resource_links: Mapped[list] = mapped_column(JSON, default=list)
    
    # Notes
    user_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    completion_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Order within sprint
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class ReadinessAssessment(Base):
    """User's overall readiness for a specific route or generally"""
    __tablename__ = "readiness_assessments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    route_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Overall scores (0-100)
    overall_readiness: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    documentation_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    financial_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    language_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    experience_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    # Gap analysis
    gaps_identified: Mapped[list] = mapped_column(JSON, default=list)  # [{"category": "language", "severity": "high", "description": "..."}]
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    
    # Assessment metadata
    assessment_type: Mapped[str] = mapped_column(String(50), default="self_assessment")  # self_assessment, ai_analysis, provider_review
    ai_model_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Recommended sprints (AI-generated)
    recommended_sprint_template_ids: Mapped[list] = mapped_column(JSON, default=list)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Store the latest assessment per user/route
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class GapAnalysis(Base):
    """Detailed gap analysis for a user-route combination"""
    __tablename__ = "gap_analyses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    route_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Gap details by category
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # documentation, language, finance, etc.
    severity: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high, critical
    
    # What's missing
    missing_items: Mapped[list] = mapped_column(JSON, default=list)
    missing_document_types: Mapped[list] = mapped_column(JSON, default=list)
    
    # Requirements vs reality
    required_level: Mapped[str | None] = mapped_column(String(100), nullable=True)
    current_level: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Resolution
    blocking: Mapped[bool] = mapped_column(Boolean, default=False)
    estimated_resolution_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    suggested_sprint_template_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sprint_templates.id", ondelete="SET NULL"), nullable=True)
    
    # Status
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_by_sprint_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("user_sprints.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class SprintActivityLog(Base):
    """Activity log for sprint task changes"""
    __tablename__ = "sprint_activity_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    sprint_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_sprints.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sprint_tasks.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Activity details
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # task_created, task_completed, task_updated, sprint_started, etc.
    previous_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    new_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
