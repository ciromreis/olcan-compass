"""Opportunity Cost Service - Growth Potential Intelligence

Calcula custos de oportunidade e momentum do usuário para impulsionar conversões premium.
"""

import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import selectinload

from app.db.models.application import Opportunity
from app.db.models.route import Route, RouteMilestone
from app.db.models.user import User
from app.db.models.economics import OpportunityCostWidgetEvent


async def calculate_opportunity_cost(
    opportunity_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession
) -> Decimal:
    """
    Calcula custo de oportunidade diário para uma oportunidade.
    
    Fórmula: (target_salary - current_salary) / 365
    
    Args:
        opportunity_id: UUID da oportunidade
        user_id: UUID do usuário
        db: Sessão do banco de dados
    
    Returns:
        Custo de oportunidade diário em Decimal
    """
    # Buscar oportunidade
    result = await db.execute(
        select(Opportunity).where(Opportunity.id == opportunity_id)
    )
    opportunity = result.scalar_one_or_none()
    
    if not opportunity:
        raise ValueError("Oportunidade não encontrada")
    
    # Buscar usuário para salário atual
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise ValueError("Usuário não encontrado")
    
    # Obter target_salary da oportunidade (assumindo que foi adicionado via migration)
    # Se não existir, usar valor médio de mercado
    target_salary = Decimal('0')
    
    # Por enquanto, usar valor padrão baseado no tipo de oportunidade
    # Em produção, isso viria do campo target_salary da oportunidade
    opportunity_type_defaults = {
        'scholarship': Decimal('30000'),  # Bolsa média anual
        'job': Decimal('60000'),          # Salário médio tech
        'research_position': Decimal('45000'),
        'fellowship': Decimal('40000'),
        'internship': Decimal('24000'),
    }
    
    target_salary = opportunity_type_defaults.get(
        opportunity.opportunity_type,
        Decimal('50000')  # Default
    )
    
    # Salário atual (assumindo 0 se não especificado)
    current_salary = Decimal('0')
    
    # Calcular custo diário
    opportunity_cost_daily = (target_salary - current_salary) / Decimal('365')
    
    return opportunity_cost_daily.quantize(Decimal('0.01'))


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


async def should_show_widget(
    user_id: uuid.UUID,
    db: AsyncSession
) -> bool:
    """
    Determina se deve mostrar widget de potencial de crescimento.
    
    Critério: momentum < 2 marcos nos últimos 30 dias
    
    Args:
        user_id: UUID do usuário
        db: Sessão do banco de dados
    
    Returns:
        True se deve mostrar widget
    """
    momentum = await calculate_user_momentum(user_id, db)
    return momentum < 2


async def track_widget_impression(
    user_id: uuid.UUID,
    opportunity_id: Optional[uuid.UUID],
    opportunity_cost_shown: Decimal,
    momentum_score: int,
    session_id: Optional[str],
    db: AsyncSession
) -> uuid.UUID:
    """
    Registra impressão do widget para analytics.
    
    Args:
        user_id: UUID do usuário
        opportunity_id: UUID da oportunidade (opcional)
        opportunity_cost_shown: Valor do custo de oportunidade mostrado
        momentum_score: Score de momentum atual
        session_id: ID da sessão (opcional)
        db: Sessão do banco de dados
    
    Returns:
        UUID do evento criado
    """
    # Calcular dias desde último marco
    result = await db.execute(
        select(func.max(RouteMilestone.completed_at))
        .join(Route, RouteMilestone.route_id == Route.id)
        .where(
            Route.user_id == user_id,
            RouteMilestone.status == 'completed'
        )
    )
    last_milestone_date = result.scalar()
    
    days_since_last = None
    if last_milestone_date:
        days_since_last = (datetime.now(timezone.utc) - last_milestone_date).days
    
    # Criar evento
    event = OpportunityCostWidgetEvent(
        user_id=user_id,
        opportunity_id=opportunity_id,
        event_type='impression',
        opportunity_cost_shown=opportunity_cost_shown,
        momentum_score=momentum_score,
        days_since_last_milestone=days_since_last,
        metadata={'session_id': session_id} if session_id else {}
    )
    
    db.add(event)
    await db.flush()
    
    return event.id


async def track_widget_click(
    user_id: uuid.UUID,
    opportunity_id: Optional[uuid.UUID],
    session_id: Optional[str],
    db: AsyncSession
) -> uuid.UUID:
    """
    Registra clique no widget.
    
    Args:
        user_id: UUID do usuário
        opportunity_id: UUID da oportunidade (opcional)
        session_id: ID da sessão (opcional)
        db: Sessão do banco de dados
    
    Returns:
        UUID do evento criado
    """
    event = OpportunityCostWidgetEvent(
        user_id=user_id,
        opportunity_id=opportunity_id,
        event_type='click',
        metadata={'session_id': session_id} if session_id else {}
    )
    
    db.add(event)
    await db.flush()
    
    return event.id


async def track_conversion(
    user_id: uuid.UUID,
    upgrade_tier: str,
    conversion_value: Decimal,
    session_id: Optional[str],
    db: AsyncSession
) -> uuid.UUID:
    """
    Registra conversão (upgrade) atribuída ao widget.
    
    Args:
        user_id: UUID do usuário
        upgrade_tier: Tier do upgrade ('pro' ou 'premium')
        conversion_value: Valor da conversão
        session_id: ID da sessão (opcional)
        db: Sessão do banco de dados
    
    Returns:
        UUID do evento criado
    """
    # Verificar se houve impressão do widget nos últimos 7 dias
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    result = await db.execute(
        select(OpportunityCostWidgetEvent)
        .where(
            OpportunityCostWidgetEvent.user_id == user_id,
            OpportunityCostWidgetEvent.event_type == 'impression',
            OpportunityCostWidgetEvent.created_at >= seven_days_ago
        )
        .order_by(OpportunityCostWidgetEvent.created_at.desc())
        .limit(1)
    )
    
    recent_impression = result.scalar_one_or_none()
    
    # Criar evento de conversão
    event = OpportunityCostWidgetEvent(
        user_id=user_id,
        event_type='conversion',
        conversion_type=f'upgrade_{upgrade_tier}',
        metadata={
            'session_id': session_id,
            'conversion_value': str(conversion_value),
            'attributed_to_widget': recent_impression is not None
        } if session_id else {
            'conversion_value': str(conversion_value),
            'attributed_to_widget': recent_impression is not None
        }
    )
    
    db.add(event)
    await db.flush()
    
    return event.id


async def get_widget_analytics(
    user_id: Optional[uuid.UUID],
    start_date: Optional[datetime],
    end_date: Optional[datetime],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Obtém analytics do widget para admin dashboard.
    
    Args:
        user_id: UUID do usuário (opcional, para filtrar)
        start_date: Data inicial (opcional)
        end_date: Data final (opcional)
        db: Sessão do banco de dados
    
    Returns:
        Dict com métricas agregadas
    """
    query = select(OpportunityCostWidgetEvent)
    
    if user_id:
        query = query.where(OpportunityCostWidgetEvent.user_id == user_id)
    
    if start_date:
        query = query.where(OpportunityCostWidgetEvent.created_at >= start_date)
    
    if end_date:
        query = query.where(OpportunityCostWidgetEvent.created_at <= end_date)
    
    result = await db.execute(query)
    events = list(result.scalars().all())
    
    # Calcular métricas
    impressions = [e for e in events if e.event_type == 'impression']
    clicks = [e for e in events if e.event_type == 'click']
    conversions = [e for e in events if e.event_type == 'conversion']
    
    impression_count = len(impressions)
    click_count = len(clicks)
    conversion_count = len(conversions)
    
    click_through_rate = (click_count / impression_count) if impression_count > 0 else 0
    conversion_rate = (conversion_count / impression_count) if impression_count > 0 else 0
    
    # Calcular revenue atribuído
    attributed_revenue = Decimal('0')
    for conv in conversions:
        if conv.event_metadata.get('attributed_to_widget'):
            value_str = conv.event_metadata.get('conversion_value', '0')
            attributed_revenue += Decimal(value_str)
    
    # Calcular custo de oportunidade médio mostrado
    avg_opportunity_cost = Decimal('0')
    if impressions:
        total_cost = sum(
            e.opportunity_cost_shown for e in impressions 
            if e.opportunity_cost_shown is not None
        )
        avg_opportunity_cost = total_cost / len(impressions) if impressions else Decimal('0')
    
    return {
        'widget_impressions': impression_count,
        'widget_clicks': click_count,
        'click_through_rate': float(click_through_rate),
        'conversions': conversion_count,
        'conversion_rate': float(conversion_rate),
        'attributed_revenue': float(attributed_revenue),
        'average_opportunity_cost_shown': float(avg_opportunity_cost),
        'period': {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat() if end_date else None
        }
    }


async def calculate_cumulative_opportunity_cost(
    user_id: uuid.UUID,
    opportunity_id: uuid.UUID,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Calcula custo de oportunidade acumulado desde o início da jornada.
    
    Args:
        user_id: UUID do usuário
        opportunity_id: UUID da oportunidade
        db: Sessão do banco de dados
    
    Returns:
        Dict com custos acumulados
    """
    # Calcular custo diário
    daily_cost = await calculate_opportunity_cost(opportunity_id, user_id, db)
    
    # Buscar data de criação da conta do usuário
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise ValueError("Usuário não encontrado")
    
    # Calcular dias desde criação
    days_since_start = (datetime.now(timezone.utc) - user.created_at).days
    
    # Calcular custos acumulados
    cumulative_cost = daily_cost * Decimal(str(days_since_start))
    monthly_cost = daily_cost * Decimal('30')
    yearly_cost = daily_cost * Decimal('365')
    
    return {
        'daily_cost': float(daily_cost),
        'monthly_cost': float(monthly_cost),
        'yearly_cost': float(yearly_cost),
        'cumulative_cost': float(cumulative_cost),
        'days_since_start': days_since_start,
        'currency': 'BRL'
    }
