"""
Document models for Narrative Forge feature
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base
import enum


class DocumentType(str, enum.Enum):
    """Document types"""
    ESSAY = "essay"
    COVER_LETTER = "cover_letter"
    PERSONAL_STATEMENT = "personal_statement"
    MOTIVATION_LETTER = "motivation_letter"
    RESUME = "resume"
    OTHER = "other"


class DocumentStatus(str, enum.Enum):
    """Document status"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    POLISHED = "polished"
    FINAL = "final"
    SUBMITTED = "submitted"


class PolishStatus(str, enum.Enum):
    """AI polish status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Document(Base):
    """Main document model for Narrative Forge"""
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Document metadata
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(SQLEnum(DocumentType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    status: Mapped[DocumentStatus] = mapped_column(SQLEnum(DocumentStatus, values_callable=lambda x: [e.value for e in x]), default=DocumentStatus.DRAFT)
    
    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Character limits
    target_character_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    min_character_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_character_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_character_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Word counts
    target_word_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_word_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # ATS Analysis
    ats_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ats_keywords: Mapped[list] = mapped_column(JSON, default=list)
    ats_suggestions: Mapped[list] = mapped_column(JSON, default=list)
    
    # AI Polish tracking
    polish_count: Mapped[int] = mapped_column(Integer, default=0)
    last_polished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Version control
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_latest_version: Mapped[bool] = mapped_column(Boolean, default=True)
    parent_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    
    # Metadata
    tags: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Focus mode tracking
    focus_mode_time_seconds: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_edited_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    polish_requests: Mapped[list["PolishRequest"]] = relationship("PolishRequest", back_populates="document", cascade="all, delete-orphan")
    versions: Mapped[list["Document"]] = relationship("Document", remote_side=[parent_version_id])


class PolishRequest(Base):
    """AI polish request tracking"""
    __tablename__ = "polish_requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Request details
    status: Mapped[PolishStatus] = mapped_column(SQLEnum(PolishStatus, values_callable=lambda x: [e.value for e in x]), default=PolishStatus.PENDING)
    
    # Input
    original_content: Mapped[str] = mapped_column(Text, nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Output
    polished_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    suggestions: Mapped[list] = mapped_column(JSON, default=list)
    changes_made: Mapped[list] = mapped_column(JSON, default=list)
    
    # AI metadata
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    processing_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # User feedback
    user_accepted: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    user_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5
    user_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Error tracking
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="polish_requests")


class DocumentTemplate(Base):
    """Document templates for quick start"""
    __tablename__ = "document_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    
    # Template metadata
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(SQLEnum(DocumentType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    
    # Template content
    content_template: Mapped[str] = mapped_column(Text, nullable=False)
    placeholder_instructions: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Constraints
    recommended_character_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    recommended_word_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Metadata
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
