"""
Seed archetypes for companion system
"""

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..models.archetype import Archetype, Ability, EvolutionRequirement

ARCHETYPES_DATA = [
    {
        "name": "strategist",
        "title": "The Strategist",
        "description": "Master of tactical planning and strategic thinking",
        "motivator": "freedom",
        "companion_type": "fox",
        "base_abilities": [
            {"name": "Strategic Planning", "description": "Analyze situations and create optimal plans", "ability_type": "passive", "icon": "🧠"},
            {"name": "Risk Assessment", "description": "Evaluate risks and opportunities", "ability_type": "active", "icon": "📊"},
            {"name": "Independence", "description": "Self-reliant decision making", "ability_type": "passive", "icon": "🦊"}
        ],
        "base_stats": {"power": 70, "wisdom": 85, "charisma": 70, "agility": 75},
        "color_scheme": {"primary": "#8B5CF6", "secondary": "#6366F1"},
        "companion_description": "A clever fox companion with strategic insights and tactical prowess"
    },
    {
        "name": "innovator",
        "title": "The Innovator",
        "description": "Creative visionary who transforms ideas into reality",
        "motivator": "success",
        "companion_type": "dragon",
        "base_abilities": [
            {"name": "Creative Vision", "description": "See possibilities others miss", "ability_type": "passive", "icon": "👁️"},
            {"name": "Problem Solving", "description": "Innovative solutions to complex problems", "ability_type": "active", "icon": "💡"},
            {"name": "Transformation", "description": "Transform challenges into opportunities", "ability_type": "ultimate", "icon": "🐉"}
        ],
        "base_stats": {"power": 85, "wisdom": 80, "charisma": 75, "agility": 70},
        "color_scheme": {"primary": "#EF4444", "secondary": "#F97316"},
        "companion_description": "A powerful dragon companion that breathes innovation and creative solutions"
    },
    {
        "name": "creator",
        "title": "The Creator",
        "description": "Artistic soul who brings imagination to life",
        "motivator": "growth",
        "companion_type": "lion",
        "base_abilities": [
            {"name": "Artistic Expression", "description": "Express ideas through creative mediums", "ability_type": "active", "icon": "🎨"},
            {"name": "Inspiration", "description": "Inspire others with creative vision", "ability_type": "passive", "icon": "✨"},
            {"name": "Leadership", "description": "Lead creative projects with confidence", "ability_type": "active", "icon": "🦁"}
        ],
        "base_stats": {"power": 80, "wisdom": 70, "charisma": 85, "agility": 75},
        "color_scheme": {"primary": "#F59E0B", "secondary": "#EAB308"},
        "companion_description": "A majestic lion companion with creative courage and leadership"
    },
    {
        "name": "diplomat",
        "title": "The Diplomat",
        "description": "Bridge builder who connects diverse perspectives",
        "motivator": "adventure",
        "companion_type": "phoenix",
        "base_abilities": [
            {"name": "Communication", "description": "Build bridges through effective dialogue", "ability_type": "active", "icon": "🗣️"},
            {"name": "Cultural Intelligence", "description": "Navigate diverse cultural contexts", "ability_type": "passive", "icon": "🌍"},
            {"name": "Rebirth", "description": "Rise stronger from challenges", "ability_type": "ultimate", "icon": "🔥"}
        ],
        "base_stats": {"power": 75, "wisdom": 85, "charisma": 90, "agility": 70},
        "color_scheme": {"primary": "#EC4899", "secondary": "#F472B6"},
        "companion_description": "A graceful phoenix companion that rises above cultural barriers"
    },
    {
        "name": "pioneer",
        "title": "The Pioneer",
        "description": "Trailblazer who explores new territories",
        "motivator": "stability",
        "companion_type": "wolf",
        "base_abilities": [
            {"name": "Exploration", "description": "Discover new paths and opportunities", "ability_type": "active", "icon": "🧭"},
            {"name": "Adaptability", "description": "Thrive in changing environments", "ability_type": "passive", "icon": "🌿"},
            {"name": "Pack Leadership", "description": "Lead others through uncharted territory", "ability_type": "active", "icon": "🐺"}
        ],
        "base_stats": {"power": 80, "wisdom": 75, "charisma": 70, "agility": 85},
        "color_scheme": {"primary": "#10B981", "secondary": "#34D399"},
        "companion_description": "A loyal wolf companion that guides through new territories"
    },
    {
        "name": "scholar",
        "title": "The Scholar",
        "description": "Knowledge seeker who values learning above all",
        "motivator": "knowledge",
        "companion_type": "owl",
        "base_abilities": [
            {"name": "Wisdom", "description": "Deep understanding of complex topics", "ability_type": "passive", "icon": "🦉"},
            {"name": "Research", "description": "Uncover hidden knowledge through study", "ability_type": "active", "icon": "📚"},
            {"name": "Insight", "description": "See patterns others miss", "ability_type": "ultimate", "icon": "🔮"}
        ],
        "base_stats": {"power": 70, "wisdom": 90, "charisma": 75, "agility": 70},
        "color_scheme": {"primary": "#6366F1", "secondary": "#818CF8"},
        "companion_description": "A wise owl companion with deep knowledge and scholarly insight"
    },
    {
        "name": "guardian",
        "title": "The Guardian",
        "description": "Protector who ensures safety and security",
        "motivator": "safety",
        "companion_type": "bear",
        "base_abilities": [
            {"name": "Protection", "description": "Shield others from harm", "ability_type": "active", "icon": "🛡️"},
            {"name": "Strength", "description": "Physical and emotional resilience", "ability_type": "passive", "icon": "💪"},
            {"name": "Guardian's Roar", "description": "Powerful protective presence", "ability_type": "ultimate", "icon": "🐻"}
        ],
        "base_stats": {"power": 90, "wisdom": 70, "charisma": 75, "agility": 65},
        "color_scheme": {"primary": "#059669", "secondary": "#10B981"},
        "companion_description": "A strong bear companion that provides protection and security"
    },
    {
        "name": "visionary",
        "title": "The Visionary",
        "description": "Future-focused dreamer who sees possibilities",
        "motivator": "purpose",
        "companion_type": "eagle",
        "base_abilities": [
            {"name": "Foresight", "description": "See future trends and possibilities", "ability_type": "passive", "icon": "👁️"},
            {"name": "Inspiration", "description": "Inspire others with vision", "ability_type": "active", "icon": "⭐"},
            {"name": "Soaring Vision", "description": "Elevate perspective to see the big picture", "ability_type": "ultimate", "icon": "🦅"}
        ],
        "base_stats": {"power": 75, "wisdom": 85, "charisma": 80, "agility": 80},
        "color_scheme": {"primary": "#DB2777", "secondary": "#F472B6"},
        "companion_description": "A majestic eagle companion with elevated vision and insight"
    },
    {
        "name": "academic",
        "title": "The Academic",
        "description": "Dedicated scholar pursuing intellectual excellence",
        "motivator": "knowledge",
        "companion_type": "deer",
        "base_abilities": [
            {"name": "Research", "description": "Systematic investigation and discovery", "ability_type": "active", "icon": "🔬"},
            {"name": "Critical Thinking", "description": "Analyze information with precision", "ability_type": "passive", "icon": "🧪"},
            {"name": "Scholar's Wisdom", "description": "Deep academic understanding", "ability_type": "ultimate", "icon": "🦌"}
        ],
        "base_stats": {"power": 70, "wisdom": 90, "charisma": 70, "agility": 75},
        "color_scheme": {"primary": "#7C3AED", "secondary": "#8B5CF6"},
        "companion_description": "A graceful deer companion with scholarly wisdom and precision"
    },
    {
        "name": "executive",
        "title": "The Executive",
        "description": "Strategic leader who drives organizational success",
        "motivator": "success",
        "companion_type": "tiger",
        "base_abilities": [
            {"name": "Leadership", "description": "Strategic decision making", "ability_type": "active", "icon": "👔"},
            {"name": "Strategy", "description": "Long-term planning and execution", "ability_type": "passive", "icon": "📋"},
            {"name": "Executive Power", "description": "Decisive action and results", "ability_type": "ultimate", "icon": "🐅"}
        ],
        "base_stats": {"power": 85, "wisdom": 80, "charisma": 85, "agility": 70},
        "color_scheme": {"primary": "#F97316", "secondary": "#FB923C"},
        "companion_description": "A powerful tiger companion with executive leadership and strategic vision"
    },
    {
        "name": "creative",
        "title": "The Creative",
        "description": "Artistic innovator who expresses through imagination",
        "motivator": "expression",
        "companion_type": "butterfly",
        "base_abilities": [
            {"name": "Creativity", "description": "Generate innovative ideas", "ability_type": "active", "icon": "🎭"},
            {"name": "Inspiration", "description": "Inspire creative expression", "ability_type": "passive", "icon": "🌈"},
            {"name": "Transformation", "description": "Transform ideas into beautiful reality", "ability_type": "ultimate", "icon": "🦋"}
        ],
        "base_stats": {"power": 70, "wisdom": 80, "charisma": 85, "agility": 80},
        "color_scheme": {"primary": "#A855F7", "secondary": "#C084FC"},
        "companion_description": "A beautiful butterfly companion that brings creative transformation"
    },
    {
        "name": "optimizer",
        "title": "The Optimizer",
        "description": "Efficiency expert who maximizes potential",
        "motivator": "efficiency",
        "companion_type": "dolphin",
        "base_abilities": [
            {"name": "Optimization", "description": "Improve systems and processes", "ability_type": "active", "icon": "⚙️"},
            {"name": "Efficiency", "description": "Maximize output with minimal input", "ability_type": "passive", "icon": "📈"},
            {"name": "Flow State", "description": "Achieve perfect efficiency and harmony", "ability_type": "ultimate", "icon": "🐬"}
        ],
        "base_stats": {"power": 75, "wisdom": 85, "charisma": 75, "agility": 85},
        "color_scheme": {"primary": "#06B6D4", "secondary": "#22D3EE"},
        "companion_description": "A playful dolphin companion that optimizes everything with grace"
    }
]

async def seed_archetypes(db: Session) -> None:
    """Seed archetypes if the table is empty."""
    result = await db.execute(select(func.count(Archetype.id)))
    count = result.scalar() or 0
    
    if count > 0:
        print(f"Archetypes table already has {count} records. Skipping seed.")
        return
    
    print("Seeding archetypes...")
    
    for archetype_data in ARCHETYPES_DATA:
        # Create archetype
        archetype = Archetype(
            name=archetype_data["name"],
            title=archetype_data["title"],
            description=archetype_data["description"],
            motivator=archetype_data["motivator"],
            companion_type=archetype_data["companion_type"],
            base_abilities=archetype_data["base_abilities"],
            base_stats=archetype_data["base_stats"],
            color_scheme=archetype_data["color_scheme"],
            companion_description=archetype_data["companion_description"],
            is_active="True",
            sort_order=len(ARCHETYPES_DATA) - ARCHETYPES_DATA.index(archetype_data)
        )
        
        db.add(archetype)
        await db.flush()  # Get the ID
        
        # Create abilities
        for i, ability_data in enumerate(archetype_data["base_abilities"]):
            ability = Ability(
                archetype_id=archetype.id,
                name=ability_data["name"],
                description=ability_data["description"],
                ability_type=ability_data["ability_type"],
                icon=ability_data["icon"],
                unlock_level=1,
                evolution_stage="egg",
                is_active="True",
                sort_order=i
            )
            db.add(ability)
        
        # Create evolution requirements
        evolution_stages = ["egg", "sprout", "young", "mature", "master", "legendary"]
        for i, stage in enumerate(evolution_stages):
            requirement = EvolutionRequirement(
                archetype_id=archetype.id,
                stage=stage,
                level=i + 1,
                xp_required=500 * (i + 1),
                abilities_required=[],
                special_conditions=[],
                stat_increases={"power": 5, "wisdom": 5, "charisma": 5, "agility": 5},
                ability_unlocks=[],
                is_active="True"
            )
            db.add(requirement)
    
    await db.commit()
    print(f"✓ Seeded {len(ARCHETYPES_DATA)} archetypes with abilities and evolution requirements")
