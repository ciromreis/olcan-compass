"""Celery tasks for CRM sync operations.

This module provides async task wrappers for CRM sync operations,
enabling reliable queue-based processing in production.

Tasks are designed to be:
- Retriable on failure
- Idempotent (safe to run multiple times)
- Logged for audit trails
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from app.db.session import AsyncSessionLocal
from app.services.crm_lifecycle_sync import (
    sync_user_registration,
    sync_email_verification,
    sync_subscription_change,
    sync_booking_completion,
)

logger = logging.getLogger(__name__)


# Note: Celery app import - adjust based on your Celery setup
# from app.core.celery_app import celery_app


# @celery_app.task(
#     bind=True,
#     max_retries=3,
#     default_retry_delay=60,  # 1 minute
#     acks_late=True,
# )
async def task_sync_user_registration(
    self,
    user_id_str: str,
    source: str = "compass_registration",
) -> dict[str, Any]:
    """Celery task: Sync user registration to CRM.
    
    This task should be called asynchronously after user registration.
    It handles its own database session and is safe to retry.
    """
    user_id = UUID(user_id_str)
    
    async with AsyncSessionLocal() as db:
        try:
            # Fetch user from database
            from sqlalchemy import select
            from app.db.models import User
            
            res = await db.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            
            if not user:
                logger.error(f"User {user_id} not found for CRM sync")
                return {"status": "error", "error": "User not found"}
            
            # Perform sync
            result = await sync_user_registration(db, user, source)
            await db.commit()
            
            logger.info(f"CRM sync completed for user registration: {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"CRM sync failed for user registration {user_id}: {e}")
            await db.rollback()
            
            # Retry logic (uncomment when using Celery)
            # if self.request.retries < self.max_retries:
            #     self.retry(exc=e, countdown=self.default_retry_delay * (2 ** self.request.retries))
            
            return {"status": "error", "error": str(e)}


# @celery_app.task(
#     bind=True,
#     max_retries=3,
#     default_retry_delay=60,
#     acks_late=True,
# )
async def task_sync_email_verification(
    self,
    user_id_str: str,
) -> dict[str, Any]:
    """Celery task: Sync email verification to CRM."""
    user_id = UUID(user_id_str)
    
    async with AsyncSessionLocal() as db:
        try:
            from sqlalchemy import select
            from app.db.models import User
            
            res = await db.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            
            if not user:
                logger.error(f"User {user_id} not found for email verification sync")
                return {"status": "error", "error": "User not found"}
            
            result = await sync_email_verification(db, user)
            await db.commit()
            
            logger.info(f"CRM sync completed for email verification: {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"CRM sync failed for email verification {user_id}: {e}")
            await db.rollback()
            return {"status": "error", "error": str(e)}


# @celery_app.task(
#     bind=True,
#     max_retries=3,
#     default_retry_delay=60,
#     acks_late=True,
# )
async def task_sync_subscription_change(
    self,
    user_id_str: str,
    subscription_tier: str,
    action: str = "upgraded",
) -> dict[str, Any]:
    """Celery task: Sync subscription change to CRM."""
    user_id = UUID(user_id_str)
    
    async with AsyncSessionLocal() as db:
        try:
            from sqlalchemy import select
            from app.db.models import User
            
            res = await db.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            
            if not user:
                logger.error(f"User {user_id} not found for subscription sync")
                return {"status": "error", "error": "User not found"}
            
            result = await sync_subscription_change(db, user, subscription_tier, action)
            await db.commit()
            
            logger.info(f"CRM sync completed for subscription change: {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"CRM sync failed for subscription change {user_id}: {e}")
            await db.rollback()
            return {"status": "error", "error": str(e)}


# @celery_app.task(
#     bind=True,
#     max_retries=3,
#     default_retry_delay=60,
#     acks_late=True,
# )
async def task_sync_booking_completion(
    self,
    user_id_str: str,
    booking_id: str,
    service_name: str,
) -> dict[str, Any]:
    """Celery task: Sync booking completion to CRM."""
    user_id = UUID(user_id_str)
    
    async with AsyncSessionLocal() as db:
        try:
            from sqlalchemy import select
            from app.db.models import User
            
            res = await db.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            
            if not user:
                logger.error(f"User {user_id} not found for booking sync")
                return {"status": "error", "error": "User not found"}
            
            result = await sync_booking_completion(db, user, booking_id, service_name)
            await db.commit()
            
            logger.info(f"CRM sync completed for booking: {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"CRM sync failed for booking {user_id}: {e}")
            await db.rollback()
            return {"status": "error", "error": str(e)}


# ============================================================
# Helper to dispatch tasks based on feature flag
# ============================================================


async def dispatch_crm_sync_task(
    event_type: str,
    user_id: UUID,
    **kwargs: Any,
) -> dict[str, Any] | None:
    """Dispatch CRM sync task if queue-based sync is enabled.
    
    This helper checks the feature flag and either:
    - Dispatches to Celery queue (if enabled)
    - Returns None (caller should do sync inline or skip)
    
    Args:
        event_type: One of 'registration', 'email_verification', 'subscription', 'booking'
        user_id: User UUID
        **kwargs: Additional event-specific parameters
    
    Returns:
        Task result dict if dispatched, None if queue not enabled
    """
    from app.core.config import get_settings
    
    settings = get_settings()
    
    if not settings.feature_crm_sync_queue_enabled:
        return None
    
    # Map event types to task functions
    task_map = {
        "registration": task_sync_user_registration,
        "email_verification": task_sync_email_verification,
        "subscription": task_sync_subscription_change,
        "booking": task_sync_booking_completion,
    }
    
    task_func = task_map.get(event_type)
    if not task_func:
        logger.error(f"Unknown CRM sync event type: {event_type}")
        return None
    
    # Dispatch task (uncomment .delay() when using Celery)
    # For now, we'll call it directly as a placeholder
    try:
        # result = task_func.delay(str(user_id), **kwargs)  # Celery async dispatch
        result = await task_func(None, str(user_id), **kwargs)  # Direct call for now
        logger.info(f"CRM sync task dispatched for {event_type}: {user_id}")
        return result
    except Exception as e:
        logger.error(f"Failed to dispatch CRM sync task for {event_type}: {e}")
        return {"status": "error", "error": str(e)}
