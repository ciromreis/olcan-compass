from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.auth import get_current_user
from app.core.entitlements import assert_can_create_route
from app.db.session import get_db
from app.db.models import (
    User,
    RouteTemplate,
    RouteMilestoneTemplate,
    Route,
    RouteMilestone,
    RouteStatus,
    MilestoneStatus,
)
from app.schemas.route import (
    RouteTemplateResponse,
    RouteCreateRequest,
    RouteUpdateRequest,
    RouteResponse,
    RouteListResponse,
    RouteDetailResponse,
    RouteMilestoneResponse,
    RouteMilestoneUpdateRequest,
    AvailableTemplatesResponse,
)

router = APIRouter(prefix="/routes", tags=["Route Engine"])


# --- Dossier Export (MUST be before /{route_id}) ---

@router.get("/dossier", name="dossier_export", tags=["Dossier"])
async def export_dossier_html(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export Master Strategic Dossier as HTML."""
    from fastapi.responses import StreamingResponse
    from app.services.dossier_orchestrator import get_master_dossier_for_user
    from app.utils.pdf_renderer import generate_dossier_pdf
    
    try:
        payload = await get_master_dossier_for_user(current_user.id)
        html_bytes = await generate_dossier_pdf(payload)
        
        filename = f"olcan_dossier_{payload.metadata.user_name.replace(' ', '_')}_{payload.metadata.generated_at.strftime('%Y%m%d')}.html"
        
        return StreamingResponse(
            iter([html_bytes]),
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dossier-data", name="dossier_payload", tags=["Dossier"])
async def get_dossier_payload(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get raw dossier payload as JSON."""
    from app.services.dossier_orchestrator import get_master_dossier_for_user
    
    try:
        return await get_master_dossier_for_user(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Template Endpoints ---

@router.get("/templates", response_model=AvailableTemplatesResponse)
async def get_available_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter modelos de rotas disponíveis"""
    result = await db.execute(
        select(RouteTemplate)
        .where(RouteTemplate.is_active)
        .order_by(RouteTemplate.name_en)
    )
    templates = result.scalars().all()
    
    # === ECONOMICS INTEGRATION: Temporal Matching ===
    # Get user's temporal preference for scoring
    from app.db.models import PsychProfile
    psych_result = await db.execute(
        select(PsychProfile).where(PsychProfile.user_id == current_user.id)
    )
    psych_profile = psych_result.scalar_one_or_none()
    
    user_temporal_preference = None
    if psych_profile and hasattr(psych_profile, 'temporal_preference'):
        user_temporal_preference = psych_profile.temporal_preference
    
    # Score and sort templates by temporal match
    template_responses = []
    for template in templates:
        response = RouteTemplateResponse.model_validate(template)
        
        # Calculate temporal match score if user has preference
        if user_temporal_preference is not None and hasattr(template, 'recommended_temporal_range_min'):
            min_range = template.recommended_temporal_range_min
            max_range = template.recommended_temporal_range_max
            
            if min_range is not None and max_range is not None:
                # Check if user preference falls within range
                if min_range <= user_temporal_preference <= max_range:
                    # Perfect match - in range
                    response.temporal_match_score = 100
                    response.temporal_match_reason = "Esta rota combina com seu ritmo"
                else:
                    # Calculate distance from range
                    if user_temporal_preference < min_range:
                        distance = min_range - user_temporal_preference
                    else:
                        distance = user_temporal_preference - max_range
                    
                    # Score decreases with distance (max distance is 100)
                    response.temporal_match_score = max(0, 100 - distance)
                    
                    if distance > 30:
                        response.temporal_match_reason = "Esta rota pode não se adequar ao seu ritmo"
                    else:
                        response.temporal_match_reason = "Esta rota é uma opção viável"
        
        template_responses.append(response)
    
    # Sort by temporal match score (descending), then by name
    if user_temporal_preference is not None:
        template_responses.sort(
            key=lambda t: (-(getattr(t, 'temporal_match_score', 0) or 0), getattr(t, 'name_en', "") or "")
        )
    
    return AvailableTemplatesResponse(
        templates=template_responses,
        total=len(template_responses)
    )


# --- User Route Endpoints ---

@router.post("", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def create_route(
    request: RouteCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Criar nova rota para o usuário"""
    # Entitlement check — enforce plan route limit server-side
    route_count_result = await db.execute(
        select(func.count(Route.id)).where(Route.user_id == current_user.id)
    )
    current_route_count = route_count_result.scalar() or 0
    assert_can_create_route(current_user.subscription_plan, current_route_count)

    # Verify template exists
    result = await db.execute(
        select(RouteTemplate).where(RouteTemplate.id == request.template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo de rota não encontrado"
        )
    
    # Count milestone templates
    result = await db.execute(
        select(func.count(RouteMilestoneTemplate.id))
        .where(RouteMilestoneTemplate.route_template_id == request.template_id)
    )
    total_milestones = result.scalar() or 0
    
    # Create route
    route = Route(
        user_id=current_user.id,
        template_id=request.template_id,
        name=request.name,
        target_country=request.target_country,
        target_organization=request.target_organization,
        target_deadline=request.target_deadline,
        status=RouteStatus.DRAFT,
        total_milestones=total_milestones,
    )
    
    db.add(route)
    await db.commit()
    await db.refresh(route)
    
    # Create milestones from templates
    if total_milestones > 0:
        result = await db.execute(
            select(RouteMilestoneTemplate)
            .where(RouteMilestoneTemplate.route_template_id == request.template_id)
            .order_by(RouteMilestoneTemplate.display_order)
        )
        milestone_templates = result.scalars().all()
        
        # Determine which milestones are available (first one)
        is_first = True
        for mt in milestone_templates:
            milestone = RouteMilestone(
                route_id=route.id,
                template_id=mt.id,
                status=MilestoneStatus.AVAILABLE if is_first else MilestoneStatus.LOCKED,
            )
            db.add(milestone)
            is_first = False
        
        await db.commit()
    
    return route


@router.get("", response_model=RouteListResponse)
async def list_routes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Listar rotas do usuário"""
    result = await db.execute(
        select(Route)
        .where(Route.user_id == current_user.id)
        .order_by(Route.updated_at.desc())
    )
    routes = result.scalars().all()
    
    return RouteListResponse(
        routes=[RouteResponse.model_validate(r) for r in routes],
        total=len(routes)
    )


@router.get("/{route_id}", response_model=RouteDetailResponse)
async def get_route_detail(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter detalhes de uma rota"""
    result = await db.execute(
        select(Route).where(
            Route.id == route_id,
            Route.user_id == current_user.id
        )
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rota não encontrada"
        )
    
    # Get milestones
    result = await db.execute(
        select(RouteMilestone)
        .where(RouteMilestone.route_id == route_id)
        .order_by(RouteMilestone.created_at)
    )
    milestones = result.scalars().all()
    
    # Get milestone templates for enrichment
    milestone_template_ids = [m.template_id for m in milestones if m.template_id]
    milestone_templates_map = {}
    if milestone_template_ids:
        result = await db.execute(
            select(RouteMilestoneTemplate)
            .where(RouteMilestoneTemplate.id.in_(milestone_template_ids))
        )
        for mt in result.scalars().all():
            milestone_templates_map[mt.id] = mt
    
    # Build enriched milestone responses
    enriched_milestones = []
    for m in milestones:
        resp = RouteMilestoneResponse.model_validate(m)
        mt = milestone_templates_map.get(m.template_id)
        if mt:
            resp.name_pt = mt.name_pt
            resp.name_en = mt.name_en
            resp.description_pt = mt.description_pt
            resp.description_en = mt.description_en
            resp.category = mt.category.value if hasattr(mt.category, 'value') else str(mt.category)
            resp.display_order = mt.display_order
            resp.estimated_days = mt.estimated_days
            resp.required_evidence = mt.required_evidence or []
            resp.is_required = mt.is_required
        enriched_milestones.append(resp)
    
    # Sort by display_order
    enriched_milestones.sort(key=lambda m: m.display_order or 0)
    
    # Get template
    result = await db.execute(
        select(RouteTemplate).where(RouteTemplate.id == route.template_id)
    )
    template = result.scalar_one()
    
    return RouteDetailResponse(
        route=RouteResponse.model_validate(route),
        milestones=enriched_milestones,
        template=RouteTemplateResponse.model_validate(template)
    )


@router.put("/{route_id}", response_model=RouteResponse)
async def update_route(
    route_id: UUID,
    request: RouteUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualizar rota"""
    result = await db.execute(
        select(Route).where(
            Route.id == route_id,
            Route.user_id == current_user.id
        )
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rota não encontrada"
        )
    
    if request.name is not None:
        route.name = request.name
    if request.target_country is not None:
        route.target_country = request.target_country
    if request.target_organization is not None:
        route.target_organization = request.target_organization
    if request.target_deadline is not None:
        route.target_deadline = request.target_deadline
    if request.notes is not None:
        route.notes = request.notes
    if request.status is not None:
        try:
            new_status = RouteStatus(request.status)
            route.status = new_status
            
            # Set started_at when status becomes active
            if new_status == RouteStatus.ACTIVE and not route.started_at:
                route.started_at = datetime.now(timezone.utc)
            
            # Set completed_at when status becomes completed
            if new_status == RouteStatus.COMPLETED and not route.completed_at:
                route.completed_at = datetime.now(timezone.utc)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status inválido"
            )
    
    await db.commit()
    await db.refresh(route)
    
    return route


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Excluir rota"""
    result = await db.execute(
        select(Route).where(
            Route.id == route_id,
            Route.user_id == current_user.id
        )
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rota não encontrada"
        )
    
    await db.delete(route)
    await db.commit()


# --- Milestone Endpoints ---

@router.patch("/milestones/{milestone_id}", response_model=RouteMilestoneResponse)
async def update_milestone(
    milestone_id: UUID,
    request: RouteMilestoneUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualizar milestone"""
    # Verify ownership through route
    result = await db.execute(
        select(RouteMilestone)
        .join(Route)
        .where(
            RouteMilestone.id == milestone_id,
            Route.user_id == current_user.id
        )
    )
    milestone = result.scalar_one_or_none()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone não encontrado"
        )
    
    if request.status is not None:
        try:
            new_status = MilestoneStatus(request.status)
            milestone.status = new_status
            
            if new_status == MilestoneStatus.IN_PROGRESS and not milestone.started_at:
                milestone.started_at = datetime.now(timezone.utc)
            
            if new_status == MilestoneStatus.COMPLETED:
                milestone.completed_at = datetime.now(timezone.utc)
                milestone.completion_percentage = 100
                
                # Unlock next milestone
                await _unlock_next_milestone(milestone, db)
                
                # Update route progress
                await _update_route_progress(milestone.route_id, db)
                
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status inválido"
            )
    
    if request.user_notes is not None:
        milestone.user_notes = request.user_notes
    if request.completion_notes is not None:
        milestone.completion_notes = request.completion_notes
    if request.due_date is not None:
        milestone.due_date = request.due_date
    
    await db.commit()
    await db.refresh(milestone)
    
    return milestone


async def _unlock_next_milestone(completed_milestone: RouteMilestone, db: AsyncSession):
    """Desbloquear próximo milestone após conclusão"""
    # Get current milestone's order
    result = await db.execute(
        select(RouteMilestoneTemplate).where(
            RouteMilestoneTemplate.id == completed_milestone.template_id
        )
    )
    current_template = result.scalar_one_or_none()
    
    if not current_template:
        return
    
    # Get all milestones for this route ordered by creation
    result = await db.execute(
        select(RouteMilestone)
        .where(RouteMilestone.route_id == completed_milestone.route_id)
        .order_by(RouteMilestone.created_at)
    )
    all_milestones = result.scalars().all()
    
    # Find current position and unlock next
    for i, m in enumerate(all_milestones):
        if m.id == completed_milestone.id and i + 1 < len(all_milestones):
            next_milestone = all_milestones[i + 1]
            if next_milestone.status == MilestoneStatus.LOCKED:
                next_milestone.status = MilestoneStatus.AVAILABLE
                db.add(next_milestone)
            break


async def _update_route_progress(route_id: UUID, db: AsyncSession):
    """Atualizar progresso da rota"""
    # Count completed milestones
    result = await db.execute(
        select(func.count(RouteMilestone.id))
        .where(
            RouteMilestone.route_id == route_id,
            RouteMilestone.status == MilestoneStatus.COMPLETED
        )
    )
    completed = result.scalar() or 0
    
    # Get total
    result = await db.execute(
        select(func.count(RouteMilestone.id))
        .where(RouteMilestone.route_id == route_id)
    )
    total = result.scalar() or 0
    
    # Update route
    result = await db.execute(
        select(Route).where(Route.id == route_id)
    )
route = result.scalar_one_or_none()
