"""
Seed initial psych assessment questions.

Called once at app startup if the psych_questions table is empty.
Questions cover all PsychCategory dimensions used by the scoring engine.
"""

import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.psychology import PsychQuestion, PsychQuestionType, PsychCategory


SCALE_OPTIONS = [
    {"value": "1", "label_pt": "Discordo totalmente", "label_en": "Strongly disagree", "label_es": "Totalmente en desacuerdo", "score": 1},
    {"value": "2", "label_pt": "Discordo", "label_en": "Disagree", "label_es": "En desacuerdo", "score": 2},
    {"value": "3", "label_pt": "Neutro", "label_en": "Neutral", "label_es": "Neutral", "score": 3},
    {"value": "4", "label_pt": "Concordo", "label_en": "Agree", "label_es": "De acuerdo", "score": 4},
    {"value": "5", "label_pt": "Concordo totalmente", "label_en": "Strongly agree", "label_es": "Totalmente de acuerdo", "score": 5},
]

SEED_QUESTIONS = [
    # --- Confidence (3 questions) ---
    {
        "text_pt": "Sinto-me preparado(a) para enfrentar os desafios de viver em outro país.",
        "text_en": "I feel prepared to face the challenges of living in another country.",
        "text_es": "Me siento preparado/a para enfrentar los desafíos de vivir en otro país.",
        "category": PsychCategory.CONFIDENCE,
        "display_order": 1,
    },
    {
        "text_pt": "Acredito que minhas habilidades serão reconhecidas no exterior.",
        "text_en": "I believe my skills will be recognized abroad.",
        "text_es": "Creo que mis habilidades serán reconocidas en el exterior.",
        "category": PsychCategory.CONFIDENCE,
        "display_order": 2,
    },
    {
        "text_pt": "Consigo me expressar com clareza mesmo em situações de pressão.",
        "text_en": "I can express myself clearly even under pressure.",
        "text_es": "Puedo expresarme con claridad incluso en situaciones de presión.",
        "category": PsychCategory.CONFIDENCE,
        "display_order": 3,
    },
    # --- Anxiety (2 questions) ---
    {
        "text_pt": "Quando penso na mudança, sinto mais ansiedade do que empolgação.",
        "text_en": "When I think about the move, I feel more anxiety than excitement.",
        "text_es": "Cuando pienso en la mudanza, siento más ansiedad que emoción.",
        "category": PsychCategory.ANXIETY,
        "reverse_scored": True,
        "display_order": 4,
    },
    {
        "text_pt": "Tenho dificuldade em dormir quando penso nos próximos passos da minha jornada.",
        "text_en": "I have difficulty sleeping when I think about the next steps of my journey.",
        "text_es": "Tengo dificultad para dormir cuando pienso en los próximos pasos de mi viaje.",
        "category": PsychCategory.ANXIETY,
        "reverse_scored": True,
        "display_order": 5,
    },
    # --- Discipline (2 questions) ---
    {
        "text_pt": "Costumo estabelecer metas e cumpri-las dentro do prazo.",
        "text_en": "I usually set goals and meet them on time.",
        "text_es": "Suelo establecer metas y cumplirlas dentro del plazo.",
        "category": PsychCategory.DISCIPLINE,
        "display_order": 6,
    },
    {
        "text_pt": "Consigo manter uma rotina de estudos ou trabalho mesmo sem supervisão.",
        "text_en": "I can maintain a study or work routine even without supervision.",
        "text_es": "Puedo mantener una rutina de estudio o trabajo incluso sin supervisión.",
        "category": PsychCategory.DISCIPLINE,
        "display_order": 7,
    },
    # --- Risk Tolerance (2 questions) ---
    {
        "text_pt": "Prefiro tomar decisões rapidamente, mesmo com informações incompletas.",
        "text_en": "I prefer to make decisions quickly, even with incomplete information.",
        "text_es": "Prefiero tomar decisiones rápidamente, incluso con información incompleta.",
        "category": PsychCategory.RISK_TOLERANCE,
        "display_order": 8,
    },
    {
        "text_pt": "Estou confortável em investir recursos financeiros em uma oportunidade incerta.",
        "text_en": "I am comfortable investing financial resources in an uncertain opportunity.",
        "text_es": "Me siento cómodo/a invirtiendo recursos financieros en una oportunidad incierta.",
        "category": PsychCategory.RISK_TOLERANCE,
        "display_order": 9,
    },
    # --- Narrative Clarity (2 questions) ---
    {
        "text_pt": "Sei explicar com clareza por que quero sair do Brasil.",
        "text_en": "I can clearly explain why I want to leave Brazil.",
        "text_es": "Sé explicar con claridad por qué quiero salir de Brasil.",
        "category": PsychCategory.NARRATIVE_CLARITY,
        "display_order": 10,
    },
    {
        "text_pt": "Consigo conectar minhas experiências passadas com meus objetivos futuros de forma coerente.",
        "text_en": "I can coherently connect my past experiences with my future goals.",
        "text_es": "Puedo conectar mis experiencias pasadas con mis objetivos futuros de forma coherente.",
        "category": PsychCategory.NARRATIVE_CLARITY,
        "display_order": 11,
    },
    # --- Interview Anxiety (2 questions) ---
    {
        "text_pt": "Fico nervoso(a) ao pensar em entrevistas em inglês ou outro idioma.",
        "text_en": "I get nervous thinking about interviews in English or another language.",
        "text_es": "Me pongo nervioso/a al pensar en entrevistas en inglés u otro idioma.",
        "category": PsychCategory.INTERVIEW_ANXIETY,
        "reverse_scored": True,
        "display_order": 12,
    },
    {
        "text_pt": "Sinto que preciso de mais prática antes de me sentir confiante em entrevistas.",
        "text_en": "I feel I need more practice before feeling confident in interviews.",
        "text_es": "Siento que necesito más práctica antes de sentirme seguro/a en entrevistas.",
        "category": PsychCategory.INTERVIEW_ANXIETY,
        "reverse_scored": True,
        "display_order": 13,
    },
    # --- Cultural Adaptability (2 questions) ---
    {
        "text_pt": "Gosto de experimentar comidas, costumes e formas de pensar diferentes dos meus.",
        "text_en": "I enjoy trying foods, customs, and ways of thinking different from my own.",
        "text_es": "Disfruto probando comidas, costumbres y formas de pensar diferentes a las mías.",
        "category": PsychCategory.CULTURAL_ADAPTABILITY,
        "display_order": 14,
    },
    {
        "text_pt": "Consigo me adaptar rapidamente a ambientes novos e desconhecidos.",
        "text_en": "I can quickly adapt to new and unfamiliar environments.",
        "text_es": "Puedo adaptarme rápidamente a entornos nuevos y desconocidos.",
        "category": PsychCategory.CULTURAL_ADAPTABILITY,
        "display_order": 15,
    },
    # --- Financial Resilience (2 questions) ---
    {
        "text_pt": "Tenho reserva financeira suficiente para me manter por pelo menos 6 meses sem renda.",
        "text_en": "I have enough financial reserves to sustain myself for at least 6 months without income.",
        "text_es": "Tengo reservas financieras suficientes para mantenerme al menos 6 meses sin ingresos.",
        "category": PsychCategory.FINANCIAL_RESILIENCE,
        "display_order": 16,
    },
    {
        "text_pt": "Sei planejar e controlar meus gastos mensais de forma consistente.",
        "text_en": "I know how to plan and control my monthly expenses consistently.",
        "text_es": "Sé planificar y controlar mis gastos mensuales de forma consistente.",
        "category": PsychCategory.FINANCIAL_RESILIENCE,
        "display_order": 17,
    },
    # --- Decision Style (1 question) ---
    {
        "text_pt": "Costumo analisar todas as opções antes de tomar uma decisão importante.",
        "text_en": "I usually analyze all options before making an important decision.",
        "text_es": "Suelo analizar todas las opciones antes de tomar una decisión importante.",
        "category": PsychCategory.DECISION_STYLE,
        "display_order": 18,
    },
]


async def seed_psych_questions(db: AsyncSession) -> None:
    """Insert seed questions if the table is empty."""
    result = await db.execute(
        select(func.count(PsychQuestion.id))
    )
    count = result.scalar() or 0

    if count > 0:
        return  # Already seeded

    print(f"[seed] Inserting {len(SEED_QUESTIONS)} psych questions...")

    for q in SEED_QUESTIONS:
        question = PsychQuestion(
            id=uuid.uuid4(),
            text_pt=q["text_pt"],
            text_en=q["text_en"],
            text_es=q["text_es"],
            question_type=PsychQuestionType.SCALE,
            category=q["category"],
            options=SCALE_OPTIONS,
            weight=1.0,
            reverse_scored=q.get("reverse_scored", False),
            display_order=q["display_order"],
            is_active=True,
            version=1,
        )
        db.add(question)

    await db.commit()
    print(f"[seed] ✓ {len(SEED_QUESTIONS)} psych questions inserted")
