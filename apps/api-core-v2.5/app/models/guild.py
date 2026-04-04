"""
Guild and social features models for Olcan Compass v2.5
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Guild(Base):
    __tablename__ = "guilds"

    id = Column(Integer, primary_key=True, index=True)
    
    # Guild information
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    icon = Column(String)
    banner = Column(String)
    
    # Guild settings
    is_public = Column(Boolean, default=True)
    max_members = Column(Integer, default=50)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    
    # Guild stats
    total_members = Column(Integer, default=0)
    total_battles_won = Column(Integer, default=0)
    total_quests_completed = Column(Integer, default=0)
    
    # Guild metadata
    tags = Column(JSON, default=[])
    requirements = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    members = relationship("GuildMember", back_populates="guild", cascade="all, delete-orphan")
    events = relationship("GuildEvent", back_populates="guild", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Guild {self.name}>"


class GuildMember(Base):
    __tablename__ = "guild_members"

    id = Column(Integer, primary_key=True, index=True)
    guild_id = Column(Integer, ForeignKey("guilds.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Member role and status
    role = Column(String, default="member")  # leader, officer, member
    status = Column(String, default="active")  # active, inactive, banned
    
    # Member contribution
    contribution_points = Column(Integer, default=0)
    battles_participated = Column(Integer, default=0)
    quests_completed = Column(Integer, default=0)
    
    # Member metadata
    custom_title = Column(String)
    permissions = Column(JSON, default={})
    
    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active_at = Column(DateTime(timezone=True))
    
    # Relationships
    guild = relationship("Guild", back_populates="members")
    user = relationship("User")
    
    def __repr__(self):
        return f"<GuildMember guild_id={self.guild_id} user_id={self.user_id}>"


class GuildEvent(Base):
    __tablename__ = "guild_events"

    id = Column(Integer, primary_key=True, index=True)
    guild_id = Column(Integer, ForeignKey("guilds.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Event details
    name = Column(String, nullable=False)
    description = Column(Text)
    event_type = Column(String)  # battle, quest, social, tournament
    
    # Event scheduling
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(JSON)
    
    # Event participation
    max_participants = Column(Integer)
    current_participants = Column(Integer, default=0)
    participants = Column(JSON, default=[])
    
    # Event rewards
    rewards = Column(JSON, default={})
    
    # Event status
    status = Column(String, default="scheduled")  # scheduled, active, completed, cancelled
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    guild = relationship("Guild", back_populates="events")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<GuildEvent {self.name}>"
