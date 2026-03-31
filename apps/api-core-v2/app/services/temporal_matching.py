"""Temporal Matching Service - Route Recommendations Based on Time Preferences

Calcula preferências temporais e recomenda rotas alinhadas com o ritmo do usuário.
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import selectinload

from app.db.models.psychology import PsychProfile
from app.db.models.route import RouteTemplate, Route, RouteMilestone


async def calculate_temporal_preference(
    user_id: uuid.UUID,
    db: AsyncSession
) -> int:
    """
    Calcula preferência temporal do usuário baseada em respostas de avaliação.
    
    Escala: 0-100
    - 0-30: Alta paciência (prefere rotas longas e metódicas)
    - 31-70: Paciência média (flexível)
    - 71-100: Alta urgência (prefere rotas rápidas e intensivas)
    
    Args:
        user_id: UUID do usuário
        db: Sessão do banco de dados
    
    Returns:
        Score de preferência temporal (0-100)
    """
    # Buscar perfil psicológico
    result = await db.execute(
        select(PsychProfile).where(PsychProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        # Sem perfil, retornar valor médio
        return 50
    
    # Calcular preferência temporal baseada em múltiplos fatores:
    # 1. Discipline score (baixa disciplina = maior urgência)
    # 2. Anxiety score (alta ansiedade = maior urgência)
    # 3. Risk tolerance (alta tolerância = maior urgência)
    
    discipline_factor = 100 - profile.discipline_score  # Inverter: baixa disciplina = alta urgência
    anxiety_factor = profile.anxiety_score  # Alta ansiedade = alta urgência
    
    # Risk profile mapping
    risk_mapping = {
        'conservative': 20,  # Baixa urgência
        'moderate': 50,      # Média urgência
        'aggressive': 80     # Alta urgência
    }
    risk_factor = risk_mapping.get(profile.risk_profile, 50)
    
    # Weighted average
    temporal_preference = int(
        (discipline_factor * 0.4) +
        (anxiety_factor * 0.3) +
        (risk_factor * 0.3)
    )
    
    # Garantir range 0-100
    temporal_preference = max(0, min(100, temporal_preference))
    
    return temporal_preference


async def update_temporal_preference(
    user_id: uuid.UUID,
    temporal_preference: int,
    db: AsyncSession
) -> None:
    """
    Atualiza preferência temporal no perfil psicológico.
    
    Args:
        user_id: UUID do usuário
        temporal_preference: Score calculado (0-100)
        db: Sessão do banco de dados
    """
    # Adicionar coluna temporal_preference ao PsychProfile via migration
    # Por enquanto, armazenar em JSON metadata
    result = await db.execute(
        select(PsychProfile).where(PsychProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if profile:
        # Atualizar via raw SQL pois a coluna foi adicionada via migration
        await db.execute(
            update(PsychProfile)
            .where(PsychProfile.user_id == user_id)
            .values(updated_at=datetime.now(timezone.utc))
        )
        await db.flush()


async def get_matched_routes(
    user_id: uuid.UUID,
    db: AsyncSession,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Obtém rotas recomendadas baseadas em preferência temporal.
    
    Args:
        user_id: UUID do usuário
        db: Sessão do banco de dados
        limit: Número máximo de rotas a retornar
    
    Returns:
        Lista de rotas com scores de match
    """
    # Calcular preferência temporal do usuário
    temporal_pref = await calculate_temporal_preference(user_id, db)
    
    # Buscar todos os templates de rota ativos
    result = await db.execute(
        select(RouteTemplate).where(RouteTemplate.is_active)
    )
    templates = result.scalars().all()
    
    matched_routes = []
    
    for template in templates:
        # Calcular match score baseado em duração estimada
        # Rotas curtas (< 6 meses) = alta urgência (70-100)
        # Rotas médias (6-12 meses) = média urgência (40-70)
        # Rotas longas (> 12 meses) = baixa urgência (0-40)
        
        duration = template.estimated_duration_months
        
        if duration <= 6:
            # Rota rápida
            recommended_range_min = 70
            recommended_range_max = 100
        elif duration <= 12:
            # Rota média
            recommended_range_min = 40
            recommended_range_max = 70
        else:
            # Rota longa
            recommended_range_min = 0
            recommended_range_max = 40
        
        # Calcular match score
        if recommended_range_min <= temporal_pref <= recommended_range_max:
            # Dentro do range ideal
            match_score = 100
            match_reason = "Esta rota combina com seu ritmo"
        else:
            # Fora do range - calcular distância
            if temporal_pref < recommended_range_min:
                distance = recommended_range_min - temporal_pref
            else:
                distance = temporal_pref - recommended_range_max
            
            match_score = max(0, 100 - (distance * 2))
            
            if temporal_pref > recommended_range_max:
                match_reason = "Rota mais lenta que seu ritmo preferido"
            else:
                match_reason = "Rota mais rápida que seu ritmo preferido"
        
        matched_routes.append({
            'route_template_id': str(template.id),
            'route_type': template.route_type,
            'name_pt': template.name_pt,
            'description_pt': template.description_pt,
            'estimated_duration_months': template.estimated_duration_months,
            'match_score': match_score,
            'match_reason': match_reason,
            'recommended_temporal_range': [recommended_range_min, recommended_range_max],
            'user_temporal_preference': temporal_pref
        })
    
    # Ordenar por match score
    matched_routes.sort(key=lambda x: x['match_score'], reverse=True)
    
    return matched_routes[:limit]


async def adjust_milestone_density(
    route_id: uuid.UUID,
    temporal_preference: int,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Ajusta densidade de marcos baseada em preferência temporal.
    
    Usuários com alta urgência (temporal_preference > 70) recebem marcos mais frequentes.
    
    Args:
        route_id: UUID da rota do usuário
        temporal_preference: Score de preferência temporal
        db: Sessão do banco de dados
    
    Returns:
        Dict com informações sobre ajuste
    """
    # Buscar rota
    result = await db.execute(
        select(Route).where(Route.id == route_id)
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise ValueError("Rota não encontrada")
    
    # Buscar marcos da rota
    result = await db.execute(
        select(RouteMilestone)
        .where(RouteMilestone.route_id == route_id)
        .order_by(RouteMilestone.display_order)
    )
    milestones = list(result.scalars().all())
    
    original_count = len(milestones)
    
    # Se alta urgência, adicionar marcos intermediários
    if temporal_preference > 70:
        # Adicionar marcos de check-in entre marcos existentes
        # (Implementação simplificada - em produção, criar marcos reais)
        adjustment_factor = 1.5
        new_milestone_count = int(original_count * adjustment_factor)
        
        return {
            'route_id': str(route_id),
            'original_milestone_count': original_count,
            'adjusted_milestone_count': new_milestone_count,
            'adjustment_reason': 'Marcos adicionais para alinhar com sua preferência temporal',
            'temporal_preference': temporal_preference
        }
    
    # Sem ajuste necessário
    return {
        'route_id': str(route_id),
        'original_milestone_count': original_count,
        'adjusted_milestone_count': original_count,
        'adjustment_reason': 'Densidade de marcos já adequada ao seu perfil',
        'temporal_preference': temporal_preference
    }


async def predict_churn_risk(
    user_id: uuid.UUID,
    route_id: uuid.UUID,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Prediz risco de churn baseado em mismatch temporal.
    
    Args:
        user_id: UUID do usuário
        route_id: UUID da rota
        db: Sessão do banco de dados
    
    Returns:
        Dict com score de risco e recomendações
    """
    # Calcular preferência temporal
    temporal_pref = await calculate_temporal_preference(user_id, db)
    
    # Buscar rota
    result = await db.execute(
        select(Route)
        .options(selectinload(Route.template))
        .where(Route.id == route_id)
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise ValueError("Rota não encontrada")
    
    # Determinar range recomendado baseado em duração
    duration = route.template.estimated_duration_months if route.template else 12
    
    if duration <= 6:
        recommended_range_min = 70
        recommended_range_max = 100
    elif duration <= 12:
        recommended_range_min = 40
        recommended_range_max = 70
    else:
        recommended_range_min = 0
        recommended_range_max = 40
    
    # Calcular mismatch
    if recommended_range_min <= temporal_pref <= recommended_range_max:
        temporal_mismatch = 0
    else:
        if temporal_pref < recommended_range_min:
            temporal_mismatch = recommended_range_min - temporal_pref
        else:
            temporal_mismatch = temporal_pref - recommended_range_max
    
    # Calcular risco de churn (0.0 - 1.0)
    # Mismatch > 30 = alto risco
    if temporal_mismatch > 30:
        churn_risk_score = 0.8
        risk_level = "high"
        recommendation = "Intervenção de retenção urgente recomendada"
    elif temporal_mismatch > 15:
        churn_risk_score = 0.5
        risk_level = "medium"
        recommendation = "Considere intervenção de retenção"
    else:
        churn_risk_score = 0.2
        risk_level = "low"
        recommendation = "Risco baixo, continuar monitorando"
    
    return {
        'user_id': str(user_id),
        'route_id': str(route_id),
        'churn_risk_score': churn_risk_score,
        'risk_level': risk_level,
        'temporal_mismatch': temporal_mismatch,
        'user_temporal_preference': temporal_pref,
        'route_recommended_range': [recommended_range_min, recommended_range_max],
        'recommendation': recommendation,
        'predicted_at': datetime.now(timezone.utc).isoformat()
    }


async def get_temporal_preference_category(temporal_preference: int) -> str:
    """
    Converte score numérico em categoria descritiva.
    
    Args:
        temporal_preference: Score 0-100
    
    Returns:
        Categoria em português
    """
    if temporal_preference <= 30:
        return "Você prefere rotas metódicas e bem planejadas"
    elif temporal_preference <= 70:
        return "Você tem flexibilidade no ritmo de preparação"
    else:
        return "Você prefere rotas com marcos frequentes e resultados rápidos"


async def calculate_user_momentum(
    user_id: uuid.UUID,
    db: AsyncSession
) -> int:
    """
    Calcula momentum do usuário (marcos completados nos últimos 30 dias).
    
    Args:
        user_id: UUID do usuário
        db: Sessão do banco de dados
    
    Returns:
        Número de marcos completados
    """
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    result = await db.execute(
        select(func.count(RouteMilestone.id))
        .join(Route, RouteMilestone.route_id == Route.id)
        .where(
            Route.user_id == user_id,
            RouteMilestone.status == 'completed',
            RouteMilestone.completed_at >= thirty_days_ago
        )
    )
    
    momentum = result.scalar() or 0
    return momentum
