"""Task service layer - business logic for task management."""

from datetime import datetime, timedelta, timezone
from typing import Optional, List, Tuple
from uuid import UUID, uuid4

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.task import (
    Task, SubTask, UserProgress, Achievement, UserAchievement,
    TaskStatus, TaskPriority, TaskCategory
)
from app.db.models.quest import QuestStatus
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskStatistics,
    UserProgressResponse, TaskCompleteResponse, UserAchievementResponse
)
from app.services.xp_calculator import (
    XPCalculator, StreakManager, AchievementChecker,
    get_or_create_user_progress, reset_daily_stats
)
import logging

logger = logging.getLogger(__name__)


# ============================================================
# Task CRUD Operations
# ============================================================

class TaskService:
    """Service for managing tasks."""

    @staticmethod
    async def create_task(
        db: AsyncSession,
        user_id: UUID,
        task_data: TaskCreate
    ) -> Task:
        """Create a new task."""
        # Calculate XP reward based on priority
        xp_reward = XPCalculator.calculate_task_xp(task_data.priority.value)

        task = Task(
            id=uuid4(),
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            category=task_data.category,
            priority=task_data.priority,
            due_date=task_data.due_date,
            estimated_hours=task_data.estimated_hours,
            route_id=task_data.route_id,
            notes=task_data.notes,
            task_metadata=task_data.task_metadata,
            xp_reward=xp_reward,
            level_requirement=1,
        )

        db.add(task)
        await db.flush()

        # Create subtasks if provided
        if task_data.subtasks:
            for position, subtask_title in enumerate(task_data.subtasks):
                subtask = SubTask(
                    id=uuid4(),
                    task_id=task.id,
                    title=subtask_title,
                    position=position,
                )
                db.add(subtask)

        await db.commit()
        await db.refresh(task)

        logger.info(f"Task created: {task.id} for user {user_id}")
        return task

    @staticmethod
    async def get_task(
        db: AsyncSession,
        task_id: UUID,
        user_id: UUID
    ) -> Optional[Task]:
        """Get a task by ID."""
        query = (
            select(Task)
            .where(Task.id == task_id, Task.user_id == user_id)
            .options(selectinload(Task.subtasks))
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_tasks(
        db: AsyncSession,
        user_id: UUID,
        status: Optional[TaskStatus] = None,
        category: Optional[TaskCategory] = None,
        priority: Optional[TaskPriority] = None,
        due_date_from: Optional[datetime] = None,
        due_date_to: Optional[datetime] = None,
        search_query: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Task], int]:
        """Get tasks with filters and pagination."""
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if status:
            query = query.where(Task.status == status)
        if category:
            query = query.where(Task.category == category)
        if priority:
            query = query.where(Task.priority == priority)
        if due_date_from:
            query = query.where(Task.due_date >= due_date_from)
        if due_date_to:
            query = query.where(Task.due_date <= due_date_to)
        if search_query:
            search_filter = or_(
                Task.title.ilike(f"%{search_query}%"),
                Task.description.ilike(f"%{search_query}%")
            )
            query = query.where(search_filter)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Apply sorting
        sort_column = getattr(Task, sort_by, Task.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # Apply pagination
        query = query.offset(offset).limit(limit)

        result = await db.execute(query)
        tasks = result.scalars().all()

        return list(tasks), total

    @staticmethod
    async def update_task(
        db: AsyncSession,
        task: Task,
        task_data: TaskUpdate
    ) -> Task:
        """Update a task."""
        update_data = task_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(task, field, value)

        task.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(task)

        logger.info(f"Task updated: {task.id}")
        return task

    @staticmethod
    async def delete_task(
        db: AsyncSession,
        task: Task
    ) -> None:
        """Delete a task (soft delete by setting status to cancelled)."""
        task.status = TaskStatus.CANCELLED
        task.updated_at = datetime.now(timezone.utc)
        await db.commit()

        logger.info(f"Task deleted: {task.id}")


# ============================================================
# Task Actions
# ============================================================

    @staticmethod
    async def complete_task(
        db: AsyncSession,
        task: Task
    ) -> TaskCompleteResponse:
        """
        Complete a task and award XP.
        
        Returns response with XP earned, level up info, and achievements.
        """
        user_id = task.user_id

        # Get or create user progress
        progress = await get_or_create_user_progress(db, user_id)

        # Check if this is the first task today
        is_first_task = progress.tasks_completed_today == 0

        # Calculate streak
        now = datetime.now(timezone.utc)
        new_streak, streak_broken = StreakManager.calculate_new_streak(
            current_streak=progress.streak_current,
            last_activity_date=progress.last_activity_date,
            current_date=now
        )

        # If streak broken, reset daily stats first
        if streak_broken and (now - progress.last_activity_date).total_seconds() > 36 * 3600:
            progress = await reset_daily_stats(db, user_id)

        # Calculate XP
        xp_earned = XPCalculator.calculate_task_xp(
            priority=task.priority.value,
            is_first_task_today=is_first_task,
            streak_days=new_streak
        )

        # Update task
        task.status = TaskStatus.COMPLETED
        task.completed_at = now
        task.completion_count += 1
        task.streak_count = new_streak
        task.updated_at = now

        # Update user progress
        old_level = progress.current_level
        progress.total_xp += xp_earned
        progress.current_level = XPCalculator.get_level_from_xp(progress.total_xp)
        progress.streak_current = new_streak
        progress.streak_best = max(progress.streak_best, new_streak)
        progress.tasks_completed_today += 1
        progress.tasks_completed_total += 1
        progress.last_activity_date = now

        level_up = progress.current_level > old_level

        await db.commit()

        # Check for newly unlocked achievements (NEW!)
        from app.services.achievement_service import AchievementService
        newly_unlocked = await AchievementService.check_task_achievements(
            db, user_id, task, progress
        )
        
        # Update quest progress (NEW!)
        from app.services.quest_service import QuestService
        updated_quests = await QuestService.update_quest_progress(
            db,
            user_id,
            "task_completed",
            {
                "category": task.category.value,
                "priority": task.priority.value,
                "task_id": str(task.id)
            }
        )
        
        # Commit achievement unlocks and quest updates
        if newly_unlocked or updated_quests:
            await db.commit()

        # Build response
        achievements_response = []
        for ua in newly_unlocked:
            achievements_response.append(
                UserAchievementResponse(
                    id=ua.id,
                    achievement_id=ua.achievement_id,
                    achievement=ua.achievement,
                    unlocked_at=ua.unlocked_at,
                    progress=ua.progress,
                    claimed=ua.claimed
                )
            )
        
        # Build quest updates response
        quests_response = []
        for quest in updated_quests:
            quests_response.append({
                "id": str(quest.id),
                "template_id": str(quest.template_id),
                "name": quest.template.name,
                "icon": quest.template.icon,
                "progress": quest.progress,
                "progress_percentage": quest.progress_percentage,
                "target": quest.template.requirement_target,
                "status": quest.status.value,
                "completed": quest.status == QuestStatus.COMPLETED,
                "xp_reward": quest.template.xp_reward if quest.status == QuestStatus.COMPLETED else 0
            })

        return TaskCompleteResponse(
            task=TaskResponse.from_orm(task),
            xp_earned=xp_earned,
            total_xp=progress.total_xp,
            level_up=level_up,
            new_level=progress.current_level if level_up else None,
            streak_updated=True,
            new_streak=new_streak,
            achievements_unlocked=achievements_response,
            quests_updated=quests_response
        )

    @staticmethod
    async def start_task(
        db: AsyncSession,
        task: Task
    ) -> Task:
        """Mark a task as in progress."""
        if task.status != TaskStatus.PENDING:
            raise ValueError(f"Task must be in PENDING status to start. Current status: {task.status}")

        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.now(timezone.utc)
        task.updated_at = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(task)

        logger.info(f"Task started: {task.id}")
        return task


# ============================================================
# Statistics and Progress
# ============================================================

    @staticmethod
    async def get_user_progress(
        db: AsyncSession,
        user_id: UUID
    ) -> Optional[UserProgressResponse]:
        """Get user's gamification progress."""
        progress = await get_or_create_user_progress(db, user_id)

        level_title = XPCalculator.get_level_title(progress.current_level)
        xp_to_next = XPCalculator.get_xp_to_next_level(progress.total_xp)
        progress_percent = XPCalculator.get_progress_to_next_level(progress.total_xp)

        return UserProgressResponse(
            user_id=progress.user_id,
            total_xp=progress.total_xp,
            current_level=progress.current_level,
            level_title=level_title,
            streak_current=progress.streak_current,
            streak_best=progress.streak_best,
            tasks_completed_today=progress.tasks_completed_today,
            tasks_completed_total=progress.tasks_completed_total,
            tasks_completed_this_week=progress.tasks_completed_this_week,
            tasks_completed_this_month=progress.tasks_completed_this_month,
            time_spent_minutes=progress.time_spent_minutes,
            xp_to_next_level=xp_to_next,
            level_progress_percent=progress_percent,
            last_activity_date=progress.last_activity_date
        )

    @staticmethod
    async def get_task_statistics(
        db: AsyncSession,
        user_id: UUID
    ) -> TaskStatistics:
        """Get task completion statistics."""
        # Get task counts by status
        status_counts = await db.execute(
            select(Task.status, func.count(Task.id))
            .where(Task.user_id == user_id, Task.status != TaskStatus.CANCELLED)
            .group_by(Task.status)
        )
        status_dict = {row[0].value: row[1] for row in status_counts.all()}

        # Get task counts by category
        category_counts = await db.execute(
            select(Task.category, func.count(Task.id))
            .where(Task.user_id == user_id, Task.status == TaskStatus.COMPLETED)
            .group_by(Task.category)
        )
        category_dict = {row[0].value: row[1] for row in category_counts.all()}

        # Get task counts by priority
        priority_counts = await db.execute(
            select(Task.priority, func.count(Task.id))
            .where(Task.user_id == user_id, Task.status == TaskStatus.COMPLETED)
            .group_by(Task.priority)
        )
        priority_dict = {row[0].value: row[1] for row in priority_counts.all()}

        total_tasks = sum(status_dict.values())
        completed_tasks = status_dict.get(TaskStatus.COMPLETED.value, 0)

        # Get progress for streak info
        progress = await get_or_create_user_progress(db, user_id)

        return TaskStatistics(
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            pending_tasks=status_dict.get(TaskStatus.PENDING.value, 0),
            in_progress_tasks=status_dict.get(TaskStatus.IN_PROGRESS.value, 0),
            blocked_tasks=status_dict.get(TaskStatus.BLOCKED.value, 0),
            completion_rate=(completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            avg_completion_time_hours=None,  # TODO: Calculate from timestamps
            tasks_by_category=category_dict,
            tasks_by_priority=priority_dict,
            tasks_completed_today=progress.tasks_completed_today,
            tasks_completed_this_week=progress.tasks_completed_this_week,
            tasks_completed_this_month=progress.tasks_completed_this_month,
            current_streak=progress.streak_current,
            best_streak=progress.streak_best
        )

    @staticmethod
    async def get_leaderboard(
        db: AsyncSession,
        user_id: UUID,
        limit: int = 50
    ) -> Tuple[List[dict], int, int]:
        """Get global XP leaderboard."""
        from app.db.models.user import User
        
        # Query for top users by total_xp
        query = (
            select(
                UserProgress,
                User.full_name,
                User.email
            )
            .join(User, User.id == UserProgress.user_id)
            .order_by(UserProgress.total_xp.desc())
            .limit(limit)
        )
        
        result = await db.execute(query)
        rows = result.all()
        
        entries = []
        for rank, row in enumerate(rows, 1):
            progress, full_name, email = row
            entries.append({
                "rank": rank,
                "user_id": progress.user_id,
                "user_name": full_name or email.split("@")[0],
                "user_email": email,
                "total_xp": progress.total_xp,
                "current_level": progress.current_level,
                "level_title": XPCalculator.get_level_title(progress.current_level),
                "tasks_completed": progress.tasks_completed_total,
                "streak": progress.streak_current
            })
            
        # Get total users
        total_query = select(func.count(UserProgress.id))
        total_result = await db.execute(total_query)
        total_users = total_result.scalar()
        
        # Get current user's rank
        user_rank_query = (
            select(func.count(UserProgress.id))
            .where(UserProgress.total_xp > select(UserProgress.total_xp).where(UserProgress.user_id == user_id).scalar_subquery())
        )
        user_rank_result = await db.execute(user_rank_query)
        user_rank = user_rank_result.scalar() + 1
        
        return entries, user_rank, total_users
