import uuid
import enum
from datetime import datetime

from sqlalchemy import DateTime, String, Boolean, Integer, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RouteType(str, enum.Enum):
    SCHOLARSHIP = "scholarship"
    JOB_RELOCATON = "job_relocation"
    RESEARCH = "research"
    STARTUP_VISA = "startup_visa"
    EXCHANGE = "exchange"
    DIGITAL_NOMAD = "digital_nomad"
    INVESTOR_VISA = "investor_visa"


class RouteStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"
    ON_HOLD = "on_hold"


class MilestoneStatus(str, enum.Enum):
    LOCKED = "locked"
    AVAILABLE = "available"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class MilestoneCategory(str, enum.Enum):
    DOCUMENTATION = "documentation"
    FINANCE = "finance"
    LANGUAGE = "language"
    APPLICATION = "application"
    PREPARATION = "preparation"
    VISA = "visa"
    LOGISTICS = "logistics"


class RouteTemplate(Base):
    __tablename__ = "route_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Template info
    route_type: Mapped[RouteType] = mapped_column(Enum(RouteType, values_callable=lambda x: [e.value for e in x]), unique=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    name_pt: Mapped[str] = mapped_column(String(200), nullable=False)
    name_es: Mapped[str] = mapped_column(String(200), nullable=False)
    
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_pt: Mapped[str] = mapped_column(Text, nullable=False)
    description_es: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Metadata
    estimated_duration_months: Mapped[int] = mapped_column(Integer, default=6)
    competitiveness_level: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high
    typical_cost_usd: Mapped[int] = mapped_column(Integer, default=0)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", onupdate="now()")


class RouteMilestoneTemplate(Base):
    __tablename__ = "route_milestone_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    route_template_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("route_templates.id", ondelete="CASCADE"), nullable=False)
    
    # Milestone info
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    name_pt: Mapped[str] = mapped_column(String(200), nullable=False)
    name_es: Mapped[str] = mapped_column(String(200), nullable=False)
    
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_pt: Mapped[str] = mapped_column(Text, nullable=False)
    description_es: Mapped[str] = mapped_column(Text, nullable=False)
    
    category: Mapped[MilestoneCategory] = mapped_column(Enum(MilestoneCategory, values_callable=lambda x: [e.value for e in x]), nullable=False)
    
    # Order and timing
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    estimated_days: Mapped[int] = mapped_column(Integer, default=30)
    
    # Dependencies (prerequisite milestone IDs)
    prerequisites: Mapped[list] = mapped_column(JSON, default=list)
    
    # Evidence required
    required_evidence: Mapped[list] = mapped_column(JSON, default=list)  # List of evidence types
    
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    template_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("route_templates.id"), nullable=False)
    
    # Route info
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    target_country: Mapped[str] = mapped_column(String(100), nullable=True)
    target_organization: Mapped[str] = mapped_column(String(200), nullable=True)
    target_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Status
    status: Mapped[RouteStatus] = mapped_column(Enum(RouteStatus, values_callable=lambda x: [e.value for e in x]), default=RouteStatus.DRAFT, nullable=False)
    
    # Progress tracking
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    milestones_completed: Mapped[int] = mapped_column(Integer, default=0)
    total_milestones: Mapped[int] = mapped_column(Integer, default=0)
    
    # Computed fields
    readiness_score: Mapped[float] = mapped_column(default=0.0)
    risk_level: Mapped[str] = mapped_column(String(20), default="low")  # low, medium, high
    
    # Notes
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", onupdate="now()")


class RouteMilestone(Base):
    __tablename__ = "route_milestones"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    route_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    template_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("route_milestone_templates.id"), nullable=False)
    
    # Status
    status: Mapped[MilestoneStatus] = mapped_column(Enum(MilestoneStatus, values_callable=lambda x: [e.value for e in x]), default=MilestoneStatus.LOCKED, nullable=False)
    
    # Progress
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    
    # Evidence
    evidence_submitted: Mapped[list] = mapped_column(JSON, default=list)
    evidence_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Notes
    user_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    completion_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timing
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", onupdate="now()")
