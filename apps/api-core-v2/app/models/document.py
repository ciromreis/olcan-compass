"""
Document Models

Represents career documents (resumes, cover letters, portfolios, etc.)
that users create with their companions.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

try:
    from app.core.database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


class DocumentType(str, enum.Enum):
    """Types of career documents"""
    RESUME = "resume"
    COVER_LETTER = "cover_letter"
    PORTFOLIO = "portfolio"
    LINKEDIN_PROFILE = "linkedin_profile"
    PERSONAL_STATEMENT = "personal_statement"
    CAREER_SUMMARY = "career_summary"


class DocumentStatus(str, enum.Enum):
    """Document lifecycle status"""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Document(Base):
    """Career document created by user with companion assistance"""
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    companion_id = Column(String, ForeignKey("companions.id"), nullable=True)
    
    # Document metadata
    title = Column(String, nullable=False)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.DRAFT)
    
    # Content
    content = Column(JSON, nullable=False)  # Structured document content
    raw_text = Column(Text, nullable=True)  # Plain text version for search
    
    # Template and styling
    template_id = Column(String, nullable=True)
    style_config = Column(JSON, nullable=True)  # Colors, fonts, layout
    
    # Versioning
    version = Column(Integer, default=1)
    parent_document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    
    # AI assistance tracking
    ai_suggestions_count = Column(Integer, default=0)
    companion_contribution_score = Column(Integer, default=0)  # 0-100
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    companion = relationship("Companion", back_populates="documents")
    versions = relationship("Document", remote_side=[id], backref="parent")
    reviews = relationship("DocumentReview", back_populates="document", cascade="all, delete-orphan")


class DocumentTemplate(Base):
    """Reusable document templates"""
    __tablename__ = "document_templates"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    
    # Template content
    structure = Column(JSON, nullable=False)  # Section definitions
    default_style = Column(JSON, nullable=True)
    
    # Metadata
    is_premium = Column(Integer, default=0)  # 0 = free, 1 = premium
    difficulty_level = Column(String, nullable=True)  # beginner, intermediate, advanced
    industry_tags = Column(JSON, nullable=True)  # ["tech", "finance", etc.]
    
    # Usage stats
    usage_count = Column(Integer, default=0)
    rating = Column(Integer, default=0)  # Average rating * 10 (e.g., 45 = 4.5 stars)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DocumentReview(Base):
    """AI or companion review of a document"""
    __tablename__ = "document_reviews"

    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    companion_id = Column(String, ForeignKey("companions.id"), nullable=True)
    
    # Review content
    overall_score = Column(Integer, nullable=False)  # 0-100
    strengths = Column(JSON, nullable=True)  # List of strength points
    improvements = Column(JSON, nullable=True)  # List of improvement suggestions
    detailed_feedback = Column(Text, nullable=True)
    
    # Section-specific scores
    section_scores = Column(JSON, nullable=True)  # {"summary": 85, "experience": 90, ...}
    
    # Review metadata
    review_type = Column(String, default="companion")  # companion, ai, peer
    is_automated = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="reviews")
    companion = relationship("Companion")
