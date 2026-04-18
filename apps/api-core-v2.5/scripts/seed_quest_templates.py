"""Seed quest templates into the database.

This script creates predefined quest templates for:
- Daily quests (3 per day)
- Weekly quests (2 per week)
- Special quests (event-based)
- Consistency quests (ongoing)

Run with: python -m scripts.seed_quest_templates
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.db.session import get_sessionmaker
from app.db.models.quest import QuestTemplate, QuestType, QuestCategory
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================
# Quest Template Definitions
# ============================================================

DAILY_QUESTS = [
    {
        "name": "Tarefa Diária",
        "name_en": "Daily Task",
        "description": "Complete 3 tarefas hoje",
        "icon": "📋",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.CATEGORY_SPECIFIC,
        "requirement_type": "complete_tasks_today",
        "requirement_target": 3,
        "requirement_metadata": {},
        "xp_reward": 50,
        "coin_reward": 10,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    },
    {
        "name": "Foco Matinal",
        "name_en": "Morning Focus",
        "description": "Complete 5 tarefas hoje",
        "icon": "🌅",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.CATEGORY_SPECIFIC,
        "requirement_type": "complete_tasks_today",
        "requirement_target": 5,
        "requirement_metadata": {},
        "xp_reward": 75,
        "coin_reward": 15,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    },
    {
        "name": "Prioridade Alta",
        "name_en": "High Priority",
        "description": "Complete 2 tarefas de alta prioridade",
        "icon": "🔥",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.SPECIAL,
        "requirement_type": "complete_high_priority_tasks",
        "requirement_target": 2,
        "requirement_metadata": {},
        "xp_reward": 100,
        "coin_reward": 20,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    },
    {
        "name": "Trabalho Focado",
        "name_en": "Focused Work",
        "description": "Complete 3 tarefas de trabalho",
        "icon": "💼",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.CATEGORY_SPECIFIC,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 3,
        "requirement_metadata": {"category": "work"},
        "xp_reward": 60,
        "coin_reward": 12,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    },
    {
        "name": "Desenvolvimento Pessoal",
        "name_en": "Personal Development",
        "description": "Complete 2 tarefas pessoais",
        "icon": "🌱",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 2,
        "requirement_metadata": {"category": "personal"},
        "xp_reward": 50,
        "coin_reward": 10,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    },
    {
        "name": "Saúde em Dia",
        "name_en": "Health Check",
        "description": "Complete 2 tarefas de saúde",
        "icon": "💪",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.CONSISTENCY,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 2,
        "requirement_metadata": {"category": "health"},
        "xp_reward": 50,
        "coin_reward": 10,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    },
    {
        "name": "Aprendizado Contínuo",
        "name_en": "Continuous Learning",
        "description": "Complete 2 tarefas de aprendizado",
        "icon": "📚",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 2,
        "requirement_metadata": {"category": "learning"},
        "xp_reward": 60,
        "coin_reward": 12,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    },
    {
        "name": "Criatividade Diária",
        "name_en": "Daily Creativity",
        "description": "Complete 1 tarefa criativa",
        "icon": "🎨",
        "quest_type": QuestType.DAILY,
        "category": QuestCategory.SPECIAL,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 1,
        "requirement_metadata": {"category": "creative"},
        "xp_reward": 40,
        "coin_reward": 8,
        "duration_hours": 24,
        "cooldown_hours": 24,
        "is_active": True
    }
]

WEEKLY_QUESTS = [
    {
        "name": "Guerreiro Semanal",
        "name_en": "Weekly Warrior",
        "description": "Complete 20 tarefas esta semana",
        "icon": "⚔️",
        "quest_type": QuestType.WEEKLY,
        "category": QuestCategory.CATEGORY_SPECIFIC,
        "requirement_type": "complete_tasks",
        "requirement_target": 20,
        "requirement_metadata": {},
        "xp_reward": 300,
        "coin_reward": 50,
        "duration_hours": 168,  # 7 days
        "cooldown_hours": 168,
        "is_active": True
    },
    {
        "name": "Mestre da Produtividade",
        "name_en": "Productivity Master",
        "description": "Complete 30 tarefas esta semana",
        "icon": "👑",
        "quest_type": QuestType.WEEKLY,
        "category": QuestCategory.CATEGORY_SPECIFIC,
        "requirement_type": "complete_tasks",
        "requirement_target": 30,
        "requirement_metadata": {},
        "xp_reward": 500,
        "coin_reward": 100,
        "duration_hours": 168,
        "cooldown_hours": 168,
        "is_active": True
    },
    {
        "name": "Prioridades da Semana",
        "name_en": "Weekly Priorities",
        "description": "Complete 10 tarefas de alta prioridade",
        "icon": "🎯",
        "quest_type": QuestType.WEEKLY,
        "category": QuestCategory.SPECIAL,
        "requirement_type": "complete_high_priority_tasks",
        "requirement_target": 10,
        "requirement_metadata": {},
        "xp_reward": 400,
        "coin_reward": 75,
        "duration_hours": 168,
        "cooldown_hours": 168,
        "is_active": True
    },
    {
        "name": "Equilíbrio Semanal",
        "name_en": "Weekly Balance",
        "description": "Complete tarefas em 4 categorias diferentes",
        "icon": "⚖️",
        "quest_type": QuestType.WEEKLY,
        "category": QuestCategory.CONSISTENCY,
        "requirement_type": "complete_diverse_categories",
        "requirement_target": 4,
        "requirement_metadata": {},
        "xp_reward": 350,
        "coin_reward": 60,
        "duration_hours": 168,
        "cooldown_hours": 168,
        "is_active": True
    },
    {
        "name": "Trabalho Intenso",
        "name_en": "Intense Work",
        "description": "Complete 15 tarefas de trabalho",
        "icon": "💻",
        "quest_type": QuestType.WEEKLY,
        "category": QuestCategory.CATEGORY_SPECIFIC,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 15,
        "requirement_metadata": {"category": "work"},
        "xp_reward": 300,
        "coin_reward": 50,
        "duration_hours": 168,
        "cooldown_hours": 168,
        "is_active": True
    },
    {
        "name": "Crescimento Pessoal",
        "name_en": "Personal Growth",
        "description": "Complete 10 tarefas de desenvolvimento pessoal",
        "icon": "🌟",
        "quest_type": QuestType.WEEKLY,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 10,
        "requirement_metadata": {"category": "personal"},
        "xp_reward": 300,
        "coin_reward": 50,
        "duration_hours": 168,
        "cooldown_hours": 168,
        "is_active": True
    },
    {
        "name": "Saúde Semanal",
        "name_en": "Weekly Wellness",
        "description": "Complete 7 tarefas de saúde (uma por dia)",
        "icon": "🏃",
        "quest_type": QuestType.WEEKLY,
        "category": QuestCategory.CONSISTENCY,
        "requirement_type": "complete_category_tasks",
        "requirement_target": 7,
        "requirement_metadata": {"category": "health"},
        "xp_reward": 250,
        "coin_reward": 40,
        "duration_hours": 168,
        "cooldown_hours": 168,
        "is_active": True
    }
]

CONSISTENCY_QUESTS = [
    {
        "name": "Sequência de 3 Dias",
        "name_en": "3-Day Streak",
        "description": "Mantenha uma sequência de 3 dias",
        "icon": "🔥",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.CONSISTENCY,
        "requirement_type": "maintain_streak",
        "requirement_target": 3,
        "requirement_metadata": {},
        "xp_reward": 100,
        "coin_reward": 20,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    },
    {
        "name": "Sequência de 7 Dias",
        "name_en": "7-Day Streak",
        "description": "Mantenha uma sequência de 7 dias",
        "icon": "🔥🔥",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.CONSISTENCY,
        "requirement_type": "maintain_streak",
        "requirement_target": 7,
        "requirement_metadata": {},
        "xp_reward": 250,
        "coin_reward": 50,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    },
    {
        "name": "Sequência de 30 Dias",
        "name_en": "30-Day Streak",
        "description": "Mantenha uma sequência de 30 dias",
        "icon": "🔥🔥🔥",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.CONSISTENCY,
        "requirement_type": "maintain_streak",
        "requirement_target": 30,
        "requirement_metadata": {},
        "xp_reward": 1000,
        "coin_reward": 200,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    }
]

SPECIAL_QUESTS = [
    {
        "name": "Primeira Conquista",
        "name_en": "First Achievement",
        "description": "Desbloqueie sua primeira conquista",
        "icon": "🏆",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "unlock_achievement",
        "requirement_target": 1,
        "requirement_metadata": {},
        "xp_reward": 50,
        "coin_reward": 10,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    },
    {
        "name": "Colecionador de Conquistas",
        "name_en": "Achievement Collector",
        "description": "Desbloqueie 10 conquistas",
        "icon": "🎖️",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "unlock_achievement",
        "requirement_target": 10,
        "requirement_metadata": {},
        "xp_reward": 500,
        "coin_reward": 100,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    },
    {
        "name": "Nível 10",
        "name_en": "Level 10",
        "description": "Alcance o nível 10",
        "icon": "⭐",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "reach_level",
        "requirement_target": 10,
        "requirement_metadata": {},
        "xp_reward": 500,
        "coin_reward": 100,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    },
    {
        "name": "Mestre das Tarefas",
        "name_en": "Task Master",
        "description": "Complete 100 tarefas no total",
        "icon": "🎓",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "complete_tasks",
        "requirement_target": 100,
        "requirement_metadata": {},
        "xp_reward": 1000,
        "coin_reward": 200,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    },
    {
        "name": "Lenda",
        "name_en": "Legend",
        "description": "Complete 500 tarefas no total",
        "icon": "👑",
        "quest_type": QuestType.SPECIAL,
        "category": QuestCategory.PROGRESSION,
        "requirement_type": "complete_tasks",
        "requirement_target": 500,
        "requirement_metadata": {},
        "xp_reward": 5000,
        "coin_reward": 1000,
        "duration_hours": None,
        "cooldown_hours": 0,
        "is_active": True
    }
]


# ============================================================
# Seed Functions
# ============================================================

async def seed_quest_templates():
    """Seed all quest templates into the database."""
    async with get_sessionmaker()() as db:
        try:
            # Check if templates already exist
            result = await db.execute(select(QuestTemplate))
            existing = result.scalars().all()
            
            if existing:
                logger.warning(f"Found {len(existing)} existing quest templates")
                response = input("Do you want to delete and reseed? (yes/no): ")
                if response.lower() != "yes":
                    logger.info("Seeding cancelled")
                    return
                
                # Delete existing templates
                for template in existing:
                    await db.delete(template)
                await db.commit()
                logger.info("Deleted existing quest templates")

            # Seed daily quests
            logger.info(f"Seeding {len(DAILY_QUESTS)} daily quests...")
            for quest_data in DAILY_QUESTS:
                template = QuestTemplate(**quest_data)
                db.add(template)
            
            # Seed weekly quests
            logger.info(f"Seeding {len(WEEKLY_QUESTS)} weekly quests...")
            for quest_data in WEEKLY_QUESTS:
                template = QuestTemplate(**quest_data)
                db.add(template)
            
            # Seed consistency quests
            logger.info(f"Seeding {len(CONSISTENCY_QUESTS)} consistency quests...")
            for quest_data in CONSISTENCY_QUESTS:
                template = QuestTemplate(**quest_data)
                db.add(template)
            
            # Seed special quests
            logger.info(f"Seeding {len(SPECIAL_QUESTS)} special quests...")
            for quest_data in SPECIAL_QUESTS:
                template = QuestTemplate(**quest_data)
                db.add(template)

            await db.commit()
            
            total = len(DAILY_QUESTS) + len(WEEKLY_QUESTS) + len(CONSISTENCY_QUESTS) + len(SPECIAL_QUESTS)
            logger.info(f"✅ Successfully seeded {total} quest templates!")
            logger.info(f"   - Daily: {len(DAILY_QUESTS)}")
            logger.info(f"   - Weekly: {len(WEEKLY_QUESTS)}")
            logger.info(f"   - Consistency: {len(CONSISTENCY_QUESTS)}")
            logger.info(f"   - Special: {len(SPECIAL_QUESTS)}")

        except Exception as e:
            logger.error(f"Error seeding quest templates: {str(e)}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_quest_templates())
