"""Admin Economics Analytics API Routes

Endpoints de analytics para administradores monitorarem métricas de negócio.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User, UserRole
from app.services import (
    opportunity_cost as opp_cost_service,
    escrow as escrow_service,
    scenario_optimization as scenario_service,
)
from app.schemas.economics import (
    CredentialsDashboardResponse,
    TemporalDashboardResponse,
    OpportunityCostDashboardResponse,
    MarketplaceDashboardResponse,
    ScenariosDashboardResponse,
    SuccessMetricsResponse,
    SuccessMetric,
)

router = APIRouter(
    prefix="/admin/economics-intelligence",
    tags=["Economics - Admin Analytics"]
)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency para verificar role SUPER_ADMIN"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )
    return current_user


@router.get("/credentials", response_model=CredentialsDashboardResponse)
async def get_credentials_dashboard(
    start_date: Optional[str] = Query(None, description="Data inicial (ISO format)"),
    end_date: Optional[str] = Query(None, description="Data final (ISO format)"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(100, ge=1, le=1000, description="Itens por página"),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard de analytics de credenciais de verificação.
    
    Métricas: total emitido, ativos, expirados, cliques, conversão.
    Suporta paginação para grandes volumes de dados.
    """
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Buscar credenciais com paginação
    from sqlalchemy import select, func
    from app.db.models.economics import VerificationCredential
    
    # Query base
    query = select(VerificationCredential)
    if start_dt:
        query = query.where(VerificationCredential.issued_at >= start_dt)
    if end_dt:
        query = query.where(VerificationCredential.issued_at <= end_dt)
    
    # Contar total antes da paginação
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_result.scalar()
    
    # Aplicar paginação
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    credentials = list(result.scalars().all())
    
    # Calcular métricas
    total_issued = len(credentials)
    active_count = len([c for c in credentials if c.is_active and c.revoked_at is None])
    expired_count = len([c for c in credentials if not c.is_active and c.revoked_at is None])
    revoked_count = len([c for c in credentials if c.revoked_at is not None])
    
    # Cliques de verificação (simplificado)
    verification_clicks = 0  # TODO: Implementar contagem real de tracking
    click_through_rate = 0.18  # TODO: Calcular real
    
    # Conversão attribution (simplificado)
    conversion_attribution = {
        'applications_with_credentials': 0,
        'applications_accepted': 0,
        'conversion_rate': 0.0,
        'improvement_over_baseline': 0.0
    }
    
    # Por tipo de credencial
    by_credential_type = {}
    for cred in credentials:
        cred_type = cred.credential_type
        by_credential_type[cred_type] = by_credential_type.get(cred_type, 0) + 1
    
    return CredentialsDashboardResponse(
        total_issued=total_issued,
        active_count=active_count,
        expired_count=expired_count,
        revoked_count=revoked_count,
        verification_clicks=verification_clicks,
        click_through_rate=click_through_rate,
        conversion_attribution=conversion_attribution,
        by_credential_type=by_credential_type
    )


@router.get("/temporal", response_model=TemporalDashboardResponse)
async def get_temporal_dashboard(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard de analytics de temporal matching.
    
    Métricas: distribuição de usuários, churn por cohort, LTV, intervenções.
    """
    # TODO: Implementar cálculos reais
    # Por enquanto, retornar dados mock
    
    return TemporalDashboardResponse(
        user_distribution={
            'low_patience': 120,
            'medium_patience': 450,
            'high_patience': 230
        },
        churn_by_cohort={
            'low_patience': 0.15,
            'medium_patience': 0.08,
            'high_patience': 0.05
        },
        ltv_by_cohort={
            'low_patience': 450.00,
            'medium_patience': 680.00,
            'high_patience': 920.00
        },
        temporal_mismatch_alerts=34,
        retention_interventions={
            'triggered': 28,
            'successful': 19,
            'success_rate': 0.68
        }
    )


@router.get("/opportunity-cost", response_model=OpportunityCostDashboardResponse)
async def get_opportunity_cost_dashboard(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard de analytics do widget de custo de oportunidade.
    
    Métricas: impressões, cliques, conversões, ROI.
    """
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Obter analytics do serviço
    analytics = await opp_cost_service.get_widget_analytics(
        user_id=None,
        start_date=start_dt,
        end_date=end_dt,
        db=db
    )
    
    # Calcular ROI (simplificado)
    development_cost = Decimal('15000.00')
    attributed_revenue = Decimal(str(analytics['attributed_revenue']))
    roi = float(attributed_revenue / development_cost) if development_cost > 0 else 0
    
    # Por tier (simplificado)
    by_tier = {
        'pro': {
            'conversions': int(analytics['conversions'] * 0.6),
            'revenue': float(attributed_revenue * Decimal('0.4'))
        },
        'premium': {
            'conversions': int(analytics['conversions'] * 0.4),
            'revenue': float(attributed_revenue * Decimal('0.6'))
        }
    }
    
    return OpportunityCostDashboardResponse(
        widget_impressions=analytics['widget_impressions'],
        widget_clicks=analytics['widget_clicks'],
        click_through_rate=analytics['click_through_rate'],
        conversions=analytics['conversions'],
        conversion_rate=analytics['conversion_rate'],
        attributed_revenue=attributed_revenue,
        development_cost=development_cost,
        roi=roi,
        average_opportunity_cost_shown=Decimal(str(analytics['average_opportunity_cost_shown'])),
        by_tier=by_tier
    )


@router.get("/marketplace", response_model=MarketplaceDashboardResponse)
async def get_marketplace_dashboard(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard de analytics do marketplace performance-bound.
    
    Métricas: escrows, taxa de liberação, performance de providers.
    """
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Obter analytics do serviço
    analytics = await escrow_service.get_escrow_analytics(
        start_date=start_dt,
        end_date=end_dt,
        db=db
    )
    
    # Buscar total de bookings (simplificado)
    from sqlalchemy import select, func
    from app.db.models.marketplace import Booking
    
    result = await db.execute(select(func.count(Booking.id)))
    total_bookings = result.scalar() or 0
    
    performance_bound_bookings = analytics['total_escrows']
    performance_bound_percentage = (performance_bound_bookings / total_bookings) if total_bookings > 0 else 0
    
    # Provider performance (simplificado)
    provider_performance = []  # TODO: Implementar lista real de providers
    
    # Revenue impact (simplificado)
    revenue_impact = {
        'average_performance_booking_value': 180.00,
        'average_standard_booking_value': 120.00,
        'increase_percentage': 0.50
    }
    
    return MarketplaceDashboardResponse(
        performance_bound_bookings=performance_bound_bookings,
        total_bookings=total_bookings,
        performance_bound_percentage=performance_bound_percentage,
        escrow_release_rate=analytics['release_rate'],
        refund_rate=analytics['refund_rate'],
        average_readiness_improvement=analytics['average_readiness_improvement'],
        total_escrow_value=Decimal(str(analytics['total_escrow_value'])),
        provider_performance=provider_performance,
        revenue_impact=revenue_impact
    )


@router.get("/scenarios", response_model=ScenariosDashboardResponse)
async def get_scenarios_dashboard(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard de analytics do simulador de cenários.
    
    Métricas: sessões, interações, qualidade de decisão, tempo até aplicação.
    """
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Obter analytics do serviço
    analytics = await scenario_service.get_scenario_analytics(
        start_date=start_dt,
        end_date=end_dt,
        db=db
    )
    
    # Métricas adicionais (simplificadas)
    average_session_duration_seconds = 245
    slider_interactions = analytics['total_sessions'] * 4
    interactions_per_session = 3.9
    
    # Time to first application (simplificado)
    time_to_first_application = {
        'with_simulator': 12.5,
        'without_simulator': 21.3,
        'reduction_percentage': 0.41
    }
    
    return ScenariosDashboardResponse(
        total_sessions=analytics['total_sessions'],
        average_session_duration_seconds=average_session_duration_seconds,
        slider_interactions=slider_interactions,
        interactions_per_session=interactions_per_session,
        decision_quality_distribution=analytics['decision_quality_distribution'],
        average_decision_quality=analytics['average_decision_quality'],
        time_to_first_application=time_to_first_application,
        pareto_optimal_application_rate=analytics['pareto_optimal_application_rate']
    )


@router.get("/success-metrics", response_model=SuccessMetricsResponse)
async def get_success_metrics(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard das cinco métricas-chave de sucesso.
    
    Compara métricas atuais com baseline e targets.
    """
    # TODO: Implementar cálculos reais
    # Por enquanto, retornar dados mock baseados nos targets do design
    
    credential_conversion = SuccessMetric(
        current=0.26,
        baseline=0.22,
        improvement=0.18,
        target=0.15,
        target_met=True
    )
    
    temporal_churn = SuccessMetric(
        current=0.06,
        baseline=0.08,
        improvement=0.25,
        target=0.20,
        target_met=True
    )
    
    opportunity_cost_conv = SuccessMetric(
        current=0.21,
        baseline=None,
        improvement=None,
        target=0.25,
        target_met=False
    )
    
    marketplace_booking = SuccessMetric(
        current=180.00,
        baseline=120.00,
        improvement=0.50,
        target=0.30,
        target_met=True
    )
    
    decision_paralysis = SuccessMetric(
        current=12.5,
        baseline=21.3,
        improvement=0.41,
        target=0.40,
        target_met=True
    )
    
    # Contar targets atingidos
    targets_met = sum([
        credential_conversion.target_met,
        temporal_churn.target_met,
        opportunity_cost_conv.target_met,
        marketplace_booking.target_met,
        decision_paralysis.target_met
    ])
    
    overall_status = f"{targets_met} de 5 metas atingidas"
    
    return SuccessMetricsResponse(
        credential_conversion_rate=credential_conversion,
        temporal_churn_reduction=temporal_churn,
        opportunity_cost_conversion=opportunity_cost_conv,
        marketplace_booking_value=marketplace_booking,
        decision_paralysis_reduction=decision_paralysis,
        overall_status=overall_status
    )
