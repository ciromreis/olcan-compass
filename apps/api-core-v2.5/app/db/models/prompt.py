"""Prompt Registry Models

Database-driven prompt templates with versioning and categorization.
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text, ForeignKey, JSON, Enum, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PromptTemplateStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class PromptCategory(str, enum.Enum):
    NARRATIVE_ANALYSIS = "narrative_analysis"
    NARRATIVE_GENERATION = "narrative_generation"
    INTERVIEW_FEEDBACK = "interview_feedback"
    INTERVIEW_QUESTION_GENERATION = "interview_question_generation"
    READINESS_ASSESSMENT = "readiness_assessment"
    GAP_ANALYSIS = "gap_analysis"
    SPRINT_GENERATION = "sprint_generation"
    OPPORTUNITY_MATCHING = "opportunity_matching"
    GENERAL = "general"


class PromptTemplate(Base):
    """Prompt templates with versioning support"""
    __tablename__ = "prompt_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Identification
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    # Routing info
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)  # internal identifier
    
    # Categorization
    category: Mapped[PromptCategory] = mapped_column(Enum(PromptCategory, values_callable=lambda x: [e.value for e in x]), default=PromptCategory.GENERAL, nullable=False, index=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    
    # Versioning
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    parent_version_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("prompt_templates.id", ondelete="SET NULL"), nullable=True)
    
    # The prompt content
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)  # System message
    user_prompt_template: Mapped[str] = mapped_column(Text, nullable=False)  # Template with {variables}
    
    # Response configuration
    response_schema: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # JSON schema for structured output
    expected_response_format: Mapped[str] = mapped_column(String(50), default="json")  # json, text, markdown
    
    # AI configuration
    default_model: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g., "gpt-4", "claude-3-opus"
    default_temperature: Mapped[float] = mapped_column(default=0.7, nullable=False)
    max_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Variables that can be substituted
    variables: Mapped[list] = mapped_column(JSON, default=list)  # [{"name": "narrative_text", "type": "string", "required": true}]
    
    # Lifecycle
    status: Mapped[PromptTemplateStatus] = mapped_column(Enum(PromptTemplateStatus, values_callable=lambda x: [e.value for e in x]), default=PromptTemplateStatus.DRAFT, nullable=False)
    usage_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    success_rate: Mapped[float] = mapped_column(default=1.0, nullable=False)
    
    # Content moderation
    content_warning: Mapped[str | None] = mapped_column(Text, nullable=True)  # Warning about sensitive content
    requires_review: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class PromptExecutionLog(Base):
    """Log of prompt executions for monitoring and optimization"""
    __tablename__ = "prompt_execution_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # References
    template_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("prompt_templates.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Context
    related_entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # narrative, interview, etc.
    related_entity_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    
    # Execution details
    input_variables: Mapped[dict] = mapped_column(JSON, default=dict)  # What variables were passed
    rendered_prompt: Mapped[str] = mapped_column(Text, nullable=False)  # Final prompt after variable substitution
    
    # Response
    response_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, success, error, timeout
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Performance
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    prompt_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completion_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Model used
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    provider_used: Mapped[str] = mapped_column(String(50), default="simulation")
    
    # User feedback on quality
    user_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1-5 rating
    user_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="prompt_execution_logs")


class AIJobQueue(Base):
    """Background job queue for AI processing tasks"""
    __tablename__ = "ai_job_queue"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Job identification
    job_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # narrative_analysis, interview_feedback, etc.
    priority: Mapped[int] = mapped_column(Integer, default=5, nullable=False)  # 1-10, lower is higher priority
    
    # What to process
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # narrative, interview, etc.
    entity_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Processing configuration
    prompt_template_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("prompt_templates.id", ondelete="SET NULL"), nullable=True)
    custom_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Job state
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False, index=True)  # pending, processing, completed, failed, cancelled
    
    # Results
    result_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    
    # Scheduling
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Worker tracking
    worker_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="ai_job_queue")
