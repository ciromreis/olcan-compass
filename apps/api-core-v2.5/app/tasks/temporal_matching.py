"""
Tarefas Celery para matching temporal de rotas.

Este módulo contém tarefas assíncronas para:
- Recálculo de preferências temporais após avaliações psicológicas
- Atualização de recomendações de rotas baseadas em tempo
"""
import uuid
import logging
from typing import Dict, Any

from celery import Task

from app.core.celery_app import celery_app
from app.db.session import get_sessionmaker
from app.services.temporal_matching import (
    calculate_temporal_preference,
    update_temporal_preference,
    get_matched_routes
)

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, queue='economics')
def recalculate_temporal_matches_task(
    self: Task,
    user_id: str
) -> Dict[str, Any]:
    """
    Recalcula recomendações de rotas baseadas em preferência temporal.
    
    Esta tarefa é acionada quando:
    - Usuário completa avaliação psicológica
    - Perfil psicológico é atualizado
    
    O cálculo considera:
    - Discipline score (baixa disciplina = maior urgência)
    - Anxiety score (alta ansiedade = maior urgência)
    - Risk profile (aggressive = maior urgência)
    
    Args:
        user_id: UUID do usuário (como string)
    
    Returns:
        Dict com temporal_preference e matched_routes_count
    
    Raises:
        Exception: Se falhar após 3 tentativas
    """
    try:
        logger.info(f"Recalculando matches temporais para usuário {user_id}")
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        
        async def _recalculate():
            async with sessionmaker() as db:
                try:
                    # Calcular preferência temporal do usuário
                    temporal_pref = await calculate_temporal_preference(
                        user_id=uuid.UUID(user_id),
                        db=db
                    )
                    
                    logger.info(
                        f"Preferência temporal calculada: {temporal_pref} "
                        f"para usuário {user_id}"
                    )
                    
                    # Atualizar no perfil psicológico
                    await update_temporal_preference(
                        user_id=uuid.UUID(user_id),
                        temporal_preference=temporal_pref,
                        db=db
                    )
                    
                    # Obter rotas recomendadas
                    matched_routes = await get_matched_routes(
                        user_id=uuid.UUID(user_id),
                        db=db,
                        limit=10
                    )
                    
                    await db.commit()
                    
                    return {
                        "temporal_preference": temporal_pref,
                        "matched_routes_count": len(matched_routes),
                        "top_match_score": matched_routes[0]['match_score'] if matched_routes else 0,
                        "status": "success"
                    }
                    
                except Exception as e:
                    await db.rollback()
                    raise e
        
        result = asyncio.run(_recalculate())
        
        logger.info(
            f"Matches temporais recalculados: {result['matched_routes_count']} rotas "
            f"encontradas para usuário {user_id}"
        )
        
        return result
        
    except Exception as exc:
        logger.error(
            f"Erro ao recalcular matches temporais "
            f"(tentativa {self.request.retries + 1}/3): {exc}"
        )
        # Retentar com backoff exponencial
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
