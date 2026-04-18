import uuid
import enum
from datetime import datetime

from sqlalchemy import DateTime, String, Boolean, Enum, text, cast
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    USER = "user"
    PROVIDER = "provider"
    ORG_MEMBER = "org_member"
    ORG_COORDINATOR = "org_coordinator"
    ORG_ADMIN = "org_admin"
    SUPER_ADMIN = "super_admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    @property
    def plan(self) -> str:
        """Alias for subscription_plan — used by entitlements.py dependency functions."""
        return self.subscription_plan
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Auth & Roles
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, values_callable=lambda x: [e.value for e in x]), default=UserRole.USER, nullable=False)
    
    # Profile fields
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    
    # Security
    failed_login_attempts: Mapped[int] = mapped_column(default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Email verification
    verification_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_token_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Password reset
    password_reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    password_reset_token_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    password_reset_count: Mapped[int] = mapped_column(default=0, nullable=False)
    
    # Forge credits (AI polish usage)
    forge_credits: Mapped[int] = mapped_column(default=3, nullable=False)

    # Subscription
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    subscription_plan: Mapped[str] = mapped_column(String(20), default="free", nullable=False)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subscription_status: Mapped[str] = mapped_column(String(30), default="inactive", nullable=False)
    subscription_cancel_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Relationships ──────────────────────────────────────────────────────────
    # Lazy loading by default to avoid N+1 queries
    
    # Task system
    tasks = relationship("Task", back_populates="user", lazy="noload")
    progress = relationship("UserProgress", back_populates="user", uselist=False, lazy="noload")
    quests = relationship("UserQuest", back_populates="user", lazy="noload")
    
    # Psychology
    psych_profile = relationship("PsychProfile", back_populates="user", uselist=False, lazy="noload")
    
    # Routes
    routes = relationship("Route", back_populates="user", lazy="noload")
    
    # Narratives
    narratives = relationship("Narrative", back_populates="user", lazy="noload")
    
    # Interviews
    interview_sessions = relationship("InterviewSession", back_populates="user", lazy="noload")
    
    # Applications
    applications = relationship("UserApplication", back_populates="user", lazy="noload")
    opportunity_watchlists = relationship("OpportunityWatchlist", back_populates="user", lazy="noload")
    application_deadline_reminders = relationship("ApplicationDeadlineReminder", back_populates="user", lazy="noload")
    
    # Sprints
    sprints = relationship("UserSprint", back_populates="user", lazy="noload")
    sprint_activity_logs = relationship("SprintActivityLog", back_populates="user", lazy="noload")
    readiness_assessments = relationship("ReadinessAssessment", back_populates="user", lazy="noload")
    gap_analyses = relationship("GapAnalysis", back_populates="user", lazy="noload")
    
    # Documents
    documents = relationship("Document", back_populates="user", lazy="noload")
    
    # Marketplace
    provider_profile = relationship("ProviderProfile", foreign_keys="[ProviderProfile.user_id]", back_populates="user", uselist=False, lazy="noload")
    bookings_as_client = relationship("Booking", foreign_keys="[Booking.client_id]", back_populates="client", lazy="noload")
    reviews = relationship("Review", foreign_keys="[Review.client_id]", back_populates="client", lazy="noload")
    
    # Economics
    verification_credentials = relationship("VerificationCredential", back_populates="user", lazy="noload")
    escrow_transactions = relationship("EscrowTransaction", foreign_keys="[EscrowTransaction.client_id]", back_populates="client", lazy="noload")
    scenario_simulations = relationship("ScenarioSimulation", back_populates="user", lazy="noload")
    opportunity_cost_widget_events = relationship("OpportunityCostWidgetEvent", back_populates="user", lazy="noload")
    
    # Constraints
    constraint_profile = relationship("UserConstraintProfile", back_populates="user", uselist=False, lazy="noload")
    opportunity_pruning_logs = relationship("OpportunityPruningLog", back_populates="user", lazy="noload")
    constraint_feedbacks = relationship("ConstraintFeedback", back_populates="user", lazy="noload")
    
    # Organization
    organization_memberships = relationship("OrganizationMember", back_populates="user", lazy="noload")
    
    # Companion
    companion = relationship("Companion", back_populates="user", uselist=False, lazy="noload")
    
    # Social
    user_posts = relationship("UserPost", back_populates="user", lazy="noload")
    post_likes = relationship("PostLike", back_populates="user", lazy="noload")
    post_comments = relationship("PostComment", back_populates="user", lazy="noload")
    
    # Billing
    forge_usage_logs = relationship("ForgeUsageLog", back_populates="user", lazy="noload")
    credit_purchases = relationship("CreditPurchase", back_populates="user", lazy="noload")
    
    # Prompt
    prompt_execution_logs = relationship("PromptExecutionLog", back_populates="user", lazy="noload")
    ai_job_queue = relationship("AIJobQueue", back_populates="user", lazy="noload")
    
    # Guild
    guild_memberships = relationship("GuildMember", back_populates="user", lazy="noload")
    
    # Recruitment
    job_routes = relationship("JobRoute", back_populates="user", lazy="noload")
    recruitment_documents = relationship("RecruitmentDocument", back_populates="user", lazy="noload")
    recruitment_activities = relationship("RecruitmentActivity", back_populates="user", lazy="noload")
