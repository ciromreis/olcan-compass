"""Credentials Service - Trust Signal System

Gera e gerencia credenciais de verificação criptográficas para usuários com alta prontidão.
"""

import secrets
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.db.models.economics import VerificationCredential, CredentialUsageTracking
from app.core.security.hashing import hash_user_identifier, hash_verification_data


async def generate_credential(
    user_id: uuid.UUID,
    credential_type: str,
    score_value: int,
    db: AsyncSession,
    credential_name: Optional[str] = None,
    expires_in_days: int = 90
) -> VerificationCredential:
    """
    Gera uma credencial de verificação criptográfica.
    
    Args:
        user_id: UUID do usuário
        credential_type: Tipo de credencial ('readiness', 'expertise', 'achievement')
        score_value: Valor do score (0-100)
        db: Sessão do banco de dados
        credential_name: Nome da credencial (opcional)
        expires_in_days: Dias até expiração (padrão: 90)
    
    Returns:
        VerificationCredential criada
    
    Raises:
        ValueError: Se score_value < 80 ou tipo inválido
    """
    # Validar score threshold
    if score_value < 80:
        raise ValueError("Score deve ser >= 80 para gerar credencial")
    
    # Validar tipo
    valid_types = ['readiness', 'expertise', 'achievement']
    if credential_type not in valid_types:
        raise ValueError(f"Tipo de credencial inválido. Use: {', '.join(valid_types)}")
    
    # Gerar hash de verificação usando função de hashing segura
    salt = secrets.token_hex(16)
    timestamp = datetime.now(timezone.utc).isoformat()
    verification_hash = hash_verification_data(
        user_id=user_id,
        credential_type=credential_type,
        score_value=score_value,
        issued_at=timestamp
    )
    
    # Gerar URL de verificação
    verification_url = f"https://compass.olcan.com/verify/{verification_hash}"
    
    # Nome padrão baseado no tipo
    if not credential_name:
        credential_name = {
            'readiness': 'Perfil de Prontidão Verificado',
            'expertise': 'Especialização Verificada',
            'achievement': 'Conquista Verificada'
        }[credential_type]
    
    # Calcular data de expiração
    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(days=expires_in_days)
    
    # Criar credencial
    credential = VerificationCredential(
        user_id=user_id,
        credential_type=credential_type,
        credential_name=credential_name,
        verification_hash=verification_hash,
        verification_url=verification_url,
        issued_at=issued_at,
        expires_at=expires_at,
        is_active=True,
        credential_metadata={
            'score_value': score_value,
            'salt': salt
        }
    )
    
    db.add(credential)
    await db.flush()
    
    return credential


async def verify_credential(
    verification_hash: str,
    db: AsyncSession
) -> Optional[dict]:
    """
    Verifica uma credencial usando o hash público.
    
    Args:
        verification_hash: Hash SHA-256 da credencial
        db: Sessão do banco de dados
    
    Returns:
        Dict com informações públicas da credencial ou None se inválida
    """
    result = await db.execute(
        select(VerificationCredential)
        .where(VerificationCredential.verification_hash == verification_hash)
    )
    credential = result.scalar_one_or_none()
    
    if not credential:
        return None
    
    # Verificar se está ativa e não expirada
    now = datetime.now(timezone.utc)
    is_valid = (
        credential.is_active and
        credential.revoked_at is None and
        (credential.expires_at is None or credential.expires_at > now)
    )
    
    if not is_valid:
        return None
    
    # Hash do user_id para não expor PII usando função segura
    user_id_hash = hash_user_identifier(credential.user_id)
    
    # Retornar apenas informações públicas
    return {
        'credential_type': credential.credential_type,
        'credential_name': credential.credential_name,
        'score_value': credential.credential_metadata.get('score_value'),
        'issued_at': credential.issued_at.isoformat(),
        'expires_at': credential.expires_at.isoformat() if credential.expires_at else None,
        'is_valid': True,
        'user_identifier_hash': user_id_hash
    }


async def revoke_credential(
    credential_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession,
    reason: Optional[str] = None
) -> bool:
    """
    Revoga uma credencial.
    
    Args:
        credential_id: UUID da credencial
        user_id: UUID do usuário (para validar ownership)
        db: Sessão do banco de dados
        reason: Motivo da revogação (opcional)
    
    Returns:
        True se revogada com sucesso, False se não encontrada ou não pertence ao usuário
    """
    result = await db.execute(
        select(VerificationCredential)
        .where(
            VerificationCredential.id == credential_id,
            VerificationCredential.user_id == user_id
        )
    )
    credential = result.scalar_one_or_none()
    
    if not credential:
        return False
    
    # Revogar
    credential.is_active = False
    credential.revoked_at = datetime.now(timezone.utc)
    if reason:
        credential.revocation_reason = reason
    
    await db.flush()
    return True


async def track_verification_click(
    verification_hash: str,
    ip_address: Optional[str],
    user_agent: Optional[str],
    db: AsyncSession
) -> None:
    """
    Registra um clique de verificação para analytics.
    
    Args:
        verification_hash: Hash da credencial verificada
        ip_address: IP do visitante (opcional)
        user_agent: User agent do navegador (opcional)
        db: Sessão do banco de dados
    """
    # Buscar credencial
    result = await db.execute(
        select(VerificationCredential)
        .where(VerificationCredential.verification_hash == verification_hash)
    )
    credential = result.scalar_one_or_none()
    
    if not credential:
        return
    
    # Criar evento de tracking
    tracking = CredentialUsageTracking(
        credential_id=credential.id,
        event_type='verification_click',
        ip_address=ip_address,
        user_agent=user_agent,
        metadata={}
    )
    
    db.add(tracking)
    await db.flush()


async def get_user_credentials(
    user_id: uuid.UUID,
    db: AsyncSession,
    include_expired: bool = False
) -> list[VerificationCredential]:
    """
    Obtém todas as credenciais de um usuário.
    
    Args:
        user_id: UUID do usuário
        db: Sessão do banco de dados
        include_expired: Se True, inclui credenciais expiradas
    
    Returns:
        Lista de credenciais
    """
    query = select(VerificationCredential).where(
        VerificationCredential.user_id == user_id
    )
    
    if not include_expired:
        now = datetime.now(timezone.utc)
        query = query.where(
            VerificationCredential.is_active,
            VerificationCredential.revoked_at.is_(None),
            (VerificationCredential.expires_at.is_(None) | (VerificationCredential.expires_at > now))
        )
    
    query = query.order_by(VerificationCredential.issued_at.desc())
    
    result = await db.execute(query)
    return list(result.scalars().all())


async def has_active_credential(
    user_id: uuid.UUID,
    db: AsyncSession,
    credential_type: Optional[str] = None
) -> bool:
    """
    Verifica se usuário tem credencial ativa.
    
    Args:
        user_id: UUID do usuário
        db: Sessão do banco de dados
        credential_type: Tipo específico de credencial (opcional)
    
    Returns:
        True se tem credencial ativa
    """
    now = datetime.now(timezone.utc)
    
    query = select(VerificationCredential).where(
        VerificationCredential.user_id == user_id,
        VerificationCredential.is_active,
        VerificationCredential.revoked_at.is_(None),
        (VerificationCredential.expires_at.is_(None) | (VerificationCredential.expires_at > now))
    )
    
    if credential_type:
        query = query.where(VerificationCredential.credential_type == credential_type)
    
    result = await db.execute(query)
    return result.scalar_one_or_none() is not None


async def track_credential_usage_in_application(
    credential_id: uuid.UUID,
    application_id: uuid.UUID,
    db: AsyncSession
) -> None:
    """
    Registra uso de credencial em uma aplicação.
    
    Args:
        credential_id: UUID da credencial
        application_id: UUID da aplicação
        db: Sessão do banco de dados
    """
    tracking = CredentialUsageTracking(
        credential_id=credential_id,
        event_type='application_attached',
        application_id=application_id,
        metadata={}
    )
    
    db.add(tracking)
    await db.flush()


async def expire_old_credentials(db: AsyncSession) -> int:
    """
    Marca credenciais expiradas como inativas (job diário).
    
    Args:
        db: Sessão do banco de dados
    
    Returns:
        Número de credenciais expiradas
    """
    now = datetime.now(timezone.utc)
    
    result = await db.execute(
        update(VerificationCredential)
        .where(
            VerificationCredential.is_active,
            VerificationCredential.expires_at <= now
        )
        .values(is_active=False)
    )
    
    await db.flush()
    return result.rowcount
