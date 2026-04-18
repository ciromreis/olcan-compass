"""Seed script: Marketplace providers for Olcan Compass.

Creates 5 realistic provider profiles (Users + ProviderProfiles + ServiceListings)
with status=APPROVED so they appear immediately in the marketplace.

Run from the api-core-v2.5 directory:
    python scripts/seed_marketplace_providers.py

Requires DATABASE_URL in the environment (PostgreSQL).
"""

import asyncio
import sys
import os
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password as get_password_hash
from app.db.models.user import User
from app.db.models.marketplace import (
    ProviderProfile,
    ProviderCredential,
    ServiceListing,
    ProviderStatus,
    ServiceType,
    ServiceDeliveryMethod,
    PricingType,
)


# ---------------------------------------------------------------------------
# Provider definitions
# ---------------------------------------------------------------------------

PROVIDERS = [
    {
        "user": {
            "email": "ana.silva.compass@olcan.com",
            "full_name": "Ana Silva",
            "is_active": True,
            "is_verified": True,
        },
        "profile": {
            "headline": "Consultora de Carreiras Internacionais — 8 anos ajudando profissionais a se posicionarem globalmente",
            "bio": (
                "Brasileira radicada em Lisboa. Passei pela transição de carreira para o mercado europeu e hoje ajudo "
                "outros profissionais a construírem sua narrativa e conquistarem posições internacionais. "
                "Especialista em CVs para o mercado europeu e americano, preparação para entrevistas e estratégia de candidatura."
            ),
            "current_title": "Consultora Sênior de Carreira",
            "current_organization": "Freelance / Olcan Marketplace",
            "years_experience": 8,
            "specializations": ["graduate_admissions", "career_transition", "cv_optimization", "personal_branding"],
            "target_regions": ["Portugal", "Espanha", "Reino Unido", "Alemanha", "Brasil"],
            "target_institutions": ["Universidade de Lisboa", "INSEAD", "London Business School"],
            "languages_spoken": ["pt", "en", "es"],
            "status": ProviderStatus.APPROVED,
            "rating_average": 4.9,
            "review_count": 23,
            "total_bookings": 31,
            "completed_bookings": 28,
            "response_rate": 0.97,
            "response_time_hours": 3.5,
            "timezone": "Europe/Lisbon",
            "education": [
                {"degree": "MBA", "field": "Gestão Internacional", "institution": "Católica Lisbon School of Business"},
                {"degree": "Bacharelado", "field": "Administração", "institution": "FGV São Paulo"},
            ],
        },
        "credentials": [
            {
                "credential_type": "certificate",
                "title": "Certified Professional Career Coach (CPCC)",
                "issuing_organization": "International Coaching Federation",
                "issue_date": date(2019, 6, 1),
                "verification_status": "verified",
            }
        ],
        "services": [
            {
                "title": "Revisão Completa de CV — Mercado Europeu",
                "description": (
                    "Análise aprofundada do seu CV com foco no mercado europeu. "
                    "Inclui reformatação, reescrita de bullets com impacto quantificado, "
                    "e feedback escrito detalhado com versão revisada em 48h."
                ),
                "service_type": ServiceType.CV_REVIEW,
                "delivery_method": ServiceDeliveryMethod.DOCUMENT_REVIEW,
                "duration_minutes": None,
                "pricing_type": PricingType.FIXED,
                "price_amount": "249.00",
                "price_currency": "BRL",
                "includes": [
                    "Revisão completa do CV",
                    "Reformatação para padrão europeu",
                    "Feedback escrito detalhado",
                    "Versão revisada do CV",
                    "1 rodada de revisão após entrega",
                ],
                "deliverables": ["CV revisado em formato DOCX e PDF", "Relatório de feedback escrito"],
                "prerequisites": ["CV atual em qualquer formato", "Descrição da vaga-alvo ou área de interesse"],
                "is_featured": True,
                "advance_booking_days": 1,
            },
            {
                "title": "Sessão de Estratégia de Candidatura — 60 min",
                "description": (
                    "Videochamada 1:1 para mapear sua situação atual, definir objetivos de carreira "
                    "e construir um plano de ação para as próximas candidaturas."
                ),
                "service_type": ServiceType.APPLICATION_STRATEGY,
                "delivery_method": ServiceDeliveryMethod.VIDEO_CALL,
                "duration_minutes": 60,
                "pricing_type": PricingType.FIXED,
                "price_amount": "199.00",
                "price_currency": "BRL",
                "includes": [
                    "Sessão 1:1 de 60 minutos",
                    "Diagnóstico de perfil e objetivos",
                    "Plano de ação por escrito",
                    "Gravação da sessão (opcional)",
                ],
                "deliverables": ["Plano de ação em PDF", "Acesso à gravação por 30 dias"],
                "prerequisites": ["CV atualizado", "Lista de vagas ou programas de interesse"],
                "advance_booking_days": 2,
            },
        ],
    },
    {
        "user": {
            "email": "carlos.mendes.compass@olcan.com",
            "full_name": "Carlos Mendes",
            "is_active": True,
            "is_verified": True,
        },
        "profile": {
            "headline": "Advogado de Imigração — Vistos de estudo, trabalho e residência permanente",
            "bio": (
                "Advogado especializado em direito migratório com foco em candidatos brasileiros e lusófonos. "
                "Atuei em mais de 400 processos de visto nos últimos 6 anos — vistos de estudante, trabalho qualificado "
                "(Alemanha, Canadá, Portugal), reunificação familiar e naturalização. "
                "Membro da OAB e registrado na Ordem dos Advogados de Portugal."
            ),
            "current_title": "Advogado Especializado em Direito Migratório",
            "current_organization": "Mendes & Associados — Direito Internacional",
            "years_experience": 10,
            "specializations": ["visa_application", "residency_permits", "work_authorization", "student_visa", "permanent_residency"],
            "target_regions": ["Portugal", "Alemanha", "Canadá", "Estados Unidos", "Reino Unido"],
            "target_institutions": [],
            "languages_spoken": ["pt", "en", "de"],
            "status": ProviderStatus.APPROVED,
            "rating_average": 4.8,
            "review_count": 41,
            "total_bookings": 58,
            "completed_bookings": 54,
            "response_rate": 0.92,
            "response_time_hours": 8.0,
            "timezone": "Europe/Lisbon",
            "education": [
                {"degree": "LLM", "field": "Direito Internacional Privado", "institution": "Universidade de Coimbra"},
                {"degree": "Bacharelado em Direito", "field": "Direito", "institution": "PUC-SP"},
            ],
        },
        "credentials": [
            {
                "credential_type": "license",
                "title": "OAB — Ordem dos Advogados do Brasil",
                "issuing_organization": "OAB",
                "issue_date": date(2015, 3, 1),
                "verification_status": "verified",
            },
            {
                "credential_type": "license",
                "title": "Ordem dos Advogados de Portugal",
                "issuing_organization": "OA Portugal",
                "issue_date": date(2018, 9, 1),
                "verification_status": "verified",
            },
        ],
        "services": [
            {
                "title": "Consultoria de Visto — Diagnóstico Inicial (30 min)",
                "description": (
                    "Sessão de triagem para avaliar sua situação, identificar o visto adequado "
                    "e mapear os documentos necessários. Ideal antes de iniciar qualquer processo."
                ),
                "service_type": ServiceType.VISA_GUIDANCE,
                "delivery_method": ServiceDeliveryMethod.VIDEO_CALL,
                "duration_minutes": 30,
                "pricing_type": PricingType.FIXED,
                "price_amount": "149.00",
                "price_currency": "BRL",
                "includes": [
                    "Análise do seu perfil migratório",
                    "Identificação do visto mais adequado",
                    "Checklist personalizado de documentos",
                    "Orientação sobre próximos passos",
                ],
                "deliverables": ["Checklist de documentos por email", "Resumo dos próximos passos"],
                "prerequisites": ["Passaporte válido", "Breve descrição do objetivo (estudo, trabalho ou residência)"],
                "is_featured": True,
                "advance_booking_days": 1,
            },
            {
                "title": "Revisão Completa de Processo de Visto",
                "description": (
                    "Acompanhamento completo da montagem do processo: revisão de cada documento, "
                    "tradução juramentada se necessário, e preenchimento do formulário consular."
                ),
                "service_type": ServiceType.VISA_GUIDANCE,
                "delivery_method": ServiceDeliveryMethod.DOCUMENT_REVIEW,
                "duration_minutes": None,
                "pricing_type": PricingType.FIXED,
                "price_amount": "890.00",
                "price_currency": "BRL",
                "includes": [
                    "Revisão de todos os documentos",
                    "Preenchimento do formulário consular",
                    "Carta de intenção personalizada",
                    "Suporte até a entrevista consular",
                    "Revisão ilimitada de documentos",
                ],
                "deliverables": ["Processo completo montado", "Carta de intenção redigida"],
                "prerequisites": ["Documentos pessoais digitalizados", "Comprovante de vínculo (emprego, matrícula, etc.)"],
                "advance_booking_days": 3,
            },
        ],
    },
    {
        "user": {
            "email": "priya.nair.compass@olcan.com",
            "full_name": "Priya Nair",
            "is_active": True,
            "is_verified": True,
        },
        "profile": {
            "headline": "Mentora Acadêmica — PhD MIT, especialista em candidaturas para programas de pós-graduação nos EUA e Europa",
            "bio": (
                "Doutora em Ciência da Computação pelo MIT, passei pelo processo seletivo das mais competitivas "
                "universidades americanas e europeias. Hoje ajudo candidatos a construírem dossiês que se destacam: "
                "Statement of Purpose, Research Proposal, e estratégia geral de candidatura para mestrado e doutorado."
            ),
            "current_title": "Pesquisadora Sênior / Mentora Acadêmica",
            "current_organization": "MIT CSAIL / Olcan Marketplace",
            "years_experience": 7,
            "specializations": ["graduate_admissions", "stem_fields", "sop_writing", "research_proposal", "scholarship_applications"],
            "target_regions": ["Estados Unidos", "Reino Unido", "Canadá", "Alemanha", "Holanda"],
            "target_institutions": ["MIT", "Stanford", "Harvard", "ETH Zurich", "UCL", "Oxford", "Cambridge", "Carnegie Mellon"],
            "languages_spoken": ["en", "pt", "hi"],
            "status": ProviderStatus.APPROVED,
            "rating_average": 5.0,
            "review_count": 17,
            "total_bookings": 22,
            "completed_bookings": 21,
            "response_rate": 0.95,
            "response_time_hours": 12.0,
            "timezone": "America/New_York",
            "education": [
                {"degree": "PhD", "field": "Computer Science", "institution": "MIT"},
                {"degree": "MSc", "field": "Computer Science", "institution": "IIT Bombay"},
            ],
        },
        "credentials": [
            {
                "credential_type": "degree",
                "title": "PhD em Ciência da Computação",
                "issuing_organization": "Massachusetts Institute of Technology (MIT)",
                "issue_date": date(2020, 6, 1),
                "verification_status": "verified",
            }
        ],
        "services": [
            {
                "title": "Revisão de Statement of Purpose — Pós-Graduação",
                "description": (
                    "Feedback detalhado no seu SOP/Personal Statement para programas de mestrado e doutorado. "
                    "Análise de estrutura, narrativa, clareza de objetivos e alinhamento com o programa. "
                    "Até 2 rodadas de revisão incluídas."
                ),
                "service_type": ServiceType.SOP_REVIEW,
                "delivery_method": ServiceDeliveryMethod.DOCUMENT_REVIEW,
                "duration_minutes": None,
                "pricing_type": PricingType.FIXED,
                "price_amount": "329.00",
                "price_currency": "BRL",
                "includes": [
                    "Feedback escrito detalhado (2-3 páginas)",
                    "Comentários inline no documento",
                    "2 rodadas de revisão",
                    "Chamada de 20 min para dúvidas",
                ],
                "deliverables": ["Documento com comentários", "Relatório de feedback", "Versão revisada sugerida"],
                "prerequisites": ["Draft do SOP", "Descrição do programa-alvo e por que o escolheu"],
                "is_featured": True,
                "advance_booking_days": 2,
            },
            {
                "title": "Revisão de Research Proposal",
                "description": (
                    "Para candidatos a doutorado: revisão completa da proposta de pesquisa com foco em "
                    "viabilidade, clareza do gap de pesquisa, metodologia e alinhamento com o grupo do orientador."
                ),
                "service_type": ServiceType.RESEARCH_PROPOSAL,
                "delivery_method": ServiceDeliveryMethod.DOCUMENT_REVIEW,
                "duration_minutes": None,
                "pricing_type": PricingType.FIXED,
                "price_amount": "449.00",
                "price_currency": "BRL",
                "includes": [
                    "Revisão completa da proposta (até 3.000 palavras)",
                    "Análise de viabilidade",
                    "Sugestão de referências relevantes",
                    "2 rodadas de revisão",
                    "Sessão de feedback por videochamada (30 min)",
                ],
                "deliverables": ["Proposta com comentários", "Feedback estruturado", "Lista de referências sugeridas"],
                "prerequisites": ["Draft da proposta de pesquisa", "Link do grupo de pesquisa do orientador-alvo"],
                "advance_booking_days": 3,
            },
        ],
    },
    {
        "user": {
            "email": "joao.ferreira.compass@olcan.com",
            "full_name": "João Ferreira",
            "is_active": True,
            "is_verified": True,
        },
        "profile": {
            "headline": "Coach de Inglês Profissional — TOEFL, IELTS e comunicação acadêmica/corporativa",
            "bio": (
                "Professor de inglês certificado Cambridge com 12 anos de experiência. "
                "Especializado em profissionais e estudantes que precisam de inglês para fins específicos: "
                "provas de proficiência (TOEFL, IELTS), comunicação corporativa internacional e escrita acadêmica. "
                "Mais de 200 alunos preparados, com taxa de aprovação acima de 90% nas metas de nota."
            ),
            "current_title": "Professor e Coach de Inglês",
            "current_organization": "Freelance / Olcan Marketplace",
            "years_experience": 12,
            "specializations": ["toefl_prep", "ielts_prep", "academic_writing", "business_english", "speaking_fluency"],
            "target_regions": ["Global"],
            "target_institutions": [],
            "languages_spoken": ["pt", "en", "es"],
            "status": ProviderStatus.APPROVED,
            "rating_average": 4.7,
            "review_count": 38,
            "total_bookings": 52,
            "completed_bookings": 49,
            "response_rate": 0.98,
            "response_time_hours": 2.0,
            "timezone": "America/Sao_Paulo",
            "education": [
                {"degree": "Licenciatura", "field": "Letras — Inglês e Português", "institution": "UNICAMP"},
                {"degree": "Certificação", "field": "Cambridge CELTA", "institution": "Cambridge Assessment English"},
            ],
        },
        "credentials": [
            {
                "credential_type": "certificate",
                "title": "Cambridge CELTA — Certificate in English Language Teaching",
                "issuing_organization": "Cambridge Assessment English",
                "issue_date": date(2013, 2, 1),
                "verification_status": "verified",
            }
        ],
        "services": [
            {
                "title": "Aula de Inglês — Preparação TOEFL/IELTS (60 min)",
                "description": (
                    "Aula individual focada em uma das seções da prova (Reading, Listening, Speaking ou Writing). "
                    "Inclui material de prática e feedback personalizado."
                ),
                "service_type": ServiceType.LANGUAGE_COACHING,
                "delivery_method": ServiceDeliveryMethod.VIDEO_CALL,
                "duration_minutes": 60,
                "pricing_type": PricingType.FIXED,
                "price_amount": "129.00",
                "price_currency": "BRL",
                "includes": [
                    "Aula 1:1 de 60 minutos",
                    "Material de prática customizado",
                    "Feedback escrito após a aula",
                    "Gravação disponível por 7 dias",
                ],
                "deliverables": ["Resumo de feedback", "Material de prática em PDF"],
                "prerequisites": ["Nível mínimo A2 de inglês", "Definir a prova-alvo (TOEFL iBT ou IELTS)"],
                "is_featured": True,
                "advance_booking_days": 1,
            },
            {
                "title": "Pacote de Preparação Intensiva — 10 aulas",
                "description": (
                    "Programa estruturado de 10 aulas com foco em meta de nota definida. "
                    "Diagnóstico inicial, plano de estudos personalizado e simulados com feedback."
                ),
                "service_type": ServiceType.LANGUAGE_COACHING,
                "delivery_method": ServiceDeliveryMethod.VIDEO_CALL,
                "duration_minutes": 60,
                "pricing_type": PricingType.PACKAGE,
                "price_amount": "1090.00",
                "price_currency": "BRL",
                "includes": [
                    "10 aulas individuais de 60 minutos",
                    "Diagnóstico inicial de nível",
                    "Plano de estudos personalizado",
                    "2 simulados completos",
                    "Material de estudo ilimitado",
                    "Suporte por WhatsApp entre as aulas",
                ],
                "deliverables": ["Plano de estudos", "Relatório de progresso", "Simulados corrigidos"],
                "prerequisites": ["Nível mínimo A2 de inglês"],
                "advance_booking_days": 2,
            },
        ],
    },
    {
        "user": {
            "email": "equipe.compass@olcan.com",
            "full_name": "Equipe Olcan",
            "is_active": True,
            "is_verified": True,
        },
        "profile": {
            "headline": "Time oficial Olcan — Mentoria estratégica e revisão de narrativas para mobilidade internacional",
            "bio": (
                "A equipe Olcan reúne especialistas em mobilidade internacional, narrativa estratégica e preparação para "
                "candidaturas competitivas. Trabalhamos com profissionais e estudantes em todas as etapas da jornada: "
                "do diagnóstico inicial ao acompanhamento durante o processo seletivo."
            ),
            "current_title": "Equipe Olcan Compass",
            "current_organization": "Olcan",
            "years_experience": 5,
            "specializations": ["career_transition", "graduate_admissions", "narrative_strategy", "interview_prep"],
            "target_regions": ["Global", "Brasil", "Portugal", "Alemanha", "Canadá", "Estados Unidos"],
            "target_institutions": [],
            "languages_spoken": ["pt", "en", "es"],
            "status": ProviderStatus.APPROVED,
            "rating_average": 4.9,
            "review_count": 8,
            "total_bookings": 12,
            "completed_bookings": 11,
            "response_rate": 1.0,
            "response_time_hours": 4.0,
            "timezone": "America/Sao_Paulo",
            "education": [],
        },
        "credentials": [],
        "services": [
            {
                "title": "Mentoria Olcan — Sessão Estratégica (60 min)",
                "description": (
                    "Sessão 1:1 com membro da equipe Olcan para diagnóstico de momento, "
                    "alinhamento de narrativa e definição de próximos passos na sua jornada de mobilidade."
                ),
                "service_type": ServiceType.MENTORING,
                "delivery_method": ServiceDeliveryMethod.VIDEO_CALL,
                "duration_minutes": 60,
                "pricing_type": PricingType.FIXED,
                "price_amount": "225.00",
                "price_currency": "BRL",
                "includes": [
                    "Sessão 1:1 de 60 minutos",
                    "Diagnóstico de momento e objetivos",
                    "Plano de ação personalizado",
                    "Acesso à plataforma Olcan Compass",
                ],
                "deliverables": ["Plano de ação resumido por email"],
                "prerequisites": ["Perfil Olcan Compass criado"],
                "is_featured": True,
                "advance_booking_days": 1,
            },
        ],
    },
]


# ---------------------------------------------------------------------------
# Seed runner
# ---------------------------------------------------------------------------

async def seed_providers():
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        created = 0
        skipped = 0

        for provider_def in PROVIDERS:
            email = provider_def["user"]["email"]

            # Check if user already exists
            existing = await session.execute(select(User).where(User.email == email))
            user = existing.scalar_one_or_none()

            if user is None:
                user = User(
                    email=email,
                    full_name=provider_def["user"]["full_name"],
                    hashed_password=get_password_hash("olcan-provider-placeholder-pw"),
                    is_active=provider_def["user"]["is_active"],
                    is_verified=provider_def["user"]["is_verified"],
                    forge_credits=0,
                )
                session.add(user)
                await session.flush()
                print(f"  Created user: {email}")
            else:
                print(f"  User already exists: {email}")

            # Check if provider profile already exists
            existing_profile = await session.execute(
                select(ProviderProfile).where(ProviderProfile.user_id == user.id)
            )
            profile = existing_profile.scalar_one_or_none()

            if profile is not None:
                print(f"  Provider profile already exists for {email}, skipping.")
                skipped += 1
                continue

            # Create provider profile
            profile_data = {k: v for k, v in provider_def["profile"].items()}
            profile = ProviderProfile(user_id=user.id, **profile_data)
            session.add(profile)
            await session.flush()

            # Create credentials
            for cred_data in provider_def.get("credentials", []):
                cred = ProviderCredential(provider_id=profile.id, **cred_data)
                session.add(cred)

            # Create services
            for svc_data in provider_def.get("services", []):
                svc = ServiceListing(provider_id=profile.id, **svc_data)
                session.add(svc)

            await session.flush()
            created += 1
            print(f"  Created provider profile + services: {provider_def['user']['full_name']}")

        await session.commit()
        print(f"\nDone. Created: {created}  Skipped (already existed): {skipped}")

    await engine.dispose()


if __name__ == "__main__":
    print("Seeding marketplace providers...")
    asyncio.run(seed_providers())
    print("Marketplace seed complete.")
