"""Escrow API Routes - Performance-Bound Marketplace

Endpoints para gerenciar transações de escrow com liberação baseada em performance.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User, UserRole
from app.services import escrow as escrow_service
from app.schemas.economics import (
    CreateEscrowRequest,
    EscrowResponse,
    EscrowResolutionResponse,
    BookingEscrowStatusResponse,
)

router = APIRouter(prefix="/escrow", tags=["Economics - Escrow"])


@router.post("/create", response_model=EscrowResponse, status_code=status.HTTP_201_CREATED)
async def create_escrow(
    request: CreateEscrowRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria uma transação de escrow para reserva performance-bound.
    
    30% do valor é retido até que a condição de performance seja atendida.
    """
    try:
        booking_uuid = uuid.UUID(request.booking_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de reserva inválido"
        )
    
    # Validar release_condition
    if not isinstance(request.release_condition, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Condição de liberação deve ser um objeto"
        )
    
    if 'type' not in request.release_condition:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Condição de liberação deve ter campo 'type'"
        )
    
    try:
        escrow = await escrow_service.create_escrow(
            booking_id=booking_uuid,
            amount=request.amount_held,
            currency=request.currency,
            release_condition=request.release_condition,
            db=db
        )
        
        await db.commit()
        
        return EscrowResponse(
            id=str(escrow.id),
            booking_id=str(escrow.booking_id),
            amount_held=escrow.amount,
            currency=escrow.currency,
            status=escrow.status,
            release_condition=escrow.performance_bound,
            readiness_before=int(escrow.readiness_before) if escrow.readiness_before else None,
            readiness_after=int(escrow.readiness_after) if escrow.readiness_after else None,
            improvement_achieved=int(escrow.improvement_achieved) if escrow.improvement_achieved else None,
            created_at=escrow.created_at,
            resolved_at=escrow.released_at or escrow.refunded_at
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{escrow_id}", response_model=EscrowResponse)
async def get_escrow(
    escrow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém detalhes de uma transação de escrow.
    
    Usuário deve ser o cliente ou o prestador da reserva.
    """
    try:
        escrow_uuid = uuid.UUID(escrow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de escrow inválido"
        )
    
    # Buscar escrow
    from sqlalchemy import select
    from app.db.models.economics import EscrowTransaction
    
    result = await db.execute(
        select(EscrowTransaction).where(EscrowTransaction.id == escrow_uuid)
    )
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow não encontrado"
        )
    
    # Verificar permissão (cliente, provider ou admin)
    if (escrow.client_id != current_user.id and 
        escrow.provider_id != current_user.id and
        current_user.role != UserRole.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    return EscrowResponse(
        id=str(escrow.id),
        booking_id=str(escrow.booking_id),
        amount_held=escrow.amount,
        currency=escrow.currency,
        status=escrow.status,
        release_condition=escrow.performance_bound,
        readiness_before=int(escrow.readiness_before) if escrow.readiness_before else None,
        readiness_after=int(escrow.readiness_after) if escrow.readiness_after else None,
        improvement_achieved=int(escrow.improvement_achieved) if escrow.improvement_achieved else None,
        created_at=escrow.created_at,
        resolved_at=escrow.released_at or escrow.refunded_at
    )


@router.post("/{escrow_id}/resolve", response_model=EscrowResolutionResponse)
async def resolve_escrow(
    escrow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Resolve uma transação de escrow (libera ou reembolsa).
    
    **Requer role SUPER_ADMIN ou sistema.**
    
    Calcula melhoria de prontidão e decide se libera para provider ou reembolsa cliente.
    """
    # Verificar permissão de admin
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )
    
    try:
        escrow_uuid = uuid.UUID(escrow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de escrow inválido"
        )
    
    try:
        resolution = await escrow_service.resolve_escrow(
            escrow_id=escrow_uuid,
            db=db
        )
        
        await db.commit()
        
        return EscrowResolutionResponse(
            id=resolution['escrow_id'],
            status=resolution['status'],
            readiness_before=int(resolution['readiness_before']) if resolution['readiness_before'] else None,
            readiness_after=int(resolution['readiness_after']) if resolution['readiness_after'] else None,
            improvement_achieved=int(resolution['improvement_achieved']) if resolution['improvement_achieved'] else None,
            resolution=resolution['resolution'],
            resolved_at=resolution['resolved_at']
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/booking/{booking_id}", response_model=BookingEscrowStatusResponse)
async def get_booking_escrow_status(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém status de escrow para uma reserva.
    
    Retorna se a reserva tem escrow e seus detalhes.
    """
    try:
        booking_uuid = uuid.UUID(booking_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de reserva inválido"
        )
    
    # Buscar escrow
    escrow = await escrow_service.get_escrow_by_booking(
        booking_id=booking_uuid,
        db=db
    )
    
    if not escrow:
        return BookingEscrowStatusResponse(
            booking_id=booking_id,
            has_escrow=False,
            escrow=None
        )
    
    # Verificar permissão
    if (escrow.client_id != current_user.id and 
        escrow.provider_id != current_user.id and
        current_user.role != UserRole.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    escrow_response = EscrowResponse(
        id=str(escrow.id),
        booking_id=str(escrow.booking_id),
        amount_held=escrow.amount,
        currency=escrow.currency,
        status=escrow.status,
        release_condition=escrow.performance_bound,
        readiness_before=int(escrow.readiness_before) if escrow.readiness_before else None,
        readiness_after=int(escrow.readiness_after) if escrow.readiness_after else None,
        improvement_achieved=int(escrow.improvement_achieved) if escrow.improvement_achieved else None,
        created_at=escrow.created_at,
        resolved_at=escrow.released_at or escrow.refunded_at
    )
    
    return BookingEscrowStatusResponse(
        booking_id=booking_id,
        has_escrow=True,
        escrow=escrow_response
    )
