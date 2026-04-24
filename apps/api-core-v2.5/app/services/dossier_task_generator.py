"""
MECE Task Generator — EC-1

Pure function that generates a default task checklist grouped into the four
ReadinessDomain buckets (academic / financial / logistical / risk) when a
dossier is created from an opportunity.

Mirrors: apps/app-compass-v2.5/src/lib/dossier-task-generator.ts

Spec reference: SPEC_Dossier_System_v2_5.md §3
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

from app.db.models.dossier import DossierTask, DossierTaskStatus


# ─── Seed templates per domain ──────────────────────────────────────────────

_ACADEMIC_SEEDS_EDUCATION = [
    {
        "title": "Reunir históricos acadêmicos oficiais",
        "description": (
            "Solicitar históricos (transcripts) de cada instituição de ensino "
            "superior anterior. Garantir apostila/tradução juramentada se necessário."
        ),
        "readiness_domain": "academic",
        "type": "admin",
        "priority": "high",
    },
    {
        "title": "Preparar resultados de testes padronizados",
        "description": (
            "Verificar quais exames são exigidos (GRE, GMAT, IELTS, TOEFL, etc.) "
            "e agendar ou enviar scores."
        ),
        "readiness_domain": "academic",
        "type": "research",
        "priority": "high",
    },
    {
        "title": "Obter cartas de recomendação",
        "description": (
            "Identificar recomendadores, solicitar cartas com antecedência mínima "
            "de 4 semanas e acompanhar envio."
        ),
        "readiness_domain": "academic",
        "type": "contact",
        "priority": "high",
    },
    {
        "title": "Mapear learning outcomes do programa",
        "description": (
            "Estudar o currículo e objetivos do programa-alvo e conectar com sua "
            "experiência e motivação."
        ),
        "readiness_domain": "academic",
        "type": "research",
        "priority": "medium",
    },
]

_ACADEMIC_SEEDS_EMPLOYMENT = [
    {
        "title": "Preparar portfólio / amostras de trabalho",
        "description": (
            "Reunir projetos, código, publicações ou cases que demonstrem "
            "competência para a vaga."
        ),
        "readiness_domain": "academic",
        "type": "document",
        "priority": "high",
    },
    {
        "title": "Mapear competências vs. requisitos da vaga",
        "description": (
            "Analisar a descrição da vaga e identificar gaps de skills para "
            "endereçar no CV e cover letter."
        ),
        "readiness_domain": "academic",
        "type": "research",
        "priority": "high",
    },
    {
        "title": "Obter referências profissionais",
        "description": (
            "Confirmar 2–3 referências profissionais disponíveis para contato "
            "pelo recrutador."
        ),
        "readiness_domain": "academic",
        "type": "contact",
        "priority": "high",
    },
    {
        "title": "Pesquisar cultura e valores da empresa",
        "description": (
            "Entender missão, valores e stack tecnológico para alinhar narrativa "
            "da candidatura."
        ),
        "readiness_domain": "academic",
        "type": "research",
        "priority": "medium",
    },
]

_FINANCIAL_SEEDS = [
    {
        "title": "Estimar custos totais (tuição + moradia + vida)",
        "description": (
            "Calcular custo total para a duração do programa/posição, incluindo "
            "seguro saúde e imprevistos."
        ),
        "readiness_domain": "financial",
        "type": "research",
        "priority": "high",
    },
    {
        "title": "Pesquisar e aplicar para bolsas/funding",
        "description": (
            "Listar editais de bolsa, assistantships, fellowships ou "
            "financiamento externo compatíveis."
        ),
        "readiness_domain": "financial",
        "type": "research",
        "priority": "high",
    },
    {
        "title": "Reunir documentação de comprovação financeira",
        "description": (
            "Preparar extratos bancários, declaração de renda ou carta de "
            "patrocínio conforme exigido."
        ),
        "readiness_domain": "financial",
        "type": "admin",
        "priority": "medium",
    },
    {
        "title": "Planejar reserva de contingência (mín. 15%)",
        "description": (
            "Garantir buffer financeiro de pelo menos 15% acima do custo "
            "estimado para imprevistos."
        ),
        "readiness_domain": "financial",
        "type": "admin",
        "priority": "medium",
    },
]

_LOGISTICAL_SEEDS = [
    {
        "title": "Confirmar deadline e requisitos do portal",
        "description": (
            "Verificar data-limite oficial, formato de submissão e documentos "
            "exigidos no portal de inscrição."
        ),
        "readiness_domain": "logistical",
        "type": "admin",
        "priority": "critical",
    },
    {
        "title": "Planejar timeline de visto / autorização de trabalho",
        "description": (
            "Pesquisar tipo de visto necessário, prazos de processamento e "
            "documentos exigidos pelo consulado."
        ),
        "readiness_domain": "logistical",
        "type": "research",
        "priority": "high",
    },
    {
        "title": "Iniciar busca por moradia",
        "description": (
            "Definir janela de busca por acomodação no destino, considerando "
            "proximidade e custo."
        ),
        "readiness_domain": "logistical",
        "type": "research",
        "priority": "medium",
    },
    {
        "title": "Autenticar / apostilar documentos",
        "description": (
            "Verificar exigências de apostila de Haia ou consularização para "
            "o país de destino."
        ),
        "readiness_domain": "logistical",
        "type": "admin",
        "priority": "high",
    },
]

_RISK_SEEDS = [
    {
        "title": "Identificar 2 oportunidades backup (plano B)",
        "description": (
            "Selecionar pelo menos 2 programas/vagas alternativos caso a "
            "candidatura principal não avance."
        ),
        "readiness_domain": "risk",
        "type": "research",
        "priority": "high",
    },
    {
        "title": "Definir checkpoints internos (7d antes do deadline)",
        "description": (
            "Criar deadlines internas com 7 dias de antecedência para revisão "
            "final antes da submissão oficial."
        ),
        "readiness_domain": "risk",
        "type": "admin",
        "priority": "high",
    },
    {
        "title": "Planejar resposta a rejeição / waitlist",
        "description": (
            "Definir estratégia de pivot: qual alternativa ativar, como "
            "solicitar feedback, e próximos passos."
        ),
        "readiness_domain": "risk",
        "type": "research",
        "priority": "medium",
    },
    {
        "title": "Reservar folga no cronograma para imprevistos",
        "description": (
            "Adicionar buffer de pelo menos 1 semana no cronograma para lidar "
            "com atrasos documentais inesperados."
        ),
        "readiness_domain": "risk",
        "type": "admin",
        "priority": "medium",
    },
]


# Domain-based scheduling: risk & logistical tasks due earlier
_FRACTION_BY_DOMAIN = {
    "risk": 0.3,
    "logistical": 0.5,
    "financial": 0.6,
    "academic": 0.7,
}


def _compute_due_date(
    deadline: datetime,
    domain: str,
    now: datetime,
) -> Optional[datetime]:
    total = (deadline - now).total_seconds()
    if total <= 0:
        return deadline
    fraction = _FRACTION_BY_DOMAIN.get(domain, 0.5)
    return now + timedelta(seconds=total * fraction)


def generate_default_tasks(
    dossier_id: uuid.UUID,
    opportunity_context: dict[str, Any],
    deadline: Optional[datetime] = None,
) -> list[DossierTask]:
    """
    Generate MECE default tasks for a dossier based on opportunity type.

    Pure function — no DB writes, returns ORM objects ready to be added.
    """
    opp_type = opportunity_context.get("type", "education")
    is_employment = opp_type in ("employment", "entrepreneurship")

    academic_seeds = (
        _ACADEMIC_SEEDS_EMPLOYMENT if is_employment else _ACADEMIC_SEEDS_EDUCATION
    )

    all_seeds = [
        *academic_seeds,
        *_FINANCIAL_SEEDS,
        *_LOGISTICAL_SEEDS,
        *_RISK_SEEDS,
    ]

    now = datetime.now(timezone.utc)

    tasks: list[DossierTask] = []
    for seed in all_seeds:
        due_date = (
            _compute_due_date(deadline, seed["readiness_domain"], now)
            if deadline
            else None
        )

        task = DossierTask(
            id=uuid.uuid4(),
            dossier_id=dossier_id,
            title=seed["title"],
            description=seed["description"],
            type=seed["type"],
            readiness_domain=seed["readiness_domain"],
            status=DossierTaskStatus.TODO,
            priority=seed["priority"],
            due_date=due_date,
        )
        tasks.append(task)

    return tasks
