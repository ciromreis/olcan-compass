"""Archetype API Endpoints

Provides access to archetype configurations and recommendations.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.psychology import ArchetypeConfig, ProfessionalArchetype, PsychProfile
from app.core.auth import get_current_user
from app.db.models.user import User


router = APIRouter(prefix="/archetypes", tags=["archetypes"])


@router.get("/", response_model=List[dict])
async def list_archetypes(
    session: AsyncSession = Depends(get_db),
    include_inactive: bool = False
):
    """List all available archetypes
    
    Args:
        include_inactive: Include inactive archetypes (default: False)
        
    Returns:
        List of archetype configurations
    """
    query = select(ArchetypeConfig)
    
    if not include_inactive:
        query = query.where(ArchetypeConfig.is_active == True)
    
    query = query.order_by(ArchetypeConfig.archetype)
    
    result = await session.execute(query)
    archetypes = result.scalars().all()
    
    return [
        {
            "archetype": arch.archetype.value,
            "name_en": arch.name_en,
            "name_pt": arch.name_pt,
            "name_es": arch.name_es,
            "description_en": arch.description_en,
            "description_pt": arch.description_pt,
            "description_es": arch.description_es,
            "primary_motivator": arch.primary_motivator,
            "evolution_path": arch.evolution_path,
            "visual_theme": arch.companion_traits.get("visual_theme") if arch.companion_traits else "default"
        }
        for arch in archetypes
    ]


@router.get("/{archetype}", response_model=dict)
async def get_archetype(
    archetype: ProfessionalArchetype,
    session: AsyncSession = Depends(get_db),
    language: str = "en"
):
    """Get detailed information about a specific archetype
    
    Args:
        archetype: The archetype to retrieve
        language: Language for localized content (en, pt, es)
        
    Returns:
        Detailed archetype configuration
    """
    result = await session.execute(
        select(ArchetypeConfig).where(ArchetypeConfig.archetype == archetype)
    )
    arch_config = result.scalar_one_or_none()
    
    if not arch_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Archetype {archetype.value} not found"
        )
    
    # Select language-specific fields
    name_field = f"name_{language}" if language in ["en", "pt", "es"] else "name_en"
    desc_field = f"description_{language}" if language in ["en", "pt", "es"] else "description_en"
    
    return {
        "archetype": arch_config.archetype.value,
        "name": getattr(arch_config, name_field),
        "description": getattr(arch_config, desc_field),
        "primary_motivator": arch_config.primary_motivator,
        "primary_fear": arch_config.primary_fear,
        "evolution_path": arch_config.evolution_path,
        "preferred_route_types": arch_config.preferred_route_types,
        "route_weights": arch_config.route_weights,
        "narrative_voice": arch_config.narrative_voice,
        "companion_traits": arch_config.companion_traits,
        "interview_focus_areas": arch_config.interview_focus_areas,
        "service_preferences": arch_config.service_preferences,
        "typical_risk_tolerance": arch_config.typical_risk_tolerance,
        "decision_speed": arch_config.decision_speed,
        "content_themes": arch_config.content_themes,
        "success_metrics": arch_config.success_metrics,
        "preferred_quest_types": arch_config.preferred_quest_types,
        "achievement_priorities": arch_config.achievement_priorities
    }


@router.get("/recommend/for-user", response_model=dict)
async def recommend_archetype(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Recommend archetype based on user's psychological profile
    
    Returns:
        Recommended archetype with confidence score
    """
    # Get user's psych profile
    result = await session.execute(
        select(PsychProfile).where(PsychProfile.user_id == current_user.id)
    )
    psych_profile = result.scalar_one_or_none()
    
    if not psych_profile or not psych_profile.dominant_archetype:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User psychological profile not found or archetype not determined"
        )
    
    # Get archetype config
    result = await session.execute(
        select(ArchetypeConfig).where(
            ArchetypeConfig.archetype == psych_profile.dominant_archetype
        )
    )
    arch_config = result.scalar_one_or_none()
    
    if not arch_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archetype configuration not found"
        )
    
    return {
        "recommended_archetype": arch_config.archetype.value,
        "name_en": arch_config.name_en,
        "name_pt": arch_config.name_pt,
        "name_es": arch_config.name_es,
        "confidence_score": 0.85,  # Placeholder - would be calculated from assessment
        "primary_motivator": arch_config.primary_motivator,
        "evolution_path": arch_config.evolution_path,
        "recommended_routes": arch_config.preferred_route_types,
        "companion_personality": arch_config.companion_traits.get("personality") if arch_config.companion_traits else "supportive_guide"
    }


@router.get("/compare/{archetype1}/{archetype2}", response_model=dict)
async def compare_archetypes(
    archetype1: ProfessionalArchetype,
    archetype2: ProfessionalArchetype,
    session: AsyncSession = Depends(get_db)
):
    """Compare two archetypes side by side
    
    Args:
        archetype1: First archetype to compare
        archetype2: Second archetype to compare
        
    Returns:
        Comparison of the two archetypes
    """
    # Get both archetype configs
    result = await session.execute(
        select(ArchetypeConfig).where(
            ArchetypeConfig.archetype.in_([archetype1, archetype2])
        )
    )
    configs = result.scalars().all()
    
    if len(configs) != 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both archetypes not found"
        )
    
    config1 = next(c for c in configs if c.archetype == archetype1)
    config2 = next(c for c in configs if c.archetype == archetype2)
    
    return {
        "archetype1": {
            "archetype": config1.archetype.value,
            "name_en": config1.name_en,
            "primary_motivator": config1.primary_motivator,
            "primary_fear": config1.primary_fear,
            "risk_tolerance": config1.typical_risk_tolerance,
            "decision_speed": config1.decision_speed
        },
        "archetype2": {
            "archetype": config2.archetype.value,
            "name_en": config2.name_en,
            "primary_motivator": config2.primary_motivator,
            "primary_fear": config2.primary_fear,
            "risk_tolerance": config2.typical_risk_tolerance,
            "decision_speed": config2.decision_speed
        },
        "similarities": _find_similarities(config1, config2),
        "differences": _find_differences(config1, config2)
    }


def _find_similarities(config1: ArchetypeConfig, config2: ArchetypeConfig) -> List[str]:
    """Find similarities between two archetypes"""
    similarities = []
    
    if config1.typical_risk_tolerance == config2.typical_risk_tolerance:
        similarities.append(f"Both have {config1.typical_risk_tolerance} risk tolerance")
    
    if config1.decision_speed == config2.decision_speed:
        similarities.append(f"Both make decisions at {config1.decision_speed} speed")
    
    # Check for common route preferences
    common_routes = set(config1.preferred_route_types or []) & set(config2.preferred_route_types or [])
    if common_routes:
        similarities.append(f"Both prefer: {', '.join(common_routes)}")
    
    return similarities


def _find_differences(config1: ArchetypeConfig, config2: ArchetypeConfig) -> List[str]:
    """Find differences between two archetypes"""
    differences = []
    
    differences.append(f"{config1.name_en} motivated by {config1.primary_motivator}, {config2.name_en} by {config2.primary_motivator}")
    differences.append(f"{config1.name_en} fears {config1.primary_fear}, {config2.name_en} fears {config2.primary_fear}")
    
    if config1.typical_risk_tolerance != config2.typical_risk_tolerance:
        differences.append(f"Risk tolerance: {config1.name_en} is {config1.typical_risk_tolerance}, {config2.name_en} is {config2.typical_risk_tolerance}")
    
    return differences
