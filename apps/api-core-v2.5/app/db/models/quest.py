"""Quest system models for gamified task progression.

Quests provide structured goals that guide users through their professional journey.
They can be daily, weekly, or special event-based challenges.
"""

import enum
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    Column, String, Integer, DateTime, ForeignKey, Enum, Text, JSON, Boolean,
    UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


# ============================================================
# Enums
# ============================================================

class QuestType(str, enum.Enum):
    """Quest duration/frequency types."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    SPECIAL = "special"
    EVENT = "event"


class QuestStatus(str, enum.Enum):
    """Quest lifecycle status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CLAIMED = "claimed"
    EXPIRED = "expired"
    FAILED = "failed"


class QuestCategory(str, enum.Enum):
    """Quest categories aligned with task categories."""
    PROGRESSION = "progression"
    CONSISTENCY = "consistency"
    CATEGORY_SPECIFIC = "category_specific"
    SOCIAL = "social"
    SPECIAL = "special"


# ============================================================
# Quest Template Model
# ============================================================

class QuestTemplate(Base):
    """Quest templates (system-wide definitions)."""
    
    __tablename__ = "quest_templates"
    __table_args__ = (
        Index("ix_quest_templates_quest_type", "quest_type"),
        Index("ix_quest_templates_is_active", "is_active"),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Quest details
    name = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    icon = Column(String(10), nullable=False)
    
    # Quest configuration
    quest_type = Column(Enum(QuestType), nullable=False, default=QuestType.DAILY)
    category = Column(Enum(QuestCategory), nullable=False, default=QuestCategory.PROGRESSION)
    
    # Requirements
    requirement_type = Column(String(50), nullable=False)  # e.g., "complete_tasks", "complete_category_tasks"
    requirement_target = Column(Integer, nullable=False)  # e.g., 5
    requirement_metadata = Column(JSON, nullable=True)  # Additional requirement data
    
    # Rewards
    xp_reward = Column(Integer, nullable=False, default=0)
    coin_reward = Column(Integer, nullable=False, default=0)
    item_reward_id = Column(UUID(as_uuid=True), nullable=True)  # Future: item system
    
    # Configuration
    duration_hours = Column(Integer, nullable=True)  # How long quest is active (null = until completed)
    cooldown_hours = Column(Integer, nullable=True)  # How long before quest can be assigned again
    max_completions = Column(Integer, nullable=True)  # Max times a user can complete this quest
    
    # Organization
    is_active = Column(Boolean, nullable=False, default=True)
    display_order = Column(Integer, nullable=False, default=0)
    difficulty = Column(Integer, nullable=False, default=1)  # 1-5
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user_quests = relationship("UserQuest", back_populates="template", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<QuestTemplate(id={self.id}, name='{self.name}', type={self.quest_type.value})>"


# ============================================================
# User Quest Model
# ============================================================

class UserQuest(Base):
    """User's active and completed quests."""
    
    __tablename__ = "user_quests"
    __table_args__ = (
        Index("ix_user_quests_user_id", "user_id"),
        Index("ix_user_quests_status", "status"),
        Index("ix_user_quests_expires_at", "expires_at"),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("quest_templates.id", ondelete="CASCADE"), nullable=False)
    
    # Quest state
    status = Column(Enum(QuestStatus), nullable=False, default=QuestStatus.ACTIVE)
    progress = Column(Integer, nullable=False, default=0)  # Current progress toward target
    progress_percentage = Column(Integer, nullable=False, default=0)  # 0-100
    
    # Timing
    assigned_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    completion_data = Column(JSON, nullable=True)  # Data about how quest was completed
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="quests")
    template = relationship("QuestTemplate", back_populates="user_quests")
    
    def __repr__(self):
        return f"<UserQuest(id={self.id}, user_id={self.user_id}, status={self.status.value}, progress={self.progress})>"


# ============================================================
# Quest Progress Event Model
# ============================================================

class QuestProgressEvent(Base):
    """Track individual progress events for quests (for analytics)."""
    
    __tablename__ = "quest_progress_events"
    __table_args__ = (
        Index("ix_quest_progress_events_user_quest_id", "user_quest_id"),
        Index("ix_quest_progress_events_created_at", "created_at"),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Foreign keys
    user_quest_id = Column(UUID(as_uuid=True), ForeignKey("user_quests.id", ondelete="CASCADE"), nullable=False)
    
    # Event details
    event_type = Column(String(50), nullable=False)  # e.g., "task_completed", "category_task_completed"
    progress_delta = Column(Integer, nullable=False)  # How much progress was added
    progress_after = Column(Integer, nullable=False)  # Total progress after this event
    
    # Context
    event_metadata = Column(JSON, nullable=True)  # Additional context about the event
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<QuestProgressEvent(id={self.id}, quest_id={self.user_quest_id}, delta={self.progress_delta})>"
