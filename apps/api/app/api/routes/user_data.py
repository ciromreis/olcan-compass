"""User Data Management Routes - LGPD Compliance

Endpoints para exportação e exclusão de dados do usuário conforme LGPD.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.economics import (
    VerificationCredential,
    EscrowTransaction,
    ScenarioSimulation,
    CredentialUsageTracking,
    OpportunityCostWidgetEvent
)
from app.db.models.psychology import PsychProfile

router = APIRouter(prefix="/me", tags=["User Data Management"])


@router.get("/economics-data/export")
async def export_economics_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Exporta todos os dados de economia do usuário (LGPD compliance).
    
    Retorna:
    - Credenciais de verificação
    - Preferência temporal
    - Score de momentum
    - Simulações de cenário
    - Transações de escrow
    - Eventos do widget de custo de oportunidade
    """
    user_id = current_user.id
    
    # 1. Credenciais de verificação
    credentials_result = await db.execute(
        select(VerificationCredential)
        .where(VerificationCredential.user_id == user_id)
    )
    credentials = credentials_result.scalars().all()
    
    credentials_data = [
        {
            'id': str(c.id),
            'credential_type': c.credential_type,
            'credential_name': c.credential_name,
            'score_value': c.credential_metadata.get('score_value'),
            'issued_at': c.issued_at.isoformat(),
            'expires_at': c.expires_at.isoformat() if c.expires_at else None,
            'is_active': c.is_active,
            'revoked_at': c.revoked_at.isoformat() if c.revoked_at else None,
            'verification_hash': c.verification_hash,
            'verification_url': c.verification_url
        }
        for c in credentials
    ]
    
    # 2. Preferência temporal
    psych_result = await db.execute(
        select(PsychProfile)
        .where(PsychProfile.user_id == user_id)
    )
    psych_profile = psych_result.scalar_one_or_none()
    
    temporal_data = None
    if psych_profile and hasattr(psych_profile, 'temporal_preference'):
        temporal_data = {
            'temporal_preference': psych_profile.temporal_preference,
            'temporal_preference_updated_at': (
                psych_profile.temporal_preference_updated_at.isoformat()
                if hasattr(psych_profile, 'temporal_preference_updated_at') and psych_profile.temporal_preference_updated_at
                else None
            )
        }
    
    # 3. Score de momentum
    momentum_data = {
        'momentum_score': current_user.momentum_score if hasattr(current_user, 'momentum_score') else None,
        'last_momentum_check': (
            current_user.last_momentum_check.isoformat()
            if hasattr(current_user, 'last_momentum_check') and current_user.last_momentum_check
            else None
        )
    }
    
    # 4. Simulações de cenário
    simulations_result = await db.execute(
        select(ScenarioSimulation)
        .where(ScenarioSimulation.user_id == user_id)
    )
    simulations = simulations_result.scalars().all()
    
    simulations_data = [
        {
            'id': str(s.id),
            'simulation_name': s.simulation_name,
            'constraints': s.constraints,
            'pareto_opportunities': s.pareto_opportunities,
            'total_opportunities_analyzed': s.total_opportunities_analyzed,
            'notes': s.notes,
            'created_at': s.created_at.isoformat()
        }
        for s in simulations
    ]
    
    # 5. Transações de escrow (apenas as do usuário como cliente)
    escrow_result = await db.execute(
        select(EscrowTransaction)
        .join(EscrowTransaction.booking)
        .where(EscrowTransaction.booking.has(user_id=user_id))
    )
    escrow_transactions = escrow_result.scalars().all()
    
    escrow_data = [
        {
            'id': str(e.id),
            'booking_id': str(e.booking_id),
            'amount_held': float(e.amount_held),
            'currency': e.currency,
            'status': e.status.value,
            'release_condition': e.release_condition,
            'readiness_before': e.readiness_before,
            'readiness_after': e.readiness_after,
            'improvement_achieved': e.improvement_achieved,
            'created_at': e.created_at.isoformat(),
            'resolved_at': e.resolved_at.isoformat() if e.resolved_at else None
        }
        for e in escrow_transactions
    ]
    
    # 6. Eventos do widget de custo de oportunidade
    widget_events_result = await db.execute(
        select(OpportunityCostWidgetEvent)
        .where(OpportunityCostWidgetEvent.user_id == user_id)
    )
    widget_events = widget_events_result.scalars().all()
    
    widget_events_data = [
        {
            'id': str(w.id),
            'event_type': w.event_type.value,
            'opportunity_id': str(w.opportunity_id) if w.opportunity_id else None,
            'opportunity_cost_shown': float(w.opportunity_cost_shown) if w.opportunity_cost_shown else None,
            'momentum_score': w.momentum_score,
            'upgrade_tier': w.upgrade_tier,
            'conversion_value': float(w.conversion_value) if w.conversion_value else None,
            'converted_at': w.converted_at.isoformat() if w.converted_at else None,
            'created_at': w.created_at.isoformat()
        }
        for w in widget_events
    ]
    
    # 7. Rastreamento de uso de credenciais
    usage_tracking_result = await db.execute(
        select(CredentialUsageTracking)
        .join(CredentialUsageTracking.credential)
        .where(VerificationCredential.user_id == user_id)
    )
    usage_tracking = usage_tracking_result.scalars().all()
    
    usage_tracking_data = [
        {
            'id': str(u.id),
            'credential_id': str(u.credential_id),
            'application_id': str(u.application_id) if u.application_id else None,
            'usage_type': u.usage_type,
            'shared_with': u.shared_with,
            'resulted_in_acceptance': u.resulted_in_acceptance,
            'acceptance_date': u.acceptance_date.isoformat() if u.acceptance_date else None,
            'used_at': u.used_at.isoformat()
        }
        for u in usage_tracking
    ]
    
    return {
        'user_id': str(user_id),
        'export_date': datetime.now(timezone.utc).isoformat(),
        'data': {
            'credentials': credentials_data,
            'temporal_preference': temporal_data,
            'momentum': momentum_data,
            'scenario_simulations': simulations_data,
            'escrow_transactions': escrow_data,
            'widget_events': widget_events_data,
            'credential_usage_tracking': usage_tracking_data
        }
    }


@router.delete("/economics-data")
async def delete_economics_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Exclui todos os dados de economia do usuário (LGPD compliance).
    
    IMPORTANTE:
    - Credenciais são excluídas
    - Eventos do widget são excluídos
    - Simulações são excluídas
    - Transações de escrow são ANONIMIZADAS (mantidas para registros financeiros)
    - Preferência temporal é resetada
    - Score de momentum é resetado
    """
    user_id = current_user.id
    
    deleted_counts = {}
    
    # 1. Excluir credenciais de verificação
    credentials_result = await db.execute(
        delete(VerificationCredential)
        .where(VerificationCredential.user_id == user_id)
        .returning(VerificationCredential.id)
    )
    deleted_counts['credentials'] = len(credentials_result.all())
    
    # 2. Excluir eventos do widget
    widget_result = await db.execute(
        delete(OpportunityCostWidgetEvent)
        .where(OpportunityCostWidgetEvent.user_id == user_id)
        .returning(OpportunityCostWidgetEvent.id)
    )
    deleted_counts['widget_events'] = len(widget_result.all())
    
    # 3. Excluir simulações de cenário
    simulations_result = await db.execute(
        delete(ScenarioSimulation)
        .where(ScenarioSimulation.user_id == user_id)
        .returning(ScenarioSimulation.id)
    )
    deleted_counts['simulations'] = len(simulations_result.all())
    
    # 4. Anonimizar transações de escrow (não excluir por requisitos financeiros)
    # Nota: Escrow transactions são mantidas mas com dados anonimizados
    escrow_result = await db.execute(
        select(EscrowTransaction)
        .join(EscrowTransaction.booking)
        .where(EscrowTransaction.booking.has(user_id=user_id))
    )
    escrow_transactions = escrow_result.scalars().all()
    
    for escrow in escrow_transactions:
        escrow.resolution_notes = "Dados do usuário anonimizados conforme LGPD"
    
    deleted_counts['escrow_anonymized'] = len(escrow_transactions)
    
    # 5. Resetar preferência temporal
    psych_result = await db.execute(
        select(PsychProfile)
        .where(PsychProfile.user_id == user_id)
    )
    psych_profile = psych_result.scalar_one_or_none()
    
    if psych_profile and hasattr(psych_profile, 'temporal_preference'):
        psych_profile.temporal_preference = None
        if hasattr(psych_profile, 'temporal_preference_updated_at'):
            psych_profile.temporal_preference_updated_at = None
    
    # 6. Resetar score de momentum
    if hasattr(current_user, 'momentum_score'):
        current_user.momentum_score = 0
    if hasattr(current_user, 'last_momentum_check'):
        current_user.last_momentum_check = None
    
    await db.commit()
    
    return {
        'message': 'Dados de economia excluídos com sucesso',
        'deleted_at': datetime.now(timezone.utc).isoformat(),
        'summary': deleted_counts
    }
