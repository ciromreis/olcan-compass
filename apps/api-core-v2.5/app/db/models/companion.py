"""Companion Models - Adaptive Tamagotchi-like Companion System

Companions are archetype-aware guides that evolve based on route progress.
They reflect the user's professional archetype and adapt their personality,
communication style, and abilities accordingly.
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Boolean, Integer, Float, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CompanionMood(str, enum.Enum):
    """Companion mood states"""
    EXCITED = "excited"
    HAPPY = "happy"
    NEUTRAL = "neutral"
    SAD = "sad"
    TIRED = "tired"
    MOTIVATED = "motivated"


class CompanionActivityType(str, enum.Enum):
    """Companion activity types"""
    FEED = "feed"  # Complete tasks
    TRAIN = "train"  # Work on milestones
    PLAY = "play"  # Interact with companion
    REST = "rest"  # Take a break


class Companion(Base):
    """Adaptive companion tied to user archetype and route progress
    
    Tamagotchi-like companion that:
    - Reflects user's professional archetype personality
    - Evolves based on route progress
    - Adapts communication style to user state
    - Provides archetype-specific encouragement
    - Changes appearance/abilities with milestones
    """
    __tablename__ = "companions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Basic Info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Archetype Binding (references ProfessionalArchetype from psychology.py)
    archetype: Mapped[str] = mapped_column(String(50), nullable=False)
    # Value matches ProfessionalArchetype enum (e.g., "individual_sovereignty")
    
    archetype_config_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("archetype_configs.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Personality (from archetype config)
    personality_type: Mapped[str] = mapped_column(String(50), default="supportive_guide", nullable=False)
    # Examples: "rebellious_mentor", "academic_guide", "pragmatic_coach"
    
    communication_style: Mapped[str] = mapped_column(String(50), default="supportive", nullable=False)
    # Examples: "direct", "supportive", "challenging", "academic"
    
    # Evolution System
    evolution_stage: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    # 1-5: Beginner → Apprentice → Journeyman → Expert → Master
    
    evolution_path: Mapped[str] = mapped_column(String(200), nullable=False)
    # Example: "Operador Local → Estrategista Internacional"
    
    current_form: Mapped[str] = mapped_column(String(50), default="egg", nullable=False)
    # Visual representation: egg, sprout, young, mature, master, legendary
    
    # Progression
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    xp_to_next_level: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    
    # Tamagotchi Stats
    happiness: Mapped[int] = mapped_column(Integer, default=100, nullable=False)  # 0-100
    energy: Mapped[int] = mapped_column(Integer, default=100, nullable=False)  # 0-100
    health: Mapped[int] = mapped_column(Integer, default=100, nullable=False)  # 0-100
    
    mood: Mapped[CompanionMood] = mapped_column(
        Enum(CompanionMood, values_callable=lambda x: [e.value for e in x]),
        default=CompanionMood.NEUTRAL,
        nullable=False
    )
    
    # Abilities (JSON) - unlock with milestones
    abilities: Mapped[list] = mapped_column(JSON, default=list)
    # Example: [
    #     {"name": "ATS Optimizer", "unlocked": true, "level": 2, "description": "..."},
    #     {"name": "Interview Coach", "unlocked": false, "unlock_condition": "..."},
    #     {"name": "Visa Navigator", "unlocked": true, "level": 1, "description": "..."}
    # ]
    
    # Route Context
    active_route_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("routes.id", ondelete="SET NULL"),
        nullable=True
    )
    
    route_progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Interaction History
    last_interaction: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    interaction_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    messages_sent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Tamagotchi Mechanics
    last_fed: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    # "Fed" by completing tasks
    
    last_played: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    # "Played with" by interacting
    
    # Archetype-Specific State (JSON)
    archetype_state: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example for INDIVIDUAL_SOVEREIGNTY: {
    #     "sovereignty_level": 0.7,
    #     "freedom_score": 85,
    #     "recent_wins": ["remote_job_offer", "visa_approved"],
    #     "autonomy_milestones": 5
    # }
    
    # Visual Customization
    visual_theme: Mapped[str] = mapped_column(String(50), default="default", nullable=False)
    # Example: "phoenix", "owl", "dragon", "tree"
    
    accessories: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["graduation_cap", "briefcase", "passport"]
    
    # Stats (JSON) - for future gamification
    stats: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {"power": 50, "wisdom": 70, "charisma": 60, "agility": 40}
    
    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="companion")


class CompanionActivity(Base):
    """Track companion activities for tamagotchi mechanics"""
    __tablename__ = "companion_activities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    companion_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("companions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Activity Details
    activity_type: Mapped[CompanionActivityType] = mapped_column(
        Enum(CompanionActivityType, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    
    # Rewards
    xp_reward: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    happiness_change: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    energy_change: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Context
    related_route_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("routes.id", ondelete="SET NULL"),
        nullable=True
    )
    
    related_milestone_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("route_milestones.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Metadata
    activity_data: Mapped[dict] = mapped_column(JSON, default=dict)
    
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


class CompanionEvolution(Base):
    """Track companion evolution events"""
    __tablename__ = "companion_evolutions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    companion_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("companions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Evolution Details
    from_stage: Mapped[int] = mapped_column(Integer, nullable=False)
    to_stage: Mapped[int] = mapped_column(Integer, nullable=False)
    
    from_form: Mapped[str] = mapped_column(String(50), nullable=False)
    to_form: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Trigger
    evolution_trigger: Mapped[str] = mapped_column(String(100), nullable=False)
    # Example: "milestone_completed", "route_completed", "level_up"
    
    trigger_details: Mapped[dict] = mapped_column(JSON, default=dict)
    # Example: {"milestone_name": "First Resume", "route_type": "job_application"}
    
    # Stats at Evolution
    level_at_evolution: Mapped[int] = mapped_column(Integer, nullable=False)
    xp_at_evolution: Mapped[int] = mapped_column(Integer, nullable=False)
    
    stats_before: Mapped[dict] = mapped_column(JSON, default=dict)
    stats_after: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Abilities Unlocked
    abilities_unlocked: Mapped[list] = mapped_column(JSON, default=list)
    # Example: ["ATS Optimizer Level 2", "Interview Coach"]
    
    # Timestamp
    evolved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


class CompanionMessage(Base):
    """Archetype-specific messages from companion to user"""
    __tablename__ = "companion_messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    companion_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("companions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Message Content
    message_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: "milestone_start", "milestone_complete", "encouragement", 
    #        "reminder", "celebration", "tip"
    
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Context
    related_route_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("routes.id", ondelete="SET NULL"),
        nullable=True
    )
    
    related_milestone_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("route_milestones.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Archetype Personalization
    archetype_tone: Mapped[str] = mapped_column(String(50), nullable=False)
    # Example: "rebellious", "academic", "supportive", "challenging"
    
    # User Interaction
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    user_reaction: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # Example: "like", "love", "helpful", "dismiss"
    
    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
