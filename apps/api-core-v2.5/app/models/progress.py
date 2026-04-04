"""
User progress and achievement models for Olcan Compass v2.5
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Progress tracking
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    xp_to_next_level = Column(Integer, default=100)
    
    # Activity tracking
    total_sessions = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)  # in minutes
    streak_days = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime(timezone=True))
    
    # Completion tracking
    quests_completed = Column(Integer, default=0)
    achievements_unlocked = Column(Integer, default=0)
    companions_evolved = Column(Integer, default=0)
    
    # Statistics
    stats = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    achievements = relationship("UserAchievement", back_populates="progress", cascade="all, delete-orphan")
    quests = relationship("UserQuest", back_populates="progress", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<UserProgress user_id={self.user_id} level={self.level}>"


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    
    # Achievement details
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    icon = Column(String)
    category = Column(String)  # companion, quest, social, etc.
    
    # Requirements
    requirements = Column(JSON, default={})
    xp_reward = Column(Integer, default=0)
    
    # Rarity and visibility
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    is_hidden = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")
    
    def __repr__(self):
        return f"<Achievement {self.name}>"


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    progress_id = Column(Integer, ForeignKey("user_progress.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    
    # Unlock details
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
    progress_data = Column(JSON, default={})
    
    # Relationships
    progress = relationship("UserProgress", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        return f"<UserAchievement progress_id={self.progress_id} achievement_id={self.achievement_id}>"


class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    
    # Quest details
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    difficulty = Column(String, default="easy")  # easy, medium, hard, expert
    
    # Requirements and rewards
    requirements = Column(JSON, default={})
    xp_reward = Column(Integer, default=0)
    rewards = Column(JSON, default={})
    
    # Quest chain
    prerequisite_quest_id = Column(Integer, ForeignKey("quests.id"))
    is_repeatable = Column(Boolean, default=False)
    cooldown_hours = Column(Integer)
    
    # Availability
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_quests = relationship("UserQuest", back_populates="quest")
    prerequisite = relationship("Quest", remote_side=[id])
    
    def __repr__(self):
        return f"<Quest {self.name}>"


class UserQuest(Base):
    __tablename__ = "user_quests"

    id = Column(Integer, primary_key=True, index=True)
    progress_id = Column(Integer, ForeignKey("user_progress.id"), nullable=False)
    quest_id = Column(Integer, ForeignKey("quests.id"), nullable=False)
    
    # Quest progress
    status = Column(String, default="active")  # active, completed, failed, abandoned
    progress_data = Column(JSON, default={})
    completion_percentage = Column(Integer, default=0)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    last_progress_at = Column(DateTime(timezone=True))
    
    # Relationships
    progress = relationship("UserProgress", back_populates="quests")
    quest = relationship("Quest", back_populates="user_quests")
    
    def __repr__(self):
        return f"<UserQuest progress_id={self.progress_id} quest_id={self.quest_id} status={self.status}>"
