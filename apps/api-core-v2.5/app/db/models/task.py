"""Task management models for gamified professional journey tracking.

Combines Life Architect 2's gamification (XP, levels, achievements) with
professional career journey tasks for going abroad.
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

class TaskStatus(str, enum.Enum):
    """Task lifecycle status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    """Task priority levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskCategory(str, enum.Enum):
    """Professional journey task categories."""
    DOCUMENTATION = "documentation"
    LANGUAGE = "language"
    FINANCE = "finance"
    HOUSING = "housing"
    NETWORKING = "networking"
    INTERVIEW = "interview"
    VISA = "visa"
    CULTURAL_PREP = "cultural_prep"
    HEALTH = "health"
    EDUCATION = "education"
    EMPLOYMENT = "employment"
    CUSTOM = "custom"


class AchievementCategory(str, enum.Enum):
    """Achievement categories for organization."""
    FIRST_STEPS = "first_steps"
    CONSISTENCY = "consistency"
    MASTERY = "mastery"
    SOCIAL = "social"
    SPEED = "speed"
    SPECIAL = "special"


# ============================================================
# Task Model
# ============================================================

class Task(Base):
    """Main task entity for user professional journey."""
    
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_user_id", "user_id"),
        Index("ix_tasks_route_id", "route_id"),
        Index("ix_tasks_status", "status"),
        Index("ix_tasks_due_date", "due_date"),
        Index("ix_tasks_category", "category"),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Task details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(TaskCategory), nullable=False, default=TaskCategory.CUSTOM)
    
    # Status and priority
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    priority = Column(Enum(TaskPriority), nullable=False, default=TaskPriority.MEDIUM)
    
    # Dates and time
    due_date = Column(DateTime(timezone=True), nullable=True)
    estimated_hours = Column(Integer, nullable=True)  # In minutes
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Gamification
    xp_reward = Column(Integer, nullable=False, default=10)
    level_requirement = Column(Integer, nullable=True, default=1)
    
    # Streak and completion tracking
    streak_count = Column(Integer, nullable=False, default=0)
    completion_count = Column(Integer, nullable=False, default=0)
    
    # Additional data
    notes = Column(Text, nullable=True)
    task_metadata = Column("metadata", JSON, nullable=True)  # Flexible metadata storage (db column: metadata)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), 
                       onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    route = relationship("Route", back_populates="tasks")
    subtasks = relationship("SubTask", back_populates="task", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status={self.status.value})>"


# ============================================================
# SubTask Model
# ============================================================

class SubTask(Base):
    """Subtasks/checklist items for main tasks."""
    
    __tablename__ = "subtasks"
    __table_args__ = (
        Index("ix_subtasks_task_id", "task_id"),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Foreign keys
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Subtask details
    title = Column(String(255), nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    position = Column(Integer, nullable=False, default=0)  # For ordering
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    task = relationship("Task", back_populates="subtasks")
    
    def __repr__(self):
        return f"<SubTask(id={self.id}, title='{self.title}', completed={self.is_completed})>"


# ============================================================
# User Progress Model
# ============================================================

class UserProgress(Base):
    """User's gamification progress (XP, levels, streaks)."""
    
    __tablename__ = "user_progress"
    __table_args__ = (
        Index("ix_user_progress_user_id", "user_id", unique=True),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # XP and level
    total_xp = Column(Integer, nullable=False, default=0)
    current_level = Column(Integer, nullable=False, default=1)
    
    # Streak tracking
    streak_current = Column(Integer, nullable=False, default=0)
    streak_best = Column(Integer, nullable=False, default=0)
    last_activity_date = Column(DateTime(timezone=True), nullable=True)
    
    # Task completion stats
    tasks_completed_today = Column(Integer, nullable=False, default=0)
    tasks_completed_total = Column(Integer, nullable=False, default=0)
    tasks_completed_this_week = Column(Integer, nullable=False, default=0)
    tasks_completed_this_month = Column(Integer, nullable=False, default=0)
    
    # Additional stats
    time_spent_minutes = Column(Integer, nullable=False, default=0)
    longest_task_streak = Column(Integer, nullable=False, default=0)
    
    # Additional metadata
    progress_metadata = Column("metadata", JSON, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc),
                       onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="progress")
    achievements = relationship("UserAchievement", primaryjoin="UserProgress.user_id == foreign(UserAchievement.user_id)", cascade="all, delete-orphan", viewonly=True)
    
    def __repr__(self):
        return f"<UserProgress(user_id={self.user_id}, level={self.current_level}, xp={self.total_xp})>"


# ============================================================
# Achievement Model
# ============================================================

class Achievement(Base):
    """Achievement definitions (system-wide)."""
    
    __tablename__ = "achievements"
    __table_args__ = (
        Index("ix_achievements_category", "category"),
        Index("ix_achievements_is_active", "is_active"),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Achievement details
    name = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=True)  # English version
    description = Column(Text, nullable=False)
    icon = Column(String(10), nullable=False)  # Emoji icon
    
    # Gamification
    xp_bonus = Column(Integer, nullable=False, default=0)
    unlock_condition = Column(JSON, nullable=False)  # e.g., {"tasks_completed": 10}
    
    # Organization
    category = Column(Enum(AchievementCategory), nullable=False, default=AchievementCategory.FIRST_STEPS)
    is_active = Column(Boolean, nullable=False, default=True)
    display_order = Column(Integer, nullable=False, default=0)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Achievement(id={self.id}, name='{self.name}', category={self.category.value})>"


# ============================================================
# User Achievement Model
# ============================================================

class UserAchievement(Base):
    """User's unlocked achievements."""
    
    __tablename__ = "user_achievements"
    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
        Index("ix_user_achievements_user_id", "user_id"),
        Index("ix_user_achievements_unlocked_at", "unlocked_at"),
    )
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    
    # Unlock details
    unlocked_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    progress = Column(Integer, nullable=False, default=0)  # 0-100%
    claimed = Column(Boolean, nullable=False, default=False)  # Whether XP bonus claimed
    
    # Additional metadata
    user_achievement_metadata = Column("metadata", JSON, nullable=True)
    
    # Relationships
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"
