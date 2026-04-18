"""XP and Level calculation service for gamification system.

Implements the XP reward system, level progression, and streak tracking
inspired by Life Architect 2's gamification engine.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.task import UserProgress, Achievement, UserAchievement


# ============================================================
# Configuration
# ============================================================

# Level thresholds (cumulative XP required)
LEVEL_THRESHOLDS = {
    1: 0,        # Explorer
    2: 100,      # Traveler  
    3: 250,      # Navigator
    4: 500,      # Pathfinder
    5: 1000,     # Voyager
    6: 2000,     # Ambassador
    7: 4000,     # Diplomat
    8: 8000,     # Consul
    9: 16000,    # Commissioner
    10: 32000,   # Legend
}

# Level titles
LEVEL_TITLES = {
    1: "Explorador",
    2: "Viajante",
    3: "Navegador",
    4: "Desbravador",
    5: "Voyager",
    6: "Embaixador",
    7: "Diplomata",
    8: "Cônsul",
    9: "Comissário",
    10: "Lenda",
}

# XP rewards
XP_REWARDS = {
    "task_complete_base": 10,
    "task_complete_high": 25,
    "task_complete_critical": 50,
    "streak_bonus_per_day": 5,
    "first_task_of_day": 15,
    "route_completion_bonus": 500,
    "achievement_unlock_bonus_multiplier": 1.5,
}

# Streak configuration
STREAK_COOLDOWN_HOURS = 36  # Hours before streak breaks (allows some flexibility)


# ============================================================
# XP Calculator
# ============================================================

class XPCalculator:
    """Calculate XP rewards and level progression."""
    
    @staticmethod
    def calculate_task_xp(priority: str, is_first_task_today: bool = False, streak_days: int = 0) -> int:
        """Calculate XP reward for completing a task.
        
        Args:
            priority: Task priority (critical, high, medium, low)
            is_first_task_today: Whether this is the user's first task today
            streak_days: Current streak days
            
        Returns:
            Total XP to award
        """
        # Base XP by priority
        base_xp = {
            "critical": XP_REWARDS["task_complete_critical"],
            "high": XP_REWARDS["task_complete_high"],
            "medium": XP_REWARDS["task_complete_base"],
            "low": XP_REWARDS["task_complete_base"],
        }.get(priority, XP_REWARDS["task_complete_base"])
        
        total_xp = base_xp
        
        # First task of day bonus
        if is_first_task_today:
            total_xp += XP_REWARDS["first_task_of_day"]
        
        # Streak bonus
        if streak_days > 0:
            streak_bonus = streak_days * XP_REWARDS["streak_bonus_per_day"]
            total_xp += streak_bonus
        
        return total_xp
    
    @staticmethod
    def calculate_level_from_xp(total_xp: int) -> int:
        """Determine user level based on total XP.
        
        Args:
            total_xp: User's cumulative XP
            
        Returns:
            Current level (1-10)
        """
        level = 1
        for threshold_level, threshold_xp in sorted(LEVEL_THRESHOLDS.items()):
            if total_xp >= threshold_xp:
                level = threshold_level
            else:
                break
        return min(level, 10)  # Cap at level 10
    
    @staticmethod
    def get_xp_for_next_level(total_xp: int) -> tuple[int, int]:
        """Get XP needed to reach next level.
        
        Args:
            total_xp: User's current total XP
            
        Returns:
            Tuple of (xp_needed, next_level_threshold)
        """
        current_level = XPCalculator.calculate_level_from_xp(total_xp)
        
        if current_level >= 10:
            return 0, LEVEL_THRESHOLDS[10]  # Max level
        
        next_level = current_level + 1
        next_threshold = LEVEL_THRESHOLDS[next_level]
        xp_needed = next_threshold - total_xp
        
        return xp_needed, next_threshold
    
    @staticmethod
    def get_level_progress(total_xp: int) -> float:
        """Calculate progress percentage to next level (0-100).
        
        Args:
            total_xp: User's current total XP
            
        Returns:
            Progress percentage (0.0 to 100.0)
        """
        current_level = XPCalculator.calculate_level_from_xp(total_xp)
        
        if current_level >= 10:
            return 100.0
        
        current_threshold = LEVEL_THRESHOLDS[current_level]
        next_threshold = LEVEL_THRESHOLDS[current_level + 1]
        
        progress = ((total_xp - current_threshold) / (next_threshold - current_threshold)) * 100
        return min(max(progress, 0), 100)


# ============================================================
# Streak Manager
# ============================================================

class StreakManager:
    """Manage user streak tracking."""
    
    @staticmethod
    def should_update_streak(last_activity_date: Optional[datetime], current_date: Optional[datetime] = None) -> bool:
        """Check if streak should be updated (new day).
        
        Args:
            last_activity_date: User's last activity date
            current_date: Current datetime (defaults to now)
            
        Returns:
            True if this is a new day activity
        """
        if current_date is None:
            current_date = datetime.now(timezone.utc)
        
        if last_activity_date is None:
            return True
        
        # Check if more than STREAK_COOLDOWN_HOURS have passed
        hours_since_activity = (current_date - last_activity_date).total_seconds() / 3600
        return hours_since_activity >= STREAK_COOLDOWN_HOURS
    
    @staticmethod
    def calculate_new_streak(current_streak: int, last_activity_date: Optional[datetime], 
                            current_date: Optional[datetime] = None) -> tuple[int, bool]:
        """Calculate new streak value.
        
        Args:
            current_streak: Current streak count
            last_activity_date: User's last activity date
            current_date: Current datetime (defaults to now)
            
        Returns:
            Tuple of (new_streak, streak_broken)
        """
        if current_date is None:
            current_date = datetime.now(timezone.utc)
        
        # First activity ever
        if last_activity_date is None:
            return 1, False
        
        hours_since_activity = (current_date - last_activity_date).total_seconds() / 3600
        
        # Same day - don't increment
        if hours_since_activity < 24:
            return current_streak, False
        
        # Within cooldown period - increment
        if hours_since_activity < STREAK_COOLDOWN_HOURS:
            return current_streak + 1, False
        
        # Streak broken
        return 1, True


# ============================================================
# Achievement Checker
# ============================================================

class AchievementChecker:
    """Check and unlock achievements based on conditions."""
    
    @staticmethod
    async def check_achievements(db: AsyncSession, user_id: str, progress: UserProgress) -> list[UserAchievement]:
        """Check all achievements and unlock any that are met.
        
        Args:
            db: Database session
            user_id: User ID
            progress: User's current progress
            
        Returns:
            List of newly unlocked achievements
        """
        newly_unlocked = []
        
        # Get all active achievements
        result = await db.execute(
            select(Achievement).where(Achievement.is_active)
        )
        achievements = result.scalars().all()
        
        # Get user's already unlocked achievements
        result = await db.execute(
            select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
        )
        unlocked_ids = set(row[0] for row in result.all())
        
        # Check each achievement
        for achievement in achievements:
            if achievement.id in unlocked_ids:
                continue
            
            if AchievementChecker._check_condition(achievement.unlock_condition, progress):
                # Unlock achievement
                user_achievement = UserAchievement(
                    user_id=user_id,
                    achievement_id=achievement.id,
                    progress=100,
                    claimed=False,
                )
                db.add(user_achievement)
                newly_unlocked.append(user_achievement)
        
        return newly_unlocked
    
    @staticmethod
    def _check_condition(condition: dict, progress: UserProgress) -> bool:
        """Check if a user meets an achievement condition.
        
        Args:
            condition: Condition dict (e.g., {"tasks_completed": 10})
            progress: User's current progress
            
        Returns:
            True if condition is met
        """
        for key, required_value in condition.items():
            user_value = getattr(progress, key, None)
            
            if user_value is None:
                return False
            
            if user_value < required_value:
                return False
        
        return True


# ============================================================
# Convenience Functions
# ============================================================

async def get_or_create_user_progress(db: AsyncSession, user_id: str) -> UserProgress:
    """Get or create user progress record.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        UserProgress instance
    """
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_id)
    )
    progress = result.scalar_one_or_none()
    
    if progress is None:
        progress = UserProgress(
            user_id=user_id,
            total_xp=0,
            current_level=1,
            streak_current=0,
            streak_best=0,
            tasks_completed_today=0,
            tasks_completed_total=0,
            tasks_completed_this_week=0,
            tasks_completed_this_month=0,
        )
        db.add(progress)
        await db.flush()
    
    return progress


def reset_daily_stats(progress: UserProgress, current_date: Optional[datetime] = None):
    """Reset daily stats if it's a new day.
    
    Args:
        progress: User progress to update
        current_date: Current datetime (defaults to now)
    """
    if current_date is None:
        current_date = datetime.now(timezone.utc)
    
    # Check if last activity was on a different day
    if progress.last_activity_date is None:
        return
    
    last_day = progress.last_activity_date.date()
    current_day = current_date.date()
    
    if last_day != current_day:
        progress.tasks_completed_today = 0
        
        # Reset weekly stats if needed
        if progress.last_activity_date.isocalendar()[1] != current_date.isocalendar()[1]:
            progress.tasks_completed_this_week = 0
        
        # Reset monthly stats if needed
        if progress.last_activity_date.month != current_date.month:
            progress.tasks_completed_this_month = 0
