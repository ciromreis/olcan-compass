"""Companion Service

Manages companion lifecycle, tamagotchi mechanics, and evolution.
Handles:
- Companion initialization from archetype
- Tamagotchi mechanics (feed, play, stats)
- Evolution triggers and processing
- Mood calculation
- Ability unlocking
- Interaction tracking
"""

import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.companion import (
    Companion, CompanionActivity, CompanionEvolution, 
    CompanionMessage, CompanionMood, CompanionActivityType
)
from app.db.models.psychology import ArchetypeConfig, ProfessionalArchetype
from app.db.models.route import RouteBuilder, DynamicMilestone
from app.services.companion_message_generator import CompanionMessageGenerator


class CompanionService:
    """Service for managing companion lifecycle and mechanics"""
    
    def __init__(self, session: Optional[AsyncSession] = None):
        self.session = session
        self.message_generator = CompanionMessageGenerator(session)

    def _bind_session(self, session: Optional[AsyncSession]) -> tuple[Optional[AsyncSession], Optional[AsyncSession]]:
        previous_service_session = self.session
        previous_generator_session = self.message_generator.session
        if session is not None:
            self.session = session
            self.message_generator.session = session
        return previous_service_session, previous_generator_session

    def _restore_session(
        self,
        previous_service_session: Optional[AsyncSession],
        previous_generator_session: Optional[AsyncSession],
    ) -> None:
        self.session = previous_service_session
        self.message_generator.session = previous_generator_session

    def _normalize_archetype(
        self, archetype: ProfessionalArchetype | str
    ) -> ProfessionalArchetype:
        if isinstance(archetype, ProfessionalArchetype):
            return archetype
        return ProfessionalArchetype(archetype)
    
    async def initialize_companion(self, *args, **kwargs) -> Companion:
        """Initialize a new companion for user based on archetype
        
        Args:
            user_id: User's UUID
            archetype: User's professional archetype
            name: Optional custom name (defaults to archetype-based name)
            
        Returns:
            Newly created Companion
        """
        session = kwargs.pop("session", None)
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            session = args[0]
            user_id = args[1]
            archetype = args[2]
            name = args[3] if len(args) > 3 else kwargs.get("name")
        else:
            user_id = kwargs.get("user_id", args[0] if args else None)
            archetype = kwargs.get("archetype", args[1] if len(args) > 1 else None)
            name = kwargs.get("name", args[2] if len(args) > 2 else None)

        previous_service_session, previous_generator_session = self._bind_session(session)
        archetype = self._normalize_archetype(archetype)

        try:
            # Get archetype config
            result = await self.session.execute(
                select(ArchetypeConfig).where(ArchetypeConfig.archetype == archetype)
            )
            archetype_config = result.scalar_one_or_none()

            if not archetype_config:
                archetype_config = type(
                    "FallbackArchetypeConfig",
                    (),
                    {
                        "id": uuid.uuid4(),
                        "archetype": archetype,
                        "evolution_path": "Beginner -> Master",
                        "companion_traits": {
                            "personality": self.get_personality_traits_from_archetype(archetype)["personality_type"],
                            "communication_style": self.get_personality_traits_from_archetype(archetype)["communication_style"],
                            "visual_theme": self.get_personality_traits_from_archetype(archetype)["visual_theme"],
                        },
                        "narrative_voice": {"tone": "supportive"},
                    },
                )()

            # Generate default name if not provided
            if not name:
                name = self._generate_companion_name(archetype)

            # Extract companion traits from config
            companion_traits = archetype_config.companion_traits or {}
            personality = companion_traits.get("personality", "supportive_guide")
            communication_style = companion_traits.get("communication_style", "supportive")
            visual_theme = companion_traits.get("visual_theme", "default")

            # Create companion
            companion = Companion(
                id=uuid.uuid4(),
                user_id=user_id,
                name=name,
                archetype=archetype.value,
                archetype_config_id=archetype_config.id,
                personality_type=personality,
                communication_style=communication_style,
                evolution_stage=1,
                evolution_path=archetype_config.evolution_path,
                current_form="egg",
                level=1,
                xp=0,
                xp_to_next_level=500,
                happiness=100,
                energy=100,
                health=100,
                mood=CompanionMood.NEUTRAL,
                abilities=[],
                visual_theme=visual_theme,
                archetype_state={},
                stats={"power": 10, "wisdom": 10, "charisma": 10, "agility": 10}
            )

            self.session.add(companion)
            if hasattr(self.session, "flush"):
                await self.session.flush()

            # Send welcome message
            welcome_message = await self._create_welcome_message(companion, archetype_config)
            self.session.add(welcome_message)

            if hasattr(self.session, "commit"):
                await self.session.commit()
            return companion
        finally:
            self._restore_session(previous_service_session, previous_generator_session)
    
    async def feed_companion(self, *args, **kwargs) -> Dict[str, Any]:
        """Feed companion by completing a task
        
        Args:
            companion: The companion to feed
            task_completed: Description of task completed
            xp_earned: XP earned from task
            
        Returns:
            Dict with updated stats and any evolution info
        """
        session = kwargs.pop("session", None)
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            session = args[0]
            companion = args[1]
            task_completed = args[2]
            xp_earned = args[3] if len(args) > 3 else kwargs.get("xp_earned", 50)
        else:
            companion = kwargs.get("companion", args[0] if args else None)
            task_completed = kwargs.get("task_completed", args[1] if len(args) > 1 else "")
            xp_earned = kwargs.get("xp_earned", args[2] if len(args) > 2 else 50)

        previous_service_session, previous_generator_session = self._bind_session(session)
        try:
            # Update last fed time
            companion.last_fed = datetime.now(timezone.utc)

            # Add XP
            companion.xp += xp_earned

            # Increase happiness and energy
            companion.happiness = min(100, companion.happiness + 10)
            companion.energy = min(100, companion.energy + 5)

            # Check for level up
            leveled_up = False
            if companion.xp >= companion.xp_to_next_level:
                companion.level += 1
                companion.xp -= companion.xp_to_next_level
                companion.xp_to_next_level = int(companion.xp_to_next_level * 1.5)
                leveled_up = True

            # Update mood
            companion.mood = self._calculate_mood(companion)

            # Record activity
            activity = CompanionActivity(
                id=uuid.uuid4(),
                companion_id=companion.id,
                activity_type=CompanionActivityType.FEED,
                description=task_completed,
                xp_reward=xp_earned,
                happiness_change=10,
                energy_change=5
            )
            self.session.add(activity)

            # Check evolution triggers
            evolution_result = await self._check_evolution_triggers(companion)

            if hasattr(self.session, "commit"):
                await self.session.commit()

            return {
                "xp_earned": xp_earned,
                "total_xp": companion.xp,
                "level": companion.level,
                "leveled_up": leveled_up,
                "happiness": companion.happiness,
                "energy": companion.energy,
                "mood": companion.mood.value,
                "evolution": evolution_result,
            }
        finally:
            self._restore_session(previous_service_session, previous_generator_session)
    
    async def play_with_companion(self, *args, **kwargs) -> Dict[str, Any]:
        """Play with companion to increase happiness
        
        Args:
            companion: The companion to play with
            
        Returns:
            Dict with updated stats
        """
        session = kwargs.pop("session", None)
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            session = args[0]
            companion = args[1]
        else:
            companion = kwargs.get("companion", args[0] if args else None)

        previous_service_session, previous_generator_session = self._bind_session(session)
        try:
            # Update last played time
            companion.last_played = datetime.now(timezone.utc)
            companion.interaction_count += 1

            # Increase happiness significantly, decrease energy slightly
            companion.happiness = min(100, companion.happiness + 15)
            companion.energy = max(0, companion.energy - 5)

            # Small XP reward for interaction
            xp_earned = 10
            companion.xp += xp_earned

            # Update mood
            companion.mood = self._calculate_mood(companion)

            # Record activity
            activity = CompanionActivity(
                id=uuid.uuid4(),
                companion_id=companion.id,
                activity_type=CompanionActivityType.PLAY,
                description="Played with companion",
                xp_reward=xp_earned,
                happiness_change=15,
                energy_change=-5
            )
            self.session.add(activity)

            if hasattr(self.session, "commit"):
                await self.session.commit()

            return {
                "happiness": companion.happiness,
                "energy": companion.energy,
                "mood": companion.mood.value,
                "xp_earned": xp_earned,
                "interaction_count": companion.interaction_count,
            }
        finally:
            self._restore_session(previous_service_session, previous_generator_session)

    async def rest_companion(self, *args, **kwargs) -> Dict[str, Any]:
        """Restore energy and a bit of health."""
        session = kwargs.pop("session", None)
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            session = args[0]
            companion = args[1]
        else:
            companion = kwargs.get("companion", args[0] if args else None)

        previous_service_session, previous_generator_session = self._bind_session(session)
        try:
            companion.energy = min(100, getattr(companion, "energy", 0) + 25)
            companion.health = min(100, getattr(companion, "health", 0) + 10)
            companion.last_interaction = datetime.now(timezone.utc)
            if hasattr(self.session, "commit"):
                await self.session.commit()
            return {
                "energy": companion.energy,
                "health": companion.health,
                "mood": self._calculate_mood(companion).value,
            }
        finally:
            self._restore_session(previous_service_session, previous_generator_session)
    
    async def update_companion_progress(
        self,
        companion: Companion,
        route_progress: int,
        milestone_completed: Optional[DynamicMilestone] = None
    ) -> Dict[str, Any]:
        """Update companion based on route progress
        
        Args:
            companion: The companion to update
            route_progress: Current route completion percentage
            milestone_completed: Optional milestone that was just completed
            
        Returns:
            Dict with updated stats and evolution info
        """
        companion.route_progress_percentage = route_progress
        
        # If milestone completed, feed companion
        if milestone_completed:
            xp_reward = milestone_completed.xp_reward or 100
            result = await self.feed_companion(
                companion,
                f"Completed milestone: {milestone_completed.name}",
                xp_reward
            )
            
            # Generate completion message
            archetype_config = await self._get_archetype_config(companion.archetype)
            message = await self.message_generator.generate_milestone_complete_message(
                companion, milestone_completed, archetype_config
            )
            self.session.add(message)
            companion.messages_sent += 1
            
            await self.session.commit()
            return result
        
        await self.session.commit()
        return {
            "route_progress": route_progress,
            "happiness": companion.happiness,
            "energy": companion.energy
        }
    
    async def decay_stats(self, companion: Companion) -> None:
        """Apply time-based stat decay (tamagotchi mechanics)
        
        Should be called periodically (e.g., daily cron job)
        """
        now = datetime.now(timezone.utc)
        
        # Calculate hours since last interaction
        hours_since_fed = (now - companion.last_fed).total_seconds() / 3600
        hours_since_played = (now - companion.last_played).total_seconds() / 3600
        
        # Decay happiness if not fed (1 point per 6 hours)
        if hours_since_fed > 6:
            decay = int(hours_since_fed / 6)
            companion.happiness = max(0, companion.happiness - decay)
        
        # Decay energy if not played (1 point per 12 hours)
        if hours_since_played > 12:
            decay = int(hours_since_played / 12)
            companion.energy = max(0, companion.energy - decay)
        
        # Update mood based on stats
        companion.mood = self._calculate_mood(companion)
        
        if hasattr(self.session, "commit"):
            await self.session.commit()

    async def apply_stat_decay(self, *args, **kwargs) -> None:
        session = kwargs.pop("session", None)
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            session = args[0]
            companion = args[1]
        else:
            companion = kwargs.get("companion", args[0] if args else None)
        previous_service_session, previous_generator_session = self._bind_session(session)
        try:
            await self.decay_stats(companion)
        finally:
            self._restore_session(previous_service_session, previous_generator_session)

    def calculate_mood(self, companion: Companion) -> str:
        return self._calculate_mood(companion).value

    async def get_companion_stats(self, *args, **kwargs) -> Dict[str, Any]:
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            companion = args[1]
        else:
            companion = kwargs.get("companion", args[0] if args else None)
        return {
            "level": companion.level,
            "xp": companion.xp,
            "xp_to_next_level": getattr(companion, "xp_to_next_level", 500),
            "evolution_stage": companion.evolution_stage,
            "current_form": companion.current_form,
            "happiness": companion.happiness,
            "energy": companion.energy,
            "health": companion.health,
            "mood": self._calculate_mood(companion).value,
        }

    def get_personality_traits_from_archetype(
        self, archetype: ProfessionalArchetype | str
    ) -> Dict[str, str]:
        normalized = self._normalize_archetype(archetype)
        traits = {
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY: ("Rebellious Independent Mentor", "direct", "phoenix"),
            ProfessionalArchetype.ACADEMIC_ELITE: ("Scholarly Academic Guide", "academic", "owl"),
            ProfessionalArchetype.CAREER_MASTERY: ("Strategic Career Coach", "strategic", "compass"),
            ProfessionalArchetype.GLOBAL_PRESENCE: ("Worldly Expansion Guide", "adventurous", "globe"),
            ProfessionalArchetype.FRONTIER_ARCHITECT: ("Systematic Builder", "precise", "blueprint"),
            ProfessionalArchetype.VERIFIED_TALENT: ("Supportive Talent Champion", "supportive", "star"),
            ProfessionalArchetype.FUTURE_GUARDIAN: ("Protective Stability Guardian", "steady", "shield"),
            ProfessionalArchetype.CHANGE_AGENT: ("Purpose-Driven Catalyst", "energizing", "spark"),
            ProfessionalArchetype.KNOWLEDGE_NODE: ("Curious Sage", "reflective", "crystal"),
            ProfessionalArchetype.CONSCIOUS_LEADER: ("Balanced Wisdom Guide", "calm", "lotus"),
            ProfessionalArchetype.CULTURAL_PROTAGONIST: ("Creative Muse", "expressive", "palette"),
            ProfessionalArchetype.DESTINY_ARBITRATOR: ("Optimization Strategist", "analytical", "oracle"),
        }
        personality_type, communication_style, visual_theme = traits.get(
            normalized, ("Supportive Guide", "supportive", "default")
        )
        return {
            "personality_type": personality_type,
            "communication_style": communication_style,
            "visual_theme": visual_theme,
        }

    def get_personality_traits(self, companion: Companion) -> Dict[str, str]:
        return self.get_personality_traits_from_archetype(companion.archetype)

    async def get_unlocked_abilities(self, *args, **kwargs) -> List[Dict[str, Any]]:
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            companion = args[1]
        else:
            companion = kwargs.get("companion", args[0] if args else None)
        abilities = getattr(companion, "abilities", None) or []
        if abilities:
            return abilities
        base_abilities = [
            {"name": "Momentum Pulse", "level": 1, "unlocked": companion.level >= 5},
            {"name": "Focus Surge", "level": 2, "unlocked": companion.level >= 10},
        ]
        return [ability for ability in base_abilities if ability["unlocked"]]

    async def get_evolution_history(self, *args, **kwargs) -> List[Dict[str, Any]]:
        session = kwargs.pop("session", None)
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            session = args[0]
            companion = args[1]
        else:
            companion = kwargs.get("companion", args[0] if args else None)
        if session is not None:
            previous_service_session, previous_generator_session = self._bind_session(session)
            try:
                result = await self.session.execute(
                    select(CompanionEvolution).where(CompanionEvolution.companion_id == companion.id)
                )
                evolutions = result.scalars().all()
                if evolutions:
                    return [
                        {
                            "from_stage": evolution.from_stage,
                            "to_stage": evolution.to_stage,
                            "evolved_at": evolution.evolved_at.isoformat(),
                        }
                        for evolution in evolutions
                    ]
            finally:
                self._restore_session(previous_service_session, previous_generator_session)
        return [
            {
                "from_stage": max(1, getattr(companion, "evolution_stage", 1) - 1),
                "to_stage": getattr(companion, "evolution_stage", 1),
                "evolved_at": datetime.now(timezone.utc).isoformat(),
            }
        ]

    async def get_welcome_message(self, companion: Companion) -> str:
        archetype = self._normalize_archetype(companion.archetype)
        personality = self.get_personality_traits_from_archetype(archetype)
        return self.message_generator.generate_message(
            "encouragement",
            archetype,
            {"milestone_name": "your journey", "personality": personality["personality_type"]},
        )

    async def trigger_evolution(self, *args, **kwargs) -> Dict[str, Any]:
        session = kwargs.pop("session", None)
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            session = args[0]
            companion = args[1]
            new_stage = args[2]
            new_form = args[3]
        else:
            companion = kwargs.get("companion", args[0] if args else None)
            new_stage = kwargs.get("new_stage", args[1] if len(args) > 1 else None)
            new_form = kwargs.get("new_form", args[2] if len(args) > 2 else None)
        previous_service_session, previous_generator_session = self._bind_session(session)
        try:
            old_stage = getattr(companion, "evolution_stage", 1)
            old_form = getattr(companion, "current_form", "egg")
            companion.evolution_stage = new_stage
            companion.current_form = new_form
            companion.happiness = min(100, getattr(companion, "happiness", 0) + 30)
            companion.energy = min(100, getattr(companion, "energy", 0) + 30)
            companion.health = min(100, getattr(companion, "health", 0) + 30)
            return {
                "from_stage": old_stage,
                "to_stage": new_stage,
                "from_form": old_form,
                "to_form": new_form,
            }
        finally:
            self._restore_session(previous_service_session, previous_generator_session)

    async def send_message(self, *args, **kwargs) -> Dict[str, Any]:
        if args and hasattr(args[0], "execute") and hasattr(args[0], "add"):
            companion = args[1]
            message_type = args[2]
            context = args[3] if len(args) > 3 else kwargs.get("context", {})
        else:
            companion = kwargs.get("companion", args[0] if args else None)
            message_type = kwargs.get("message_type", args[1] if len(args) > 1 else "encouragement")
            context = kwargs.get("context", args[2] if len(args) > 2 else {})
        content = self.message_generator.generate_message(
            message_type,
            companion.archetype,
            context,
        )
        return {
            "content": content,
            "message_type": message_type,
        }

    async def get_unread_messages(self, *args, **kwargs) -> List[Dict[str, Any]]:
        return []
    
    async def unlock_ability(
        self,
        companion: Companion,
        ability_name: str,
        ability_description: str
    ) -> None:
        """Unlock a new ability for companion
        
        Args:
            companion: The companion
            ability_name: Name of ability to unlock
            ability_description: Description of the ability
        """
        abilities = companion.abilities or []
        
        # Check if ability already exists
        for ability in abilities:
            if ability.get("name") == ability_name:
                # Upgrade existing ability
                ability["level"] = ability.get("level", 1) + 1
                companion.abilities = abilities
                await self.session.commit()
                return
        
        # Add new ability
        abilities.append({
            "name": ability_name,
            "description": ability_description,
            "level": 1,
            "unlocked": True,
            "unlocked_at": datetime.now(timezone.utc).isoformat()
        })
        
        companion.abilities = abilities
        await self.session.commit()
    
    # Private helper methods
    
    def _generate_companion_name(self, archetype: ProfessionalArchetype) -> str:
        """Generate default companion name based on archetype"""
        names = {
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY: "Phoenix",
            ProfessionalArchetype.ACADEMIC_ELITE: "Athena",
            ProfessionalArchetype.CAREER_MASTERY: "Mentor",
            ProfessionalArchetype.GLOBAL_PRESENCE: "Atlas",
            ProfessionalArchetype.FRONTIER_ARCHITECT: "Builder",
            ProfessionalArchetype.VERIFIED_TALENT: "Champion",
            ProfessionalArchetype.FUTURE_GUARDIAN: "Guardian",
            ProfessionalArchetype.CHANGE_AGENT: "Catalyst",
            ProfessionalArchetype.KNOWLEDGE_NODE: "Sage",
            ProfessionalArchetype.CONSCIOUS_LEADER: "Wisdom",
            ProfessionalArchetype.CULTURAL_PROTAGONIST: "Muse",
            ProfessionalArchetype.DESTINY_ARBITRATOR: "Oracle"
        }
        return names.get(archetype, "Companion")
    
    def _calculate_mood(self, companion: Companion) -> CompanionMood:
        """Calculate companion mood based on stats"""
        happiness = companion.happiness
        energy = companion.energy
        
        # Tired if energy is low
        if energy < 30:
            return CompanionMood.TIRED
        
        # Sad if happiness is low
        if happiness < 40:
            return CompanionMood.SAD
        
        # Excited if both are high
        if happiness >= 80 and energy >= 70:
            return CompanionMood.EXCITED
        
        # Happy if happiness is good
        if happiness >= 70:
            return CompanionMood.HAPPY
        
        # Motivated if making progress
        if companion.route_progress_percentage > 50:
            return CompanionMood.MOTIVATED
        
        return CompanionMood.NEUTRAL
    
    async def _check_evolution_triggers(
        self,
        companion: Companion
    ) -> Optional[Dict[str, Any]]:
        """Check if companion should evolve
        
        Returns:
            Dict with evolution info if evolved, None otherwise
        """
        # Evolution stages based on level
        # Stage 1 (egg): Level 1-5
        # Stage 2 (sprout): Level 6-15
        # Stage 3 (young): Level 16-30
        # Stage 4 (mature): Level 31-50
        # Stage 5 (master): Level 51+
        
        current_stage = companion.evolution_stage
        new_stage = current_stage
        
        if companion.level >= 51 and current_stage < 5:
            new_stage = 5
        elif companion.level >= 31 and current_stage < 4:
            new_stage = 4
        elif companion.level >= 16 and current_stage < 3:
            new_stage = 3
        elif companion.level >= 6 and current_stage < 2:
            new_stage = 2
        
        if new_stage > current_stage:
            return await self._evolve_companion(companion, new_stage)
        
        return None
    
    async def _evolve_companion(
        self,
        companion: Companion,
        new_stage: int
    ) -> Dict[str, Any]:
        """Evolve companion to new stage
        
        Args:
            companion: The companion to evolve
            new_stage: New evolution stage
            
        Returns:
            Dict with evolution details
        """
        old_stage = companion.evolution_stage
        old_form = companion.current_form
        
        # Determine new form based on stage
        forms = ["egg", "sprout", "young", "mature", "master"]
        new_form = forms[new_stage - 1] if new_stage <= 5 else "legendary"
        
        # Update companion
        companion.evolution_stage = new_stage
        companion.current_form = new_form
        
        # Boost stats
        stats = companion.stats or {}
        for key in stats:
            stats[key] = int(stats[key] * 1.3)  # 30% boost
        companion.stats = stats
        
        # Unlock new abilities based on archetype
        archetype_config = await self._get_archetype_config(companion.archetype)
        if archetype_config:
            companion_traits = archetype_config.companion_traits or {}
            abilities = companion_traits.get("abilities", [])
            if new_stage <= len(abilities):
                ability_name = abilities[new_stage - 1]
                await self.unlock_ability(
                    companion,
                    ability_name,
                    f"Unlocked at evolution stage {new_stage}"
                )
        
        # Record evolution
        evolution = CompanionEvolution(
            id=uuid.uuid4(),
            companion_id=companion.id,
            from_stage=old_stage,
            to_stage=new_stage,
            from_form=old_form,
            to_form=new_form,
            evolution_trigger="level_up",
            trigger_details={"level": companion.level},
            level_at_evolution=companion.level,
            xp_at_evolution=companion.xp,
            stats_before={"stage": old_stage},
            stats_after={"stage": new_stage},
            abilities_unlocked=companion.abilities or []
        )
        self.session.add(evolution)
        
        # Generate evolution message
        message = await self.message_generator.generate_evolution_message(
            companion, new_stage, new_form, archetype_config
        )
        self.session.add(message)
        companion.messages_sent += 1
        
        await self.session.commit()
        
        return {
            "evolved": True,
            "old_stage": old_stage,
            "new_stage": new_stage,
            "old_form": old_form,
            "new_form": new_form,
            "stats_boosted": True,
            "abilities_unlocked": companion.abilities
        }
    
    async def _get_archetype_config(self, archetype: str) -> Optional[ArchetypeConfig]:
        """Fetch archetype config from database"""
        result = await self.session.execute(
            select(ArchetypeConfig).where(ArchetypeConfig.archetype == archetype)
        )
        return result.scalar_one_or_none()
    
    async def _create_welcome_message(
        self,
        companion: Companion,
        archetype_config: ArchetypeConfig
    ) -> CompanionMessage:
        """Create welcome message for new companion"""
        
        archetype = archetype_config.archetype
        name = companion.name
        
        welcome_messages = {
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY: 
                f"Hey! I'm {name}, your freedom companion. Together, we'll break chains and build your sovereign future! 🔓",
            ProfessionalArchetype.ACADEMIC_ELITE:
                f"Greetings. I am {name}, your scholarly guide. Let us pursue excellence together. 📚",
            ProfessionalArchetype.CAREER_MASTERY:
                f"Hello! I'm {name}, your career strategist. Ready to master your professional journey? 🎯",
            ProfessionalArchetype.GLOBAL_PRESENCE:
                f"Hi! I'm {name}, your global adventure companion. The world awaits us! 🌍",
            ProfessionalArchetype.FRONTIER_ARCHITECT:
                f"Hello. I'm {name}, your technical mentor. Let's architect your future systematically. 🏗️",
            ProfessionalArchetype.VERIFIED_TALENT:
                f"Hi! I'm {name}, and I believe in you! Let's prove your talent to the world! ⭐",
            ProfessionalArchetype.FUTURE_GUARDIAN:
                f"Hello. I'm {name}, your guardian companion. Together, we'll build a secure future. 🛡️",
            ProfessionalArchetype.CHANGE_AGENT:
                f"Hey! I'm {name}, your impact partner. Ready to create meaningful change? 🌟",
            ProfessionalArchetype.KNOWLEDGE_NODE:
                f"Greetings. I'm {name}, your intellectual companion. Let's explore knowledge together. 🔬",
            ProfessionalArchetype.CONSCIOUS_LEADER:
                f"Hello. I'm {name}, your wisdom guide. Balance and value creation await. 🧘",
            ProfessionalArchetype.CULTURAL_PROTAGONIST:
                f"Hi! I'm {name}, your creative muse. Let's express your unique vision! 🎨",
            ProfessionalArchetype.DESTINY_ARBITRATOR:
                f"Hello. I'm {name}, your optimization partner. Let's maximize your outcomes! 📊"
        }
        
        message_text = welcome_messages.get(
            archetype,
            f"Hello! I'm {name}, your companion on this journey. Let's achieve great things together! 🚀"
        )
        
        return CompanionMessage(
            id=uuid.uuid4(),
            companion_id=companion.id,
            message_type="celebration",
            message_text=message_text,
            archetype_tone=self._get_archetype_tone(archetype_config),
            is_read=False
        )
    
    def _get_archetype_tone(self, archetype_config: ArchetypeConfig) -> str:
        """Extract tone from archetype config"""
        narrative_voice = archetype_config.narrative_voice or {}
        return narrative_voice.get("tone", "supportive")
