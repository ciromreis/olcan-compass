"""Seed marketplace with demo providers and services."""

import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models.user import User, UserRole
from app.db.models.marketplace import (
    ProviderProfile,
    ProviderStatus,
    ServiceListing,
    ServiceType,
    ServiceDeliveryMethod,
    PricingType,
)
from app.core.security.password import hash_password


SEED_PROVIDERS = [
    {
        "email": "ana.provider@olcan.demo",
        "full_name": "Ana Carolina Mendes",
        "headline": "Consultora de Admissões – Top 20 EUA",
        "bio": "Ex-avaliadora de admissões em Columbia e NYU. 8+ anos ajudando estudantes brasileiros a conquistar vagas em programas de mestrado e doutorado nos EUA e Europa.",
        "current_title": "Consultora de Admissões Internacionais",
        "current_organization": "Olcan Advisors",
        "years_experience": 8,
        "specializations": ["graduate_admissions", "stem_fields", "scholarship_strategy"],
        "target_regions": ["USA", "UK", "Germany"],
        "languages_spoken": ["pt", "en", "es"],
        "timezone": "America/Sao_Paulo",
        "rating_average": 4.8,
        "review_count": 47,
        "services": [
            {
                "title": "Revisão de Statement of Purpose",
                "description": "Revisão detalhada do seu SoP com feedback estruturado, sugestões de reescrita e alinhamento com o programa alvo.",
                "service_type": "sop_review",
                "delivery_method": "document_review",
                "duration_minutes": None,
                "pricing_type": "fixed",
                "price_amount": 150.00,
            },
            {
                "title": "Estratégia de Candidatura (1h)",
                "description": "Sessão ao vivo para definir sua lista de programas, cronograma e estratégia de aplicação personalizada.",
                "service_type": "application_strategy",
                "delivery_method": "video_call",
                "duration_minutes": 60,
                "pricing_type": "fixed",
                "price_amount": 200.00,
            },
            {
                "title": "Mock Interview – Admissões",
                "description": "Simulação realista de entrevista de admissão com feedback detalhado sobre conteúdo, postura e comunicação.",
                "service_type": "interview_prep",
                "delivery_method": "video_call",
                "duration_minutes": 45,
                "pricing_type": "fixed",
                "price_amount": 120.00,
            },
        ],
    },
    {
        "email": "marcos.provider@olcan.demo",
        "full_name": "Marcos Oliveira Santos",
        "headline": "Mentor de Carreira & CV Internacional",
        "bio": "Especialista em transição de carreira internacional. Ajudei 200+ profissionais a reposicionar seus CVs e perfis LinkedIn para mercados internacionais. Background em RH global na Deloitte.",
        "current_title": "Career Coach Senior",
        "current_organization": "Global Careers Brazil",
        "years_experience": 12,
        "specializations": ["cv_optimization", "career_transition", "linkedin_strategy"],
        "target_regions": ["USA", "Canada", "Netherlands", "Portugal"],
        "languages_spoken": ["pt", "en"],
        "timezone": "America/Sao_Paulo",
        "rating_average": 4.6,
        "review_count": 89,
        "services": [
            {
                "title": "Revisão de CV Internacional",
                "description": "Transformação completa do seu CV para padrão internacional, com foco no mercado alvo e ATS-friendly.",
                "service_type": "cv_review",
                "delivery_method": "document_review",
                "duration_minutes": None,
                "pricing_type": "fixed",
                "price_amount": 80.00,
            },
            {
                "title": "Mentoria de Carreira (pacote 4 sessões)",
                "description": "Pacote de 4 sessões de 45min para planejamento de carreira internacional: posicionamento, networking, estratégia de aplicação.",
                "service_type": "mentoring",
                "delivery_method": "video_call",
                "duration_minutes": 45,
                "pricing_type": "package",
                "price_amount": 350.00,
            },
        ],
    },
    {
        "email": "lucia.provider@olcan.demo",
        "full_name": "Lúcia Fernanda Costa",
        "headline": "Preparação IELTS/TOEFL & Academic English",
        "bio": "Professora certificada Cambridge CELTA com 6 anos de experiência em preparação para IELTS (8.5) e TOEFL (118). Foco em academic writing e speaking para entrevistas.",
        "current_title": "Language Coach",
        "current_organization": "English for Mobility",
        "years_experience": 6,
        "specializations": ["ielts_prep", "toefl_prep", "academic_writing"],
        "target_regions": ["UK", "Australia", "Canada", "USA"],
        "languages_spoken": ["pt", "en"],
        "timezone": "Europe/Lisbon",
        "rating_average": 4.9,
        "review_count": 63,
        "services": [
            {
                "title": "Preparação IELTS Intensiva (1h)",
                "description": "Sessão focada na seção que você mais precisa: Writing, Speaking, Reading ou Listening. Simulados e correção detalhada.",
                "service_type": "language_coaching",
                "delivery_method": "video_call",
                "duration_minutes": 60,
                "pricing_type": "fixed",
                "price_amount": 65.00,
            },
            {
                "title": "Revisão de Essay Acadêmico",
                "description": "Revisão de até 1000 palavras de escrita acadêmica em inglês, com correções, sugestões e comentários didáticos.",
                "service_type": "essay_review",
                "delivery_method": "document_review",
                "duration_minutes": None,
                "pricing_type": "fixed",
                "price_amount": 45.00,
            },
        ],
    },
    {
        "email": "rafael.provider@olcan.demo",
        "full_name": "Rafael Augusto Lima",
        "headline": "Orientação de Pesquisa & Propostas Acadêmicas",
        "bio": "PhD em Engenharia pela TU Munich. Revisor de periódicos internacionais. Ajudo pesquisadores brasileiros a estruturar propostas competitivas para bolsas e programas de doutorado.",
        "current_title": "Pesquisador Pós-Doutoral",
        "current_organization": "TU Munich / Freelance Advisor",
        "years_experience": 10,
        "specializations": ["research_proposals", "phd_applications", "stem_research"],
        "target_regions": ["Germany", "Switzerland", "Netherlands", "Sweden"],
        "languages_spoken": ["pt", "en", "de"],
        "timezone": "Europe/Berlin",
        "rating_average": 4.7,
        "review_count": 31,
        "services": [
            {
                "title": "Revisão de Proposta de Pesquisa",
                "description": "Feedback detalhado sobre metodologia, revisão de literatura, viabilidade e alinhamento com linhas de pesquisa do programa alvo.",
                "service_type": "research_proposal",
                "delivery_method": "document_review",
                "duration_minutes": None,
                "pricing_type": "fixed",
                "price_amount": 180.00,
            },
            {
                "title": "Mentoria PhD – Como Encontrar Orientador",
                "description": "Sessão estratégica sobre como identificar, abordar e convencer potenciais orientadores no exterior.",
                "service_type": "mentoring",
                "delivery_method": "video_call",
                "duration_minutes": 60,
                "pricing_type": "fixed",
                "price_amount": 100.00,
            },
        ],
    },
    {
        "email": "patricia.provider@olcan.demo",
        "full_name": "Patrícia Almeida Rocha",
        "headline": "Consultoria de Visto & Planejamento Financeiro",
        "bio": "Especialista em vistos de estudo e trabalho para Europa e América do Norte. Também oriento sobre planejamento financeiro para estudantes internacionais, incluindo bolsas e financiamentos.",
        "current_title": "Consultora de Imigração",
        "current_organization": "Visa Path Brazil",
        "years_experience": 9,
        "specializations": ["visa_applications", "financial_planning", "immigration_law"],
        "target_regions": ["Canada", "Portugal", "Ireland", "USA", "UK"],
        "languages_spoken": ["pt", "en", "fr"],
        "timezone": "America/Sao_Paulo",
        "rating_average": 4.5,
        "review_count": 55,
        "services": [
            {
                "title": "Consultoria de Visto (1h)",
                "description": "Análise do seu perfil, orientação sobre tipo de visto ideal, documentação necessária e timeline.",
                "service_type": "visa_guidance",
                "delivery_method": "video_call",
                "duration_minutes": 60,
                "pricing_type": "fixed",
                "price_amount": 130.00,
            },
            {
                "title": "Planejamento Financeiro para Mobilidade",
                "description": "Análise completa de custos, estratégias de financiamento, bolsas disponíveis e planejamento de orçamento para seu período no exterior.",
                "service_type": "financial_planning",
                "delivery_method": "video_call",
                "duration_minutes": 60,
                "pricing_type": "fixed",
                "price_amount": 110.00,
            },
        ],
    },
]


async def seed_marketplace(db: AsyncSession) -> None:
    """Seed marketplace with demo providers and services if empty."""
    result = await db.execute(select(func.count(ProviderProfile.id)))
    count = result.scalar() or 0
    if count > 0:
        return

    datetime.now(timezone.utc)
    hashed = hash_password("DemoProvider123!")

    for p in SEED_PROVIDERS:
        # Create provider user
        user = User(
            id=uuid.uuid4(),
            email=p["email"],
            hashed_password=hashed,
            full_name=p["full_name"],
            is_active=True,
            is_verified=True,
            role=UserRole.PROVIDER,
            language="pt",
            timezone=p.get("timezone", "UTC"),
        )
        db.add(user)
        await db.flush()

        # Create provider profile
        profile = ProviderProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            headline=p["headline"],
            bio=p["bio"],
            current_title=p.get("current_title"),
            current_organization=p.get("current_organization"),
            years_experience=p.get("years_experience"),
            specializations=p.get("specializations", []),
            target_regions=p.get("target_regions", []),
            languages_spoken=p.get("languages_spoken", []),
            timezone=p.get("timezone"),
            status=ProviderStatus.APPROVED,
            rating_average=p.get("rating_average", 0.0),
            review_count=p.get("review_count", 0),
            total_bookings=p.get("review_count", 0) + 10,
            completed_bookings=p.get("review_count", 0) + 5,
            response_rate=0.95,
        )
        db.add(profile)
        await db.flush()

        # Create services
        for svc in p.get("services", []):
            service = ServiceListing(
                id=uuid.uuid4(),
                provider_id=profile.id,
                title=svc["title"],
                description=svc.get("description"),
                service_type=ServiceType(svc["service_type"]),
                delivery_method=ServiceDeliveryMethod(svc["delivery_method"]),
                duration_minutes=svc.get("duration_minutes"),
                pricing_type=PricingType(svc.get("pricing_type", "fixed")),
                price_amount=svc.get("price_amount", 100.00),
                price_currency="USD",
                is_active=True,
            )
            db.add(service)

    await db.commit()
    print(f"[SEED] Marketplace: {len(SEED_PROVIDERS)} providers + services seeded.")
