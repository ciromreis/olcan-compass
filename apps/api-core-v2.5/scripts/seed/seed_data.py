import asyncio
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.models.user import User, UserRole
from app.db.models.psychology import PsychQuestion, PsychQuestionType, PsychCategory
from app.db.models.route import (
    RouteTemplate,
    RouteMilestoneTemplate,
    RouteType,
    MilestoneCategory,
)
from app.db.models.application import Opportunity, OpportunityType, OpportunityStatus
from app.db.models.interview import InterviewQuestion, InterviewQuestionType
from app.db.models.prompt import PromptTemplate, PromptCategory, PromptTemplateStatus
from app.db.models.marketplace import (
    ProviderProfile, ServiceListing, ServiceType, ProviderStatus, ServiceDeliveryMethod, PricingType
)

# ──────────────────────────────────────────
# CONSTANTS & METADATA (from internal-data-intelligence.md)
# ──────────────────────────────────────────

# ARCHETYPES (12)
ARCHETYPES_MATRIX = [
    {"id": "arch_01", "name": "O Desenvolvedor Técnico Travado", "fear_cluster": "COMPETENCE", "route_affinity": "CORPORATE"},
    {"id": "arch_02", "name": "A Servidora Pública Presa", "fear_cluster": "IRREVERSIBILITY", "route_affinity": "ACADEMIC"},
    {"id": "arch_03", "name": "O Jovem FOMO Sem Direção", "fear_cluster": "REJECTION", "route_affinity": "EXCHANGE"},
    {"id": "arch_04", "name": "O Executivo Sênior Tarde Demais", "fear_cluster": "COMPETENCE", "route_affinity": "CORPORATE"},
    {"id": "arch_05", "name": "A Mãe Solo Exausta", "fear_cluster": "IRREVERSIBILITY", "route_affinity": "SCHOLARSHIP"},
    {"id": "arch_06", "name": "O Nômade Digital Inseguro", "fear_cluster": "COMPETENCE", "route_affinity": "NOMAD"},
    {"id": "arch_07", "name": "O Acadêmico Provinciano", "fear_cluster": "REJECTION", "route_affinity": "ACADEMIC"},
    {"id": "arch_08", "name": "O Casal LGBT+ Com Receio", "fear_cluster": "REJECTION", "route_affinity": "CORPORATE"},
    {"id": "arch_09", "name": "O Profissional de Saúde Dividido", "fear_cluster": "LOSS", "route_affinity": "CORPORATE"},
    {"id": "arch_10", "name": "O Empreendedor Falido", "fear_cluster": "IRREVERSIBILITY", "route_affinity": "STARTUP"},
    {"id": "arch_11", "name": "O Profissional de Humanas Desvalorizado", "fear_cluster": "COMPETENCE", "route_affinity": "SCHOLARSHIP"},
    {"id": "arch_12", "name": "O Neuroatípico Exausto", "fear_cluster": "COMPETENCE", "route_affinity": "CORPORATE"}
]

FEAR_REFRAME_CARDS = [
    {"cluster": "COMPETENCE", "reframe_text": "A preparação excessiva é frequentemente uma forma sofisticada de procrastinação. Sua dúvida atual é um sinal de que você está operando na fronteira da sua habilidade. Recrutadores buscam potencial de aprendizado, não apenas conhecimento enciclopédico."},
    {"cluster": "REJECTION", "reframe_text": "A rejeição não é um veredito sobre seu valor, mas um desajuste momentâneo de 'fit'. No mercado global, o 'não' é apenas um dado a ser iterado. Sistemas ATS usam filtros algorítmicos; não leve para o lado pessoal, leve para a estratégia."},
    {"cluster": "LOSS", "reframe_text": "Compare o custo de ficar onde está (estagnação, perda de potencial) com o risco da mudança. Antecipar a perda dói 6x mais que imaginar o ganho, mas o ganho é o que permanece."},
    {"cluster": "IRREVERSIBILITY", "reframe_text": "Você não está pulando no abismo; estamos construindo um experimento controlado. Você pode testar hipóteses, obter licenças, e manter caminhos de volta. A internacionalização é reversível."}
]

SUBSCRIPTION_TIERS = [
    {"plan_type": "FREE", "name": "Compass Lite", "price": 0.00, "features": ["1 Route (Find Only)", "Diagnostic Card", "1 Narrative Analysis", "1 Mock Interview"]},
    {"plan_type": "PRO", "name": "Compass Core", "price": 79.00, "features": ["Full 1 Route", "Unlimited AI Narrative", "Unlimited Mock Interviews", "Marketplace Access", "PDF Exports"]},
    {"plan_type": "PREMIUM", "name": "Compass Pro", "price": 149.00, "features": ["All 4 Routes", "Scenario Builder", "Priority AI", "2 Mentorship Credits/mo"]}
]

DIGITAL_PRODUCTS = [
    {"id": "dp_rota", "name": "Rota da Internacionalização (Miro)", "price": 35.00, "route_type": None},
    {"id": "dp_kit", "name": "Kit Application (Notion)", "price": 75.00, "route_type": "ALL"},
    {"id": "dp_course", "name": "Curso Sem Fronteiras", "price": 497.00, "route_type": "ALL"}
]

# ──────────────────────────────────────────
# PSYCHOLOGICAL QUESTIONS (18 questions, 8 PRD blocks)
# ──────────────────────────────────────────

# Likert 1-5 scale options with descriptive labels
LIKERT_OPTIONS = [
    {"value": "1", "label_pt": "Discordo totalmente", "label_en": "Strongly disagree", "label_es": "Totalmente en desacuerdo", "score": 20},
    {"value": "2", "label_pt": "Discordo", "label_en": "Disagree", "label_es": "En desacuerdo", "score": 40},
    {"value": "3", "label_pt": "Neutro", "label_en": "Neutral", "label_es": "Neutral", "score": 60},
    {"value": "4", "label_pt": "Concordo", "label_en": "Agree", "label_es": "De acuerdo", "score": 80},
    {"value": "5", "label_pt": "Concordo totalmente", "label_en": "Strongly agree", "label_es": "Totalmente de acuerdo", "score": 100},
]

PSYCH_QUESTIONS = [
    # ── Block 1: Context Calibration (CULTURAL_ADAPTABILITY — used to route-bias) ──
    {
        "id": "q_context_intent_1",
        "category": PsychCategory.CULTURAL_ADAPTABILITY,
        "text_pt": "O que te traz ao Compass?",
        "text_en": "What brings you to Compass?",
        "text_es": "¿Qué te trae a Compass?",
        "question_type": PsychQuestionType.MULTIPLE_CHOICE,
        "options": [
            {"value": "scholarship", "label_pt": "Bolsa de estudos ou pesquisa", "label_en": "Scholarship or research", "label_es": "Beca o investigación", "score": 60},
            {"value": "job", "label_pt": "Emprego no exterior", "label_en": "Job abroad", "label_es": "Empleo en el extranjero", "score": 70},
            {"value": "startup", "label_pt": "Visto de empreendedor ou nômade", "label_en": "Entrepreneur or nomad visa", "label_es": "Visa de emprendedor o nómada", "score": 80},
            {"value": "not_sure", "label_pt": "Ainda não tenho certeza", "label_en": "Not sure yet", "label_es": "Aún no estoy seguro", "score": 40},
        ],
        "weight": 0.5,
        "display_order": 1,
    },
    {
        "id": "q_context_urgency_1",
        "category": PsychCategory.CULTURAL_ADAPTABILITY,
        "text_pt": "Qual é a urgência do seu plano?",
        "text_en": "How urgent is your plan?",
        "text_es": "¿Qué tan urgente es tu plan?",
        "question_type": PsychQuestionType.MULTIPLE_CHOICE,
        "options": [
            {"value": "exploring", "label_pt": "Estou apenas explorando", "label_en": "Just exploring", "label_es": "Solo estoy explorando", "score": 30},
            {"value": "12_months", "label_pt": "Dentro de 12 meses", "label_en": "Within 12 months", "label_es": "Dentro de 12 meses", "score": 50},
            {"value": "6_months", "label_pt": "Dentro de 6 meses", "label_en": "Within 6 months", "label_es": "Dentro de 6 meses", "score": 75},
            {"value": "asap", "label_pt": "O mais rápido possível", "label_en": "As soon as possible", "label_es": "Lo antes posible", "score": 100},
        ],
        "weight": 0.5,
        "display_order": 2,
    },

    # ── Block 2: Confidence ──
    {
        "id": "q_confidence_1",
        "category": PsychCategory.CONFIDENCE,
        "text_pt": "Se eu me candidatasse hoje, me sentiria preparado(a) para competir com candidatos internacionais.",
        "text_en": "If I applied today, I would feel prepared to compete with international candidates.",
        "text_es": "Si me postulara hoy, me sentiría preparado para competir con candidatos internacionales.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 3,
    },
    {
        "id": "q_confidence_2",
        "category": PsychCategory.CONFIDENCE,
        "text_pt": "Quando enfrento processos competitivos, geralmente confio na minha capacidade de me destacar.",
        "text_en": "When facing competitive processes, I usually trust my ability to stand out.",
        "text_es": "Cuando enfrento procesos competitivos, generalmente confío en mi capacidad para destacarme.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 4,
    },

    # ── Block 3: Risk Orientation ──
    {
        "id": "q_risk_orientation_1",
        "category": PsychCategory.RISK_TOLERANCE,
        "text_pt": "Sinto-me confortável em investir mais de 50% das minhas economias sem garantia de emprego imediata.",
        "text_en": "I feel comfortable investing over 50% of my savings without a guarantee of immediate employment.",
        "text_es": "Me siento cómodo invirtiendo más del 50% de mis ahorros sin garantía de empleo inmediato.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 5,
    },
    {
        "id": "q_risk_orientation_2",
        "category": PsychCategory.RISK_TOLERANCE,
        "text_pt": "Prefiro me candidatar somente quando me sentir completamente preparado(a).",
        "text_en": "I prefer to apply only when I feel fully prepared.",
        "text_es": "Prefiero postularme solo cuando me sienta completamente preparado.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "reverse_scored": True,
        "display_order": 6,
    },

    # ── Block 4: Discipline ──
    {
        "id": "q_discipline_1",
        "category": PsychCategory.DISCIPLINE,
        "text_pt": "Consigo manter uma rotina de 5h/semana de preparação mesmo sem feedbacks positivos em 3 meses.",
        "text_en": "I can maintain a 5h/week preparation routine even without positive feedback for 3 months.",
        "text_es": "Puedo mantener una rutina de preparación de 5h/semana incluso sin retroalimentación positiva en 3 meses.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 7,
    },
    {
        "id": "q_discipline_2",
        "category": PsychCategory.DISCIPLINE,
        "text_pt": "Tenho dificuldade em manter consistência em objetivos de longo prazo.",
        "text_en": "I struggle to stay consistent with long-term goals.",
        "text_es": "Tengo dificultad para mantener la consistencia en objetivos a largo plazo.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "reverse_scored": True,
        "display_order": 8,
    },

    # ── Block 5: Decision Pattern ──
    {
        "id": "q_decision_1",
        "category": PsychCategory.DECISION_STYLE,
        "text_pt": "Frequentemente penso demais antes de tomar decisões importantes.",
        "text_en": "I often overthink before making important decisions.",
        "text_es": "A menudo pienso demasiado antes de tomar decisiones importantes.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 9,
    },
    {
        "id": "q_decision_2",
        "category": PsychCategory.DECISION_STYLE,
        "text_pt": "Costumo adiar o início de algo porque quero ter clareza total primeiro.",
        "text_en": "I tend to delay starting because I want full clarity first.",
        "text_es": "Tiendo a retrasar el inicio porque quiero tener total claridad primero.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 10,
    },

    # ── Block 6: Interview Anxiety ──
    {
        "id": "q_interview_anxiety_1",
        "category": PsychCategory.INTERVIEW_ANXIETY,
        "text_pt": "Meu desempenho em entrevistas cai drasticamente quando percebo que sou o candidato menos experiente.",
        "text_en": "My interview performance drops drastically when I realize I am the least experienced candidate.",
        "text_es": "Mi rendimiento en entrevistas cae drásticamente cuando me doy cuenta de que soy el candidato menos experimentado.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 11,
    },
    {
        "id": "q_interview_anxiety_2",
        "category": PsychCategory.INTERVIEW_ANXIETY,
        "text_pt": "Falar sobre minhas conquistas me deixa desconfortável.",
        "text_en": "Speaking about my achievements makes me uncomfortable.",
        "text_es": "Hablar de mis logros me hace sentir incómodo.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 12,
    },

    # ── Block 7: Goal Clarity / Narrative Strength ──
    {
        "id": "q_narrative_clarity_1",
        "category": PsychCategory.NARRATIVE_CLARITY,
        "text_pt": "Consigo explicar com clareza por que quero ir para o exterior.",
        "text_en": "I can clearly explain why I want to go abroad.",
        "text_es": "Puedo explicar con claridad por qué quiero ir al extranjero.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 13,
    },
    {
        "id": "q_narrative_clarity_2",
        "category": PsychCategory.NARRATIVE_CLARITY,
        "text_pt": "Sinto que minhas habilidades são únicas e competitivas em qualquer mercado global.",
        "text_en": "I feel my skills are unique and competitive in any global market.",
        "text_es": "Siento que mis habilidades son únicas y competitivas en cualquier mercado global.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 14,
    },

    # ── Block 8: Financial Stress ──
    {
        "id": "q_financial_1",
        "category": PsychCategory.FINANCIAL_RESILIENCE,
        "text_pt": "Finanças são minha maior preocupação em relação à mudança para o exterior.",
        "text_en": "Finances are my biggest concern about moving abroad.",
        "text_es": "Las finanzas son mi mayor preocupación respecto a mudarme al extranjero.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "reverse_scored": True,
        "display_order": 15,
    },
    {
        "id": "q_financial_2",
        "category": PsychCategory.FINANCIAL_RESILIENCE,
        "text_pt": "Me sinto financeiramente preparado(a) para sustentar pelo menos 6 meses no exterior sem renda local.",
        "text_en": "I feel financially prepared to sustain myself for at least 6 months abroad without local income.",
        "text_es": "Me siento financieramente preparado para sostenerme al menos 6 meses en el extranjero sin ingresos locales.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 16,
    },

    # ── Block 2b: Anxiety / Loss Sensitivity (kept from original) ──
    {
        "id": "q_loss_aversion_1",
        "category": PsychCategory.ANXIETY,
        "text_pt": "Eu prefiro manter minha estabilidade atual do que arriscar uma vaga júnior em um mercado mais forte.",
        "text_en": "I prefer to maintain my current stability over risking a junior position in a stronger market.",
        "text_es": "Prefiero mantener mi estabilidad actual que arriesgar una posición junior en un mercado más fuerte.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 17,
    },
    {
        "id": "q_anxiety_2",
        "category": PsychCategory.ANXIETY,
        "text_pt": "A incerteza sobre o futuro me paralisa mais do que me motiva.",
        "text_en": "Uncertainty about the future paralyzes me more than it motivates me.",
        "text_es": "La incertidumbre sobre el futuro me paraliza más de lo que me motiva.",
        "question_type": PsychQuestionType.SCALE,
        "options": LIKERT_OPTIONS,
        "weight": 1.0,
        "display_order": 18,
    },
]

# ──────────────────────────────────────────
# ROUTE TEMPLATES
# ──────────────────────────────────────────
ROUTE_TEMPLATES = [
    {
        "route_type": "scholarship",
        "name_pt": "Rota Acadêmica e Bolsas",
        "name_en": "Academic Route and Scholarships",
        "name_es": "Ruta Académica y Becas",
        "description_pt": "Rota para pesquisa, bolsa de estudos e doutorado no exterior.",
        "description_en": "Route for research, scholarships, and PhDs abroad.",
        "description_es": "Ruta para investigación, becas de estudio y doctorado en el extranjero.",
        "estimated_duration_months": 9,
        "competitiveness_level": "high",
        "typical_cost_usd": 1500,
        "milestones": [
            {"name_pt": "Definir país e programas alvo", "name_en": "Define target country/programs", "desc": "Select 3-5 programs", "order": 1, "days": 14},
            {"name_pt": "Teste de proficiência linguística", "name_en": "Language test", "desc": "IELTS/TOEFL", "order": 2, "days": 60},
            {"name_pt": "Preparar Carta de Motivação", "name_en": "Motivation Letter", "desc": "Write motivation letter", "order": 3, "days": 21},
            {"name_pt": "Submeter candidatura", "name_en": "Submit", "desc": "Submit documents", "order": 4, "days": 7},
        ],
    },
    {
        "route_type": "job_relocation",
        "name_pt": "Relocação Corporativa (Job Sponsorship)",
        "name_en": "Corporate Relocation",
        "name_es": "Reubicación Corporativa",
        "description_pt": "Profissionais de mercado que buscam ofertas com patrocínio de visto.",
        "description_en": "Market professionals seeking offers with visa sponsorship.",
        "description_es": "Profesionales que buscan ofertas con patrocinio de visa.",
        "estimated_duration_months": 6,
        "competitiveness_level": "high",
        "typical_cost_usd": 3000,
        "milestones": [
            {"name_pt": "Atualização CV Global (ATS-friendly)", "name_en": "Global CV", "desc": "Optimize for ATS", "order": 1, "days": 14},
            {"name_pt": "English Proficiency (B2 CEFR)", "name_en": "English prep", "desc": "Level B2 proof", "order": 2, "days": 30},
            {"name_pt": "Mock Interview Technical", "name_en": "Mock Interview", "desc": "Practice technicals", "order": 3, "days": 14},
            {"name_pt": "Job Offer & CoS", "name_en": "Offer & CoS", "desc": "Get sponsorship", "order": 4, "days": 60},
            {"name_pt": "Visa Application", "name_en": "Visa", "desc": "Home Office app", "order": 5, "days": 30}
        ],
    },
    {
        "route_type": "startup_visa",
        "name_pt": "Visto Nômade / Renda Passiva",
        "name_en": "Nomad / Passive Income Visa",
        "name_es": "Visa Nómada / Renta Pasiva",
        "description_pt": "Empreendedores e nômades buscando vistos de residência D8 ou similares.",
        "description_en": "Entrepreneurs and nomads seeking residence visas.",
        "description_es": "Emprendedores y nómadas buscando visas de residencia.",
        "estimated_duration_months": 4,
        "competitiveness_level": "medium",
        "typical_cost_usd": 10000,
        "milestones": [
            {"name_pt": "Obtenção do NIF (Tax ID)", "name_en": "Tax ID", "desc": "Get NIF", "order": 1, "days": 14},
            {"name_pt": "Abertura de Conta Bancária PT", "name_en": "Bank Account", "desc": "Open account", "order": 2, "days": 7},
            {"name_pt": "Prova de Renda Ativa", "name_en": "Income Proof", "desc": "Show €3.680/mês", "order": 3, "days": 10},
            {"name_pt": "Alojamento (12 meses)", "name_en": "Housing", "desc": "12 months lease", "order": 4, "days": 21},
            {"name_pt": "Visto Consular", "name_en": "Consular Visa", "desc": "Apply for visa", "order": 5, "days": 30},
            {"name_pt": "Agendamento AIMA", "name_en": "AIMA schedule", "desc": "In-country SEF/AIMA", "order": 6, "days": 14},
        ],
    }
]

# ──────────────────────────────────────────
# OPPORTUNITIES
# ──────────────────────────────────────────
OPPORTUNITIES = [
    {
        "title": "UK Skilled Worker Visa (Tech)",
        "organization_name": "UK Home Office",
        "country": "Reino Unido",
        "opportunity_type": OpportunityType.JOB,
        "description": "Patrocínio corporativo de visto para profissionais com oferta de salário acima de GBP 49,430.",
    },
    {
        "title": "Portugal Digital Nomad Visa (D8)",
        "organization_name": "Governo de Portugal",
        "country": "Portugal",
        "opportunity_type": OpportunityType.GRANT,
        "description": "Visto para trabalhadores remotos com renda mínima comprovada.",
    },
    {
        "title": "UK High Potential Individual (HPI) Visa",
        "organization_name": "UK Home Office",
        "country": "Reino Unido",
        "opportunity_type": OpportunityType.JOB,
        "description": "Visto para egressos de universidades globais listadas no ranking do Governo Britânico.",
    },
    {
        "title": "Chevening Scholarship (UK)",
        "organization_name": "FCDO",
        "country": "Reino Unido",
        "opportunity_type": OpportunityType.SCHOLARSHIP,
        "description": "Bolsa de mestrado com todas as despesas pagas para líderes globais.",
    },
    {
        "title": "Fulbright Brazil (EUA)",
        "organization_name": "Fulbright Commission",
        "country": "EUA",
        "opportunity_type": OpportunityType.RESEARCH_POSITION,
        "description": "Programa de intercâmbio educacional e pesquisa acadêmica.",
    }
]

# ──────────────────────────────────────────
# INTERVIEW QUESTIONS
# ──────────────────────────────────────────
INTERVIEW_QUESTIONS = [
    {
        "question_type": InterviewQuestionType.MOTIVATION,
        "difficulty": "easy",
        "question_text_pt": "Por que este país especificamente agora? O que você pesquisou sobre o estilo de vida local e o sistema acadêmico?",
        "question_text_en": "Why this specific country now? What have you researched about the lifestyle and academic system?",
        "question_text_es": "¿Por qué este país específicamente ahora? ¿Qué has investigado sobre el estilo de vida y el sistema académico?",
    },
    {
        "question_type": InterviewQuestionType.CHALLENGE,
        "difficulty": "hard",
        "question_text_pt": "Conte sobre um desentendimento cultural ou técnico que você teve em um time diverso e como você o resolveu (Use o método STAR).",
        "question_text_en": "Tell me about a cultural or technical disagreement in a diverse team and how you solved it (Use STAR method).",
        "question_text_es": "Cuéntame sobre un desacuerdo cultural o técnico que tuviste en un equipo diverso y cómo lo resolviste.",
    },
    {
        "question_type": InterviewQuestionType.TECHNICAL,
        "difficulty": "hard",
        "question_text_pt": "Como você quantificou o retorno sobre investimento (ROI) da sua última grande entrega tecnológica em termos de valor comercial?",
        "question_text_en": "How did you quantify the ROI of your last major technical delivery in commercial value terms?",
        "question_text_es": "¿Cómo cuantificaste el retorno de inversión de tu última entrega tecnológica en términos comerciales?",
    },
    {
        "question_type": InterviewQuestionType.SCENARIO,
        "difficulty": "hard",
        "question_text_pt": "Você percebe que seu gestor está tomando uma decisão ética questionável para acelerar um projeto crítico. Como você procede sob alta pressão de entrega?",
        "question_text_en": "You realize your manager is making a questionable ethical decision to speed up a critical project. How do you proceed?",
        "question_text_es": "Te das cuenta de que tu gerente está tomando una decisión ética cuestionable. ¿Cómo procedes?",
    }
]

# ──────────────────────────────────────────
# AI PROMPT TEMPLATES
# ──────────────────────────────────────────
AI_PROMPTS = [
    {
        "name": "Narrative Analysis Elite",
        "slug": "narrative_analysis_v1",
        "category": PromptCategory.NARRATIVE_ANALYSIS,
        "system_prompt": "Você é o Motor de Inteligência Olcan, atuando como um Consultor de Mobilidade Global de Elite. Avalie o texto focado em Persuasão Estratégica, Trajetória de Crescimento (Slope) e Fit Cultural. Penalize clichês (-0.5 pontos para 'sempre foi meu sonho'). Responda em JSON.",
        "user_prompt_template": "Analise a seguinte narrativa: {narrative_text}",
    },
    {
        "name": "Interview Simulation Evaluator",
        "slug": "interview_evaluator_v1",
        "category": PromptCategory.INTERVIEW_FEEDBACK,
        "system_prompt": "Você é o Motor de Simulação de Entrevistas Olcan. Avalie a transcrição com base na metodologia STAR. Identifique hesitações, falta de especificidade e avalie a projeção de confiança. Retorne JSON.",
        "user_prompt_template": "Analise a seguinte resposta de entrevista: {transcript}",
    }
]

# ──────────────────────────────────────────
# MARKETPLACE SERVICES
# ──────────────────────────────────────────
MARKETPLACE_SERVICES = [
    {"service_type": ServiceType.MENTORING, "title": "Mentoria Personalizada Olcan (1h)", "price_amount": 225.00, "delivery_method": ServiceDeliveryMethod.VIDEO_CALL},
    {"service_type": ServiceType.CV_REVIEW, "title": "Revisão de Portfólio / CV Assíncrona", "price_amount": 180.00, "delivery_method": ServiceDeliveryMethod.DOCUMENT_REVIEW},
    {"service_type": ServiceType.INTERVIEW_PREP, "title": "Mock Interview Human-in-the-Loop", "price_amount": 225.00, "delivery_method": ServiceDeliveryMethod.VIDEO_CALL},
    {"service_type": ServiceType.APPLICATION_STRATEGY, "title": "Pacote VIP Application (5 Sessões)", "price_amount": 2500.00, "delivery_method": ServiceDeliveryMethod.VIDEO_CALL},
]

async def _seed_psychology(session: AsyncSession):
    existing = await session.execute(select(PsychQuestion).limit(1))
    if existing.scalar():
        return False
    
    for q_data in PSYCH_QUESTIONS:
        question = PsychQuestion(
            id=uuid.uuid4(),
            text_en=q_data["text_en"],
            text_pt=q_data["text_pt"],
            text_es=q_data["text_es"],
            question_type=q_data["question_type"],
            category=q_data["category"],
            options=q_data["options"],
            weight=q_data["weight"],
            display_order=q_data["display_order"],
            is_active=True,
            version=1,
        )
        session.add(question)
    return True

async def _seed_routes(session: AsyncSession):
    existing = await session.execute(select(RouteTemplate).limit(1))
    if existing.scalar():
        return False
    
    for rt_data in ROUTE_TEMPLATES:
        template = RouteTemplate(
            id=uuid.uuid4(),
            route_type=rt_data["route_type"],
            name_en=rt_data["name_en"],
            name_pt=rt_data["name_pt"],
            name_es=rt_data["name_es"],
            description_en=rt_data["description_en"],
            description_pt=rt_data["description_pt"],
            description_es=rt_data["description_es"],
            estimated_duration_months=rt_data["estimated_duration_months"],
            competitiveness_level=rt_data["competitiveness_level"],
            typical_cost_usd=rt_data["typical_cost_usd"],
            is_active=True,
            version=1,
        )
        session.add(template)
        await session.flush()
        
        for m_data in rt_data["milestones"]:
            milestone = RouteMilestoneTemplate(
                id=uuid.uuid4(),
                route_template_id=template.id,
                name_en=m_data["name_en"],
                name_pt=m_data["name_pt"],
                name_es=m_data.get("name_es", m_data["name_pt"]),
                description_en=m_data["desc"],
                description_pt=m_data["desc"],
                description_es=m_data["desc"],
                category="preparation",
                display_order=m_data["order"],
                estimated_days=m_data["days"],
                is_required=True,
            )
            session.add(milestone)
    return True

async def _seed_opportunities(session: AsyncSession):
    existing = await session.execute(select(Opportunity).limit(1))
    if existing.scalar():
        return False
    
    for opp in OPPORTUNITIES:
        opportunity = Opportunity(
            id=uuid.uuid4(),
            title=opp["title"],
            description=opp["description"],
            opportunity_type=opp["opportunity_type"],
            status=OpportunityStatus.PUBLISHED,
            organization_name=opp["organization_name"],
            location_country=opp["country"],
            is_featured=True,
        )
        session.add(opportunity)
    return True

async def _seed_interviews(session: AsyncSession):
    existing = await session.execute(select(InterviewQuestion).limit(1))
    if existing.scalar():
        return False
        
    for idx, q in enumerate(INTERVIEW_QUESTIONS):
        question = InterviewQuestion(
            id=uuid.uuid4(),
            question_text_en=q["question_text_en"],
            question_text_pt=q["question_text_pt"],
            question_text_es=q["question_text_es"],
            question_type=q["question_type"],
            difficulty=q["difficulty"],
            is_active=True,
            display_order=idx + 1
        )
        session.add(question)
    return True

async def _seed_prompts(session: AsyncSession):
    existing = await session.execute(select(PromptTemplate).limit(1))
    if existing.scalar():
        return False
        
    for p in AI_PROMPTS:
        prompt = PromptTemplate(
            id=uuid.uuid4(),
            name=p["name"],
            slug=p["slug"],
            category=p["category"],
            system_prompt=p["system_prompt"],
            user_prompt_template=p["user_prompt_template"],
            status=PromptTemplateStatus.ACTIVE,
            version=1,
            default_temperature=0.7,
        )
        session.add(prompt)
    return True

async def _seed_marketplace(session: AsyncSession):
    existing = await session.execute(select(ServiceListing).limit(1))
    if existing.scalar():
        return False
        
    # Get or create admin user for Provider Profile
    admin_user = await session.scalar(select(User).where(User.email == "admin@olcan.compass"))
    if not admin_user:
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@olcan.compass",
            hashed_password=hash_password("Password123"),
            full_name="Olcan Agency",
            role=UserRole.SUPER_ADMIN,
            is_active=True
        )
        session.add(admin_user)
        await session.flush()
        
    provider = await session.scalar(select(ProviderProfile).where(ProviderProfile.user_id == admin_user.id))
    if not provider:
        provider = ProviderProfile(
            id=uuid.uuid4(),
            user_id=admin_user.id,
            headline="Oficial Olcan Services",
            bio="The official Olcan Compass internal agency for application strategy.",
            status=ProviderStatus.APPROVED,
            total_bookings=0
        )
        session.add(provider)
        await session.flush()
        
    for svc in MARKETPLACE_SERVICES:
        listing = ServiceListing(
            id=uuid.uuid4(),
            provider_id=provider.id,
            title=svc["title"],
            service_type=svc["service_type"],
            delivery_method=svc["delivery_method"],
            pricing_type=PricingType.FIXED,
            price_amount=svc["price_amount"],
            price_currency="USD",
            advance_booking_days=2,
            is_active=True
        )
        session.add(listing)
    return True

async def seed_database():
    """Seed the database with comprehensive data."""
    settings = get_settings()
    engine = create_async_engine(settings.database_url, pool_pre_ping=True)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        print("🌱 Starting Seed Data Overhaul...")
        
        did_psych = await _seed_psychology(session)
        if did_psych: print("   ✅ Seeded psychological parameters (6 questions)")
        else: print("   ⏭️  Skipped psychology (already exists)")
        
        did_routes = await _seed_routes(session)
        if did_routes: print("   ✅ Seeded routes (3 templates)")
        else: print("   ⏭️  Skipped routes (already exists)")
        
        did_opps = await _seed_opportunities(session)
        if did_opps: print("   ✅ Seeded opportunities (5 programs)")
        else: print("   ⏭️  Skipped opportunities (already exists)")
        
        did_interviews = await _seed_interviews(session)
        if did_interviews: print("   ✅ Seeded interview questions (4 scenarios)")
        else: print("   ⏭️  Skipped interviews (already exists)")
        
        did_prompts = await _seed_prompts(session)
        if did_prompts: print("   ✅ Seeded AI prompt templates (2 engines)")
        else: print("   ⏭️  Skipped prompts (already exists)")
            
        did_market = await _seed_marketplace(session)
        if did_market: print("   ✅ Seeded marketplace (4 services)")
        else: print("   ⏭️  Skipped marketplace (already exists)")
        
        print("\nNote: 12 Archetypes, 4 Fear Reframes, 3 Subscription Tiers, and 3 Digital Products are currently loaded as constants awaiting schema implementation.")
        
        await session.commit()
        print("\n🎉 Seed data complete!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_database())
