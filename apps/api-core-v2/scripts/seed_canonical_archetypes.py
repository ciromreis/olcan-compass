"""
Seed the 12 canonical Olcan archetypes into the database.

Each archetype record maps the frontend's ArchetypeId slug to its full
metadata: name, creature, motivator, fear_cluster, colors, description.

Run with:
  cd apps/api-core-v2
  python scripts/seed_canonical_archetypes.py
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.models.archetype import Archetype
from app.core.database import Base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./compass_v25.db",
)

ARCHETYPES = [
    {
        "name": "institutional_escapee",
        "title": "O Fugitivo Institucional",
        "description": "Mestre da independência estratégica e liberdade táctica",
        "motivator": "freedom",
        "companion_type": "fox",
        "companion_description": "A raposa estrategista que navega sistemas com astúcia",
        "color_scheme": {"primary": "#8B5CF6", "secondary": "#6366F1", "gradient": "from-purple-600 to-indigo-600"},
        "base_stats": {"power": 75, "wisdom": 80, "charisma": 70, "agility": 75},
        "base_abilities": [
            {"name": "Planejamento Estratégico", "type": "passive"},
            {"name": "Avaliação de Risco", "type": "active"},
        ],
        "evolution_path": {"from": "Escritor Oculto", "to": "Operador Global Soberano"},
        "sort_order": 1,
    },
    {
        "name": "scholarship_cartographer",
        "title": "O Cartógrafo de Bolsas",
        "description": "Pioneiro da excelência acadêmica e oportunidades de prestígio",
        "motivator": "success",
        "companion_type": "dragon",
        "companion_description": "O dragão inovador que domina o conhecimento e o prestígio",
        "color_scheme": {"primary": "#3B82F6", "secondary": "#2563EB", "gradient": "from-blue-600 to-blue-800"},
        "base_stats": {"power": 65, "wisdom": 90, "charisma": 70, "agility": 65},
        "base_abilities": [
            {"name": "Excelência em Pesquisa", "type": "passive"},
            {"name": "Escrita Acadêmica", "type": "active"},
        ],
        "evolution_path": {"from": "Candidato Invisível", "to": "Acadêmico Patrocinado"},
        "sort_order": 2,
    },
    {
        "name": "career_pivot",
        "title": "O Pivô de Carreira",
        "description": "Artista da transformação e domínio de novas competências",
        "motivator": "growth",
        "companion_type": "lion",
        "companion_description": "O leão criador que domina cada novo território",
        "color_scheme": {"primary": "#10B981", "secondary": "#059669", "gradient": "from-emerald-600 to-green-700"},
        "base_stats": {"power": 70, "wisdom": 75, "charisma": 75, "agility": 80},
        "base_abilities": [
            {"name": "Adaptabilidade", "type": "passive"},
            {"name": "Mentalidade de Crescimento", "type": "active"},
        ],
        "evolution_path": {"from": "Especialista Local", "to": "Iniciante Global Estratégico"},
        "sort_order": 3,
    },
    {
        "name": "global_nomad",
        "title": "O Nômade Global",
        "description": "Especialista em adaptação cultural e vida sem fronteiras",
        "motivator": "adventure",
        "companion_type": "phoenix",
        "companion_description": "A fênix diplomata que renasce em cada cultura",
        "color_scheme": {"primary": "#06B6D4", "secondary": "#0891B2", "gradient": "from-cyan-600 to-teal-600"},
        "base_stats": {"power": 70, "wisdom": 70, "charisma": 80, "agility": 85},
        "base_abilities": [
            {"name": "Fluência Cultural", "type": "passive"},
            {"name": "Independência Geográfica", "type": "active"},
        ],
        "evolution_path": {"from": "Turista com Laptop", "to": "Habitante do Fluxo"},
        "sort_order": 4,
    },
    {
        "name": "technical_bridge_builder",
        "title": "O Construtor de Pontes Técnicas",
        "description": "Construtor de fundamentos técnicos e transições seguras",
        "motivator": "stability",
        "companion_type": "wolf",
        "companion_description": "O lobo pioneiro que constrói estruturas sólidas entre mundos",
        "color_scheme": {"primary": "#F97316", "secondary": "#EA580C", "gradient": "from-orange-600 to-orange-800"},
        "base_stats": {"power": 85, "wisdom": 80, "charisma": 65, "agility": 70},
        "base_abilities": [
            {"name": "Excelência Técnica", "type": "passive"},
            {"name": "Design de Sistemas", "type": "active"},
        ],
        "evolution_path": {"from": "Recurso Terceirizado", "to": "Arquiteto de Fronteira"},
        "sort_order": 5,
    },
    {
        "name": "insecure_corporate_dev",
        "title": "O Dev Corporativo Inseguro",
        "description": "Buscador de validação e confiança técnica",
        "motivator": "safety",
        "companion_type": "owl",
        "companion_description": "A coruja estudiosa que transforma dúvidas em domínio",
        "color_scheme": {"primary": "#6366F1", "secondary": "#4F46E5", "gradient": "from-indigo-600 to-indigo-800"},
        "base_stats": {"power": 75, "wisdom": 75, "charisma": 65, "agility": 75},
        "base_abilities": [
            {"name": "Domínio de Entrevistas", "type": "active"},
            {"name": "Comunicação Técnica", "type": "passive"},
        ],
        "evolution_path": {"from": "Sombra da Equipe", "to": "Especialista Validado"},
        "sort_order": 6,
    },
    {
        "name": "exhausted_solo_mother",
        "title": "A Mãe Solo Exausta",
        "description": "Guardiã do futuro familiar e força protetora",
        "motivator": "security",
        "companion_type": "bear",
        "companion_description": "O urso guardião que protege com força inabalável",
        "color_scheme": {"primary": "#8B4513", "secondary": "#A0522D", "gradient": "from-amber-700 to-orange-800"},
        "base_stats": {"power": 80, "wisdom": 70, "charisma": 75, "agility": 70},
        "base_abilities": [
            {"name": "Planejamento Familiar", "type": "passive"},
            {"name": "Resiliência", "type": "active"},
        ],
        "evolution_path": {"from": "Heroína Exausta", "to": "Guardiã do Futuro Global"},
        "sort_order": 7,
    },
    {
        "name": "trapped_public_servant",
        "title": "O Servidor Público Encurralado",
        "description": "Visionário em busca de impacto significativo e propósito",
        "motivator": "purpose",
        "companion_type": "eagle",
        "companion_description": "A águia visionária que voa além das fronteiras burocráticas",
        "color_scheme": {"primary": "#DC2626", "secondary": "#B91C1C", "gradient": "from-red-600 to-red-800"},
        "base_stats": {"power": 70, "wisdom": 80, "charisma": 80, "agility": 65},
        "base_abilities": [
            {"name": "Especialidade em Políticas", "type": "passive"},
            {"name": "Criação de Impacto", "type": "active"},
        ],
        "evolution_path": {"from": "Burocrata Encurralado", "to": "Agente de Mudança Internacional"},
        "sort_order": 8,
    },
    {
        "name": "academic_hermit",
        "title": "O Eremita Acadêmico",
        "description": "Buscador de sabedoria e excelência intelectual",
        "motivator": "knowledge",
        "companion_type": "deer",
        "companion_description": "O cervo acadêmico que encontra o conhecimento nas profundezas",
        "color_scheme": {"primary": "#7C3AED", "secondary": "#6D28D9", "gradient": "from-violet-600 to-purple-800"},
        "base_stats": {"power": 65, "wisdom": 95, "charisma": 60, "agility": 65},
        "base_abilities": [
            {"name": "Pesquisa Profunda", "type": "passive"},
            {"name": "Síntese de Conhecimento", "type": "active"},
        ],
        "evolution_path": {"from": "Teórico Isolado", "to": "Nó de Conhecimento Global"},
        "sort_order": 9,
    },
    {
        "name": "executive_refugee",
        "title": "O Refugiado Executivo",
        "description": "Mestre do equilíbrio e liderança consciente",
        "motivator": "peace",
        "companion_type": "tiger",
        "companion_description": "O tigre executivo que lidera com presença e elegância",
        "color_scheme": {"primary": "#F59E0B", "secondary": "#D97706", "gradient": "from-yellow-600 to-amber-700"},
        "base_stats": {"power": 80, "wisdom": 85, "charisma": 85, "agility": 65},
        "base_abilities": [
            {"name": "Liderança Estratégica", "type": "passive"},
            {"name": "Gestão de Patrimônio", "type": "active"},
        ],
        "evolution_path": {"from": "Máquina Dourada", "to": "Gestor Consciente"},
        "sort_order": 10,
    },
    {
        "name": "creative_visionary",
        "title": "O Visionário Criativo",
        "description": "Artista da autoexpressão e inovação cultural",
        "motivator": "expression",
        "companion_type": "butterfly",
        "companion_description": "A borboleta criativa que transforma mundos com arte",
        "color_scheme": {"primary": "#EC4899", "secondary": "#DB2777", "gradient": "from-pink-600 to-rose-700"},
        "base_stats": {"power": 65, "wisdom": 75, "charisma": 90, "agility": 75},
        "base_abilities": [
            {"name": "Expressão Criativa", "type": "active"},
            {"name": "Adaptação Cultural", "type": "passive"},
        ],
        "evolution_path": {"from": "Persona Marginal", "to": "Protagonista Cultural"},
        "sort_order": 11,
    },
    {
        "name": "lifestyle_optimizer",
        "title": "O Otimizador de Estilo de Vida",
        "description": "Especialista em otimização de qualidade e vida estratégica",
        "motivator": "efficiency",
        "companion_type": "dolphin",
        "companion_description": "O golfinho otimizador que encontra a rota mais eficiente",
        "color_scheme": {"primary": "#14B8A6", "secondary": "#0D9488", "gradient": "from-teal-600 to-cyan-700"},
        "base_stats": {"power": 70, "wisdom": 85, "charisma": 70, "agility": 80},
        "base_abilities": [
            {"name": "Análise de Dados", "type": "passive"},
            {"name": "Otimização", "type": "active"},
        ],
        "evolution_path": {"from": "Contribuinte", "to": "Árbitro de Destino"},
        "sort_order": 12,
    },
]


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        for data in ARCHETYPES:
            # Skip if already exists
            result = await session.execute(
                select(Archetype).where(Archetype.name == data["name"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                # Update in case data changed
                for key, val in data.items():
                    setattr(existing, key, val)
                print(f"  Updated: {data['name']}")
            else:
                archetype = Archetype(**data)
                session.add(archetype)
                print(f"  Created: {data['name']}")

        await session.commit()

    await engine.dispose()
    print(f"\n✅ Seeded {len(ARCHETYPES)} canonical archetypes.")


if __name__ == "__main__":
    asyncio.run(seed())
