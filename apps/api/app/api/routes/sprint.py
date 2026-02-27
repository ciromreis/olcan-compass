"""Readiness Engine and Sprint Management API Routes"""

from datetime import datetime, timezone, date, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import (
    User,
    SprintTemplate,
    UserSprint,
    SprintTask,
    ReadinessAssessment,
    GapAnalysis,
    SprintActivityLog,
    SprintStatus,
    SprintTaskStatus,
    SprintTaskPriority,
)
from app.schemas.sprint import (
    SprintTemplateCreate,
    SprintTemplateResponse,
    SprintTemplateListResponse,
    UserSprintCreate,
    UserSprintUpdate,
    UserSprintStartRequest,
    UserSprintDetailResponse,
    UserSprintListResponse,
    UserSprintListItem,
    SprintTaskCreate,
    SprintTaskUpdate,
    SprintTaskCompleteRequest,
    SprintTaskResponse,
    SprintTaskListResponse,
    ReadinessAssessmentCreate,
    ReadinessAssessmentResponse,
    ReadinessAssessmentListResponse,
    GapAnalysisResponse,
    GapAnalysisListResponse,
    GenerateSprintsRequest,
    GeneratedSprintRecommendation,
    GenerateSprintsResponse,
    SprintStats,
    ReadinessOverview,
    SprintActivityLogResponse,
    SprintActivityLogListResponse,
)

router = APIRouter(prefix="/sprints", tags=["Readiness Engine"])


# === SPRINT TEMPLATES ===

@router.get("/templates", response_model=SprintTemplateListResponse)
async def list_sprint_templates(
    gap_category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List available sprint templates"""
    query = select(SprintTemplate).where(SprintTemplate.is_active == True)
    
    if gap_category:
        query = query.where(SprintTemplate.target_gap_category == gap_category)
    
    result = await db.execute(query.order_by(SprintTemplate.created_at))
    templates = result.scalars().all()
    
    return SprintTemplateListResponse(
        items=[SprintTemplateResponse.model_validate(t) for t in templates],
        total=len(templates)
    )


@router.get("/templates/{template_id}", response_model=SprintTemplateResponse)
async def get_sprint_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific sprint template"""
    result = await db.execute(
        select(SprintTemplate).where(
            SprintTemplate.id == template_id,
            SprintTemplate.is_active == True
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template


@router.post("/templates", response_model=SprintTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_sprint_template(
    request: SprintTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a sprint template (admin only in production)"""
    # TODO: Add admin check
    
    template = SprintTemplate(**request.model_dump())
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    return template


# === USER SPRINTS ===

@router.post("", response_model=UserSprintDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_sprint(
    request: UserSprintCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new sprint for the user"""
    # Calculate dates if template provided
    target_end_date = request.target_end_date
    if request.template_id and not target_end_date:
        template_result = await db.execute(
            select(SprintTemplate).where(SprintTemplate.id == request.template_id)
        )
        template = template_result.scalar_one_or_none()
        if template:
            start = request.start_date or date.today()
            target_end_date = start + timedelta(days=template.duration_days)
    
    sprint = UserSprint(
        user_id=current_user.id,
        route_id=request.route_id,
        template_id=request.template_id,
        name=request.name,
        description=request.description,
        gap_category=request.gap_category,
        gap_description=request.gap_description,
        start_date=request.start_date,
        target_end_date=target_end_date,
        status=SprintStatus.PLANNED if not request.start_date else SprintStatus.ACTIVE,
    )
    
    # If template provided, copy default tasks
    if request.template_id:
        template_result = await db.execute(
            select(SprintTemplate).where(SprintTemplate.id == request.template_id)
        )
        template = template_result.scalar_one_or_none()
        if template and template.default_tasks:
            sprint.estimated_effort_hours = template.estimated_effort_hours
    
    db.add(sprint)
    await db.commit()
    await db.refresh(sprint)
    
    return sprint


@router.post("/{sprint_id}/start", response_model=UserSprintDetailResponse)
async def start_sprint(
    sprint_id: UUID,
    request: UserSprintStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start a planned sprint"""
    result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    sprint = result.scalar_one_or_none()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    if sprint.status != SprintStatus.PLANNED:
        raise HTTPException(status_code=400, detail="Sprint must be in planned status to start")
    
    sprint.status = SprintStatus.ACTIVE
    sprint.start_date = request.start_date or date.today()
    
    # Calculate target end date if template exists
    if sprint.template_id and not sprint.target_end_date:
        template_result = await db.execute(
            select(SprintTemplate).where(SprintTemplate.id == sprint.template_id)
        )
        template = template_result.scalar_one_or_none()
        if template:
            sprint.target_end_date = sprint.start_date + timedelta(days=template.duration_days)
    
    sprint.updated_at = datetime.now(timezone.utc)
    
    # Log activity
    log = SprintActivityLog(
        sprint_id=sprint_id,
        user_id=current_user.id,
        activity_type="sprint_started",
        notes=f"Sprint started on {sprint.start_date}"
    )
    db.add(log)
    
    await db.commit()
    await db.refresh(sprint)
    
    return sprint


@router.get("", response_model=UserSprintListResponse)
async def list_sprints(
    status: Optional[SprintStatus] = None,
    route_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's sprints"""
    query = select(UserSprint).where(UserSprint.user_id == current_user.id)
    
    if status:
        query = query.where(UserSprint.status == status)
    if route_id:
        query = query.where(UserSprint.route_id == route_id)
    
    # Count
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Order and paginate
    query = query.order_by(desc(UserSprint.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    sprints = result.scalars().all()
    
    return UserSprintListResponse(
        items=[UserSprintListItem.model_validate(s) for s in sprints],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{sprint_id}", response_model=UserSprintDetailResponse)
async def get_sprint(
    sprint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get sprint details with tasks"""
    result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    sprint = result.scalar_one_or_none()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    response = UserSprintDetailResponse.model_validate(sprint)
    
    # Load tasks
    tasks_result = await db.execute(
        select(SprintTask)
        .where(SprintTask.sprint_id == sprint_id)
        .order_by(SprintTask.display_order, SprintTask.created_at)
    )
    tasks = tasks_result.scalars().all()
    response.tasks = [SprintTaskResponse.model_validate(t) for t in tasks]
    
    return response


@router.patch("/{sprint_id}", response_model=UserSprintDetailResponse)
async def update_sprint(
    sprint_id: UUID,
    request: UserSprintUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update sprint"""
    result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    sprint = result.scalar_one_or_none()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sprint, field, value)
    
    # If completing
    if request.status == SprintStatus.COMPLETED:
        sprint.completed_at = datetime.now(timezone.utc)
    
    sprint.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(sprint)
    
    return sprint


@router.delete("/{sprint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sprint(
    sprint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a sprint"""
    result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    sprint = result.scalar_one_or_none()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    await db.delete(sprint)
    await db.commit()
    
    return None


# === SPRINT TASKS ===

@router.post("/{sprint_id}/tasks", response_model=SprintTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    sprint_id: UUID,
    request: SprintTaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a task to a sprint"""
    # Verify ownership
    sprint_result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    sprint = sprint_result.scalar_one_or_none()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    task = SprintTask(sprint_id=sprint_id, **request.model_dump())
    db.add(task)
    
    # Update sprint task count
    sprint.total_tasks += 1
    sprint.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(task)
    
    return task


@router.get("/{sprint_id}/tasks", response_model=SprintTaskListResponse)
async def list_tasks(
    sprint_id: UUID,
    status: Optional[SprintTaskStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List tasks in a sprint"""
    # Verify ownership
    sprint_result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    if not sprint_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    query = select(SprintTask).where(SprintTask.sprint_id == sprint_id)
    
    if status:
        query = query.where(SprintTask.status == status)
    
    query = query.order_by(SprintTask.display_order, SprintTask.created_at)
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return SprintTaskListResponse(
        items=[SprintTaskResponse.model_validate(t) for t in tasks],
        total=len(tasks)
    )


@router.patch("/{sprint_id}/tasks/{task_id}", response_model=SprintTaskResponse)
async def update_task(
    sprint_id: UUID,
    task_id: UUID,
    request: SprintTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a task"""
    # Verify ownership through sprint
    sprint_result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    if not sprint_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    result = await db.execute(
        select(SprintTask).where(
            SprintTask.id == task_id,
            SprintTask.sprint_id == sprint_id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    previous_status = task.status
    
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.now(timezone.utc)
    
    # Log activity if status changed
    if request.status and request.status != previous_status:
        log = SprintActivityLog(
            sprint_id=sprint_id,
            task_id=task_id,
            user_id=current_user.id,
            activity_type="task_status_changed",
            previous_status=previous_status.value if previous_status else None,
            new_status=request.status.value
        )
        db.add(log)
        
        # Update sprint progress if task completed
        if request.status == SprintTaskStatus.COMPLETED and not task.completed_at:
            task.completed_at = datetime.now(timezone.utc)
            sprint = (await db.execute(
                select(UserSprint).where(UserSprint.id == sprint_id)
            )).scalar_one()
            sprint.completed_tasks += 1
            sprint.completion_percentage = int((sprint.completed_tasks / sprint.total_tasks) * 100) if sprint.total_tasks > 0 else 0
            sprint.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(task)
    
    return task


@router.post("/{sprint_id}/tasks/{task_id}/complete", response_model=SprintTaskResponse)
async def complete_task(
    sprint_id: UUID,
    task_id: UUID,
    request: SprintTaskCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark task as completed"""
    # Verify ownership
    sprint_result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    sprint = sprint_result.scalar_one_or_none()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    result = await db.execute(
        select(SprintTask).where(
            SprintTask.id == task_id,
            SprintTask.sprint_id == sprint_id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status == SprintTaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Task already completed")
    
    previous_status = task.status
    task.status = SprintTaskStatus.COMPLETED
    task.completed_at = datetime.now(timezone.utc)
    task.completion_notes = request.completion_notes
    task.updated_at = datetime.now(timezone.utc)
    
    # Log activity
    log = SprintActivityLog(
        sprint_id=sprint_id,
        task_id=task_id,
        user_id=current_user.id,
        activity_type="task_completed",
        previous_status=previous_status.value,
        new_status=SprintTaskStatus.COMPLETED.value,
        notes=request.completion_notes
    )
    db.add(log)
    
    # Update sprint progress
    sprint.completed_tasks += 1
    sprint.completion_percentage = int((sprint.completed_tasks / sprint.total_tasks) * 100) if sprint.total_tasks > 0 else 0
    sprint.updated_at = datetime.now(timezone.utc)
    
    # Check if all tasks completed
    if sprint.completed_tasks >= sprint.total_tasks:
        sprint.status = SprintStatus.COMPLETED
        sprint.completed_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(task)
    
    # === ECONOMICS INTEGRATION ===
    # Trigger momentum check and widget display
    from app.tasks.opportunity_cost import check_momentum_and_trigger_widget_task
    check_momentum_and_trigger_widget_task.delay(str(current_user.id))
    
    # Check if readiness crosses 80 threshold for credential generation
    # Get latest readiness assessment
    assessment_result = await db.execute(
        select(ReadinessAssessment)
        .where(ReadinessAssessment.user_id == current_user.id)
        .order_by(desc(ReadinessAssessment.created_at))
        .limit(1)
    )
    latest_assessment = assessment_result.scalar_one_or_none()
    
    if latest_assessment and latest_assessment.overall_readiness >= 80:
        # Check if we already have a recent credential
        from app.db.models.economics import VerificationCredential
        recent_cred_result = await db.execute(
            select(VerificationCredential)
            .where(
                VerificationCredential.user_id == current_user.id,
                VerificationCredential.credential_type == "readiness",
                VerificationCredential.is_active == True
            )
            .order_by(desc(VerificationCredential.issued_at))
            .limit(1)
        )
        recent_credential = recent_cred_result.scalar_one_or_none()
        
        # Only generate if no recent credential or score improved significantly
        should_generate = (
            not recent_credential or
            latest_assessment.overall_readiness > recent_credential.score_value + 5
        )
        
        if should_generate:
            from app.tasks.credentials import generate_credential_task
            generate_credential_task.delay(
                str(current_user.id),
                "readiness",
                int(latest_assessment.overall_readiness)
            )
    
    return task


# === READINESS ASSESSMENTS ===

@router.post("/readiness/assess", response_model=ReadinessAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_readiness_assessment(
    request: ReadinessAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a readiness assessment"""
    # Calculate overall readiness (weighted average)
    overall = (
        request.confidence_score * 0.2 +
        request.documentation_score * 0.25 +
        request.financial_score * 0.25 +
        request.language_score * 0.15 +
        request.experience_score * 0.15
    )
    
    assessment = ReadinessAssessment(
        user_id=current_user.id,
        route_id=request.route_id,
        overall_readiness=overall,
        confidence_score=request.confidence_score,
        documentation_score=request.documentation_score,
        financial_score=request.financial_score,
        language_score=request.language_score,
        experience_score=request.experience_score,
        assessment_type=request.assessment_type,
    )
    
    # TODO: Run AI analysis to identify gaps and recommend sprints
    # For now, placeholder logic
    gaps = []
    if request.language_score < 70:
        gaps.append({"category": "language", "severity": "high", "description": "Language proficiency below threshold"})
    if request.documentation_score < 60:
        gaps.append({"category": "documentation", "severity": "medium", "description": "Missing key documents"})
    
    assessment.gaps_identified = gaps
    assessment.strengths = ["Strong motivation", "Relevant experience"]
    
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    
    return assessment


@router.get("/readiness/assessments", response_model=ReadinessAssessmentListResponse)
async def list_readiness_assessments(
    route_id: Optional[UUID] = None,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's readiness assessments"""
    query = select(ReadinessAssessment).where(ReadinessAssessment.user_id == current_user.id)
    
    if route_id:
        query = query.where(ReadinessAssessment.route_id == route_id)
    
    query = query.order_by(desc(ReadinessAssessment.created_at)).limit(limit)
    
    result = await db.execute(query)
    assessments = result.scalars().all()
    
    return ReadinessAssessmentListResponse(
        items=[ReadinessAssessmentResponse.model_validate(a) for a in assessments],
        total=len(assessments)
    )


@router.get("/readiness/latest", response_model=ReadinessAssessmentResponse)
async def get_latest_readiness(
    route_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get latest readiness assessment"""
    query = select(ReadinessAssessment).where(ReadinessAssessment.user_id == current_user.id)
    
    if route_id:
        query = query.where(ReadinessAssessment.route_id == route_id)
    
    query = query.order_by(desc(ReadinessAssessment.created_at))
    
    result = await db.execute(query.limit(1))
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="No readiness assessment found")
    
    return assessment


# === GAP ANALYSIS ===

@router.get("/readiness/gaps", response_model=GapAnalysisListResponse)
async def list_gaps(
    route_id: Optional[UUID] = None,
    include_resolved: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List gap analyses for user"""
    query = select(GapAnalysis).where(GapAnalysis.user_id == current_user.id)
    
    if route_id:
        query = query.where(GapAnalysis.route_id == route_id)
    
    if not include_resolved:
        query = query.where(GapAnalysis.is_resolved == False)
    
    query = query.order_by(
        desc(GapAnalysis.severity == "critical"),
        desc(GapAnalysis.severity == "high"),
        desc(GapAnalysis.created_at)
    )
    
    result = await db.execute(query)
    gaps = result.scalars().all()
    
    return GapAnalysisListResponse(
        items=[GapAnalysisResponse.model_validate(g) for g in gaps],
        total=len(gaps)
    )


# === SPRINT GENERATION ===

@router.post("/generate", response_model=GenerateSprintsResponse)
async def generate_sprint_recommendations(
    request: GenerateSprintsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    AI-powered sprint generation based on readiness gaps.
    Returns recommended sprints to address identified gaps.
    """
    # Get latest assessment for route
    query = select(ReadinessAssessment).where(
        ReadinessAssessment.user_id == current_user.id
    )
    
    if request.route_id:
        query = query.where(ReadinessAssessment.route_id == request.route_id)
    
    query = query.order_by(desc(ReadinessAssessment.created_at))
    
    result = await db.execute(query.limit(1))
    assessment = result.scalar_one_or_none()
    
    # Get active templates
    templates_result = await db.execute(
        select(SprintTemplate).where(SprintTemplate.is_active == True)
    )
    templates = templates_result.scalars().all()
    
    recommendations = []
    
    # TODO: In production, use AI to match gaps with templates
    # For now, simple matching based on gap category
    if assessment and assessment.gaps_identified:
        for gap in assessment.gaps_identified[:request.max_sprints]:
            category = gap.get("category", "")
            matching_templates = [t for t in templates if t.target_gap_category == category]
            
            if matching_templates:
                template = matching_templates[0]
                recommendations.append(GeneratedSprintRecommendation(
                    template_id=template.id,
                    name=template.name,
                    description=template.description or f"Sprint to address {category} gap",
                    gap_category=category,
                    duration_days=template.duration_days,
                    estimated_effort_hours=template.estimated_effort_hours,
                    priority=gap.get("severity", "medium"),
                    reason=f"Addresses identified {category} gap",
                    suggested_tasks=template.default_tasks[:5] if template.default_tasks else []
                ))
    
    # If no gaps or no assessment, suggest general preparation sprints
    if not recommendations:
        general_templates = [t for t in templates if t.target_gap_category == "general"][:2]
        for template in general_templates:
            recommendations.append(GeneratedSprintRecommendation(
                template_id=template.id,
                name=template.name,
                description=template.description or "General preparation sprint",
                gap_category="general",
                duration_days=template.duration_days,
                estimated_effort_hours=template.estimated_effort_hours,
                priority="medium",
                reason="General preparation and readiness building",
                suggested_tasks=template.default_tasks[:5] if template.default_tasks else []
            ))
    
    total_days = sum(r.duration_days for r in recommendations)
    total_hours = sum(r.estimated_effort_hours for r in recommendations)
    
    return GenerateSprintsResponse(
        recommendations=recommendations[:request.max_sprints],
        based_on_assessment_id=assessment.id if assessment else None,
        total_estimated_days=total_days,
        total_estimated_hours=total_hours
    )


# === STATS & OVERVIEW ===

@router.get("/stats/overview", response_model=SprintStats)
async def get_sprint_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get sprint statistics for the user"""
    # Total counts
    total_result = await db.execute(
        select(func.count()).where(UserSprint.user_id == current_user.id)
    )
    total_sprints = total_result.scalar()
    
    active_result = await db.execute(
        select(func.count()).where(
            UserSprint.user_id == current_user.id,
            UserSprint.status == SprintStatus.ACTIVE
        )
    )
    active_sprints = active_result.scalar()
    
    completed_result = await db.execute(
        select(func.count()).where(
            UserSprint.user_id == current_user.id,
            UserSprint.status == SprintStatus.COMPLETED
        )
    )
    completed_sprints = completed_result.scalar()
    
    # Completion rate
    completion_rate = (completed_sprints / total_sprints * 100) if total_sprints > 0 else 0
    
    # Task stats
    task_result = await db.execute(
        select(func.count()).join(UserSprint).where(
            SprintTask.sprint_id == UserSprint.id,
            UserSprint.user_id == current_user.id
        )
    )
    total_tasks = task_result.scalar()
    
    completed_task_result = await db.execute(
        select(func.count()).join(UserSprint).where(
            SprintTask.sprint_id == UserSprint.id,
            UserSprint.user_id == current_user.id,
            SprintTask.status == SprintTaskStatus.COMPLETED
        )
    )
    completed_tasks = completed_task_result.scalar()
    
    # Active sprints list
    active_sprints_result = await db.execute(
        select(UserSprint).where(
            UserSprint.user_id == current_user.id,
            UserSprint.status == SprintStatus.ACTIVE
        ).order_by(desc(UserSprint.created_at))
    )
    active_sprints_list = active_sprints_result.scalars().all()
    
    return SprintStats(
        total_sprints=total_sprints,
        active_sprints=active_sprints,
        completed_sprints=completed_sprints,
        completion_rate=round(completion_rate, 1),
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        sprints_by_category={},  # Would need grouping query
        active_sprints_list=[UserSprintListItem.model_validate(s) for s in active_sprints_list]
    )


@router.get("/readiness/overview", response_model=ReadinessOverview)
async def get_readiness_overview(
    route_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get complete readiness overview for the user"""
    # Latest assessment
    assessment_query = select(ReadinessAssessment).where(
        ReadinessAssessment.user_id == current_user.id
    )
    if route_id:
        assessment_query = assessment_query.where(ReadinessAssessment.route_id == route_id)
    
    assessment_query = assessment_query.order_by(desc(ReadinessAssessment.created_at))
    assessment_result = await db.execute(assessment_query.limit(1))
    latest_assessment = assessment_result.scalar_one_or_none()
    
    # Gap summary
    gaps_query = select(GapAnalysis).where(
        GapAnalysis.user_id == current_user.id,
        GapAnalysis.is_resolved == False
    )
    if route_id:
        gaps_query = gaps_query.where(GapAnalysis.route_id == route_id)
    
    gaps_result = await db.execute(gaps_query)
    gaps = gaps_result.scalars().all()
    
    open_gaps = len(gaps)
    critical_gaps = sum(1 for g in gaps if g.severity == "critical")
    
    resolved_result = await db.execute(
        select(func.count()).where(
            GapAnalysis.user_id == current_user.id,
            GapAnalysis.is_resolved == True
        )
    )
    resolved_gaps = resolved_result.scalar()
    
    # Sprint summary
    active_sprints_result = await db.execute(
        select(func.count()).where(
            UserSprint.user_id == current_user.id,
            UserSprint.status == SprintStatus.ACTIVE
        )
    )
    active_sprints = active_sprints_result.scalar()
    
    # Recent completed sprints
    this_month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    sprints_this_month_result = await db.execute(
        select(func.count()).where(
            UserSprint.user_id == current_user.id,
            UserSprint.status == SprintStatus.COMPLETED,
            UserSprint.completed_at >= this_month_start
        )
    )
    sprints_this_month = sprints_this_month_result.scalar()
    
    # Get recommendations
    gen_request = GenerateSprintsRequest(route_id=route_id, max_sprints=3)
    recommendations_response = await generate_sprint_recommendations(gen_request, current_user, db)
    
    # Urgent tasks (high priority, not completed)
    urgent_tasks_result = await db.execute(
        select(SprintTask).join(UserSprint).where(
            UserSprint.user_id == current_user.id,
            SprintTask.sprint_id == UserSprint.id,
            SprintTask.status.in_([SprintTaskStatus.TODO, SprintTaskStatus.IN_PROGRESS]),
            SprintTask.priority.in_([SprintTaskPriority.HIGH, SprintTaskPriority.CRITICAL])
        ).order_by(SprintTask.due_date).limit(5)
    )
    urgent_tasks = urgent_tasks_result.scalars().all()
    
    return ReadinessOverview(
        latest_assessment=ReadinessAssessmentResponse.model_validate(latest_assessment) if latest_assessment else None,
        open_gaps=open_gaps,
        critical_gaps=critical_gaps,
        resolved_gaps=resolved_gaps,
        active_sprints=active_sprints,
        sprints_completed_this_month=sprints_this_month,
        recommended_next_sprints=recommendations_response.recommendations,
        urgent_tasks=[SprintTaskResponse.model_validate(t) for t in urgent_tasks]
    )


# === ACTIVITY LOG ===

@router.get("/{sprint_id}/activity", response_model=SprintActivityLogListResponse)
async def get_sprint_activity(
    sprint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get activity log for a sprint"""
    # Verify ownership
    sprint_result = await db.execute(
        select(UserSprint).where(
            UserSprint.id == sprint_id,
            UserSprint.user_id == current_user.id
        )
    )
    if not sprint_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    result = await db.execute(
        select(SprintActivityLog)
        .where(SprintActivityLog.sprint_id == sprint_id)
        .order_by(desc(SprintActivityLog.created_at))
    )
    logs = result.scalars().all()
    
    return SprintActivityLogListResponse(
        items=[SprintActivityLogResponse.model_validate(l) for l in logs],
        total=len(logs)
    )
