"""
Configuração do Celery Beat para tarefas periódicas.

Este módulo define o schedule de tarefas recorrentes para:
- Cálculo diário de custos de oportunidade
- Expiração de credenciais antigas
- Verificação de timeouts de escrow
"""
from celery.schedules import crontab
from app.core.celery_app import celery_app

celery_app.conf.beat_schedule = {
    'calculate-opportunity-costs-daily': {
        'task': 'app.tasks.opportunity_cost.calculate_opportunity_costs_daily_task',
        'schedule': crontab(hour=0, minute=0),  # Diariamente à meia-noite UTC
        'options': {'queue': 'economics'},
    },
    'expire-old-credentials': {
        'task': 'app.tasks.credentials.expire_old_credentials_task',
        'schedule': crontab(hour=1, minute=0),  # Diariamente à 1h UTC
        'options': {'queue': 'economics'},
    },
    'check-escrow-timeouts': {
        'task': 'app.tasks.escrow.check_escrow_timeouts_task',
        'schedule': crontab(minute='*/30'),  # A cada 30 minutos
        'options': {'queue': 'economics'},
    },
}
