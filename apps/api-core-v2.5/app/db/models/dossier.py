"""
Dossier system models for application packages (v2.5)
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
import enum


class DossierStatus(str, enum.Enum):
    """Dossier lifecycle status"""
    DRAFT = "draft"
    ACTIVE = "active"
    FINALIZING = "finalizing"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class DossierDocumentStatus(str, enum.Enum):
    """Document status within a dossier"""
    EMPTY = "empty"
    DRAFT = "draft"
    REVIEW = "review"
    POLISHED = "polished"
    FINAL = "final"


class DossierTaskStatus(str, enum.Enum):
    """Task status within a dossier"""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"


class Dossier(Base):
    """
    Dossier represents a complete application package for a specific opportunity.
    It aggregates documents, tasks, and readiness evaluations.
    """
    __tablename__ = "dossiers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Core metadata
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[DossierStatus] = mapped_column(
        SQLEnum(DossierStatus, values_callable=lambda x: [e.value for e in x]), 
        default=DossierStatus.DRAFT,
        nullable=False
    )
    
    # Target opportunity reference (can be an internal Opportunity ID or external info)
    opportunity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("opportunities.id", ondelete="SET NULL"), 
        nullable=True, 
        index=True
    )
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Structured data snapshots
    profile_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    opportunity_context: Mapped[dict] = mapped_column(JSON, default=dict)
    readiness_evaluation: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Settings and progress
    target_readiness: Mapped[float] = mapped_column(Float, default=90.0)
    current_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User")
    opportunity = relationship("Opportunity")
    documents: Mapped[List["DossierDocument"]] = relationship("DossierDocument", back_populates="dossier", cascade="all, delete-orphan")
    tasks: Mapped[List["DossierTask"]] = relationship("DossierTask", back_populates="dossier", cascade="all, delete-orphan")


class DossierDocument(Base):
    """
    A specific document belonging to a dossier (e.g., CV, Motivation Letter).
    """
    __tablename__ = "dossier_documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    dossier_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Document info
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # cv, motivation_letter, etc.
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="", nullable=False)
    
    # Status and metrics
    status: Mapped[DossierDocumentStatus] = mapped_column(
        SQLEnum(DossierDocumentStatus, values_callable=lambda x: [e.value for e in x]), 
        default=DossierDocumentStatus.EMPTY,
        nullable=False
    )
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Analysis data
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    ats_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Reference to original Forge document (if imported)
    original_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("documents.id", ondelete="SET NULL"), 
        nullable=True
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    dossier: Mapped["Dossier"] = relationship("Dossier", back_populates="documents")
    tasks: Mapped[List["DossierTask"]] = relationship("DossierTask", back_populates="document")


class DossierTask(Base):
    """
    Actionable task related to a dossier or a specific document in it.
    """
    __tablename__ = "dossier_tasks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    dossier_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("dossier_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Task details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(50), default="generic")  # writing, research, review, polish
    readiness_domain: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, default="logistical")  # academic, financial, logistical, risk
    
    # Status and priority
    status: Mapped[DossierTaskStatus] = mapped_column(
        SQLEnum(DossierTaskStatus, values_callable=lambda x: [e.value for e in x]), 
        default=DossierTaskStatus.TODO,
        nullable=False
    )
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # high, medium, low
    
    # Dates
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    dossier: Mapped["Dossier"] = relationship("Dossier", back_populates="tasks")
    document: Mapped[Optional["DossierDocument"]] = relationship("DossierDocument", back_populates="tasks")
