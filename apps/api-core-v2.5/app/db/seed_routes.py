"""
Seed initial route templates and their milestones.

Called once at app startup if the route_templates table is empty.
Covers the main mobility pathways for international students/professionals.
"""

import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.route import (
    RouteTemplate,
    RouteMilestoneTemplate,
    RouteType,
    MilestoneCategory,
)


SEED_TEMPLATES = [
    {
        "route_type": RouteType.SCHOLARSHIP,
        "name_pt": "Bolsa de Estudos — Mestrado",
        "name_en": "Scholarship — Master's Degree",
        "name_es": "Beca — Maestría",
        "description_pt": "Caminho estruturado para conseguir uma bolsa de mestrado no exterior, incluindo pesquisa, aplicação e visto.",
        "description_en": "Structured path to secure a master's scholarship abroad, including research, application and visa.",
        "description_es": "Camino estructurado para obtener una beca de maestría en el exterior, incluyendo investigación, solicitud y visa.",
        "estimated_duration_months": 12,
        "competitiveness_level": "high",
        "typical_cost_usd": 2000,
        "milestones": [
            {"name_pt": "Pesquisar programas e bolsas", "name_en": "Research programs and scholarships", "name_es": "Investigar programas y becas", "description_pt": "Identificar universidades, programas e prazos de bolsas disponíveis.", "description_en": "Identify universities, programs and available scholarship deadlines.", "description_es": "Identificar universidades, programas y plazos de becas disponibles.", "category": MilestoneCategory.APPLICATION, "estimated_days": 30},
            {"name_pt": "Preparar teste de idioma", "name_en": "Prepare language test", "name_es": "Preparar examen de idioma", "description_pt": "Estudar e agendar IELTS, TOEFL ou equivalente.", "description_en": "Study and schedule IELTS, TOEFL or equivalent.", "description_es": "Estudiar y programar IELTS, TOEFL o equivalente.", "category": MilestoneCategory.LANGUAGE, "estimated_days": 60},
            {"name_pt": "Reunir documentação acadêmica", "name_en": "Gather academic documents", "name_es": "Reunir documentación académica", "description_pt": "Diploma, histórico, traduções juramentadas e apostilamento.", "description_en": "Diploma, transcript, certified translations and apostille.", "description_es": "Diploma, expediente, traducciones juradas y apostilla.", "category": MilestoneCategory.DOCUMENTATION, "estimated_days": 30},
            {"name_pt": "Escrever cartas de motivação", "name_en": "Write motivation letters", "name_es": "Escribir cartas de motivación", "description_pt": "Redigir Personal Statement e cartas para cada programa.", "description_en": "Write Personal Statement and letters for each program.", "description_es": "Redactar Personal Statement y cartas para cada programa.", "category": MilestoneCategory.APPLICATION, "estimated_days": 30},
            {"name_pt": "Submeter candidaturas", "name_en": "Submit applications", "name_es": "Enviar solicitudes", "description_pt": "Enviar aplicações dentro dos prazos de cada universidade.", "description_en": "Submit applications within each university's deadline.", "description_es": "Enviar solicitudes dentro de los plazos de cada universidad.", "category": MilestoneCategory.APPLICATION, "estimated_days": 14},
            {"name_pt": "Planejar finanças", "name_en": "Plan finances", "name_es": "Planificar finanzas", "description_pt": "Calcular custos de vida, preparar comprovantes financeiros.", "description_en": "Calculate living costs, prepare financial statements.", "description_es": "Calcular costos de vida, preparar comprobantes financieros.", "category": MilestoneCategory.FINANCE, "estimated_days": 30},
            {"name_pt": "Solicitar visto", "name_en": "Apply for visa", "name_es": "Solicitar visa", "description_pt": "Reunir documentos e solicitar o visto de estudante.", "description_en": "Gather documents and apply for student visa.", "description_es": "Reunir documentos y solicitar la visa de estudiante.", "category": MilestoneCategory.VISA, "estimated_days": 45},
            {"name_pt": "Logística de mudança", "name_en": "Moving logistics", "name_es": "Logística de mudanza", "description_pt": "Passagens, moradia, seguro saúde e conta bancária.", "description_en": "Flights, housing, health insurance and bank account.", "description_es": "Pasajes, vivienda, seguro de salud y cuenta bancaria.", "category": MilestoneCategory.LOGISTICS, "estimated_days": 30},
        ],
    },
    {
        "route_type": RouteType.JOB_RELOCATON,
        "name_pt": "Emprego no Exterior — Relocação",
        "name_en": "Job Abroad — Relocation",
        "name_es": "Empleo en el Exterior — Reubicación",
        "description_pt": "Do currículo internacional até a mudança: prepare-se para trabalhar em outro país com visto patrocinado.",
        "description_en": "From international CV to relocation: prepare to work in another country with sponsored visa.",
        "description_es": "Del CV internacional a la reubicación: prepárate para trabajar en otro país con visa patrocinada.",
        "estimated_duration_months": 8,
        "competitiveness_level": "medium",
        "typical_cost_usd": 3000,
        "milestones": [
            {"name_pt": "Atualizar CV e LinkedIn internacional", "name_en": "Update international CV and LinkedIn", "name_es": "Actualizar CV y LinkedIn internacional", "description_pt": "Adaptar currículo para padrões internacionais e otimizar LinkedIn.", "description_en": "Adapt resume to international standards and optimize LinkedIn.", "description_es": "Adaptar CV a estándares internacionales y optimizar LinkedIn.", "category": MilestoneCategory.DOCUMENTATION, "estimated_days": 14},
            {"name_pt": "Mapear empresas e vagas-alvo", "name_en": "Map target companies and positions", "name_es": "Mapear empresas y puestos objetivo", "description_pt": "Identificar empresas que patrocinam visto e posições compatíveis.", "description_en": "Identify companies that sponsor visas and compatible positions.", "description_es": "Identificar empresas que patrocinan visa y posiciones compatibles.", "category": MilestoneCategory.APPLICATION, "estimated_days": 21},
            {"name_pt": "Praticar entrevistas em inglês", "name_en": "Practice interviews in English", "name_es": "Practicar entrevistas en inglés", "description_pt": "Preparar respostas para perguntas comuns e fazer simulações.", "description_en": "Prepare answers for common questions and do mock interviews.", "description_es": "Preparar respuestas para preguntas comunes y hacer simulaciones.", "category": MilestoneCategory.PREPARATION, "estimated_days": 30},
            {"name_pt": "Aplicar para vagas", "name_en": "Apply for positions", "name_es": "Aplicar a puestos", "description_pt": "Enviar candidaturas de forma estratégica com acompanhamento.", "description_en": "Submit applications strategically with follow-up.", "description_es": "Enviar solicitudes de forma estratégica con seguimiento.", "category": MilestoneCategory.APPLICATION, "estimated_days": 45},
            {"name_pt": "Negociar oferta e pacote de relocação", "name_en": "Negotiate offer and relocation package", "name_es": "Negociar oferta y paquete de reubicación", "description_pt": "Avaliar contrato, benefícios e suporte de relocação.", "description_en": "Evaluate contract, benefits and relocation support.", "description_es": "Evaluar contrato, beneficios y apoyo de reubicación.", "category": MilestoneCategory.FINANCE, "estimated_days": 14},
            {"name_pt": "Solicitar visto de trabalho", "name_en": "Apply for work visa", "name_es": "Solicitar visa de trabajo", "description_pt": "Preparar documentação e solicitar o visto de trabalho.", "description_en": "Prepare documentation and apply for work visa.", "description_es": "Preparar documentación y solicitar la visa de trabajo.", "category": MilestoneCategory.VISA, "estimated_days": 60},
        ],
    },
    {
        "route_type": RouteType.EXCHANGE,
        "name_pt": "Intercâmbio Universitário",
        "name_en": "University Exchange",
        "name_es": "Intercambio Universitario",
        "description_pt": "Planejamento completo para intercâmbio acadêmico de 1 semestre ou 1 ano.",
        "description_en": "Complete planning for a 1-semester or 1-year academic exchange.",
        "description_es": "Planificación completa para intercambio académico de 1 semestre o 1 año.",
        "estimated_duration_months": 6,
        "competitiveness_level": "low",
        "typical_cost_usd": 5000,
        "milestones": [
            {"name_pt": "Verificar convênios da universidade", "name_en": "Check university partnerships", "name_es": "Verificar convenios de la universidad", "description_pt": "Consultar escritório internacional sobre universidades parceiras.", "description_en": "Check international office for partner universities.", "description_es": "Consultar oficina internacional sobre universidades asociadas.", "category": MilestoneCategory.APPLICATION, "estimated_days": 14},
            {"name_pt": "Escolher destino e disciplinas", "name_en": "Choose destination and courses", "name_es": "Elegir destino y materias", "description_pt": "Pesquisar grades, validação de créditos e custo de vida.", "description_en": "Research curricula, credit validation and cost of living.", "description_es": "Investigar planes de estudio, validación de créditos y costo de vida.", "category": MilestoneCategory.PREPARATION, "estimated_days": 21},
            {"name_pt": "Preparar documentação", "name_en": "Prepare documentation", "name_es": "Preparar documentación", "description_pt": "Carta de aceite, histórico, seguro e comprovantes financeiros.", "description_en": "Acceptance letter, transcript, insurance and financial proof.", "description_es": "Carta de aceptación, expediente, seguro y comprobantes financieros.", "category": MilestoneCategory.DOCUMENTATION, "estimated_days": 30},
            {"name_pt": "Solicitar visto de estudante", "name_en": "Apply for student visa", "name_es": "Solicitar visa de estudiante", "description_pt": "Agendar entrevista no consulado e reunir documentos.", "description_en": "Schedule consulate interview and gather documents.", "description_es": "Programar entrevista en el consulado y reunir documentos.", "category": MilestoneCategory.VISA, "estimated_days": 45},
            {"name_pt": "Organizar viagem e moradia", "name_en": "Organize travel and housing", "name_es": "Organizar viaje y vivienda", "description_pt": "Reservar passagens, moradia estudantil e abertura de conta.", "description_en": "Book flights, student housing and open bank account.", "description_es": "Reservar pasajes, vivienda estudiantil y abrir cuenta bancaria.", "category": MilestoneCategory.LOGISTICS, "estimated_days": 21},
        ],
    },
    {
        "route_type": RouteType.RESEARCH,
        "name_pt": "Pesquisa Acadêmica — Doutorado / Pós-Doc",
        "name_en": "Academic Research — PhD / Post-Doc",
        "name_es": "Investigación Académica — Doctorado / Post-Doc",
        "description_pt": "Da escolha do orientador até a defesa: planeje sua trajetória de pesquisa internacional.",
        "description_en": "From advisor selection to defense: plan your international research trajectory.",
        "description_es": "Desde la elección del director hasta la defensa: planifica tu trayectoria de investigación internacional.",
        "estimated_duration_months": 18,
        "competitiveness_level": "high",
        "typical_cost_usd": 1500,
        "milestones": [
            {"name_pt": "Identificar orientadores e grupos de pesquisa", "name_en": "Identify advisors and research groups", "name_es": "Identificar directores y grupos de investigación", "description_pt": "Pesquisar publicações, linhas de pesquisa e enviar e-mails de contato.", "description_en": "Research publications, research lines and send contact emails.", "description_es": "Investigar publicaciones, líneas de investigación y enviar correos de contacto.", "category": MilestoneCategory.APPLICATION, "estimated_days": 45},
            {"name_pt": "Escrever proposta de pesquisa", "name_en": "Write research proposal", "name_es": "Escribir propuesta de investigación", "description_pt": "Elaborar projeto de pesquisa sólido com revisão de literatura.", "description_en": "Develop solid research project with literature review.", "description_es": "Elaborar proyecto de investigación sólido con revisión de literatura.", "category": MilestoneCategory.APPLICATION, "estimated_days": 60},
            {"name_pt": "Aplicar para bolsas de pesquisa", "name_en": "Apply for research grants", "name_es": "Aplicar a becas de investigación", "description_pt": "CAPES, CNPq, Marie Curie, Fulbright e bolsas institucionais.", "description_en": "CAPES, CNPq, Marie Curie, Fulbright and institutional grants.", "description_es": "CAPES, CNPq, Marie Curie, Fulbright y becas institucionales.", "category": MilestoneCategory.FINANCE, "estimated_days": 30},
            {"name_pt": "Reunir documentação acadêmica", "name_en": "Gather academic documents", "name_es": "Reunir documentación académica", "description_pt": "Diplomas, históricos, publicações e cartas de recomendação.", "description_en": "Diplomas, transcripts, publications and recommendation letters.", "description_es": "Diplomas, expedientes, publicaciones y cartas de recomendación.", "category": MilestoneCategory.DOCUMENTATION, "estimated_days": 30},
            {"name_pt": "Solicitar visto de pesquisa", "name_en": "Apply for research visa", "name_es": "Solicitar visa de investigación", "description_pt": "Visto específico para pesquisador/doutorando.", "description_en": "Specific visa for researcher/PhD student.", "description_es": "Visa específica para investigador/doctorando.", "category": MilestoneCategory.VISA, "estimated_days": 45},
        ],
    },
    {
        "route_type": RouteType.STARTUP_VISA,
        "name_pt": "Visto de Startup / Empreendedor",
        "name_en": "Startup / Entrepreneur Visa",
        "name_es": "Visa de Startup / Emprendedor",
        "description_pt": "Rota para empreendedores que querem abrir ou expandir negócio no exterior com visto específico.",
        "description_en": "Route for entrepreneurs who want to open or expand business abroad with specific visa.",
        "description_es": "Ruta para emprendedores que quieren abrir o expandir negocio en el exterior con visa específica.",
        "estimated_duration_months": 10,
        "competitiveness_level": "high",
        "typical_cost_usd": 15000,
        "milestones": [
            {"name_pt": "Validar ideia de negócio no mercado-alvo", "name_en": "Validate business idea in target market", "name_es": "Validar idea de negocio en el mercado objetivo", "description_pt": "Pesquisa de mercado, concorrentes e viabilidade no país de destino.", "description_en": "Market research, competitors and viability in target country.", "description_es": "Investigación de mercado, competidores y viabilidad en el país de destino.", "category": MilestoneCategory.PREPARATION, "estimated_days": 30},
            {"name_pt": "Preparar plano de negócios", "name_en": "Prepare business plan", "name_es": "Preparar plan de negocios", "description_pt": "Plano de negócios adaptado aos requisitos do programa de visto.", "description_en": "Business plan adapted to visa program requirements.", "description_es": "Plan de negocios adaptado a los requisitos del programa de visa.", "category": MilestoneCategory.DOCUMENTATION, "estimated_days": 30},
            {"name_pt": "Garantir investimento ou reserva financeira", "name_en": "Secure investment or financial reserves", "name_es": "Asegurar inversión o reserva financiera", "description_pt": "Comprovar capital mínimo exigido pelo programa.", "description_en": "Prove minimum capital required by program.", "description_es": "Comprobar capital mínimo exigido por el programa.", "category": MilestoneCategory.FINANCE, "estimated_days": 45},
            {"name_pt": "Aplicar para o programa de visto", "name_en": "Apply for visa program", "name_es": "Aplicar al programa de visa", "description_pt": "Submeter candidatura ao programa de startup visa do país.", "description_en": "Submit application to country's startup visa program.", "description_es": "Enviar solicitud al programa de startup visa del país.", "category": MilestoneCategory.VISA, "estimated_days": 60},
        ],
    },
    {
        "route_type": RouteType.DIGITAL_NOMAD,
        "name_pt": "Nômade Digital — Trabalho Remoto",
        "name_en": "Digital Nomad — Remote Work",
        "name_es": "Nómada Digital — Trabajo Remoto",
        "description_pt": "Planeje sua transição para trabalhar remotamente de outro país com visto de nômade digital.",
        "description_en": "Plan your transition to work remotely from another country with digital nomad visa.",
        "description_es": "Planifica tu transición para trabajar remotamente desde otro país con visa de nómada digital.",
        "estimated_duration_months": 4,
        "competitiveness_level": "low",
        "typical_cost_usd": 3000,
        "milestones": [
            {"name_pt": "Escolher destino e tipo de visto", "name_en": "Choose destination and visa type", "name_es": "Elegir destino y tipo de visa", "description_pt": "Comparar programas de nômade digital em diferentes países.", "description_en": "Compare digital nomad programs in different countries.", "description_es": "Comparar programas de nómada digital en diferentes países.", "category": MilestoneCategory.PREPARATION, "estimated_days": 14},
            {"name_pt": "Verificar requisitos de renda", "name_en": "Verify income requirements", "name_es": "Verificar requisitos de ingresos", "description_pt": "Comprovar renda mínima e contrato de trabalho remoto.", "description_en": "Prove minimum income and remote work contract.", "description_es": "Comprobar ingreso mínimo y contrato de trabajo remoto.", "category": MilestoneCategory.FINANCE, "estimated_days": 14},
            {"name_pt": "Solicitar visto de nômade digital", "name_en": "Apply for digital nomad visa", "name_es": "Solicitar visa de nómada digital", "description_pt": "Submeter aplicação com documentos financeiros e de trabalho.", "description_en": "Submit application with financial and work documents.", "description_es": "Enviar solicitud con documentos financieros y de trabajo.", "category": MilestoneCategory.VISA, "estimated_days": 30},
            {"name_pt": "Organizar logística", "name_en": "Organize logistics", "name_es": "Organizar logística", "description_pt": "Moradia, coworking, seguro saúde internacional e conta bancária.", "description_en": "Housing, coworking, international health insurance and bank account.", "description_es": "Vivienda, coworking, seguro de salud internacional y cuenta bancaria.", "category": MilestoneCategory.LOGISTICS, "estimated_days": 21},
        ],
    },
    {
        "route_type": RouteType.INVESTOR_VISA,
        "name_pt": "Visto de Investidor — Golden Visa",
        "name_en": "Investor Visa — Golden Visa",
        "name_es": "Visa de Inversor — Golden Visa",
        "description_pt": "Rota para obter residência via investimento imobiliário ou empresarial no exterior.",
        "description_en": "Route to obtain residency through real estate or business investment abroad.",
        "description_es": "Ruta para obtener residencia mediante inversión inmobiliaria o empresarial en el exterior.",
        "estimated_duration_months": 6,
        "competitiveness_level": "medium",
        "typical_cost_usd": 250000,
        "milestones": [
            {"name_pt": "Pesquisar programas de golden visa", "name_en": "Research golden visa programs", "name_es": "Investigar programas de golden visa", "description_pt": "Comparar requisitos, valores e benefícios de diferentes países.", "description_en": "Compare requirements, amounts and benefits of different countries.", "description_es": "Comparar requisitos, montos y beneficios de diferentes países.", "category": MilestoneCategory.PREPARATION, "estimated_days": 21},
            {"name_pt": "Consultar assessoria jurídica", "name_en": "Consult legal advisory", "name_es": "Consultar asesoría jurídica", "description_pt": "Contratar advogado especializado em imigração por investimento.", "description_en": "Hire lawyer specialized in investment immigration.", "description_es": "Contratar abogado especializado en inmigración por inversión.", "category": MilestoneCategory.DOCUMENTATION, "estimated_days": 14},
            {"name_pt": "Preparar investimento", "name_en": "Prepare investment", "name_es": "Preparar inversión", "description_pt": "Transferir fundos, selecionar imóvel ou fundo de investimento.", "description_en": "Transfer funds, select property or investment fund.", "description_es": "Transferir fondos, seleccionar inmueble o fondo de inversión.", "category": MilestoneCategory.FINANCE, "estimated_days": 45},
            {"name_pt": "Solicitar visto de investidor", "name_en": "Apply for investor visa", "name_es": "Solicitar visa de inversor", "description_pt": "Submeter aplicação com comprovantes de investimento.", "description_en": "Submit application with investment proof.", "description_es": "Enviar solicitud con comprobantes de inversión.", "category": MilestoneCategory.VISA, "estimated_days": 60},
        ],
    },
]


async def seed_route_templates(db: AsyncSession) -> None:
    """Insert seed route templates and milestones if the table is empty."""
    result = await db.execute(
        select(func.count(RouteTemplate.id))
    )
    count = result.scalar() or 0

    if count > 0:
        return  # Already seeded

    print(f"[seed] Inserting {len(SEED_TEMPLATES)} route templates...")

    for tmpl_data in SEED_TEMPLATES:
        milestones_data = tmpl_data.pop("milestones")

        template = RouteTemplate(
            id=uuid.uuid4(),
            route_type=tmpl_data["route_type"],
            name_pt=tmpl_data["name_pt"],
            name_en=tmpl_data["name_en"],
            name_es=tmpl_data["name_es"],
            description_pt=tmpl_data["description_pt"],
            description_en=tmpl_data["description_en"],
            description_es=tmpl_data["description_es"],
            estimated_duration_months=tmpl_data["estimated_duration_months"],
            competitiveness_level=tmpl_data["competitiveness_level"],
            typical_cost_usd=tmpl_data["typical_cost_usd"],
            is_active=True,
            version=1,
        )
        db.add(template)
        await db.flush()

        for i, m in enumerate(milestones_data):
            milestone = RouteMilestoneTemplate(
                id=uuid.uuid4(),
                route_template_id=template.id,
                name_pt=m["name_pt"],
                name_en=m["name_en"],
                name_es=m["name_es"],
                description_pt=m["description_pt"],
                description_en=m["description_en"],
                description_es=m["description_es"],
                category=m["category"],
                display_order=i,
                estimated_days=m["estimated_days"],
                prerequisites=[],
                required_evidence=[],
                is_required=True,
            )
            db.add(milestone)

    await db.commit()
    print(f"[seed] ✓ {len(SEED_TEMPLATES)} route templates with milestones inserted")
