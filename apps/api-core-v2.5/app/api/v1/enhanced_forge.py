"""
Enhanced Document Forge API Endpoints

FastAPI endpoints for multi-process management, document variations,
task recommendations, and technical reporting.
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.enhanced_forge import (
    Process, ProcessTask, DocumentVariation, ProcessTemplate,
    TechnicalReport, ExportJob, CMSFormData
)
from app.schemas.enhanced_forge import (
    ProcessCreate, ProcessUpdate, ProcessResponse, ProcessListResponse,
    ProcessTaskCreate, ProcessTaskUpdate, ProcessTaskResponse, TaskHubResponse,
    DocumentVariationCreate, DocumentVariationUpdate, DocumentVariationResponse,
    TechnicalReportCreate, TechnicalReportResponse,
    ExportJobCreate, ExportJobResponse,
    CMSFormDataCreate, CMSFormDataUpdate, CMSFormDataResponse,
    ProcessTemplateResponse, ProcessTemplateListResponse,
    EnhancedDashboardResponse, MessageResponse, ErrorResponse
)
from app.services.enhanced_forge_service import EnhancedForgeService
from app.services.export_service import ExportService
from app.services.cms_service import CMSService

router = APIRouter(prefix="/enhanced-forge", tags=["Enhanced Document Forge"])


# ============================================================
# Process Management Endpoints
# ============================================================

@router.post("/processes", response_model=ProcessResponse)
async def create_process(
    process_data: ProcessCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new process with intelligent task generation"""
    
    service = EnhancedForgeService(db)
    try:
        process = await service.create_process(current_user.id, process_data)
        return ProcessResponse.model_validate(process)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/processes", response_model=ProcessListResponse)
async def get_processes(
    status: Optional[str] = Query(None, description="Filter by status"),
    process_type: Optional[str] = Query(None, description="Filter by process type"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user's processes with filtering and pagination"""
    
    query = select(Process).where(Process.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.where(Process.status == status)
    if process_type:
        query = query.where(Process.process_type == process_type)
    if is_favorite is not None:
        query = query.where(Process.is_favorite == is_favorite)
    
    # Apply pagination
    query = query.offset(offset).limit(limit).order_by(Process.updated_at.desc())
    
    result = await db.execute(query)
    processes = result.scalars().all()
    
    # Get total count
    count_query = select(func.count(Process.id)).where(Process.user_id == current_user.id)
    if status:
        count_query = count_query.where(Process.status == status)
    if process_type:
        count_query = count_query.where(Process.process_type == process_type)
    if is_favorite is not None:
        count_query = count_query.where(Process.is_favorite == is_favorite)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    return ProcessListResponse(
        processes=[ProcessResponse.model_validate(p) for p in processes],
        total=total
    )


@router.get("/processes/{process_id}", response_model=ProcessResponse)
async def get_process(
    process_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific process with full details"""
    
    result = await db.execute(
        select(Process).where(
            and_(Process.id == process_id, Process.user_id == current_user.id)
        )
    )
    process = result.scalar_one_or_none()
    
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    return ProcessResponse.model_validate(process)


@router.put("/processes/{process_id}", response_model=ProcessResponse)
async def update_process(
    process_id: uuid.UUID,
    process_data: ProcessUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a process and recalculate readiness score"""
    
    service = EnhancedForgeService(db)
    process = await service.update_process(process_id, current_user.id, process_data)
    
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    return ProcessResponse.model_validate(process)


@router.delete("/processes/{process_id}", response_model=MessageResponse)
async def delete_process(
    process_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a process and all associated data"""
    
    result = await db.execute(
        select(Process).where(
            and_(Process.id == process_id, Process.user_id == current_user.id)
        )
    )
    process = result.scalar_one_or_none()
    
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    await db.delete(process)
    await db.commit()
    
    return MessageResponse(message="Process deleted successfully")


@router.get("/dashboard", response_model=EnhancedDashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive dashboard with process analytics"""
    
    service = EnhancedForgeService(db)
    dashboard_data = await service.get_process_dashboard(current_user.id)
    
    return EnhancedDashboardResponse(**dashboard_data)


# ============================================================
# Task Management Endpoints
# ============================================================

@router.post("/tasks", response_model=ProcessTaskResponse)
async def create_task(
    task_data: ProcessTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new task with XP calculation"""
    
    service = EnhancedForgeService(db)
    task = await service.create_task(current_user.id, task_data)
    
    return ProcessTaskResponse.model_validate(task)


@router.get("/tasks", response_model=TaskHubResponse)
async def get_tasks(
    process_id: Optional[uuid.UUID] = Query(None, description="Filter by process"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    category: Optional[str] = Query(None, description="Filter by category"),
    due_soon: Optional[bool] = Query(None, description="Filter tasks due within 7 days"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get tasks with advanced filtering for Task Hub"""
    
    query = select(ProcessTask).where(ProcessTask.user_id == current_user.id)
    
    # Apply filters
    if process_id:
        query = query.where(ProcessTask.process_id == process_id)
    if status:
        query = query.where(ProcessTask.status == status)
    if priority:
        query = query.where(ProcessTask.priority == priority)
    if category:
        query = query.where(ProcessTask.category == category)
    if due_soon:
        week_from_now = datetime.utcnow() + timedelta(days=7)
        query = query.where(
            and_(
                ProcessTask.due_date.isnot(None),
                ProcessTask.due_date <= week_from_now
            )
        )
    
    # Apply pagination and ordering
    query = query.offset(offset).limit(limit).order_by(ProcessTask.created_at.desc())
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    # Get total count
    count_query = select(func.count(ProcessTask.id)).where(ProcessTask.user_id == current_user.id)
    # Apply same filters for count
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    return TaskHubResponse(
        tasks=[ProcessTaskResponse.model_validate(t) for t in tasks],
        total=total,
        filters_applied={
            "process_id": str(process_id) if process_id else None,
            "status": status,
            "priority": priority,
            "category": category,
            "due_soon": due_soon
        }
    )


@router.put("/tasks/{task_id}", response_model=ProcessTaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_data: ProcessTaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a task"""
    
    result = await db.execute(
        select(ProcessTask).where(
            and_(ProcessTask.id == task_id, ProcessTask.user_id == current_user.id)
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    await db.commit()
    return ProcessTaskResponse.model_validate(task)


@router.post("/tasks/{task_id}/complete", response_model=Dict[str, Any])
async def complete_task(
    task_id: uuid.UUID,
    completion_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Complete a task and update gamification system"""
    
    service = EnhancedForgeService(db)
    result = await service.complete_task(task_id, current_user.id, completion_notes)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@router.get("/tasks/recommendations/{process_id}", response_model=List[Dict[str, Any]])
async def get_task_recommendations(
    process_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get intelligent task recommendations for a process"""
    
    service = EnhancedForgeService(db)
    recommendations = await service.get_task_recommendations(process_id, current_user.id)
    
    return recommendations


# ============================================================
# Document Variation Endpoints
# ============================================================

@router.post("/document-variations", response_model=DocumentVariationResponse)
async def create_document_variation(
    variation_data: DocumentVariationCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a document variation with content analysis"""
    
    service = EnhancedForgeService(db)
    variation = await service.create_document_variation(current_user.id, variation_data)
    
    return DocumentVariationResponse.model_validate(variation)


@router.get("/document-variations", response_model=List[DocumentVariationResponse])
async def get_document_variations(
    process_id: Optional[uuid.UUID] = Query(None, description="Filter by process"),
    base_document_id: Optional[uuid.UUID] = Query(None, description="Filter by base document"),
    variation_type: Optional[str] = Query(None, description="Filter by variation type"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get document variations with filtering"""
    
    query = select(DocumentVariation).where(DocumentVariation.user_id == current_user.id)
    
    if process_id:
        query = query.where(DocumentVariation.process_id == process_id)
    if base_document_id:
        query = query.where(DocumentVariation.base_document_id == base_document_id)
    if variation_type:
        query = query.where(DocumentVariation.variation_type == variation_type)
    
    result = await db.execute(query.order_by(DocumentVariation.updated_at.desc()))
    variations = result.scalars().all()
    
    return [DocumentVariationResponse.model_validate(v) for v in variations]


@router.put("/document-variations/{variation_id}", response_model=DocumentVariationResponse)
async def update_document_variation(
    variation_id: uuid.UUID,
    variation_data: DocumentVariationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a document variation"""
    
    result = await db.execute(
        select(DocumentVariation).where(
            and_(DocumentVariation.id == variation_id, DocumentVariation.user_id == current_user.id)
        )
    )
    variation = result.scalar_one_or_none()
    
    if not variation:
        raise HTTPException(status_code=404, detail="Document variation not found")
    
    # Update fields
    update_data = variation_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(variation, field, value)
    
    # Update version
    variation.version += 1
    variation.updated_at = datetime.utcnow()
    
    await db.commit()
    return DocumentVariationResponse.model_validate(variation)


@router.post("/document-variations/propagate/{base_document_id}", response_model=List[DocumentVariationResponse])
async def propagate_base_document_changes(
    base_document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Propagate changes from base document to all variations"""
    
    service = EnhancedForgeService(db)
    variations = await service.propagate_base_document_changes(base_document_id, current_user.id)
    
    return [DocumentVariationResponse.model_validate(v) for v in variations]


# ============================================================
# Technical Report Endpoints
# ============================================================

@router.post("/technical-reports", response_model=TechnicalReportResponse)
async def generate_technical_report(
    report_data: TechnicalReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate comprehensive technical report for a process"""
    
    service = EnhancedForgeService(db)
    try:
        report = await service.generate_technical_report(
            report_data.process_id, 
            current_user.id, 
            report_data.report_type
        )
        return TechnicalReportResponse.model_validate(report)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/technical-reports", response_model=List[TechnicalReportResponse])
async def get_technical_reports(
    process_id: Optional[uuid.UUID] = Query(None, description="Filter by process"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get technical reports with filtering"""
    
    query = select(TechnicalReport).where(TechnicalReport.user_id == current_user.id)
    
    if process_id:
        query = query.where(TechnicalReport.process_id == process_id)
    
    result = await db.execute(query.order_by(TechnicalReport.generated_at.desc()))
    reports = result.scalars().all()
    
    return [TechnicalReportResponse.model_validate(r) for r in reports]


@router.get("/technical-reports/{report_id}", response_model=TechnicalReportResponse)
async def get_technical_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific technical report"""
    
    result = await db.execute(
        select(TechnicalReport).where(
            and_(TechnicalReport.id == report_id, TechnicalReport.user_id == current_user.id)
        )
    )
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Technical report not found")
    
    return TechnicalReportResponse.model_validate(report)


# ============================================================
# Export Job Endpoints
# ============================================================

@router.post("/export-jobs", response_model=ExportJobResponse)
async def create_export_job(
    export_data: ExportJobCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create an export job for documents or reports"""
    
    export_job = ExportJob(
        user_id=current_user.id,
        **export_data.model_dump()
    )
    db.add(export_job)
    await db.flush()
    
    # Queue background export task
    export_service = ExportService(db)
    background_tasks.add_task(export_service.process_export_job, export_job.id)
    
    await db.commit()
    return ExportJobResponse.model_validate(export_job)


@router.get("/export-jobs", response_model=List[ExportJobResponse])
async def get_export_jobs(
    status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get export jobs with filtering"""
    
    query = select(ExportJob).where(ExportJob.user_id == current_user.id)
    
    if status:
        query = query.where(ExportJob.status == status)
    
    result = await db.execute(query.order_by(ExportJob.created_at.desc()))
    jobs = result.scalars().all()
    
    return [ExportJobResponse.model_validate(j) for j in jobs]


@router.get("/export-jobs/{job_id}", response_model=ExportJobResponse)
async def get_export_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific export job"""
    
    result = await db.execute(
        select(ExportJob).where(
            and_(ExportJob.id == job_id, ExportJob.user_id == current_user.id)
        )
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Export job not found")
    
    return ExportJobResponse.model_validate(job)


# ============================================================
# CMS Form Data Endpoints
# ============================================================

@router.post("/cms-forms", response_model=CMSFormDataResponse)
async def create_cms_form_data(
    form_data: CMSFormDataCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create or update CMS form data"""
    
    # Check if form data already exists
    result = await db.execute(
        select(CMSFormData).where(
            and_(
                CMSFormData.user_id == current_user.id,
                CMSFormData.form_type == form_data.form_type,
                CMSFormData.section_name == form_data.section_name
            )
        )
    )
    existing_form = result.scalar_one_or_none()
    
    if existing_form:
        # Update existing form
        existing_form.field_data = form_data.field_data
        existing_form.last_auto_save = datetime.utcnow()
        existing_form.updated_at = datetime.utcnow()
        await db.commit()
        return CMSFormDataResponse.model_validate(existing_form)
    else:
        # Create new form
        cms_form = CMSFormData(
            user_id=current_user.id,
            **form_data.model_dump()
        )
        db.add(cms_form)
        await db.commit()
        return CMSFormDataResponse.model_validate(cms_form)


@router.get("/cms-forms", response_model=List[CMSFormDataResponse])
async def get_cms_form_data(
    form_type: Optional[str] = Query(None, description="Filter by form type"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get CMS form data with filtering"""
    
    query = select(CMSFormData).where(CMSFormData.user_id == current_user.id)
    
    if form_type:
        query = query.where(CMSFormData.form_type == form_type)
    
    result = await db.execute(query.order_by(CMSFormData.updated_at.desc()))
    forms = result.scalars().all()
    
    return [CMSFormDataResponse.model_validate(f) for f in forms]


@router.put("/cms-forms/{form_id}", response_model=CMSFormDataResponse)
async def update_cms_form_data(
    form_id: uuid.UUID,
    form_data: CMSFormDataUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update CMS form data"""
    
    result = await db.execute(
        select(CMSFormData).where(
            and_(CMSFormData.id == form_id, CMSFormData.user_id == current_user.id)
        )
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form data not found")
    
    # Update fields
    update_data = form_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(form, field, value)
    
    form.last_auto_save = datetime.utcnow()
    form.updated_at = datetime.utcnow()
    
    await db.commit()
    return CMSFormDataResponse.model_validate(form)


# ============================================================
# Process Template Endpoints
# ============================================================

@router.get("/process-templates", response_model=List[ProcessTemplateResponse])
async def get_process_templates(
    process_type: Optional[str] = Query(None, description="Filter by process type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db)
):
    """Get available process templates"""
    
    query = select(ProcessTemplate).where(ProcessTemplate.is_active == True)
    
    if process_type:
        query = query.where(ProcessTemplate.process_type == process_type)
    if category:
        query = query.where(ProcessTemplate.category == category)
    
    result = await db.execute(query.order_by(ProcessTemplate.usage_count.desc()))
    templates = result.scalars().all()
    
    return [ProcessTemplateResponse.model_validate(t) for t in templates]


@router.get("/process-templates/{template_id}", response_model=ProcessTemplateResponse)
async def get_process_template(
    template_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific process template"""
    
    result = await db.execute(
        select(ProcessTemplate).where(ProcessTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Process template not found")
    
    return ProcessTemplateResponse.model_validate(template)