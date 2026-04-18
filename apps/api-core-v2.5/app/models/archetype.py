from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base

class Archetype(Base):
    __tablename__ = "archetypes"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    name = Column(String(50), unique=True, nullable=False, index=True)  # strategist, innovator, creator, etc.
    title = Column(String(100), nullable=False)  # The Strategist, The Innovator, etc.
    description = Column(String(500), nullable=False)
    motivator = Column(String(50), nullable=False)  # freedom, success, growth, adventure, stability, safety, purpose, knowledge, connection, logic, impact
    companion_type = Column(String(50), nullable=False)  # fox, dragon, lion, etc.
    
    # Evolution & Abilities
    base_abilities = Column(JSON, default=list)  # List of base ability objects
    evolution_path = Column(JSON, default=dict)  # Evolution stage requirements and abilities
    base_stats = Column(JSON, default=dict)  # Initial stats for this archetype
    
    # Visual & Design
    color_scheme = Column(JSON, default=dict)  # Color scheme for UI
    visual_description = Column(String(255), nullable=True)
    companion_description = Column(String(500), nullable=False)
    
    # Metadata
    is_active = Column(String(10), default="True", nullable=False)  # Using String to avoid Boolean issues
    sort_order = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    # companions = relationship("Companion", back_populates="archetype")  # Disabled - using new companion system

class Ability(Base):
    __tablename__ = "abilities"

    id = Column(Integer, primary_key=True, index=True)
    archetype_id = Column(Integer, ForeignKey("archetypes.id"), nullable=False)
    
    # Basic Info
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    ability_type = Column(String(50), nullable=False)  # active, passive, ultimate
    icon = Column(String(50), nullable=False)  # Icon identifier or emoji
    
    # Requirements
    unlock_level = Column(Integer, default=1, nullable=False)
    evolution_stage = Column(String(20), nullable=False)  # egg, sprout, young, mature, master, legendary
    
    # Stats & Effects
    cooldown = Column(Integer, nullable=True)  # Cooldown in seconds
    damage = Column(Integer, nullable=True)  # Damage value
    healing = Column(Integer, nullable=True)  # Healing value
    effects = Column(JSON, default=dict)  # Additional effects
    
    # Metadata
    is_active = Column(String(10), default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    archetype = relationship("Archetype")

class EvolutionRequirement(Base):
    __tablename__ = "evolution_requirements"

    id = Column(Integer, primary_key=True, index=True)
    archetype_id = Column(Integer, ForeignKey("archetypes.id"), nullable=False)
    
    # Evolution Info
    stage = Column(String(20), nullable=False)  # egg, sprout, young, mature, master, legendary
    level = Column(Integer, nullable=False)
    xp_required = Column(Integer, nullable=False)
    abilities_required = Column(JSON, default=list)  # List of ability IDs required
    
    # Special Conditions
    special_conditions = Column(JSON, default=list)  # List of special condition strings
    
    # Rewards
    stat_increases = Column(JSON, default=dict)  # Stat increases on evolution
    ability_unlocks = Column(JSON, default=list)  # New abilities unlocked
    
    # Metadata
    is_active = Column(String(10), default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    archetype = relationship("Archetype")

class ArchetypeStats(Base):
    __tablename__ = "archetype_stats"

    id = Column(Integer, primary_key=True, index=True)
    archetype_id = Column(Integer, ForeignKey("archetypes.id"), nullable=False)
    
    # Stat Values
    power = Column(Integer, default=70, nullable=False)
    wisdom = Column(Integer, default=70, nullable=False)
    charisma = Column(Integer, default=70, nullable=False)
    agility = Column(Integer, default=70, nullable=False)
    
    # Modifiers
    power_modifier = Column(Integer, default=0, nullable=False)
    wisdom_modifier = Column(Integer, default=0, nullable=False)
    charisma_modifier = Column(Integer, default=0, nullable=False)
    agility_modifier = Column(Integer, default=0, nullable=False)
    
    # Metadata
    is_active = Column(String(10), default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    archetype = relationship("Archetype")
