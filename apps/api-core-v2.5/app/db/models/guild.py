"""Guild models for gamification system"""

import enum
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, ARRAY, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class GuildRole(str, enum.Enum):
    """Guild member roles"""
    LEADER = "leader"
    OFFICER = "officer"
    MEMBER = "member"


class Guild(Base):
    """Guild model for team collaboration"""
    __tablename__ = "guilds"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, nullable=False, default=True)
    max_members = Column(Integer, nullable=False, default=50)
    total_members = Column(Integer, nullable=False, default=0)
    tags = Column(ARRAY(String(50)), nullable=False, default=list)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    members = relationship("GuildMember", back_populates="guild", cascade="all, delete-orphan")
    events = relationship("GuildEvent", back_populates="guild", cascade="all, delete-orphan")


class GuildMember(Base):
    """Guild membership"""
    __tablename__ = "guild_members"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    guild_id = Column(PGUUID(as_uuid=True), ForeignKey("guilds.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(SQLEnum(GuildRole), nullable=False, default=GuildRole.MEMBER)
    contribution_score = Column(Integer, nullable=False, default=0)
    
    joined_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    guild = relationship("Guild", back_populates="members")
    user = relationship("User", back_populates="guild_memberships")


class GuildEvent(Base):
    """Guild events"""
    __tablename__ = "guild_events"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    guild_id = Column(PGUUID(as_uuid=True), ForeignKey("guilds.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(50), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    event_metadata = Column(JSONB, nullable=False, default=dict)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    guild = relationship("Guild", back_populates="events")
