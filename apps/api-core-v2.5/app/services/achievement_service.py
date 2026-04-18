"""Achievement service - business logic for achievement unlocking and tracking.

This service handles:
- Achievement unlock detection based on user actions
- Progress tracking toward achievements
- Achievement reward distribution
- Category-specific achievement logic
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.task import (
    Task, Achievement, UserAchievement, UserProgress,
    TaskStatus, TaskCategory, TaskPriority, AchievementCategory
)
import logging

logger = logging.getLogger(__name__)


class AchievementService:
    """Service for managing achievement unlocks and progress."""

    @staticmethod
    async def check_task_achievements(
        db: AsyncSession,
        user_id: UUID,
        task: Task,
        progress: UserProgress
    ) -> List[UserAchievement]:
        """
        Check and unlock achievements based on task completion.
        
        This is the main entry point called after task completion.
        Checks multiple achievement types:
        - Milestone achievements (1st, 10th, 50th task)
        - Category-specific achievements
        - Priority-based achievements
        - Streak-based achievements
        
        Args:
            db: Database session
            user_id: User ID
            task: The completed task
            progress: User's current progress record
            
        Returns:
            List of newly unlocked UserAchievement instances
        """
        newly_unlocked = []

        try:
            # Get total completed tasks count
            total_tasks = await db.scalar(
                select(func.count(Task.id))
                .where(Task.user_id == user_id, Task.status == TaskStatus.COMPLETED)
            )

            # Check milestone achievements
            milestone_unlocks = await AchievementService._check_milestone_achievements(
                db, user_id, total_tasks
            )
            newly_unlocked.extend(milestone_unlocks)

            # Check category-specific achievements
            category_unlocks = await AchievementService._check_category_achievements(
                db, user_id, task.category
            )
            newly_unlocked.extend(category_unlocks)

            # Check priority-based achievements
            priority_unlocks = await AchievementService._check_priority_achievements(
                db, user_id, task.priority
            )
            newly_unlocked.extend(priority_unlocks)

            # Check streak-based achievements
            streak_unlocks = await AchievementService._check_streak_achievements(
                db, user_id, progress.streak_current
            )
            newly_unlocked.extend(streak_unlocks)

            # Check consistency achievements
            consistency_unlocks = await AchievementService._check_consistency_achievements(
                db, user_id, progress
            )
            newly_unlocked.extend(consistency_unlocks)

            # Load achievement details for all unlocked achievements
            for ua in newly_unlocked:
                await db.refresh(ua, ['achievement'])

            if newly_unlocked:
                logger.info(
                    f"Unlocked {len(newly_unlocked)} achievements for user {user_id}: "
                    f"{[ua.achievement.name for ua in newly_unlocked]}"
                )

        except Exception as e:
            logger.error(f"Error checking achievements for user {user_id}: {str(e)}")
            # Don't fail task completion if achievement check fails
            return []

        return newly_unlocked

    @staticmethod
    async def _check_milestone_achievements(
        db: AsyncSession,
        user_id: UUID,
        total_tasks: int
    ) -> List[UserAchievement]:
        """Check milestone-based achievements (1st, 10th, 50th, 100th task)."""
        newly_unlocked = []
        
        # Define milestone thresholds and their conditions
        milestones = [
            (1, {"tasks_completed_total": 1}),
            (10, {"tasks_completed_total": 10}),
            (25, {"tasks_completed_total": 25}),
            (50, {"tasks_completed_total": 50}),
            (100, {"tasks_completed_total": 100}),
        ]

        for threshold, condition in milestones:
            if total_tasks == threshold:
                unlocked = await AchievementService._unlock_by_condition(
                    db, user_id, condition, AchievementCategory.FIRST_STEPS
                )
                if unlocked:
                    newly_unlocked.extend(unlocked)

        return newly_unlocked

    @staticmethod
    async def _check_category_achievements(
        db: AsyncSession,
        user_id: UUID,
        category: TaskCategory
    ) -> List[UserAchievement]:
        """Check category-specific achievements."""
        newly_unlocked = []

        # Count tasks in this category
        category_count = await db.scalar(
            select(func.count(Task.id))
            .where(
                Task.user_id == user_id,
                Task.category == category,
                Task.status == TaskStatus.COMPLETED
            )
        )

        # Check category milestones (5, 10, 20 tasks per category)
        category_milestones = [5, 10, 20]
        
        for threshold in category_milestones:
            if category_count == threshold:
                # Look for achievement with this category condition
                condition = {
                    "category": category.value,
                    "count": threshold
                }
                
                # Find matching achievement
                result = await db.execute(
                    select(Achievement)
                    .where(
                        Achievement.is_active == True,
                        Achievement.unlock_condition.contains(condition)
                    )
                )
                achievement = result.scalar_one_or_none()
                
                if achievement:
                    unlocked = await AchievementService._unlock_achievement(
                        db, user_id, achievement.id
                    )
                    if unlocked:
                        newly_unlocked.append(unlocked)

        return newly_unlocked

    @staticmethod
    async def _check_priority_achievements(
        db: AsyncSession,
        user_id: UUID,
        priority: TaskPriority
    ) -> List[UserAchievement]:
        """Check priority-based achievements."""
        newly_unlocked = []

        if priority in [TaskPriority.HIGH, TaskPriority.CRITICAL]:
            # Count high/critical priority tasks
            high_priority_count = await db.scalar(
                select(func.count(Task.id))
                .where(
                    Task.user_id == user_id,
                    Task.priority.in_([TaskPriority.HIGH, TaskPriority.CRITICAL]),
                    Task.status == TaskStatus.COMPLETED
                )
            )

            # Check thresholds
            if high_priority_count in [10, 25, 50]:
                condition = {
                    "high_priority_tasks": high_priority_count
                }
                unlocked = await AchievementService._unlock_by_condition(
                    db, user_id, condition, AchievementCategory.MASTERY
                )
                if unlocked:
                    newly_unlocked.extend(unlocked)

        return newly_unlocked

    @staticmethod
    async def _check_streak_achievements(
        db: AsyncSession,
        user_id: UUID,
        current_streak: int
    ) -> List[UserAchievement]:
        """Check streak-based achievements."""
        newly_unlocked = []

        # Streak milestones
        streak_milestones = [3, 7, 14, 30]

        for threshold in streak_milestones:
            if current_streak == threshold:
                condition = {"streak_current": threshold}
                unlocked = await AchievementService._unlock_by_condition(
                    db, user_id, condition, AchievementCategory.CONSISTENCY
                )
                if unlocked:
                    newly_unlocked.extend(unlocked)

        return newly_unlocked

    @staticmethod
    async def _check_consistency_achievements(
        db: AsyncSession,
        user_id: UUID,
        progress: UserProgress
    ) -> List[UserAchievement]:
        """Check consistency-based achievements (daily, weekly, monthly)."""
        newly_unlocked = []

        # Daily consistency
        if progress.tasks_completed_today in [5, 10]:
            condition = {"tasks_completed_today": progress.tasks_completed_today}
            unlocked = await AchievementService._unlock_by_condition(
                db, user_id, condition, AchievementCategory.CONSISTENCY
            )
            if unlocked:
                newly_unlocked.extend(unlocked)

        # Weekly consistency
        if progress.tasks_completed_this_week in [20, 50]:
            condition = {"tasks_completed_this_week": progress.tasks_completed_this_week}
            unlocked = await AchievementService._unlock_by_condition(
                db, user_id, condition, AchievementCategory.CONSISTENCY
            )
            if unlocked:
                newly_unlocked.extend(unlocked)

        return newly_unlocked

    @staticmethod
    async def _unlock_by_condition(
        db: AsyncSession,
        user_id: UUID,
        condition: Dict[str, Any],
        category: Optional[AchievementCategory] = None
    ) -> List[UserAchievement]:
        """Find and unlock achievements matching a condition."""
        newly_unlocked = []

        # Build query
        query = select(Achievement).where(
            Achievement.is_active == True,
            Achievement.unlock_condition.contains(condition)
        )
        
        if category:
            query = query.where(Achievement.category == category)

        result = await db.execute(query)
        achievements = result.scalars().all()

        for achievement in achievements:
            unlocked = await AchievementService._unlock_achievement(
                db, user_id, achievement.id
            )
            if unlocked:
                newly_unlocked.append(unlocked)

        return newly_unlocked

    @staticmethod
    async def _unlock_achievement(
        db: AsyncSession,
        user_id: UUID,
        achievement_id: UUID
    ) -> Optional[UserAchievement]:
        """
        Unlock a specific achievement for a user.
        
        Returns UserAchievement if newly unlocked, None if already unlocked.
        """
        # Check if already unlocked
        existing_result = await db.execute(
            select(UserAchievement).where(
                and_(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == achievement_id
                )
            )
        )
        existing = existing_result.scalar_one_or_none()

        if existing:
            return None  # Already unlocked

        # Create new unlock
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id,
            unlocked_at=datetime.now(timezone.utc),
            progress=100,
            claimed=False
        )

        db.add(user_achievement)
        await db.flush()

        logger.info(f"Achievement {achievement_id} unlocked for user {user_id}")
        return user_achievement

    @staticmethod
    async def get_user_achievement_progress(
        db: AsyncSession,
        user_id: UUID
    ) -> Dict[str, Any]:
        """
        Get user's progress toward all achievements.
        
        Returns a comprehensive progress report including:
        - Total tasks completed
        - Category-specific counts
        - Priority counts
        - Streak information
        - Unlocked vs locked achievements
        """
        # Get task statistics
        total_tasks = await db.scalar(
            select(func.count(Task.id))
            .where(Task.user_id == user_id, Task.status == TaskStatus.COMPLETED)
        ) or 0

        # Get category counts
        category_counts = {}
        for category in TaskCategory:
            count = await db.scalar(
                select(func.count(Task.id))
                .where(
                    Task.user_id == user_id,
                    Task.category == category,
                    Task.status == TaskStatus.COMPLETED
                )
            ) or 0
            category_counts[category.value] = count

        # Get priority counts
        high_priority_count = await db.scalar(
            select(func.count(Task.id))
            .where(
                Task.user_id == user_id,
                Task.priority.in_([TaskPriority.HIGH, TaskPriority.CRITICAL]),
                Task.status == TaskStatus.COMPLETED
            )
        ) or 0

        # Get user progress
        from app.services.xp_calculator import get_or_create_user_progress
        progress = await get_or_create_user_progress(db, user_id)

        # Get achievement counts
        total_achievements = await db.scalar(
            select(func.count(Achievement.id))
            .where(Achievement.is_active == True)
        ) or 0

        unlocked_achievements = await db.scalar(
            select(func.count(UserAchievement.id))
            .where(UserAchievement.user_id == user_id)
        ) or 0

        return {
            "total_tasks": total_tasks,
            "category_counts": category_counts,
            "high_priority_count": high_priority_count,
            "current_streak": progress.streak_current,
            "best_streak": progress.streak_best,
            "tasks_today": progress.tasks_completed_today,
            "tasks_this_week": progress.tasks_completed_this_week,
            "tasks_this_month": progress.tasks_completed_this_month,
            "total_achievements": total_achievements,
            "unlocked_achievements": unlocked_achievements,
            "completion_percentage": round(
                (unlocked_achievements / total_achievements * 100) if total_achievements > 0 else 0,
                2
            )
        }

    @staticmethod
    async def claim_achievement_reward(
        db: AsyncSession,
        user_id: UUID,
        achievement_id: UUID
    ) -> Optional[int]:
        """
        Claim XP bonus from an unlocked achievement.
        
        Returns XP bonus amount if successfully claimed, None if already claimed or not unlocked.
        """
        # Get user achievement
        result = await db.execute(
            select(UserAchievement)
            .where(
                and_(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == achievement_id
                )
            )
        )
        user_achievement = result.scalar_one_or_none()

        if not user_achievement:
            logger.warning(f"Achievement {achievement_id} not unlocked for user {user_id}")
            return None

        if user_achievement.claimed:
            logger.warning(f"Achievement {achievement_id} already claimed by user {user_id}")
            return None

        # Get achievement details
        result = await db.execute(
            select(Achievement).where(Achievement.id == achievement_id)
        )
        achievement = result.scalar_one_or_none()

        if not achievement:
            logger.error(f"Achievement {achievement_id} not found")
            return None

        # Mark as claimed
        user_achievement.claimed = True

        # Award XP bonus
        from app.services.xp_calculator import get_or_create_user_progress
        progress = await get_or_create_user_progress(db, user_id)
        progress.total_xp += achievement.xp_bonus

        await db.flush()

        logger.info(
            f"User {user_id} claimed achievement {achievement.name} "
            f"for {achievement.xp_bonus} XP bonus"
        )

        return achievement.xp_bonus

    @staticmethod
    async def get_achievement_recommendations(
        db: AsyncSession,
        user_id: UUID,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get recommended achievements for user to work toward.
        
        Returns achievements that are:
        - Not yet unlocked
        - Close to completion (>50% progress)
        - Sorted by progress percentage
        """
        # Get user's progress
        progress_data = await AchievementService.get_user_achievement_progress(db, user_id)

        # Get all active achievements
        result = await db.execute(
            select(Achievement).where(Achievement.is_active == True)
        )
        all_achievements = result.scalars().all()

        # Get unlocked achievement IDs
        result = await db.execute(
            select(UserAchievement.achievement_id)
            .where(UserAchievement.user_id == user_id)
        )
        unlocked_ids = set(row[0] for row in result.all())

        # Calculate progress for each locked achievement
        recommendations = []
        for achievement in all_achievements:
            if achievement.id in unlocked_ids:
                continue

            progress_pct = AchievementService._calculate_achievement_progress(
                achievement.unlock_condition,
                progress_data
            )

            if progress_pct >= 50:  # Only recommend if >50% complete
                recommendations.append({
                    "achievement": achievement,
                    "progress_percentage": progress_pct,
                    "unlock_condition": achievement.unlock_condition
                })

        # Sort by progress (closest to completion first)
        recommendations.sort(key=lambda x: x["progress_percentage"], reverse=True)

        return recommendations[:limit]

    @staticmethod
    def _calculate_achievement_progress(
        condition: Dict[str, Any],
        progress_data: Dict[str, Any]
    ) -> float:
        """Calculate progress percentage toward an achievement condition."""
        if not condition:
            return 0.0

        # Handle different condition types
        if "tasks_completed_total" in condition:
            required = condition["tasks_completed_total"]
            current = progress_data.get("total_tasks", 0)
            return min((current / required) * 100, 100.0)

        if "streak_current" in condition:
            required = condition["streak_current"]
            current = progress_data.get("current_streak", 0)
            return min((current / required) * 100, 100.0)

        if "category" in condition and "count" in condition:
            category = condition["category"]
            required = condition["count"]
            current = progress_data.get("category_counts", {}).get(category, 0)
            return min((current / required) * 100, 100.0)

        if "high_priority_tasks" in condition:
            required = condition["high_priority_tasks"]
            current = progress_data.get("high_priority_count", 0)
            return min((current / required) * 100, 100.0)

        # Default: check all conditions
        total_progress = 0
        condition_count = 0

        for key, required_value in condition.items():
            current_value = progress_data.get(key, 0)
            if isinstance(required_value, (int, float)):
                progress = min((current_value / required_value) * 100, 100.0)
                total_progress += progress
                condition_count += 1

        if condition_count == 0:
            return 0.0

        return total_progress / condition_count
