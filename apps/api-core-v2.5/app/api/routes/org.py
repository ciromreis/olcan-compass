from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import (
    User,
    Organization,
    OrganizationMember,
    OrganizationMemberRole,
    UserRole
)
from app.schemas.organization import (
    OrganizationResponse,
    OrganizationUpdate,
    OrganizationMemberResponse,
    OrganizationMemberUpdate,
    OrganizationInviteRequest,
    OrganizationDashboardStats
)

router = APIRouter(prefix="/org", tags=["Organizations"])


@router.get("/me", response_model=OrganizationResponse)
async def get_my_organization(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter a organização do usuário atual"""
    result = await db.execute(
        select(Organization)
        .join(OrganizationMember)
        .where(OrganizationMember.user_id == current_user.id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você não pertence a nenhuma organização"
        )
    
    return org


@router.patch("/me", response_model=OrganizationResponse)
async def update_my_organization(
    request: OrganizationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualizar configurações da organização (apenas Admin/Owner)"""
    # Check membership and role
    result = await db.execute(
        select(OrganizationMember)
        .where(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.role.in_([OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN])
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar a organização"
        )
    
    # Get organization
    result = await db.execute(select(Organization).where(Organization.id == member.organization_id))
    org = result.scalar_one()
    
    # Update fields
    if request.name is not None:
        org.name = request.name
    if request.description is not None:
        org.description = request.description
    if request.website_url is not None:
        org.website_url = request.website_url
    if request.logo_url is not None:
        org.logo_url = request.logo_url
    if request.country is not None:
        org.country = request.country
    if request.city is not None:
        org.city = request.city
    if request.settings is not None:
        org.settings = {**org.settings, **request.settings}
    if request.is_active is not None:
        org.is_active = request.is_active
    
    await db.commit()
    await db.refresh(org)
    
    return org


@router.get("/members", response_model=List[OrganizationMemberResponse])
async def list_organization_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Listar membros da organização"""
    # First find user's org
    result = await db.execute(
        select(OrganizationMember.organization_id)
        .where(OrganizationMember.user_id == current_user.id)
    )
    org_id = result.scalar_one_or_none()
    
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organização não encontrada"
        )
    
    # Get all members with user data
    result = await db.execute(
        select(OrganizationMember, User.full_name, User.email)
        .join(User, OrganizationMember.user_id == User.id)
        .where(OrganizationMember.organization_id == org_id)
        .order_by(OrganizationMember.joined_at)
    )
    
    member_data = []
    for member, full_name, email in result.all():
        resp = OrganizationMemberResponse.model_validate(member)
        resp.user_name = full_name
        resp.user_email = email
        member_data.append(resp)
        
    return member_data


@router.post("/invite", response_model=OrganizationMemberResponse)
async def invite_member(
    request: OrganizationInviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Convidar novo membro para a organização"""
    # Verify permission
    result = await db.execute(
        select(OrganizationMember)
        .where(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.role.in_([OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN, OrganizationMemberRole.COORDINATOR])
        )
    )
    inviter = result.scalar_one_or_none()
    
    if not inviter:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão insuficiente para convidar membros"
        )
    
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email.lower()))
    user = result.scalar_one_or_none()
    
    if not user:
        # In a real app, we'd trigger an email invite flow here.
        # For this phase, we assume the user must already have an account.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário com este email não encontrado. Ele deve criar uma conta primeiro."
        )
    
    # Check if already a member
    result = await db.execute(
        select(OrganizationMember)
        .where(
            OrganizationMember.organization_id == inviter.organization_id,
            OrganizationMember.user_id == user.id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já é membro desta organização"
        )
    
    # Create membership
    new_member = OrganizationMember(
        organization_id=inviter.organization_id,
        user_id=user.id,
        role=request.role,
        status="active" # Assuming immediate join for now
    )
    
    # Update user role if needed
    if user.role == UserRole.USER:
        if request.role == OrganizationMemberRole.OWNER:
            user.role = UserRole.ORG_ADMIN
        elif request.role == OrganizationMemberRole.ADMIN:
            user.role = UserRole.ORG_ADMIN
        elif request.role == OrganizationMemberRole.COORDINATOR:
            user.role = UserRole.ORG_COORDINATOR
        else:
            user.role = UserRole.ORG_MEMBER
    
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)
    
    # Enrich response
    resp = OrganizationMemberResponse.model_validate(new_member)
    resp.user_name = user.full_name
    resp.user_email = user.email
    
    return resp


@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    member_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remover membro da organização"""
    # Verify permission
    result = await db.execute(
        select(OrganizationMember)
        .where(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.role.in_([OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN])
        )
    )
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem remover membros"
        )
    
    # Get member to remove
    result = await db.execute(
        select(OrganizationMember)
        .where(
            OrganizationMember.id == member_id,
            OrganizationMember.organization_id == admin.organization_id
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro não encontrado ou não pertence à sua organização"
        )
    
    if member.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode se remover da organização (use outra rota ou peça a outro admin)"
        )
        
    await db.delete(member)
    await db.commit()


@router.patch("/members/{member_id}", response_model=OrganizationMemberResponse)
async def update_member(
    member_id: UUID,
    request: OrganizationMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualizar papel ou status de um membro (Owner/Admin apenas)"""
    # Verify permission
    result = await db.execute(
        select(OrganizationMember)
        .where(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.role.in_([OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN])
        )
    )
    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar membros"
        )

    # Get member to update
    result = await db.execute(
        select(OrganizationMember)
        .where(
            OrganizationMember.id == member_id,
            OrganizationMember.organization_id == admin.organization_id
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro não encontrado ou não pertence à sua organização"
        )

    # Update fields
    if request.role is not None:
        member.role = request.role
    if request.status is not None:
        member.status = request.status

    await db.commit()
    await db.refresh(member)

    # Get user data for response enrichment
    user_result = await db.execute(select(User).where(User.id == member.user_id))
    user = user_result.scalar_one()

    resp = OrganizationMemberResponse.model_validate(member)
    resp.user_name = user.full_name
    resp.user_email = user.email

    return resp


@router.get("/stats", response_model=OrganizationDashboardStats)
async def get_org_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter estatísticas do dashboard da organização"""
    # Find org
    result = await db.execute(
        select(OrganizationMember.organization_id)
        .where(OrganizationMember.user_id == current_user.id)
    )
    org_id = result.scalar_one_or_none()
    
    if not org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organização não encontrada")
        
    # Total members
    members_count = await db.execute(
        select(func.count(OrganizationMember.id))
        .where(OrganizationMember.organization_id == org_id)
    )
    total_members = members_count.scalar() or 0
    
    # Member IDs
    m_ids_result = await db.execute(
        select(OrganizationMember.user_id)
        .where(OrganizationMember.organization_id == org_id)
    )
    user_ids = [r for r in m_ids_result.scalars().all()]
    
    # Applications count
    from app.db.models import UserApplication
    apps_count = await db.execute(
        select(func.count(UserApplication.id))
        .where(UserApplication.user_id.in_(user_ids))
    )
    total_applications = apps_count.scalar() or 0
    
    # Routes count
    from app.db.models import Route
    routes_count = await db.execute(
        select(func.count(Route.id))
        .where(Route.user_id.in_(user_ids))
    )
    total_routes = routes_count.scalar() or 0
    
    # Average score (Psych)
    from app.db.models import PsychProfile
    scores_result = await db.execute(
        select(func.avg(PsychProfile.readiness_score))
        .where(PsychProfile.user_id.in_(user_ids))
    )
    average_score = float(scores_result.scalar() or 0.0)
    
    return OrganizationDashboardStats(
        total_members=total_members,
        active_members=total_members, # Simplified
        pending_invites=0, # Placeholder
        total_applications=total_applications,
        total_routes=total_routes,
        average_score=average_score
    )
