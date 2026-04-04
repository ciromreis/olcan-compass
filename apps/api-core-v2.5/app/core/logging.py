"""
Structured Logging Configuration

Configura logging estruturado usando structlog para melhor observabilidade.
"""

import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict


def add_app_context(logger: Any, method_name: str, event_dict: EventDict) -> EventDict:
    """
    Adiciona contexto da aplicação aos logs.
    
    Args:
        logger: Logger instance
        method_name: Nome do método de log
        event_dict: Dicionário do evento
        
    Returns:
        Event dict com contexto adicional
    """
    event_dict["app"] = "olcan-compass-api"
    event_dict["environment"] = "development"  # TODO: Pegar do config
    return event_dict


def configure_logging(log_level: str = "INFO") -> None:
    """
    Configura logging estruturado para a aplicação.
    
    Args:
        log_level: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Configurar logging padrão do Python
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper())
    )
    
    # Configurar structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            add_app_context,
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Obtém um logger estruturado.
    
    Args:
        name: Nome do logger (geralmente __name__)
        
    Returns:
        Logger estruturado
    """
    return structlog.get_logger(name)


# Funções auxiliares para logging de eventos específicos
def log_credential_generated(
    logger: structlog.stdlib.BoundLogger,
    user_id: str,
    credential_type: str,
    score_value: int
) -> None:
    """
    Loga geração de credencial.
    
    Args:
        logger: Logger estruturado
        user_id: UUID do usuário
        credential_type: Tipo da credencial
        score_value: Valor do score
    """
    logger.info(
        "credential_generated",
        feature="trust_signals",
        user_id=user_id,
        credential_type=credential_type,
        score_value=score_value
    )


def log_escrow_resolved(
    logger: structlog.stdlib.BoundLogger,
    escrow_id: str,
    booking_id: str,
    status: str,
    improvement_achieved: int
) -> None:
    """
    Loga resolução de escrow.
    
    Args:
        logger: Logger estruturado
        escrow_id: UUID do escrow
        booking_id: UUID da reserva
        status: Status final (released/refunded)
        improvement_achieved: Melhoria de prontidão alcançada
    """
    logger.info(
        "escrow_resolved",
        feature="performance_marketplace",
        escrow_id=escrow_id,
        booking_id=booking_id,
        status=status,
        improvement_achieved=improvement_achieved
    )


def log_frontier_calculated(
    logger: structlog.stdlib.BoundLogger,
    user_id: str,
    total_opportunities: int,
    pareto_optimal_count: int,
    calculation_time_ms: float
) -> None:
    """
    Loga cálculo de fronteira viável.
    
    Args:
        logger: Logger estruturado
        user_id: UUID do usuário
        total_opportunities: Total de oportunidades analisadas
        pareto_optimal_count: Número de oportunidades Pareto-ótimas
        calculation_time_ms: Tempo de cálculo em milissegundos
    """
    logger.info(
        "frontier_calculated",
        feature="scenario_optimization",
        user_id=user_id,
        total_opportunities=total_opportunities,
        pareto_optimal_count=pareto_optimal_count,
        calculation_time_ms=calculation_time_ms
    )


def log_temporal_match(
    logger: structlog.stdlib.BoundLogger,
    user_id: str,
    temporal_preference: int,
    matched_routes_count: int
) -> None:
    """
    Loga matching temporal.
    
    Args:
        logger: Logger estruturado
        user_id: UUID do usuário
        temporal_preference: Preferência temporal do usuário
        matched_routes_count: Número de rotas matched
    """
    logger.info(
        "temporal_match_calculated",
        feature="temporal_matching",
        user_id=user_id,
        temporal_preference=temporal_preference,
        matched_routes_count=matched_routes_count
    )


def log_widget_conversion(
    logger: structlog.stdlib.BoundLogger,
    user_id: str,
    upgrade_tier: str,
    conversion_value: float,
    momentum_score: int
) -> None:
    """
    Loga conversão do widget de custo de oportunidade.
    
    Args:
        logger: Logger estruturado
        user_id: UUID do usuário
        upgrade_tier: Tier do upgrade (pro/premium)
        conversion_value: Valor da conversão
        momentum_score: Score de momentum no momento da conversão
    """
    logger.info(
        "widget_conversion",
        feature="opportunity_cost",
        user_id=user_id,
        upgrade_tier=upgrade_tier,
        conversion_value=conversion_value,
        momentum_score=momentum_score
    )


def log_error(
    logger: structlog.stdlib.BoundLogger,
    error_type: str,
    error_message: str,
    feature: str,
    **kwargs: Any
) -> None:
    """
    Loga erro com contexto completo.
    
    Args:
        logger: Logger estruturado
        error_type: Tipo do erro
        error_message: Mensagem de erro
        feature: Feature onde ocorreu o erro
        **kwargs: Contexto adicional
    """
    logger.error(
        "error_occurred",
        error_type=error_type,
        error_message=error_message,
        feature=feature,
        **kwargs
    )
