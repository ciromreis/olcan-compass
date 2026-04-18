#!/usr/bin/env python3
"""
Master seed script — runs all seed scripts in dependency order.

Usage:
    cd apps/api-core-v2.5
    DATABASE_URL=sqlite+aiosqlite:///./compass_v25.db python scripts/seed_all.py

    # Or with PostgreSQL:
    DATABASE_URL=postgresql+asyncpg://user:pass@localhost/compass python scripts/seed_all.py
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import get_settings

settings = get_settings()
DATABASE_URL = os.environ.get("DATABASE_URL", settings.database_url or "sqlite+aiosqlite:///./compass_v25.db")


async def run_all():
    print("=" * 60)
    print("  Olcan Compass v2.5 — Master Database Seed")
    print("=" * 60)
    print(f"  DB: {DATABASE_URL[:50]}...")
    print()

    steps = [
        ("Archetypes", seed_archetypes),
        ("Quest Templates", seed_quest_templates),
        ("Achievement Templates", seed_achievements),
        ("Psychology Questions", seed_psychology_questions),
        ("Interview Questions", seed_interview_questions),
        ("Marketplace Providers", seed_marketplace_providers),
    ]

    for name, fn in steps:
        print(f"[{name}]")
        try:
            await fn()
        except Exception as exc:
            print(f"  ⚠️  Skipped ({exc.__class__.__name__}: {exc})")
        print()

    print("=" * 60)
    print("  ✅ Seed complete!")
    print("=" * 60)


async def seed_archetypes():
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import select
    from app.models.archetype import Archetype

    ARCHETYPES = [
        {"name": "institutional_escapee", "title": "O Fugitivo Institucional", "description": "Mestre da independência estratégica e liberdade táctica", "motivator": "freedom", "companion_type": "fox", "companion_description": "A raposa estrategista que navega sistemas com astúcia", "color_scheme": {"primary": "#8B5CF6", "secondary": "#6366F1"}, "base_stats": {"power": 75, "wisdom": 80, "charisma": 70, "agility": 75}, "base_abilities": [], "evolution_path": {}, "sort_order": 1},
        {"name": "scholarship_cartographer", "title": "O Cartógrafo de Bolsas", "description": "Pioneiro da excelência acadêmica e oportunidades de prestígio", "motivator": "success", "companion_type": "dragon", "companion_description": "O dragão inovador que domina o conhecimento e o prestígio", "color_scheme": {"primary": "#3B82F6", "secondary": "#2563EB"}, "base_stats": {"power": 65, "wisdom": 90, "charisma": 70, "agility": 65}, "base_abilities": [], "evolution_path": {}, "sort_order": 2},
        {"name": "career_pivot", "title": "O Pivô de Carreira", "description": "Artista da transformação e domínio de novas competências", "motivator": "growth", "companion_type": "lion", "companion_description": "O leão criador que domina cada novo território", "color_scheme": {"primary": "#10B981", "secondary": "#059669"}, "base_stats": {"power": 70, "wisdom": 75, "charisma": 75, "agility": 80}, "base_abilities": [], "evolution_path": {}, "sort_order": 3},
        {"name": "global_nomad", "title": "O Nômade Global", "description": "Especialista em adaptação cultural e vida sem fronteiras", "motivator": "adventure", "companion_type": "phoenix", "companion_description": "A fênix diplomata que renasce em cada cultura", "color_scheme": {"primary": "#06B6D4", "secondary": "#0891B2"}, "base_stats": {"power": 70, "wisdom": 70, "charisma": 80, "agility": 85}, "base_abilities": [], "evolution_path": {}, "sort_order": 4},
        {"name": "technical_bridge_builder", "title": "O Construtor de Pontes Técnicas", "description": "Construtor de fundamentos técnicos e transições seguras", "motivator": "stability", "companion_type": "wolf", "companion_description": "O lobo pioneiro que constrói estruturas sólidas entre mundos", "color_scheme": {"primary": "#F97316", "secondary": "#EA580C"}, "base_stats": {"power": 85, "wisdom": 80, "charisma": 65, "agility": 70}, "base_abilities": [], "evolution_path": {}, "sort_order": 5},
        {"name": "insecure_corporate_dev", "title": "O Dev Corporativo Inseguro", "description": "Buscador de validação e confiança técnica", "motivator": "safety", "companion_type": "owl", "companion_description": "A coruja estudiosa que transforma dúvidas em domínio", "color_scheme": {"primary": "#6366F1", "secondary": "#4F46E5"}, "base_stats": {"power": 75, "wisdom": 75, "charisma": 65, "agility": 75}, "base_abilities": [], "evolution_path": {}, "sort_order": 6},
        {"name": "exhausted_solo_mother", "title": "A Mãe Solo Exausta", "description": "Guardiã do futuro familiar e força protetora", "motivator": "security", "companion_type": "bear", "companion_description": "O urso guardião que protege com força inabalável", "color_scheme": {"primary": "#8B4513", "secondary": "#A0522D"}, "base_stats": {"power": 80, "wisdom": 70, "charisma": 75, "agility": 70}, "base_abilities": [], "evolution_path": {}, "sort_order": 7},
        {"name": "trapped_public_servant", "title": "O Servidor Público Encurralado", "description": "Visionário em busca de impacto significativo e propósito", "motivator": "purpose", "companion_type": "eagle", "companion_description": "A águia visionária que voa além das fronteiras burocráticas", "color_scheme": {"primary": "#DC2626", "secondary": "#B91C1C"}, "base_stats": {"power": 70, "wisdom": 80, "charisma": 80, "agility": 65}, "base_abilities": [], "evolution_path": {}, "sort_order": 8},
        {"name": "academic_hermit", "title": "O Eremita Acadêmico", "description": "Buscador de sabedoria e excelência intelectual", "motivator": "knowledge", "companion_type": "deer", "companion_description": "O cervo acadêmico que encontra o conhecimento nas profundezas", "color_scheme": {"primary": "#7C3AED", "secondary": "#6D28D9"}, "base_stats": {"power": 65, "wisdom": 95, "charisma": 60, "agility": 65}, "base_abilities": [], "evolution_path": {}, "sort_order": 9},
        {"name": "executive_refugee", "title": "O Refugiado Executivo", "description": "Mestre do equilíbrio e liderança consciente", "motivator": "peace", "companion_type": "tiger", "companion_description": "O tigre executivo que lidera com presença e elegância", "color_scheme": {"primary": "#F59E0B", "secondary": "#D97706"}, "base_stats": {"power": 80, "wisdom": 85, "charisma": 85, "agility": 65}, "base_abilities": [], "evolution_path": {}, "sort_order": 10},
        {"name": "creative_visionary", "title": "O Visionário Criativo", "description": "Artista da autoexpressão e inovação cultural", "motivator": "expression", "companion_type": "butterfly", "companion_description": "A borboleta criativa que transforma mundos com arte", "color_scheme": {"primary": "#EC4899", "secondary": "#DB2777"}, "base_stats": {"power": 65, "wisdom": 75, "charisma": 90, "agility": 75}, "base_abilities": [], "evolution_path": {}, "sort_order": 11},
        {"name": "lifestyle_optimizer", "title": "O Otimizador de Estilo de Vida", "description": "Especialista em otimização de qualidade e vida estratégica", "motivator": "efficiency", "companion_type": "dolphin", "companion_description": "O golfinho otimizador que encontra a rota mais eficiente", "color_scheme": {"primary": "#14B8A6", "secondary": "#0D9488"}, "base_stats": {"power": 70, "wisdom": 85, "charisma": 70, "agility": 80}, "base_abilities": [], "evolution_path": {}, "sort_order": 12},
    ]

    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        created = 0
        for data in ARCHETYPES:
            result = await session.execute(select(Archetype).where(Archetype.name == data["name"]))
            existing = result.scalar_one_or_none()
            if not existing:
                session.add(Archetype(**data))
                created += 1
        await session.commit()
        print(f"  ✓ {created} archetypes created ({len(ARCHETYPES) - created} already existed)")
    await engine.dispose()


async def seed_quest_templates():
    from scripts.seed_quest_templates import seed_quest_templates as _seed
    await _seed()


async def seed_achievements():
    try:
        from scripts.seed_achievements import seed as _seed
        await _seed(DATABASE_URL)
    except (ImportError, AttributeError):
        print("  ℹ️  seed_achievements.py has no async seed(url) function — skipping")


async def seed_psychology_questions():
    from scripts.seed_psychology_questions import seed as _seed
    await _seed(DATABASE_URL)


async def seed_interview_questions():
    from scripts.seed_interview_questions import seed_questions as _seed
    await _seed()


async def seed_marketplace_providers():
    from scripts.seed_marketplace_providers import seed_providers as _seed
    await _seed()


if __name__ == "__main__":
    asyncio.run(run_all())
