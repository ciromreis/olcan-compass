"""
Tarefas Celery para resolução de transações de escrow.

Este módulo contém tarefas assíncronas para:
- Resolução de escrow após conclusão de serviço performance-bound
- Verificação periódica de timeouts de escrow
"""
import uuid
import logging
from typing import Dict, Any

from celery import Task
from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import get_sessionmaker
from app.db.models.economics import EscrowTransaction, EscrowStatus
from app.services.escrow import (
    create_escrow,
    resolve_escrow,
    check_escrow_timeout
)

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, queue='economics')
def create_escrow_task(
    self: Task,
    booking_id: str,
    amount: float,
    release_condition: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Cria uma transação de escrow para reserva performance-bound.
    
    Args:
        booking_id: UUID da reserva (como string)
        amount: Valor a ser retido
        release_condition: Condições de liberação
    
    Returns:
        Dict com resultado da criação
    """
    try:
        logger.info(f"Criando escrow para reserva {booking_id}")
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        from decimal import Decimal
        
        async def _create():
            async with sessionmaker() as db:
                try:
                    escrow = await create_escrow(
                        booking_id=uuid.UUID(booking_id),
                        amount=Decimal(str(amount)),
                        currency="USD",  # Default
                        release_condition=release_condition,
                        db=db
                    )
                    await db.commit()
                    
                    return {
                        "escrow_id": str(escrow.id),
                        "status": "success"
                    }
                except Exception as e:
                    await db.rollback()
                    raise e
        
        result = asyncio.run(_create())
        return result
        
    except Exception as exc:
        logger.error(f"Erro ao criar escrow (tentativa {self.request.retries + 1}/3): {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@celery_app.task(bind=True, max_retries=3, queue='economics')
def resolve_escrow_task(
    self: Task,
    booking_id: str
) -> Dict[str, Any]:
    """
    Resolve transação de escrow baseada em melhoria de prontidão.
    
    Esta tarefa é acionada quando:
    - Reserva performance-bound é marcada como completa
    - Cliente completa avaliação de prontidão pós-serviço
    
    Args:
        booking_id: UUID da reserva (como string)
    
    Returns:
        Dict com resultado da resolução
    
    Raises:
        Exception: Se falhar após 3 tentativas
    """
    try:
        logger.info(
            f"Resolvendo escrow para reserva {booking_id}"
        )
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        
        async def _resolve():
            async with sessionmaker() as db:
                try:
                    # Buscar escrow por booking_id
                    from app.services.escrow import get_escrow_by_booking
                    escrow = await get_escrow_by_booking(uuid.UUID(booking_id), db)
                    
                    if not escrow:
                        return {"status": "skipped", "reason": "No escrow found for booking"}
                    
                    # Resolver escrow
                    result = await resolve_escrow(
                        escrow_id=escrow.id,
                        db=db
                    )
                    
                    await db.commit()
                    
                    return result
                    
                except Exception as e:
                    await db.rollback()
                    raise e
        
        result = asyncio.run(_resolve())
        
        if result.get("status") == "skipped":
            logger.info(f"Resolução de escrow pulada: {result['reason']}")
            return result
            
        logger.info(
            f"Escrow resolvido: {result['resolution']}, "
            f"melhoria={result['improvement_achieved']:.1f}, "
            f"mínimo={result['min_improvement_required']}"
        )
        
        return result
        
    except ValueError as e:
        # Erro de validação - não retentar
        logger.error(f"Erro de validação ao resolver escrow: {e}")
        raise
        
    except Exception as exc:
        logger.error(
            f"Erro ao resolver escrow (tentativa {self.request.retries + 1}/3): {exc}"
        )
        # Retentar com backoff exponencial
        raise self.retry(exc=exc, countdown=120 * (2 ** self.request.retries))


@celery_app.task(bind=True, queue='economics')
def check_escrow_timeouts_task(self: Task) -> Dict[str, Any]:
    """
    Verifica escrows pendentes que excederam timeout e resolve automaticamente.
    
    Esta tarefa roda a cada 30 minutos via Celery Beat.
    
    Timeout padrão: 90 dias após held_at
    
    Escrows que excederam timeout são resolvidos automaticamente:
    - Se há melhoria >= 5 pontos: libera ao provider
    - Se melhoria < 5 pontos: reembolsa cliente
    
    Returns:
        Dict com número de escrows verificados e resolvidos
    """
    try:
        logger.info("Verificando timeouts de escrow")
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        
        async def _check_timeouts():
            async with sessionmaker() as db:
                try:
                    # Buscar todos os escrows pendentes (status = held)
                    result = await db.execute(
                        select(EscrowTransaction)
                        .where(EscrowTransaction.status == EscrowStatus.HELD.value)
                    )
                    pending_escrows = list(result.scalars().all())
                    
                    logger.info(f"Encontrados {len(pending_escrows)} escrows pendentes")
                    
                    checked_count = 0
                    resolved_count = 0
                    timeout_days = 90  # Timeout padrão
                    errors = []
                    
                    for escrow in pending_escrows:
                        try:
                            # Verificar timeout
                            has_timeout = await check_escrow_timeout(
                                escrow.id,
                                timeout_days,
                                db
                            )
                            
                            checked_count += 1
                            
                            if has_timeout:
                                logger.info(
                                    f"Escrow {escrow.id} excedeu timeout de {timeout_days} dias"
                                )
                                
                                # Resolver automaticamente
                                try:
                                    result = await resolve_escrow(escrow.id, db)
                                    resolved_count += 1
                                    
                                    logger.info(
                                        f"Escrow {escrow.id} resolvido automaticamente: "
                                        f"{result['resolution']}"
                                    )
                                    
                                except Exception as e:
                                    logger.error(
                                        f"Erro ao resolver escrow {escrow.id} por timeout: {e}"
                                    )
                                    errors.append({
                                        'escrow_id': str(escrow.id),
                                        'error': str(e)
                                    })
                        
                        except Exception as e:
                            logger.warning(
                                f"Erro ao verificar timeout do escrow {escrow.id}: {e}"
                            )
                            errors.append({
                                'escrow_id': str(escrow.id),
                                'error': str(e)
                            })
                    
                    await db.commit()
                    
                    return {
                        "escrows_checked": checked_count,
                        "escrows_resolved": resolved_count,
                        "errors_count": len(errors),
                        "errors": errors[:10],  # Primeiros 10 erros
                        "status": "success"
                    }
                    
                except Exception as e:
                    await db.rollback()
                    raise e
        
        result = asyncio.run(_check_timeouts())
        
        logger.info(
            f"Verificação de timeouts concluída: {result['escrows_checked']} verificados, "
            f"{result['escrows_resolved']} resolvidos"
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"Erro na verificação de timeouts de escrow: {exc}")
        raise
