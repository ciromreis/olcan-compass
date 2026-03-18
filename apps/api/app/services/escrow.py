"""Escrow Service - Performance-Bound Marketplace

Gerencia transações de escrow com liberação baseada em melhoria de prontidão.
"""

import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import selectinload

from app.db.models.economics import EscrowTransaction, EscrowStatus
from app.db.models.marketplace import Booking, ProviderProfile
from app.db.models.sprint import ReadinessAssessment


async def create_escrow(
    booking_id: uuid.UUID,
    amount: Decimal,
    currency: str,
    release_condition: Dict[str, Any],
    db: AsyncSession,
    stripe_payment_intent_id: Optional[str] = None
) -> EscrowTransaction:
    """
    Cria uma transação de escrow para reserva performance-bound.
    
    Args:
        booking_id: UUID da reserva
        amount: Valor a ser retido (30% do total)
        currency: Moeda (USD, BRL, etc.)
        release_condition: Condições de liberação (ex: {"type": "readiness_improvement", "min_improvement": 10})
        db: Sessão do banco de dados
        stripe_payment_intent_id: ID do payment intent do Stripe (opcional)
    
    Returns:
        EscrowTransaction criada
    
    Raises:
        ValueError: Se reserva não encontrada ou já tem escrow
    """
    # Buscar reserva
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.service))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise ValueError("Reserva não encontrada")
    
    # Verificar se já existe escrow
    result = await db.execute(
        select(EscrowTransaction).where(EscrowTransaction.booking_id == booking_id)
    )
    existing_escrow = result.scalar_one_or_none()
    
    if existing_escrow:
        raise ValueError("Escrow já existe para esta reserva")
    
    # Obter readiness atual do cliente (baseline)
    result = await db.execute(
        select(ReadinessAssessment)
        .where(ReadinessAssessment.user_id == booking.client_id)
        .order_by(ReadinessAssessment.created_at.desc())
        .limit(1)
    )
    latest_assessment = result.scalar_one_or_none()
    
    readiness_before = latest_assessment.overall_readiness if latest_assessment else 0.0
    
    # Criar transação de escrow
    escrow = EscrowTransaction(
        booking_id=booking_id,
        client_id=booking.client_id,
        provider_id=booking.provider_id,
        amount=amount,
        currency=currency,
        status=EscrowStatus.HELD.value,
        performance_bound=release_condition,
        readiness_before=readiness_before,
        stripe_payment_intent_id=stripe_payment_intent_id,
        held_at=datetime.now(timezone.utc)
    )
    
    db.add(escrow)
    await db.flush()
    
    return escrow


async def calculate_readiness_improvement(
    user_id: uuid.UUID,
    booking_id: uuid.UUID,
    db: AsyncSession
) -> float:
    """
    Calcula melhoria de prontidão após serviço.
    
    Compara readiness antes e depois da reserva.
    
    Args:
        user_id: UUID do usuário
        booking_id: UUID da reserva
        db: Sessão do banco de dados
    
    Returns:
        Melhoria em pontos (pode ser negativa)
    """
    # Buscar escrow para obter readiness_before
    result = await db.execute(
        select(EscrowTransaction).where(EscrowTransaction.booking_id == booking_id)
    )
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        raise ValueError("Escrow não encontrado para esta reserva")
    
    readiness_before = escrow.readiness_before or 0.0
    
    # Buscar readiness atual (após serviço)
    result = await db.execute(
        select(ReadinessAssessment)
        .where(ReadinessAssessment.user_id == user_id)
        .order_by(ReadinessAssessment.created_at.desc())
        .limit(1)
    )
    latest_assessment = result.scalar_one_or_none()
    
    readiness_after = latest_assessment.overall_readiness if latest_assessment else 0.0
    
    # Calcular melhoria
    improvement = readiness_after - readiness_before
    
    return improvement


async def resolve_escrow(
    escrow_id: uuid.UUID,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Resolve transação de escrow (libera ou reembolsa).
    
    Args:
        escrow_id: UUID da transação de escrow
        db: Sessão do banco de dados
    
    Returns:
        Dict com resultado da resolução
    
    Raises:
        ValueError: Se escrow não encontrado ou já resolvido
    """
    # Buscar escrow
    result = await db.execute(
        select(EscrowTransaction)
        .options(selectinload(EscrowTransaction.booking))
        .where(EscrowTransaction.id == escrow_id)
    )
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        raise ValueError("Escrow não encontrado")
    
    if escrow.status in [EscrowStatus.RELEASED.value, EscrowStatus.REFUNDED.value]:
        raise ValueError("Escrow já foi resolvido")
    
    # Calcular melhoria de prontidão
    improvement = await calculate_readiness_improvement(
        escrow.client_id,
        escrow.booking_id,
        db
    )
    
    # Obter condição de liberação
    release_condition = escrow.performance_bound
    min_improvement = release_condition.get('min_improvement', 10)
    
    # Atualizar escrow com métricas
    escrow.improvement_achieved = improvement
    
    # Buscar readiness atual
    result = await db.execute(
        select(ReadinessAssessment)
        .where(ReadinessAssessment.user_id == escrow.client_id)
        .order_by(ReadinessAssessment.created_at.desc())
        .limit(1)
    )
    latest_assessment = result.scalar_one_or_none()
    escrow.readiness_after = latest_assessment.overall_readiness if latest_assessment else 0.0
    
    # Decidir liberação ou reembolso
    if improvement >= min_improvement:
        # Condição atendida - liberar para provider
        escrow.status = EscrowStatus.RELEASED.value
        escrow.release_condition_met = True
        escrow.released_at = datetime.now(timezone.utc)
        escrow.resolution_notes = f"Melhoria de {improvement:.1f} pontos atingiu o mínimo de {min_improvement}"
        
        resolution = 'released_to_provider'
        message = f"Pagamento liberado ao prestador. Melhoria: {improvement:.1f} pontos"
    else:
        # Condição não atendida - reembolsar cliente
        escrow.status = EscrowStatus.REFUNDED.value
        escrow.release_condition_met = False
        escrow.refunded_at = datetime.now(timezone.utc)
        escrow.resolution_notes = f"Melhoria de {improvement:.1f} pontos não atingiu o mínimo de {min_improvement}"
        
        resolution = 'refunded_to_client'
        message = f"Pagamento reembolsado ao cliente. Melhoria: {improvement:.1f} pontos (mínimo: {min_improvement})"
    
    await db.flush()
    
    return {
        'escrow_id': str(escrow_id),
        'resolution': resolution,
        'status': escrow.status,
        'readiness_before': escrow.readiness_before,
        'readiness_after': escrow.readiness_after,
        'improvement_achieved': improvement,
        'min_improvement_required': min_improvement,
        'condition_met': escrow.release_condition_met,
        'message': message,
        'resolved_at': datetime.now(timezone.utc).isoformat()
    }


async def release_to_provider(
    escrow_id: uuid.UUID,
    provider_id: uuid.UUID,
    db: AsyncSession,
    stripe_transfer_id: Optional[str] = None
) -> bool:
    """
    Libera pagamento de escrow para o prestador.
    
    Args:
        escrow_id: UUID da transação de escrow
        provider_id: UUID do prestador (para validação)
        db: Sessão do banco de dados
        stripe_transfer_id: ID da transferência do Stripe (opcional)
    
    Returns:
        True se liberado com sucesso
    
    Raises:
        ValueError: Se escrow não encontrado ou provider incorreto
    """
    result = await db.execute(
        select(EscrowTransaction).where(EscrowTransaction.id == escrow_id)
    )
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        raise ValueError("Escrow não encontrado")
    
    if escrow.provider_id != provider_id:
        raise ValueError("Provider ID não corresponde ao escrow")
    
    # Atualizar status
    escrow.status = EscrowStatus.RELEASED.value
    escrow.released_at = datetime.now(timezone.utc)
    
    if stripe_transfer_id:
        escrow.stripe_transfer_id = stripe_transfer_id
    
    await db.flush()
    
    # Atualizar estatísticas do provider
    result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.id == provider_id)
    )
    provider = result.scalar_one_or_none()
    
    if provider:
        # Recalcular performance_success_rate
        result = await db.execute(
            select(func.count(EscrowTransaction.id))
            .where(
                EscrowTransaction.provider_id == provider_id,
                EscrowTransaction.status == EscrowStatus.RELEASED.value
            )
        )
        result.scalar() or 0
        
        result = await db.execute(
            select(func.count(EscrowTransaction.id))
            .where(EscrowTransaction.provider_id == provider_id)
        )
        total_count = result.scalar() or 0
        
        if total_count > 0:
            # Atualizar via raw SQL pois performance_success_rate foi adicionado via migration
            await db.execute(
                update(ProviderProfile)
                .where(ProviderProfile.id == provider_id)
                .values(updated_at=datetime.now(timezone.utc))
            )
        
        await db.flush()
    
    return True


async def refund_to_client(
    escrow_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession
) -> bool:
    """
    Reembolsa pagamento de escrow para o cliente.
    
    Args:
        escrow_id: UUID da transação de escrow
        user_id: UUID do cliente (para validação)
        db: Sessão do banco de dados
    
    Returns:
        True se reembolsado com sucesso
    
    Raises:
        ValueError: Se escrow não encontrado ou user incorreto
    """
    result = await db.execute(
        select(EscrowTransaction).where(EscrowTransaction.id == escrow_id)
    )
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        raise ValueError("Escrow não encontrado")
    
    if escrow.client_id != user_id:
        raise ValueError("User ID não corresponde ao escrow")
    
    # Atualizar status
    escrow.status = EscrowStatus.REFUNDED.value
    escrow.refunded_at = datetime.now(timezone.utc)
    
    await db.flush()
    
    return True


async def get_escrow_by_booking(
    booking_id: uuid.UUID,
    db: AsyncSession
) -> Optional[EscrowTransaction]:
    """
    Obtém escrow por ID da reserva.
    
    Args:
        booking_id: UUID da reserva
        db: Sessão do banco de dados
    
    Returns:
        EscrowTransaction ou None
    """
    result = await db.execute(
        select(EscrowTransaction).where(EscrowTransaction.booking_id == booking_id)
    )
    return result.scalar_one_or_none()


async def get_provider_performance_stats(
    provider_id: uuid.UUID,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Obtém estatísticas de performance do prestador.
    
    Args:
        provider_id: UUID do prestador
        db: Sessão do banco de dados
    
    Returns:
        Dict com estatísticas
    """
    # Total de escrows
    result = await db.execute(
        select(func.count(EscrowTransaction.id))
        .where(EscrowTransaction.provider_id == provider_id)
    )
    total_escrows = result.scalar() or 0
    
    # Escrows liberados
    result = await db.execute(
        select(func.count(EscrowTransaction.id))
        .where(
            EscrowTransaction.provider_id == provider_id,
            EscrowTransaction.status == EscrowStatus.RELEASED.value
        )
    )
    released_count = result.scalar() or 0
    
    # Escrows reembolsados
    result = await db.execute(
        select(func.count(EscrowTransaction.id))
        .where(
            EscrowTransaction.provider_id == provider_id,
            EscrowTransaction.status == EscrowStatus.REFUNDED.value
        )
    )
    refunded_count = result.scalar() or 0
    
    # Taxa de sucesso
    success_rate = (released_count / total_escrows) if total_escrows > 0 else 0.0
    
    # Melhoria média de prontidão
    result = await db.execute(
        select(func.avg(EscrowTransaction.improvement_achieved))
        .where(
            EscrowTransaction.provider_id == provider_id,
            EscrowTransaction.improvement_achieved.isnot(None)
        )
    )
    avg_improvement = result.scalar() or 0.0
    
    return {
        'provider_id': str(provider_id),
        'total_performance_bound_bookings': total_escrows,
        'escrows_released': released_count,
        'escrows_refunded': refunded_count,
        'performance_success_rate': float(success_rate),
        'average_readiness_improvement': float(avg_improvement)
    }


async def check_escrow_timeout(
    escrow_id: uuid.UUID,
    timeout_days: int,
    db: AsyncSession
) -> bool:
    """
    Verifica se escrow excedeu timeout e deve ser resolvido automaticamente.
    
    Args:
        escrow_id: UUID da transação de escrow
        timeout_days: Dias de timeout
        db: Sessão do banco de dados
    
    Returns:
        True se excedeu timeout
    """
    result = await db.execute(
        select(EscrowTransaction).where(EscrowTransaction.id == escrow_id)
    )
    escrow = result.scalar_one_or_none()
    
    if not escrow:
        return False
    
    if escrow.status != EscrowStatus.HELD.value:
        return False
    
    # Verificar se excedeu timeout
    timeout_date = escrow.held_at + timedelta(days=timeout_days)
    now = datetime.now(timezone.utc)
    
    return now > timeout_date


async def get_escrow_analytics(
    start_date: Optional[datetime],
    end_date: Optional[datetime],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Obtém analytics de escrow para admin dashboard.
    
    Args:
        start_date: Data inicial (opcional)
        end_date: Data final (opcional)
        db: Sessão do banco de dados
    
    Returns:
        Dict com métricas agregadas
    """
    query = select(EscrowTransaction)
    
    if start_date:
        query = query.where(EscrowTransaction.created_at >= start_date)
    
    if end_date:
        query = query.where(EscrowTransaction.created_at <= end_date)
    
    result = await db.execute(query)
    escrows = list(result.scalars().all())
    
    # Calcular métricas
    total_escrows = len(escrows)
    released = [e for e in escrows if e.status == EscrowStatus.RELEASED.value]
    refunded = [e for e in escrows if e.status == EscrowStatus.REFUNDED.value]
    
    release_rate = (len(released) / total_escrows) if total_escrows > 0 else 0
    refund_rate = (len(refunded) / total_escrows) if total_escrows > 0 else 0
    
    # Melhoria média
    improvements = [e.improvement_achieved for e in escrows if e.improvement_achieved is not None]
    avg_improvement = sum(improvements) / len(improvements) if improvements else 0
    
    # Valor total em escrow
    total_value = sum(e.amount for e in escrows)
    
    return {
        'total_escrows': total_escrows,
        'escrows_released': len(released),
        'escrows_refunded': len(refunded),
        'release_rate': float(release_rate),
        'refund_rate': float(refund_rate),
        'average_readiness_improvement': float(avg_improvement),
        'total_escrow_value': float(total_value),
        'period': {
            'start': start_date.isoformat() if start_date else None,
            'end': end_date.isoformat() if end_date else None
        }
    }
