"""Credentials API Routes - Trust Signal System

Endpoints para gerenciar credenciais de verificação criptográficas.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.services import credentials as credentials_service
from app.schemas.economics import (
    GenerateCredentialRequest,
    CredentialResponse,
    CredentialListResponse,
    CredentialPublicView,
    TrackCredentialUsageRequest,
    TrackCredentialUsageResponse,
)

router = APIRouter(prefix="/credentials", tags=["Economics - Credentials"])

# Configurar rate limiter
limiter = Limiter(key_func=get_remote_address)


@router.post("/generate", response_model=CredentialResponse, status_code=status.HTTP_201_CREATED)
async def generate_credential(
    request: GenerateCredentialRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Gera uma nova credencial de verificação para o usuário.
    
    Requer score >= 80 para gerar credencial.
    """
    try:
        credential = await credentials_service.generate_credential(
            user_id=current_user.id,
            credential_type=request.credential_type,
            score_value=request.score_value,
            db=db,
            credential_name=request.credential_name
        )
        
        await db.commit()
        
        return CredentialResponse(
            id=str(credential.id),
            credential_type=credential.credential_type,
            credential_name=credential.credential_name,
            score_value=credential.credential_metadata.get('score_value', request.score_value),
            issued_at=credential.issued_at,
            expires_at=credential.expires_at,
            verification_url=credential.verification_url,
            verification_hash=credential.verification_hash,
            is_active=credential.is_active,
            verification_clicks=0
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me", response_model=CredentialListResponse)
async def get_my_credentials(
    include_expired: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém todas as credenciais do usuário autenticado.
    
    Query params:
    - include_expired: Se True, inclui credenciais expiradas
    """
    credentials = await credentials_service.get_user_credentials(
        user_id=current_user.id,
        db=db,
        include_expired=include_expired
    )
    
    # Contar credenciais ativas
    active_count = sum(1 for c in credentials if c.is_active and c.revoked_at is None)
    
    credential_responses = [
        CredentialResponse(
            id=str(c.id),
            credential_type=c.credential_type,
            credential_name=c.credential_name,
            score_value=c.credential_metadata.get('score_value', 0),
            issued_at=c.issued_at,
            expires_at=c.expires_at,
            verification_url=c.verification_url,
            verification_hash=c.verification_hash,
            is_active=c.is_active,
            verification_clicks=0  # TODO: Implementar contagem real
        )
        for c in credentials
    ]
    
    return CredentialListResponse(
        credentials=credential_responses,
        total=len(credentials),
        active_count=active_count
    )


@router.get("/verify/{verification_hash}", response_model=CredentialPublicView)
@limiter.limit("10/hour")
async def verify_credential(
    verification_hash: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint público para verificar uma credencial (sem autenticação).
    
    Rate limit: 10 requisições por IP por hora.
    """
    # Obter IP do cliente
    client_ip = request.client.host if request.client else "unknown"
    
    # Verificar credencial
    credential_data = await credentials_service.verify_credential(
        verification_hash=verification_hash,
        db=db
    )
    
    if not credential_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credencial não encontrada ou expirada"
        )
    
    # Registrar clique de verificação
    user_agent = request.headers.get("user-agent")
    await credentials_service.track_verification_click(
        verification_hash=verification_hash,
        ip_address=client_ip,
        user_agent=user_agent,
        db=db
    )
    
    await db.commit()
    
    return CredentialPublicView(**credential_data)


@router.post("/{credential_id}/revoke", status_code=status.HTTP_200_OK)
async def revoke_credential(
    credential_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Revoga uma credencial do usuário.
    
    Apenas o proprietário pode revogar sua credencial.
    """
    try:
        credential_uuid = uuid.UUID(credential_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de credencial inválido"
        )
    
    success = await credentials_service.revoke_credential(
        credential_id=credential_uuid,
        user_id=current_user.id,
        db=db,
        reason="Revogada pelo usuário"
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credencial não encontrada ou não pertence ao usuário"
        )
    
    await db.commit()
    
    return {
        "message": "Credencial revogada com sucesso",
        "revoked_at": "now"  # TODO: Retornar timestamp real
    }


@router.post("/{credential_id}/track-usage", response_model=TrackCredentialUsageResponse, status_code=status.HTTP_201_CREATED)
async def track_credential_usage(
    credential_id: str,
    request: TrackCredentialUsageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Registra uso de credencial em uma aplicação.
    
    Usado para analytics e atribuição de conversão.
    """
    try:
        credential_uuid = uuid.UUID(credential_id)
        application_uuid = uuid.UUID(request.application_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID inválido"
        )
    
    # Verificar se credencial pertence ao usuário
    has_credential = await credentials_service.has_active_credential(
        user_id=current_user.id,
        db=db
    )
    
    if not has_credential:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credencial não encontrada"
        )
    
    # Registrar uso
    await credentials_service.track_credential_usage_in_application(
        credential_id=credential_uuid,
        application_id=application_uuid,
        db=db
    )
    
    await db.commit()
    
    from datetime import datetime, timezone
    
    return TrackCredentialUsageResponse(
        id=str(uuid.uuid4()),  # TODO: Retornar ID real do tracking
        tracked_at=datetime.now(timezone.utc)
    )
