from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ..core.database import get_db
from ..models.companion import Companion as CompanionModel
from ..models.user import User as UserModel
from ..models.archetype import Archetype as ArchetypeModel
from ..schemas.companion import Companion, CompanionCreate, CompanionUpdate, CareActivity
from ..core.security import get_current_user
from ..services.companion_service import CompanionService

router = APIRouter(prefix="/api/companions", tags=["companions"])

@router.post("/", response_model=Companion)
async def create_companion(
    companion_data: CompanionCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new companion for the current user"""
    companion_service = CompanionService(db)
    
    # Check if user already has a companion
    existing_companion = companion_service.get_user_companion(current_user.id)
    if existing_companion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a companion"
        )
    
    # Verify archetype exists
    archetype = db.query(ArchetypeModel).filter(ArchetypeModel.id == companion_data.archetype_id).first()
    if not archetype:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archetype not found"
        )
    
    companion = companion_service.create_companion(current_user.id, companion_data)
    return companion

@router.get("/", response_model=List[Companion])
async def get_user_companions(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get all companions for the current user"""
    companion_service = CompanionService(db)
    companions = companion_service.get_user_companions(current_user.id)
    return companions

@router.get("/{companion_id}", response_model=Companion)
async def get_companion(
    companion_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific companion by ID"""
    companion_service = CompanionService(db)
    companion = companion_service.get_companion(companion_id)
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this companion"
        )
    
    return companion

@router.put("/{companion_id}", response_model=Companion)
async def update_companion(
    companion_id: str,
    companion_update: CompanionUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update a companion"""
    companion_service = CompanionService(db)
    companion = companion_service.get_companion(companion_id)
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this companion"
        )
    
    updated_companion = companion_service.update_companion(companion_id, companion_update)
    return updated_companion

@router.post("/{companion_id}/care", response_model=dict)
async def perform_care_activity(
    companion_id: str,
    activity: CareActivity,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Perform a care activity with companion"""
    companion_service = CompanionService(db)
    companion = companion_service.get_companion(companion_id)
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this companion"
        )
    
    result = companion_service.perform_care_activity(companion_id, activity)
    return result

@router.post("/{companion_id}/evolve", response_model=Companion)
async def evolve_companion(
    companion_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Evolve companion to next stage"""
    companion_service = CompanionService(db)
    companion = companion_service.get_companion(companion_id)
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this companion"
        )
    
    evolved_companion = companion_service.evolve_companion(companion_id)
    return evolved_companion

@router.get("/{companion_id}/stats", response_model=dict)
async def get_companion_stats(
    companion_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get detailed companion statistics"""
    companion_service = CompanionService(db)
    companion = companion_service.get_companion(companion_id)
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this companion"
        )
    
    stats = companion_service.get_companion_stats(companion_id)
    return stats

@router.delete("/{companion_id}", response_model=dict)
async def delete_companion(
    companion_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a companion"""
    companion_service = CompanionService(db)
    companion = companion_service.get_companion(companion_id)
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Companion not found"
        )
    
    if companion.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this companion"
        )
    
    companion_service.delete_companion(companion_id)
    return {"message": "Companion deleted successfully"}
