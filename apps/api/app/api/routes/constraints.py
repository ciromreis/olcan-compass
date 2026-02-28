"""User Constraint Profile API Routes

Endpoints for managing user constraints and deterministic opportunity pruning.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from uuid import UUID
from datetime import datetime, timezone

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.constraints import UserConstraintProfile, OpportunityPruningLog
from app.db.models.application import Opportunity
from app.services.deterministic_pruner import pruner, PruningResult

router = APIRouter(prefix="/constraints", tags=["User Constraints"])


# Pydantic models for API
class ConstraintProfileRequest(BaseModel):
    """Request model for updating constraint profile"""
    budget_max: Optional[float] = Field(None, description="Maximum budget in USD")
    time_available_months: Optional[int] = Field(None, ge=0, description="Available time in months")
    weekly_bandwidth_hours: Optional[int] = Field(None, ge=0, description="Weekly bandwidth in hours")
    languages: List[Dict[str, Any]] = Field(default_factory=list, description="Language proficiencies")
    target_countries: List[str] = Field(default_factory=list, description="Preferred country codes")
    excluded_countries: List[str] = Field(default_factory=list, description="Excluded country codes")
    education_level: Optional[str] = Field(None, description="Highest education level")
    years_experience: Optional[int] = Field(None, ge=0, description="Years of experience")
    visa_status: Optional[str] = Field(None, description="Current visa status")
    citizenship_countries: List[str] = Field(default_factory=list, description="Citizenship countries")
    commitment_level: str = Field(default="flexible", description="Commitment level")
    risk_tolerance: str = Field(default="moderate", description="Risk tolerance")


class ConstraintProfileResponse(BaseModel):
    """Response model for constraint profile"""
    id: UUID
    user_id: UUID
    budget_max: Optional[float]
    time_available_months: Optional[int]
    weekly_bandwidth_hours: Optional[int]
    languages: List[Dict[str, Any]]
    target_countries: List[str]
    excluded_countries: List[str]
    education_level: Optional[str]
    years_experience: Optional[int]
    visa_status: Optional[str]
    citizenship_countries: List[str]
    commitment_level: str
    risk_tolerance: str
    is_active: bool
    last_updated_at: str
    created_at: str
    updated_at: str


class PruningExplanation(BaseModel):
    """Explanation for pruning decision"""
    title: str
    detail: str
    violations: List[Dict[str, Any]]
    is_pruned: bool


class PrunedOpportunity(BaseModel):
    """Opportunity with pruning information"""
    id: UUID
    title: str
    organization_name: Optional[str]
    location_country: Optional[str]
    opportunity_type: str
    is_pruned: bool
    overall_score: float
    constraint_score: float
    explanation: PruningExplanation


class PruningResponse(BaseModel):
    """Response for opportunity pruning"""
    opportunities: List[PrunedOpportunity]
    total_opportunities: int
    shown_opportunities: int
    hidden_opportunities: int
    pruning_version: str


@router.get("/profile", response_model=ConstraintProfileResponse)
async def get_constraint_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's constraint profile"""
    result = await db.execute(
        select(UserConstraintProfile).where(
            UserConstraintProfile.user_id == current_user.id
        )
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        # Create default profile
        profile = UserConstraintProfile(
            user_id=current_user.id,
            budget_max=None,
            time_available_months=None,
            weekly_bandwidth_hours=None,
            languages=[],
            target_countries=[],
            excluded_countries=[],
            education_level=None,
            years_experience=None,
            visa_status=None,
            citizenship_countries=[],
            commitment_level="flexible",
            risk_tolerance="moderate"
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    
    return ConstraintProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        budget_max=float(profile.budget_max) if profile.budget_max else None,
        time_available_months=profile.time_available_months,
        weekly_bandwidth_hours=profile.weekly_bandwidth_hours,
        languages=profile.languages,
        target_countries=profile.target_countries,
        excluded_countries=profile.excluded_countries,
        education_level=profile.education_level,
        years_experience=profile.years_experience,
        visa_status=profile.visa_status,
        citizenship_countries=profile.citizenship_countries,
        commitment_level=profile.commitment_level,
        risk_tolerance=profile.risk_tolerance,
        is_active=profile.is_active,
        last_updated_at=profile.last_updated_at.isoformat(),
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat()
    )


@router.put("/profile", response_model=ConstraintProfileResponse)
async def update_constraint_profile(
    request: ConstraintProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user's constraint profile"""
    result = await db.execute(
        select(UserConstraintProfile).where(
            UserConstraintProfile.user_id == current_user.id
        )
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        # Create new profile
        profile = UserConstraintProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update fields
    if request.budget_max is not None:
        profile.budget_max = request.budget_max
    if request.time_available_months is not None:
        profile.time_available_months = request.time_available_months
    if request.weekly_bandwidth_hours is not None:
        profile.weekly_bandwidth_hours = request.weekly_bandwidth_hours
    if request.languages is not None:
        profile.languages = request.languages
    if request.target_countries is not None:
        profile.target_countries = request.target_countries
    if request.excluded_countries is not None:
        profile.excluded_countries = request.excluded_countries
    if request.education_level is not None:
        profile.education_level = request.education_level
    if request.years_experience is not None:
        profile.years_experience = request.years_experience
    if request.visa_status is not None:
        profile.visa_status = request.visa_status
    if request.citizenship_countries is not None:
        profile.citizenship_countries = request.citizenship_countries
    if request.commitment_level is not None:
        profile.commitment_level = request.commitment_level
    if request.risk_tolerance is not None:
        profile.risk_tolerance = request.risk_tolerance
    
    profile.last_updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(profile)
    
    return ConstraintProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        budget_max=float(profile.budget_max) if profile.budget_max else None,
        time_available_months=profile.time_available_months,
        weekly_bandwidth_hours=profile.weekly_bandwidth_hours,
        languages=profile.languages,
        target_countries=profile.target_countries,
        excluded_countries=profile.excluded_countries,
        education_level=profile.education_level,
        years_experience=profile.years_experience,
        visa_status=profile.visa_status,
        citizenship_countries=profile.citizenship_countries,
        commitment_level=profile.commitment_level,
        risk_tolerance=profile.risk_tolerance,
        is_active=profile.is_active,
        last_updated_at=profile.last_updated_at.isoformat(),
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat()
    )


@router.post("/prune-opportunities", response_model=PruningResponse)
async def prune_opportunities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get opportunities pruned based on user constraints"""
    # Get all opportunities
    result = await db.execute(select(Opportunity).where(Opportunity.status == "published"))
    opportunities = result.scalars().all()
    
    # Prune based on constraints
    pruning_results = await pruner.prune_opportunities_for_user(
        db, str(current_user.id), opportunities
    )
    
    # Build response
    pruned_opportunities = []
    for result in pruning_results:
        # Find corresponding opportunity
        opportunity = next((opp for opp in opportunities if str(opp.id) == result.opportunity_id), None)
        if not opportunity:
            continue
        
        explanation = PruningExplanation(
            title=result.explanation_title or "Compatível",
            detail=result.explanation_detail or "Esta oportunidade corresponde ao seu perfil.",
            violations=[
                {
                    "type": v.constraint_type,
                    "reason": v.reason.value,
                    "details": v.details,
                    "severity": v.severity
                }
                for v in result.violations
            ],
            is_pruned=result.is_pruned
        )
        
        pruned_opportunity = PrunedOpportunity(
            id=opportunity.id,
            title=opportunity.title,
            organization_name=opportunity.organization_name,
            location_country=opportunity.location_country,
            opportunity_type=opportunity.opportunity_type.value,
            is_pruned=result.is_pruned,
            overall_score=result.overall_score,
            constraint_score=result.constraint_score,
            explanation=explanation
        )
        
        pruned_opportunities.append(pruned_opportunity)
    
    # Sort by score (highest first), but put non-pruned first
    pruned_opportunities.sort(key=lambda x: (x.is_pruned, -x.overall_score))
    
    shown_count = sum(1 for opp in pruned_opportunities if not opp.is_pruned)
    hidden_count = len(pruned_opportunities) - shown_count
    
    return PruningResponse(
        opportunities=pruned_opportunities,
        total_opportunities=len(opportunities),
        shown_opportunities=shown_count,
        hidden_opportunities=hidden_count,
        pruning_version=pruner.version
    )


@router.get("/pruning-history")
async def get_pruning_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's pruning history for transparency"""
    result = await db.execute(
        select(OpportunityPruningLog)
        .where(OpportunityPruningLog.user_id == current_user.id)
        .order_by(OpportunityPruningLog.created_at.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "opportunity_id": log.opportunity_id,
                "is_pruned": log.is_pruned,
                "pruning_reason": log.pruning_reason,
                "explanation_title": log.explanation_title,
                "explanation_detail": log.explanation_detail,
                "overall_score": log.overall_score,
                "constraint_score": log.constraint_score,
                "violated_constraints": log.violated_constraints,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ]
    }


@router.post("/feedback")
async def submit_pruning_feedback(
    pruning_log_id: UUID,
    feedback_type: str,  # correct_pruning, incorrect_pruning, show_anyway
    feedback_detail: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit feedback on pruning decision to improve algorithm"""
    # Verify log belongs to user
    result = await db.execute(
        select(OpportunityPruningLog).where(
            and_(
                OpportunityPruningLog.id == pruning_log_id,
                OpportunityPruningLog.user_id == current_user.id
            )
        )
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pruning log not found"
        )
    
    # Create feedback (would need to implement ConstraintFeedback model)
    # For now, just log it
    print(f"Feedback received: {feedback_type} for log {pruning_log_id}")
    
    return {"status": "feedback_received", "feedback_type": feedback_type}
