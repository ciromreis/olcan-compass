"""
Seed interview question bank.

Called once at app startup if the interview_questions table is empty.
Questions cover all InterviewQuestionType categories and are tagged
by route_type so the mock-interview generator can pick the right set.

PRD §6: "Question bank CRUD, Difficulty-level classification,
Question categorization, Route-specific distribution logic."
"""

import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.interview import InterviewQuestion, InterviewQuestionType


SEED_QUESTIONS = [
    # ── MOTIVATION (applicable to most routes) ──────────────────────────
    {
        "question_text_pt": "Por que você decidiu buscar uma oportunidade internacional neste momento da sua vida?",
        "question_text_en": "Why did you decide to pursue an international opportunity at this point in your life?",
        "question_text_es": "¿Por qué decidiste buscar una oportunidad internacional en este momento de tu vida?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["scholarship", "job_relocation", "exchange", "research"],
        "difficulty": "easy",
        "what_assessors_look_for": {"clarity": "Clear timeline reasoning", "authenticity": "Personal connection to the decision", "growth": "Evidence of intentional planning"},
        "common_mistakes": ["Generic answers like 'I want to grow'", "No connection to personal trajectory", "Sounding desperate rather than intentional"],
        "display_order": 1,
    },
    {
        "question_text_pt": "O que este programa/posição específica oferece que você não encontraria no seu país?",
        "question_text_en": "What does this specific program/position offer that you wouldn't find in your home country?",
        "question_text_es": "¿Qué ofrece este programa/posición específico que no encontrarías en tu país?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["scholarship", "job_relocation", "research"],
        "difficulty": "medium",
        "what_assessors_look_for": {"specificity": "Concrete aspects of the program", "research": "Evidence of having researched the destination", "fit": "Alignment between needs and offering"},
        "common_mistakes": ["Vague praise without specifics", "Focusing only on prestige", "Not mentioning what you'll contribute back"],
        "display_order": 2,
    },
    {
        "question_text_pt": "Como esta experiência se encaixa nos seus planos de carreira de longo prazo?",
        "question_text_en": "How does this experience fit into your long-term career plans?",
        "question_text_es": "¿Cómo encaja esta experiencia en tus planes de carrera a largo plazo?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["scholarship", "job_relocation", "research", "startup_visa"],
        "difficulty": "medium",
        "what_assessors_look_for": {"vision": "Clear long-term thinking", "coherence": "Logical connection between past-present-future", "impact": "Desire to create value"},
        "common_mistakes": ["No concrete plan", "Plans that don't require this specific opportunity", "Overly ambitious without foundation"],
        "display_order": 3,
    },
    {
        "question_text_pt": "O que faria você desistir de tudo e voltar para casa?",
        "question_text_en": "What would make you give up everything and go back home?",
        "question_text_es": "¿Qué te haría abandonar todo y volver a casa?",
        "question_type": InterviewQuestionType.MOTIVATION,
        "route_types": ["scholarship", "job_relocation", "exchange", "research"],
        "difficulty": "hard",
        "what_assessors_look_for": {"self_awareness": "Honest reflection on limits", "resilience": "Evidence of coping strategies", "commitment": "Genuine commitment despite challenges"},
        "common_mistakes": ["Claiming nothing would make you leave", "Being too honest about fragility", "Not showing how you'd handle the challenge"],
        "display_order": 4,
    },

    # ── BACKGROUND ──────────────────────────────────────────────────────
    {
        "question_text_pt": "Conte-me sobre sua formação acadêmica e como ela te preparou para este passo.",
        "question_text_en": "Tell me about your academic background and how it prepared you for this step.",
        "question_text_es": "Cuéntame sobre tu formación académica y cómo te preparó para este paso.",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["scholarship", "research", "exchange"],
        "difficulty": "easy",
        "what_assessors_look_for": {"relevance": "Connection between studies and opportunity", "depth": "Specific courses, projects, or research", "progression": "Clear academic evolution"},
        "common_mistakes": ["Listing courses without context", "No connection to the opportunity", "Underselling achievements"],
        "display_order": 5,
    },
    {
        "question_text_pt": "Descreva sua experiência profissional mais relevante para esta posição.",
        "question_text_en": "Describe your most relevant professional experience for this position.",
        "question_text_es": "Describe tu experiencia profesional más relevante para esta posición.",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["job_relocation", "startup_visa", "digital_nomad"],
        "difficulty": "easy",
        "what_assessors_look_for": {"impact": "Measurable results", "relevance": "Direct connection to the role", "growth": "Progressive responsibility"},
        "common_mistakes": ["Describing tasks instead of impact", "Too many details about irrelevant roles", "Not quantifying achievements"],
        "display_order": 6,
    },
    {
        "question_text_pt": "Qual projeto ou conquista de que você mais se orgulha e por quê?",
        "question_text_en": "What project or achievement are you most proud of and why?",
        "question_text_es": "¿De qué proyecto o logro estás más orgulloso/a y por qué?",
        "question_type": InterviewQuestionType.BACKGROUND,
        "route_types": ["scholarship", "job_relocation", "research", "startup_visa"],
        "difficulty": "medium",
        "what_assessors_look_for": {"storytelling": "Compelling narrative structure", "values": "What it reveals about character", "reflection": "Lessons learned"},
        "common_mistakes": ["Choosing something trivial", "Not explaining the 'why'", "All credit to team with no personal role"],
        "display_order": 7,
    },

    # ── CHALLENGE ───────────────────────────────────────────────────────
    {
        "question_text_pt": "Descreva uma situação em que você enfrentou um obstáculo significativo. Como lidou?",
        "question_text_en": "Describe a situation where you faced a significant obstacle. How did you handle it?",
        "question_text_es": "Describe una situación en la que enfrentaste un obstáculo significativo. ¿Cómo lo manejaste?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["scholarship", "job_relocation", "research", "exchange", "startup_visa"],
        "difficulty": "medium",
        "what_assessors_look_for": {"problem_solving": "Structured approach", "resilience": "Emotional management", "outcome": "Concrete resolution", "learning": "Growth from the experience"},
        "common_mistakes": ["Choosing a trivial challenge", "Blaming others", "No clear resolution", "Not explaining what you learned"],
        "display_order": 8,
    },
    {
        "question_text_pt": "Como você lida com a solidão e o isolamento em um ambiente novo?",
        "question_text_en": "How do you deal with loneliness and isolation in a new environment?",
        "question_text_es": "¿Cómo manejas la soledad y el aislamiento en un entorno nuevo?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["scholarship", "exchange", "job_relocation", "digital_nomad"],
        "difficulty": "hard",
        "what_assessors_look_for": {"self_awareness": "Honest acknowledgment", "strategies": "Concrete coping mechanisms", "social_skills": "Ability to build networks"},
        "common_mistakes": ["Denying ever feeling lonely", "No concrete strategies", "Sounding like social isolation is preferred"],
        "display_order": 9,
    },
    {
        "question_text_pt": "Conte sobre uma vez em que recebeu um feedback negativo. Como reagiu?",
        "question_text_en": "Tell me about a time you received negative feedback. How did you react?",
        "question_text_es": "Cuéntame sobre una vez que recibiste un feedback negativo. ¿Cómo reaccionaste?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["scholarship", "job_relocation", "research"],
        "difficulty": "medium",
        "what_assessors_look_for": {"maturity": "Non-defensive response", "action": "Concrete changes made", "growth": "How it improved you"},
        "common_mistakes": ["Getting defensive in the retelling", "Trivializing the feedback", "No evidence of change"],
        "display_order": 10,
    },
    {
        "question_text_pt": "Já teve que se adaptar a uma cultura completamente diferente? Como foi?",
        "question_text_en": "Have you ever had to adapt to a completely different culture? How was it?",
        "question_text_es": "¿Alguna vez tuviste que adaptarte a una cultura completamente diferente? ¿Cómo fue?",
        "question_type": InterviewQuestionType.CHALLENGE,
        "route_types": ["scholarship", "exchange", "job_relocation", "digital_nomad"],
        "difficulty": "medium",
        "what_assessors_look_for": {"openness": "Genuine curiosity about other cultures", "adaptability": "Concrete examples of adaptation", "empathy": "Understanding of cultural nuances"},
        "common_mistakes": ["Superficial tourism examples", "Stereotyping the other culture", "Not showing genuine learning"],
        "display_order": 11,
    },

    # ── GOALS ───────────────────────────────────────────────────────────
    {
        "question_text_pt": "Onde você se vê em 5 anos após esta experiência?",
        "question_text_en": "Where do you see yourself in 5 years after this experience?",
        "question_text_es": "¿Dónde te ves en 5 años después de esta experiencia?",
        "question_type": InterviewQuestionType.GOALS,
        "route_types": ["scholarship", "job_relocation", "research", "startup_visa"],
        "difficulty": "medium",
        "what_assessors_look_for": {"vision": "Concrete and realistic goals", "connection": "Link between opportunity and future", "impact": "Desire to contribute"},
        "common_mistakes": ["Vague aspirations", "Goals that contradict the opportunity", "No mention of giving back or contributing"],
        "display_order": 12,
    },
    {
        "question_text_pt": "Como pretende aplicar o que aprender aqui quando voltar ao seu país?",
        "question_text_en": "How do you plan to apply what you learn here when you return to your country?",
        "question_text_es": "¿Cómo planeas aplicar lo que aprendas aquí cuando regreses a tu país?",
        "question_type": InterviewQuestionType.GOALS,
        "route_types": ["scholarship", "exchange", "research"],
        "difficulty": "medium",
        "what_assessors_look_for": {"concrete_plan": "Specific actions, not vague ideas", "social_impact": "Benefit beyond personal gain", "feasibility": "Realistic implementation plan"},
        "common_mistakes": ["No concrete plan", "Only personal benefit", "Plans too grandiose to be credible"],
        "display_order": 13,
    },
    {
        "question_text_pt": "Qual impacto você espera causar no seu campo de atuação nos próximos 10 anos?",
        "question_text_en": "What impact do you expect to make in your field in the next 10 years?",
        "question_text_es": "¿Qué impacto esperas causar en tu campo de actuación en los próximos 10 años?",
        "question_type": InterviewQuestionType.GOALS,
        "route_types": ["research", "scholarship", "startup_visa"],
        "difficulty": "hard",
        "what_assessors_look_for": {"ambition": "Bold but grounded vision", "knowledge": "Understanding of field gaps", "strategy": "Path from current state to impact"},
        "common_mistakes": ["Too humble — no ambition", "Too grandiose — no credibility", "Disconnected from current trajectory"],
        "display_order": 14,
    },

    # ── CULTURAL FIT ────────────────────────────────────────────────────
    {
        "question_text_pt": "O que você sabe sobre a cultura do país de destino? O que mais te atrai e o que te preocupa?",
        "question_text_en": "What do you know about the culture of the destination country? What attracts and concerns you most?",
        "question_text_es": "¿Qué sabes sobre la cultura del país de destino? ¿Qué te atrae y qué te preocupa más?",
        "question_type": InterviewQuestionType.CULTURAL_FIT,
        "route_types": ["scholarship", "exchange", "job_relocation", "digital_nomad"],
        "difficulty": "easy",
        "what_assessors_look_for": {"research": "Evidence of genuine research", "balance": "Both positives and concerns", "maturity": "Realistic expectations"},
        "common_mistakes": ["Only positive or only negative", "Superficial cultural knowledge", "No mention of how you'll adapt"],
        "display_order": 15,
    },
    {
        "question_text_pt": "Como você contribuiria para a diversidade e inclusão nesta instituição/empresa?",
        "question_text_en": "How would you contribute to diversity and inclusion at this institution/company?",
        "question_text_es": "¿Cómo contribuirías a la diversidad e inclusión en esta institución/empresa?",
        "question_type": InterviewQuestionType.CULTURAL_FIT,
        "route_types": ["scholarship", "job_relocation", "research"],
        "difficulty": "medium",
        "what_assessors_look_for": {"unique_perspective": "What your background brings", "concrete_actions": "Specific contributions", "sensitivity": "Understanding of diversity challenges"},
        "common_mistakes": ["Generic diversity statements", "Making it only about nationality", "No concrete examples"],
        "display_order": 16,
    },
    {
        "question_text_pt": "Descreva como você se adapta a estilos de comunicação diferentes do seu.",
        "question_text_en": "Describe how you adapt to communication styles different from yours.",
        "question_text_es": "Describe cómo te adaptas a estilos de comunicación diferentes al tuyo.",
        "question_type": InterviewQuestionType.CULTURAL_FIT,
        "route_types": ["job_relocation", "scholarship", "exchange"],
        "difficulty": "medium",
        "what_assessors_look_for": {"awareness": "Understanding of communication differences", "flexibility": "Evidence of adapting", "examples": "Concrete situations"},
        "common_mistakes": ["Claiming to have no communication issues", "Stereotyping cultures", "No real examples"],
        "display_order": 17,
    },

    # ── TECHNICAL ───────────────────────────────────────────────────────
    {
        "question_text_pt": "Explique sua metodologia de pesquisa/trabalho e como ela se aplica a este contexto.",
        "question_text_en": "Explain your research/work methodology and how it applies to this context.",
        "question_text_es": "Explica tu metodología de investigación/trabajo y cómo se aplica a este contexto.",
        "question_type": InterviewQuestionType.TECHNICAL,
        "route_types": ["research", "scholarship"],
        "difficulty": "medium",
        "what_assessors_look_for": {"rigor": "Structured methodology", "relevance": "Application to new context", "adaptability": "Willingness to learn new methods"},
        "common_mistakes": ["Too jargon-heavy", "Not connecting to the new context", "Rigid attachment to one method"],
        "display_order": 18,
    },
    {
        "question_text_pt": "Quais ferramentas, tecnologias ou frameworks você domina que são relevantes para esta posição?",
        "question_text_en": "What tools, technologies or frameworks do you master that are relevant to this position?",
        "question_text_es": "¿Qué herramientas, tecnologías o frameworks dominas que son relevantes para esta posición?",
        "question_type": InterviewQuestionType.TECHNICAL,
        "route_types": ["job_relocation", "startup_visa", "digital_nomad"],
        "difficulty": "easy",
        "what_assessors_look_for": {"depth": "Real mastery vs surface knowledge", "relevance": "Match with job requirements", "learning": "Willingness to learn new tools"},
        "common_mistakes": ["Listing too many without depth", "Not prioritizing by relevance", "No evidence of actual use"],
        "display_order": 19,
    },
    {
        "question_text_pt": "Descreva um problema técnico complexo que você resolveu recentemente.",
        "question_text_en": "Describe a complex technical problem you recently solved.",
        "question_text_es": "Describe un problema técnico complejo que resolviste recientemente.",
        "question_type": InterviewQuestionType.TECHNICAL,
        "route_types": ["job_relocation", "research", "startup_visa"],
        "difficulty": "hard",
        "what_assessors_look_for": {"problem_definition": "Clear problem statement", "approach": "Structured thinking", "result": "Measurable outcome", "learning": "What you'd do differently"},
        "common_mistakes": ["Overcomplicating the explanation", "No clear outcome", "Taking sole credit for team work"],
        "display_order": 20,
    },

    # ── SCENARIO ────────────────────────────────────────────────────────
    {
        "question_text_pt": "Imagine que você chegou ao país e nos primeiros 30 dias tudo deu errado: moradia, idioma, burocracia. O que faria?",
        "question_text_en": "Imagine you arrived in the country and in the first 30 days everything went wrong: housing, language, bureaucracy. What would you do?",
        "question_text_es": "Imagina que llegaste al país y en los primeros 30 días todo salió mal: vivienda, idioma, burocracia. ¿Qué harías?",
        "question_type": InterviewQuestionType.SCENARIO,
        "route_types": ["scholarship", "exchange", "job_relocation", "digital_nomad"],
        "difficulty": "hard",
        "what_assessors_look_for": {"composure": "Calm problem-solving", "resourcefulness": "Creative solutions", "support_network": "Awareness of available help", "prioritization": "Knowing what to tackle first"},
        "common_mistakes": ["Panicking in the answer", "Unrealistic optimism", "No concrete action plan", "Not asking for help"],
        "display_order": 21,
    },
    {
        "question_text_pt": "Seu orientador/chefe tem um estilo de trabalho oposto ao seu. Como lidaria?",
        "question_text_en": "Your advisor/boss has a work style opposite to yours. How would you handle it?",
        "question_text_es": "Tu director/jefe tiene un estilo de trabajo opuesto al tuyo. ¿Cómo lo manejarías?",
        "question_type": InterviewQuestionType.SCENARIO,
        "route_types": ["research", "scholarship", "job_relocation"],
        "difficulty": "medium",
        "what_assessors_look_for": {"adaptability": "Willingness to adjust", "communication": "Direct but respectful dialogue", "professionalism": "Focus on results over preferences"},
        "common_mistakes": ["Being confrontational", "Being too submissive", "Not acknowledging the challenge"],
        "display_order": 22,
    },
    {
        "question_text_pt": "Você descobre que seu nível de idioma não é suficiente para acompanhar as aulas/reuniões. Qual é seu plano?",
        "question_text_en": "You discover your language level isn't sufficient to follow classes/meetings. What's your plan?",
        "question_text_es": "Descubres que tu nivel de idioma no es suficiente para seguir las clases/reuniones. ¿Cuál es tu plan?",
        "question_type": InterviewQuestionType.SCENARIO,
        "route_types": ["scholarship", "exchange", "job_relocation"],
        "difficulty": "medium",
        "what_assessors_look_for": {"honesty": "Acknowledging the gap", "proactivity": "Immediate action plan", "resourcefulness": "Multiple strategies"},
        "common_mistakes": ["Denying it could happen", "No concrete improvement plan", "Only one strategy"],
        "display_order": 23,
    },
    {
        "question_text_pt": "Você tem um prazo apertado e dois projetos importantes conflitando. Como prioriza?",
        "question_text_en": "You have a tight deadline and two important projects conflicting. How do you prioritize?",
        "question_text_es": "Tienes un plazo ajustado y dos proyectos importantes en conflicto. ¿Cómo priorizas?",
        "question_type": InterviewQuestionType.SCENARIO,
        "route_types": ["job_relocation", "research", "startup_visa"],
        "difficulty": "medium",
        "what_assessors_look_for": {"organization": "Clear prioritization framework", "communication": "Transparency with stakeholders", "execution": "Concrete steps"},
        "common_mistakes": ["Trying to do everything at once", "Not communicating with stakeholders", "No framework for decision-making"],
        "display_order": 24,
    },

    # ── QUESTION FOR PANEL ──────────────────────────────────────────────
    {
        "question_text_pt": "Que perguntas você gostaria de fazer para nós / para a banca?",
        "question_text_en": "What questions would you like to ask us / the panel?",
        "question_text_es": "¿Qué preguntas te gustaría hacernos / al panel?",
        "question_type": InterviewQuestionType.QUESTION_FOR_PANEL,
        "route_types": ["scholarship", "job_relocation", "research", "exchange"],
        "difficulty": "easy",
        "what_assessors_look_for": {"curiosity": "Genuine interest", "research": "Questions that show prior research", "depth": "Going beyond FAQ-level questions"},
        "common_mistakes": ["Having no questions", "Asking about salary/benefits first", "Questions already answered on the website"],
        "display_order": 25,
    },
    {
        "question_text_pt": "Qual é o perfil do candidato ideal para vocês e como posso me preparar melhor?",
        "question_text_en": "What is the ideal candidate profile for you and how can I better prepare?",
        "question_text_es": "¿Cuál es el perfil del candidato ideal para ustedes y cómo puedo prepararme mejor?",
        "question_type": InterviewQuestionType.QUESTION_FOR_PANEL,
        "route_types": ["scholarship", "job_relocation", "research"],
        "difficulty": "medium",
        "what_assessors_look_for": {"self_improvement": "Desire to improve", "strategic_thinking": "Understanding of selection criteria", "humility": "Openness to feedback"},
        "common_mistakes": ["Sounding insecure", "Not listening to the actual answer", "Asking as manipulation rather than genuine interest"],
        "display_order": 26,
    },
]


async def seed_interview_questions(db: AsyncSession) -> None:
    """Insert seed interview questions if the table is empty."""
    result = await db.execute(
        select(func.count(InterviewQuestion.id))
    )
    count = result.scalar() or 0

    if count > 0:
        return

    print(f"[seed] Inserting {len(SEED_QUESTIONS)} interview questions...")

    for q in SEED_QUESTIONS:
        question = InterviewQuestion(
            id=uuid.uuid4(),
            question_text_pt=q["question_text_pt"],
            question_text_en=q["question_text_en"],
            question_text_es=q["question_text_es"],
            question_type=q["question_type"],
            route_types=q["route_types"],
            difficulty=q["difficulty"],
            what_assessors_look_for=q["what_assessors_look_for"],
            common_mistakes=q["common_mistakes"],
            is_active=True,
            display_order=q["display_order"],
            version=1,
        )
        db.add(question)

    await db.commit()
    print(f"[seed] ✓ {len(SEED_QUESTIONS)} interview questions inserted")
