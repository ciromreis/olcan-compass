"""
Seed sample opportunities for the Application Management Engine.

Called once at app startup if the opportunities table is empty.
Provides a realistic catalog of scholarships, jobs, exchanges, grants
and fellowships so users have something to browse, watch and apply to.

PRD §7: "Opportunity CRUD, Competitiveness index modeling,
Multi-application tracking, Deadline monitoring."
"""

import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.application import Opportunity, OpportunityType, OpportunityStatus


def _deadline(months_ahead: int) -> datetime:
    """Helper: deadline N months from now."""
    return datetime.now(timezone.utc) + timedelta(days=30 * months_ahead)


SEED_OPPORTUNITIES = [
    # ── SCHOLARSHIPS ────────────────────────────────────────────────────
    {
        "title": "Chevening Scholarships — UK Government",
        "description": "Bolsas totalmente financiadas do governo britânico para mestrado de 1 ano em qualquer universidade do Reino Unido. Cobre tuition, passagem, moradia e estipêndio mensal.",
        "opportunity_type": OpportunityType.SCHOLARSHIP,
        "organization_name": "UK Foreign, Commonwealth & Development Office",
        "organization_country": "Reino Unido",
        "organization_website": "https://www.chevening.org/",
        "location_type": "onsite",
        "location_country": "Reino Unido",
        "application_deadline": _deadline(4),
        "duration_months": 12,
        "funding_amount": 40000.0,
        "funding_currency": "GBP",
        "funding_details": "Tuition completa + £1,347/mês estipêndio + passagem aérea + seguro saúde",
        "required_documents": ["cv", "motivation_letter", "recommendation_letter", "transcript", "language_certificate"],
        "eligibility_criteria": "Cidadão de país elegível Chevening, 2+ anos experiência profissional, bacharelado completo, IELTS 6.5+",
        "required_languages": ["english"],
        "application_url": "https://www.chevening.org/scholarships/",
        "relevant_fields": ["all"],
        "education_level": "master",
        "is_featured": True,
    },
    {
        "title": "Erasmus Mundus Joint Master Degrees",
        "description": "Programa europeu que oferece bolsas para mestrados conjuntos em 2+ universidades europeias. Experiência multicultural garantida.",
        "opportunity_type": OpportunityType.SCHOLARSHIP,
        "organization_name": "European Commission",
        "organization_country": "União Europeia",
        "organization_website": "https://erasmus-plus.ec.europa.eu/",
        "location_type": "onsite",
        "location_country": "Europa (múltiplos países)",
        "application_deadline": _deadline(5),
        "duration_months": 24,
        "funding_amount": 49000.0,
        "funding_currency": "EUR",
        "funding_details": "€1,400/mês + tuition + viagem + seguro + instalação",
        "required_documents": ["cv", "motivation_letter", "recommendation_letter", "transcript", "language_certificate"],
        "eligibility_criteria": "Bacharelado completo, candidatos de países parceiros têm prioridade",
        "required_languages": ["english"],
        "application_url": "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters",
        "relevant_fields": ["engineering", "sciences", "humanities", "social_sciences"],
        "education_level": "master",
        "is_featured": True,
    },
    {
        "title": "DAAD — Bolsas para Mestrado na Alemanha",
        "description": "O DAAD oferece diversas bolsas para mestrado na Alemanha em programas em inglês e alemão.",
        "opportunity_type": OpportunityType.SCHOLARSHIP,
        "organization_name": "DAAD — Deutscher Akademischer Austauschdienst",
        "organization_country": "Alemanha",
        "organization_website": "https://www.daad.de/",
        "location_type": "onsite",
        "location_country": "Alemanha",
        "application_deadline": _deadline(6),
        "duration_months": 24,
        "funding_amount": 934.0,
        "funding_currency": "EUR",
        "funding_details": "€934/mês + seguro saúde + passagem aérea",
        "required_documents": ["cv", "motivation_letter", "recommendation_letter", "transcript"],
        "eligibility_criteria": "Bacharelado com boas notas, max 6 anos desde a graduação",
        "required_languages": ["english", "german"],
        "application_url": "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
        "relevant_fields": ["engineering", "sciences", "economics", "law"],
        "education_level": "master",
        "is_featured": False,
    },
    {
        "title": "Fulbright — Bolsas para EUA",
        "description": "Programa bilateral de bolsas para mestrado e doutorado nos Estados Unidos. Alto prestígio e rede de alumni global.",
        "opportunity_type": OpportunityType.SCHOLARSHIP,
        "organization_name": "Fulbright Commission",
        "organization_country": "Estados Unidos",
        "organization_website": "https://fulbright.org.br/",
        "location_type": "onsite",
        "location_country": "Estados Unidos",
        "application_deadline": _deadline(3),
        "duration_months": 24,
        "funding_amount": 50000.0,
        "funding_currency": "USD",
        "funding_details": "Tuition parcial/total + estipêndio + passagem + seguro",
        "required_documents": ["cv", "motivation_letter", "recommendation_letter", "transcript", "language_certificate", "research_proposal"],
        "eligibility_criteria": "Cidadão brasileiro, bacharelado completo, TOEFL iBT 80+",
        "required_languages": ["english"],
        "application_url": "https://fulbright.org.br/bolsas/",
        "relevant_fields": ["all"],
        "education_level": "master",
        "is_featured": True,
    },

    # ── JOBS ────────────────────────────────────────────────────────────
    {
        "title": "Software Engineer — Visa Sponsorship (Berlim)",
        "description": "Vaga para engenheiro de software em startup de tecnologia em Berlim. Visto Blue Card patrocinado.",
        "opportunity_type": OpportunityType.JOB,
        "organization_name": "Tech Startup Berlin",
        "organization_country": "Alemanha",
        "location_type": "hybrid",
        "location_country": "Alemanha",
        "location_city": "Berlim",
        "application_deadline": _deadline(2),
        "funding_amount": 65000.0,
        "funding_currency": "EUR",
        "funding_details": "€65,000/ano + Blue Card + relocation package",
        "required_documents": ["cv", "portfolio"],
        "eligibility_criteria": "3+ anos experiência, proficiente em Python/TypeScript",
        "required_languages": ["english"],
        "relevant_fields": ["technology", "engineering"],
        "education_level": "bachelor",
        "is_featured": False,
    },
    {
        "title": "Marketing Manager — Lisboa, Portugal",
        "description": "Posição de marketing digital em empresa tech portuguesa. Visto D7 ou Tech Visa suportado.",
        "opportunity_type": OpportunityType.JOB,
        "organization_name": "Lisbon Tech Hub",
        "organization_country": "Portugal",
        "location_type": "onsite",
        "location_country": "Portugal",
        "location_city": "Lisboa",
        "application_deadline": _deadline(1),
        "funding_amount": 35000.0,
        "funding_currency": "EUR",
        "funding_details": "€35,000/ano + benefícios + apoio com visto",
        "required_documents": ["cv", "portfolio"],
        "eligibility_criteria": "2+ anos experiência em marketing digital, fluência em inglês",
        "required_languages": ["english", "portuguese"],
        "relevant_fields": ["marketing", "business"],
        "education_level": "bachelor",
        "is_featured": False,
    },

    # ── RESEARCH POSITIONS ──────────────────────────────────────────────
    {
        "title": "PhD Position — Machine Learning (ETH Zurich)",
        "description": "Posição de doutorado totalmente financiada em Machine Learning no ETH Zurich, Suíça.",
        "opportunity_type": OpportunityType.RESEARCH_POSITION,
        "organization_name": "ETH Zurich",
        "organization_country": "Suíça",
        "organization_website": "https://ethz.ch/",
        "location_type": "onsite",
        "location_country": "Suíça",
        "location_city": "Zurique",
        "application_deadline": _deadline(3),
        "duration_months": 48,
        "funding_amount": 50000.0,
        "funding_currency": "CHF",
        "funding_details": "CHF 50,000/ano + benefícios",
        "required_documents": ["cv", "motivation_letter", "recommendation_letter", "transcript", "research_proposal"],
        "eligibility_criteria": "Mestrado em CS/ML/Stats, publicações são diferencial",
        "required_languages": ["english"],
        "relevant_fields": ["computer_science", "artificial_intelligence", "statistics"],
        "education_level": "phd",
        "is_featured": True,
    },
    {
        "title": "Post-Doc — Ciências Sociais (Sciences Po Paris)",
        "description": "Posição de pós-doutorado em ciências sociais na Sciences Po Paris com foco em mobilidade internacional.",
        "opportunity_type": OpportunityType.RESEARCH_POSITION,
        "organization_name": "Sciences Po Paris",
        "organization_country": "França",
        "organization_website": "https://www.sciencespo.fr/",
        "location_type": "onsite",
        "location_country": "França",
        "location_city": "Paris",
        "application_deadline": _deadline(4),
        "duration_months": 24,
        "funding_amount": 3200.0,
        "funding_currency": "EUR",
        "funding_details": "€3,200/mês + seguro saúde",
        "required_documents": ["cv", "research_proposal", "recommendation_letter"],
        "eligibility_criteria": "Doutorado concluído nos últimos 5 anos, publicações na área",
        "required_languages": ["english", "french"],
        "relevant_fields": ["social_sciences", "political_science", "sociology"],
        "education_level": "phd",
        "is_featured": False,
    },

    # ── EXCHANGE PROGRAMS ───────────────────────────────────────────────
    {
        "title": "Programa de Intercâmbio BRAFITEC — França",
        "description": "Intercâmbio bilateral entre Brasil e França para estudantes de engenharia. 1-2 semestres em universidade francesa.",
        "opportunity_type": OpportunityType.EXCHANGE_PROGRAM,
        "organization_name": "CAPES / Campus France",
        "organization_country": "França",
        "location_type": "onsite",
        "location_country": "França",
        "application_deadline": _deadline(5),
        "duration_months": 12,
        "funding_amount": 870.0,
        "funding_currency": "EUR",
        "funding_details": "€870/mês + passagem + seguro",
        "required_documents": ["cv", "transcript", "motivation_letter", "language_certificate"],
        "eligibility_criteria": "Estudante de engenharia em universidade brasileira conveniada",
        "required_languages": ["french"],
        "relevant_fields": ["engineering"],
        "education_level": "bachelor",
        "is_featured": False,
    },

    # ── GRANTS ──────────────────────────────────────────────────────────
    {
        "title": "FAPESP — Bolsa de Pesquisa no Exterior (BEPE)",
        "description": "Estágio de pesquisa no exterior para doutorandos e pós-doutorandos vinculados a projetos FAPESP.",
        "opportunity_type": OpportunityType.GRANT,
        "organization_name": "FAPESP",
        "organization_country": "Brasil",
        "organization_website": "https://fapesp.br/bepe",
        "location_type": "onsite",
        "location_country": "Qualquer país",
        "application_deadline": _deadline(2),
        "duration_months": 12,
        "funding_amount": 2800.0,
        "funding_currency": "USD",
        "funding_details": "US$ 2,800/mês + passagem + seguro + instalação",
        "required_documents": ["cv", "research_proposal", "recommendation_letter"],
        "eligibility_criteria": "Bolsista FAPESP ativo, carta de aceite da instituição anfitriã",
        "required_languages": ["english"],
        "relevant_fields": ["all"],
        "education_level": "phd",
        "is_featured": False,
    },

    # ── FELLOWSHIPS ─────────────────────────────────────────────────────
    {
        "title": "Obama Foundation Scholars — Columbia University",
        "description": "Fellowship de 1 ano na Columbia University para líderes emergentes com foco em mudança social.",
        "opportunity_type": OpportunityType.FELLOWSHIP,
        "organization_name": "Obama Foundation",
        "organization_country": "Estados Unidos",
        "organization_website": "https://www.obama.org/scholars/",
        "location_type": "onsite",
        "location_country": "Estados Unidos",
        "location_city": "Nova York",
        "application_deadline": _deadline(6),
        "duration_months": 12,
        "funding_amount": 0.0,
        "funding_currency": "USD",
        "funding_details": "Custos totalmente cobertos: tuition, moradia, passagem, estipêndio",
        "required_documents": ["cv", "motivation_letter", "recommendation_letter"],
        "eligibility_criteria": "Liderança comprovada em causas sociais, 25-35 anos, fluência em inglês",
        "required_languages": ["english"],
        "relevant_fields": ["social_impact", "leadership", "public_policy"],
        "education_level": "bachelor",
        "is_featured": True,
    },

    # ── INTERNSHIPS ─────────────────────────────────────────────────────
    {
        "title": "Estágio Internacional — ONU (Genebra)",
        "description": "Programa de estágio nas Nações Unidas em Genebra. Oportunidade de trabalhar em projetos globais.",
        "opportunity_type": OpportunityType.INTERNSHIP,
        "organization_name": "United Nations",
        "organization_country": "Suíça",
        "organization_website": "https://careers.un.org/",
        "location_type": "onsite",
        "location_country": "Suíça",
        "location_city": "Genebra",
        "application_deadline": _deadline(3),
        "duration_months": 6,
        "funding_amount": 1500.0,
        "funding_currency": "CHF",
        "funding_details": "CHF 1,500/mês estipêndio (quando disponível)",
        "required_documents": ["cv", "motivation_letter", "transcript"],
        "eligibility_criteria": "Estudante de graduação ou mestrado, fluência em inglês + outro idioma ONU",
        "required_languages": ["english", "french"],
        "relevant_fields": ["international_relations", "law", "economics", "human_rights"],
        "education_level": "bachelor",
        "is_featured": False,
    },
]


async def seed_opportunities(db: AsyncSession) -> None:
    """Insert seed opportunities if the table is empty."""
    result = await db.execute(
        select(func.count(Opportunity.id))
    )
    count = result.scalar() or 0

    if count > 0:
        return

    print(f"[seed] Inserting {len(SEED_OPPORTUNITIES)} opportunities...")

    now = datetime.now(timezone.utc)

    for opp_data in SEED_OPPORTUNITIES:
        opp = Opportunity(
            id=uuid.uuid4(),
            title=opp_data["title"],
            description=opp_data["description"],
            opportunity_type=opp_data["opportunity_type"],
            status=OpportunityStatus.PUBLISHED,
            organization_name=opp_data.get("organization_name"),
            organization_country=opp_data.get("organization_country"),
            organization_website=opp_data.get("organization_website"),
            location_type=opp_data.get("location_type", "onsite"),
            location_country=opp_data.get("location_country"),
            location_city=opp_data.get("location_city"),
            application_deadline=opp_data.get("application_deadline"),
            duration_months=opp_data.get("duration_months"),
            funding_amount=opp_data.get("funding_amount"),
            funding_currency=opp_data.get("funding_currency"),
            funding_details=opp_data.get("funding_details"),
            required_documents=opp_data.get("required_documents", []),
            eligibility_criteria=opp_data.get("eligibility_criteria"),
            required_languages=opp_data.get("required_languages", []),
            application_url=opp_data.get("application_url"),
            relevant_fields=opp_data.get("relevant_fields", []),
            education_level=opp_data.get("education_level"),
            is_featured=opp_data.get("is_featured", False),
            published_at=now,
        )
        db.add(opp)

    await db.commit()
    print(f"[seed] ✓ {len(SEED_OPPORTUNITIES)} opportunities inserted")
