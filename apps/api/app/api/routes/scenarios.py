"""Scenario Optimization API Routes - Feasible Frontier Calculator

Endpoints para cálculo de fronteira viável e simulação de cenários.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.services import scenario_optimization as scenario_service
from app.schemas.economics import (
    CalculateFrontierRequest,
    FeasibleFrontierResponse,
    OpportunityScore,
    SimulationsListResponse,
    SimulationSummary,
    SimulationDetailResponse,
    TrackDecisionRequest,
    TrackDecisionResponse,
    ScenarioConstraints,
)

router = APIRouter(prefix="/scenarios", tags=["Economics - Scenario Optimization"])


@router.post("/calculate-frontier", response_model=FeasibleFrontierResponse)
async def calculate_frontier(
    request: CalculateFrontierRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calcula fronteira viável de oportunidades Pareto-ótimas.
    
    Identifica oportunidades que oferecem o melhor equilíbrio entre
    competitividade e requisitos de recursos.
    """
    # Validar constraints
    constraints_dict = request.constraints.model_dump()
    
    # Calcular fronteira
    result = await scenario_service.calculate_feasible_frontier(
        user_id=current_user.id,
        constraints=constraints_dict,
        db=db
    )
    
    await db.commit()
    
    # Converter para schema de resposta
    pareto_opps = [
        OpportunityScore(
            opportunity_id=opp['opportunity_id'],
            title=opp['title'],
            competitiveness_score=opp['competitiveness_score'],
            resource_requirements_score=opp['resource_requirements_score'],
            is_pareto_optimal=opp['is_pareto_optimal']
        )
        for opp in result['pareto_optimal_opportunities']
    ]
    
    return FeasibleFrontierResponse(
        simulation_id=result['simulation_id'],
        pareto_optimal_opportunities=pareto_opps,
        total_opportunities_analyzed=result['total_opportunities_analyzed'],
        pareto_count=result['pareto_count'],
        calculated_at=result['calculated_at']
    )


@router.get("/simulations", response_model=SimulationsListResponse)
async def get_simulations(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém simulações salvas do usuário.
    
    Query params:
    - limit: Número máximo de resultados (1-50, padrão: 10)
    - offset: Offset para paginação (padrão: 0)
    """
    simulations = await scenario_service.get_user_simulations(
        user_id=current_user.id,
        db=db,
        limit=limit,
        offset=offset
    )
    
    # Converter para schema de resposta
    simulation_summaries = [
        SimulationSummary(
            id=str(sim.id),
            simulation_name=sim.simulation_name,
            constraints=ScenarioConstraints(**sim.constraints),
            pareto_count=len(sim.pareto_optimal_ids),
            created_at=sim.created_at
        )
        for sim in simulations
    ]
    
    # Contar total
    from sqlalchemy import select, func
    from app.db.models.economics import ScenarioSimulation
    
    result = await db.execute(
        select(func.count(ScenarioSimulation.id))
        .where(ScenarioSimulation.user_id == current_user.id)
    )
    total = result.scalar() or 0
    
    return SimulationsListResponse(
        simulations=simulation_summaries,
        total=total
    )


@router.get("/{simulation_id}", response_model=SimulationDetailResponse)
async def get_simulation_detail(
    simulation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém detalhes completos de uma simulação.
    
    Inclui lista de oportunidades Pareto-ótimas com scores.
    """
    try:
        simulation_uuid = uuid.UUID(simulation_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de simulação inválido"
        )
    
    try:
        details = await scenario_service.get_simulation_details(
            simulation_id=simulation_uuid,
            user_id=current_user.id,
            db=db
        )
        
        # Converter para schema de resposta
        opportunities_detail = [
            OpportunityScore(
                opportunity_id=opp['opportunity_id'],
                title=opp['title'],
                competitiveness_score=opp['competitiveness_score'],
                resource_requirements_score=opp['resource_requirements_score'],
                is_pareto_optimal=True
            )
            for opp in details['pareto_opportunities']
        ]
        
        return SimulationDetailResponse(
            id=details['id'],
            simulation_name=details['simulation_name'],
            constraints=ScenarioConstraints(**details['constraints']),
            pareto_opportunities=[opp['opportunity_id'] for opp in details['pareto_opportunities']],
            opportunities_detail=opportunities_detail,
            total_opportunities_analyzed=details['total_opportunities_analyzed'],
            created_at=details['created_at']
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/track-decision", response_model=TrackDecisionResponse, status_code=status.HTTP_201_CREATED)
async def track_decision(
    request: TrackDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Registra qualidade de decisão quando usuário aplica para oportunidade.
    
    Calcula se a oportunidade escolhida era Pareto-ótima.
    """
    try:
        application_uuid = uuid.UUID(request.application_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de aplicação inválido"
        )
    
    try:
        decision_quality = await scenario_service.track_decision_quality(
            user_id=current_user.id,
            application_id=application_uuid,
            db=db
        )
        
        await db.commit()
        
        return TrackDecisionResponse(
            tracked=True,
            decision_quality_score=decision_quality
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
