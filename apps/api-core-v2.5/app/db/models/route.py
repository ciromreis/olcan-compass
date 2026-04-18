import uuid
import enum
from datetime import datetime

from sqlalchemy import DateTime, String, Boolean, Integer, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RouteCategory(str, enum.Enum):
    """High-level route categories - replaces hardcoded RouteType"""
    EMPLOYMENT = "employment"  # Jobs, relocations, career changes
    EDUCATION = "education"  # Scholarships, research, exchange
    ENTREPRENEURSHIP = "entrepreneurship"  # Startup visas, business
    LIFESTYLE = "lifestyle"  # Digital nomad, retirement, investment
    HUMANITARIAN = "humanitarian"  # NGO, public service, impact


class RouteType(str, enum.Enum):
    """Legacy route types - kept for backward compatibility
    
    DEPRECATED: Use RouteCategory + RouteBuilder for new routes
    """
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

    # Relationships
    user = relationship("User", back_populates="routes")
    milestones = relationship("RouteMilestone", back_populates="route", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="route")


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

    # Relationships
    route = relationship("Route", back_populates="milestones")



class RouteBuilder(Base):
    """Dynamic route builder - creates custom journeys based on user context
    
    Replaces hardcoded RouteType with flexible, composable journeys.
    Integrates with archetype system for personalization.
    """
    __tablename__ = "route_builders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Core Components
    category: Mapped[RouteCategory] = mapped_column(
        Enum(RouteCategory, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True
    )
    
    # Archetype Integration (from psychology.py)
    archetype: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # References ProfessionalArchetype enum value
    
    # Target Outcome (flexible, not enum)
    target_outcome: Mapped[str] = mapped_column(String(300), nullable=False)
    # Examples: "Software Engineer at FAANG", "PhD in AI", "Digital Nomad Visa Portugal"
    
    target_location: Mapped[str] = mapped_column(String(200), nullable=False)
    # Examples: "USA", "Germany", "Portugal", "Remote", "Multiple"
    
    target_organization: Mapped[str | None] = mapped_column(String(300), nullable=True)
    # Examples: "Google", "MIT", "EU Commission", null
    
    # Context (JSON) - captures user's current situation
    current_situation: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {
    #     "location": "Brazil",
    #     "role": "Senior Developer",
    #     "experience_years": 5,
    #     "education": "Bachelor CS",
    #     "languages": ["Portuguese", "English"],
    #     "budget_usd": 10000,
    #     "family_status": "single",
    #     "remote_work_experience": true
    # }
    
    # Constraints
    timeline_months: Mapped[int] = mapped_column(Integer, default=12, nullable=False)
    budget_usd: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    visa_requirements: Mapped[list] = mapped_column(JSON, default=list)
    language_requirements: Mapped[list] = mapped_column(JSON, default=list)
    
    # Generated Route Configuration (JSON) - computed by MilestoneGenerator
    route_config: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {
    #     "milestones": [...],  # Dynamically generated
    #     "documents_needed": ["resume", "cover_letter", "portfolio"],
    #     "estimated_timeline": {"preparation": 2, "application": 3, "interview": 2},
    #     "risk_factors": ["competitive_market", "visa_complexity"],
    #     "success_probability": 0.75,
    #     "recommended_services": ["resume_review", "interview_prep"]
    # }
    
    # ATS Integration (for employment routes)
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    ats_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Populated if category == EMPLOYMENT
    
    # Archetype Adaptation (JSON) - personalization based on archetype
    personalization: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {
    #     "narrative_adjustments": ["emphasize_autonomy", "highlight_remote_work"],
    #     "companion_messages": [...],
    #     "motivation_triggers": ["freedom_milestone", "visa_progress"],
    #     "document_tone": "assertive_and_independent"
    # }
    
    # Status
    status: Mapped[RouteStatus] = mapped_column(
        Enum(RouteStatus, values_callable=lambda x: [e.value for e in x]),
        default=RouteStatus.DRAFT,
        nullable=False
    )
    
    # Progress
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_milestone_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Metadata
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Timestamps
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", onupdate="now()")


class DynamicMilestone(Base):
    """Dynamic milestones generated by RouteBuilder
    
    Unlike RouteMilestone (template-based), these are generated on-the-fly
    based on user context, archetype, and route goals.
    """
    __tablename__ = "dynamic_milestones"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    route_builder_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("route_builders.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Milestone Details
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Order
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Category
    category: Mapped[MilestoneCategory] = mapped_column(
        Enum(MilestoneCategory, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    
    # Tasks (JSON) - specific actions to complete
    tasks: Mapped[list] = mapped_column(JSON, default=list)
    # Example: [
    #     {"name": "Upload resume", "completed": false, "action": "document_upload"},
    #     {"name": "AI analysis", "completed": false, "action": "ats_analysis"}
    # ]
    
    # Status
    status: Mapped[MilestoneStatus] = mapped_column(
        Enum(MilestoneStatus, values_callable=lambda x: [e.value for e in x]),
        default=MilestoneStatus.LOCKED,
        nullable=False
    )
    
    # Progress
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Archetype Integration
    archetype_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Personalized message from companion based on user's archetype
    
    companion_encouragement: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Archetype-specific encouragement
    
    # ATS Integration (if applicable)
    ats_integration: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ats_target_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Gamification
    xp_reward: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    companion_evolution_trigger: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Example: {"ability_unlock": "ATS Optimizer Level 1"}
    
    # Evidence
    evidence_required: Mapped[list] = mapped_column(JSON, default=list)
    evidence_submitted: Mapped[list] = mapped_column(JSON, default=list)
    
    # Timing
    estimated_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", onupdate="now()")
