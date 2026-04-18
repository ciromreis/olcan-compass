"""CRM sync orchestrator with feature flag control.

This module provides the integration points where lifecycle events
trigger CRM sync. All sync operations respect feature flags to ensure
safe rollout and zero impact on the live v2 app.

Usage:
    from app.services.crm_sync_orchestrator import on_user_registered
    
    # In your registration endpoint:
    await on_user_registered(db, user)
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models import User
from app.services.crm_bridge import twenty, mautic
from app.services.crm_lifecycle_sync import (
    sync_user_registration,
    sync_email_verification,
    sync_subscription_change,
    sync_booking_completion,
)

logger = logging.getLogger(__name__)


async def on_user_registered(
    db: AsyncSession,
    user: User,
    source: str = "compass_registration",
    force_sync: bool = False,
) -> dict[str, Any] | None:
    """Hook called after user registration.
    
    Args:
        db: Database session
        user: The newly registered user
        source: Registration source identifier
        force_sync: Bypass feature flag (for admin manual triggers)
    
    Returns:
        Sync result dict if sync was performed, None otherwise
    """
    settings = get_settings()
    
    if not force_sync and not settings.feature_crm_sync_registration_enabled:
        logger.debug("CRM sync on registration is disabled by feature flag")
        return None
    
    try:
        result = await sync_user_registration(db, user, source)
        await db.commit()
        logger.info(f"CRM sync completed for user registration: {user.id}")
        return result
    except Exception as e:
        logger.error(f"CRM sync failed for user registration {user.id}: {e}")
        await db.rollback()
        # Don't raise - registration should succeed even if CRM sync fails
        return {"status": "error", "error": str(e)}


async def on_email_verified(
    db: AsyncSession,
    user: User,
    force_sync: bool = False,
) -> dict[str, Any] | None:
    """Hook called after email verification.
    
    Args:
        db: Database session
        user: The user who verified their email
        force_sync: Bypass feature flag
    
    Returns:
        Sync result dict if sync was performed, None otherwise
    """
    settings = get_settings()
    
    if not force_sync and not settings.feature_crm_sync_email_verification_enabled:
        logger.debug("CRM sync on email verification is disabled by feature flag")
        return None
    
    try:
        result = await sync_email_verification(db, user)
        await db.commit()
        logger.info(f"CRM sync completed for email verification: {user.id}")
        return result
    except Exception as e:
        logger.error(f"CRM sync failed for email verification {user.id}: {e}")
        await db.rollback()
        return {"status": "error", "error": str(e)}


async def on_subscription_changed(
    db: AsyncSession,
    user: User,
    subscription_tier: str,
    action: str = "upgraded",
    force_sync: bool = False,
) -> dict[str, Any] | None:
    """Hook called after subscription change.
    
    Args:
        db: Database session
        user: The user whose subscription changed
        subscription_tier: New subscription tier
        action: Type of change (upgraded, downgraded, cancelled)
        force_sync: Bypass feature flag
    
    Returns:
        Sync result dict if sync was performed, None otherwise
    """
    settings = get_settings()
    
    if not force_sync and not settings.feature_crm_sync_subscription_enabled:
        logger.debug("CRM sync on subscription change is disabled by feature flag")
        return None
    
    try:
        result = await sync_subscription_change(db, user, subscription_tier, action)
        await db.commit()
        logger.info(f"CRM sync completed for subscription change: {user.id}")
        return result
    except Exception as e:
        logger.error(f"CRM sync failed for subscription change {user.id}: {e}")
        await db.rollback()
        return {"status": "error", "error": str(e)}


async def on_booking_completed(
    db: AsyncSession,
    user: User,
    booking_id: str,
    service_name: str,
    force_sync: bool = False,
) -> dict[str, Any] | None:
    """Hook called after booking completion.
    
    Args:
        db: Database session
        user: The user who completed the booking
        booking_id: Booking identifier
        service_name: Name of the booked service
        force_sync: Bypass feature flag
    
    Returns:
        Sync result dict if sync was performed, None otherwise
    """
    settings = get_settings()
    
    if not force_sync and not settings.feature_crm_sync_booking_enabled:
        logger.debug("CRM sync on booking completion is disabled by feature flag")
        return None
    
    try:
        result = await sync_booking_completion(db, user, booking_id, service_name)
        await db.commit()
        logger.info(f"CRM sync completed for booking completion: {user.id}")
        return result
    except Exception as e:
        logger.error(f"CRM sync failed for booking completion {user.id}: {e}")
        await db.rollback()
        return {"status": "error", "error": str(e)}


# ============================================================
# Bulk/Historical Sync Utilities
# ============================================================


async def sync_all_historical_users(
    db: AsyncSession,
    limit: int = 100,
    offset: int = 0,
) -> dict[str, Any]:
    """Sync all existing users to CRM (for migration).
    
    This is an admin utility for backfilling CRM data for users
    who registered before CRM integration was enabled.
    
    Args:
        db: Database session
        limit: Number of users to sync in this batch
        offset: Offset for pagination
    
    Returns:
        Summary of sync results
    """
    settings = get_settings()
    if not twenty.is_configured() and not mautic.is_configured():
        return {"status": "error", "error": "No CRM systems configured"}
    
    res = await db.execute(
        select(User).order_by(User.created_at).limit(limit).offset(offset)
    )
    users = res.scalars().all()
    
    results = {
        "total_processed": len(users),
        "successful": 0,
        "failed": 0,
        "details": [],
    }
    
    for user in users:
        try:
            sync_result = await sync_user_registration(db, user, source="historical_backfill")
            await db.commit()
            results["successful"] += 1
            results["details"].append({
                "user_id": str(user.id),
                "email": user.email,
                "status": "success",
            })
        except Exception as e:
            results["failed"] += 1
            results["details"].append({
                "user_id": str(user.id),
                "email": user.email,
                "status": "error",
                "error": str(e),
            })
            await db.rollback()
    
    logger.info(f"Historical user sync: {results['successful']} succeeded, {results['failed']} failed")
    return results
