"""
Dossier API endpoints (v2.5)
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

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
    await db.commit()
    await db.refresh(dossier)
    
    # Reload with relationships
    result = await db.execute(
        select(Dossier).where(Dossier.id == dossier.id).outerjoin(Dossier.documents).outerjoin(Dossier.tasks)
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
    """Calculate and update dossier readiness score"""
    result = await db.execute(
        select(Dossier).where(
            Dossier.id == dossier_id,
            Dossier.user_id == current_user.id
        )
    )
    dossier = result.unique().scalar_one_or_none()
    
    if not dossier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dossier not found")
    
    # Simple evaluation logic for now
    # Readiness = (Average Document Completion * 0.7) + (Tasks Progress * 0.3)
    
    # 1. Documents progress
    doc_count = len(dossier.documents)
    if doc_count > 0:
        avg_doc_completion = sum(d.completion_percentage for d in dossier.documents) / doc_count
    else:
        avg_doc_completion = 0
        
    # 2. Tasks progress
    task_count = len(dossier.tasks)
    if task_count > 0:
        done_tasks = sum(1 for t in dossier.tasks if t.status == DossierTaskStatus.DONE)
        task_progress = (done_tasks / task_count) * 100
    else:
        task_progress = 100 # No tasks means no blockers
        
    # Final score
    final_score = (avg_doc_completion * 0.7) + (task_progress * 0.3)
    dossier.current_readiness = round(final_score, 2)
    
    # Update readiness_evaluation metadata
    eval_data = dossier.readiness_evaluation or {}
    eval_data.update({
        "last_evaluation": datetime.now(timezone.utc).isoformat(),
        "avg_doc_completion": avg_doc_completion,
        "task_progress": task_progress,
        "document_count": doc_count,
        "task_count": task_count,
        "done_tasks": sum(1 for t in dossier.tasks if t.status == DossierTaskStatus.DONE) if task_count > 0 else 0
    })
    dossier.readiness_evaluation = eval_data
    
    await db.commit()
    await db.refresh(dossier)
    
    return dossier
