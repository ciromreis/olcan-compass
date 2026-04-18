"""Achievement API Routes

Endpoints for achievements and user achievement tracking.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User
from app.db.models.task import Achievement, UserAchievement, AchievementCategory

router = APIRouter(prefix="/achievements", tags=["Achievements"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AchievementResponse(BaseModel):
    id: UUID
    title: str
    description: str
    category: str
    icon_url: Optional[str]
    xp_reward: int
    aura_points_reward: int
    requirements: dict
    is_secret: bool
    rarity: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserAchievementResponse(BaseModel):
    id: UUID
    user_id: UUID
    achievement_id: UUID
    unlocked_at: datetime
    progress_data: Optional[dict]
    
    # Include achievement details
    achievement: Optional[AchievementResponse] = None
    
    class Config:
        from_attributes = True


class AchievementProgressResponse(BaseModel):
    achievement_id: UUID
    achievement: AchievementResponse
    unlocked: bool
    progress: Optional[dict]
    unlocked_at: Optional[datetime]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[AchievementResponse])
async def list_achievements(
    category: Optional[str] = Query(None),
    rarity: Optional[str] = Query(None),
    include_secret: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """List all achievements"""
    query = select(Achievement)
    
    if not include_secret:
        query = query.where(Achievement.is_secret == False)
    
    if category:
        query = query.where(Achievement.category == category)
    
    if rarity:
        query = query.where(Achievement.rarity == rarity)
    
    query = query.order_by(Achievement.category, Achievement.rarity).offset(skip).limit(limit)
    
    result = await db.execute(query)
    achievements = result.scalars().all()
    
    return achievements


@router.get("/{achievement_id}", response_model=AchievementResponse)
async def get_achievement(
    achievement_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get achievement by ID"""
    result = await db.execute(
        select(Achievement).where(Achievement.id == achievement_id)
    )
    achievement = result.scalar_one_or_none()
    
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    return achievement


@router.get("/my/unlocked", response_model=List[UserAchievementResponse])
async def get_my_achievements(
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's unlocked achievements"""
    query = (
        select(UserAchievement)
        .where(UserAchievement.user_id == current_user.id)
        .order_by(UserAchievement.unlocked_at.desc())
    )
    
    result = await db.execute(query)
    user_achievements = result.scalars().all()
    
    # Load achievement details
    achievement_ids = [ua.achievement_id for ua in user_achievements]
    if achievement_ids:
        result = await db.execute(
            select(Achievement).where(Achievement.id.in_(achievement_ids))
        )
        achievements = {a.id: a for a in result.scalars().all()}
        
        # Attach achievement details
        for ua in user_achievements:
            ua.achievement = achievements.get(ua.achievement_id)
    
    # Filter by category if requested
    if category:
        user_achievements = [
            ua for ua in user_achievements 
            if ua.achievement and ua.achievement.category == category
        ]
    
    return user_achievements


@router.get("/my/progress", response_model=List[AchievementProgressResponse])
async def get_my_achievement_progress(
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's achievement progress (all achievements with unlock status)"""
    # Get all achievements
    query = select(Achievement)
    
    if category:
        query = query.where(Achievement.category == category)
    
    query = query.where(Achievement.is_secret == False)
    
    result = await db.execute(query)
    all_achievements = result.scalars().all()
    
    # Get user's unlocked achievements
    result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == current_user.id)
    )
    unlocked = {ua.achievement_id: ua for ua in result.scalars().all()}
    
    # Build progress response
    progress_list = []
    for achievement in all_achievements:
        user_achievement = unlocked.get(achievement.id)
        progress_list.append(
            AchievementProgressResponse(
                achievement_id=achievement.id,
                achievement=achievement,
                unlocked=user_achievement is not None,
                progress=user_achievement.progress_data if user_achievement else None,
                unlocked_at=user_achievement.unlocked_at if user_achievement else None
            )
        )
    
    return progress_list


@router.post("/{achievement_id}/unlock", response_model=UserAchievementResponse, status_code=status.HTTP_201_CREATED)
async def unlock_achievement(
    achievement_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Unlock an achievement (admin/system use)"""
    # Check if achievement exists
    result = await db.execute(
        select(Achievement).where(Achievement.id == achievement_id)
    )
    achievement = result.scalar_one_or_none()
    
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    # Check if already unlocked
    result = await db.execute(
        select(UserAchievement).where(
            and_(
                UserAchievement.user_id == current_user.id,
                UserAchievement.achievement_id == achievement_id
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Achievement already unlocked"
        )
    
    # Unlock achievement
    user_achievement = UserAchievement(
        user_id=current_user.id,
        achievement_id=achievement_id,
        progress_data={}
    )
    db.add(user_achievement)
    
    # Award rewards
    current_user.total_xp = (current_user.total_xp or 0) + achievement.xp_reward
    current_user.aura_points = (current_user.aura_points or 0) + achievement.aura_points_reward
    
    await db.commit()
    await db.refresh(user_achievement)
    
    # Load achievement details
    user_achievement.achievement = achievement
    
    return user_achievement


@router.get("/categories", response_model=List[str])
async def get_achievement_categories():
    """Get available achievement categories"""
    return [cat.value for cat in AchievementCategory]


@router.get("/rarities", response_model=List[str])
async def get_achievement_rarities():
    """Get available achievement rarities"""
    return ["common", "uncommon", "rare", "epic", "legendary"]


@router.get("/stats/summary")
async def get_achievement_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get achievement statistics for current user"""
    # Count total achievements
    result = await db.execute(
        select(Achievement).where(Achievement.is_secret == False)
    )
    total_achievements = len(result.scalars().all())
    
    # Count unlocked achievements
    result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == current_user.id)
    )
    unlocked_achievements = len(result.scalars().all())
    
    # Count by rarity
    result = await db.execute(
        select(Achievement)
        .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
        .where(UserAchievement.user_id == current_user.id)
    )
    unlocked_by_rarity = {}
    for achievement in result.scalars().all():
        rarity = achievement.rarity
        unlocked_by_rarity[rarity] = unlocked_by_rarity.get(rarity, 0) + 1
    
    return {
        "total_achievements": total_achievements,
        "unlocked_achievements": unlocked_achievements,
        "completion_percentage": round((unlocked_achievements / total_achievements * 100) if total_achievements > 0 else 0, 2),
        "unlocked_by_rarity": unlocked_by_rarity,
        "total_xp_earned": current_user.total_xp or 0,
        "total_aura_points": current_user.aura_points or 0
    }
