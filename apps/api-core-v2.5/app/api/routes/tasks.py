"""Task management API routes."""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.task import TaskStatus, TaskPriority, TaskCategory
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse,
    UserProgressResponse, TaskStatistics, TaskCompleteResponse,
    TaskStartResponse, MessageResponse, LeaderboardResponse,
    AchievementListResponse, UserAchievementListResponse
)
from app.services.task_service import TaskService
from app.core.auth import get_current_user_id
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# ============================================================
# Task CRUD
# ============================================================

@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new task."""
    try:
        task = await TaskService.create_task(db, UUID(user_id), task_data)
        return TaskResponse.from_orm(task)
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    category: Optional[TaskCategory] = Query(None, description="Filter by category"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's tasks with filters and pagination."""
    try:
        tasks, total = await TaskService.get_tasks(
            db, UUID(user_id),
            status=status,
            category=category,
            priority=priority,
            search_query=search,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )

        return TaskListResponse(
            tasks=[TaskResponse.from_orm(t) for t in tasks],
            total=total,
            filters_applied={
                "status": status.value if status else None,
                "category": category.value if category else None,
                "priority": priority.value if priority else None,
                "search": search
            }
        )
    except Exception as e:
        logger.error(f"Error getting tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific task."""
    task = await TaskService.get_task(db, task_id, UUID(user_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.from_orm(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update a task."""
    task = await TaskService.get_task(db, task_id, UUID(user_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        updated_task = await TaskService.update_task(db, task, task_data)
        return TaskResponse.from_orm(updated_task)
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a task (soft delete)."""
    task = await TaskService.get_task(db, task_id, UUID(user_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        await TaskService.delete_task(db, task)
        return MessageResponse(message="Task deleted successfully")
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Task Actions
# ============================================================

@router.post("/{task_id}/complete", response_model=TaskCompleteResponse)
async def complete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Complete a task and earn XP.
    
    Triggers:
    - XP award
    - Streak update
    - Level progression
    - Achievement checks
    - Aura XP update (if companion exists)
    """
    task = await TaskService.get_task(db, task_id, UUID(user_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status == TaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Task already completed")

    try:
        result = await TaskService.complete_task(db, task)
        
        # NEW: Award aura XP if user has a companion
        try:
            from app.models.companion import Companion
            companion_result = await db.execute(
                select(Companion).where(Companion.user_id == UUID(user_id))
            )
            companion = companion_result.scalar_one_or_none()
            
            if companion:
                # Award XP to companion (same as task XP)
                xp_amount = result.xp_earned
                companion.xp += xp_amount
                
                # Recalculate level
                from app.api.v1.companions import _calculate_level_from_xp, _xp_to_next_level, _determine_stage
                new_level = _calculate_level_from_xp(companion.xp)
                companion.level = new_level
                companion.xp_to_next = _xp_to_next_level(new_level)
                companion.evolution_stage = _determine_stage(companion.xp, new_level)
                
                await db.commit()
                logger.info(f"Awarded {xp_amount} XP to companion {companion.id}")
        except Exception as aura_error:
            # Don't fail task completion if aura update fails
            logger.warning(f"Failed to update aura XP: {str(aura_error)}")
        
        return result
    except Exception as e:
        logger.error(f"Error completing task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/start", response_model=TaskStartResponse)
async def start_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Mark a task as in progress."""
    task = await TaskService.get_task(db, task_id, UUID(user_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        updated_task = await TaskService.start_task(db, task)
        return TaskStartResponse(
            task=TaskResponse.from_orm(updated_task),
            message="Task started"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error starting task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Task Categories
# ============================================================

@router.get("/categories", response_model=List[dict])
async def get_task_categories():
    """Get all available task categories."""
    categories = []
    for category in TaskCategory:
        categories.append({
            "value": category.value,
            "label": category.name.replace("_", " ").title(),
            "description": _get_category_description(category)
        })
    return categories


def _get_category_description(category: TaskCategory) -> str:
    """Get description for task category."""
    descriptions = {
        TaskCategory.DOCUMENTATION: "Passports, visas, certifications, and official documents",
        TaskCategory.LANGUAGE: "Language learning and proficiency tests",
        TaskCategory.FINANCE: "Banking, budgeting, and financial planning",
        TaskCategory.HOUSING: "Finding and securing accommodation",
        TaskCategory.NETWORKING: "Professional networking and connections",
        TaskCategory.INTERVIEW: "Job interview preparation and execution",
        TaskCategory.VISA: "Visa applications and immigration processes",
        TaskCategory.CULTURAL_PREP: "Cultural adaptation and local customs",
        TaskCategory.HEALTH: "Health insurance and medical requirements",
        TaskCategory.EDUCATION: "Educational credentials and courses",
        TaskCategory.EMPLOYMENT: "Job search and employment contracts",
        TaskCategory.CUSTOM: "Custom tasks created by user",
    }
    return descriptions.get(category, "Custom task")


# ============================================================
# User Progress
# ============================================================

@router.get("/progress", response_model=UserProgressResponse)
async def get_user_progress(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's gamification progress (XP, level, streaks)."""
    progress = await TaskService.get_user_progress(db, UUID(user_id))
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    return progress


@router.get("/progress/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = Query(50, ge=10, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get XP leaderboard (placeholder - needs user table join)."""
    # TODO: Implement with proper user table join
    return LeaderboardResponse(
        entries=[],
        user_rank=None,
        total_users=0
    )


# ============================================================
# Achievements
# ============================================================

@router.get("/achievements", response_model=AchievementListResponse)
async def get_achievements(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db)
):
    """Get all available achievements."""
    from app.db.models.task import Achievement

    query = select(Achievement).where(Achievement.is_active == True)

    if category:
        query = query.where(Achievement.category == category)

    query = query.order_by(Achievement.display_order, Achievement.name)

    result = await db.execute(query)
    achievements = result.scalars().all()

    return AchievementListResponse(
        achievements=achievements,
        total=len(achievements)
    )


@router.get("/achievements/user", response_model=UserAchievementListResponse)
async def get_user_achievements(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's unlocked and locked achievements."""
    from app.db.models.task import Achievement, UserAchievement
    
    # Get all achievements
    all_achievements_result = await db.execute(
        select(Achievement).where(Achievement.is_active == True)
    )
    all_achievements = {a.id: a for a in all_achievements_result.scalars().all()}
    
    # Get user's unlocked achievements
    user_achievements_result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == UUID(user_id))
    )
    user_achievements = user_achievements_result.scalars().all()
    unlocked_ids = {ua.achievement_id for ua in user_achievements}
    
    # Separate into unlocked and locked
    unlocked = [all_achievements[ua.achievement_id] for ua in user_achievements if ua.achievement_id in all_achievements]
    locked = [a for a_id, a in all_achievements.items() if a_id not in unlocked_ids]
    
    return UserAchievementListResponse(
        unlocked=unlocked,
        locked=locked,
        total_unlocked=len(unlocked),
        total_locked=len(locked)
    )


@router.post("/achievements/{achievement_id}/claim", response_model=MessageResponse)
async def claim_achievement(
    achievement_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Claim an achievement reward (if applicable)."""
    # TODO: Implement achievement claiming
    return MessageResponse(message="Achievement claimed successfully")


# ============================================================
# Statistics
# ============================================================

@router.get("/stats", response_model=TaskStatistics)
async def get_task_statistics(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get task completion statistics."""
    stats = await TaskService.get_task_statistics(db, UUID(user_id))
    return stats

