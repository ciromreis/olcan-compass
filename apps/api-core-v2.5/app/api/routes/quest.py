"""Quest API Routes

Endpoints for quest management and progress tracking.
Integrates with QuestService for business logic.
Also includes Master Dossier export for convenience.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.core.auth import get_current_user, get_current_user_id
from app.db.session import get_db
from app.db.models import User
from app.db.models.quest import (
    QuestTemplate, UserQuest, QuestProgressEvent,
    QuestType, QuestStatus, QuestCategory
)
from app.services.quest_service import QuestService
from app.services.dossier_orchestrator import get_master_dossier_for_user, MasterDossierPayload
from app.utils.pdf_renderer import generate_dossier_pdf
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quests", tags=["Quests"])


# ============================================================
# Master Dossier Export Endpoint (convenience mount)
# ============================================================

@router.get("/dossier-export", name="master_dossier_export")
async def export_master_dossier(
    user_id: str = Depends(get_current_user_id)
):
    """Export Master Strategic Dossier.
    
    Returns HTML that can be saved as PDF.
    """
    from uuid import UUID
    try:
        user_uuid = UUID(user_id)
        payload = await get_master_dossier_for_user(user_uuid)
        html_bytes = await generate_dossier_pdf(payload)
        
        filename = f"olcan_dossier_{payload.metadata.user_name.replace(' ', '_')}_{payload.metadata.generated_at.strftime('%Y%m%d')}.html"
        
        return StreamingResponse(
            iter([html_bytes]),
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate: {str(e)}")


@router.get("/dossier-payload", name="master_dossier_payload")
async def get_dossier_payload(
    user_id: str = Depends(get_current_user_id)
) -> MasterDossierPayload:
    """Get raw dossier payload."""
    from uuid import UUID
    try:
        user_uuid = UUID(user_id)
        return await get_master_dossier_for_user(user_uuid)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class QuestTemplateResponse(BaseModel):
    """Quest template response schema."""
    id: UUID
    name: str
    name_en: Optional[str] = None
    description: str
    description_en: Optional[str] = None
    icon: str
    quest_type: QuestType
    category: QuestCategory
    requirement_type: str
    requirement_target: int
    requirement_metadata: Dict[str, Any]
    xp_reward: int
    coin_reward: int
    duration_hours: Optional[int]
    is_active: bool
    
    class Config:
        from_attributes = True


class UserQuestResponse(BaseModel):
    """User quest response schema."""
    id: UUID
    user_id: UUID
    template_id: UUID
    template: QuestTemplateResponse
    status: QuestStatus
    progress: int
    progress_percentage: int
    assigned_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    claimed_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class QuestStatisticsResponse(BaseModel):
    """Quest statistics response schema."""
    total_completed: int
    active_quests: int
    completed_by_type: Dict[str, int]
    completion_rate: float


class ClaimRewardResponse(BaseModel):
    """Quest reward claim response schema."""
    xp_reward: int
    coin_reward: int
    quest_name: str
    quest_type: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/active", response_model=List[UserQuestResponse])
async def get_active_quests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's active quests."""
    try:
        quests = await QuestService.get_active_quests(db, current_user.id)
        return quests
    except Exception as e:
        logger.error(f"Error getting active quests: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve active quests"
        )


@router.get("/completed", response_model=List[UserQuestResponse])
async def get_completed_quests(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's recently completed quests."""
    try:
        quests = await QuestService.get_completed_quests(db, current_user.id, limit)
        return quests
    except Exception as e:
        logger.error(f"Error getting completed quests: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve completed quests"
        )


@router.post("/assign-daily", response_model=List[UserQuestResponse], status_code=status.HTTP_201_CREATED)
async def assign_daily_quests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Assign daily quests to the user."""
    try:
        quests = await QuestService.assign_daily_quests(db, current_user.id)
        
        if not quests:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Daily quests already assigned for today"
            )
        
        return quests
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning daily quests: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign daily quests"
        )


@router.post("/assign-weekly", response_model=List[UserQuestResponse], status_code=status.HTTP_201_CREATED)
async def assign_weekly_quests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Assign weekly quests to the user."""
    try:
        quests = await QuestService.assign_weekly_quests(db, current_user.id)
        
        if not quests:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Weekly quests already assigned for this week"
            )
        
        return quests
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning weekly quests: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign weekly quests"
        )


@router.post("/{quest_id}/claim", response_model=ClaimRewardResponse)
async def claim_quest_reward(
    quest_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Claim rewards from a completed quest."""
    try:
        reward_data = await QuestService.claim_quest_reward(db, current_user.id, quest_id)
        
        if not reward_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quest not completed or already claimed"
            )
        
        return reward_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error claiming quest reward: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to claim quest reward"
        )


@router.get("/statistics", response_model=QuestStatisticsResponse)
async def get_quest_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's quest statistics."""
    try:
        stats = await QuestService.get_quest_statistics(db, current_user.id)
        return stats
    except Exception as e:
        logger.error(f"Error getting quest statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quest statistics"
        )


@router.get("/templates", response_model=List[QuestTemplateResponse])
async def get_quest_templates(
    quest_type: Optional[QuestType] = Query(None),
    category: Optional[QuestCategory] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get available quest templates."""
    try:
        query = select(QuestTemplate)
        
        if active_only:
            query = query.where(QuestTemplate.is_active == True)
        
        if quest_type:
            query = query.where(QuestTemplate.quest_type == quest_type)
        
        if category:
            query = query.where(QuestTemplate.category == category)
        
        query = query.order_by(
            QuestTemplate.quest_type,
            QuestTemplate.xp_reward.desc()
        ).offset(skip).limit(limit)
        
        result = await db.execute(query)
        templates = result.scalars().all()
        
        return templates
    except Exception as e:
        logger.error(f"Error getting quest templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quest templates"
        )


@router.get("/types", response_model=List[str])
async def get_quest_types():
    """Get available quest types."""
    return [qt.value for qt in QuestType]


@router.get("/categories", response_model=List[str])
async def get_quest_categories():
    """Get available quest categories."""
    return [qc.value for qc in QuestCategory]

