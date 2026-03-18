"""Application Management Engine API Routes"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import (
    User,
    Opportunity,
    UserApplication,
    ApplicationDocument,
    OpportunityWatchlist,
    OpportunityMatch,
    OpportunityType,
    OpportunityStatus,
    ApplicationStatus,
)
from app.schemas.application import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityDetailResponse,
    OpportunityListResponse,
    OpportunityListItem,
    UserApplicationCreate,
    UserApplicationUpdate,
    UserApplicationDetailResponse,
    UserApplicationListResponse,
    UserApplicationListItem,
    ApplicationDocumentCreate,
    ApplicationDocumentUpdate,
    ApplicationDocumentResponse,
    WatchlistAddRequest,
    WatchlistItem,
    WatchlistListResponse,
    OpportunityMatchResponse,
    OpportunityMatchListResponse,
    MatchFeedbackRequest,
    ApplicationStats,
    SubmitApplicationRequest,
    ApplicationOutcomeRequest,
)

router = APIRouter(prefix="/applications", tags=["Application Management"])


# === OPPORTUNITIES ===

@router.get("/opportunities", response_model=OpportunityListResponse)
async def list_opportunities(
    opportunity_type: Optional[OpportunityType] = None,
    country: Optional[str] = None,
    status: OpportunityStatus = Query(OpportunityStatus.PUBLISHED),
    deadline_after: Optional[datetime] = None,
    deadline_before: Optional[datetime] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List opportunities with filtering"""
    query = select(Opportunity).where(Opportunity.status == status)
    
    if opportunity_type:
        query = query.where(Opportunity.opportunity_type == opportunity_type)
    if country:
        query = query.where(
            or_(
                Opportunity.location_country.ilike(f"%{country}%"),
                Opportunity.organization_country.ilike(f"%{country}%")
            )
        )
    if deadline_after:
        query = query.where(Opportunity.application_deadline >= deadline_after)
    if deadline_before:
        query = query.where(Opportunity.application_deadline <= deadline_before)
    if search:
        query = query.where(
            or_(
                Opportunity.title.ilike(f"%{search}%"),
                Opportunity.description.ilike(f"%{search}%"),
                Opportunity.organization_name.ilike(f"%{search}%")
            )
        )
    
    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Order by featured first, then deadline
    query = query.order_by(
        desc(Opportunity.is_featured),
        Opportunity.application_deadline.asc().nullslast(),
        desc(Opportunity.created_at)
    )
    
    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    opportunities = result.scalars().all()
    
    # === ECONOMICS INTEGRATION: Opportunity Cost & Competitiveness ===
    # Check user momentum for growth widget display
    show_growth_widget = False
    try:
        from app.services.opportunity_cost import should_show_widget
        show_growth_widget = await should_show_widget(current_user.id, db)
    except Exception:
        pass  # Economics service may fail; default to not showing widget
    
    # Enrich opportunities with economics data
    enriched_items = []
    for opp in opportunities:
        item = OpportunityListItem.model_validate(opp)
        
        # Add opportunity cost if available
        if hasattr(opp, 'opportunity_cost_daily') and opp.opportunity_cost_daily:
            item.opportunity_cost_daily = float(opp.opportunity_cost_daily)
        
        # Add competitiveness score if available
        if hasattr(opp, 'competitiveness_score') and opp.competitiveness_score:
            item.competitiveness_score = opp.competitiveness_score
        
        enriched_items.append(item)
    
    response = OpportunityListResponse(
        items=enriched_items,
        total=total,
        page=page,
        page_size=page_size
    )
    
    # Add growth widget flag to response metadata
    if hasattr(response, '__dict__'):
        response.__dict__['show_growth_widget'] = show_growth_widget
    
    return response


@router.get("/opportunities/{opportunity_id}", response_model=OpportunityDetailResponse)
async def get_opportunity(
    opportunity_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get opportunity details"""
    result = await db.execute(
        select(Opportunity).where(Opportunity.id == opportunity_id)
    )
    opportunity = result.scalar_one_or_none()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Increment view count
    opportunity.view_count += 1
    await db.commit()
    
    return opportunity


@router.post("/opportunities", response_model=OpportunityDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    request: OpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new opportunity (admin/providers only in production)"""
    # TODO: Add role check
    
    opportunity = Opportunity(
        **request.model_dump(),
        created_by_id=current_user.id,
        status=OpportunityStatus.PUBLISHED,
        published_at=datetime.now(timezone.utc)
    )
    db.add(opportunity)
    await db.commit()
    await db.refresh(opportunity)
    
    return opportunity


@router.patch("/opportunities/{opportunity_id}", response_model=OpportunityDetailResponse)
async def update_opportunity(
    opportunity_id: UUID,
    request: OpportunityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an opportunity"""
    result = await db.execute(
        select(Opportunity).where(Opportunity.id == opportunity_id)
    )
    opportunity = result.scalar_one_or_none()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # TODO: Check ownership/permissions
    
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(opportunity, field, value)
    
    opportunity.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(opportunity)
    
    return opportunity


# === USER APPLICATIONS ===

@router.post("", response_model=UserApplicationDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    request: UserApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new application (add to watchlist, planned, or in-progress)"""
    # Verify opportunity exists
    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == request.opportunity_id)
    )
    if not opp_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Check if already applied
    existing_result = await db.execute(
        select(UserApplication).where(
            UserApplication.user_id == current_user.id,
            UserApplication.opportunity_id == request.opportunity_id
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already have an application for this opportunity")
    
    application = UserApplication(
        user_id=current_user.id,
        opportunity_id=request.opportunity_id,
        status=request.status,
        priority=request.priority,
        notes=request.notes
    )
    
    if request.status in [ApplicationStatus.IN_PROGRESS, ApplicationStatus.SUBMITTED]:
        application.started_at = datetime.now(timezone.utc)
    
    db.add(application)
    await db.commit()
    await db.refresh(application)
    
    return application


@router.get("", response_model=UserApplicationListResponse)
async def list_applications(
    status: Optional[ApplicationStatus] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's applications"""
    query = select(UserApplication).where(UserApplication.user_id == current_user.id)
    
    if status:
        query = query.where(UserApplication.status == status)
    
    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Order by priority and updated
    query = query.order_by(
        desc(UserApplication.priority == "high"),
        desc(UserApplication.priority == "medium"),
        desc(UserApplication.updated_at)
    )
    
    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    applications = result.scalars().all()
    
    # Load opportunity data for each
    items = []
    for app in applications:
        item = UserApplicationListItem.model_validate(app)
        
        # Load opportunity
        opp_result = await db.execute(
            select(Opportunity).where(Opportunity.id == app.opportunity_id)
        )
        opp = opp_result.scalar_one_or_none()
        if opp:
            item.opportunity = OpportunityListItem.model_validate(opp)
        
        items.append(item)
    
    return UserApplicationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


# === WATCHLIST === (must be before /{application_id} routes)

@router.post("/watchlist", response_model=WatchlistItem, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    request: WatchlistAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add opportunity to watchlist"""
    # Check if already in watchlist
    existing = await db.execute(
        select(OpportunityWatchlist).where(
            OpportunityWatchlist.user_id == current_user.id,
            OpportunityWatchlist.opportunity_id == request.opportunity_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in watchlist")
    
    watchlist_item = OpportunityWatchlist(
        user_id=current_user.id,
        opportunity_id=request.opportunity_id,
        reminder_date=request.reminder_date,
        notes=request.notes
    )
    db.add(watchlist_item)
    await db.commit()
    await db.refresh(watchlist_item)
    
    return watchlist_item


@router.get("/watchlist", response_model=WatchlistListResponse)
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's watchlist"""
    result = await db.execute(
        select(OpportunityWatchlist)
        .where(OpportunityWatchlist.user_id == current_user.id)
        .order_by(desc(OpportunityWatchlist.created_at))
    )
    items = result.scalars().all()
    
    # Load opportunity data
    watchlist_items = []
    for item in items:
        wl_item = WatchlistItem.model_validate(item)
        
        opp_result = await db.execute(
            select(Opportunity).where(Opportunity.id == item.opportunity_id)
        )
        opp = opp_result.scalar_one_or_none()
        if opp:
            wl_item.opportunity = OpportunityListItem.model_validate(opp)
        
        watchlist_items.append(wl_item)
    
    return WatchlistListResponse(
        items=watchlist_items,
        total=len(watchlist_items)
    )


@router.delete("/watchlist/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(
    watchlist_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove from watchlist"""
    result = await db.execute(
        select(OpportunityWatchlist).where(
            OpportunityWatchlist.id == watchlist_id,
            OpportunityWatchlist.user_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    
    await db.delete(item)
    await db.commit()
    
    return None


# === MATCHES === (must be before /{application_id} routes)

@router.get("/matches", response_model=OpportunityMatchListResponse)
async def get_matches(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-generated opportunity matches for the user"""
    result = await db.execute(
        select(OpportunityMatch)
        .where(
            OpportunityMatch.user_id == current_user.id,
            not OpportunityMatch.is_dismissed
        )
        .order_by(desc(OpportunityMatch.match_score))
        .limit(limit)
    )
    matches = result.scalars().all()
    
    # Load opportunity data
    match_items = []
    for match in matches:
        match_response = OpportunityMatchResponse.model_validate(match)
        
        opp_result = await db.execute(
            select(Opportunity).where(Opportunity.id == match.opportunity_id)
        )
        opp = opp_result.scalar_one_or_none()
        if opp:
            match_response.opportunity = OpportunityListItem.model_validate(opp)
        
        match_items.append(match_response)
    
    return OpportunityMatchListResponse(
        items=match_items,
        total=len(match_items)
    )


@router.post("/matches/{match_id}/feedback", response_model=OpportunityMatchResponse)
async def record_match_feedback(
    match_id: UUID,
    request: MatchFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Record user feedback on a match"""
    result = await db.execute(
        select(OpportunityMatch).where(
            OpportunityMatch.id == match_id,
            OpportunityMatch.user_id == current_user.id
        )
    )
    match = result.scalar_one_or_none()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.user_feedback = request.user_feedback
    match.feedback_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(match)
    
    return match


@router.post("/matches/{match_id}/dismiss", response_model=OpportunityMatchResponse)
async def dismiss_match(
    match_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Dismiss a match"""
    result = await db.execute(
        select(OpportunityMatch).where(
            OpportunityMatch.id == match_id,
            OpportunityMatch.user_id == current_user.id
        )
    )
    match = result.scalar_one_or_none()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.is_dismissed = True
    
    await db.commit()
    await db.refresh(match)
    
    return match


# === DASHBOARD STATS === (must be before /{application_id} routes)

@router.get("/stats/dashboard", response_model=ApplicationStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    
    # Count by status
    status_counts = {}
    for app_status in ApplicationStatus:
        count_result = await db.execute(
            select(func.count()).where(
                UserApplication.user_id == current_user.id,
                UserApplication.status == app_status
            )
        )
        status_counts[app_status.value] = count_result.scalar()
    
    total = sum(status_counts.values())
    
    # Upcoming deadlines (next 14 days)
    upcoming_result = await db.execute(
        select(UserApplication)
        .join(Opportunity, UserApplication.opportunity_id == Opportunity.id)
        .where(
            UserApplication.user_id == current_user.id,
            UserApplication.status.in_([ApplicationStatus.IN_PROGRESS, ApplicationStatus.PLANNED]),
            Opportunity.application_deadline >= datetime.now(timezone.utc),
            Opportunity.application_deadline <= datetime.now(timezone.utc) + timedelta(days=14)
        )
        .order_by(Opportunity.application_deadline)
        .limit(5)
    )
    upcoming = upcoming_result.scalars().all()
    
    # Recent activity
    recent_result = await db.execute(
        select(UserApplication)
        .where(UserApplication.user_id == current_user.id)
        .order_by(desc(UserApplication.updated_at))
        .limit(5)
    )
    recent = recent_result.scalars().all()
    
    # Average completion
    avg_result = await db.execute(
        select(func.avg(UserApplication.completion_percentage))
        .where(UserApplication.user_id == current_user.id)
    )
    avg_completion = avg_result.scalar() or 0
    
    # Load opportunity data for upcoming and recent
    async def load_opps(apps):
        items = []
        for app in apps:
            item = UserApplicationListItem.model_validate(app)
            opp_result = await db.execute(
                select(Opportunity).where(Opportunity.id == app.opportunity_id)
            )
            opp = opp_result.scalar_one_or_none()
            if opp:
                item.opportunity = OpportunityListItem.model_validate(opp)
            items.append(item)
        return items
    
    return ApplicationStats(
        total_applications=total,
        by_status=status_counts,
        upcoming_deadlines=await load_opps(upcoming),
        recent_activity=await load_opps(recent),
        completion_average=round(avg_completion, 1)
    )


# === USER APPLICATION DETAIL (parameterized routes last) ===

@router.get("/{application_id}", response_model=UserApplicationDetailResponse)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get application details with documents"""
    result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    response = UserApplicationDetailResponse.model_validate(application)
    
    # Load opportunity
    opp_result = await db.execute(
        select(Opportunity).where(Opportunity.id == application.opportunity_id)
    )
    opp = opp_result.scalar_one_or_none()
    if opp:
        response.opportunity = OpportunityListItem.model_validate(opp)
    
    # Load documents
    docs_result = await db.execute(
        select(ApplicationDocument).where(
            ApplicationDocument.application_id == application_id
        )
    )
    documents = docs_result.scalars().all()
    response.documents = [ApplicationDocumentResponse.model_validate(d) for d in documents]
    
    return response


@router.patch("/{application_id}", response_model=UserApplicationDetailResponse)
async def update_application(
    application_id: UUID,
    request: UserApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update application"""
    result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update fields
    if request.status:
        # Handle status transitions
        if request.status in [ApplicationStatus.IN_PROGRESS, ApplicationStatus.SUBMITTED] and not application.started_at:
            application.started_at = datetime.now(timezone.utc)
        application.status = request.status
    
    if request.priority:
        application.priority = request.priority
    if request.notes is not None:
        application.notes = request.notes
    if request.checklist_progress:
        application.checklist_progress = request.checklist_progress
        # Recalculate completion percentage
        if application.checklist_progress:
            total = len(application.checklist_progress)
            done = sum(1 for v in application.checklist_progress.values() if v)
            application.completion_percentage = int((done / total) * 100) if total > 0 else 0
    
    application.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(application)
    
    return application


@router.post("/{application_id}/submit", response_model=UserApplicationDetailResponse)
async def submit_application(
    application_id: UUID,
    request: SubmitApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark application as submitted"""
    result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = ApplicationStatus.SUBMITTED
    application.submitted_at = request.submitted_at or datetime.now(timezone.utc)
    application.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(application)
    
    return application


@router.post("/{application_id}/outcome", response_model=UserApplicationDetailResponse)
async def record_outcome(
    application_id: UUID,
    request: ApplicationOutcomeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Record application outcome (accepted, rejected, etc.)"""
    result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.outcome = request.outcome
    application.feedback_received = request.feedback_received
    application.response_received_at = datetime.now(timezone.utc)
    
    # Map outcome to status
    if request.outcome == "accepted":
        application.status = ApplicationStatus.ACCEPTED
    elif request.outcome == "rejected":
        application.status = ApplicationStatus.REJECTED
    
    application.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(application)
    
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete application"""
    result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    await db.delete(application)
    await db.commit()
    
    return None


# === APPLICATION DOCUMENTS ===

@router.post("/{application_id}/documents", response_model=ApplicationDocumentResponse, status_code=status.HTTP_201_CREATED)
async def add_document(
    application_id: UUID,
    request: ApplicationDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a document to an application"""
    # Verify ownership
    app_result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    if not app_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Application not found")
    
    document = ApplicationDocument(
        application_id=application_id,
        **request.model_dump()
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    
    return document


@router.get("/{application_id}/documents", response_model=List[ApplicationDocumentResponse])
async def list_documents(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List documents for an application"""
    # Verify ownership
    app_result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    if not app_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Application not found")
    
    result = await db.execute(
        select(ApplicationDocument).where(
            ApplicationDocument.application_id == application_id
        )
    )
    documents = result.scalars().all()
    
    return [ApplicationDocumentResponse.model_validate(d) for d in documents]


@router.patch("/{application_id}/documents/{document_id}", response_model=ApplicationDocumentResponse)
async def update_document(
    application_id: UUID,
    document_id: UUID,
    request: ApplicationDocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update application document"""
    # Verify ownership
    app_result = await db.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user.id
        )
    )
    if not app_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Application not found")
    
    result = await db.execute(
        select(ApplicationDocument).where(
            ApplicationDocument.id == document_id,
            ApplicationDocument.application_id == application_id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    document.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(document)
    
    return document

