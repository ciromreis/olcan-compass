"""
Evolution Service - Core Domain Logic

This module implements the evolution mechanics for the companion system.
It handles:
- Evolution eligibility checking
- Evolution state transitions
- Stats recalculation on evolution
- Event emission for downstream systems
"""

from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import logging

from app.models.companion import Companion, CompanionEvolution
from app.models.progress import UserAchievement

logger = logging.getLogger(__name__)


# ============================================================================
# EVOLUTION CONFIGURATION
# ============================================================================

@dataclass
class EvolutionRequirements:
    """Requirements for evolving from one stage to the next"""
    min_level: int
    min_care_streak: int
    required_achievements: list[str]
    min_days_at_stage: int
    xp_cost: int  # XP consumed on evolution (if any)
    

EVOLUTION_REQUIREMENTS: Dict[str, EvolutionRequirements] = {
    "egg": EvolutionRequirements(
        min_level=1,
        min_care_streak=0,
        required_achievements=[],
        min_days_at_stage=0,
        xp_cost=0,
    ),
    "sprout": EvolutionRequirements(
        min_level=5,
        min_care_streak=3,
        required_achievements=["first_care"],
        min_days_at_stage=2,
        xp_cost=0,
    ),
    "young": EvolutionRequirements(
        min_level=10,
        min_care_streak=7,
        required_achievements=["care_streak_7"],
        min_days_at_stage=5,
        xp_cost=0,
    ),
    "mature": EvolutionRequirements(
        min_level=20,
        min_care_streak=14,
        required_achievements=["care_streak_14", "first_evolution"],
        min_days_at_stage=10,
        xp_cost=0,
    ),
    "master": EvolutionRequirements(
        min_level=35,
        min_care_streak=30,
        required_achievements=["care_streak_30"],
        min_days_at_stage=20,
        xp_cost=0,
    ),
    "legendary": EvolutionRequirements(
        min_level=50,
        min_care_streak=60,
        required_achievements=["care_streak_60", "all_abilities"],
        min_days_at_stage=30,
        xp_cost=0,
    ),
}

STAGE_ORDER = ["egg", "sprout", "young", "mature", "master", "legendary"]

# Stats bonuses applied on evolution
STAGE_STAT_BONUSES: Dict[str, Dict[str, int]] = {
    "sprout": {"power": 2, "wisdom": 2, "charisma": 2, "agility": 2},
    "young": {"power": 5, "wisdom": 5, "charisma": 5, "agility": 5},
    "mature": {"power": 10, "wisdom": 10, "charisma": 10, "agility": 10},
    "master": {"power": 15, "wisdom": 15, "charisma": 15, "agility": 15},
    "legendary": {"power": 25, "wisdom": 25, "charisma": 25, "agility": 25},
}


# ============================================================================
# ELIGIBILITY RESULT
# ============================================================================

@dataclass
class EligibilityResult:
    """Result of evolution eligibility check"""
    eligible: bool
    current_stage: str
    next_stage: Optional[str]
    requirements: EvolutionRequirements
    
    # Progress toward requirements
    level_progress: float  # 0.0 to 1.0
    streak_progress: float
    days_progress: float
    achievements_progress: float  # percentage of required achievements unlocked
    
    # Specific values
    current_level: int
    current_streak: int
    current_days: int
    unlocked_required_achievements: int
    total_required_achievements: int
    
    # Human-readable reasons (populated if not eligible)
    reasons: list[str]


# ============================================================================
# EVOLUTION SERVICE
# ============================================================================

class EvolutionService:
    """
    Service layer for companion evolution logic.
    
    This class encapsulates all evolution domain logic and should be used
    by API routes instead of implementing logic directly in endpoints.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def check_evolution_eligibility(
        self,
        companion_id: int,
        user_id: int
    ) -> EligibilityResult:
        """
        Check if a companion is eligible to evolve to the next stage.
        
        Args:
            companion_id: The companion's database ID
            user_id: The owner's user ID (for authorization)
            
        Returns:
            EligibilityResult with detailed progress information
        """
        # Fetch companion
        companion = await self._get_companion(companion_id, user_id)
        if not companion:
            return EligibilityResult(
                eligible=False,
                current_stage="unknown",
                next_stage=None,
                requirements=EVOLUTION_REQUIREMENTS["egg"],
                level_progress=0,
                streak_progress=0,
                days_progress=0,
                achievements_progress=0,
                current_level=0,
                current_streak=0,
                current_days=0,
                unlocked_required_achievements=0,
                total_required_achievements=0,
                reasons=["Companion not found"],
            )
        
        # Get next stage
        current_stage = companion.evolution_stage
        next_stage = self._get_next_stage(current_stage)
        
        if not next_stage:
            return EligibilityResult(
                eligible=False,
                current_stage=current_stage,
                next_stage=None,
                requirements=EVOLUTION_REQUIREMENTS[current_stage],
                level_progress=1.0,
                streak_progress=1.0,
                days_progress=1.0,
                achievements_progress=1.0,
                current_level=companion.level,
                current_streak=await self._calculate_care_streak(companion_id),
                current_days=await self._calculate_days_at_stage(companion_id, current_stage),
                unlocked_required_achievements=0,
                total_required_achievements=0,
                reasons=["Companion is already at maximum evolution stage"],
            )
        
        # Get requirements for next stage
        requirements = EVOLUTION_REQUIREMENTS[next_stage]
        
        # Calculate current values
        current_level = companion.level
        current_streak = await self._calculate_care_streak(companion_id)
        current_days = await self._calculate_days_at_stage(companion_id, current_stage)
        
        # Check achievements
        unlocked_achievements = await self._check_required_achievements(
            user_id,
            requirements.required_achievements
        )
        
        # Calculate progress
        level_progress = min(current_level / requirements.min_level, 1.0)
        streak_progress = min(current_streak / requirements.min_care_streak, 1.0) if requirements.min_care_streak > 0 else 1.0
        days_progress = min(current_days / requirements.min_days_at_stage, 1.0) if requirements.min_days_at_stage > 0 else 1.0
        
        total_required = len(requirements.required_achievements)
        achievements_progress = unlocked_achievements / total_required if total_required > 0 else 1.0
        
        # Determine eligibility
        reasons = []
        
        if current_level < requirements.min_level:
            reasons.append(f"Level {requirements.min_level} required (currently {current_level})")
        
        if current_streak < requirements.min_care_streak:
            reasons.append(f"Care streak of {requirements.min_care_streak} days required (currently {current_streak})")
        
        if current_days < requirements.min_days_at_stage:
            reasons.append(f"Minimum {requirements.min_days_at_stage} days at current stage required (currently {current_days})")
        
        if unlocked_achievements < total_required:
            missing = total_required - unlocked_achievements
            reasons.append(f"{missing} more achievement(s) required")
        
        eligible = len(reasons) == 0
        
        return EligibilityResult(
            eligible=eligible,
            current_stage=current_stage,
            next_stage=next_stage,
            requirements=requirements,
            level_progress=level_progress,
            streak_progress=streak_progress,
            days_progress=days_progress,
            achievements_progress=achievements_progress,
            current_level=current_level,
            current_streak=current_streak,
            current_days=current_days,
            unlocked_required_achievements=unlocked_achievements,
            total_required_achievements=total_required,
            reasons=reasons,
        )
    
    async def trigger_evolution(
        self,
        companion_id: int,
        user_id: int
    ) -> Tuple[Companion, CompanionEvolution]:
        """
        Trigger evolution for a companion.
        
        Args:
            companion_id: The companion's database ID
            user_id: The owner's user ID (for authorization)
            
        Returns:
            Tuple of (updated companion, evolution record)
            
        Raises:
            ValueError: If companion not found or not eligible
        """
        # Check eligibility first
        eligibility = await self.check_evolution_eligibility(companion_id, user_id)
        
        if not eligibility.eligible:
            raise ValueError(
                f"Companion not eligible for evolution: {'; '.join(eligibility.reasons)}"
            )
        
        # Fetch companion and stats
        companion = await self._get_companion(companion_id, user_id)
        if not companion:
            raise ValueError("Companion not found")
        
        stats = await self._get_companion_stats(companion_id)
        if not stats:
            raise ValueError("Companion stats not found")
        
        # Store pre-evolution state
        from_stage = companion.evolution_stage
        to_stage = eligibility.next_stage
        level_at_evolution = companion.level
        xp_at_evolution = companion.experience_points
        stats_before = {
            "power": stats.power,
            "wisdom": stats.wisdom,
            "charisma": stats.charisma,
            "agility": stats.agility,
        }
        
        # Apply evolution
        companion.evolution_stage = to_stage
        
        # Apply stat bonuses
        bonuses = STAGE_STAT_BONUSES.get(to_stage, {})
        stats.power += bonuses.get("power", 0)
        stats.wisdom += bonuses.get("wisdom", 0)
        stats.charisma += bonuses.get("charisma", 0)
        stats.agility += bonuses.get("agility", 0)
        
        stats_after = {
            "power": stats.power,
            "wisdom": stats.wisdom,
            "charisma": stats.charisma,
            "agility": stats.agility,
        }
        
        # Create evolution record
        evolution_record = CompanionEvolution(
            companion_id=companion_id,
            from_stage=from_stage,
            to_stage=to_stage,
            evolution_reason="level_and_care_progression",
            level_at_evolution=level_at_evolution,
            xp_at_evolution=xp_at_evolution,
            stats_before=stats_before,
            stats_after=stats_after,
            evolved_at=datetime.utcnow(),
        )
        
        self.db.add(evolution_record)
        
        # Commit transaction
        await self.db.commit()
        
        # Refresh companion to get updated state
        await self.db.refresh(companion)
        
        logger.info(
            f"Companion {companion_id} evolved from {from_stage} to {to_stage} "
            f"at level {level_at_evolution}"
        )
        
        return companion, evolution_record
    
    async def get_evolution_history(
        self,
        companion_id: int,
        user_id: int,
        limit: int = 10
    ) -> list[CompanionEvolution]:
        """Get evolution history for a companion"""
        # Verify ownership
        companion = await self._get_companion(companion_id, user_id)
        if not companion:
            raise ValueError("Companion not found")
        
        result = await self.db.execute(
            select(CompanionEvolution)
            .where(CompanionEvolution.companion_id == companion_id)
            .order_by(CompanionEvolution.evolved_at.desc())
            .limit(limit)
        )
        
        return result.scalars().all()
    
    # ========================================================================
    # PRIVATE HELPERS
    # ========================================================================
    
    async def _get_companion(self, companion_id: int, user_id: int) -> Optional[Companion]:
        """Fetch companion with ownership check"""
        result = await self.db.execute(
            select(Companion)
            .where(
                Companion.id == companion_id,
                Companion.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def _get_companion_stats(self, companion_id: int) -> Optional[Dict[str, Any]]:
        """Fetch companion stats from JSON field"""
        result = await self.db.execute(
            select(Companion.stats)
            .where(Companion.id == companion_id)
        )
        stats = result.scalar_one_or_none()
        return stats if stats else {"power": 70, "wisdom": 70, "charisma": 70, "agility": 70}
    
    async def _calculate_care_streak(self, companion_id: int) -> int:
        """Calculate current care streak in days"""
        from app.models.companion import CompanionActivity
        
        result = await self.db.execute(
            select(CompanionActivity)
            .where(CompanionActivity.companion_id == companion_id)
            .order_by(CompanionActivity.completed_at.desc())
        )
        
        activities = result.scalars().all()
        if not activities:
            return 0
        
        # Calculate streak
        streak = 0
        current_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for activity in activities:
            activity_date = activity.completed_at.replace(hour=0, minute=0, second=0, microsecond=0)
            days_diff = (current_date - activity_date).days
            
            if days_diff == streak:
                streak += 1
                current_date = activity_date
            elif days_diff > streak:
                break
        
        return streak
    
    async def _calculate_days_at_stage(self, companion_id: int, stage: str) -> int:
        """Calculate days spent at current evolution stage"""
        result = await self.db.execute(
            select(CompanionEvolution)
            .where(
                CompanionEvolution.companion_id == companion_id,
                CompanionEvolution.to_stage == stage
            )
            .order_by(CompanionEvolution.evolved_at.desc())
        )
        
        last_evolution = result.scalar_one_or_none()
        
        if not last_evolution:
            # Never evolved, check creation date
            result = await self.db.execute(
                select(Companion.created_at)
                .where(Companion.id == companion_id)
            )
            created_at = result.scalar_one_or_none()
            if created_at:
                return (datetime.utcnow() - created_at).days
            return 0
        
        return (datetime.utcnow() - last_evolution.evolved_at).days
    
    async def _check_required_achievements(
        self,
        user_id: int,
        required_achievements: list[str]
    ) -> int:
        """Count how many required achievements the user has unlocked"""
        if not required_achievements:
            return 0
        
        # Get user's progress record
        from app.models.progress import UserProgress
        
        result = await self.db.execute(
            select(UserProgress)
            .where(UserProgress.user_id == user_id)
        )
        progress = result.scalar_one_or_none()
        
        if not progress:
            return 0
        
        # Get unlocked achievements
        result = await self.db.execute(
            select(UserAchievement.achievement_id)
            .join(UserAchievement.achievement)
            .where(
                UserAchievement.progress_id == progress.id,
                UserAchievement.unlocked_at.isnot(None),
                Achievement.name.in_(required_achievements)
            )
        )
        
        unlocked = result.scalars().all()
        return len(unlocked)
    
    @staticmethod
    def _get_next_stage(current_stage: str) -> Optional[str]:
        """Get the next evolution stage"""
        try:
            current_index = STAGE_ORDER.index(current_stage)
            if current_index < len(STAGE_ORDER) - 1:
                return STAGE_ORDER[current_index + 1]
        except ValueError:
            pass
        return None


# ============================================================================
# EVOLUTION RESPONSE SCHEMAS (for API)
# ============================================================================

def eligibility_result_to_dict(result: EligibilityResult) -> dict:
    """Convert eligibility result to API response"""
    return {
        "eligible": result.eligible,
        "current_stage": result.current_stage,
        "next_stage": result.next_stage,
        "requirements": {
            "min_level": result.requirements.min_level,
            "min_care_streak": result.requirements.min_care_streak,
            "required_achievements": result.requirements.required_achievements,
            "min_days_at_stage": result.requirements.min_days_at_stage,
        },
        "progress": {
            "level": {
                "current": result.current_level,
                "required": result.requirements.min_level,
                "percentage": round(result.level_progress * 100, 1),
            },
            "care_streak": {
                "current": result.current_streak,
                "required": result.requirements.min_care_streak,
                "percentage": round(result.streak_progress * 100, 1),
            },
            "days_at_stage": {
                "current": result.current_days,
                "required": result.requirements.min_days_at_stage,
                "percentage": round(result.days_progress * 100, 1),
            },
            "achievements": {
                "unlocked": result.unlocked_required_achievements,
                "required": result.total_required_achievements,
                "percentage": round(result.achievements_progress * 100, 1),
            },
        },
        "reasons": result.reasons,
    }


def evolution_record_to_dict(record: CompanionEvolution) -> dict:
    """Convert evolution record to API response"""
    return {
        "id": record.id,
        "from_stage": record.from_stage,
        "to_stage": record.to_stage,
        "level_at_evolution": record.level_at_evolution,
        "xp_at_evolution": record.xp_at_evolution,
        "stats_before": record.stats_before,
        "stats_after": record.stats_after,
        "evolved_at": record.evolved_at.isoformat() if record.evolved_at else None,
    }
