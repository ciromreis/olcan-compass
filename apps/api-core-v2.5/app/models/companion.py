from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base

class Companion(Base):
    __tablename__ = "companions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    archetype_id = Column(Integer, ForeignKey("archetypes.id"), nullable=True)
    
    # Basic Info
    name = Column(String(100), nullable=False)
    # archetype stores the canonical slug (e.g. 'institutional_escapee', 'scholarship_cartographer')
    archetype = Column(String(50), nullable=False, server_default="institutional_escapee")
    type = Column(String(50), nullable=True)  # legacy field, kept for backward compat

    # Progression
    level = Column(Integer, default=1, nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    xp_to_next = Column(Integer, default=500, nullable=False)
    evolution_stage = Column(String(20), default="egg", nullable=False)  # egg, sprout, young, mature, master, legendary

    # Stats & Abilities
    abilities = Column(JSON, default=list)  # List of ability objects
    stats = Column(JSON, default=dict)  # power, wisdom, charisma, agility

    # Health, Happiness & Energy
    current_health = Column(Float, default=100.0, nullable=False)
    max_health = Column(Float, default=100.0, nullable=False)
    happiness = Column(Float, default=100.0, nullable=False)
    energy = Column(Float, default=100.0, nullable=False)
    max_energy = Column(Float, default=100.0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    last_cared_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User")
    archetype = relationship("Archetype")
    activities = relationship("CompanionActivity", back_populates="companion", cascade="all, delete-orphan")
    battles = relationship("CompanionBattle", foreign_keys="[CompanionBattle.companion_id]")
    documents = relationship("Document", primaryjoin="Companion.id == foreign(Document.companion_id)", lazy="noload", viewonly=True)

class CompanionActivity(Base):
    __tablename__ = "companion_activities"

    id = Column(Integer, primary_key=True, index=True)
    companion_id = Column(Integer, ForeignKey("companions.id"), nullable=False)
    
    # Activity Info
    activity_type = Column(String(50), nullable=False)  # feed, train, play, rest
    xp_reward = Column(Integer, default=0, nullable=False)
    energy_cost = Column(Integer, default=0, nullable=False)
    description = Column(String(255), nullable=True)
    
    # Timestamp
    completed_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    companion = relationship("Companion", back_populates="activities")

class CompanionBattle(Base):
    __tablename__ = "companion_battles"

    id = Column(Integer, primary_key=True, index=True)
    companion_id = Column(Integer, ForeignKey("companions.id"), nullable=False)
    opponent_id = Column(Integer, ForeignKey("companions.id"), nullable=True)
    
    # Battle Info
    battle_type = Column(String(50), nullable=False)  # duel, tournament, guild_war
    result = Column(String(50), nullable=False)  # win, lose, draw
    experience_gained = Column(Integer, default=0, nullable=False)
    items_gained = Column(JSON, default=list)
    achievements_gained = Column(JSON, default=list)
    
    # Battle Details
    battle_data = Column(JSON, nullable=True)  # Detailed battle statistics
    
    # Timestamp
    battle_date = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    companion = relationship("Companion", back_populates="battles", foreign_keys=[companion_id])
    opponent = relationship("Companion", foreign_keys=[opponent_id])

class CompanionEvolution(Base):
    __tablename__ = "companion_evolutions"

    id = Column(Integer, primary_key=True, index=True)
    companion_id = Column(Integer, ForeignKey("companions.id"), nullable=False)
    
    # Evolution Info
    from_stage = Column(String(20), nullable=False)
    to_stage = Column(String(20), nullable=False)
    evolution_reason = Column(String(255), nullable=True)
    
    # Evolution Details
    level_at_evolution = Column(Integer, nullable=False)
    xp_at_evolution = Column(Integer, nullable=False)
    stats_before = Column(JSON, nullable=True)
    stats_after = Column(JSON, nullable=True)
    
    # Timestamp
    evolved_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    companion = relationship("Companion")

class CompanionCustomization(Base):
    __tablename__ = "companion_customizations"

    id = Column(Integer, primary_key=True, index=True)
    companion_id = Column(Integer, ForeignKey("companions.id"), nullable=False)
    
    # Customization Options
    name = Column(String(100), nullable=True)
    accessories = Column(JSON, default=list)  # List of accessory IDs
    color_variant = Column(String(50), nullable=True)
    special_effects = Column(JSON, default=list)  # List of effect IDs
    
    # Premium Features
    is_premium = Column(String(10), default=False, nullable=False)  # Using String to avoid Boolean issues
    purchase_date = Column(DateTime, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    companion = relationship("Companion")
