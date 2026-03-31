"""
Resource Models

Represents digital resources (templates, guides, courses) in the marketplace.
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


class ResourceType(str, enum.Enum):
    """Types of digital resources"""
    TEMPLATE = "template"
    GUIDE = "guide"
    COURSE = "course"
    EBOOK = "ebook"
    WORKSHEET = "worksheet"
    TOOLKIT = "toolkit"
    VIDEO = "video"
    AUDIO = "audio"


class ResourceCategory(str, enum.Enum):
    """Resource categories"""
    CAREER_DEVELOPMENT = "career_development"
    INTERVIEW_PREP = "interview_prep"
    RESUME_WRITING = "resume_writing"
    NETWORKING = "networking"
    LEADERSHIP = "leadership"
    TECHNICAL_SKILLS = "technical_skills"
    SOFT_SKILLS = "soft_skills"
    ENTREPRENEURSHIP = "entrepreneurship"


class ResourceStatus(str, enum.Enum):
    """Resource publication status"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Resource(Base):
    """Digital resource in marketplace"""
    __tablename__ = "resources"

    id = Column(String, primary_key=True)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Resource metadata
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    resource_type = Column(SQLEnum(ResourceType), nullable=False)
    category = Column(SQLEnum(ResourceCategory), nullable=False)
    status = Column(SQLEnum(ResourceStatus), default=ResourceStatus.DRAFT)
    
    # Pricing
    price = Column(Float, nullable=False)  # 0 for free resources
    currency = Column(String, default="USD")
    is_premium = Column(Integer, default=0)
    
    # Content
    content_url = Column(String, nullable=True)  # S3 URL or similar
    preview_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    file_size_mb = Column(Float, nullable=True)
    
    # Metadata
    tags = Column(JSON, nullable=True)  # ["resume", "tech", "senior"]
    difficulty_level = Column(String, nullable=True)  # beginner, intermediate, advanced
    estimated_time_minutes = Column(Integer, nullable=True)
    
    # Stats
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    purchase_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    # SEO
    slug = Column(String, unique=True, nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    
    # Relationships
    creator = relationship("User", back_populates="resources")
    purchases = relationship("Purchase", back_populates="resource", cascade="all, delete-orphan")
    reviews = relationship("ResourceReview", back_populates="resource", cascade="all, delete-orphan")


class Purchase(Base):
    """User purchase of a resource"""
    __tablename__ = "purchases"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    
    # Transaction details
    amount_paid = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    payment_method = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    
    # Status
    status = Column(String, default="completed")  # completed, refunded, failed
    
    # Access
    download_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    purchased_at = Column(DateTime, default=datetime.utcnow)
    refunded_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    resource = relationship("Resource", back_populates="purchases")


class ResourceReview(Base):
    """User review of a resource"""
    __tablename__ = "resource_reviews"

    id = Column(String, primary_key=True)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    purchase_id = Column(String, ForeignKey("purchases.id"), nullable=True)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String, nullable=True)
    comment = Column(Text, nullable=True)
    
    # Metadata
    is_verified_purchase = Column(Integer, default=0)
    helpful_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resource = relationship("Resource", back_populates="reviews")
    user = relationship("User")
    purchase = relationship("Purchase")


class Collection(Base):
    """Curated collection of resources"""
    __tablename__ = "collections"

    id = Column(String, primary_key=True)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Collection metadata
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    
    # Content
    resource_ids = Column(JSON, nullable=False)  # List of resource IDs
    
    # Pricing
    price = Column(Float, default=0.0)
    discount_percentage = Column(Integer, default=0)  # Bundle discount
    
    # Stats
    view_count = Column(Integer, default=0)
    purchase_count = Column(Integer, default=0)
    
    # Visibility
    is_public = Column(Integer, default=1)
    is_featured = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User")
