"""
Companion (Aura) API — Olcan Compass v2.5

Manages the per-user companion/aura that is the gamification core:
  - 12 canonical archetypes (institutional_escapee … lifestyle_optimizer)
  - 6 evolution stages (egg → sprout → young → mature → master → legendary)
  - Care activities: feed, train, play, rest
  - XP / level / evolution progression

Response shape matches the frontend Aura TypeScript interface exactly.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional
from math import floor

from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.companion import Companion, CompanionActivity

router = APIRouter(tags=["companions"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

EVOLUTION_STAGES = ["egg", "sprout", "young", "mature", "master", "legendary"]

# XP thresholds to enter each stage (index = stage index)
STAGE_XP_THRESHOLDS = [0, 500, 1500, 3500, 7000, 12000]
# Level at which each stage becomes available
STAGE_LEVEL_THRESHOLDS = [1, 5, 12, 22, 35, 50]

# Activity effects map
ACTIVITY_EFFECTS: Dict[str, Dict[str, Any]] = {
    "feed": {
        "xp": 10, "energy": 15, "happiness": 5, "health": 5,
        "energy_cost": 0, "description": "Calibrou a Aura"
    },
    "train": {
        "xp": 25, "energy": -15, "happiness": -5, "health": 0,
        "energy_cost": 15, "description": "Potencializou a Aura"
    },
    "play": {
        "xp": 12, "energy": -8, "happiness": 15, "health": 0,
        "energy_cost": 8, "description": "Manifestou a Aura"
    },
    "rest": {
        "xp": 3, "energy": 30, "happiness": 3, "health": 10,
        "energy_cost": 0, "description": "Preservou a Aura"
    },
    # Accept the Portuguese-named activities from the store too
    "groom":     {"xp": 8, "energy": -5, "happiness": 10, "health": 5, "energy_cost": 5, "description": "Harmonizou a Aura"},
    "socialize":  {"xp": 15, "energy": -10, "happiness": 20, "health": 0, "energy_cost": 10, "description": "Conectou a Aura"},
}

# Archetype → starting abilities (slug → list of ability dicts)
ARCHETYPE_ABILITIES: Dict[str, list] = {
    "institutional_escapee": [
        {"name": "Planejamento Estratégico", "description": "Analisa situações com precisão estratégica", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Avaliação de Risco", "description": "Identifica e mitiga riscos institucionais", "abilityType": "active", "powerLevel": 1, "cooldown": 30, "isUnlocked": True},
    ],
    "scholarship_cartographer": [
        {"name": "Excelência em Pesquisa", "description": "Domina o processo de candidatura acadêmica", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Escrita Acadêmica", "description": "Produz narrativas de alto nível acadêmico", "abilityType": "active", "powerLevel": 1, "cooldown": 45, "isUnlocked": True},
    ],
    "career_pivot": [
        {"name": "Adaptabilidade", "description": "Transfere habilidades para novos contextos", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Mentalidade de Crescimento", "description": "Acelera o aprendizado em novas áreas", "abilityType": "active", "powerLevel": 1, "cooldown": 40, "isUnlocked": True},
    ],
    "global_nomad": [
        {"name": "Fluência Cultural", "description": "Adapta-se rapidamente a novos ambientes", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Independência Geográfica", "description": "Opera com eficiência em qualquer jurisdição", "abilityType": "active", "powerLevel": 1, "cooldown": 35, "isUnlocked": True},
    ],
    "technical_bridge_builder": [
        {"name": "Excelência Técnica", "description": "Demonstra competência técnica diferenciada", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Design de Sistemas", "description": "Arquiteta soluções de alta escalabilidade", "abilityType": "active", "powerLevel": 1, "cooldown": 50, "isUnlocked": True},
    ],
    "insecure_corporate_dev": [
        {"name": "Domínio de Entrevistas", "description": "Performa sob pressão com confiança crescente", "abilityType": "active", "powerLevel": 1, "cooldown": 60, "isUnlocked": True},
        {"name": "Comunicação Técnica", "description": "Explica conceitos complexos com clareza", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
    ],
    "exhausted_solo_mother": [
        {"name": "Planejamento Familiar", "description": "Otimiza recursos para proteger a família", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Resiliência", "description": "Supera obstáculos com força extraordinária", "abilityType": "active", "powerLevel": 1, "cooldown": 45, "isUnlocked": True},
    ],
    "trapped_public_servant": [
        {"name": "Especialidade em Políticas", "description": "Navega sistemas complexos com maestria", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Criação de Impacto", "description": "Gera transformação sistêmica mensurável", "abilityType": "active", "powerLevel": 1, "cooldown": 55, "isUnlocked": True},
    ],
    "academic_hermit": [
        {"name": "Pesquisa Profunda", "description": "Penetra na essência de problemas complexos", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Síntese de Conhecimento", "description": "Conecta insights entre domínios distintos", "abilityType": "active", "powerLevel": 1, "cooldown": 40, "isUnlocked": True},
    ],
    "executive_refugee": [
        {"name": "Liderança Estratégica", "description": "Inspira equipes a resultados excepcionais", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Gestão de Patrimônio", "description": "Preserva e multiplica ativos em transição", "abilityType": "active", "powerLevel": 1, "cooldown": 50, "isUnlocked": True},
    ],
    "creative_visionary": [
        {"name": "Expressão Criativa", "description": "Transforma conceitos em arte que conecta", "abilityType": "active", "powerLevel": 1, "cooldown": 35, "isUnlocked": True},
        {"name": "Adaptação Cultural", "description": "Dialoga com múltiplos contextos culturais", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
    ],
    "lifestyle_optimizer": [
        {"name": "Análise de Dados", "description": "Decide com base em evidências quantitativas", "abilityType": "passive", "powerLevel": 1, "cooldown": None, "isUnlocked": True},
        {"name": "Otimização", "description": "Maximiza resultados com mínimo de recursos", "abilityType": "active", "powerLevel": 1, "cooldown": 40, "isUnlocked": True},
    ],
}

# Archetype → initial stat weights (base 70, archetype modifies emphasis)
ARCHETYPE_BASE_STATS: Dict[str, Dict[str, int]] = {
    "institutional_escapee":   {"power": 75, "wisdom": 80, "charisma": 70, "agility": 75, "battlesWon": 0, "battlesLost": 0},
    "scholarship_cartographer": {"power": 65, "wisdom": 90, "charisma": 70, "agility": 65, "battlesWon": 0, "battlesLost": 0},
    "career_pivot":            {"power": 70, "wisdom": 75, "charisma": 75, "agility": 80, "battlesWon": 0, "battlesLost": 0},
    "global_nomad":            {"power": 70, "wisdom": 70, "charisma": 80, "agility": 85, "battlesWon": 0, "battlesLost": 0},
    "technical_bridge_builder": {"power": 85, "wisdom": 80, "charisma": 65, "agility": 70, "battlesWon": 0, "battlesLost": 0},
    "insecure_corporate_dev":  {"power": 75, "wisdom": 75, "charisma": 65, "agility": 75, "battlesWon": 0, "battlesLost": 0},
    "exhausted_solo_mother":   {"power": 80, "wisdom": 70, "charisma": 75, "agility": 70, "battlesWon": 0, "battlesLost": 0},
    "trapped_public_servant":  {"power": 70, "wisdom": 80, "charisma": 80, "agility": 65, "battlesWon": 0, "battlesLost": 0},
    "academic_hermit":         {"power": 65, "wisdom": 95, "charisma": 60, "agility": 65, "battlesWon": 0, "battlesLost": 0},
    "executive_refugee":       {"power": 80, "wisdom": 85, "charisma": 85, "agility": 65, "battlesWon": 0, "battlesLost": 0},
    "creative_visionary":      {"power": 65, "wisdom": 75, "charisma": 90, "agility": 75, "battlesWon": 0, "battlesLost": 0},
    "lifestyle_optimizer":     {"power": 70, "wisdom": 85, "charisma": 70, "agility": 80, "battlesWon": 0, "battlesLost": 0},
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _xp_to_next_level(level: int) -> int:
    """XP required to reach the next level — grows ~50% per level."""
    return floor(100 * (1.5 ** (level - 1)))


def _calculate_level_from_xp(xp: int) -> int:
    """Return the level corresponding to accumulated XP."""
    level = 1
    total = 0
    while True:
        threshold = _xp_to_next_level(level)
        if total + threshold > xp:
            break
        total += threshold
        level += 1
        if level > 100:
            break
    return level


def _determine_stage(xp: int, level: int) -> str:
    """Return the evolution stage based on XP and level."""
    for i in range(len(STAGE_XP_THRESHOLDS) - 1, -1, -1):
        if xp >= STAGE_XP_THRESHOLDS[i] and level >= STAGE_LEVEL_THRESHOLDS[i]:
            return EVOLUTION_STAGES[i]
    return "egg"


def _companion_to_aura(c: Companion) -> dict:
    """Serialize a Companion row to the frontend Aura interface shape."""
    level = _calculate_level_from_xp(c.xp)
    stage = _determine_stage(c.xp, level)
    # keep model stage in sync
    if c.evolution_stage != stage:
        c.evolution_stage = stage

    abilities_raw = c.abilities or []
    # Attach stable IDs if missing (for serialization)
    abilities = []
    for idx, ab in enumerate(abilities_raw):
        abilities.append({
            "id": ab.get("id", f"{c.id}-ability-{idx}"),
            "name": ab.get("name", ""),
            "description": ab.get("description", ""),
            "abilityType": ab.get("abilityType", "passive"),
            "powerLevel": ab.get("powerLevel", 1),
            "cooldown": ab.get("cooldown"),
            "unlockedAt": ab.get("unlockedAt"),
            "isUnlocked": ab.get("isUnlocked", True),
        })

    return {
        "id": str(c.id),
        "userId": str(c.user_id),
        "name": c.name,
        "archetype": c.archetype,
        "evolutionStage": c.evolution_stage,
        "level": level,
        "experiencePoints": c.xp,
        "xpToNextLevel": _xp_to_next_level(level),
        "health": c.current_health,
        "maxHealth": c.max_health,
        "happiness": c.happiness,
        "energy": c.energy,
        "maxEnergy": c.max_energy,
        "stats": c.stats or ARCHETYPE_BASE_STATS.get(c.archetype, {"power": 70, "wisdom": 70, "charisma": 70, "agility": 70, "battlesWon": 0, "battlesLost": 0}),
        "abilities": abilities,
        "createdAt": c.created_at.isoformat() if c.created_at else None,
        "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
        "lastCaredAt": c.last_cared_at.isoformat() if c.last_cared_at else None,
    }


async def _get_owned_companion(
    companion_id: int,
    user_id: int,
    db: AsyncSession,
    lock: bool = False,
) -> Companion:
    stmt = select(Companion).where(
        Companion.id == companion_id,
        Companion.user_id == user_id,
    )
    result = await db.execute(stmt)
    companion = result.scalar_one_or_none()
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found",
        )
    return companion


# ---------------------------------------------------------------------------
# Request schemas (inline Pydantic — no separate file needed)
# ---------------------------------------------------------------------------

class CompanionCreateBody(BaseModel):
    name: str
    archetype: str


class CareActivityBody(BaseModel):
    activity_type: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/", response_model=list)
async def get_user_companions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all companions for the authenticated user."""
    result = await db.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    companions = result.scalars().all()
    return [_companion_to_aura(c) for c in companions]


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_companion(
    body: CompanionCreateBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create the user's companion with archetype-specific abilities and stats."""
    # One companion per user
    existing = await db.execute(
        select(Companion).where(Companion.user_id == current_user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a companion",
        )

    archetype = body.archetype
    abilities = [
        {**ab, "id": f"ability-{i}", "unlockedAt": datetime.utcnow().isoformat()}
        for i, ab in enumerate(ARCHETYPE_ABILITIES.get(archetype, []))
    ]
    base_stats = ARCHETYPE_BASE_STATS.get(
        archetype,
        {"power": 70, "wisdom": 70, "charisma": 70, "agility": 70, "battlesWon": 0, "battlesLost": 0},
    )

    companion = Companion(
        user_id=current_user.id,
        name=body.name,
        archetype=archetype,
        type=archetype,  # keep legacy field in sync
        level=1,
        xp=0,
        xp_to_next=_xp_to_next_level(1),
        evolution_stage="egg",
        abilities=abilities,
        stats=base_stats,
        current_health=100.0,
        max_health=100.0,
        happiness=100.0,
        energy=100.0,
        max_energy=100.0,
    )

    db.add(companion)
    await db.commit()
    await db.refresh(companion)
    return _companion_to_aura(companion)


@router.get("/{companion_id}", response_model=dict)
async def get_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    companion = await _get_owned_companion(companion_id, current_user.id, db)
    return _companion_to_aura(companion)


@router.post("/{companion_id}/care", response_model=dict)
async def perform_care_activity(
    companion_id: int,
    body: CareActivityBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Unified care endpoint — accepts feed | train | play | rest | groom | socialize."""
    activity_type = body.activity_type
    effects = ACTIVITY_EFFECTS.get(activity_type)
    if not effects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown activity type: {activity_type}",
        )

    companion = await _get_owned_companion(companion_id, current_user.id, db)

    # Enforce energy cost
    if companion.energy < effects["energy_cost"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough energy for this activity",
        )

    # Apply effects (clamp to [0, max])
    companion.xp = companion.xp + effects["xp"]
    companion.energy = max(0.0, min(companion.max_energy, companion.energy + effects["energy"]))
    companion.happiness = max(0.0, min(100.0, companion.happiness + effects["happiness"]))
    companion.current_health = max(0.0, min(companion.max_health, companion.current_health + effects["health"]))
    companion.last_cared_at = datetime.utcnow()

    # Level up check
    new_level = _calculate_level_from_xp(companion.xp)
    leveled_up = new_level > companion.level
    companion.level = new_level
    companion.xp_to_next = _xp_to_next_level(new_level)

    # Evolution stage update
    companion.evolution_stage = _determine_stage(companion.xp, companion.level)

    # Persist activity record
    activity_record = CompanionActivity(
        companion_id=companion.id,
        activity_type=activity_type,
        xp_reward=effects["xp"],
        energy_cost=effects["energy_cost"],
        description=effects["description"],
    )
    db.add(activity_record)

    await db.commit()
    await db.refresh(companion)

    return {
        **_companion_to_aura(companion),
        "activityResult": {
            "type": activity_type,
            "xpGained": effects["xp"],
            "leveledUp": leveled_up,
            "newLevel": companion.level,
            "energyChange": effects["energy"],
            "happinessChange": effects["happiness"],
            "healthChange": effects["health"],
        },
    }


@router.get("/{companion_id}/activities", response_model=list)
async def get_companion_activities(
    companion_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_companion(companion_id, current_user.id, db)

    result = await db.execute(
        select(CompanionActivity)
        .where(CompanionActivity.companion_id == companion_id)
        .order_by(CompanionActivity.completed_at.desc())
        .limit(limit)
    )
    activities = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "type": a.activity_type,
            "xpReward": a.xp_reward,
            "energyCost": a.energy_cost,
            "description": a.description,
            "performedAt": a.completed_at.isoformat() if a.completed_at else None,
        }
        for a in activities
    ]


@router.get("/{companion_id}/evolution/check", response_model=dict)
async def check_evolution_eligibility(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return whether the companion can evolve and what's missing."""
    companion = await _get_owned_companion(companion_id, current_user.id, db)
    level = _calculate_level_from_xp(companion.xp)
    current_stage_idx = EVOLUTION_STAGES.index(companion.evolution_stage)
    next_stage_idx = current_stage_idx + 1

    if next_stage_idx >= len(EVOLUTION_STAGES):
        return {"eligible": False, "reason": "Already at maximum evolution stage"}

    xp_needed = STAGE_XP_THRESHOLDS[next_stage_idx]
    level_needed = STAGE_LEVEL_THRESHOLDS[next_stage_idx]
    eligible = companion.xp >= xp_needed and level >= level_needed

    return {
        "eligible": eligible,
        "currentStage": companion.evolution_stage,
        "nextStage": EVOLUTION_STAGES[next_stage_idx],
        "requirements": {
            "minXp": xp_needed,
            "currentXp": companion.xp,
            "minLevel": level_needed,
            "currentLevel": level,
        },
        "reason": None if eligible else f"Need XP ≥ {xp_needed} and level ≥ {level_needed}",
    }


@router.post("/{companion_id}/evolution", response_model=dict)
async def trigger_evolution(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Evolve the companion to the next stage if eligible."""
    companion = await _get_owned_companion(companion_id, current_user.id, db)
    level = _calculate_level_from_xp(companion.xp)
    current_stage_idx = EVOLUTION_STAGES.index(companion.evolution_stage)
    next_stage_idx = current_stage_idx + 1

    if next_stage_idx >= len(EVOLUTION_STAGES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Companion is already at the maximum evolution stage",
        )

    xp_needed = STAGE_XP_THRESHOLDS[next_stage_idx]
    level_needed = STAGE_LEVEL_THRESHOLDS[next_stage_idx]
    if companion.xp < xp_needed or level < level_needed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Evolution requires XP ≥ {xp_needed} and level ≥ {level_needed}",
        )

    prev_stage = companion.evolution_stage
    companion.evolution_stage = EVOLUTION_STAGES[next_stage_idx]

    # Stat boost on evolution
    stats = companion.stats or {}
    boost = 5 * next_stage_idx  # grows with each tier
    for stat in ("power", "wisdom", "charisma", "agility"):
        stats[stat] = stats.get(stat, 70) + boost
    companion.stats = stats

    await db.commit()
    await db.refresh(companion)

    return {
        **_companion_to_aura(companion),
        "evolutionResult": {
            "fromStage": prev_stage,
            "toStage": companion.evolution_stage,
            "statBoost": boost,
        },
    }


# ---------------------------------------------------------------------------
# Legacy individual action endpoints (kept for backward compat)
# ---------------------------------------------------------------------------

@router.post("/{companion_id}/feed", include_in_schema=False)
async def feed_companion(companion_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await perform_care_activity(companion_id, CareActivityBody(activity_type="feed"), current_user, db)

@router.post("/{companion_id}/train", include_in_schema=False)
async def train_companion(companion_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await perform_care_activity(companion_id, CareActivityBody(activity_type="train"), current_user, db)

@router.post("/{companion_id}/play", include_in_schema=False)
async def play_with_companion(companion_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await perform_care_activity(companion_id, CareActivityBody(activity_type="play"), current_user, db)

@router.post("/{companion_id}/rest", include_in_schema=False)
async def rest_companion(companion_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await perform_care_activity(companion_id, CareActivityBody(activity_type="rest"), current_user, db)
