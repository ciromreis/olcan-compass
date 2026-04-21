"""Seed 12 OIOS psychology questions so the quiz works on first deploy.

Revision ID: 0028_seed_psychology_questions
Revises: 0027_ensure_all_user_columns
Create Date: 2026-04-21

The psych_questions table is created by migration 0002_psych but was always
left empty — the seed script (scripts/seed_psychology_questions.py) required
manual execution.  This migration embeds the questions directly so
`alembic upgrade head` makes the quiz functional without extra steps.
"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


revision: str = "0028_seed_psychology_questions"
down_revision: Union[str, None] = "0027_ensure_all_user_columns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _likert(labels: list[str]) -> list[dict]:
    """Build 5-point Likert options."""
    return [{"value": str(i + 1), "label": labels[i], "score": float(i + 1)} for i in range(5)]


QUESTIONS = [
    # CONFIDENCE (2)
    {
        "text_pt": "Quando enfrento um desafio profissional novo, acredito na minha capacidade de superá-lo.",
        "text_en": "When I face a new professional challenge, I believe in my ability to overcome it.",
        "text_es": "Cuando enfrento un nuevo desafío profesional, creo en mi capacidad para superarlo.",
        "category": "confidence",
        "question_type": "scale",
        "display_order": 1,
        "reverse_scored": False,
        "options": _likert(["Raramente acredito", "Às vezes acredito", "Metade das vezes", "Geralmente acredito", "Sempre acredito"]),
    },
    {
        "text_pt": "Sinto que tenho as habilidades certas para atingir meus objetivos de carreira.",
        "text_en": "I feel I have the right skills to achieve my career goals.",
        "text_es": "Siento que tengo las habilidades adecuadas para alcanzar mis objetivos profesionales.",
        "category": "confidence",
        "question_type": "scale",
        "display_order": 2,
        "reverse_scored": False,
        "options": _likert(["Discordo totalmente", "Discordo parcialmente", "Neutro", "Concordo parcialmente", "Concordo totalmente"]),
    },
    # ANXIETY (2)
    {
        "text_pt": "A incerteza sobre o futuro da minha carreira me causa preocupação frequente.",
        "text_en": "Uncertainty about my career future causes me frequent worry.",
        "text_es": "La incertidumbre sobre el futuro de mi carrera me causa preocupación frecuente.",
        "category": "anxiety",
        "question_type": "scale",
        "display_order": 3,
        "reverse_scored": False,
        "options": _likert(["Nunca me preocupo", "Raramente me preocupo", "Às vezes me preocupo", "Frequentemente me preocupo", "Constantemente me preocupo"]),
    },
    {
        "text_pt": "Adio decisões importantes de carreira porque tenho medo de errar.",
        "text_en": "I postpone important career decisions because I am afraid of making mistakes.",
        "text_es": "Postergue decisiones importantes de carrera porque tengo miedo de cometer errores.",
        "category": "anxiety",
        "question_type": "scale",
        "display_order": 4,
        "reverse_scored": False,
        "options": _likert(["Nunca adio", "Raramente adio", "Às vezes adio", "Frequentemente adio", "Sempre adio"]),
    },
    # DISCIPLINE (2)
    {
        "text_pt": "Consigo manter uma rotina de estudo ou desenvolvimento mesmo sem pressão externa.",
        "text_en": "I can maintain a study or development routine even without external pressure.",
        "text_es": "Puedo mantener una rutina de estudio o desarrollo incluso sin presión externa.",
        "category": "discipline",
        "question_type": "scale",
        "display_order": 5,
        "reverse_scored": False,
        "options": _likert(["Nunca consigo", "Raramente consigo", "Às vezes consigo", "Frequentemente consigo", "Sempre consigo"]),
    },
    {
        "text_pt": "Quando traço um plano de carreira, sigo as etapas definidas de forma consistente.",
        "text_en": "When I outline a career plan, I consistently follow the defined steps.",
        "text_es": "Cuando establezco un plan de carrera, sigo los pasos definidos de manera consistente.",
        "category": "discipline",
        "question_type": "scale",
        "display_order": 6,
        "reverse_scored": False,
        "options": _likert(["Raramente sigo", "Às vezes sigo", "Metade das vezes", "Frequentemente sigo", "Sempre sigo"]),
    },
    # RISK TOLERANCE (2)
    {
        "text_pt": "Estaria disposto a abrir mão de segurança financeira por uma oportunidade de crescimento incerta.",
        "text_en": "I would be willing to give up financial security for an uncertain growth opportunity.",
        "text_es": "Estaría dispuesto a renunciar a la seguridad financiera por una oportunidad de crecimiento incierta.",
        "category": "risk_tolerance",
        "question_type": "scale",
        "display_order": 7,
        "reverse_scored": False,
        "options": _likert(["Jamais faria isso", "Muito dificilmente", "Talvez, dependendo do caso", "Provavelmente sim", "Sem dúvida faria"]),
    },
    {
        "text_pt": "Prefiro uma opção de carreira conhecida e segura a uma nova com alto potencial mas incerta.",
        "text_en": "I prefer a familiar, safe career option over a new one with high but uncertain potential.",
        "text_es": "Prefiero una opción profesional conocida y segura a una nueva con alto potencial pero incierta.",
        "category": "risk_tolerance",
        "question_type": "scale",
        "display_order": 8,
        "reverse_scored": True,
        "options": _likert(["Prefiro muito a segura", "Prefiro levemente a segura", "Indiferente", "Prefiro levemente a nova", "Prefiro muito a nova"]),
    },
    # NARRATIVE CLARITY (1)
    {
        "text_pt": "Consigo explicar claramente minha trajetória profissional e para onde quero ir.",
        "text_en": "I can clearly explain my professional trajectory and where I want to go.",
        "text_es": "Puedo explicar claramente mi trayectoria profesional y hacia dónde quiero ir.",
        "category": "narrative_clarity",
        "question_type": "scale",
        "display_order": 9,
        "reverse_scored": False,
        "options": _likert(["Não consigo explicar", "Consigo de forma vaga", "Consigo parcialmente", "Consigo bem", "Consigo com clareza total"]),
    },
    # INTERVIEW ANXIETY (1)
    {
        "text_pt": "A perspectiva de uma entrevista de seleção me deixa ansioso/a ao ponto de prejudicar meu desempenho.",
        "text_en": "The prospect of a job interview makes me anxious to the point of harming my performance.",
        "text_es": "La perspectiva de una entrevista de trabajo me pone ansioso/a hasta el punto de perjudicar mi desempeño.",
        "category": "interview_anxiety",
        "question_type": "scale",
        "display_order": 10,
        "reverse_scored": False,
        "options": _likert(["Nunca me afeta", "Raramente me afeta", "Às vezes me afeta", "Frequentemente me afeta", "Sempre me afeta muito"]),
    },
    # FINANCIAL RESILIENCE (1)
    {
        "text_pt": "Se perder minha renda atual amanhã, tenho reservas ou planos que me dariam segurança por 6+ meses.",
        "text_en": "If I lost my current income tomorrow, I have savings or plans that would give me security for 6+ months.",
        "text_es": "Si perdiera mis ingresos actuales mañana, tengo ahorros o planes que me darían seguridad por 6+ meses.",
        "category": "financial_resilience",
        "question_type": "scale",
        "display_order": 11,
        "reverse_scored": False,
        "options": _likert(["Não tenho nenhuma reserva", "Menos de 1 mês", "1-3 meses", "3-6 meses", "Mais de 6 meses"]),
    },
    # CULTURAL ADAPTABILITY (1)
    {
        "text_pt": "Me sinto confortável trabalhando em ambientes com culturas muito diferentes da minha.",
        "text_en": "I feel comfortable working in environments with very different cultures from my own.",
        "text_es": "Me siento cómodo/a trabajando en entornos con culturas muy diferentes a la mía.",
        "category": "cultural_adaptability",
        "question_type": "scale",
        "display_order": 12,
        "reverse_scored": False,
        "options": _likert(["Muito desconfortável", "Levemente desconfortável", "Neutro", "Levemente confortável", "Muito confortável"]),
    },
]


def upgrade() -> None:
    bind = op.get_bind()

    # Skip if questions already exist
    result = bind.execute(sa.text("SELECT count(*) FROM psych_questions"))
    if result.scalar() > 0:
        return

    import json
    for q in QUESTIONS:
        bind.execute(
            sa.text(
                """
                INSERT INTO psych_questions
                    (id, text_en, text_pt, text_es, question_type, category,
                     options, weight, reverse_scored, display_order, is_active, version, created_at)
                VALUES
                    (:id, :text_en, :text_pt, :text_es, :question_type, :category,
                     :options, 1.0, :reverse_scored, :display_order, true, 1, now())
                """
            ),
            {
                "id": str(uuid.uuid4()),
                "text_en": q["text_en"],
                "text_pt": q["text_pt"],
                "text_es": q["text_es"],
                "question_type": q["question_type"],
                "category": q["category"],
                "options": json.dumps(q["options"]),
                "reverse_scored": q.get("reverse_scored", False),
                "display_order": q["display_order"],
            },
        )


def downgrade() -> None:
    # Only delete questions that match our seeded display_orders
    op.execute(sa.text("DELETE FROM psych_questions WHERE display_order BETWEEN 1 AND 12"))
