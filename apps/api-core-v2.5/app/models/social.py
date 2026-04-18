"""
Social Features Models

Represents social interactions, follows, activity feed, and notifications.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

try:
    from app.core.database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


class ActivityType(str, enum.Enum):
    """Types of user activities"""
    ACHIEVEMENT_UNLOCKED = "achievement_unlocked"
    LEVEL_UP = "level_up"
    COMPANION_EVOLVED = "companion_evolved"
    QUEST_COMPLETED = "quest_completed"
    DOCUMENT_CREATED = "document_created"
    INTERVIEW_COMPLETED = "interview_completed"
    RESOURCE_PUBLISHED = "resource_published"
    GUILD_JOINED = "guild_joined"
    GUILD_EVENT = "guild_event"


class NotificationType(str, enum.Enum):
    """Types of notifications"""
    ACHIEVEMENT = "achievement"
    LEVEL_UP = "level_up"
    QUEST = "quest"
    GUILD_INVITE = "guild_invite"
    GUILD_EVENT = "guild_event"
    FOLLOWER = "follower"
    COMMENT = "comment"
    LIKE = "like"
    SYSTEM = "system"


class Activity(Base):
    """User activity for social feed"""
    __tablename__ = "activities"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Activity details
    activity_type = Column(SQLEnum(ActivityType), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Related entities
    related_entity_type = Column(String, nullable=True)  # companion, document, guild, etc.
    related_entity_id = Column(String, nullable=True)
    
    # Metadata (renamed to avoid SQLAlchemy reserved word)
    meta_data = Column(JSON, nullable=True)  # Additional context
    
    # Visibility
    is_public = Column(Boolean, default=True)
    
    # Engagement
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="noload")
    likes = relationship("ActivityLike", back_populates="activity", cascade="all, delete-orphan")
    comments = relationship("ActivityComment", back_populates="activity", cascade="all, delete-orphan")


class Follow(Base):
    """User follow relationships"""
    __tablename__ = "follows"

    id = Column(String, primary_key=True)
    follower_id = Column(String, ForeignKey("users.id"), nullable=False)
    following_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Follow metadata
    notification_enabled = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    follower = relationship("User", foreign_keys=[follower_id], backref="following")
    following = relationship("User", foreign_keys=[following_id], backref="followers")


class ActivityLike(Base):
    """Likes on activities"""
    __tablename__ = "activity_likes"

    id = Column(String, primary_key=True)
    activity_id = Column(String, ForeignKey("activities.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    activity = relationship("Activity", back_populates="likes")
    user = relationship("User")


class ActivityComment(Base):
    """Comments on activities"""
    __tablename__ = "activity_comments"

    id = Column(String, primary_key=True)
    activity_id = Column(String, ForeignKey("activities.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Comment content
    content = Column(Text, nullable=False)
    
    # Reply threading
    parent_comment_id = Column(String, ForeignKey("activity_comments.id"), nullable=True)
    
    # Engagement
    like_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    activity = relationship("Activity", back_populates="comments")
    user = relationship("User")
    replies = relationship("ActivityComment", remote_side=[id], backref="parent")


class Notification(Base):
    """User notifications"""
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Notification details
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    
    # Related entities
    related_entity_type = Column(String, nullable=True)
    related_entity_id = Column(String, nullable=True)
    
    # Action URL
    action_url = Column(String, nullable=True)
    
    # Metadata (renamed to avoid SQLAlchemy reserved word)
    meta_data = Column(JSON, nullable=True)
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="noload")


class UserProfile(Base):
    """Extended user profile for social features"""
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Profile information
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)
    
    # Social links
    linkedin_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    
    # Career information
    current_role = Column(String, nullable=True)
    current_company = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    skills = Column(JSON, nullable=True)  # List of skills
    
    # Privacy settings
    is_profile_public = Column(Boolean, default=True)
    show_activity = Column(Boolean, default=True)
    show_achievements = Column(Boolean, default=True)
    
    # Stats
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    activity_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="noload")


class Badge(Base):
    """Special badges users can earn"""
    __tablename__ = "badges"

    id = Column(String, primary_key=True)
    
    # Badge details
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon_url = Column(String, nullable=True)
    
    # Badge metadata
    category = Column(String, nullable=True)  # achievement, special, event, etc.
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    
    # Requirements
    requirements = Column(JSON, nullable=True)
    
    # Stats
    total_awarded = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class UserBadge(Base):
    """Badges awarded to users"""
    __tablename__ = "user_badges"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    badge_id = Column(String, ForeignKey("badges.id"), nullable=False)
    
    # Award details
    awarded_for = Column(String, nullable=True)  # Reason for award
    
    # Display
    is_displayed = Column(Boolean, default=False)  # Show on profile
    display_order = Column(Integer, default=0)
    
    # Timestamps
    awarded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    badge = relationship("Badge")
