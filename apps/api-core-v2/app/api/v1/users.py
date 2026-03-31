"""
User endpoints for Olcan Compass v2.5
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.progress import UserProgress
from app.schemas.user import UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.preferences is not None:
        current_user.preferences = user_update.preferences
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/progress", response_model=dict)
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user progress and statistics"""
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        # Create progress if doesn't exist
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        await db.commit()
        await db.refresh(progress)
    
    return {
        "totalXp": progress.total_xp,
        "level": progress.level,
        "xpToNextLevel": progress.xp_to_next_level,
        "totalSessions": progress.total_sessions,
        "totalTimeSpent": progress.total_time_spent,
        "streakDays": progress.streak_days,
        "longestStreak": progress.longest_streak,
        "questsCompleted": progress.quests_completed,
        "achievementsUnlocked": progress.achievements_unlocked,
        "companionsEvolved": progress.companions_evolved,
        "stats": progress.stats,
    }


@router.get("/{user_id}", response_model=dict)
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get public user information by ID"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "username": user.username,
        "fullName": user.full_name,
        "avatar": user.avatar_url,
        "level": user.level,
        "xp": user.xp,
        "isPremium": user.is_premium,
    }
