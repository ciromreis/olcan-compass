"""Seed script: Banco de perguntas para o Simulador de Entrevistas Olcan.

Cria 30 perguntas cobrindo os 5 tipos de entrevista:
- Admissão acadêmica
- Visto consular
- Emprego / recolocação internacional
- Bolsa de estudos
- Painel / comitê

Run from the api-core-v2.5 directory:
    python scripts/seed_interview_questions.py

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
from app.db.models.interview import InterviewQuestion, InterviewQuestionType


# ---------------------------------------------------------------------------
# Banco de perguntas — 30 perguntas, multilíngue, por tipo de entrevista
# ---------------------------------------------------------------------------

QUESTIONS = [

    # ── MOTIVAÇÃO (motivation) ──────────────────────────────────────────────

    {
        "question_text_pt": "Por que você escolheu este programa específico e não outros com perfil semelhante?",
        "question_text_en": "Why did you choose this specific program over others with a similar profile?",
        "question_text_es": "¿Por qué eligió este programa específico y no otros con perfil similar?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["graduate_school", "scholarship"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["fit", "research alignment", "faculty", "specific reasons"],
            "red_flags": ["generic answer", "couldn't name the program", "confused with another university"],
        },
        "common_mistakes": [
            "Responder de forma genérica sem citar nada específico do programa",
            "Confundir o nome da instituição ou do programa",
        ],
        "display_order": 10,
    },
    {
        "question_text_pt": "O que o motivou a buscar uma oportunidade internacional neste momento da sua carreira?",
        "question_text_en": "What motivated you to seek an international opportunity at this point in your career?",
        "question_text_es": "¿Qué lo motivó a buscar una oportunidad internacional en este momento de su carrera?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["job_relocation", "scholarship", "graduate_school"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["timing", "career stage", "clear reasoning", "personal growth"],
            "red_flags": ["vague answer", "mentions money only", "no clear plan"],
        },
        "common_mistakes": [
            "Não justificar por que agora",
            "Mencionar apenas razões financeiras",
        ],
        "display_order": 11,
    },
    {
        "question_text_pt": "Como esta bolsa ou programa se encaixa no seu plano de longo prazo?",
        "question_text_en": "How does this scholarship or program fit into your long-term plan?",
        "question_text_es": "¿Cómo encaja esta beca o programa en su plan a largo plazo?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["scholarship"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["long-term vision", "contribution", "connection between now and future"],
            "red_flags": ["no long-term vision", "answer ends at graduation"],
        },
        "common_mistakes": [
            "Parar o plano na conclusão do programa",
            "Não mencionar impacto após o retorno",
        ],
        "display_order": 12,
    },

    # ── HISTÓRICO PROFISSIONAL (background) ─────────────────────────────────

    {
        "question_text_pt": "Fale sobre você e sua trajetória profissional até hoje.",
        "question_text_en": "Tell me about yourself and your professional journey so far.",
        "question_text_es": "Hábleme de usted y de su trayectoria profesional hasta ahora.",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["job_relocation", "graduate_school", "scholarship"],
        "difficulty": "easy",
        "what_assessors_look_for": {
            "keywords": ["structure", "relevance", "clarity", "progression"],
            "red_flags": ["too long", "chronological recitation without narrative", "irrelevant details"],
        },
        "common_mistakes": [
            "Ler o CV em voz alta sem síntese",
            "Incluir informações da infância sem relevância",
        ],
        "display_order": 20,
    },
    {
        "question_text_pt": "Qual foi o projeto mais significativo que você liderou ou no qual teve papel central?",
        "question_text_en": "What was the most significant project you led or played a central role in?",
        "question_text_es": "¿Cuál fue el proyecto más significativo que lideró o en el que tuvo un papel central?",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["job_relocation", "graduate_school"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["STAR structure", "impact", "leadership", "measurable results"],
            "red_flags": ["no quantification", "group work without personal contribution", "vague impact"],
        },
        "common_mistakes": [
            "Não quantificar o impacto",
            "Descrever o projeto do grupo sem destacar a contribuição pessoal",
        ],
        "display_order": 21,
    },
    {
        "question_text_pt": "Como sua formação acadêmica preparou você para este próximo passo?",
        "question_text_en": "How has your academic background prepared you for this next step?",
        "question_text_es": "¿Cómo lo ha preparado su formación académica para este próximo paso?",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["graduate_school", "scholarship"],
        "difficulty": "easy",
        "what_assessors_look_for": {
            "keywords": ["relevant coursework", "skills", "bridge to opportunity"],
            "red_flags": ["generic praise of own university", "no connection to the opportunity"],
        },
        "common_mistakes": [
            "Listar disciplinas sem conectar ao programa-alvo",
            "Elogiar a própria faculdade sem evidências",
        ],
        "display_order": 22,
    },

    # ── DESAFIOS (challenge) ─────────────────────────────────────────────────

    {
        "question_text_pt": "Descreva um momento em que você enfrentou um fracasso ou revés significativo. O que aprendeu?",
        "question_text_en": "Describe a time you faced a significant failure or setback. What did you learn?",
        "question_text_es": "Describa una vez que enfrentó un fracaso o revés significativo. ¿Qué aprendió?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["job_relocation", "graduate_school", "scholarship"],
        "difficulty": "hard",
        "what_assessors_look_for": {
            "keywords": ["ownership", "growth mindset", "specific lesson", "application of learning"],
            "red_flags": ["no real failure mentioned", "blame others", "learning is superficial"],
        },
        "common_mistakes": [
            "Escolher um 'fracasso' que na verdade é um sucesso disfarçado",
            "Culpar outras pessoas",
            "Não mencionar a aplicação concreta do aprendizado",
        ],
        "display_order": 30,
    },
    {
        "question_text_pt": "Como você lidou com uma situação de trabalho em que discordou fortemente da decisão de um superior?",
        "question_text_en": "How did you handle a work situation where you strongly disagreed with a superior's decision?",
        "question_text_es": "¿Cómo manejó una situación laboral en la que discrepó fuertemente de la decisión de un superior?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["job_relocation"],
        "difficulty": "hard",
        "what_assessors_look_for": {
            "keywords": ["professionalism", "communication", "outcome", "respect for authority"],
            "red_flags": ["says they always agree", "expresses resentment", "no resolution"],
        },
        "common_mistakes": [
            "Dizer que nunca discordou",
            "Demonstrar ressentimento na resposta",
        ],
        "display_order": 31,
    },
    {
        "question_text_pt": "Qual é o maior obstáculo que você antecipa nesta jornada e como pretende superá-lo?",
        "question_text_en": "What is the biggest obstacle you anticipate in this journey and how do you plan to overcome it?",
        "question_text_es": "¿Cuál es el mayor obstáculo que anticipa en este camino y cómo planea superarlo?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["graduate_school", "scholarship", "job_relocation"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["self-awareness", "concrete plan", "realistic assessment"],
            "red_flags": ["says there are no obstacles", "obstacle is trivial", "no plan"],
        },
        "common_mistakes": [
            "Dizer que não vê obstáculos",
            "Apresentar obstáculo trivial",
        ],
        "display_order": 32,
    },

    # ── OBJETIVOS (goals) ────────────────────────────────────────────────────

    {
        "question_text_pt": "Onde você se vê em cinco anos após concluir este programa?",
        "question_text_en": "Where do you see yourself five years after completing this program?",
        "question_text_es": "¿Dónde se ve cinco años después de completar este programa?",
        "question_type": InterviewQuestionType.GOALS,
        "route_types": ["graduate_school", "scholarship"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["specificity", "ambition", "connection to program", "impact"],
            "red_flags": ["says only 'find a good job'", "no connection to program", "unrealistic claims"],
        },
        "common_mistakes": [
            "Responder de forma vaga ('uma boa posição')",
            "Não conectar a visão ao programa",
        ],
        "display_order": 40,
    },
    {
        "question_text_pt": "Como você pretende contribuir com o seu país ou comunidade de origem após esta experiência?",
        "question_text_en": "How do you intend to contribute to your home country or community after this experience?",
        "question_text_es": "¿Cómo pretende contribuir a su país o comunidad de origen después de esta experiencia?",
        "question_type": InterviewQuestionType.GOALS,
        "route_types": ["scholarship"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["return", "social impact", "specific contribution", "community"],
            "red_flags": ["says they plan to stay abroad", "vague answer", "no specific contribution"],
        },
        "common_mistakes": [
            "Mencionar que pretende ficar no exterior",
            "Resposta genérica sobre 'fazer o país crescer'",
        ],
        "display_order": 41,
    },
    {
        "question_text_pt": "Quais são seus objetivos profissionais de curto prazo nesta nova posição?",
        "question_text_en": "What are your short-term professional goals in this new position?",
        "question_text_es": "¿Cuáles son sus objetivos profesionales a corto plazo en este nuevo puesto?",
        "question_type": InterviewQuestionType.GOALS,
        "route_types": ["job_relocation"],
        "difficulty": "easy",
        "what_assessors_look_for": {
            "keywords": ["listening", "onboarding", "contribution", "learning before leading"],
            "red_flags": ["promises to change everything immediately", "no mention of learning first"],
        },
        "common_mistakes": [
            "Prometer mudanças radicais imediatas",
            "Não mencionar o período de aprendizado inicial",
        ],
        "display_order": 42,
    },

    # ── ADAPTAÇÃO CULTURAL (cultural_fit) ────────────────────────────────────

    {
        "question_text_pt": "Como você se adapta a ambientes multiculturais ou de alta diversidade?",
        "question_text_en": "How do you adapt to multicultural or highly diverse environments?",
        "question_text_es": "¿Cómo se adapta a entornos multiculturales o de alta diversidad?",
        "question_type": InterviewQuestionType.CULTURAL_FIT,
        "route_types": ["job_relocation", "graduate_school"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["curiosity", "specific example", "empathy", "flexibility"],
            "red_flags": ["no concrete example", "superficial answer", "mentions only food or language"],
        },
        "common_mistakes": [
            "Não dar um exemplo concreto",
            "Reduzir a adaptação cultural a idioma ou culinária",
        ],
        "display_order": 50,
    },
    {
        "question_text_pt": "Descreva uma situação em que suas suposições sobre uma cultura diferente estavam erradas.",
        "question_text_en": "Describe a situation where your assumptions about a different culture turned out to be wrong.",
        "question_text_es": "Describa una situación en que sus suposiciones sobre una cultura diferente resultaron incorrectas.",
        "question_type": InterviewQuestionType.CULTURAL_FIT,
        "route_types": ["job_relocation", "graduate_school"],
        "difficulty": "hard",
        "what_assessors_look_for": {
            "keywords": ["humility", "growth", "specific story", "reflection"],
            "red_flags": ["no real story", "defensiveness", "no reflection on learning"],
        },
        "common_mistakes": [
            "Inventar uma história vaga",
            "Não demonstrar reflexão genuína",
        ],
        "display_order": 51,
    },

    # ── CENÁRIOS / SITUACIONAIS (scenario) ───────────────────────────────────

    {
        "question_text_pt": "Imagine que você tem 3 semanas antes da viagem e percebe que um documento essencial está atrasado. O que faz?",
        "question_text_en": "Imagine you have 3 weeks before your travel and realize an essential document is delayed. What do you do?",
        "question_text_es": "Imagine que tiene 3 semanas antes del viaje y se da cuenta de que un documento esencial está retrasado. ¿Qué hace?",
        "question_type": InterviewQuestionType.SCENARIO,
        "route_types": ["visa_consular"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["calm", "problem-solving", "plan B", "proactivity"],
            "red_flags": ["panic", "no concrete steps", "relies entirely on others"],
        },
        "common_mistakes": [
            "Demonstrar pânico sem plano",
            "Depender inteiramente de terceiros",
        ],
        "display_order": 60,
    },
    {
        "question_text_pt": "Se você descobrisse que um colega de trabalho internacional está tendo dificuldades de adaptação, como agiria?",
        "question_text_en": "If you discovered that an international colleague was struggling to adapt, what would you do?",
        "question_text_es": "Si descubriera que un colega internacional está teniendo dificultades para adaptarse, ¿qué haría?",
        "question_type": InterviewQuestionType.SCENARIO,
        "route_types": ["job_relocation"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["empathy", "initiative", "concrete action", "boundaries"],
            "red_flags": ["says it's not their problem", "promises too much", "ignores cultural context"],
        },
        "common_mistakes": [
            "Dizer que não é problema seu",
            "Prometer resolver tudo sem respeitar limites profissionais",
        ],
        "display_order": 61,
    },

    # ── VISA / CONSULAR ─────────────────────────────────────────────────────

    {
        "question_text_pt": "Qual é o objetivo principal da sua viagem?",
        "question_text_en": "What is the main purpose of your trip?",
        "question_text_es": "¿Cuál es el propósito principal de su viaje?",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["visa_consular"],
        "difficulty": "easy",
        "what_assessors_look_for": {
            "keywords": ["clarity", "concise", "matches documentation", "consistent"],
            "red_flags": ["contradicts documentation", "vague", "mentions working illegally"],
        },
        "common_mistakes": [
            "Contradizer os documentos apresentados",
            "Dar uma resposta longa quando uma frase basta",
        ],
        "display_order": 70,
    },
    {
        "question_text_pt": "Como você pretende financiar sua estadia e os custos relacionados à viagem?",
        "question_text_en": "How do you plan to finance your stay and travel-related costs?",
        "question_text_es": "¿Cómo planea financiar su estadía y los costos relacionados con el viaje?",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["visa_consular"],
        "difficulty": "easy",
        "what_assessors_look_for": {
            "keywords": ["specific source", "bank statements", "sponsor", "scholarship"],
            "red_flags": ["vague", "no documentation to support", "amounts don't match"],
        },
        "common_mistakes": [
            "Responder de forma vaga sem mencionar a fonte dos recursos",
            "Valores incompatíveis com os documentos",
        ],
        "display_order": 71,
    },
    {
        "question_text_pt": "Quais vínculos você tem com seu país de origem que garantem seu retorno?",
        "question_text_en": "What ties do you have to your home country that ensure your return?",
        "question_text_es": "¿Qué lazos tiene con su país de origen que garantizan su regreso?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["visa_consular"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["job", "family", "property", "concrete ties"],
            "red_flags": ["no ties mentioned", "says they want to stay", "contradicts stated plans"],
        },
        "common_mistakes": [
            "Não mencionar nenhum vínculo concreto",
            "Demonstrar intenção de permanecer",
        ],
        "display_order": 72,
    },

    # ── PERGUNTAS PARA O PAINEL (question_for_panel) ─────────────────────────

    {
        "question_text_pt": "Você tem alguma pergunta para o painel ou para a comissão?",
        "question_text_en": "Do you have any questions for the panel or committee?",
        "question_text_es": "¿Tiene alguna pregunta para el panel o el comité?",
        "question_type": InterviewQuestionType.QUESTION_FOR_PANEL,
        "route_types": ["graduate_school", "scholarship"],
        "difficulty": "easy",
        "what_assessors_look_for": {
            "keywords": ["thoughtful question", "research on program", "genuine curiosity"],
            "red_flags": ["says no", "asks about salary or benefits too early", "question shows no research"],
        },
        "common_mistakes": [
            "Dizer 'não, obrigado'",
            "Perguntar sobre salário ou benefícios antes do momento adequado",
        ],
        "display_order": 80,
    },

    # ── PAINEL / COMITÊ ──────────────────────────────────────────────────────

    {
        "question_text_pt": "Como seus colegas descreveriam sua forma de trabalhar e colaborar em equipe?",
        "question_text_en": "How would your colleagues describe your working and team collaboration style?",
        "question_text_es": "¿Cómo describirían sus colegas su forma de trabajar y colaborar en equipo?",
        "question_type": InterviewQuestionType.CULTURAL_FIT,
        "route_types": ["job_relocation", "scholarship"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["specific traits", "example", "balance of strengths and development areas"],
            "red_flags": ["only positive with no nuance", "vague generics", "no example"],
        },
        "common_mistakes": [
            "Responder de forma excessivamente positiva sem nuance",
            "Não dar um exemplo concreto",
        ],
        "display_order": 90,
    },
    {
        "question_text_pt": "Qual seria sua maior contribuição para este grupo ou comitê nos primeiros 90 dias?",
        "question_text_en": "What would be your greatest contribution to this group or committee in the first 90 days?",
        "question_text_es": "¿Cuál sería su mayor contribución a este grupo o comité en los primeros 90 días?",
        "question_type": InterviewQuestionType.GOALS,
        "route_types": ["job_relocation"],
        "difficulty": "hard",
        "what_assessors_look_for": {
            "keywords": ["listening first", "specific actions", "quick wins", "realistic"],
            "red_flags": ["promises to change everything", "no listening phase", "unrealistic scope"],
        },
        "common_mistakes": [
            "Prometer transformações radicais imediatas",
            "Não mencionar uma fase de escuta e diagnóstico",
        ],
        "display_order": 91,
    },
    {
        "question_text_pt": "Como você lida com pressão e prazos apertados em contextos de alta exigência?",
        "question_text_en": "How do you handle pressure and tight deadlines in high-demand contexts?",
        "question_text_es": "¿Cómo maneja la presión y los plazos ajustados en contextos de alta exigencia?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["job_relocation", "graduate_school"],
        "difficulty": "medium",
        "what_assessors_look_for": {
            "keywords": ["specific strategy", "example", "outcome", "self-awareness"],
            "red_flags": ["says pressure doesn't affect them", "no example", "mentions unhealthy coping"],
        },
        "common_mistakes": [
            "Dizer que pressão não te afeta",
            "Não dar um exemplo real",
        ],
        "display_order": 92,
    },
    {
        "question_text_pt": "Dê um exemplo de como você influenciou uma decisão ou mudou a direção de um projeto sem ter autoridade formal.",
        "question_text_en": "Give an example of how you influenced a decision or changed the direction of a project without formal authority.",
        "question_text_es": "Dé un ejemplo de cómo influyó en una decisión o cambió la dirección de un proyecto sin tener autoridad formal.",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["job_relocation", "scholarship"],
        "difficulty": "hard",
        "what_assessors_look_for": {
            "keywords": ["persuasion", "data", "empathy", "outcome"],
            "red_flags": ["no real example", "says they had authority anyway", "manipulative tactics"],
        },
        "common_mistakes": [
            "Escolher um exemplo onde você tinha autoridade formal",
            "Não descrever como convenceu os outros",
        ],
        "display_order": 93,
    },
    {
        "question_text_pt": "O que diferencia você de outros candidatos com perfil semelhante ao seu?",
        "question_text_en": "What sets you apart from other candidates with a similar profile to yours?",
        "question_text_es": "¿Qué lo diferencia de otros candidatos con un perfil similar al suyo?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["graduate_school", "scholarship", "job_relocation"],
        "difficulty": "hard",
        "what_assessors_look_for": {
            "keywords": ["unique combination", "specific story", "perspective", "authentic"],
            "red_flags": ["generic answer", "claims perfect grades only", "arrogant without evidence"],
        },
        "common_mistakes": [
            "Responder de forma genérica ('sou comprometido e trabalhador')",
            "Listar apenas notas ou premiações sem narrativa",
        ],
        "display_order": 94,
    },
]


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

async def seed_questions():
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check how many already exist
        result = await session.execute(select(InterviewQuestion))
        existing = result.scalars().all()
        existing_texts = {q.question_text_pt for q in existing}

        created = 0
        skipped = 0

        for q_data in QUESTIONS:
            if q_data["question_text_pt"] in existing_texts:
                skipped += 1
                continue

            question = InterviewQuestion(**q_data)
            session.add(question)
            created += 1

        await session.commit()
        print(f"  Criadas: {created}  Ignoradas (já existiam): {skipped}")

    await engine.dispose()


if __name__ == "__main__":
    print("Populando banco de perguntas para entrevistas...")
    asyncio.run(seed_questions())
    print("Seed de perguntas concluído.")
