"""Notifications API Routes

Synthesizes user notifications from gamification events (achievements, quests, level-ups).
Read-state is stored in a server-side in-memory cache keyed by user_id for zero-migration
deployment. Read flags reset on server restart — acceptable for v2.5.
"""

from typing import Any, Dict, List
from uuid import UUID
from datetime import datetime
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# In-memory read-status store: {user_id: set of notification_ids read}
_read_store: Dict[str, set] = defaultdict(set)


def _make_notification(
    notif_id: str,
    notif_type: str,
    title: str,
    message: str,
    created_at: str,
    action_url: str | None,
    user_id: str,
    metadata: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    return {
        "id": notif_id,
        "notification_type": notif_type,
        "title": title,
        "message": message,
        "action_url": action_url,
        "is_read": notif_id in _read_store[user_id],
        "created_at": created_at,
        "metadata": metadata or {},
    }


@router.get("", response_model=List[Dict[str, Any]])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return recent notifications synthesised from gamification events."""
    user_id_str = str(current_user.id)
    notifications: List[Dict[str, Any]] = []

    try:
        from app.db.models.quest import UserQuest, QuestStatus
        from sqlalchemy.orm import selectinload

        # Recent completed quests → quest notifications
        quest_result = await db.execute(
            select(UserQuest)
            .where(
                UserQuest.user_id == current_user.id,
                UserQuest.status == QuestStatus.COMPLETED,
            )
            .order_by(desc(UserQuest.completed_at))
            .limit(5)
        )
        for uq in quest_result.scalars().all():
            notif_id = f"quest:{uq.id}"
            ts = uq.completed_at.isoformat() if uq.completed_at else datetime.utcnow().isoformat()
            notifications.append(
                _make_notification(
                    notif_id=notif_id,
                    notif_type="quest",
                    title="Quest Completed!",
                    message=f'You completed "{uq.template.name}"' if hasattr(uq, "template") and uq.template else "A quest was completed",
                    created_at=ts,
                    action_url="/dashboard/gamification",
                    user_id=user_id_str,
                    metadata={"quest_id": str(uq.id)},
                )
            )
    except Exception:
        pass

    try:
        from app.db.models.quest import UserAchievement

        # Recent unlocked achievements → achievement notifications
        ach_result = await db.execute(
            select(UserAchievement)
            .where(UserAchievement.user_id == current_user.id)
            .order_by(desc(UserAchievement.unlocked_at))
            .limit(5)
        )
        for ua in ach_result.scalars().all():
            notif_id = f"achievement:{ua.id}"
            ts = ua.unlocked_at.isoformat() if ua.unlocked_at else datetime.utcnow().isoformat()
            ach_name = ua.achievement.name if hasattr(ua, "achievement") and ua.achievement else "New Achievement"
            notifications.append(
                _make_notification(
                    notif_id=notif_id,
                    notif_type="achievement",
                    title="Achievement Unlocked!",
                    message=f'You earned "{ach_name}"',
                    created_at=ts,
                    action_url="/dashboard/gamification",
                    user_id=user_id_str,
                    metadata={"achievement_id": str(ua.achievement_id)},
                )
            )
    except Exception:
        pass

    # Sort newest first
    notifications.sort(key=lambda n: n["created_at"], reverse=True)
    return notifications[:20]


@router.patch("/read-all", response_model=Dict[str, Any])
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all notifications as read by pre-loading all known IDs.

    NOTE: must be declared BEFORE /{notification_id}/read so that FastAPI
    matches the literal path '/read-all' before the path-parameter pattern.
    """
    all_ids: set = set()

    try:
        from app.db.models.quest import UserQuest, QuestStatus, UserAchievement

        q_result = await db.execute(
            select(UserQuest.id).where(
                UserQuest.user_id == current_user.id,
                UserQuest.status == QuestStatus.COMPLETED,
            )
        )
        all_ids.update(f"quest:{row}" for row in q_result.scalars().all())

        a_result = await db.execute(
            select(UserAchievement.id).where(UserAchievement.user_id == current_user.id)
        )
        all_ids.update(f"achievement:{row}" for row in a_result.scalars().all())
    except Exception:
        pass

    _read_store[str(current_user.id)].update(all_ids)
    return {"marked_read": len(all_ids)}


@router.patch("/{notification_id}/read", response_model=Dict[str, Any])
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    _read_store[str(current_user.id)].add(notification_id)
    return {"notification_id": notification_id, "is_read": True}
