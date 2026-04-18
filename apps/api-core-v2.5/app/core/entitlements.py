"""Server-side entitlement enforcement.

This module provides dependencies and utilities for enforcing subscription-based
access control on the API level, preventing client-side bypass.

Usage:
    from app.core.entitlements import require_plan, require_feature, check_document_limit

    @router.post("/forge/polish")
    async def polish_document(
        user: User = Depends(get_current_user),
        _: None = Depends(require_plan(UserPlan.PRO)),
        db: AsyncSession = Depends(get_db)
    ):
        ...
"""

from __future__ import annotations

from enum import Enum

from fastapi import Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User
from app.core.auth import get_current_user
from app.db.session import get_db


class UserPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"


# ============================================================
# Entitlement Configuration (single source of truth)
# ============================================================

FORGE_DOCUMENT_LIMITS = {
    UserPlan.FREE: 3,
    UserPlan.PRO: -1,   # Unlimited (matches frontend entitlements.ts)
    UserPlan.PREMIUM: -1,
}

ROUTE_LIMITS = {
    UserPlan.FREE: 1,
    UserPlan.PRO: 3,
    UserPlan.PREMIUM: -1,
}

PAID_FEATURES = {
    "forge_version_compare": [UserPlan.PRO, UserPlan.PREMIUM],
    "interview_simulator": [UserPlan.PRO, UserPlan.PREMIUM],
    "marketplace_booking": [UserPlan.PRO, UserPlan.PREMIUM],
    "analytics_advanced": [UserPlan.PREMIUM],
    "coach_ai": [UserPlan.PREMIUM],
    "unlimited_routes": [UserPlan.PREMIUM],
}

_PLAN_HIERARCHY = [UserPlan.FREE, UserPlan.PRO, UserPlan.PREMIUM]


# ============================================================
# Pure functions (no FastAPI dependencies)
# ============================================================

def is_paid_plan(plan: UserPlan) -> bool:
    return plan in (UserPlan.PRO, UserPlan.PREMIUM)


def has_feature_access(plan: UserPlan, feature: str) -> bool:
    return plan in PAID_FEATURES.get(feature, [])


def can_use_feature(plan: UserPlan, feature: str) -> bool:
    return has_feature_access(plan, feature)


def get_max_documents(plan: str | UserPlan) -> int:
    """Get maximum Forge documents for plan. Returns -1 for unlimited."""
    key = UserPlan(plan) if isinstance(plan, str) else plan
    return FORGE_DOCUMENT_LIMITS.get(key, 3)


def get_max_routes(plan: str | UserPlan) -> int:
    """Get maximum routes for plan. Returns -1 for unlimited."""
    key = UserPlan(plan) if isinstance(plan, str) else plan
    return ROUTE_LIMITS.get(key, 1)


def assert_can_create_route(plan: str, current_count: int) -> None:
    """Raise 402 if the plan's route limit is reached."""
    limit = get_max_routes(plan)
    if limit != -1 and current_count >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Route limit reached for {plan} plan. Upgrade to create more routes.",
        )


def assert_can_create_forge_document(plan: str, current_count: int) -> None:
    """Raise 402 if the plan's document limit is reached."""
    limit = get_max_documents(plan)
    if limit != -1 and current_count >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Document limit reached for {plan} plan. Upgrade to create more documents.",
        )


# ============================================================
# FastAPI Dependencies for Enforcement
# ============================================================

def require_plan(minimum_plan: UserPlan):
    """Dependency factory: enforce minimum plan requirement."""
    def _check_plan(user: User = Depends(get_current_user)) -> User:
        user_plan = UserPlan(user.plan)

        user_level = _PLAN_HIERARCHY.index(user_plan)
        required_level = _PLAN_HIERARCHY.index(minimum_plan)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Upgrade to {minimum_plan.value} plan required",
                headers={
                    "X-Upgrade-Required": minimum_plan.value,
                    "X-Current-Plan": user_plan.value,
                },
            )
        return user

    return _check_plan


def require_feature(feature: str):
    """Dependency factory: require specific feature access."""
    def _check_feature(user: User = Depends(get_current_user)) -> User:
        user_plan = UserPlan(user.plan)

        if not can_use_feature(user_plan, feature):
            required_plans = PAID_FEATURES.get(feature, [])
            min_plan = required_plans[0].value if required_plans else "pro"
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Feature '{feature}' requires {min_plan} plan or above",
                headers={
                    "X-Feature-Required": feature,
                    "X-Current-Plan": user_plan.value,
                },
            )
        return user

    return _check_feature


async def check_document_limit(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency: raise 402 if user has reached their document creation limit."""
    user_plan = UserPlan(user.plan)
    max_docs = get_max_documents(user_plan)

    if max_docs == -1:
        return user

    from app.db.models import Narrative
    result = await db.execute(
        select(func.count(Narrative.id)).where(Narrative.user_id == user.id)
    )
    current_count = result.scalar() or 0
    if current_count >= max_docs:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Document limit reached for {user_plan.value} plan. Upgrade to create more documents.",
            headers={"X-Current-Plan": user_plan.value},
        )
    return user


async def check_route_limit(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency: raise 402 if user has reached their route creation limit."""
    user_plan = UserPlan(user.plan)
    max_routes = get_max_routes(user_plan)

    if max_routes == -1:
        return user

    from app.db.models import Route
    result = await db.execute(
        select(func.count(Route.id)).where(Route.user_id == user.id)
    )
    current_count = result.scalar() or 0
    if current_count >= max_routes:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Route limit reached for {user_plan.value} plan. Upgrade to create more routes.",
            headers={"X-Current-Plan": user_plan.value},
        )
    return user


# ============================================================
# Entitlement Context for Responses
# ============================================================

def get_entitlement_context(user: User) -> dict:
    """Get user's entitlement context for API responses."""
    user_plan = UserPlan(user.plan)

    return {
        "plan": user_plan.value,
        "is_paid": is_paid_plan(user_plan),
        "limits": {
            "forge_documents": get_max_documents(user_plan),
            "routes": get_max_routes(user_plan),
        },
        "features": {
            feature: can_use_feature(user_plan, feature)
            for feature in PAID_FEATURES
        },
    }
