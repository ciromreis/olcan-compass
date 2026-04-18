"""Quest service - business logic for quest management and progression.

This service handles:
- Quest assignment (daily, weekly, special)
- Quest progress tracking
- Quest completion detection
- Quest reward distribution
- Quest expiration and cleanup
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.quest import (
    QuestTemplate, UserQuest, QuestProgressEvent,
    QuestType, QuestStatus, QuestCategory
)
from app.db.models.task import Task, TaskStatus, TaskCategory
import logging

logger = logging.getLogger(__name__)


class QuestService:
    """Service for managing quests and quest progression."""

    @staticmethod
    async def assign_daily_quests(
        db: AsyncSession,
        user_id: UUID
    ) -> List[UserQuest]:
        """
        Assign daily quests to a user.
        
        Called once per day (typically on first login or task completion).
        Assigns 3 daily quests from available templates.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            List of newly assigned UserQuest instances
        """
        try:
            # Check if user already has active daily quests for today
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            
            existing_result = await db.execute(
                select(UserQuest)
                .join(QuestTemplate)
                .where(
                    and_(
                        UserQuest.user_id == user_id,
                        QuestTemplate.quest_type == QuestType.DAILY,
                        UserQuest.assigned_at >= today_start,
                        UserQuest.status.in_([QuestStatus.ACTIVE, QuestStatus.COMPLETED])
                    )
                )
            )
            existing_quests = existing_result.scalars().all()
            
            if len(existing_quests) >= 3:
                logger.info(f"User {user_id} already has daily quests for today")
                return []

            # Get available daily quest templates
            templates_result = await db.execute(
                select(QuestTemplate)
                .where(
                    and_(
                        QuestTemplate.quest_type == QuestType.DAILY,
                        QuestTemplate.is_active == True
                    )
                )
                .order_by(func.random())
                .limit(3)
            )
            templates = templates_result.scalars().all()

            # Assign quests
            assigned_quests = []
            for template in templates:
                user_quest = await QuestService._assign_quest(db, user_id, template)
                if user_quest:
                    assigned_quests.append(user_quest)

            await db.commit()
            
            logger.info(f"Assigned {len(assigned_quests)} daily quests to user {user_id}")
            return assigned_quests

        except Exception as e:
            logger.error(f"Error assigning daily quests to user {user_id}: {str(e)}")
            await db.rollback()
            return []

    @staticmethod
    async def assign_weekly_quests(
        db: AsyncSession,
        user_id: UUID
    ) -> List[UserQuest]:
        """
        Assign weekly quests to a user.
        
        Called once per week (typically on Monday or first login of week).
        Assigns 2 weekly quests from available templates.
        """
        try:
            # Check if user already has active weekly quests for this week
            week_start = datetime.now(timezone.utc) - timedelta(days=datetime.now(timezone.utc).weekday())
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            
            existing_result = await db.execute(
                select(UserQuest)
                .join(QuestTemplate)
                .where(
                    and_(
                        UserQuest.user_id == user_id,
                        QuestTemplate.quest_type == QuestType.WEEKLY,
                        UserQuest.assigned_at >= week_start,
                        UserQuest.status.in_([QuestStatus.ACTIVE, QuestStatus.COMPLETED])
                    )
                )
            )
            existing_quests = existing_result.scalars().all()
            
            if len(existing_quests) >= 2:
                logger.info(f"User {user_id} already has weekly quests for this week")
                return []

            # Get available weekly quest templates
            templates_result = await db.execute(
                select(QuestTemplate)
                .where(
                    and_(
                        QuestTemplate.quest_type == QuestType.WEEKLY,
                        QuestTemplate.is_active == True
                    )
                )
                .order_by(func.random())
                .limit(2)
            )
            templates = templates_result.scalars().all()

            # Assign quests
            assigned_quests = []
            for template in templates:
                user_quest = await QuestService._assign_quest(db, user_id, template)
                if user_quest:
                    assigned_quests.append(user_quest)

            await db.commit()
            
            logger.info(f"Assigned {len(assigned_quests)} weekly quests to user {user_id}")
            return assigned_quests

        except Exception as e:
            logger.error(f"Error assigning weekly quests to user {user_id}: {str(e)}")
            await db.rollback()
            return []

    @staticmethod
    async def _assign_quest(
        db: AsyncSession,
        user_id: UUID,
        template: QuestTemplate
    ) -> Optional[UserQuest]:
        """Assign a quest from a template to a user."""
        # Calculate expiration
        expires_at = None
        if template.duration_hours:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=template.duration_hours)
        elif template.quest_type == QuestType.DAILY:
            # Daily quests expire at end of day
            expires_at = datetime.now(timezone.utc).replace(hour=23, minute=59, second=59)
        elif template.quest_type == QuestType.WEEKLY:
            # Weekly quests expire at end of week (Sunday)
            days_until_sunday = 6 - datetime.now(timezone.utc).weekday()
            expires_at = datetime.now(timezone.utc) + timedelta(days=days_until_sunday)
            expires_at = expires_at.replace(hour=23, minute=59, second=59)

        user_quest = UserQuest(
            user_id=user_id,
            template_id=template.id,
            status=QuestStatus.ACTIVE,
            progress=0,
            progress_percentage=0,
            assigned_at=datetime.now(timezone.utc),
            expires_at=expires_at
        )

        db.add(user_quest)
        await db.flush()
        await db.refresh(user_quest, ['template'])

        return user_quest

    @staticmethod
    async def update_quest_progress(
        db: AsyncSession,
        user_id: UUID,
        event_type: str,
        event_data: Optional[Dict[str, Any]] = None
    ) -> List[UserQuest]:
        """
        Update quest progress based on user action.
        
        This is the main entry point called after task completion or other events.
        
        Args:
            db: Database session
            user_id: User ID
            event_type: Type of event (e.g., "task_completed", "category_task_completed")
            event_data: Additional event data (e.g., task category, priority)
            
        Returns:
            List of quests that were updated or completed
        """
        try:
            # Get user's active quests
            result = await db.execute(
                select(UserQuest)
                .where(
                    and_(
                        UserQuest.user_id == user_id,
                        UserQuest.status == QuestStatus.ACTIVE
                    )
                )
                .options(selectinload(UserQuest.template))
            )
            active_quests = result.scalars().all()

            if not active_quests:
                return []

            updated_quests = []
            
            for quest in active_quests:
                # Check if this event is relevant to this quest
                if QuestService._is_event_relevant(quest.template, event_type, event_data):
                    # Update progress
                    progress_delta = QuestService._calculate_progress_delta(
                        quest.template,
                        event_type,
                        event_data
                    )
                    
                    if progress_delta > 0:
                        quest.progress += progress_delta
                        quest.progress_percentage = min(
                            int((quest.progress / quest.template.requirement_target) * 100),
                            100
                        )
                        
                        # Mark as started if first progress
                        if quest.started_at is None:
                            quest.started_at = datetime.now(timezone.utc)
                        
                        # Log progress event
                        progress_event = QuestProgressEvent(
                            user_quest_id=quest.id,
                            event_type=event_type,
                            progress_delta=progress_delta,
                            progress_after=quest.progress,
                            event_metadata=event_data
                        )
                        db.add(progress_event)
                        
                        # Check if quest is completed
                        if quest.progress >= quest.template.requirement_target:
                            quest.status = QuestStatus.COMPLETED
                            quest.completed_at = datetime.now(timezone.utc)
                            logger.info(
                                f"Quest {quest.template.name} completed by user {user_id}"
                            )
                        
                        updated_quests.append(quest)

            if updated_quests:
                await db.commit()
                logger.info(f"Updated {len(updated_quests)} quests for user {user_id}")

            return updated_quests

        except Exception as e:
            logger.error(f"Error updating quest progress for user {user_id}: {str(e)}")
            await db.rollback()
            return []

    @staticmethod
    def _is_event_relevant(
        template: QuestTemplate,
        event_type: str,
        event_data: Optional[Dict[str, Any]]
    ) -> bool:
        """Check if an event is relevant to a quest template."""
        # Match requirement type to event type
        if template.requirement_type == "complete_tasks":
            return event_type == "task_completed"
        
        if template.requirement_type == "complete_category_tasks":
            if event_type != "task_completed":
                return False
            # Check if category matches
            required_category = template.requirement_metadata.get("category")
            event_category = event_data.get("category") if event_data else None
            return required_category == event_category
        
        if template.requirement_type == "complete_high_priority_tasks":
            if event_type != "task_completed":
                return False
            event_priority = event_data.get("priority") if event_data else None
            return event_priority in ["high", "critical"]
        
        if template.requirement_type == "maintain_streak":
            return event_type == "streak_updated"
        
        if template.requirement_type == "complete_tasks_today":
            return event_type == "task_completed"
        
        # Default: not relevant
        return False

    @staticmethod
    def _calculate_progress_delta(
        template: QuestTemplate,
        event_type: str,
        event_data: Optional[Dict[str, Any]]
    ) -> int:
        """Calculate how much progress to add for an event."""
        # Most quests: 1 progress per event
        if template.requirement_type in [
            "complete_tasks",
            "complete_category_tasks",
            "complete_high_priority_tasks",
            "complete_tasks_today"
        ]:
            return 1
        
        # Streak quests: progress = streak count
        if template.requirement_type == "maintain_streak":
            return event_data.get("streak_count", 0) if event_data else 0
        
        return 1

    @staticmethod
    async def claim_quest_reward(
        db: AsyncSession,
        user_id: UUID,
        quest_id: UUID
    ) -> Optional[Dict[str, Any]]:
        """
        Claim rewards from a completed quest.
        
        Returns reward details if successfully claimed, None otherwise.
        """
        try:
            # Get quest
            result = await db.execute(
                select(UserQuest)
                .where(
                    and_(
                        UserQuest.id == quest_id,
                        UserQuest.user_id == user_id
                    )
                )
                .options(selectinload(UserQuest.template))
            )
            quest = result.scalar_one_or_none()

            if not quest:
                logger.warning(f"Quest {quest_id} not found for user {user_id}")
                return None

            if quest.status != QuestStatus.COMPLETED:
                logger.warning(f"Quest {quest_id} not completed (status: {quest.status})")
                return None

            if quest.claimed_at:
                logger.warning(f"Quest {quest_id} already claimed by user {user_id}")
                return None

            # Mark as claimed
            quest.status = QuestStatus.CLAIMED
            quest.claimed_at = datetime.now(timezone.utc)

            # Award rewards
            from app.services.xp_calculator import get_or_create_user_progress
            progress = await get_or_create_user_progress(db, user_id)
            
            xp_awarded = quest.template.xp_reward
            progress.total_xp += xp_awarded

            # Award aura XP if user has companion
            try:
                from app.models.companion import Companion
                companion_result = await db.execute(
                    select(Companion).where(Companion.user_id == user_id)
                )
                companion = companion_result.scalar_one_or_none()
                
                if companion:
                    companion.xp += xp_awarded
                    
                    # Recalculate level
                    from app.api.v1.companions import _calculate_level_from_xp, _xp_to_next_level, _determine_stage
                    new_level = _calculate_level_from_xp(companion.xp)
                    companion.level = new_level
                    companion.xp_to_next = _xp_to_next_level(new_level)
                    companion.evolution_stage = _determine_stage(companion.xp, new_level)
            except Exception as aura_error:
                logger.warning(f"Failed to update aura XP for quest reward: {str(aura_error)}")

            await db.commit()

            reward_data = {
                "xp_reward": xp_awarded,
                "coin_reward": quest.template.coin_reward,
                "quest_name": quest.template.name,
                "quest_type": quest.template.quest_type.value
            }

            logger.info(
                f"User {user_id} claimed quest {quest.template.name} "
                f"for {xp_awarded} XP"
            )

            return reward_data

        except Exception as e:
            logger.error(f"Error claiming quest reward: {str(e)}")
            await db.rollback()
            return None

    @staticmethod
    async def get_active_quests(
        db: AsyncSession,
        user_id: UUID
    ) -> List[UserQuest]:
        """Get user's active quests."""
        result = await db.execute(
            select(UserQuest)
            .where(
                and_(
                    UserQuest.user_id == user_id,
                    UserQuest.status == QuestStatus.ACTIVE
                )
            )
            .options(selectinload(UserQuest.template))
            .order_by(UserQuest.assigned_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_completed_quests(
        db: AsyncSession,
        user_id: UUID,
        limit: int = 10
    ) -> List[UserQuest]:
        """Get user's recently completed quests."""
        result = await db.execute(
            select(UserQuest)
            .where(
                and_(
                    UserQuest.user_id == user_id,
                    UserQuest.status.in_([QuestStatus.COMPLETED, QuestStatus.CLAIMED])
                )
            )
            .options(selectinload(UserQuest.template))
            .order_by(UserQuest.completed_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def expire_old_quests(
        db: AsyncSession
    ) -> int:
        """
        Expire quests that have passed their expiration date.
        
        Should be run periodically (e.g., via cron job or background task).
        
        Returns:
            Number of quests expired
        """
        try:
            now = datetime.now(timezone.utc)
            
            result = await db.execute(
                select(UserQuest)
                .where(
                    and_(
                        UserQuest.status == QuestStatus.ACTIVE,
                        UserQuest.expires_at < now
                    )
                )
            )
            expired_quests = result.scalars().all()

            for quest in expired_quests:
                quest.status = QuestStatus.EXPIRED

            await db.commit()
            
            logger.info(f"Expired {len(expired_quests)} quests")
            return len(expired_quests)

        except Exception as e:
            logger.error(f"Error expiring quests: {str(e)}")
            await db.rollback()
            return 0

    @staticmethod
    async def get_quest_statistics(
        db: AsyncSession,
        user_id: UUID
    ) -> Dict[str, Any]:
        """Get user's quest statistics."""
        # Total quests completed
        completed_count = await db.scalar(
            select(func.count(UserQuest.id))
            .where(
                and_(
                    UserQuest.user_id == user_id,
                    UserQuest.status.in_([QuestStatus.COMPLETED, QuestStatus.CLAIMED])
                )
            )
        ) or 0

        # Quests by type
        type_counts = {}
        for quest_type in QuestType:
            count = await db.scalar(
                select(func.count(UserQuest.id))
                .join(QuestTemplate)
                .where(
                    and_(
                        UserQuest.user_id == user_id,
                        QuestTemplate.quest_type == quest_type,
                        UserQuest.status.in_([QuestStatus.COMPLETED, QuestStatus.CLAIMED])
                    )
                )
            ) or 0
            type_counts[quest_type.value] = count

        # Active quests
        active_count = await db.scalar(
            select(func.count(UserQuest.id))
            .where(
                and_(
                    UserQuest.user_id == user_id,
                    UserQuest.status == QuestStatus.ACTIVE
                )
            )
        ) or 0

        return {
            "total_completed": completed_count,
            "active_quests": active_count,
            "completed_by_type": type_counts,
            "completion_rate": 0.0  # TODO: Calculate based on assigned vs completed
        }


# Import for type checking
from sqlalchemy.orm import selectinload
