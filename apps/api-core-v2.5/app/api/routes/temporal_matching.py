"""Temporal Matching API Routes - Route Recommendations

Endpoints para recomendações de rotas baseadas em preferências temporais.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User, UserRole
from app.services import temporal_matching as temporal_service
from app.schemas.economics import (
    TemporalPreferenceResponse,
    MatchedRoutesListResponse,
    MatchedRouteResponse,
    AdjustMilestonesRequest,
    AdjustMilestonesResponse,
    ChurnPredictionResponse,
)

router = APIRouter(prefix="/temporal-matching", tags=["Economics - Temporal Matching"])


@router.get("/preference", response_model=TemporalPreferenceResponse)
async def get_temporal_preference(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém a preferência temporal do usuário autenticado.
    
    Escala: 0-100
    - 0-30: Alta paciência (rotas longas e metódicas)
    - 31-70: Paciência média (flexível)
    - 71-100: Alta urgência (rotas rápidas e intensivas)
    """
    temporal_pref = await temporal_service.calculate_temporal_preference(
        user_id=current_user.id,
        db=db
    )
    
    # Obter categoria descritiva
    category = await temporal_service.get_temporal_preference_category(temporal_pref)
    
    from datetime import datetime, timezone
    
    return TemporalPreferenceResponse(
        temporal_preference=temporal_pref,
        category="medium" if 31 <= temporal_pref <= 70 else ("low" if temporal_pref <= 30 else "high"),
        description=category,
        updated_at=datetime.now(timezone.utc)
    )


@router.get("/routes", response_model=MatchedRoutesListResponse)
async def get_matched_routes(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém rotas recomendadas baseadas na preferência temporal do usuário.
    
    Query params:
    - limit: Número máximo de rotas (padrão: 10)
    """
    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limite deve estar entre 1 e 50"
        )
    
    matched_routes = await temporal_service.get_matched_routes(
        user_id=current_user.id,
        db=db,
        limit=limit
    )
    
    # Converter para schema de resposta
    route_responses = [
        MatchedRouteResponse(
            route_template_id=route['route_template_id'],
            route_type=route['route_type'],
            name_pt=route['name_pt'],
            description_pt=route['description_pt'],
            estimated_duration_months=route['estimated_duration_months'],
            match_score=route['match_score'],
            match_reason=route['match_reason'],
            recommended_temporal_range=route['recommended_temporal_range']
        )
        for route in matched_routes
    ]
    
    # Obter preferência temporal do usuário
    temporal_pref = matched_routes[0]['user_temporal_preference'] if matched_routes else 50
    
    return MatchedRoutesListResponse(
        matched_routes=route_responses,
        user_temporal_preference=temporal_pref,
        total_routes=len(route_responses)
    )


@router.post("/adjust-milestones", response_model=AdjustMilestonesResponse)
async def adjust_milestones(
    request: AdjustMilestonesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ajusta densidade de marcos de uma rota baseado na preferência temporal.
    
    Usuários com alta urgência (>70) recebem marcos mais frequentes.
    """
    try:
        route_uuid = uuid.UUID(request.route_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de rota inválido"
        )
    
    # Calcular preferência temporal
    temporal_pref = await temporal_service.calculate_temporal_preference(
        user_id=current_user.id,
        db=db
    )
    
    # Ajustar marcos
    try:
        adjustment = await temporal_service.adjust_milestone_density(
            route_id=route_uuid,
            temporal_preference=temporal_pref,
            db=db
        )
        
        await db.commit()
        
        return AdjustMilestonesResponse(
            route_id=adjustment['route_id'],
            original_milestone_count=adjustment['original_milestone_count'],
            adjusted_milestone_count=adjustment['adjusted_milestone_count'],
            adjustment_reason=adjustment['adjustment_reason'],
            temporal_preference=adjustment['temporal_preference']
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/churn-prediction", response_model=ChurnPredictionResponse)
async def get_churn_prediction(
    user_id: str,
    route_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Prediz risco de churn baseado em mismatch temporal.
    
    **Requer role SUPER_ADMIN.**
    
    Query params:
    - user_id: UUID do usuário
    - route_id: UUID da rota
    """
    # Verificar permissão de admin
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )
    
    try:
        user_uuid = uuid.UUID(user_id)
        route_uuid = uuid.UUID(route_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID inválido"
        )
    
    try:
        prediction = await temporal_service.predict_churn_risk(
            user_id=user_uuid,
            route_id=route_uuid,
            db=db
        )
        
        return ChurnPredictionResponse(
            user_id=prediction['user_id'],
            route_id=prediction['route_id'],
            churn_risk_score=prediction['churn_risk_score'],
            risk_level=prediction['risk_level'],
            temporal_mismatch=prediction['temporal_mismatch'],
            user_temporal_preference=prediction['user_temporal_preference'],
            route_recommended_range=prediction['route_recommended_range'],
            recommendation=prediction['recommendation'],
            predicted_at=prediction['predicted_at']
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
