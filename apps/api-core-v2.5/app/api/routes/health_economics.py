"""Economics Health Check Routes

Endpoints para verificar saúde dos serviços de economia.
"""

from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.db.session import get_db
from app.core.cache import get_redis_client
from app.core.celery_app import celery_app

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/economics")
async def economics_health_check(
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Verifica saúde de todos os componentes de economia.
    
    Retorna:
    - Status do banco de dados
    - Status do Redis
    - Status do Celery
    - Status de cada feature de economia
    """
    health_status = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "overall_status": "healthy",
        "components": {}
    }
    
    # 1. Verificar Database
    try:
        await db.execute(text("SELECT 1"))
        health_status["components"]["database"] = {
            "status": "healthy",
            "message": "Conexão com PostgreSQL OK"
        }
    except Exception as e:
        health_status["components"]["database"] = {
            "status": "unhealthy",
            "message": f"Erro na conexão: {str(e)}"
        }
        health_status["overall_status"] = "unhealthy"
    
    # 2. Verificar Redis
    try:
        redis_client = await get_redis_client()
        await redis_client.ping()
        health_status["components"]["redis"] = {
            "status": "healthy",
            "message": "Conexão com Redis OK"
        }
    except Exception as e:
        health_status["components"]["redis"] = {
            "status": "unhealthy",
            "message": f"Erro na conexão: {str(e)}"
        }
        health_status["overall_status"] = "degraded"
    
    # 3. Verificar Celery
    try:
        # Verificar workers ativos
        inspect = celery_app.control.inspect()
        active_workers = inspect.active()
        
        if active_workers:
            health_status["components"]["celery"] = {
                "status": "healthy",
                "message": f"{len(active_workers)} workers ativos",
                "workers": list(active_workers.keys())
            }
        else:
            health_status["components"]["celery"] = {
                "status": "degraded",
                "message": "Nenhum worker ativo"
            }
            health_status["overall_status"] = "degraded"
    except Exception as e:
        health_status["components"]["celery"] = {
            "status": "unhealthy",
            "message": f"Erro ao verificar Celery: {str(e)}"
        }
        health_status["overall_status"] = "degraded"
    
    # 4. Verificar Features de Economia
    features_status = {}
    
    # 4.1 Trust Signals (Credentials)
    try:
        from app.db.models.economics import VerificationCredential
        result = await db.execute(
            select(VerificationCredential).limit(1)
        )
        result.scalar_one_or_none()
        features_status["trust_signals"] = {
            "status": "healthy",
            "message": "Tabela de credenciais acessível"
        }
    except Exception as e:
        features_status["trust_signals"] = {
            "status": "unhealthy",
            "message": f"Erro: {str(e)}"
        }
        health_status["overall_status"] = "degraded"
    
    # 4.2 Temporal Matching
    try:
        from app.db.models.psychology import PsychProfile
        result = await db.execute(
            select(PsychProfile).limit(1)
        )
        result.scalar_one_or_none()
        features_status["temporal_matching"] = {
            "status": "healthy",
            "message": "Tabela de perfis psicológicos acessível"
        }
    except Exception as e:
        features_status["temporal_matching"] = {
            "status": "unhealthy",
            "message": f"Erro: {str(e)}"
        }
        health_status["overall_status"] = "degraded"
    
    # 4.3 Opportunity Cost
    try:
        from app.db.models.economics import OpportunityCostWidgetEvent
        result = await db.execute(
            select(OpportunityCostWidgetEvent).limit(1)
        )
        result.scalar_one_or_none()
        features_status["opportunity_cost"] = {
            "status": "healthy",
            "message": "Tabela de eventos do widget acessível"
        }
    except Exception as e:
        features_status["opportunity_cost"] = {
            "status": "unhealthy",
            "message": f"Erro: {str(e)}"
        }
        health_status["overall_status"] = "degraded"
    
    # 4.4 Performance Marketplace (Escrow)
    try:
        from app.db.models.economics import EscrowTransaction
        result = await db.execute(
            select(EscrowTransaction).limit(1)
        )
        result.scalar_one_or_none()
        features_status["performance_marketplace"] = {
            "status": "healthy",
            "message": "Tabela de escrow acessível"
        }
    except Exception as e:
        features_status["performance_marketplace"] = {
            "status": "unhealthy",
            "message": f"Erro: {str(e)}"
        }
        health_status["overall_status"] = "degraded"
    
    # 4.5 Scenario Optimization
    try:
        from app.db.models.economics import ScenarioSimulation
        result = await db.execute(
            select(ScenarioSimulation).limit(1)
        )
        result.scalar_one_or_none()
        features_status["scenario_optimization"] = {
            "status": "healthy",
            "message": "Tabela de simulações acessível"
        }
    except Exception as e:
        features_status["scenario_optimization"] = {
            "status": "unhealthy",
            "message": f"Erro: {str(e)}"
        }
        health_status["overall_status"] = "degraded"
    
    health_status["features"] = features_status
    
    return health_status
