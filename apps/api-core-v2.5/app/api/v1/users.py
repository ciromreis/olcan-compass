"""
User endpoints for Olcan Compass v2.5
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models import User
from app.db.models.task import UserProgress
from app.schemas.user import UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    # Attach computed fields for response
    current_user.level = 1  # Default if progress missing
    current_user.xp = 0
    
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
    
    # Attach computed fields
    current_user.level = 1
    current_user.xp = 0
    
    return current_user


@router.get("/settings", response_model=dict)
async def get_user_settings(
    current_user: User = Depends(get_current_user)
):
    """Get user settings and preferences"""
    return {
        "language": current_user.language,
        "timezone": current_user.timezone,
        "preferences": current_user.preferences or {},
        "notifications_enabled": True,  # Placeholder
    }


@router.put("/settings", response_model=dict)
async def update_user_settings(
    settings: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user settings and preferences"""
    if "language" in settings:
        current_user.language = settings["language"]
    if "timezone" in settings:
        current_user.timezone = settings["timezone"]
    if "preferences" in settings:
        current_user.preferences = settings["preferences"]
        
    await db.commit()
    return {"message": "Settings updated successfully"}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete current user account and all associated data"""
    await db.execute(delete(User).where(User.id == current_user.id))
    await db.commit()
    return None


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
        "level": progress.current_level,
        "xpToNextLevel": 100,  # Placeholder or calculate
        "tasksCompletedToday": progress.tasks_completed_today,
        "tasksCompletedTotal": progress.tasks_completed_total,
        "streakCurrent": progress.streak_current,
        "streakBest": progress.streak_best,
        "lastActivityDate": progress.last_activity_date.isoformat() if progress.last_activity_date else None,
    }


@router.get("/{user_id}", response_model=dict)
async def get_user_by_id(
    user_id: uuid.UUID,
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
        "id": str(user.id),
        "username": user.username,
        "fullName": user.full_name,
        "avatar": user.avatar_url,
        "isPremium": user.is_premium,
    }
