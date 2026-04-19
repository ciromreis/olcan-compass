"""
Enhanced Document Forge System Models

Models for multi-process management, document variations, enhanced tasks,
and technical reporting in the Olcan Compass v2.5 Enhanced Document Forge.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum
import uuid

try:
    from app.core.database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


# ============================================================
# Enums
# ============================================================

class ProcessStatus(str, enum.Enum):
    """Process lifecycle status"""
    DRAFT = "draft"
    ACTIVE = "active"
    FINALIZING = "finalizing"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class DocumentVariationType(str, enum.Enum):
    """Document variation types"""
    SHARED = "shared"
    PROCESS_SPECIFIC = "process_specific"


class DocumentVariationStatus(str, enum.Enum):
    """Document variation status"""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    FINAL = "final"
    SUBMITTED = "submitted"


class ProcessTaskStatus(str, enum.Enum):
    """Process task status"""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"


class TaskPriority(str, enum.Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ExportType(str, enum.Enum):
    """Export types"""
    DOCUMENT = "document"
    DOSSIER = "dossier"
    TECHNICAL_REPORT = "technical_report"


class ExportFormat(str, enum.Enum):
    """Export formats"""
    PDF = "pdf"
    DOCX = "docx"
    MARKDOWN = "markdown"
    HTML = "html"
    ZIP = "zip"


class ExportStatus(str, enum.Enum):
    """Export job status"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================================
# Core Models
# ============================================================

class Process(Base):
    """Multi-process management for parallel applications"""
    __tablename__ = "processes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Process metadata
    title = Column(String(255), nullable=False)
    process_type = Column(String(100), nullable=False)  # scholarship, university, visa, job
    target_institution = Column(String(255), nullable=True)
    target_organization = Column(String(255), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    priority_level = Column(String(20), nullable=False, default="medium")
    status = Column(SQLEnum(ProcessStatus), nullable=False, default=ProcessStatus.DRAFT)
    
    # Progress tracking
    readiness_score = Column(Float, nullable=False, default=0.0)
    target_readiness = Column(Float, nullable=False, default=90.0)
    momentum_score = Column(Float, nullable=False, default=0.0)
    
    # Structured data
    process_metadata = Column(JSON, nullable=False, default={})
    requirements_context = Column(JSON, nullable=False, default={})
    timeline_data = Column(JSON, nullable=False, default={})
    
    # User preferences
    is_favorite = Column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="noload")
    dossiers = relationship("Dossier", back_populates="process", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="process", cascade="all, delete-orphan")
    document_variations = relationship("DocumentVariation", back_populates="process", cascade="all, delete-orphan")
    tasks = relationship("ProcessTask", back_populates="process", cascade="all, delete-orphan")
    technical_reports = relationship("TechnicalReport", back_populates="process", cascade="all, delete-orphan")
    export_jobs = relationship("ExportJob", back_populates="process", cascade="all, delete-orphan")
    events = relationship("ProcessEvent", back_populates="process", cascade="all, delete-orphan")


class DocumentVariation(Base):
    """Document variation management for shared vs process-specific content"""
    __tablename__ = "document_variations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    base_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Variation metadata
    title = Column(String(255), nullable=False)
    variation_type = Column(SQLEnum(DocumentVariationType), nullable=False)
    
    # Content management
    content = Column(Text, nullable=False)
    content_sections = Column(JSON, nullable=False, default={})
    shared_sections = Column(JSON, nullable=False, default=[])
    customized_sections = Column(JSON, nullable=False, default=[])
    
    # Version control
    version = Column(Integer, nullable=False, default=1)
    status = Column(SQLEnum(DocumentVariationStatus), nullable=False, default=DocumentVariationStatus.DRAFT)
    
    # AI analysis scores
    ats_score = Column(Float, nullable=True)
    authenticity_score = Column(Float, nullable=True)
    cultural_fit_score = Column(Float, nullable=True)
    
    # Metadata
    variation_metadata = Column(JSON, nullable=False, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    base_document = relationship("Document", foreign_keys=[base_document_id], lazy="noload")
    process = relationship("Process", back_populates="document_variations")
    user = relationship("User", foreign_keys=[user_id], lazy="noload")


class ProcessTask(Base):
    """Enhanced task management for processes"""
    __tablename__ = "process_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Task metadata
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(50), nullable=False, default="custom")
    category = Column(String(50), nullable=False, default="general")
    priority = Column(SQLEnum(TaskPriority), nullable=False, default=TaskPriority.MEDIUM)
    status = Column(SQLEnum(ProcessTaskStatus), nullable=False, default=ProcessTaskStatus.TODO)
    
    # Gamification
    xp_reward = Column(Integer, nullable=False, default=10)
    
    # Time tracking
    estimated_hours = Column(Integer, nullable=True)
    actual_hours = Column(Integer, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    
    # Dependencies
    blocking_task_id = Column(UUID(as_uuid=True), ForeignKey("process_tasks.id", ondelete="SET NULL"), nullable=True)
    
    # Template integration
    template_task_id = Column(String(100), nullable=True)
    
    # Metadata
    task_metadata = Column(JSON, nullable=False, default={})
    completion_notes = Column(Text, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    process = relationship("Process", back_populates="tasks")
    user = relationship("User", foreign_keys=[user_id], lazy="noload")
    blocking_task = relationship("ProcessTask", remote_side=[id])
    blocked_tasks = relationship("ProcessTask", remote_side=[blocking_task_id])


class ProcessTemplate(Base):
    """Process templates for intelligent task generation"""
    __tablename__ = "process_templates"

    id = Column(String(100), primary_key=True)  # e.g., "chevening-scholarship"
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    process_type = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    difficulty_level = Column(String(20), nullable=False, default="medium")
    estimated_duration_days = Column(Integer, nullable=True)
    
    # Template data
    template_data = Column(JSON, nullable=False, default={})
    task_templates = Column(JSON, nullable=False, default=[])
    document_requirements = Column(JSON, nullable=False, default=[])
    milestones = Column(JSON, nullable=False, default=[])
    success_metrics = Column(JSON, nullable=False, default={})
    
    # Usage tracking
    is_active = Column(Boolean, nullable=False, default=True)
    usage_count = Column(Integer, nullable=False, default=0)
    success_rate = Column(Float, nullable=False, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class TechnicalReport(Base):
    """Technical report generation for processes"""
    __tablename__ = "technical_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Report metadata
    report_type = Column(String(50), nullable=False, default="standard")
    title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=True)
    
    # Report content
    content_sections = Column(JSON, nullable=False, default={})
    metrics_data = Column(JSON, nullable=False, default={})
    timeline_data = Column(JSON, nullable=False, default={})
    recommendations = Column(JSON, nullable=False, default=[])
    
    # Export options
    export_formats = Column(JSON, nullable=False, default=["pdf", "html"])
    
    # Date range
    date_range_start = Column(DateTime(timezone=True), nullable=True)
    date_range_end = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    generated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    process = relationship("Process", back_populates="technical_reports")
    user = relationship("User", foreign_keys=[user_id], lazy="noload")


class ExportJob(Base):
    """Export job management for documents and reports"""
    __tablename__ = "export_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id", ondelete="CASCADE"), nullable=True)
    
    # Export configuration
    export_type = Column(SQLEnum(ExportType), nullable=False)
    format = Column(SQLEnum(ExportFormat), nullable=False)
    branding_enabled = Column(Boolean, nullable=False, default=True)
    
    # Job status
    status = Column(SQLEnum(ExportStatus), nullable=False, default=ExportStatus.QUEUED)
    file_path = Column(String(500), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    download_url = Column(String(500), nullable=True)
    
    # Configuration and progress
    export_options = Column(JSON, nullable=False, default={})
    error_message = Column(Text, nullable=True)
    progress_percentage = Column(Integer, nullable=False, default=0)
    
    # Lifecycle
    expires_at = Column(DateTime(timezone=True), nullable=True)
    downloaded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="noload")
    process = relationship("Process", back_populates="export_jobs")


class CMSFormData(Base):
    """CMS form data collection for user input"""
    __tablename__ = "cms_form_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Form metadata
    form_type = Column(String(100), nullable=False)
    form_version = Column(String(20), nullable=False, default="1.0")
    section_name = Column(String(100), nullable=False)
    
    # Form data
    field_data = Column(JSON, nullable=False, default={})
    completion_percentage = Column(Integer, nullable=False, default=0)
    
    # Validation
    is_validated = Column(Boolean, nullable=False, default=False)
    validation_errors = Column(JSON, nullable=False, default=[])
    
    # Auto-save
    last_auto_save = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="noload")


class ProcessEvent(Base):
    """Process activity tracking for analytics and gamification"""
    __tablename__ = "process_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Event metadata
    event_type = Column(String(50), nullable=False)  # task_completed, document_created, etc.
    event_category = Column(String(50), nullable=False)  # task, document, process, export
    event_data = Column(JSON, nullable=False, default={})
    
    # Gamification
    xp_awarded = Column(Integer, nullable=False, default=0)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    process = relationship("Process", back_populates="events")
    user = relationship("User", foreign_keys=[user_id], lazy="noload")


# ============================================================
# Extended Relationships
# ============================================================

# Add relationships to existing models (these would be added via migration or model updates)

# Document.process = relationship("Process", back_populates="documents")
# Dossier.process = relationship("Process", back_populates="dossiers")