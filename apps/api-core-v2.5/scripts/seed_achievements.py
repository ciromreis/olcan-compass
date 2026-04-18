"""Seed script for canonical achievements.

Run this script to populate the database with the initial set of achievements.

Usage:
    python scripts/seed_achievements.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from uuid import uuid4
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.db.models.task import Achievement, AchievementCategory


# ============================================================
# Achievement Definitions
# ============================================================

ACHIEVEMENTS = [
    # ========== FIRST STEPS (Milestone Achievements) ==========
    {
        "name": "Primeiros Passos",
        "name_en": "First Steps",
        "description": "Complete sua primeira tarefa",
        "icon": "🎯",
        "xp_bonus": 50,
        "unlock_condition": {"tasks_completed_total": 1},
        "category": AchievementCategory.FIRST_STEPS,
        "display_order": 1,
    },
    {
        "name": "Desbravador",
        "name_en": "Pathfinder",
        "description": "Complete 10 tarefas",
        "icon": "⚔️",
        "xp_bonus": 200,
        "unlock_condition": {"tasks_completed_total": 10},
        "category": AchievementCategory.FIRST_STEPS,
        "display_order": 2,
    },
    {
        "name": "Guerreiro de Tarefas",
        "name_en": "Task Warrior",
        "description": "Complete 25 tarefas",
        "icon": "🛡️",
        "xp_bonus": 500,
        "unlock_condition": {"tasks_completed_total": 25},
        "category": AchievementCategory.FIRST_STEPS,
        "display_order": 3,
    },
    {
        "name": "Mestre de Tarefas",
        "name_en": "Task Master",
        "description": "Complete 50 tarefas",
        "icon": "👑",
        "xp_bonus": 1000,
        "unlock_condition": {"tasks_completed_total": 50},
        "category": AchievementCategory.FIRST_STEPS,
        "display_order": 4,
    },
    {
        "name": "Lenda Viva",
        "name_en": "Living Legend",
        "description": "Complete 100 tarefas",
        "icon": "🏆",
        "xp_bonus": 2500,
        "unlock_condition": {"tasks_completed_total": 100},
        "category": AchievementCategory.FIRST_STEPS,
        "display_order": 5,
    },

    # ========== CONSISTENCY (Streak & Daily Achievements) ==========
    {
        "name": "Início da Sequência",
        "name_en": "Streak Starter",
        "description": "Mantenha uma sequência de 3 dias",
        "icon": "🔥",
        "xp_bonus": 100,
        "unlock_condition": {"streak_current": 3},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 10,
    },
    {
        "name": "Guardião da Sequência",
        "name_en": "Streak Keeper",
        "description": "Mantenha uma sequência de 7 dias",
        "icon": "🔥🔥",
        "xp_bonus": 300,
        "unlock_condition": {"streak_current": 7},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 11,
    },
    {
        "name": "Mestre da Consistência",
        "name_en": "Consistency Master",
        "description": "Mantenha uma sequência de 14 dias",
        "icon": "🔥🔥🔥",
        "xp_bonus": 750,
        "unlock_condition": {"streak_current": 14},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 12,
    },
    {
        "name": "Imparável",
        "name_en": "Unstoppable",
        "description": "Mantenha uma sequência de 30 dias",
        "icon": "⚡",
        "xp_bonus": 2000,
        "unlock_condition": {"streak_current": 30},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 13,
    },
    {
        "name": "Dia Produtivo",
        "name_en": "Productive Day",
        "description": "Complete 5 tarefas em um dia",
        "icon": "☀️",
        "xp_bonus": 150,
        "unlock_condition": {"tasks_completed_today": 5},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 14,
    },
    {
        "name": "Super Produtivo",
        "name_en": "Super Productive",
        "description": "Complete 10 tarefas em um dia",
        "icon": "🌟",
        "xp_bonus": 400,
        "unlock_condition": {"tasks_completed_today": 10},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 15,
    },
    {
        "name": "Semana Forte",
        "name_en": "Strong Week",
        "description": "Complete 20 tarefas em uma semana",
        "icon": "📅",
        "xp_bonus": 500,
        "unlock_condition": {"tasks_completed_this_week": 20},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 16,
    },
    {
        "name": "Semana Épica",
        "name_en": "Epic Week",
        "description": "Complete 50 tarefas em uma semana",
        "icon": "🗓️",
        "xp_bonus": 1500,
        "unlock_condition": {"tasks_completed_this_week": 50},
        "category": AchievementCategory.CONSISTENCY,
        "display_order": 17,
    },

    # ========== MASTERY (Priority & Skill Achievements) ==========
    {
        "name": "Focado em Prioridades",
        "name_en": "Priority Focused",
        "description": "Complete 10 tarefas de alta prioridade",
        "icon": "🎯",
        "xp_bonus": 300,
        "unlock_condition": {"high_priority_tasks": 10},
        "category": AchievementCategory.MASTERY,
        "display_order": 20,
    },
    {
        "name": "Mestre de Prioridades",
        "name_en": "Priority Master",
        "description": "Complete 25 tarefas de alta prioridade",
        "icon": "🔥",
        "xp_bonus": 750,
        "unlock_condition": {"high_priority_tasks": 25},
        "category": AchievementCategory.MASTERY,
        "display_order": 21,
    },
    {
        "name": "Especialista em Urgências",
        "name_en": "Urgency Expert",
        "description": "Complete 50 tarefas de alta prioridade",
        "icon": "⚡",
        "xp_bonus": 1500,
        "unlock_condition": {"high_priority_tasks": 50},
        "category": AchievementCategory.MASTERY,
        "display_order": 22,
    },

    # ========== CATEGORY-SPECIFIC ACHIEVEMENTS ==========
    {
        "name": "Focado na Carreira",
        "name_en": "Career Focused",
        "description": "Complete 5 tarefas de carreira",
        "icon": "💼",
        "xp_bonus": 150,
        "unlock_condition": {"category": "employment", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 30,
    },
    {
        "name": "Especialista em Documentação",
        "name_en": "Documentation Expert",
        "description": "Complete 5 tarefas de documentação",
        "icon": "📄",
        "xp_bonus": 150,
        "unlock_condition": {"category": "documentation", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 31,
    },
    {
        "name": "Aprendiz de Idiomas",
        "name_en": "Language Learner",
        "description": "Complete 5 tarefas de idiomas",
        "icon": "🗣️",
        "xp_bonus": 150,
        "unlock_condition": {"category": "language", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 32,
    },
    {
        "name": "Guru Financeiro",
        "name_en": "Finance Guru",
        "description": "Complete 5 tarefas financeiras",
        "icon": "💰",
        "xp_bonus": 150,
        "unlock_condition": {"category": "finance", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 33,
    },
    {
        "name": "Networking Pro",
        "name_en": "Networking Pro",
        "description": "Complete 5 tarefas de networking",
        "icon": "🤝",
        "xp_bonus": 150,
        "unlock_condition": {"category": "networking", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 34,
    },
    {
        "name": "Pronto para Entrevistas",
        "name_en": "Interview Ready",
        "description": "Complete 5 tarefas de preparação para entrevistas",
        "icon": "🎤",
        "xp_bonus": 200,
        "unlock_condition": {"category": "interview", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 35,
    },
    {
        "name": "Especialista em Vistos",
        "name_en": "Visa Expert",
        "description": "Complete 5 tarefas relacionadas a vistos",
        "icon": "🛂",
        "xp_bonus": 200,
        "unlock_condition": {"category": "visa", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 36,
    },
    {
        "name": "Adaptador Cultural",
        "name_en": "Cultural Adapter",
        "description": "Complete 5 tarefas de preparação cultural",
        "icon": "🌍",
        "xp_bonus": 150,
        "unlock_condition": {"category": "cultural_prep", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 37,
    },
    {
        "name": "Guardião da Saúde",
        "name_en": "Health Guardian",
        "description": "Complete 5 tarefas de saúde",
        "icon": "🏥",
        "xp_bonus": 150,
        "unlock_condition": {"category": "health", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 38,
    },
    {
        "name": "Acadêmico",
        "name_en": "Academic",
        "description": "Complete 5 tarefas educacionais",
        "icon": "🎓",
        "xp_bonus": 150,
        "unlock_condition": {"category": "education", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 39,
    },
    {
        "name": "Especialista em Moradia",
        "name_en": "Housing Expert",
        "description": "Complete 5 tarefas de moradia",
        "icon": "🏠",
        "xp_bonus": 150,
        "unlock_condition": {"category": "housing", "count": 5},
        "category": AchievementCategory.MASTERY,
        "display_order": 40,
    },

    # ========== ADVANCED CATEGORY ACHIEVEMENTS ==========
    {
        "name": "Mestre da Carreira",
        "name_en": "Career Master",
        "description": "Complete 20 tarefas de carreira",
        "icon": "💼✨",
        "xp_bonus": 500,
        "unlock_condition": {"category": "employment", "count": 20},
        "category": AchievementCategory.MASTERY,
        "display_order": 50,
    },
    {
        "name": "Poliglota",
        "name_en": "Polyglot",
        "description": "Complete 20 tarefas de idiomas",
        "icon": "🗣️✨",
        "xp_bonus": 500,
        "unlock_condition": {"category": "language", "count": 20},
        "category": AchievementCategory.MASTERY,
        "display_order": 51,
    },
    {
        "name": "Mestre Financeiro",
        "name_en": "Financial Master",
        "description": "Complete 20 tarefas financeiras",
        "icon": "💰✨",
        "xp_bonus": 500,
        "unlock_condition": {"category": "finance", "count": 20},
        "category": AchievementCategory.MASTERY,
        "display_order": 52,
    },

    # ========== SPECIAL ACHIEVEMENTS ==========
    {
        "name": "Madrugador",
        "name_en": "Early Bird",
        "description": "Complete uma tarefa antes das 6h da manhã",
        "icon": "🌅",
        "xp_bonus": 200,
        "unlock_condition": {"special": "early_morning_task"},
        "category": AchievementCategory.SPECIAL,
        "display_order": 100,
    },
    {
        "name": "Coruja Noturna",
        "name_en": "Night Owl",
        "description": "Complete uma tarefa depois das 23h",
        "icon": "🦉",
        "xp_bonus": 200,
        "unlock_condition": {"special": "late_night_task"},
        "category": AchievementCategory.SPECIAL,
        "display_order": 101,
    },
    {
        "name": "Fim de Semana Produtivo",
        "name_en": "Productive Weekend",
        "description": "Complete 10 tarefas em um fim de semana",
        "icon": "🎉",
        "xp_bonus": 300,
        "unlock_condition": {"special": "weekend_warrior"},
        "category": AchievementCategory.SPECIAL,
        "display_order": 102,
    },
]


# ============================================================
# Seed Function
# ============================================================

async def seed_achievements():
    """Seed achievements into the database."""
    print("🌱 Starting achievement seeding...")
    
    # Create async engine
    engine = create_async_engine(
        settings.database_url,
        echo=False,
        future=True
    )
    
    async_session = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    async with async_session() as session:
        try:
            # Check if achievements already exist
            result = await session.execute(select(Achievement))
            existing = result.scalars().all()
            
            if existing:
                print(f"⚠️  Found {len(existing)} existing achievements")
                response = input("Do you want to delete and reseed? (yes/no): ")
                if response.lower() != "yes":
                    print("❌ Seeding cancelled")
                    return
                
                # Delete existing achievements
                for achievement in existing:
                    await session.delete(achievement)
                await session.commit()
                print("🗑️  Deleted existing achievements")

            # Insert new achievements
            created_count = 0
            for achievement_data in ACHIEVEMENTS:
                achievement = Achievement(
                    id=uuid4(),
                    name=achievement_data["name"],
                    name_en=achievement_data.get("name_en"),
                    description=achievement_data["description"],
                    icon=achievement_data["icon"],
                    xp_bonus=achievement_data["xp_bonus"],
                    unlock_condition=achievement_data["unlock_condition"],
                    category=achievement_data["category"],
                    display_order=achievement_data["display_order"],
                    is_active=True,
                )
                session.add(achievement)
                created_count += 1

            await session.commit()
            print(f"✅ Successfully seeded {created_count} achievements!")
            
            # Print summary by category
            print("\n📊 Achievement Summary:")
            category_counts = {}
            for ach in ACHIEVEMENTS:
                cat = ach["category"].value
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            for category, count in sorted(category_counts.items()):
                print(f"   {category}: {count} achievements")
            
            print(f"\n🎯 Total: {created_count} achievements")

        except Exception as e:
            print(f"❌ Error seeding achievements: {str(e)}")
            await session.rollback()
            raise
        finally:
            await engine.dispose()


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    print("=" * 60)
    print("Achievement Seeding Script")
    print("=" * 60)
    print()
    
    asyncio.run(seed_achievements())
    
    print()
    print("=" * 60)
    print("Done!")
    print("=" * 60)


# ========== MARKETPLACE (Provider & Service Achievements) ==========
MARKETPLACE_ACHIEVEMENTS = [
    {
        "name": "Primeiro Serviço",
        "name_en": "First Service",
        "description": "Reserve seu primeiro serviço no marketplace",
        "icon": "🛒",
        "xp_bonus": 100,
        "unlock_condition": {"marketplace_bookings": 1},
        "category": AchievementCategory.SPECIAL,
        "display_order": 100,
    },
    {
        "name": "Cliente Frequente",
        "name_en": "Frequent Client",
        "description": "Complete 5 serviços no marketplace",
        "icon": "🎫",
        "xp_bonus": 300,
        "unlock_condition": {"marketplace_bookings_completed": 5},
        "category": AchievementCategory.SPECIAL,
        "display_order": 101,
    },
    {
        "name": "Patrono do Marketplace",
        "name_en": "Marketplace Patron",
        "description": "Complete 20 serviços no marketplace",
        "icon": "💎",
        "xp_bonus": 1000,
        "unlock_condition": {"marketplace_bookings_completed": 20},
        "category": AchievementCategory.SPECIAL,
        "display_order": 102,
    },
    {
        "name": "Primeira Avaliação",
        "name_en": "First Review",
        "description": "Deixe sua primeira avaliação",
        "icon": "⭐",
        "xp_bonus": 50,
        "unlock_condition": {"marketplace_reviews": 1},
        "category": AchievementCategory.SPECIAL,
        "display_order": 103,
    },
    {
        "name": "Crítico Experiente",
        "name_en": "Experienced Critic",
        "description": "Deixe 10 avaliações",
        "icon": "📝",
        "xp_bonus": 250,
        "unlock_condition": {"marketplace_reviews": 10},
        "category": AchievementCategory.SPECIAL,
        "display_order": 104,
    },
    {
        "name": "Provedor Iniciante",
        "name_en": "Provider Starter",
        "description": "Complete seu primeiro serviço como provedor",
        "icon": "🎓",
        "xp_bonus": 200,
        "unlock_condition": {"marketplace_services_provided": 1},
        "category": AchievementCategory.SPECIAL,
        "display_order": 105,
    },
    {
        "name": "Provedor Experiente",
        "name_en": "Experienced Provider",
        "description": "Complete 10 serviços como provedor",
        "icon": "🏅",
        "xp_bonus": 500,
        "unlock_condition": {"marketplace_services_provided": 10},
        "category": AchievementCategory.SPECIAL,
        "display_order": 106,
    },
    {
        "name": "Provedor Elite",
        "name_en": "Elite Provider",
        "description": "Complete 50 serviços como provedor",
        "icon": "👨‍🏫",
        "xp_bonus": 2000,
        "unlock_condition": {"marketplace_services_provided": 50},
        "category": AchievementCategory.SPECIAL,
        "display_order": 107,
    },
    {
        "name": "5 Estrelas",
        "name_en": "5 Stars",
        "description": "Receba uma avaliação 5 estrelas",
        "icon": "⭐⭐⭐⭐⭐",
        "xp_bonus": 150,
        "unlock_condition": {"marketplace_five_star_reviews": 1},
        "category": AchievementCategory.SPECIAL,
        "display_order": 108,
    },
    {
        "name": "Provedor Aclamado",
        "name_en": "Acclaimed Provider",
        "description": "Receba 10 avaliações 5 estrelas",
        "icon": "🌟",
        "xp_bonus": 750,
        "unlock_condition": {"marketplace_five_star_reviews": 10},
        "category": AchievementCategory.SPECIAL,
        "display_order": 109,
    },
]

# Add marketplace achievements to main list
ACHIEVEMENTS.extend(MARKETPLACE_ACHIEVEMENTS)
