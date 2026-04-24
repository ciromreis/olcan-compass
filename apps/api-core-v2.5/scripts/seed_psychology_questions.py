"""Seed script: 12 OIOS psychology questions covering the 4 fear clusters.

Run from the api-core-v2.5 directory:
    python scripts/seed_psychology_questions.py

Requires DATABASE_URL in the environment (PostgreSQL).
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.db.models.psychology import PsychQuestion, PsychQuestionType, PsychCategory


# ---------------------------------------------------------------------------
# Question bank — 12 questions, scale type, 5 Likert options each
# ---------------------------------------------------------------------------

def _scale_options(labels: list[str]) -> list[dict]:
    """Build 5-point Likert options from a list of 5 label strings."""
    assert len(labels) == 5
    # Assuming labels are in Portuguese, use same for all languages for now
    # In a real implementation, these would be translated
    return [{"value": str(i + 1), "label_en": labels[i], "label_pt": labels[i], "label_es": labels[i], "score": float(i + 1)} for i in range(5)]


QUESTIONS = [
    # CONFIDENCE (2 questions)
    {
        "text_pt": "Quando enfrento um desafio profissional novo, acredito na minha capacidade de superá-lo.",
        "text_en": "When I face a new professional challenge, I believe in my ability to overcome it.",
        "text_es": "Cuando enfrento un nuevo desafío profesional, creo en mi capacidad para superarlo.",
        "category": PsychCategory.CONFIDENCE,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 1,
        "options": _scale_options([
            "Raramente acredito",
            "Às vezes acredito",
            "Metade das vezes",
            "Geralmente acredito",
            "Sempre acredito",
        ]),
    },
    {
        "text_pt": "Sinto que tenho as habilidades certas para atingir meus objetivos de carreira.",
        "text_en": "I feel I have the right skills to achieve my career goals.",
        "text_es": "Siento que tengo las habilidades adecuadas para alcanzar mis objetivos profesionales.",
        "category": PsychCategory.CONFIDENCE,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 2,
        "options": _scale_options([
            "Discordo totalmente",
            "Discordo parcialmente",
            "Neutro",
            "Concordo parcialmente",
            "Concordo totalmente",
        ]),
    },
    # ANXIETY (2 questions)
    {
        "text_pt": "A incerteza sobre o futuro da minha carreira me causa preocupação frequente.",
        "text_en": "Uncertainty about my career future causes me frequent worry.",
        "text_es": "La incertidumbre sobre el futuro de mi carrera me causa preocupación frecuente.",
        "category": PsychCategory.ANXIETY,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 3,
        "options": _scale_options([
            "Nunca me preocupo",
            "Raramente me preocupo",
            "Às vezes me preocupo",
            "Frequentemente me preocupo",
            "Constantemente me preocupo",
        ]),
    },
    {
        "text_pt": "Adio decisões importantes de carreira porque tenho medo de errar.",
        "text_en": "I postpone important career decisions because I am afraid of making mistakes.",
        "text_es": "Postergue decisiones importantes de carrera porque tengo miedo de cometer errores.",
        "category": PsychCategory.ANXIETY,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 4,
        "options": _scale_options([
            "Nunca adio",
            "Raramente adio",
            "Às vezes adio",
            "Frequentemente adio",
            "Sempre adio",
        ]),
        "reverse_scored": False,
    },
    # DISCIPLINE (2 questions)
    {
        "text_pt": "Consigo manter uma rotina de estudo ou desenvolvimento mesmo sem pressão externa.",
        "text_en": "I can maintain a study or development routine even without external pressure.",
        "text_es": "Puedo mantener una rutina de estudio o desarrollo incluso sin presión externa.",
        "category": PsychCategory.DISCIPLINE,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 5,
        "options": _scale_options([
            "Nunca consigo",
            "Raramente consigo",
            "Às vezes consigo",
            "Frequentemente consigo",
            "Sempre consigo",
        ]),
    },
    {
        "text_pt": "Quando traço um plano de carreira, sigo as etapas definidas de forma consistente.",
        "text_en": "When I outline a career plan, I consistently follow the defined steps.",
        "text_es": "Cuando establezco un plan de carrera, sigo los pasos definidos de manera consistente.",
        "category": PsychCategory.DISCIPLINE,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 6,
        "options": _scale_options([
            "Raramente sigo",
            "Às vezes sigo",
            "Metade das vezes",
            "Frequentemente sigo",
            "Sempre sigo",
        ]),
    },
    # RISK TOLERANCE (2 questions)
    {
        "text_pt": "Estaria disposto a abrir mão de segurança financeira por uma oportunidade de crescimento incerta.",
        "text_en": "I would be willing to give up financial security for an uncertain growth opportunity.",
        "text_es": "Estaría dispuesto a renunciar a la seguridad financiera por una oportunidad de crecimiento incierta.",
        "category": PsychCategory.RISK_TOLERANCE,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 7,
        "options": _scale_options([
            "Jamais faria isso",
            "Muito dificilmente",
            "Talvez, dependendo do caso",
            "Provavelmente sim",
            "Sem dúvida faria",
        ]),
    },
    {
        "text_pt": "Prefiro uma opção de carreira conhecida e segura a uma nova com alto potencial mas incerta.",
        "text_en": "I prefer a familiar, safe career option over a new one with high but uncertain potential.",
        "text_es": "Prefiero una opción profesional conocida y segura a una nueva con alto potencial pero incierta.",
        "category": PsychCategory.RISK_TOLERANCE,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 8,
        "reverse_scored": True,
        "options": _scale_options([
            "Prefiro muito a segura",
            "Prefiro levemente a segura",
            "Indiferente",
            "Prefiro levemente a nova",
            "Prefiro muito a nova",
        ]),
    },
    # NARRATIVE CLARITY (1 question)
    {
        "text_pt": "Consigo explicar claramente minha trajetória profissional e para onde quero ir.",
        "text_en": "I can clearly explain my professional trajectory and where I want to go.",
        "text_es": "Puedo explicar claramente mi trayectoria profesional y hacia dónde quiero ir.",
        "category": PsychCategory.NARRATIVE_CLARITY,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 9,
        "options": _scale_options([
            "Não consigo explicar",
            "Consigo de forma vaga",
            "Consigo parcialmente",
            "Consigo bem",
            "Consigo com clareza total",
        ]),
    },
    # INTERVIEW ANXIETY (1 question)
    {
        "text_pt": "A perspectiva de uma entrevista de seleção me deixa ansioso/a ao ponto de prejudicar meu desempenho.",
        "text_en": "The prospect of a job interview makes me anxious to the point of harming my performance.",
        "text_es": "La perspectiva de una entrevista de trabajo me pone ansioso/a hasta el punto de perjudicar mi desempeño.",
        "category": PsychCategory.INTERVIEW_ANXIETY,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 10,
        "options": _scale_options([
            "Nunca me afeta",
            "Raramente me afeta",
            "Às vezes me afeta",
            "Frequentemente me afeta",
            "Sempre me afeta muito",
        ]),
    },
    # FINANCIAL RESILIENCE (1 question)
    {
        "text_pt": "Se perder minha renda atual amanhã, tenho reservas ou planos que me dariam segurança por 6+ meses.",
        "text_en": "If I lost my current income tomorrow, I have savings or plans that would give me security for 6+ months.",
        "text_es": "Si perdiera mis ingresos actuales mañana, tengo ahorros o planes que me darían seguridad por 6+ meses.",
        "category": PsychCategory.FINANCIAL_RESILIENCE,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 11,
        "options": _scale_options([
            "Não tenho nenhuma reserva",
            "Menos de 1 mês",
            "1-3 meses",
            "3-6 meses",
            "Mais de 6 meses",
        ]),
    },
    # CULTURAL ADAPTABILITY (1 question)
    {
        "text_pt": "Me sinto confortável trabalhando em ambientes com culturas muito diferentes da minha.",
        "text_en": "I feel comfortable working in environments with very different cultures from my own.",
        "text_es": "Me siento cómodo/a trabajando en entornos con culturas muy diferentes a la mía.",
        "category": PsychCategory.CULTURAL_ADAPTABILITY,
        "question_type": PsychQuestionType.SCALE,
        "display_order": 12,
        "options": _scale_options([
            "Muito desconfortável",
            "Levemente desconfortável",
            "Neutro",
            "Levemente confortável",
            "Muito confortável",
        ]),
    },
]


async def seed(database_url: str) -> None:
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # Check existing
        result = await db.execute(select(PsychQuestion))
        existing = result.scalars().all()
        if existing:
            print(f"[INFO] {len(existing)} questions already exist. Skipping seed.")
            await engine.dispose()
            return

        for q_data in QUESTIONS:
            question = PsychQuestion(
                text_pt=q_data["text_pt"],
                text_en=q_data["text_en"],
                text_es=q_data["text_es"],
                category=q_data["category"],
                question_type=q_data["question_type"],
                display_order=q_data["display_order"],
                options=q_data["options"],
                weight=1.0,
                reverse_scored=q_data.get("reverse_scored", False),
                is_active=True,
            )
            db.add(question)

        await db.commit()
        print(f"[OK] Seeded {len(QUESTIONS)} psychology questions.")

    await engine.dispose()


if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", settings.database_url)
    if not db_url:
        print("[ERROR] DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)
    asyncio.run(seed(db_url))
