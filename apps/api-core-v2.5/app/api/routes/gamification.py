"""Gamification API Routes

Leaderboard endpoint using v2.5 Companion + User models.
"""

from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User
from app.db.models.companion import Companion

router = APIRouter(prefix="/gamification", tags=["Gamification"])


@router.get("/leaderboard", response_model=List[Dict[str, Any]])
async def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return top companions ranked by level then XP, alongside their owner info."""
    result = await db.execute(
        select(Companion, User)
        .join(User, Companion.user_id == User.id)
        .order_by(desc(Companion.level), desc(Companion.xp))
        .limit(limit)
    )
    rows = result.all()

    # Count achievements per user in one pass (best-effort — skip on error)
    user_ids = [user.id for _, user in rows]
    achievement_counts: Dict[UUID, int] = {}
    try:
        from app.db.models.task import UserAchievement
        ach_result = await db.execute(
            select(UserAchievement.user_id, func.count(UserAchievement.id).label("cnt"))
            .where(UserAchievement.user_id.in_(user_ids))
            .group_by(UserAchievement.user_id)
        )
        achievement_counts = {row.user_id: row.cnt for row in ach_result}
    except Exception:
        pass

    entries = []
    for rank, (companion, user) in enumerate(rows, start=1):
        display_name = (
            user.full_name
            or user.email.split("@")[0]
        )
        entries.append(
            {
                "rank": rank,
                "userId": str(user.id),
                "username": display_name,
                "avatar": user.avatar_url,
                "level": companion.level,
                "xp": companion.xp,
                "companionStage": companion.evolution_stage,
                "companionName": companion.name,
                "streak": 0,  # Streak not stored at user level in v2.5
                "achievements": achievement_counts.get(user.id, 0),
                "isCurrentUser": user.id == current_user.id,
            }
        )

    return entries
