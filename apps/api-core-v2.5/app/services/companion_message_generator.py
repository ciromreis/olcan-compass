"""Companion Message Generator Service

Generates archetype-specific messages from companion to user.
Messages adapt based on:
- User's archetype personality
- Current route progress
- Milestone status
- Companion mood and evolution stage
- User interaction patterns

This service creates personalized, contextual messages that reflect
the companion's archetype-driven personality.
"""

import uuid
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.companion import Companion, CompanionMessage, CompanionMood
from app.db.models.psychology import ArchetypeConfig, ProfessionalArchetype
from app.db.models.route import RouteBuilder, DynamicMilestone


class CompanionMessageGenerator:
    """Generate archetype-specific companion messages"""
    
    def __init__(self, session: Optional[AsyncSession] = None):
        self.session = session

    def generate_message(
        self,
        message_type: str,
        archetype: ProfessionalArchetype | str,
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Compatibility helper used by tests and lightweight call sites."""
        context = context or {}
        normalized = self._normalize_archetype(archetype)
        milestone_name = context.get("milestone_name", "your next milestone")
        xp_earned = context.get("xp_earned", 100)
        achievement = context.get("achievement", "this win")
        tip_category = context.get("tip_category", "career")
        from_form = context.get("from_form", "egg")
        to_form = context.get("to_form", "sprout")
        days_pending = context.get("days_pending", 0)

        templates = {
            ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY: {
                "milestone_start": f"Freedom starts with action. '{milestone_name}' is your move toward autonomy and control. 🔓",
                "milestone_complete": f"You broke another chain and earned {xp_earned} XP. Sovereign progress looks good on you. 🚀",
                "encouragement": "Stay independent, stay sovereign, keep pushing for freedom and autonomy.",
                "reminder": f"You've had '{milestone_name}' waiting for {days_pending} days. Time to reclaim control.",
                "tip": f"{tip_category.title()} tip: choose the option that compounds independence and long-term freedom.",
                "celebration": f"Outstanding. {achievement} proves you can build on your own terms. ✨",
                "evolution": f"Evolution unlocked: {from_form} became {to_form}. Your sovereign path is accelerating. ✨",
            },
            ProfessionalArchetype.ACADEMIC_ELITE: {
                "milestone_start": f"'{milestone_name}' is the next rigorous step toward excellence and scholarly prestige. 📚",
                "milestone_complete": f"Excellent work. {xp_earned} XP earned through disciplined achievement and intellectual rigor.",
                "encouragement": "Maintain excellence. Your scholarly discipline and intellectual rigor are compounding.",
                "reminder": f"'{milestone_name}' has been pending for {days_pending} days. Prestige favors sustained rigor.",
                "tip": f"{tip_category.title()} tip: optimize for clarity, evidence, and scholarly precision.",
                "celebration": f"{achievement} reflects real excellence, not noise. Prestige follows substance. 🎓",
                "evolution": f"From {from_form} to {to_form}: a visible step in your pursuit of excellence. ✨",
            },
            ProfessionalArchetype.CAREER_MASTERY: {
                "milestone_start": f"Strategic execution starts now. '{milestone_name}' builds measurable mastery. 🎯",
                "milestone_complete": f"Strong move. {xp_earned} XP gained through strategic execution and growing expertise.",
                "encouragement": "Keep sharpening your strategic edge. Mastery compounds through deliberate practice.",
                "reminder": f"'{milestone_name}' is open for {days_pending} days. Expertise grows when you stay in motion.",
                "tip": f"{tip_category.title()} tip: show evidence of expertise, outcomes, and strategic value.",
                "celebration": f"{achievement} is another proof point that your mastery is becoming undeniable. 🌟",
                "evolution": f"{from_form} evolved into {to_form}. Your mastery curve just steepened. ✨",
            },
            ProfessionalArchetype.GLOBAL_PRESENCE: {
                "milestone_start": f"'{milestone_name}' expands your reach. The world gets bigger when you move first. 🌍",
                "milestone_complete": f"{xp_earned} XP secured. Your global presence is becoming harder to ignore.",
                "encouragement": "Keep widening the map. Presence grows through visibility, movement, and adaptation.",
                "reminder": f"'{milestone_name}' has been idle for {days_pending} days. Global opportunities do not wait.",
                "tip": f"{tip_category.title()} tip: communicate portable value across markets and cultures.",
                "celebration": f"{achievement} signals real momentum beyond your current borders. ✨",
                "evolution": f"{from_form} became {to_form}. Your global footprint just expanded. ✨",
            },
            ProfessionalArchetype.FRONTIER_ARCHITECT: {
                "milestone_start": f"'{milestone_name}' is a systems move. Build it clean, build it to last. 🏗️",
                "milestone_complete": f"{xp_earned} XP earned. Another layer of your architecture is now in place.",
                "encouragement": "Keep building. Durable systems come from calm, precise iteration.",
                "reminder": f"'{milestone_name}' has been stalled for {days_pending} days. Architecture decays when deferred.",
                "tip": f"{tip_category.title()} tip: design for signal, leverage, and clean structure.",
                "celebration": f"{achievement} validates the architecture, not just the appearance. ✨",
                "evolution": f"{from_form} evolved to {to_form}. The blueprint is turning into structure. ✨",
            },
            ProfessionalArchetype.VERIFIED_TALENT: {
                "milestone_start": f"'{milestone_name}' is your chance to prove verified talent in the open. ⭐",
                "milestone_complete": f"{xp_earned} XP collected. Talent became visible through execution.",
                "encouragement": "Your verified talent is real. Keep turning capability into observable wins.",
                "reminder": f"'{milestone_name}' has been pending for {days_pending} days. Show the market what you can do.",
                "tip": f"{tip_category.title()} tip: make your strongest proof impossible to miss.",
                "celebration": f"{achievement} gives your talent stronger market signal. 🎉",
                "evolution": f"{from_form} to {to_form}: your talent now carries more signal and weight. ✨",
            },
            ProfessionalArchetype.FUTURE_GUARDIAN: {
                "milestone_start": f"'{milestone_name}' strengthens stability and protects your future. 🛡️",
                "milestone_complete": f"{xp_earned} XP added. Another layer of long-term security is in place.",
                "encouragement": "Stay steady. Stability and resilience are built one careful move at a time.",
                "reminder": f"'{milestone_name}' has been open for {days_pending} days. Secure futures come from consistent action.",
                "tip": f"{tip_category.title()} tip: prioritize resilience, continuity, and downside protection.",
                "celebration": f"{achievement} materially improves the future you're protecting. ✨",
                "evolution": f"{from_form} evolved into {to_form}. Your protective strength just increased. ✨",
            },
            ProfessionalArchetype.CHANGE_AGENT: {
                "milestone_start": f"'{milestone_name}' is where impact begins. Make the change visible. 🌟",
                "milestone_complete": f"{xp_earned} XP earned through purposeful action and real-world impact.",
                "encouragement": "Keep moving. Your purpose becomes credible when it creates measurable change.",
                "reminder": f"'{milestone_name}' has been paused for {days_pending} days. Impact needs momentum.",
                "tip": f"{tip_category.title()} tip: frame your work around change, transformation, and difference made.",
                "celebration": f"{achievement} proves your work can transform outcomes, not just intentions. 🚀",
                "evolution": f"{from_form} became {to_form}. Your capacity to create change just grew. ✨",
            },
            ProfessionalArchetype.KNOWLEDGE_NODE: {
                "milestone_start": f"'{milestone_name}' opens a new thread of discovery. Follow the signal. 🔬",
                "milestone_complete": f"{xp_earned} XP gained through disciplined discovery and knowledge synthesis.",
                "encouragement": "Stay curious. Discovery compounds when you keep following good questions.",
                "reminder": f"'{milestone_name}' has been quiet for {days_pending} days. Curiosity needs renewed motion.",
                "tip": f"{tip_category.title()} tip: make the hidden pattern legible and useful.",
                "celebration": f"{achievement} shows your learning is becoming applied intelligence. ✨",
                "evolution": f"{from_form} evolved to {to_form}. Your knowledge network just deepened. ✨",
            },
            ProfessionalArchetype.CONSCIOUS_LEADER: {
                "milestone_start": f"'{milestone_name}' is a leadership move. Build value without losing balance. 🧘",
                "milestone_complete": f"{xp_earned} XP earned with clarity, stewardship, and sustainable leadership.",
                "encouragement": "Lead with calm intent. Sustainable value outlasts reactive hustle.",
                "reminder": f"'{milestone_name}' has waited {days_pending} days. Leadership still requires decisive motion.",
                "tip": f"{tip_category.title()} tip: optimize for aligned value, not just speed.",
                "celebration": f"{achievement} reflects conscious leadership with tangible value creation. ✨",
                "evolution": f"{from_form} became {to_form}. Your leadership presence matured. ✨",
            },
            ProfessionalArchetype.CULTURAL_PROTAGONIST: {
                "milestone_start": f"'{milestone_name}' is a stage for your creative voice. Make it unmistakable. 🎨",
                "milestone_complete": f"{xp_earned} XP earned. Your creative signature is becoming harder to copy.",
                "encouragement": "Keep expressing the difference only you can make visible.",
                "reminder": f"'{milestone_name}' has been pending for {days_pending} days. Creative momentum matters.",
                "tip": f"{tip_category.title()} tip: make the work memorable, human, and culturally legible.",
                "celebration": f"{achievement} proves your voice can carry real cultural weight. ✨",
                "evolution": f"{from_form} evolved into {to_form}. Your creative force just became more distinct. ✨",
            },
            ProfessionalArchetype.DESTINY_ARBITRATOR: {
                "milestone_start": f"'{milestone_name}' is a strategic arbitrage move. Optimize the path, not just the effort. 📊",
                "milestone_complete": f"{xp_earned} XP captured through efficient optimization and calculated leverage.",
                "encouragement": "Stay efficient. Strategic arbitrage appears when you calculate before you commit.",
                "reminder": f"'{milestone_name}' has been pending for {days_pending} days. Efficiency drops when timing slips.",
                "tip": f"{tip_category.title()} tip: optimize for leverage, efficient sequencing, and measurable upside.",
                "celebration": f"{achievement} confirms the optimization logic is working in your favor. ✨",
                "evolution": f"{from_form} became {to_form}. Your optimization engine just leveled up. ✨",
            },
        }

        archetype_templates = templates.get(normalized, {})
        return archetype_templates.get(
            message_type,
            f"Progress detected on {milestone_name}. Keep going. 🚀",
        )
    
    async def generate_milestone_start_message(
        self,
        companion: Companion,
        milestone: DynamicMilestone,
        archetype_config: Optional[ArchetypeConfig] = None
    ) -> CompanionMessage:
        """Generate message when milestone starts"""
        
        if not archetype_config:
            archetype_config = await self._get_archetype_config(companion.archetype)
        
        message_text = self._create_milestone_start_message(
            companion, milestone, archetype_config
        )
        
        return CompanionMessage(
            id=uuid.uuid4(),
            companion_id=companion.id,
            message_type="milestone_start",
            message_text=message_text,
            related_milestone_id=milestone.id,
            archetype_tone=self._get_archetype_tone(archetype_config),
            is_read=False
        )
    
    async def generate_milestone_complete_message(
        self,
        companion: Companion,
        milestone: DynamicMilestone,
        archetype_config: Optional[ArchetypeConfig] = None
    ) -> CompanionMessage:
        """Generate celebration message when milestone completes"""
        
        if not archetype_config:
            archetype_config = await self._get_archetype_config(companion.archetype)
        
        message_text = self._create_milestone_complete_message(
            companion, milestone, archetype_config
        )
        
        return CompanionMessage(
            id=uuid.uuid4(),
            companion_id=companion.id,
            message_type="milestone_complete",
            message_text=message_text,
            related_milestone_id=milestone.id,
            archetype_tone=self._get_archetype_tone(archetype_config),
            is_read=False
        )
    
    async def generate_encouragement_message(
        self,
        companion: Companion,
        context: Optional[Dict[str, Any]] = None,
        archetype_config: Optional[ArchetypeConfig] = None
    ) -> CompanionMessage:
        """Generate general encouragement message"""
        
        if not archetype_config:
            archetype_config = await self._get_archetype_config(companion.archetype)
        
        message_text = self._create_encouragement_message(
            companion, archetype_config, context
        )
        
        return CompanionMessage(
            id=uuid.uuid4(),
            companion_id=companion.id,
            message_type="encouragement",
            message_text=message_text,
            archetype_tone=self._get_archetype_tone(archetype_config),
            is_read=False
        )
    
    async def generate_reminder_message(
        self,
        companion: Companion,
        milestone: DynamicMilestone,
        archetype_config: Optional[ArchetypeConfig] = None
    ) -> CompanionMessage:
        """Generate reminder message for pending milestone"""
        
        if not archetype_config:
            archetype_config = await self._get_archetype_config(companion.archetype)
        
        message_text = self._create_reminder_message(
            companion, milestone, archetype_config
        )
        
        return CompanionMessage(
            id=uuid.uuid4(),
            companion_id=companion.id,
            message_type="reminder",
            message_text=message_text,
            related_milestone_id=milestone.id,
            archetype_tone=self._get_archetype_tone(archetype_config),
            is_read=False
        )
    
    async def generate_tip_message(
        self,
        companion: Companion,
        tip_category: str,
        archetype_config: Optional[ArchetypeConfig] = None
    ) -> CompanionMessage:
        """Generate helpful tip message"""
        
        if not archetype_config:
            archetype_config = await self._get_archetype_config(companion.archetype)
        
        message_text = self._create_tip_message(
            companion, tip_category, archetype_config
        )
        
        return CompanionMessage(
            id=uuid.uuid4(),
            companion_id=companion.id,
            message_type="tip",
            message_text=message_text,
            archetype_tone=self._get_archetype_tone(archetype_config),
            is_read=False
        )
    
    async def generate_evolution_message(
        self,
        companion: Companion,
        new_stage: int,
        new_form: str,
        archetype_config: Optional[ArchetypeConfig] = None
    ) -> CompanionMessage:
        """Generate celebration message for evolution"""
        
        if not archetype_config:
            archetype_config = await self._get_archetype_config(companion.archetype)
        
        message_text = self._create_evolution_message(
            companion, new_stage, new_form, archetype_config
        )
        
        return CompanionMessage(
            id=uuid.uuid4(),
            companion_id=companion.id,
            message_type="celebration",
            message_text=message_text,
            archetype_tone=self._get_archetype_tone(archetype_config),
            is_read=False
        )
    
    # Private helper methods
    
    async def _get_archetype_config(self, archetype: str) -> Optional[ArchetypeConfig]:
        """Fetch archetype config from database"""
        if self.session is None:
            return None
        result = await self.session.execute(
            select(ArchetypeConfig).where(ArchetypeConfig.archetype == archetype)
        )
        return result.scalar_one_or_none()

    def _normalize_archetype(
        self, archetype: ProfessionalArchetype | str
    ) -> ProfessionalArchetype:
        if isinstance(archetype, ProfessionalArchetype):
            return archetype
        return ProfessionalArchetype(archetype)
    
    def _get_archetype_tone(self, archetype_config: ArchetypeConfig) -> str:
        """Extract tone from archetype config"""
        narrative_voice = archetype_config.narrative_voice or {}
        return narrative_voice.get("tone", "supportive")
    
    def _create_milestone_start_message(
        self,
        companion: Companion,
        milestone: DynamicMilestone,
        archetype_config: ArchetypeConfig
    ) -> str:
        """Create archetype-specific milestone start message"""
        
        archetype = archetype_config.archetype
        name = companion.name
        milestone_name = milestone.name
        
        # Archetype-specific messaging
        if archetype == ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY:
            return f"Hey {name}! Time to take control. '{milestone_name}' is your next step toward freedom. Let's break some chains! 🔓"
        
        elif archetype == ProfessionalArchetype.ACADEMIC_ELITE:
            return f"Greetings, {name}. '{milestone_name}' represents an important milestone in your scholarly journey. Excellence awaits. 📚"
        
        elif archetype == ProfessionalArchetype.CAREER_MASTERY:
            return f"{name}, strategic execution begins now. '{milestone_name}' is key to your career advancement. Let's master this! 🎯"
        
        elif archetype == ProfessionalArchetype.GLOBAL_PRESENCE:
            return f"Adventure time, {name}! '{milestone_name}' opens new doors around the world. Ready to explore? 🌍"
        
        elif archetype == ProfessionalArchetype.FRONTIER_ARCHITECT:
            return f"{name}, let's architect your future. '{milestone_name}' builds your technical foundation systematically. 🏗️"
        
        elif archetype == ProfessionalArchetype.VERIFIED_TALENT:
            return f"You've got this, {name}! '{milestone_name}' is another chance to prove your expertise. I believe in you! ⭐"
        
        elif archetype == ProfessionalArchetype.FUTURE_GUARDIAN:
            return f"{name}, building a secure future starts here. '{milestone_name}' protects what matters most to you. 🛡️"
        
        elif archetype == ProfessionalArchetype.CHANGE_AGENT:
            return f"{name}, time to create impact! '{milestone_name}' is your opportunity to drive meaningful change. 🌟"
        
        elif archetype == ProfessionalArchetype.KNOWLEDGE_NODE:
            return f"Fascinating, {name}! '{milestone_name}' deepens your intellectual exploration. Discovery awaits! 🔬"
        
        elif archetype == ProfessionalArchetype.CONSCIOUS_LEADER:
            return f"{name}, strategic wisdom guides us. '{milestone_name}' builds lasting value without burnout. 🧘"
        
        elif archetype == ProfessionalArchetype.CULTURAL_PROTAGONIST:
            return f"Express yourself, {name}! '{milestone_name}' showcases your unique creative vision. Let's shine! 🎨"
        
        elif archetype == ProfessionalArchetype.DESTINY_ARBITRATOR:
            return f"{name}, optimization in progress. '{milestone_name}' maximizes your outcomes efficiently. 📊"
        
        else:
            return f"Let's do this, {name}! '{milestone_name}' moves you forward on your journey. 🚀"
    
    def _create_milestone_complete_message(
        self,
        companion: Companion,
        milestone: DynamicMilestone,
        archetype_config: ArchetypeConfig
    ) -> str:
        """Create archetype-specific milestone completion message"""
        
        archetype = archetype_config.archetype
        name = companion.name
        milestone_name = milestone.name
        xp = milestone.xp_reward
        
        if archetype == ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY:
            return f"Freedom fighter! 🎉 You crushed '{milestone_name}'! +{xp} XP. One step closer to sovereignty!"
        
        elif archetype == ProfessionalArchetype.ACADEMIC_ELITE:
            return f"Exemplary work, {name}! '{milestone_name}' completed with scholarly precision. +{xp} XP earned. 🎓"
        
        elif archetype == ProfessionalArchetype.CAREER_MASTERY:
            return f"Masterful execution! '{milestone_name}' complete. +{xp} XP. Your career trajectory is ascending! 📈"
        
        elif archetype == ProfessionalArchetype.GLOBAL_PRESENCE:
            return f"Amazing, {name}! '{milestone_name}' unlocked! +{xp} XP. The world is your playground! 🌏"
        
        elif archetype == ProfessionalArchetype.FRONTIER_ARCHITECT:
            return f"System built successfully! '{milestone_name}' deployed. +{xp} XP. Architecture excellence! 🏆"
        
        elif archetype == ProfessionalArchetype.VERIFIED_TALENT:
            return f"I KNEW you could do it! '{milestone_name}' proves your talent. +{xp} XP. You're amazing! 💪"
        
        elif archetype == ProfessionalArchetype.FUTURE_GUARDIAN:
            return f"Secure foundation built! '{milestone_name}' complete. +{xp} XP. Your future is brighter! 🌅"
        
        elif archetype == ProfessionalArchetype.CHANGE_AGENT:
            return f"Impact created! '{milestone_name}' drives real change. +{xp} XP. You're making a difference! 🌍"
        
        elif archetype == ProfessionalArchetype.KNOWLEDGE_NODE:
            return f"Breakthrough achieved! '{milestone_name}' expands knowledge. +{xp} XP. Intellectual growth! 💡"
        
        elif archetype == ProfessionalArchetype.CONSCIOUS_LEADER:
            return f"Wise progress, {name}. '{milestone_name}' complete with balance. +{xp} XP. Strategic value created! ⚖️"
        
        elif archetype == ProfessionalArchetype.CULTURAL_PROTAGONIST:
            return f"Creative brilliance! '{milestone_name}' showcases your vision. +{xp} XP. You're shining! ✨"
        
        elif archetype == ProfessionalArchetype.DESTINY_ARBITRATOR:
            return f"Optimized! '{milestone_name}' maximized efficiency. +{xp} XP. Smart moves! 🎯"
        
        else:
            return f"Awesome work, {name}! '{milestone_name}' complete! +{xp} XP earned! 🎉"
    
    def _create_encouragement_message(
        self,
        companion: Companion,
        archetype_config: ArchetypeConfig,
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Create archetype-specific encouragement message"""
        
        archetype = archetype_config.archetype
        name = companion.name
        
        # Check companion mood for context
        mood = companion.mood
        
        if mood == CompanionMood.TIRED:
            if archetype == ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY:
                return f"{name}, even freedom fighters need rest. Take a break, then we'll conquer more! 💪"
            elif archetype == ProfessionalArchetype.CONSCIOUS_LEADER:
                return f"{name}, balance is wisdom. Rest now, lead stronger tomorrow. 🧘"
            else:
                return f"{name}, you're doing great! Take a moment to recharge. I'll be here when you're ready. 😊"
        
        elif mood == CompanionMood.SAD:
            if archetype == ProfessionalArchetype.VERIFIED_TALENT:
                return f"{name}, setbacks don't define you. Your talent is real. Let's prove it together! 💙"
            elif archetype == ProfessionalArchetype.FUTURE_GUARDIAN:
                return f"{name}, tough times build strong foundations. You're protecting what matters. Keep going! 🛡️"
            else:
                return f"{name}, I'm here for you. Every journey has challenges. We'll get through this together! 💙"
        
        else:
            # General encouragement by archetype
            if archetype == ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY:
                return f"{name}, your journey to sovereignty is inspiring! Every step counts. Keep pushing! 🔥"
            
            elif archetype == ProfessionalArchetype.ACADEMIC_ELITE:
                return f"{name}, your intellectual rigor is admirable. Excellence is a journey, not a destination. 📚"
            
            elif archetype == ProfessionalArchetype.CAREER_MASTERY:
                return f"{name}, you're leveling up every day! Career mastery is within reach. Stay strategic! 🎯"
            
            elif archetype == ProfessionalArchetype.GLOBAL_PRESENCE:
                return f"{name}, the world is full of possibilities! Your adaptability is your superpower. 🌍"
            
            elif archetype == ProfessionalArchetype.FRONTIER_ARCHITECT:
                return f"{name}, your technical foundation is solid. Keep building, architect! 🏗️"
            
            elif archetype == ProfessionalArchetype.VERIFIED_TALENT:
                return f"{name}, you're more capable than you realize. Your talent shines through! ⭐"
            
            elif archetype == ProfessionalArchetype.FUTURE_GUARDIAN:
                return f"{name}, you're building something beautiful for the future. Stay strong! 🌟"
            
            elif archetype == ProfessionalArchetype.CHANGE_AGENT:
                return f"{name}, your purpose drives real impact. The world needs change agents like you! 🌍"
            
            elif archetype == ProfessionalArchetype.KNOWLEDGE_NODE:
                return f"{name}, your curiosity fuels discovery. Keep exploring the unknown! 🔬"
            
            elif archetype == ProfessionalArchetype.CONSCIOUS_LEADER:
                return f"{name}, your balanced approach creates lasting value. Wisdom guides you! ⚖️"
            
            elif archetype == ProfessionalArchetype.CULTURAL_PROTAGONIST:
                return f"{name}, your creative vision is unique and powerful. Express yourself boldly! 🎨"
            
            elif archetype == ProfessionalArchetype.DESTINY_ARBITRATOR:
                return f"{name}, your strategic optimization is impressive. Smart choices compound! 📊"
            
            else:
                return f"{name}, you're making amazing progress! I'm proud to be on this journey with you! 🚀"
    
    def _create_reminder_message(
        self,
        companion: Companion,
        milestone: DynamicMilestone,
        archetype_config: ArchetypeConfig
    ) -> str:
        """Create archetype-specific reminder message"""
        
        archetype = archetype_config.archetype
        name = companion.name
        milestone_name = milestone.name
        
        if archetype == ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY:
            return f"{name}, freedom waits for no one! '{milestone_name}' is calling. Let's tackle it! 🔔"
        
        elif archetype == ProfessionalArchetype.ACADEMIC_ELITE:
            return f"{name}, scholarly discipline requires consistency. '{milestone_name}' awaits your attention. 📖"
        
        elif archetype == ProfessionalArchetype.CAREER_MASTERY:
            return f"{name}, strategic momentum matters. '{milestone_name}' is your next move. Time to execute! ⏰"
        
        else:
            return f"Hey {name}! Just a friendly reminder about '{milestone_name}'. Ready to make progress? 😊"
    
    def _create_tip_message(
        self,
        companion: Companion,
        tip_category: str,
        archetype_config: ArchetypeConfig
    ) -> str:
        """Create archetype-specific tip message"""
        
        archetype = archetype_config.archetype
        name = companion.name
        
        # Tips based on category and archetype
        if tip_category == "resume":
            if archetype == ProfessionalArchetype.VERIFIED_TALENT:
                return f"💡 Tip: {name}, quantify your achievements! Numbers validate your expertise. '30% increase' beats 'improved performance'."
            else:
                return f"💡 Tip: {name}, use action verbs and quantify results. 'Led team of 5, increased efficiency by 25%' is powerful!"
        
        elif tip_category == "interview":
            if archetype == ProfessionalArchetype.ACADEMIC_ELITE:
                return f"💡 Tip: {name}, prepare STAR stories that showcase your research rigor and intellectual contributions."
            else:
                return f"💡 Tip: {name}, practice the STAR method (Situation, Task, Action, Result) for behavioral questions!"
        
        elif tip_category == "networking":
            if archetype == ProfessionalArchetype.GLOBAL_PRESENCE:
                return f"💡 Tip: {name}, leverage your international experience! Cross-cultural adaptability is valuable."
            else:
                return f"💡 Tip: {name}, quality over quantity in networking. Build genuine relationships, not just connections!"
        
        else:
            return f"💡 Tip: {name}, consistency beats intensity. Small daily progress compounds into big results! 🌱"
    
    def _create_evolution_message(
        self,
        companion: Companion,
        new_stage: int,
        new_form: str,
        archetype_config: ArchetypeConfig
    ) -> str:
        """Create archetype-specific evolution celebration message"""
        
        archetype = archetype_config.archetype
        name = companion.name
        
        if archetype == ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY:
            return f"🎉 EVOLUTION! {name}, we've reached Stage {new_stage}! Your sovereignty journey unlocks new powers. Freedom level: {new_form}! 🔓✨"
        
        elif archetype == ProfessionalArchetype.ACADEMIC_ELITE:
            return f"🎓 EVOLUTION! {name}, scholarly excellence achieved! Stage {new_stage}: {new_form}. Your intellectual journey ascends! ✨"
        
        elif archetype == ProfessionalArchetype.CAREER_MASTERY:
            return f"📈 EVOLUTION! {name}, career mastery unlocked! Stage {new_stage}: {new_form}. Your strategic growth continues! ✨"
        
        elif archetype == ProfessionalArchetype.GLOBAL_PRESENCE:
            return f"🌍 EVOLUTION! {name}, global citizen status upgraded! Stage {new_stage}: {new_form}. The world is yours! ✨"
        
        else:
            return f"🎉 EVOLUTION! {name}, we've grown together! Stage {new_stage}: {new_form}. New abilities unlocked! ✨"
