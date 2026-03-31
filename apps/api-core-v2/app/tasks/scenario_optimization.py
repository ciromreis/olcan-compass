"""
Tarefas Celery para otimização de cenários e cálculo de fronteira viável.

Este módulo contém tarefas assíncronas para:
- Cálculo de fronteira viável de oportunidades Pareto-ótimas
- Identificação de oportunidades que maximizam competitividade vs recursos
"""
import uuid
import logging
from typing import Dict, Any

from celery import Task

from app.core.celery_app import celery_app
from app.db.session import get_sessionmaker
from app.services.scenario_optimization import calculate_feasible_frontier

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, queue='economics')
def calculate_feasible_frontier_task(
    self: Task,
    user_id: str,
    constraints: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calcula fronteira viável de oportunidades Pareto-ótimas.
    
    Esta tarefa é acionada quando:
    - Usuário acessa página do Simulador de Cenários
    - Usuário ajusta sliders de constraints
    - Não existe cálculo recente (< 24h)
    
    Processo:
    1. Filtra oportunidades que atendem constraints básicos
    2. Scoreia cada oportunidade em duas dimensões:
       - Competitiveness (0-100): Quão prestigiosa/competitiva
       - Resource Requirements (0-100): Quanto esforço necessário
    3. Identifica oportunidades Pareto-ótimas usando algoritmo de dominância
    4. Salva simulação no banco de dados
    
    Uma oportunidade é Pareto-ótima se não existe outra que seja
    simultaneamente mais competitiva E requeira menos recursos.
    
    Args:
        user_id: UUID do usuário (como string)
        constraints: Dict com:
            - budget_max: Orçamento máximo (Decimal)
            - time_available_months: Meses disponíveis (int)
            - skill_level: Nível de habilidade 0-100 (int)
            - target_locations: Lista de países (List[str])
            - preferred_industries: Lista de indústrias (List[str])
    
    Returns:
        Dict com simulation_id e pareto_opportunities
    
    Raises:
        Exception: Se falhar após 3 tentativas
    """
    try:
        logger.info(
            f"Calculando fronteira viável para usuário {user_id} "
            f"com constraints: {constraints}"
        )
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        
        async def _calculate_frontier():
            async with sessionmaker() as db:
                try:
                    # Calcular fronteira viável
                    result = await calculate_feasible_frontier(
                        user_id=uuid.UUID(user_id),
                        constraints=constraints,
                        db=db
                    )
                    
                    await db.commit()
                    
                    return result
                    
                except Exception as e:
                    await db.rollback()
                    raise e
        
        result = asyncio.run(_calculate_frontier())
        
        logger.info(
            f"Fronteira viável calculada: {result['pareto_count']} oportunidades "
            f"Pareto-ótimas de {result['total_opportunities_analyzed']} analisadas"
        )
        
        return result
        
    except ValueError as e:
        # Erro de validação - não retentar
        logger.error(f"Erro de validação ao calcular fronteira: {e}")
        raise
        
    except Exception as exc:
        logger.error(
            f"Erro ao calcular fronteira viável "
            f"(tentativa {self.request.retries + 1}/3): {exc}"
        )
        # Retentar com backoff exponencial
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
