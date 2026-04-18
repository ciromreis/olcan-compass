"""AI Service Layer API Routes

Endpoints for prompt management, AI analysis, and job queue monitoring.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.auth import get_current_user, require_admin
from app.db.session import get_db
from app.db.models import (
    User,
    PromptTemplate,
    PromptCategory,
    PromptTemplateStatus,
    PromptExecutionLog,
    AIJobQueue,
    Narrative,
    InterviewAnswer,
)
from app.core.ai_engines import (
    NarrativeAnalysisEngine,
    InterviewFeedbackEngine,
    ReadinessAnalysisEngine,
)
from app.core.job_processor import AIJobProcessor, JobType

router = APIRouter(prefix="/ai", tags=["AI Service Layer"])


# === PROMPT TEMPLATES ===

@router.get("/prompts", response_model=List[Dict[str, Any]])
async def list_prompt_templates(
    category: Optional[PromptCategory] = None,
    status: PromptTemplateStatus = Query(PromptTemplateStatus.ACTIVE),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List prompt templates (admin/curator only in production)"""
    query = select(PromptTemplate).where(PromptTemplate.status == status)
    
    if category:
        query = query.where(PromptTemplate.category == category)
    
    result = await db.execute(query.order_by(desc(PromptTemplate.created_at)))
    templates = result.scalars().all()
    
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "slug": t.slug,
            "category": t.category.value,
            "description": t.description,
            "version": t.version,
            "default_model": t.default_model,
            "usage_count": t.usage_count,
            "success_rate": t.success_rate,
            "created_at": t.created_at.isoformat()
        }
        for t in templates
    ]


@router.get("/prompts/{template_id}", response_model=Dict[str, Any])
async def get_prompt_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific prompt template"""
    result = await db.execute(
        select(PromptTemplate).where(PromptTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {
        "id": str(template.id),
        "name": template.name,
        "slug": template.slug,
        "category": template.category.value,
        "description": template.description,
        "system_prompt": template.system_prompt,
        "user_prompt_template": template.user_prompt_template,
        "response_schema": template.response_schema,
        "expected_response_format": template.expected_response_format,
        "variables": template.variables,
        "default_model": template.default_model,
        "default_temperature": template.default_temperature,
        "max_tokens": template.max_tokens,
        "version": template.version,
        "status": template.status.value,
        "usage_count": template.usage_count,
        "success_rate": template.success_rate,
        "created_at": template.created_at.isoformat()
    }


@router.post("/prompts", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_prompt_template(
    template_data: Dict[str, Any],
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new prompt template (admin only)"""
    
    template = PromptTemplate(
        name=template_data["name"],
        slug=template_data["slug"],
        description=template_data.get("description"),
        category=PromptCategory(template_data.get("category", "general")),
        system_prompt=template_data.get("system_prompt"),
        user_prompt_template=template_data["user_prompt_template"],
        response_schema=template_data.get("response_schema"),
        expected_response_format=template_data.get("expected_response_format", "json"),
        variables=template_data.get("variables", []),
        default_model=template_data.get("default_model"),
        default_temperature=template_data.get("default_temperature", 0.7),
        max_tokens=template_data.get("max_tokens"),
        created_by_id=current_user.id,
        status=PromptTemplateStatus.DRAFT
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    return {"id": str(template.id), "message": "Template created"}


# === AI ANALYSIS ===

@router.post("/analyze/narrative/{narrative_id}", response_model=Dict[str, Any])
async def analyze_narrative(
    narrative_id: UUID,
    background_tasks: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request AI analysis for a narrative"""
    # Verify ownership
    result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == current_user.id
        )
    )
    narrative = result.scalar_one_or_none()
    
    if not narrative:
        raise HTTPException(status_code=404, detail="Narrative not found")
    
    if background_tasks:
        # Submit to job queue
        processor = AIJobProcessor(db)
        job = await processor.submit_job(
            job_type=JobType.NARRATIVE_ANALYSIS,
            entity_type="narrative",
            entity_id=narrative_id,
            user_id=current_user.id,
            priority=5
        )
        
        return {
            "job_id": str(job.id),
            "status": job.status,
            "message": "Analysis queued for processing"
        }
    else:
        # Synchronous analysis
        engine = NarrativeAnalysisEngine(db)
        result = await engine.analyze_narrative(narrative, current_user)
        
        return {
            "clarity_score": result.clarity_score,
            "coherence_score": result.coherence_score,
            "authenticity_score": result.authenticity_score,
            "narrative_arc": result.narrative_arc,
            "key_strengths": result.key_strengths,
            "areas_for_improvement": result.areas_for_improvement,
            "overall_feedback": result.overall_feedback,
            "confidence": result.confidence
        }


@router.post("/analyze/interview-answer/{answer_id}", response_model=Dict[str, Any])
async def analyze_interview_answer(
    answer_id: UUID,
    background_tasks: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request AI feedback for an interview answer"""
    # Verify ownership through session
    result = await db.execute(
        select(InterviewAnswer).where(InterviewAnswer.id == answer_id)
    )
    answer = result.scalar_one_or_none()
    
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    # Check session ownership
    from app.db.models import InterviewSession
    session_result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == answer.session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    if not session_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if background_tasks:
        processor = AIJobProcessor(db)
        job = await processor.submit_job(
            job_type=JobType.INTERVIEW_FEEDBACK,
            entity_type="interview_answer",
            entity_id=answer_id,
            user_id=current_user.id,
            priority=5
        )
        
        return {
            "job_id": str(job.id),
            "status": job.status,
            "message": "Feedback queued for processing"
        }
    else:
        from app.db.models import InterviewSession
        
        session = (await db.execute(
            select(InterviewSession).where(InterviewSession.id == answer.session_id)
        )).scalar_one()
        
        engine = InterviewFeedbackEngine(db)
        result = await engine.analyze_answer(session, answer, current_user)
        
        return {
            "overall_score": result.overall_score,
            "confidence_score": result.confidence_score,
            "structure_score": result.structure_score,
            "content_score": result.content_score,
            "clarity_score": result.clarity_score,
            "strengths": result.strengths,
            "improvements": result.improvements,
            "confidence": result.confidence
        }


@router.post("/analyze/readiness", response_model=Dict[str, Any])
async def analyze_readiness(
    background_tasks: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request AI readiness assessment"""
    if background_tasks:
        processor = AIJobProcessor(db)
        job = await processor.submit_job(
            job_type=JobType.READINESS_ASSESSMENT,
            entity_type="user",
            entity_id=current_user.id,
            user_id=current_user.id,
            priority=4
        )
        
        return {
            "job_id": str(job.id),
            "status": job.status,
            "message": "Readiness assessment queued for processing"
        }
    else:
        # Build user profile
        from app.db.models import PsychProfile
        
        profile_result = await db.execute(
            select(PsychProfile).where(PsychProfile.user_id == current_user.id)
        )
        profile = profile_result.scalar_one_or_none()
        
        user_profile = {}
        if profile:
            user_profile["psych_scores"] = {
                "openness": profile.openness_score,
                "conscientiousness": profile.conscientiousness_score
            }
        
        engine = ReadinessAnalysisEngine(db)
        result = await engine.analyze_readiness(current_user, user_profile)
        
        return {
            "overall_readiness": result.overall_readiness,
            "gaps": result.gaps,
            "strengths": result.strengths,
            "recommended_sprints": result.recommended_sprint_templates,
            "confidence": result.confidence
        }


# === JOB QUEUE ===

@router.get("/jobs", response_model=List[Dict[str, Any]])
async def list_jobs(
    status: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's AI jobs"""
    query = select(AIJobQueue).where(AIJobQueue.user_id == current_user.id)
    
    if status:
        query = query.where(AIJobQueue.status == status)
    
    query = query.order_by(desc(AIJobQueue.created_at)).limit(limit)
    
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    return [
        {
            "id": str(j.id),
            "job_type": j.job_type,
            "entity_type": j.entity_type,
            "entity_id": str(j.entity_id),
            "status": j.status,
            "priority": j.priority,
            "retry_count": j.retry_count,
            "result_data": j.result_data,
            "error_message": j.error_message,
            "created_at": j.created_at.isoformat() if j.created_at else None,
            "completed_at": j.completed_at.isoformat() if j.completed_at else None
        }
        for j in jobs
    ]


@router.get("/jobs/{job_id}", response_model=Dict[str, Any])
async def get_job_status(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get status of a specific job"""
    processor = AIJobProcessor(db)
    job = await processor.get_job_status(job_id)
    
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "id": str(job.id),
        "job_type": job.job_type,
        "entity_type": job.entity_type,
        "entity_id": str(job.entity_id),
        "status": job.status,
        "priority": job.priority,
        "retry_count": job.retry_count,
        "max_retries": job.max_retries,
        "result_data": job.result_data,
        "error_message": job.error_message,
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "created_at": job.created_at.isoformat() if job.created_at else None
    }


@router.post("/jobs/{job_id}/cancel", response_model=Dict[str, Any])
async def cancel_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel a pending job"""
    processor = AIJobProcessor(db)
    success = await processor.cancel_job(job_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot cancel job - may already be processing or completed")
    
    return {"message": "Job cancelled"}


# === EXECUTION LOGS ===

@router.get("/logs", response_model=List[Dict[str, Any]])
async def list_execution_logs(
    template_id: Optional[UUID] = None,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List prompt execution logs (admin only in production)"""
    query = select(PromptExecutionLog)
    
    # Users can only see their own logs
    query = query.where(PromptExecutionLog.user_id == current_user.id)
    
    if template_id:
        query = query.where(PromptExecutionLog.template_id == template_id)
    
    query = query.order_by(desc(PromptExecutionLog.created_at)).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return [
        {
            "id": str(log_item.id),
            "template_id": str(log_item.template_id) if log_item.template_id else None,
            "related_entity_type": log_item.related_entity_type,
            "response_status": log_item.response_status,
            "latency_ms": log_item.latency_ms,
            "prompt_tokens": log_item.prompt_tokens,
            "completion_tokens": log_item.completion_tokens,
            "total_tokens": log_item.total_tokens,
            "model_used": log_item.model_used,
            "provider_used": log_item.provider_used,
            "user_rating": log_item.user_rating,
            "created_at": log_item.created_at.isoformat() if log_item.created_at else None
        }
        for log_item in logs
    ]


# === HEALTH CHECK ===

@router.get("/health", response_model=Dict[str, Any])
async def ai_service_health(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check AI service health"""
    from app.core.ai_service import get_ai_service
    
    service = get_ai_service()
    healthy = await service.health_check()
    
    # Count pending jobs
    result = await db.execute(
        select(AIJobQueue).where(AIJobQueue.status == "pending")
    )
    pending_jobs = len(result.scalars().all())
    
    return {
        "ai_service": "healthy" if healthy else "unhealthy",
        "provider": service.provider.value,
        "pending_jobs": pending_jobs,
        "model": getattr(service, 'default_model', 'unknown')
    }
