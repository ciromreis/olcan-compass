"""
Leaderboard and statistics endpoints for Olcan Compass v2.5
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models import User
from app.models.companion import Companion, CompanionActivity
from app.models.progress import UserProgress

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/companions/top", response_model=List[dict])
async def get_top_companions(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Get top companions by level and XP"""
    result = await db.execute(
        select(Companion, User)
        .join(User, Companion.user_id == User.id)
        .order_by(desc(Companion.level), desc(Companion.xp))
        .limit(limit)
    )
    companions_with_users = result.all()
    
    return [
        {
            "rank": idx + 1,
            "companionId": comp.id,
            "companionName": comp.name,
            "companionType": comp.type,
            "level": comp.level,
            "xp": comp.xp,
            "evolutionStage": comp.evolution_stage,
            "userId": user.id,
            "userName": user.username,
            "userAvatar": user.avatar_url
        }
        for idx, (comp, user) in enumerate(companions_with_users)
    ]


@router.get("/users/top", response_model=List[dict])
async def get_top_users(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """Get top users by total XP and level"""
    result = await db.execute(
        select(User, UserProgress)
        .outerjoin(UserProgress, User.id == UserProgress.user_id)
        .order_by(desc(User.level), desc(User.xp))
        .limit(limit)
    )
    users_with_progress = result.all()
    
    return [
        {
            "rank": idx + 1,
            "userId": user.id,
            "userName": user.username,
            "userAvatar": user.avatar_url,
            "level": user.level,
            "xp": user.xp,
            "totalSessions": progress.total_sessions if progress else 0,
            "questsCompleted": progress.quests_completed if progress else 0,
            "achievementsUnlocked": progress.achievements_unlocked if progress else 0
        }
        for idx, (user, progress) in enumerate(users_with_progress)
    ]


@router.get("/activities/recent", response_model=List[dict])
async def get_recent_activities(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get recent companion activities across all users"""
    result = await db.execute(
        select(CompanionActivity, Companion, User)
        .join(Companion, CompanionActivity.companion_id == Companion.id)
        .join(User, Companion.user_id == User.id)
        .order_by(desc(CompanionActivity.completed_at))
        .limit(limit)
    )
    activities_with_data = result.all()
    
    return [
        {
            "activityId": activity.id,
            "activityType": activity.activity_type,
            "xpReward": activity.xp_reward,
            "energyCost": activity.energy_cost,
            "description": activity.description,
            "completedAt": activity.completed_at.isoformat() if activity.completed_at else None,
            "companionId": companion.id,
            "companionName": companion.name,
            "companionType": companion.type,
            "userId": user.id,
            "userName": user.username
        }
        for activity, companion, user in activities_with_data
    ]


@router.get("/stats/global", response_model=dict)
async def get_global_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get global platform statistics"""
    # Total users
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar()
    
    # Total companions
    companions_result = await db.execute(select(func.count(Companion.id)))
    total_companions = companions_result.scalar()
    
    # Total activities
    activities_result = await db.execute(select(func.count(CompanionActivity.id)))
    total_activities = activities_result.scalar()
    
    # Average companion level
    avg_level_result = await db.execute(select(func.avg(Companion.level)))
    avg_companion_level = avg_level_result.scalar() or 0
    
    # Most popular companion type
    popular_type_result = await db.execute(
        select(Companion.type, func.count(Companion.id).label('count'))
        .group_by(Companion.type)
        .order_by(desc('count'))
        .limit(1)
    )
    popular_type = popular_type_result.first()
    
    # Most common activity
    popular_activity_result = await db.execute(
        select(CompanionActivity.activity_type, func.count(CompanionActivity.id).label('count'))
        .group_by(CompanionActivity.activity_type)
        .order_by(desc('count'))
        .limit(1)
    )
    popular_activity = popular_activity_result.first()
    
    return {
        "totalUsers": total_users,
        "totalCompanions": total_companions,
        "totalActivities": total_activities,
        "averageCompanionLevel": round(float(avg_companion_level), 2),
        "mostPopularCompanionType": popular_type[0] if popular_type else None,
        "mostPopularCompanionTypeCount": popular_type[1] if popular_type else 0,
        "mostCommonActivity": popular_activity[0] if popular_activity else None,
        "mostCommonActivityCount": popular_activity[1] if popular_activity else 0
    }


@router.get("/stats/user/{user_id}", response_model=dict)
async def get_user_stats(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed statistics for a specific user"""
    # Get user
    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's companions
    companions_result = await db.execute(
        select(Companion).where(Companion.user_id == user_id)
    )
    companions = companions_result.scalars().all()
    
    # Get total activities for user's companions
    companion_ids = [c.id for c in companions]
    if companion_ids:
        activities_result = await db.execute(
            select(func.count(CompanionActivity.id))
            .where(CompanionActivity.companion_id.in_(companion_ids))
        )
        total_activities = activities_result.scalar()
        
        # Get activity breakdown
        activity_breakdown_result = await db.execute(
            select(
                CompanionActivity.activity_type,
                func.count(CompanionActivity.id).label('count')
            )
            .where(CompanionActivity.companion_id.in_(companion_ids))
            .group_by(CompanionActivity.activity_type)
        )
        activity_breakdown = {row[0]: row[1] for row in activity_breakdown_result}
    else:
        total_activities = 0
        activity_breakdown = {}
    
    # Calculate total XP across all companions
    total_companion_xp = sum(c.xp for c in companions)
    avg_companion_level = sum(c.level for c in companions) / len(companions) if companions else 0
    
    return {
        "userId": user.id,
        "userName": user.username,
        "userLevel": user.level,
        "userXp": user.xp,
        "totalCompanions": len(companions),
        "totalActivities": total_activities,
        "totalCompanionXp": total_companion_xp,
        "averageCompanionLevel": round(avg_companion_level, 2),
        "activityBreakdown": activity_breakdown,
        "companions": [
            {
                "id": c.id,
                "name": c.name,
                "type": c.type,
                "level": c.level,
                "xp": c.xp,
                "evolutionStage": c.evolution_stage
            }
            for c in companions
        ]
    }


@router.get("/my-rank", response_model=dict)
async def get_my_rank(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's rank on the leaderboard"""
    # Get all users ordered by level and XP
    result = await db.execute(
        select(User.id)
        .order_by(desc(User.level), desc(User.xp))
    )
    all_user_ids = [row[0] for row in result.all()]
    
    # Find current user's rank
    try:
        rank = all_user_ids.index(current_user.id) + 1
    except ValueError:
        rank = None
    
    # Get user's best companion
    companions_result = await db.execute(
        select(Companion)
        .where(Companion.user_id == current_user.id)
        .order_by(desc(Companion.level), desc(Companion.xp))
        .limit(1)
    )
    best_companion = companions_result.scalar_one_or_none()
    
    # Get companion rank if exists
    companion_rank = None
    if best_companion:
        all_companions_result = await db.execute(
            select(Companion.id)
            .order_by(desc(Companion.level), desc(Companion.xp))
        )
        all_companion_ids = [row[0] for row in all_companions_result.all()]
        try:
            companion_rank = all_companion_ids.index(best_companion.id) + 1
        except ValueError:
            companion_rank = None
    
    return {
        "userRank": rank,
        "userLevel": current_user.level,
        "userXp": current_user.xp,
        "bestCompanionRank": companion_rank,
        "bestCompanionId": best_companion.id if best_companion else None,
        "bestCompanionName": best_companion.name if best_companion else None,
        "bestCompanionLevel": best_companion.level if best_companion else None
    }
