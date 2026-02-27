"""Scenario Optimization Service - Feasible Frontier Calculator

Calcula fronteira viável de oportunidades Pareto-ótimas para reduzir paralisia de decisão.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.models.application import Opportunity, UserApplication
from app.db.models.economics import ScenarioSimulation
from app.db.models.user import User


class OpportunityScore:
    """Score de uma oportunidade em duas dimensões"""
    def __init__(
        self,
        opportunity_id: uuid.UUID,
        competitiveness_score: int,
        resource_requirements_score: int,
        opportunity_data: Dict[str, Any]
    ):
        self.opportunity_id = opportunity_id
        self.competitiveness_score = competitiveness_score
        self.resource_requirements_score = resource_requirements_score
        self.opportunity_data = opportunity_data


async def calculate_feasible_frontier(
    user_id: uuid.UUID,
    constraints: Dict[str, Any],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Calcula fronteira viável de oportunidades Pareto-ótimas.
    
    Args:
        user_id: UUID do usuário
        constraints: Dict com budget_max, time_available_months, skill_level, target_locations, preferred_industries
        db: Sessão do banco de dados
    
    Returns:
        Dict com simulation_id e pareto_opportunities
    """
    # Extrair constraints
    budget_max = Decimal(str(constraints.get('budget_max', 100000)))
    time_available_months = constraints.get('time_available_months', 12)
    skill_level = constraints.get('skill_level', 50)
    target_locations = constraints.get('target_locations', [])
    preferred_industries = constraints.get('preferred_industries', [])
    
    # Buscar oportunidades que atendem constraints básicos
    query = select(Opportunity).where(Opportunity.status == 'published')
    
    # Filtrar por localização se especificado
    if target_locations:
        query = query.where(Opportunity.location_country.in_(target_locations))
    
    result = await db.execute(query)
    opportunities = list(result.scalars().all())
    
    # Scorear cada oportunidade
    scored_opportunities = []
    for opp in opportunities:
        score = await score_opportunity(opp.id, user_id, db)
        scored_opportunities.append(score)
    
    # Identificar Pareto-optimal
    pareto_optimal_ids = identify_pareto_optimal(scored_opportunities)
    
    # Salvar simulação
    simulation = ScenarioSimulation(
        user_id=user_id,
        constraints=constraints,
        opportunity_ids=[s.opportunity_id for s in scored_opportunities],
        pareto_optimal_ids=pareto_optimal_ids,
        selected_opportunity_id=None,
        decision_quality_score=None
    )
    
    db.add(simulation)
    await db.flush()
    
    # Preparar resposta com detalhes das oportunidades
    pareto_opportunities = []
    for score in scored_opportunities:
        if score.opportunity_id in pareto_optimal_ids:
            pareto_opportunities.append({
                'opportunity_id': str(score.opportunity_id),
                'title': score.opportunity_data.get('title'),
                'competitiveness_score': score.competitiveness_score,
                'resource_requirements_score': score.resource_requirements_score,
                'is_pareto_optimal': True
            })
    
    return {
        'simulation_id': str(simulation.id),
        'pareto_optimal_opportunities': pareto_opportunities,
        'total_opportunities_analyzed': len(scored_opportunities),
        'pareto_count': len(pareto_optimal_ids),
        'calculated_at': datetime.now(timezone.utc).isoformat()
    }


async def score_opportunity(
    opportunity_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession
) -> OpportunityScore:
    """
    Scoreia oportunidade em competitividade e requisitos de recursos.
    
    Competitiveness (0-100): Quão competitiva/prestigiosa é a oportunidade
    Resource Requirements (0-100): Quanto esforço/recursos são necessários
    
    Args:
        opportunity_id: UUID da oportunidade
        user_id: UUID do usuário
        db: Sessão do banco de dados
    
    Returns:
        OpportunityScore com scores calculados
    """
    # Buscar oportunidade
    result = await db.execute(
        select(Opportunity).where(Opportunity.id == opportunity_id)
    )
    opportunity = result.scalar_one_or_none()
    
    if not opportunity:
        raise ValueError("Oportunidade não encontrada")
    
    # Calcular competitiveness score
    # Fatores: tipo de oportunidade, organização, localização
    competitiveness = 50  # Base
    
    # Tipo de oportunidade
    competitive_types = {
        'scholarship': 70,
        'research_position': 75,
        'fellowship': 80,
        'job': 60,
        'internship': 50
    }
    competitiveness = competitive_types.get(opportunity.opportunity_type, 50)
    
    # Ajustar por país (países mais competitivos)
    competitive_countries = ['USA', 'UK', 'Canada', 'Germany', 'Switzerland']
    if opportunity.location_country in competitive_countries:
        competitiveness = min(100, competitiveness + 10)
    
    # Calcular resource requirements score
    # Fatores: duração, custo estimado, requisitos de documentação
    resource_requirements = 50  # Base
    
    # Duração (mais longo = mais recursos)
    if opportunity.duration_months:
        if opportunity.duration_months > 24:
            resource_requirements = min(100, resource_requirements + 30)
        elif opportunity.duration_months > 12:
            resource_requirements = min(100, resource_requirements + 20)
        elif opportunity.duration_months > 6:
            resource_requirements = min(100, resource_requirements + 10)
    
    # Tipo de oportunidade (alguns requerem mais preparação)
    resource_intensive_types = {
        'research_position': 80,
        'fellowship': 75,
        'scholarship': 70,
        'job': 60,
        'internship': 50
    }
    type_resource_score = resource_intensive_types.get(opportunity.opportunity_type, 50)
    resource_requirements = int((resource_requirements + type_resource_score) / 2)
    
    # Garantir range 0-100
    competitiveness = max(0, min(100, competitiveness))
    resource_requirements = max(0, min(100, resource_requirements))
    
    return OpportunityScore(
        opportunity_id=opportunity.id,
        competitiveness_score=competitiveness,
        resource_requirements_score=resource_requirements,
        opportunity_data={
            'title': opportunity.title,
            'type': opportunity.opportunity_type,
            'location': opportunity.location_country
        }
    )


def identify_pareto_optimal(
    opportunities: List[OpportunityScore]
) -> List[uuid.UUID]:
    """
    Identifica oportunidades Pareto-ótimas.
    
    Uma oportunidade é Pareto-ótima se não existe outra oportunidade que seja
    simultaneamente melhor (maior competitividade E menores requisitos).
    
    Args:
        opportunities: Lista de OpportunityScore
    
    Returns:
        Lista de UUIDs das oportunidades Pareto-ótimas
    """
    pareto_optimal = []
    
    for i, opp_i in enumerate(opportunities):
        is_dominated = False
        
        # Verificar se opp_i é dominada por alguma outra oportunidade
        for j, opp_j in enumerate(opportunities):
            if i == j:
                continue
            
            # opp_j domina opp_i se:
            # - opp_j tem competitividade >= opp_i E
            # - opp_j tem requisitos <= opp_i E
            # - pelo menos uma das desigualdades é estrita
            
            comp_better_or_equal = opp_j.competitiveness_score >= opp_i.competitiveness_score
            resource_better_or_equal = opp_j.resource_requirements_score <= opp_i.resource_requirements_score
            
            comp_strictly_better = opp_j.competitiveness_score > opp_i.competitiveness_score
            resource_strictly_better = opp_j.resource_requirements_score < opp_i.resource_requirements_score
            
            if comp_better_or_equal and resource_better_or_equal and (comp_strictly_better or resource_strictly_better):
                is_dominated = True
                break
        
        if not is_dominated:
            pareto_optimal.append(opp_i.opportunity_id)
    
    return pareto_optimal


async def track_decision_quality(
    user_id: uuid.UUID,
    application_id: uuid.UUID,
    db: AsyncSession
) -> float:
    """
    Registra qualidade de decisão quando usuário aplica para oportunidade.
    
    Args:
        user_id: UUID do usuário
        application_id: UUID da aplicação
        db: AsyncSession
    
    Returns:
        Score de qualidade de decisão (0.0-1.0)
    """
    # Buscar aplicação
    result = await db.execute(
        select(UserApplication)
        .where(UserApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise ValueError("Aplicação não encontrada")
    
    opportunity_id = application.opportunity_id
    
    # Buscar simulação mais recente do usuário
    result = await db.execute(
        select(ScenarioSimulation)
        .where(ScenarioSimulation.user_id == user_id)
        .order_by(ScenarioSimulation.created_at.desc())
        .limit(1)
    )
    simulation = result.scalar_one_or_none()
    
    if not simulation:
        # Sem simulação, não podemos calcular qualidade
        return 0.5
    
    # Verificar se oportunidade estava na simulação
    if opportunity_id not in simulation.opportunity_ids:
        # Oportunidade não estava na análise
        return 0.5
    
    # Verificar se era Pareto-optimal
    was_pareto_optimal = opportunity_id in simulation.pareto_optimal_ids
    
    # Calcular decision quality
    if was_pareto_optimal:
        decision_quality = 1.0  # Decisão ótima
    else:
        # Calcular quão longe estava do Pareto-optimal
        # (Implementação simplificada)
        decision_quality = 0.5
    
    # Atualizar simulação
    simulation.selected_opportunity_id = opportunity_id
    simulation.decision_quality_score = decision_quality
    
    await db.flush()
    
    return decision_quality


async def get_user_simulations(
    user_id: uuid.UUID,
    db: AsyncSession,
    limit: int = 10,
    offset: int = 0
) -> List[ScenarioSimulation]:
    """
    Obtém simulações salvas do usuário.
    
    Args:
        user_id: UUID do usuário
        db: Sessão do banco de dados
        limit: Número máximo de resultados
        offset: Offset para paginação
    
    Returns:
        Lista de simulações
    """
    result = await db.execute(
        select(ScenarioSimulation)
        .where(ScenarioSimulation.user_id == user_id)
        .order_by(ScenarioSimulation.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    
    return list(result.scalars().all())


async def get_simulation_details(
    simulation_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Obtém detalhes completos de uma simulação.
    
    Args:
        simulation_id: UUID da simulação
        user_id: UUID do usuário (para validação)
        db: Sessão do banco de dados
    
    Returns:
        Dict com detalhes da simulação
    
    Raises:
        ValueError: Se simulação não encontrada ou não pertence ao usuário
    """
    result = await db.execute(
        select(ScenarioSimulation).where(ScenarioSimulation.id == simulation_id)
    )
    simulation = result.scalar_one_or_none()
    
    if not simulation:
        raise ValueError("Simulação não encontrada")
    
    if simulation.user_id != user_id:
        raise ValueError("Simulação não pertence ao usuário")
    
    # Buscar detalhes das oportunidades Pareto-optimal
    pareto_opportunities = []
    for opp_id in simulation.pareto_optimal_ids:
        result = await db.execute(
            select(Opportunity).where(Opportunity.id == opp_id)
        )
        opp = result.scalar_one_or_none()
        
        if opp:
            # Scorear novamente para obter scores
            score = await score_opportunity(opp.id, user_id, db)
            
            pareto_opportunities.append({
                'opportunity_id': str(opp.id),
                'title': opp.title,
                'type': opp.opportunity_type,
                'location': opp.location_country,
                'competitiveness_score': score.competitiveness_score,
                'resource_requirements_score': score.resource_requirements_score
            })
    
    return {
        'id': str(simulation.id),
        'simulation_name': simulation.simulation_name,
        'constraints': simulation.constraints,
        'pareto_opportunities': pareto_opportunities,
        'total_opportunities_analyzed': len(simulation.opportunity_ids),
        'pareto_count': len(simulation.pareto_optimal_ids),
        'selected_opportunity_id': str(simulation.selected_opportunity_id) if simulation.selected_opportunity_id else None,
        'decision_quality_score': simulation.decision_quality_score,
        'created_at': simulation.created_at.isoformat()
    }


async def get_scenario_analytics(
    start_date: Optional[datetime],
    end_date: Optional[datetime],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Obtém analytics do simulador para admin dashboard.
    
    Args:
        start_date: Data inicial (opcional)
        end_date: Data final (opcional)
        db: Sessão do banco de dados
    
    Returns:
        Dict com métricas agregadas
    """
    query = select(ScenarioSimulation)
    
    if start_date:
        query = query.where(ScenarioSimulation.created_at >= start_date)
    
    if end_date:
        query = query.where(ScenarioSimulation.created_at <= end_date)
    
    result = await db.execute(query)
    simulations = list(result.scalars().all())
    
    # Calcular métricas
    total_sessions = len(simulations)
    
    # Decision quality scores
    quality_scores = [s.decision_quality_score for s in simulations if s.decision_quality_score is not None]
    avg_decision_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
    
    # Distribuição de decision quality
    quality_distribution = {
        '0-20': 0,
        '20-40': 0,
        '40-60': 0,
        '60-80': 0,
        '80-100': 0
    }
    
    for score in quality_scores:
        score_pct = score * 100
        if score_pct < 20:
            quality_distribution['0-20'] += 1
        elif score_pct < 40:
            quality_distribution['20-40'] += 1
        elif score_pct < 60:
            quality_distribution['40-60'] += 1
        elif score_pct < 80:
            quality_distribution['60-80'] += 1
        else:
            quality_distribution['80-100'] += 1
    
    # Taxa de aplicação Pareto-optimal
    pareto_applications = len([s for s in simulations if s.selected_opportunity_id in s.pareto_optimal_ids])
    pareto_rate = (pareto_applications / len([s for s in simulations if s.selected_opportunity_id])) if any(s.selected_opportunity_id for s in simulations) else 0
    
    return {
        'total_sessions': total_sessions,
        'average_decision_quality': float(avg_decision_quality),
        'decision_quality_distribution': quality_distribution,
        'pareto_optimal_application_rate': float(pareto_rate),
        'period': {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat() if end_date else None
        }
    }
