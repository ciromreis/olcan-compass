from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..models.companion import Companion as CompanionModel
from ..models.archetype import Archetype as ArchetypeModel
from ..models.activity import CompanionActivity as ActivityModel
from ..schemas.companion import CompanionCreate, CompanionUpdate, CareActivity

class CompanionService:
    def __init__(self, db: Session):
        self.db = db

    def create_companion(self, user_id: str, companion_data: CompanionCreate) -> CompanionModel:
        """Create a new companion for a user"""
        # Get archetype to get initial stats and abilities
        archetype = self.db.query(ArchetypeModel).filter(
            ArchetypeModel.id == companion_data.archetype_id
        ).first()
        
        if not archetype:
            raise ValueError("Archetype not found")
        
        companion = CompanionModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            archetype_id=companion_data.archetype_id,
            name=companion_data.name,
            level=1,
            xp=0,
            xp_to_next=self._calculate_next_level_xp(1),
            evolution_stage="egg",
            abilities=archetype.base_abilities or [],
            stats=archetype.base_stats or {
                "power": 70,
                "wisdom": 70,
                "charisma": 70,
                "agility": 70
            },
            current_health=100,
            max_health=100,
            energy=100,
            max_energy=100,
            created_at=datetime.utcnow(),
            last_cared_at=datetime.utcnow()
        )
        
        self.db.add(companion)
        self.db.commit()
        self.db.refresh(companion)
        return companion

    def get_companion(self, companion_id: str) -> Optional[CompanionModel]:
        """Get a companion by ID"""
        return self.db.query(CompanionModel).filter(
            CompanionModel.id == companion_id
        ).first()

    def get_user_companion(self, user_id: str) -> Optional[CompanionModel]:
        """Get the primary companion for a user"""
        return self.db.query(CompanionModel).filter(
            CompanionModel.user_id == user_id
        ).first()

    def get_user_companions(self, user_id: str) -> List[CompanionModel]:
        """Get all companions for a user"""
        return self.db.query(CompanionModel).filter(
            CompanionModel.user_id == user_id
        ).all()

    def update_companion(self, companion_id: str, update_data: CompanionUpdate) -> CompanionModel:
        """Update a companion"""
        companion = self.get_companion(companion_id)
        if not companion:
            raise ValueError("Companion not found")
        
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(companion, field, value)
        
        companion.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(companion)
        return companion

    def perform_care_activity(self, companion_id: str, activity: CareActivity) -> Dict[str, Any]:
        """Perform a care activity with companion"""
        companion = self.get_companion(companion_id)
        if not companion:
            raise ValueError("Companion not found")
        
        # Check energy
        if companion.energy < activity.energy_cost:
            raise ValueError("Not enough energy")
        
        # Perform activity
        companion.xp += activity.xp_reward
        companion.energy -= activity.energy_cost
        companion.last_cared_at = datetime.utcnow()
        
        # Check for level up
        if companion.xp >= companion.xp_to_next:
            self._level_up_companion(companion)
        
        # Check for evolution
        if self._can_evolve(companion):
            self._evolve_companion(companion)
        
        # Record activity
        activity_record = ActivityModel(
            id=str(uuid.uuid4()),
            companion_id=companion_id,
            activity_type=activity.type,
            xp_reward=activity.xp_reward,
            energy_cost=activity.energy_cost,
            completed_at=datetime.utcnow()
        )
        self.db.add(activity_record)
        
        self.db.commit()
        self.db.refresh(companion)
        
        return {
            "companion": companion,
            "xp_gained": activity.xp_reward,
            "energy_used": activity.energy_cost,
            "leveled_up": companion.xp >= companion.xp_to_next - activity.xp_reward,
            "evolved": self._can_evolve(companion)
        }

    def evolve_companion(self, companion_id: str) -> CompanionModel:
        """Evolve companion to next stage"""
        companion = self.get_companion(companion_id)
        if not companion:
            raise ValueError("Companion not found")
        
        if not self._can_evolve(companion):
            raise ValueError("Companion cannot evolve")
        
        self._evolve_companion(companion)
        self.db.commit()
        self.db.refresh(companion)
        return companion

    def get_companion_stats(self, companion_id: str) -> Dict[str, Any]:
        """Get detailed companion statistics"""
        companion = self.get_companion(companion_id)
        if not companion:
            raise ValueError("Companion not found")
        
        # Get recent activities
        recent_activities = self.db.query(ActivityModel).filter(
            ActivityModel.companion_id == companion_id,
            ActivityModel.completed_at >= datetime.utcnow() - timedelta(days=7)
        ).all()
        
        total_xp_gained = sum(activity.xp_reward for activity in recent_activities)
        total_activities = len(recent_activities)
        
        return {
            "companion": companion,
            "stats": {
                "total_xp_gained": total_xp_gained,
                "activities_this_week": total_activities,
                "average_xp_per_activity": total_xp_gained / max(total_activities, 1),
                "care_streak": self._calculate_care_streak(companion_id),
                "evolution_progress": self._get_evolution_progress(companion),
                "next_evolution": self._get_next_evolution_stage(companion.evolution_stage)
            }
        }

    def delete_companion(self, companion_id: str) -> bool:
        """Delete a companion"""
        companion = self.get_companion(companion_id)
        if not companion:
            return False
        
        self.db.delete(companion)
        self.db.commit()
        return True

    # Private helper methods
    def _calculate_next_level_xp(self, level: int) -> int:
        """Calculate XP required for next level"""
        return int(500 * (1.2 ** (level - 1)))

    def _level_up_companion(self, companion: CompanionModel):
        """Level up a companion"""
        companion.level += 1
        companion.xp_to_next = self._calculate_next_level_xp(companion.level)
        
        # Increase stats
        if companion.stats:
            companion.stats = {
                "power": min(100, companion.stats.get("power", 70) + 5),
                "wisdom": min(100, companion.stats.get("wisdom", 70) + 5),
                "charisma": min(100, companion.stats.get("charisma", 70) + 5),
                "agility": min(100, companion.stats.get("agility", 70) + 5)
            }
        
        # Unlock new abilities
        if companion.abilities:
            new_ability = self._get_ability_for_level(companion.level)
            if new_ability and new_ability not in companion.abilities:
                companion.abilities.append(new_ability)

    def _can_evolve(self, companion: CompanionModel) -> bool:
        """Check if companion can evolve"""
        evolution_requirements = {
            "egg": {"level": 5, "xp": 500},
            "sprout": {"level": 10, "xp": 2000},
            "young": {"level": 20, "xp": 8000},
            "mature": {"level": 30, "xp": 25000},
            "master": {"level": 50, "xp": 100000},
            "legendary": {"level": 100, "xp": 500000}
        }
        
        current_stage = companion.evolution_stage
        if current_stage not in evolution_requirements:
            return False
        
        requirements = evolution_requirements[current_stage]
        return companion.level >= requirements["level"] and companion.xp >= requirements["xp"]

    def _evolve_companion(self, companion: CompanionModel):
        """Evolve companion to next stage"""
        evolution_stages = ["egg", "sprout", "young", "mature", "master", "legendary"]
        current_index = evolution_stages.index(companion.evolution_stage)
        
        if current_index < len(evolution_stages) - 1:
            companion.evolution_stage = evolution_stages[current_index + 1]
            
            # Increase stats significantly
            if companion.stats:
                companion.stats = {
                    "power": min(100, companion.stats.get("power", 70) + 10),
                    "wisdom": min(100, companion.stats.get("wisdom", 70) + 10),
                    "charisma": min(100, companion.stats.get("charisma", 70) + 10),
                    "agility": min(100, companion.stats.get("agility", 70) + 10)
                }
            
            # Increase max health and energy
            companion.max_health += 20
            companion.current_health = companion.max_health
            companion.max_energy += 20
            companion.energy = companion.max_energy

    def _get_ability_for_level(self, level: int) -> Optional[str]:
        """Get ability that unlocks at given level"""
        ability_levels = {
            5: "basic_care",
            10: "social_interaction",
            15: "advanced_abilities",
            20: "ultimate_abilities",
            30: "master_abilities",
            50: "legendary_abilities"
        }
        return ability_levels.get(level)

    def _calculate_care_streak(self, companion_id: str) -> int:
        """Calculate consecutive days of care"""
        today = datetime.utcnow().date()
        streak = 0
        
        for i in range(30):  # Check last 30 days
            check_date = today - timedelta(days=i)
            activities = self.db.query(ActivityModel).filter(
                ActivityModel.companion_id == companion_id,
                ActivityModel.completed_at >= datetime.combine(check_date, datetime.min.time()),
                ActivityModel.completed_at < datetime.combine(check_date, datetime.max.time())
            ).all()
            
            if activities:
                streak += 1
            else:
                break
        
        return streak

    def _get_evolution_progress(self, companion: CompanionModel) -> float:
        """Get evolution progress as percentage"""
        evolution_stages = ["egg", "sprout", "young", "mature", "master", "legendary"]
        current_index = evolution_stages.index(companion.evolution_stage)
        return ((current_index + 1) / len(evolution_stages)) * 100

    def _get_next_evolution_stage(self, current_stage: str) -> Optional[str]:
        """Get next evolution stage"""
        evolution_stages = ["egg", "sprout", "young", "mature", "master", "legendary"]
        current_index = evolution_stages.index(current_stage)
        
        if current_index < len(evolution_stages) - 1:
            return evolution_stages[current_index + 1]
        return None
