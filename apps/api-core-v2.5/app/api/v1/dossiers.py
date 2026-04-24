"""
Dossier API endpoints (v2.5)
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models import User
from app.db.models.dossier import (
    Dossier,
    DossierDocument,
    DossierTask,
    DossierStatus,
    DossierDocumentStatus,
    DossierTaskStatus
)
from app.models.enhanced_forge import (
    ExportJob,
    ExportType,
    ExportFormat,
    ExportStatus,
)
from app.services.dossier_readiness import compute_readiness
from app.services.dossier_task_generator import generate_default_tasks
from app.services.export_service import ExportService
from app.schemas.dossier import (
    DossierCreate, 
    DossierUpdate, 
    DossierResponse, 
    DossierSimpleResponse,
    DossierDocumentCreate,
    DossierDocumentUpdate,
    DossierDocumentInDossier,
    DossierTaskCreate,
    DossierTaskUpdate,
    DossierTaskInDossier
)

router = APIRouter(prefix="/dossiers", tags=["dossiers"])


# --- Dossier CRUD ---

@router.post("", response_model=DossierResponse, status_code=status.HTTP_201_CREATED)
async def create_dossier(
    request: DossierCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new dossier"""
    dossier = Dossier(
        user_id=current_user.id,
        title=request.title,
        status=request.status,
        opportunity_id=request.opportunity_id,
        deadline=request.deadline,
        target_readiness=request.target_readiness,
        is_favorite=request.is_favorite,
        profile_snapshot=request.profile_snapshot,
        opportunity_context=request.opportunity_context,
        readiness_evaluation=request.readiness_evaluation
    )
    
    db.add(dossier)
    await db.flush()  # Get dossier.id before creating tasks
    
    # EC-1: Seed MECE tasks when opportunity_context is present
    if request.opportunity_context:
        seed_tasks = generate_default_tasks(
            dossier_id=dossier.id,
            opportunity_context=request.opportunity_context,
            deadline=request.deadline,
        )
        for task in seed_tasks:
            db.add(task)
    
    await db.commit()
    await db.refresh(dossier)
    
    # Reload with relationships (selectinload for async safety)
    result = await db.execute(
        select(Dossier)
        .where(Dossier.id == dossier.id)
        .options(
            selectinload(Dossier.documents),
            selectinload(Dossier.tasks),
        )
    )
    return result.unique().scalar_one()


@router.get("", response_model=List[DossierSimpleResponse])
async def list_dossiers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[DossierStatus] = None
):
    """List user dossiers"""
    query = select(Dossier).where(Dossier.user_id == current_user.id)
    
    if status:
        query = query.where(Dossier.status == status)
        
    query = query.order_by(desc(Dossier.updated_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    dossiers = result.scalars().all()
    
    # For DossierSimpleResponse, we might need to count documents/tasks manually
    # or use a more complex query. For simplicity here:
    responses = []
    for d in dossiers:
        doc_count_result = await db.execute(
            select(func.count(DossierDocument.id)).where(DossierDocument.dossier_id == d.id)
        )
        task_count_result = await db.execute(
            select(func.count(DossierTask.id)).where(DossierTask.dossier_id == d.id)
        )
        
        resp = DossierSimpleResponse.model_validate(d)
        resp.document_count = doc_count_result.scalar() or 0
        resp.task_count = task_count_result.scalar() or 0
        responses.append(resp)
        
    return responses


@router.get("/{dossier_id}", response_model=DossierResponse)
async def get_dossier(
    dossier_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed dossier info"""
    result = await db.execute(
        select(Dossier).where(
            Dossier.id == dossier_id,
            Dossier.user_id == current_user.id
        )
    )
    dossier = result.scalar_one_or_none()
    
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dossier not found"
        )
    
    return dossier


@router.put("/{dossier_id}", response_model=DossierResponse)
async def update_dossier(
    dossier_id: UUID,
    request: DossierUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update dossier metadata"""
    result = await db.execute(
        select(Dossier).where(
            Dossier.id == dossier_id,
            Dossier.user_id == current_user.id
        )
    )
    dossier = result.scalar_one_or_none()
    
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dossier not found"
        )
    
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dossier, key, value)
        
    dossier.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(dossier)
    
    return dossier


@router.delete("/{dossier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dossier(
    dossier_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete dossier and all its contents"""
    result = await db.execute(
        select(Dossier).where(
            Dossier.id == dossier_id,
            Dossier.user_id == current_user.id
        )
    )
    dossier = result.scalar_one_or_none()
    
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dossier not found"
        )
    
    await db.delete(dossier)
    await db.commit()


# --- Dossier Documents ---

@router.post("/{dossier_id}/documents", response_model=DossierDocumentInDossier, status_code=status.HTTP_201_CREATED)
async def add_document_to_dossier(
    dossier_id: UUID,
    request: DossierDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a document to a dossier"""
    # Verify ownership
    d_result = await db.execute(select(Dossier).where(Dossier.id == dossier_id, Dossier.user_id == current_user.id))
    if not d_result.scalar():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")
        
    document = DossierDocument(
        dossier_id=dossier_id,
        type=request.type,
        title=request.title,
        content=request.content,
        status=request.status,
        completion_percentage=request.completion_percentage,
        word_count=request.word_count,
        metrics=request.metrics,
        ats_score=request.ats_score,
        original_document_id=request.original_document_id
    )
    
    db.add(document)
    await db.commit()
    await db.refresh(document)
    
    return document


@router.put("/{dossier_id}/documents/{document_id}", response_model=DossierDocumentInDossier)
async def update_dossier_document(
    dossier_id: UUID,
    document_id: UUID,
    request: DossierDocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a specific document in a dossier"""
    result = await db.execute(
        select(DossierDocument).join(Dossier).where(
            DossierDocument.id == document_id,
            DossierDocument.dossier_id == dossier_id,
            Dossier.user_id == current_user.id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(document, key, value)
        
    document.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(document)
    
    return document


# --- Dossier Tasks ---

@router.post("/{dossier_id}/tasks", response_model=DossierTaskInDossier, status_code=status.HTTP_201_CREATED)
async def add_task_to_dossier(
    dossier_id: UUID,
    request: DossierTaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a task to a dossier"""
    # Verify ownership
    d_result = await db.execute(select(Dossier).where(Dossier.id == dossier_id, Dossier.user_id == current_user.id))
    if not d_result.scalar():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")
        
    task = DossierTask(
        dossier_id=dossier_id,
        document_id=request.document_id,
        title=request.title,
        description=request.description,
        type=request.type,
        readiness_domain=request.readiness_domain,
        status=request.status,
        priority=request.priority,
        due_date=request.due_date
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    return task


@router.put("/{dossier_id}/tasks/{task_id}", response_model=DossierTaskInDossier)
async def update_dossier_task(
    dossier_id: UUID,
    task_id: UUID,
    request: DossierTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a task in a dossier"""
    result = await db.execute(
        select(DossierTask).join(Dossier).where(
            DossierTask.id == task_id,
            DossierTask.dossier_id == dossier_id,
            Dossier.user_id == current_user.id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    if request.status == DossierTaskStatus.DONE and not task.completed_at:
        task.completed_at = datetime.now(timezone.utc)
        
    task.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(task)
    
    return task


# --- Readiness Evaluation ---

@router.post("/{dossier_id}/evaluate", response_model=DossierResponse)
async def evaluate_dossier_readiness(
    dossier_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Calculate and update dossier readiness score.

    Uses the unified 40/30/20/10 algorithm in
    app.services.dossier_readiness (mirrored on the frontend in
    src/lib/dossier-readiness.ts).
    """
    # Eager-load documents + tasks — async SQLAlchemy cannot lazy-load.
    result = await db.execute(
        select(Dossier)
        .where(
            Dossier.id == dossier_id,
            Dossier.user_id == current_user.id,
        )
        .options(
            selectinload(Dossier.documents),
            selectinload(Dossier.tasks),
        )
    )
    dossier = result.unique().scalar_one_or_none()

    if not dossier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")

    # Shape dossier state into the algorithm's plain-dict contract.
    docs_input = [
        {
            "status": d.status.value if hasattr(d.status, "value") else d.status,
            "completion_percentage": d.completion_percentage,
            "metrics": d.metrics or {},
        }
        for d in dossier.documents
    ]
    tasks_input = [
        {"status": t.status.value if hasattr(t.status, "value") else t.status}
        for t in dossier.tasks
    ]
    profile_scores = None
    snap = dossier.profile_snapshot or {}
    if isinstance(snap, dict):
        profile_scores = snap.get("readinessScores") or snap.get("readiness_scores")

    status_value = dossier.status.value if hasattr(dossier.status, "value") else dossier.status

    breakdown = compute_readiness(
        documents=docs_input,
        tasks=tasks_input,
        profile_scores=profile_scores,
        deadline=dossier.deadline,
        dossier_status=status_value,
    )

    dossier.current_readiness = breakdown["overall"]
    dossier.readiness_evaluation = {
        **(dossier.readiness_evaluation or {}),
        "last_evaluation": breakdown["computed_at"],
        "breakdown": breakdown,
    }

    await db.commit()
    await db.refresh(dossier)

    return dossier


# --- Dossier Export ---
#
# Export flow (see wiki/02_Arquitetura_Compass/SPEC_Dossier_System_v2_5.md):
#   1. POST /{id}/export         → create ExportJob, enqueue background task
#   2. GET  /{id}/export/{job}   → poll job status + download_url
#   3. GET  /{id}/export/{job}/download → stream file bytes
#
# The heavy PDF/DOCX rendering lives in services/export_service.py. The
# current ExportService._generate_pdf_document / _generate_docx_document are
# placeholders — real WeasyPrint/python-docx rendering is tracked in the
# execution plan at wiki/08_Operations/Dossier_Overhaul_Execution_Plan.md.


_SUPPORTED_EXPORT_FORMATS = {
    "pdf": ExportFormat.PDF,
    "docx": ExportFormat.DOCX,
    "zip": ExportFormat.ZIP,
    "html": ExportFormat.HTML,
    "markdown": ExportFormat.MARKDOWN,
}


async def _run_export_job(job_id: uuid.UUID, db_session_factory):
    """BackgroundTasks wrapper — runs the export in its own DB session."""
    async with db_session_factory() as session:
        service = ExportService(session)
        await service.process_export_job(job_id)


@router.post("/{dossier_id}/export", response_model=dict, status_code=status.HTTP_202_ACCEPTED)
async def create_dossier_export(
    dossier_id: UUID,
    background_tasks: BackgroundTasks,
    format: str = Query("pdf", description="Export format: pdf, docx, zip, html, markdown"),
    branding_enabled: bool = Query(True, description="Apply Olcan Liquid Glass branding"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Queue a background ExportJob for this dossier and return the job id."""
    fmt = _SUPPORTED_EXPORT_FORMATS.get(format.lower())
    if fmt is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{format}'. Allowed: {sorted(_SUPPORTED_EXPORT_FORMATS)}",
        )

    # Verify ownership
    result = await db.execute(
        select(Dossier).where(
            Dossier.id == dossier_id,
            Dossier.user_id == current_user.id,
        )
    )
    dossier = result.scalar_one_or_none()
    if not dossier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")

    job = ExportJob(
        id=uuid.uuid4(),
        user_id=current_user.id,
        export_type=ExportType.DOSSIER,
        format=fmt,
        branding_enabled=branding_enabled,
        status=ExportStatus.QUEUED,
        export_options={"dossier_id": str(dossier_id)},
        progress_percentage=0,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Schedule in background. ExportService opens its own session.
    from app.core.database import AsyncSessionLocal  # local import avoids cycles
    background_tasks.add_task(_run_export_job, job.id, AsyncSessionLocal)

    return {
        "job_id": str(job.id),
        "status": job.status.value,
        "format": job.format.value,
        "progress_percentage": job.progress_percentage,
    }


@router.get("/{dossier_id}/export/{job_id}", response_model=dict)
async def get_export_status(
    dossier_id: UUID,
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return live status of an ExportJob (polled by the frontend)."""
    result = await db.execute(
        select(ExportJob).where(
            ExportJob.id == job_id,
            ExportJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export job not found")

    # Ensure the job is for this dossier
    opts = job.export_options or {}
    if str(opts.get("dossier_id")) != str(dossier_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export job not found")

    download_url = None
    if job.status == ExportStatus.COMPLETED:
        download_url = f"/api/v1/dossiers/{dossier_id}/export/{job_id}/download"

    return {
        "job_id": str(job.id),
        "status": job.status.value,
        "format": job.format.value,
        "progress_percentage": job.progress_percentage,
        "error_message": job.error_message,
        "download_url": download_url,
    }


@router.get("/{dossier_id}/export/{job_id}/download")
async def download_dossier_export(
    dossier_id: UUID,
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream the generated export file once the job is complete."""
    from pathlib import Path
    from fastapi.responses import FileResponse

    result = await db.execute(
        select(ExportJob).where(
            ExportJob.id == job_id,
            ExportJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export job not found")

    opts = job.export_options or {}
    if str(opts.get("dossier_id")) != str(dossier_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export job not found")

    if job.status != ExportStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Export not ready (status={job.status.value})",
        )

    if not job.file_path:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Export file missing")

    file_path = Path(job.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Export file expired")

    job.downloaded_at = datetime.now(timezone.utc)
    await db.commit()

    filename = f"dossier_{dossier_id}.{job.format.value}"
    return FileResponse(path=str(file_path), filename=filename)
