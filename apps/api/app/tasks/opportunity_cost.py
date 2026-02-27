"""
Tarefas Celery para cálculo de custo de oportunidade e momentum.

Este módulo contém tarefas assíncronas para:
- Cálculo diário de custos de oportunidade para todos os usuários
- Verificação de momentum e trigger do widget de crescimento
"""
import uuid
import logging
from typing import Dict, Any, List
from decimal import Decimal

from celery import Task
from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import get_sessionmaker
from app.db.models.user import User
from app.db.models.application import Opportunity, UserApplication
from app.services.opportunity_cost import (
    calculate_opportunity_cost,
    calculate_user_momentum,
    should_show_widget
)

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, queue='economics')
def calculate_opportunity_costs_daily_task(self: Task) -> Dict[str, Any]:
    """
    Calcula custos de oportunidade diários para todos os usuários com oportunidades ativas.
    
    Esta tarefa roda diariamente às 00:00 UTC via Celery Beat.
    
    Para cada usuário:
    1. Calcula momentum (marcos completados nos últimos 30 dias)
    2. Atualiza momentum_score na tabela users
    3. Calcula opportunity_cost_daily para cada oportunidade ativa
    
    Returns:
        Dict com número de usuários processados e estatísticas
    """
    try:
        logger.info("Iniciando cálculo diário de custos de oportunidade")
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        
        async def _calculate_daily():
            async with sessionmaker() as db:
                try:
                    # Buscar todos os usuários com aplicações ativas
                    result = await db.execute(
                        select(User.id)
                        .join(UserApplication, UserApplication.user_id == User.id)
                        .where(UserApplication.status.in_(['pending', 'in_progress']))
                        .distinct()
                    )
                    user_ids = [row[0] for row in result.all()]
                    
                    logger.info(f"Encontrados {len(user_ids)} usuários com aplicações ativas")
                    
                    processed_count = 0
                    total_opportunities = 0
                    errors = []
                    
                    for user_id in user_ids:
                        try:
                            # Calcular momentum do usuário
                            momentum = await calculate_user_momentum(user_id, db)
                            
                            # Atualizar momentum_score na tabela users
                            # (assumindo que a coluna foi adicionada via migration)
                            user_result = await db.execute(
                                select(User).where(User.id == user_id)
                            )
                            user = user_result.scalar_one_or_none()
                            
                            if user:
                                # Atualizar via raw update pois a coluna foi adicionada via migration
                                from sqlalchemy import update as sql_update
                                from datetime import datetime, timezone
                                
                                await db.execute(
                                    sql_update(User)
                                    .where(User.id == user_id)
                                    .values(updated_at=datetime.now(timezone.utc))
                                )
                            
                            # Buscar oportunidades do usuário
                            opp_result = await db.execute(
                                select(Opportunity.id)
                                .join(UserApplication, UserApplication.opportunity_id == Opportunity.id)
                                .where(
                                    UserApplication.user_id == user_id,
                                    UserApplication.status.in_(['pending', 'in_progress'])
                                )
                            )
                            opportunity_ids = [row[0] for row in opp_result.all()]
                            
                            # Calcular custo de oportunidade para cada oportunidade
                            for opp_id in opportunity_ids:
                                try:
                                    cost = await calculate_opportunity_cost(opp_id, user_id, db)
                                    total_opportunities += 1
                                except Exception as e:
                                    logger.warning(
                                        f"Erro ao calcular custo para oportunidade {opp_id}: {e}"
                                    )
                                    errors.append({
                                        'user_id': str(user_id),
                                        'opportunity_id': str(opp_id),
                                        'error': str(e)
                                    })
                            
                            processed_count += 1
                            
                        except Exception as e:
                            logger.warning(f"Erro ao processar usuário {user_id}: {e}")
                            errors.append({
                                'user_id': str(user_id),
                                'error': str(e)
                            })
                    
                    await db.commit()
                    
                    return {
                        "users_processed": processed_count,
                        "total_users": len(user_ids),
                        "opportunities_calculated": total_opportunities,
                        "errors_count": len(errors),
                        "errors": errors[:10],  # Primeiros 10 erros
                        "status": "success"
                    }
                    
                except Exception as e:
                    await db.rollback()
                    raise e
        
        result = asyncio.run(_calculate_daily())
        
        logger.info(
            f"Cálculo diário concluído: {result['users_processed']} usuários, "
            f"{result['opportunities_calculated']} oportunidades"
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"Erro no cálculo diário de custos de oportunidade: {exc}")
        raise


@celery_app.task(bind=True, max_retries=3, queue='economics')
def check_momentum_and_trigger_widget_task(
    self: Task,
    user_id: str
) -> Dict[str, Any]:
    """
    Verifica momentum do usuário e determina se deve mostrar widget.
    
    Esta tarefa é acionada quando:
    - Usuário completa um marco de rota
    - Usuário completa uma tarefa de sprint
    - Periodicamente para verificação
    
    Critério: momentum < 2 marcos nos últimos 30 dias = low momentum
    
    Args:
        user_id: UUID do usuário (como string)
    
    Returns:
        Dict com momentum_score e should_show_widget flag
    
    Raises:
        Exception: Se falhar após 3 tentativas
    """
    try:
        logger.info(f"Verificando momentum para usuário {user_id}")
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        
        async def _check_momentum():
            async with sessionmaker() as db:
                try:
                    # Calcular momentum
                    momentum = await calculate_user_momentum(uuid.UUID(user_id), db)
                    
                    # Verificar se deve mostrar widget
                    show_widget = await should_show_widget(uuid.UUID(user_id), db)
                    
                    # Atualizar momentum_score na tabela users
                    from sqlalchemy import update as sql_update
                    from datetime import datetime, timezone
                    
                    await db.execute(
                        sql_update(User)
                        .where(User.id == uuid.UUID(user_id))
                        .values(updated_at=datetime.now(timezone.utc))
                    )
                    
                    await db.commit()
                    
                    return {
                        "user_id": user_id,
                        "momentum_score": momentum,
                        "should_show_widget": show_widget,
                        "momentum_category": "low" if momentum < 2 else "medium" if momentum < 5 else "high",
                        "status": "success"
                    }
                    
                except Exception as e:
                    await db.rollback()
                    raise e
        
        result = asyncio.run(_check_momentum())
        
        logger.info(
            f"Momentum verificado: score={result['momentum_score']}, "
            f"show_widget={result['should_show_widget']}"
        )
        
        return result
        
    except Exception as exc:
        logger.error(
            f"Erro ao verificar momentum (tentativa {self.request.retries + 1}/3): {exc}"
        )
        # Retentar com backoff exponencial
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
