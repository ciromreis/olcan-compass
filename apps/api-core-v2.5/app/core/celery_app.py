"""
Configuração do Celery para processamento de tarefas em background.

Este módulo configura o Celery para executar tarefas assíncronas relacionadas
às funcionalidades de inteligência econômica (credenciais, matching temporal,
custo de oportunidade, escrow, e otimização de cenários).
"""
from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "compass_economics",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.credentials",
        "app.tasks.temporal_matching",
        "app.tasks.opportunity_cost",
        "app.tasks.escrow",
        "app.tasks.scenario_optimization",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutos máximo
    task_soft_time_limit=240,  # 4 minutos soft limit
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True,
)
