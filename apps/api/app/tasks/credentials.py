"""
Tarefas Celery para gerenciamento de credenciais de verificação.

Este módulo contém tarefas assíncronas para:
- Geração de credenciais quando score de prontidão cruza limiar
- Expiração automática de credenciais antigas
"""
import uuid
import logging
from typing import Dict, Any

from celery import Task
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.celery_app import celery_app
from app.db.session import get_sessionmaker
from app.services.credentials import generate_credential, expire_old_credentials

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, queue='economics')
def generate_credential_task(
    self: Task,
    user_id: str,
    credential_type: str,
    score_value: int
) -> Dict[str, Any]:
    """
    Gera credencial de verificação quando score de prontidão cruza limiar.
    
    Esta tarefa é acionada quando:
    - ReadinessAssessment.overall_readiness >= 80
    - Usuário completa milestone importante
    - Usuário atinge conquista significativa
    
    Args:
        user_id: UUID do usuário (como string)
        credential_type: Tipo de credencial ('readiness', 'expertise', 'achievement')
        score_value: Valor do score (0-100)
    
    Returns:
        Dict com credential_id e verification_hash
    
    Raises:
        Exception: Se falhar após 3 tentativas
    """
    try:
        logger.info(
            f"Gerando credencial para usuário {user_id}, "
            f"tipo={credential_type}, score={score_value}"
        )
        
        # Criar sessão assíncrona
        sessionmaker = get_sessionmaker()
        
        # Executar operação assíncrona de forma síncrona (Celery não suporta async diretamente)
        import asyncio
        
        async def _generate():
            async with sessionmaker() as db:
                try:
                    credential = await generate_credential(
                        user_id=uuid.UUID(user_id),
                        credential_type=credential_type,
                        score_value=score_value,
                        db=db
                    )
                    await db.commit()
                    
                    return {
                        "credential_id": str(credential.id),
                        "verification_hash": credential.verification_hash,
                        "verification_url": credential.verification_url,
                        "issued_at": credential.issued_at.isoformat()
                    }
                except Exception as e:
                    await db.rollback()
                    raise e
        
        # Executar com asyncio
        result = asyncio.run(_generate())
        
        logger.info(
            f"Credencial gerada com sucesso: {result['credential_id']}"
        )
        
        return result
        
    except ValueError as e:
        # Erro de validação - não retentar
        logger.error(f"Erro de validação ao gerar credencial: {e}")
        raise
        
    except Exception as exc:
        logger.error(
            f"Erro ao gerar credencial (tentativa {self.request.retries + 1}/3): {exc}"
        )
        # Retentar com backoff exponencial
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@celery_app.task(bind=True, queue='economics')
def expire_old_credentials_task(self: Task) -> Dict[str, Any]:
    """
    Marca credenciais expiradas como inativas.
    
    Esta tarefa roda diariamente às 01:00 UTC via Celery Beat.
    Processa todas as credenciais onde expires_at <= now.
    
    Returns:
        Dict com número de credenciais expiradas
    """
    try:
        logger.info("Iniciando expiração de credenciais antigas")
        
        sessionmaker = get_sessionmaker()
        
        import asyncio
        
        async def _expire():
            async with sessionmaker() as db:
                try:
                    count = await expire_old_credentials(db)
                    await db.commit()
                    return count
                except Exception as e:
                    await db.rollback()
                    raise e
        
        expired_count = asyncio.run(_expire())
        
        logger.info(f"Expiradas {expired_count} credenciais")
        
        return {
            "expired_count": expired_count,
            "status": "success"
        }
        
    except Exception as exc:
        logger.error(f"Erro ao expirar credenciais: {exc}")
        raise
