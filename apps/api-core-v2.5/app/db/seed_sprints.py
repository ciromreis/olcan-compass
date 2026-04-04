"""
Seed sprint templates for the Readiness Engine.

Called once at app startup if the sprint_templates table is empty.
Each template targets a specific readiness gap category and includes
pre-built tasks that get cloned into the user's sprint.

PRD §4: "Multi-dimensional readiness scoring, Gap detection engine,
Gap prioritization ranking, Micro-task breakdown for low-discipline users."

Templates are psych-aware: task granularity and guidance adapt to the
user's discipline_score and anxiety_score at sprint creation time.
"""

import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.sprint import SprintTemplate


SEED_TEMPLATES = [
    # ── LANGUAGE GAP ────────────────────────────────────────────────────
    {
        "name": "Sprint de Idioma — Proficiência",
        "description": "Feche a lacuna de idioma necessária para sua candidatura. Inclui estudo, simulados e agendamento de prova.",
        "target_gap_category": "language",
        "target_readiness_threshold": 0.0,
        "duration_days": 30,
        "estimated_effort_hours": 40,
        "default_tasks": [
            {"title": "Fazer teste diagnóstico de nível", "description": "Faça um simulado completo (IELTS/TOEFL/DELF) para saber seu nível atual.", "category": "language", "task_type": "action", "priority": "high", "estimated_minutes": 120},
            {"title": "Criar plano de estudo semanal", "description": "Monte um cronograma realista de estudo: 1h/dia focado em suas fraquezas.", "category": "language", "task_type": "action", "priority": "high", "estimated_minutes": 30},
            {"title": "Praticar listening 30min/dia por 7 dias", "description": "Use podcasts, TED Talks ou séries com legenda no idioma-alvo.", "category": "language", "task_type": "action", "priority": "medium", "estimated_minutes": 210},
            {"title": "Escrever 3 essays de prática", "description": "Escreva redações simulando a seção de writing do exame.", "category": "language", "task_type": "document", "priority": "medium", "estimated_minutes": 180},
            {"title": "Fazer 2 simulados completos cronometrados", "description": "Simule condições reais de prova: tempo, silêncio, sem interrupções.", "category": "language", "task_type": "action", "priority": "high", "estimated_minutes": 360},
            {"title": "Agendar prova oficial", "description": "Reserve data e local para o exame de proficiência.", "category": "language", "task_type": "action", "priority": "critical", "estimated_minutes": 30},
        ],
        "suggested_resources": [
            {"type": "app", "name": "IELTS Prep App", "url": "https://www.ielts.org/"},
            {"type": "website", "name": "ETS TOEFL Practice", "url": "https://www.ets.org/toefl"},
            {"type": "tip", "name": "Dica", "description": "Foque nos 2 skills com menor nota no diagnóstico."},
        ],
    },

    # ── DOCUMENTATION GAP ───────────────────────────────────────────────
    {
        "name": "Sprint de Documentação — Dossiê Completo",
        "description": "Reúna e prepare todos os documentos necessários para candidaturas internacionais.",
        "target_gap_category": "documentation",
        "target_readiness_threshold": 0.0,
        "duration_days": 21,
        "estimated_effort_hours": 25,
        "default_tasks": [
            {"title": "Listar todos os documentos exigidos", "description": "Verifique os requisitos de cada programa e crie um checklist completo.", "category": "documentation", "task_type": "action", "priority": "critical", "estimated_minutes": 60},
            {"title": "Solicitar histórico escolar atualizado", "description": "Peça à sua universidade o histórico oficial com notas.", "category": "documentation", "task_type": "action", "priority": "high", "estimated_minutes": 30},
            {"title": "Providenciar tradução juramentada", "description": "Contrate tradutor juramentado para diploma e histórico.", "category": "documentation", "task_type": "action", "priority": "high", "estimated_minutes": 60},
            {"title": "Apostilar documentos (Haia)", "description": "Apostile diploma e certidões no cartório competente.", "category": "documentation", "task_type": "action", "priority": "high", "estimated_minutes": 120},
            {"title": "Solicitar cartas de recomendação", "description": "Contate 2-3 professores/gestores e envie modelo de carta com deadline.", "category": "documentation", "task_type": "action", "priority": "high", "estimated_minutes": 60},
            {"title": "Organizar portfólio digital", "description": "Compile projetos, publicações e certificados em PDF organizado.", "category": "documentation", "task_type": "document", "priority": "medium", "estimated_minutes": 120},
            {"title": "Revisar e finalizar dossiê", "description": "Revise a completude, formatação e ordem de todos os documentos.", "category": "documentation", "task_type": "review", "priority": "high", "estimated_minutes": 90},
        ],
        "suggested_resources": [
            {"type": "tip", "name": "Dica", "description": "Peça as cartas de recomendação com pelo menos 3 semanas de antecedência."},
            {"type": "tip", "name": "Importante", "description": "Guarde cópias digitais de tudo em nuvem segura."},
        ],
    },

    # ── FINANCIAL GAP ───────────────────────────────────────────────────
    {
        "name": "Sprint Financeiro — Planejamento e Comprovação",
        "description": "Organize suas finanças, calcule custos reais e prepare comprovantes financeiros exigidos.",
        "target_gap_category": "financial",
        "target_readiness_threshold": 0.0,
        "duration_days": 14,
        "estimated_effort_hours": 15,
        "default_tasks": [
            {"title": "Calcular custo de vida mensal no destino", "description": "Pesquise moradia, alimentação, transporte e seguro saúde no país-alvo.", "category": "finance", "task_type": "action", "priority": "high", "estimated_minutes": 90},
            {"title": "Mapear fontes de financiamento", "description": "Liste bolsas, economias pessoais, apoio familiar e possíveis trabalhos.", "category": "finance", "task_type": "action", "priority": "high", "estimated_minutes": 60},
            {"title": "Preparar comprovante financeiro", "description": "Extratos bancários dos últimos 3-6 meses, carta do banco ou sponsor.", "category": "finance", "task_type": "document", "priority": "critical", "estimated_minutes": 60},
            {"title": "Pesquisar opções de câmbio e transferência", "description": "Compare Wise, Remessa Online, banco tradicional para envio de dinheiro.", "category": "finance", "task_type": "action", "priority": "medium", "estimated_minutes": 45},
            {"title": "Criar planilha de orçamento para 12 meses", "description": "Monte projeção mês a mês incluindo matrícula, moradia e imprevistos.", "category": "finance", "task_type": "document", "priority": "high", "estimated_minutes": 60},
        ],
        "suggested_resources": [
            {"type": "website", "name": "Numbeo — Custo de vida", "url": "https://www.numbeo.com/cost-of-living/"},
            {"type": "website", "name": "Wise — Transferências", "url": "https://wise.com/"},
        ],
    },

    # ── NARRATIVE GAP (Confidence/Clarity) ──────────────────────────────
    {
        "name": "Sprint de Narrativa — Clareza e Autenticidade",
        "description": "Construa uma narrativa pessoal forte e autêntica para suas candidaturas. Trabalhe storytelling e posicionamento.",
        "target_gap_category": "narrative",
        "target_readiness_threshold": 0.0,
        "duration_days": 14,
        "estimated_effort_hours": 20,
        "default_tasks": [
            {"title": "Exercício de autoconhecimento: linha do tempo", "description": "Desenhe sua trajetória: marcos, decisões, pivôs. Identifique padrões.", "category": "narrative", "task_type": "action", "priority": "high", "estimated_minutes": 60},
            {"title": "Identificar 3 experiências transformadoras", "description": "Escolha situações que revelam seus valores, resiliência e crescimento.", "category": "narrative", "task_type": "action", "priority": "high", "estimated_minutes": 45},
            {"title": "Escrever primeiro rascunho do Personal Statement", "description": "Sem censura — escreva tudo que vier. A edição vem depois.", "category": "narrative", "task_type": "document", "priority": "critical", "estimated_minutes": 120},
            {"title": "Revisar com a fórmula 3+1+1", "description": "3 fatos + 1 motivação + 1 prova concreta. Elimine clichês.", "category": "narrative", "task_type": "review", "priority": "high", "estimated_minutes": 60},
            {"title": "Pedir feedback de 2 pessoas", "description": "Compartilhe com alguém da área e alguém de fora. Ambas perspectivas importam.", "category": "narrative", "task_type": "action", "priority": "medium", "estimated_minutes": 30},
            {"title": "Versão final polida", "description": "Incorpore feedback, verifique word count, tom e autenticidade.", "category": "narrative", "task_type": "document", "priority": "critical", "estimated_minutes": 90},
        ],
        "suggested_resources": [
            {"type": "tip", "name": "Dica", "description": "Use o módulo Narrativas do Compass para versionar e analisar seus textos."},
            {"type": "tip", "name": "Evite", "description": "Clichês como 'desde criança eu sonhava' ou 'quero mudar o mundo'."},
        ],
    },

    # ── INTERVIEW PREP GAP ──────────────────────────────────────────────
    {
        "name": "Sprint de Entrevista — Preparação Intensiva",
        "description": "Prepare-se para entrevistas de seleção com prática estruturada, feedback e controle emocional.",
        "target_gap_category": "interview",
        "target_readiness_threshold": 0.0,
        "duration_days": 10,
        "estimated_effort_hours": 15,
        "default_tasks": [
            {"title": "Estudar as 10 perguntas mais comuns", "description": "Use o banco de perguntas do Compass e prepare respostas estruturadas.", "category": "interview", "task_type": "action", "priority": "high", "estimated_minutes": 90},
            {"title": "Gravar 3 respostas e assistir", "description": "Grave-se respondendo e analise: postura, clareza, ritmo, filler words.", "category": "interview", "task_type": "action", "priority": "high", "estimated_minutes": 60},
            {"title": "Fazer simulação completa (mock interview)", "description": "Use o simulador do Compass ou peça a alguém para entrevistá-lo.", "category": "interview", "task_type": "action", "priority": "critical", "estimated_minutes": 45},
            {"title": "Pesquisar a instituição/empresa", "description": "Valores, projetos recentes, perfil dos entrevistadores se possível.", "category": "interview", "task_type": "action", "priority": "high", "estimated_minutes": 60},
            {"title": "Preparar suas perguntas para o painel", "description": "3-5 perguntas inteligentes que mostrem pesquisa e interesse genuíno.", "category": "interview", "task_type": "document", "priority": "medium", "estimated_minutes": 30},
            {"title": "Treinar controle de ansiedade", "description": "Técnica 4-7-8 de respiração, power posing, visualização positiva.", "category": "interview", "task_type": "action", "priority": "medium", "estimated_minutes": 30},
        ],
        "suggested_resources": [
            {"type": "tip", "name": "Estrutura STAR", "description": "Situation, Task, Action, Result — use para qualquer pergunta comportamental."},
            {"type": "tip", "name": "Dica de ouro", "description": "Entrevistadores buscam autenticidade, não perfeição."},
        ],
    },

    # ── VISA & BUREAUCRACY GAP ──────────────────────────────────────────
    {
        "name": "Sprint Burocrático — Visto e Legalização",
        "description": "Navegue o processo de visto com organização: documentos, agendamentos, follow-ups.",
        "target_gap_category": "visa",
        "target_readiness_threshold": 0.0,
        "duration_days": 21,
        "estimated_effort_hours": 12,
        "default_tasks": [
            {"title": "Identificar tipo de visto correto", "description": "Pesquise no site oficial do consulado/embaixada o visto adequado.", "category": "visa", "task_type": "action", "priority": "critical", "estimated_minutes": 60},
            {"title": "Listar documentos exigidos para o visto", "description": "Crie checklist baseado nos requisitos oficiais do consulado.", "category": "visa", "task_type": "action", "priority": "high", "estimated_minutes": 30},
            {"title": "Agendar entrevista consular", "description": "Reserve horário com antecedência — agendas lotam rápido.", "category": "visa", "task_type": "action", "priority": "high", "estimated_minutes": 15},
            {"title": "Preparar carta convite / aceitação", "description": "Solicite carta oficial da instituição de destino se aplicável.", "category": "visa", "task_type": "document", "priority": "high", "estimated_minutes": 30},
            {"title": "Contratar seguro saúde internacional", "description": "Compare opções e contrate o seguro exigido pelo programa/visto.", "category": "visa", "task_type": "action", "priority": "medium", "estimated_minutes": 60},
            {"title": "Preparar para a entrevista consular", "description": "Revise propósito da viagem, plano de retorno e documentos de suporte.", "category": "visa", "task_type": "action", "priority": "high", "estimated_minutes": 45},
        ],
        "suggested_resources": [
            {"type": "tip", "name": "Importante", "description": "Nunca minta em entrevista consular. Seja direto e objetivo."},
            {"type": "tip", "name": "Dica", "description": "Leve cópias organizadas de TODOS os documentos, mesmo os não obrigatórios."},
        ],
    },

    # ── CONFIDENCE GAP (Psych-targeted) ─────────────────────────────────
    {
        "name": "Sprint de Confiança — Construindo Base Sólida",
        "description": "Para quem tem ansiedade alta ou confiança baixa: exercícios progressivos de autovalidação e exposição gradual.",
        "target_gap_category": "confidence",
        "target_readiness_threshold": 0.0,
        "duration_days": 14,
        "estimated_effort_hours": 10,
        "default_tasks": [
            {"title": "Listar 10 conquistas dos últimos 3 anos", "description": "Qualquer coisa: profissional, acadêmica, pessoal. Reconheça o caminho percorrido.", "category": "confidence", "task_type": "action", "priority": "high", "estimated_minutes": 30},
            {"title": "Escrever carta para si mesmo do futuro", "description": "O que a versão do futuro diria para você agora? Seja generoso(a).", "category": "confidence", "task_type": "document", "priority": "medium", "estimated_minutes": 30},
            {"title": "Fazer 1 coisa desconfortável por dia (5 dias)", "description": "Falar com estranho, apresentar ideia, pedir feedback. Sair da zona de conforto.", "category": "confidence", "task_type": "action", "priority": "medium", "estimated_minutes": 150},
            {"title": "Mapear síndrome do impostor", "description": "Identifique pensamentos automáticos negativos e questione cada um com fatos.", "category": "confidence", "task_type": "action", "priority": "high", "estimated_minutes": 45},
            {"title": "Criar 'highlight reel' pessoal", "description": "Compile elogios, feedbacks positivos e conquistas em um documento visível.", "category": "confidence", "task_type": "document", "priority": "medium", "estimated_minutes": 30},
        ],
        "suggested_resources": [
            {"type": "tip", "name": "Ciência", "description": "Exposição gradual é a técnica #1 da psicologia para vencer medo. Funciona."},
            {"type": "tip", "name": "Lembrete", "description": "Confiança não é ausência de medo. É agir apesar dele."},
        ],
    },

    # ── DISCIPLINE GAP (Psych-targeted) ─────────────────────────────────
    {
        "name": "Sprint de Disciplina — Construindo Hábitos",
        "description": "Para quem tem dificuldade em manter consistência: micro-hábitos, accountability e sistema de recompensas.",
        "target_gap_category": "discipline",
        "target_readiness_threshold": 0.0,
        "duration_days": 14,
        "estimated_effort_hours": 8,
        "default_tasks": [
            {"title": "Definir 1 micro-hábito diário (5 min)", "description": "Escolha algo tiny: ler 1 página, escrever 1 parágrafo, fazer 1 exercício.", "category": "discipline", "task_type": "action", "priority": "high", "estimated_minutes": 5},
            {"title": "Configurar sistema de tracking", "description": "Use app (Habitica, Streaks) ou papel. O importante é visualizar a sequência.", "category": "discipline", "task_type": "action", "priority": "high", "estimated_minutes": 15},
            {"title": "Estabelecer horário fixo para trabalhar no projeto", "description": "Mesmo horário, mesmo local. Seu cérebro vai associar contexto = ação.", "category": "discipline", "task_type": "action", "priority": "high", "estimated_minutes": 15},
            {"title": "Manter streak de 7 dias consecutivos", "description": "7 dias sem quebrar a sequência. Se quebrar, recomeçar sem culpa.", "category": "discipline", "task_type": "action", "priority": "critical", "estimated_minutes": 35},
            {"title": "Celebrar completando o sprint", "description": "Defina uma recompensa significativa para quando completar todas as tarefas.", "category": "discipline", "task_type": "action", "priority": "low", "estimated_minutes": 15},
        ],
        "suggested_resources": [
            {"type": "tip", "name": "Atomic Habits", "description": "Não mude comportamentos. Mude identidade: 'Eu sou alguém que estuda todo dia.'"},
            {"type": "tip", "name": "Regra dos 2 minutos", "description": "Se leva menos de 2 minutos, faça agora. Sem pensar."},
        ],
    },
]


async def seed_sprint_templates(db: AsyncSession) -> None:
    """Insert seed sprint templates if the table is empty."""
    result = await db.execute(
        select(func.count(SprintTemplate.id))
    )
    count = result.scalar() or 0

    if count > 0:
        return

    print(f"[seed] Inserting {len(SEED_TEMPLATES)} sprint templates...")

    for tmpl in SEED_TEMPLATES:
        template = SprintTemplate(
            id=uuid.uuid4(),
            name=tmpl["name"],
            description=tmpl["description"],
            target_gap_category=tmpl["target_gap_category"],
            target_readiness_threshold=tmpl["target_readiness_threshold"],
            duration_days=tmpl["duration_days"],
            estimated_effort_hours=tmpl["estimated_effort_hours"],
            default_tasks=tmpl["default_tasks"],
            suggested_resources=tmpl["suggested_resources"],
            is_active=True,
        )
        db.add(template)

    await db.commit()
    print(f"[seed] ✓ {len(SEED_TEMPLATES)} sprint templates inserted")
