"""Opportunity Cost API Routes - Growth Potential Intelligence

Endpoints para cálculo de custos de oportunidade e tracking de widget.
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.services import opportunity_cost as opp_cost_service
from app.schemas.economics import (
    OpportunityCostResponse,
    MomentumResponse,
    TrackWidgetImpressionRequest,
    TrackWidgetClickRequest,
    TrackWidgetConversionRequest,
    WidgetEventResponse,
)

router = APIRouter(prefix="/opportunity-cost", tags=["Economics - Opportunity Cost"])


@router.get("/calculate", response_model=OpportunityCostResponse)
async def calculate_opportunity_cost(
    opportunity_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calcula custo de oportunidade diário para uma oportunidade específica.
    
    Fórmula: (target_salary - current_salary) / 365
    
    Query params:
    - opportunity_id: UUID da oportunidade
    """
    try:
        opportunity_uuid = uuid.UUID(opportunity_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de oportunidade inválido"
        )
    
    try:
        daily_cost = await opp_cost_service.calculate_opportunity_cost(
            opportunity_id=opportunity_uuid,
            user_id=current_user.id,
            db=db
        )
        
        return OpportunityCostResponse(
            opportunity_id=opportunity_id,
            opportunity_cost_daily=daily_cost,
            currency="BRL",
            target_salary=None,  # TODO: Obter do modelo Opportunity
            current_salary=None,  # TODO: Obter do modelo User
            calculation_date=datetime.now(timezone.utc)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/momentum", response_model=MomentumResponse)
async def get_user_momentum(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém score de momentum do usuário (marcos completados nos últimos 30 dias).
    
    Momentum < 2 indica baixa atividade e dispara widget de crescimento.
    """
    momentum = await opp_cost_service.calculate_user_momentum(
        user_id=current_user.id,
        db=db
    )
    
    should_show = await opp_cost_service.should_show_widget(
        user_id=current_user.id,
        db=db
    )
    
    # Categorizar momentum
    if momentum < 2:
        category = "low_momentum"
    elif momentum < 5:
        category = "medium_momentum"
    else:
        category = "high_momentum"
    
    return MomentumResponse(
        momentum_score=momentum,
        category=category,
        milestones_completed_30d=momentum,
        should_show_widget=should_show,
        last_check=datetime.now(timezone.utc)
    )


@router.post("/widget/impression", response_model=WidgetEventResponse, status_code=status.HTTP_201_CREATED)
async def track_widget_impression(
    request: TrackWidgetImpressionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Registra impressão do widget de potencial de crescimento.
    
    Usado para analytics e cálculo de conversão.
    """
    opportunity_uuid = None
    if request.opportunity_id:
        try:
            opportunity_uuid = uuid.UUID(request.opportunity_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de oportunidade inválido"
            )
    
    # Calcular momentum atual
    momentum = await opp_cost_service.calculate_user_momentum(
        user_id=current_user.id,
        db=db
    )
    
    # Registrar impressão
    event_id = await opp_cost_service.track_widget_impression(
        user_id=current_user.id,
        opportunity_id=opportunity_uuid,
        opportunity_cost_shown=request.opportunity_cost_shown,
        momentum_score=momentum,
        session_id=request.session_id,
        db=db
    )
    
    await db.commit()
    
    return WidgetEventResponse(
        event_id=str(event_id),
        tracked_at=datetime.now(timezone.utc)
    )


@router.post("/widget/click", response_model=WidgetEventResponse, status_code=status.HTTP_201_CREATED)
async def track_widget_click(
    request: TrackWidgetClickRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Registra clique no widget de potencial de crescimento.
    
    Indica interesse do usuário em upgrade.
    """
    opportunity_uuid = None
    if request.opportunity_id:
        try:
            opportunity_uuid = uuid.UUID(request.opportunity_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de oportunidade inválido"
            )
    
    # Registrar clique
    event_id = await opp_cost_service.track_widget_click(
        user_id=current_user.id,
        opportunity_id=opportunity_uuid,
        session_id=request.session_id,
        db=db
    )
    
    await db.commit()
    
    return WidgetEventResponse(
        event_id=str(event_id),
        tracked_at=datetime.now(timezone.utc)
    )


@router.post("/widget/conversion", response_model=WidgetEventResponse, status_code=status.HTTP_201_CREATED)
async def track_widget_conversion(
    request: TrackWidgetConversionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Registra conversão (upgrade) atribuída ao widget.
    
    Conversão é atribuída se houve impressão do widget nos últimos 7 dias.
    """
    # Validar tier
    if request.upgrade_tier not in ['pro', 'premium']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tier deve ser 'pro' ou 'premium'"
        )
    
    # Registrar conversão
    event_id = await opp_cost_service.track_conversion(
        user_id=current_user.id,
        upgrade_tier=request.upgrade_tier,
        conversion_value=request.conversion_value,
        session_id=request.session_id,
        db=db
    )
    
    await db.commit()
    
    # Verificar se foi atribuída ao widget (simplificado)
    # Em produção, verificar se houve impressão nos últimos 7 dias
    conversion_attributed = True  # TODO: Implementar lógica real
    
    return WidgetEventResponse(
        event_id=str(event_id),
        tracked_at=datetime.now(timezone.utc),
        conversion_attributed=conversion_attributed
    )
