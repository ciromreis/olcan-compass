"""RouteBuilder API Endpoints

Provides endpoints for creating and managing dynamic routes.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.route import RouteBuilder, DynamicMilestone, RouteCategory
from app.db.models.psychology import ProfessionalArchetype
from app.core.auth import get_current_user
from app.db.models.user import User
from app.services.route_builder_service import RouteBuilderService


router = APIRouter(prefix="/routes/builder", tags=["route-builder"])


# Pydantic models for request/response
class CreateRouteRequest(BaseModel):
    category: RouteCategory
    target_outcome: str = Field(..., min_length=5, max_length=300)
    target_location: str = Field(..., min_length=2, max_length=200)
    target_organization: Optional[str] = Field(None, max_length=300)
    current_situation: Optional[Dict[str, Any]] = None
    timeline_months: int = Field(12, ge=1, le=60)
    budget_usd: int = Field(0, ge=0)
    visa_requirements: Optional[List[str]] = None
    language_requirements: Optional[List[str]] = None
    job_description: Optional[str] = None


class UpdateRouteRequest(BaseModel):
    target_outcome: Optional[str] = None
    target_location: Optional[str] = None
    target_organization: Optional[str] = None
    timeline_months: Optional[int] = None
    budget_usd: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class CompleteTaskRequest(BaseModel):
    task_name: str
    evidence: Optional[str] = None


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_route(
    request: CreateRouteRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new dynamic route
    
    Creates a route with automatically generated milestones based on:
    - Route category
    - User's archetype
    - Target outcome and location
    - Current situation
    
    Returns:
        Created route with generated milestones
    """
    service = RouteBuilderService(session)
    
    # Get user's archetype from psych profile
    from app.db.models.psychology import PsychProfile
    result = await session.execute(
        select(PsychProfile).where(PsychProfile.user_id == current_user.id)
    )
    psych_profile = result.scalar_one_or_none()
    archetype = psych_profile.dominant_archetype if psych_profile else None
    
    # Create route
    route = await service.create_route(
        user_id=current_user.id,
        category=request.category,
        target_outcome=request.target_outcome,
        target_location=request.target_location,
        archetype=archetype,
        target_organization=request.target_organization,
        current_situation=request.current_situation,
        timeline_months=request.timeline_months,
        budget_usd=request.budget_usd,
        visa_requirements=request.visa_requirements,
        language_requirements=request.language_requirements,
        job_description=request.job_description
    )
    
    # Get milestones
    milestones_result = await session.execute(
        select(DynamicMilestone)
        .where(DynamicMilestone.route_builder_id == route.id)
        .order_by(DynamicMilestone.display_order)
    )
    milestones = milestones_result.scalars().all()
    
    return {
        "id": str(route.id),
        "name": route.name,
        "category": route.category,
        "target_outcome": route.target_outcome,
        "target_location": route.target_location,
        "status": route.status,
        "timeline_months": route.timeline_months,
        "milestones_count": len(milestones),
        "created_at": route.created_at.isoformat(),
        "message": "Route created successfully! Ready to start your journey?"
    }


@router.get("/", response_model=List[dict])
async def list_user_routes(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None
):
    """List all routes for current user
    
    Args:
        status_filter: Filter by status (draft, active, completed, paused)
        category_filter: Filter by category
        
    Returns:
        List of user's routes
    """
    query = select(RouteBuilder).where(RouteBuilder.user_id == current_user.id)
    
    if status_filter:
        query = query.where(RouteBuilder.status == status_filter)
    
    if category_filter:
        query = query.where(RouteBuilder.category == category_filter)
    
    query = query.order_by(RouteBuilder.created_at.desc())
    
    result = await session.execute(query)
    routes = result.scalars().all()
    
    return [
        {
            "id": str(route.id),
            "name": route.name,
            "category": route.category,
            "target_outcome": route.target_outcome,
            "target_location": route.target_location,
            "status": route.status,
            "completion_percentage": route.completion_percentage,
            "timeline_months": route.timeline_months,
            "created_at": route.created_at.isoformat(),
            "started_at": route.started_at.isoformat() if route.started_at else None
        }
        for route in routes
    ]


@router.get("/{route_id}", response_model=dict)
async def get_route(
    route_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed route information
    
    Args:
        route_id: Route UUID
        
    Returns:
        Detailed route information
    """
    result = await session.execute(
        select(RouteBuilder).where(
            RouteBuilder.id == route_id,
            RouteBuilder.user_id == current_user.id
        )
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    return {
        "id": str(route.id),
        "name": route.name,
        "description": route.description,
        "category": route.category,
        "archetype": route.archetype,
        "target_outcome": route.target_outcome,
        "target_location": route.target_location,
        "target_organization": route.target_organization,
        "current_situation": route.current_situation,
        "timeline_months": route.timeline_months,
        "budget_usd": route.budget_usd,
        "visa_requirements": route.visa_requirements,
        "language_requirements": route.language_requirements,
        "route_config": route.route_config,
        "personalization": route.personalization,
        "status": route.status,
        "completion_percentage": route.completion_percentage,
        "current_milestone_index": route.current_milestone_index,
        "ats_analysis": route.ats_analysis,
        "tags": route.tags,
        "notes": route.notes,
        "created_at": route.created_at.isoformat(),
        "started_at": route.started_at.isoformat() if route.started_at else None,
        "completed_at": route.completed_at.isoformat() if route.completed_at else None
    }


@router.get("/{route_id}/milestones", response_model=List[dict])
async def get_route_milestones(
    route_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all milestones for a route
    
    Args:
        route_id: Route UUID
        
    Returns:
        List of milestones ordered by display_order
    """
    # Verify route belongs to user
    route_result = await session.execute(
        select(RouteBuilder).where(
            RouteBuilder.id == route_id,
            RouteBuilder.user_id == current_user.id
        )
    )
    route = route_result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Get milestones
    result = await session.execute(
        select(DynamicMilestone)
        .where(DynamicMilestone.route_builder_id == route_id)
        .order_by(DynamicMilestone.display_order)
    )
    milestones = result.scalars().all()
    
    return [
        {
            "id": str(m.id),
            "name": m.name,
            "description": m.description,
            "display_order": m.display_order,
            "category": m.category,
            "tasks": m.tasks,
            "status": m.status,
            "completion_percentage": m.completion_percentage,
            "archetype_message": m.archetype_message,
            "companion_encouragement": m.companion_encouragement,
            "ats_integration": m.ats_integration,
            "ats_target_score": m.ats_target_score,
            "xp_reward": m.xp_reward,
            "estimated_days": m.estimated_days,
            "started_at": m.started_at.isoformat() if m.started_at else None,
            "completed_at": m.completed_at.isoformat() if m.completed_at else None,
            "due_date": m.due_date.isoformat() if m.due_date else None
        }
        for m in milestones
    ]


@router.post("/{route_id}/start", response_model=dict)
async def start_route(
    route_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a route (change from draft to active)
    
    Args:
        route_id: Route UUID
        
    Returns:
        Updated route with first milestone unlocked
    """
    service = RouteBuilderService(session)
    
    # Verify route belongs to user
    route_result = await session.execute(
        select(RouteBuilder).where(
            RouteBuilder.id == route_id,
            RouteBuilder.user_id == current_user.id
        )
    )
    route = route_result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    if route.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Route is already {route.status}"
        )
    
    # Start route
    updated_route = await service.start_route(route_id)
    
    return {
        "id": str(updated_route.id),
        "name": updated_route.name,
        "status": updated_route.status,
        "started_at": updated_route.started_at.isoformat(),
        "message": "Route started! Your first milestone is now unlocked. Let's go! 🚀"
    }


@router.put("/{route_id}", response_model=dict)
async def update_route(
    route_id: UUID,
    request: UpdateRouteRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update route details
    
    Args:
        route_id: Route UUID
        request: Fields to update
        
    Returns:
        Updated route
    """
    service = RouteBuilderService(session)
    
    # Verify route belongs to user
    route_result = await session.execute(
        select(RouteBuilder).where(
            RouteBuilder.id == route_id,
            RouteBuilder.user_id == current_user.id
        )
    )
    route = route_result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Update route
    updates = request.dict(exclude_unset=True)
    updated_route = await service.update_route(route_id, **updates)
    
    return {
        "id": str(updated_route.id),
        "name": updated_route.name,
        "status": updated_route.status,
        "updated_at": updated_route.updated_at.isoformat(),
        "message": "Route updated successfully!"
    }


@router.post("/{route_id}/milestones/{milestone_id}/complete", response_model=dict)
async def complete_milestone(
    route_id: UUID,
    milestone_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete a milestone
    
    Args:
        route_id: Route UUID
        milestone_id: Milestone UUID
        
    Returns:
        Completion info and next milestone
    """
    service = RouteBuilderService(session)
    
    # Verify route belongs to user
    route_result = await session.execute(
        select(RouteBuilder).where(
            RouteBuilder.id == route_id,
            RouteBuilder.user_id == current_user.id
        )
    )
    route = route_result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Verify milestone belongs to route
    milestone_result = await session.execute(
        select(DynamicMilestone).where(
            DynamicMilestone.id == milestone_id,
            DynamicMilestone.route_builder_id == route_id
        )
    )
    milestone = milestone_result.scalar_one_or_none()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    if milestone.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Milestone already completed"
        )
    
    # Complete milestone
    result = await service.complete_milestone(milestone_id)
    
    return {
        **result,
        "message": "🎉 Milestone completed! Great work!" if not result["route_completed"] else "🎊 Route completed! You did it!"
    }


@router.post("/{route_id}/milestones/{milestone_id}/tasks/{task_index}/complete", response_model=dict)
async def complete_task(
    route_id: UUID,
    milestone_id: UUID,
    task_index: int,
    request: CompleteTaskRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a task within a milestone as complete
    
    Args:
        route_id: Route UUID
        milestone_id: Milestone UUID
        task_index: Index of task in tasks array
        request: Task completion details
        
    Returns:
        Updated milestone with task marked complete
    """
    # Verify route belongs to user
    route_result = await session.execute(
        select(RouteBuilder).where(
            RouteBuilder.id == route_id,
            RouteBuilder.user_id == current_user.id
        )
    )
    route = route_result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Get milestone
    milestone_result = await session.execute(
        select(DynamicMilestone).where(
            DynamicMilestone.id == milestone_id,
            DynamicMilestone.route_builder_id == route_id
        )
    )
    milestone = milestone_result.scalar_one_or_none()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Update task
    tasks = milestone.tasks or []
    if task_index < 0 or task_index >= len(tasks):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task index"
        )
    
    tasks[task_index]["completed"] = True
    if request.evidence:
        tasks[task_index]["evidence"] = request.evidence
    
    milestone.tasks = tasks
    
    # Update completion percentage
    completed_tasks = sum(1 for task in tasks if task.get("completed", False))
    milestone.completion_percentage = int((completed_tasks / len(tasks)) * 100)
    
    await session.commit()
    
    return {
        "milestone_id": str(milestone.id),
        "task_index": task_index,
        "task_name": request.task_name,
        "completion_percentage": milestone.completion_percentage,
        "message": "Task completed! Keep going! 💪"
    }


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(
    route_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a route
    
    Args:
        route_id: Route UUID
    """
    # Verify route belongs to user
    route_result = await session.execute(
        select(RouteBuilder).where(
            RouteBuilder.id == route_id,
            RouteBuilder.user_id == current_user.id
        )
    )
    route = route_result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    await session.delete(route)
    await session.commit()
