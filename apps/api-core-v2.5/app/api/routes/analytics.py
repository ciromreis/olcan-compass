"""Analytics ingestion: product events, user attributes, experiment assignments.

To activate an A/B test, insert a row (PostgreSQL example)::

    INSERT INTO experiments (id, slug, name, status, variant_labels, split_a_percent)
    VALUES (
      gen_random_uuid(),
      'onboarding_v2',
      'Onboarding layout v2',
      'running',
      '["control","treatment"]'::jsonb,
      50
    );

Only ``status = 'running'`` experiments accept assignments via
``GET /analytics/experiments/{slug}/variant``.
"""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.analytics import (
    Experiment,
    ExperimentAssignment,
    ExperimentStatus,
    ProductEvent,
    UserAttribute,
)
from app.schemas.analytics import (
    ExperimentVariantResponse,
    ProductEventBatchRequest,
    ProductEventBatchResponse,
    UserAttributeListResponse,
    UserAttributeResponse,
    UserAttributeUpsertRequest,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _assign_variant(experiment: Experiment, user_id: UUID) -> str:
    labels = experiment.variant_labels or ["control", "treatment"]
    if not labels:
        return "control"
    if len(labels) == 1:
        return str(labels[0])
    split = max(0, min(100, int(experiment.split_a_percent)))
    h = int(
        hashlib.sha256(f"{experiment.id!s}:{user_id!s}".encode()).hexdigest(),
        16,
    )
    bucket = h % 100
    a = str(labels[0])
    b = str(labels[1])
    return a if bucket < split else b


@router.post("/events", response_model=ProductEventBatchResponse)
async def ingest_product_events(
    body: ProductEventBatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProductEventBatchResponse:
    """Batch-append behavioral events for the authenticated user (max 50 per request)."""
    uid = current_user.id
    rows: list[ProductEvent] = []
    now = datetime.now(timezone.utc)
    for item in body.events:
        occurred = item.occurred_at or now
        rows.append(
            ProductEvent(
                user_id=uid,
                event_name=item.event_name,
                occurred_at=occurred if occurred.tzinfo else occurred.replace(tzinfo=timezone.utc),
                properties=item.properties or {},
                session_id=item.session_id,
                client_source=item.client_source,
                app_release=item.app_release,
            )
        )
    db.add_all(rows)
    await db.commit()
    return ProductEventBatchResponse(inserted=len(rows))


@router.get("/me/attributes", response_model=UserAttributeListResponse)
async def list_user_attributes(
    namespace: str | None = Query(None, max_length=48, description="Filtrar por namespace (opcional)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserAttributeListResponse:
    """List analytics dimensions for the current user (optional `namespace` filter)."""
    stmt = select(UserAttribute).where(UserAttribute.user_id == current_user.id)
    if namespace is not None and namespace.strip():
        stmt = stmt.where(UserAttribute.namespace == namespace.strip())
    stmt = stmt.order_by(UserAttribute.namespace, UserAttribute.key)
    res = await db.execute(stmt)
    rows = res.scalars().all()
    items = [
        UserAttributeResponse(
            namespace=r.namespace,
            key=r.key,
            value=r.value_text,
            updated_at=r.updated_at,
        )
        for r in rows
    ]
    return UserAttributeListResponse(items=items)


@router.put("/me/attributes", response_model=UserAttributeResponse)
async def upsert_user_attribute(
    body: UserAttributeUpsertRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserAttributeResponse:
    """Upsert a single analytics dimension (namespace + key) for the current user."""
    uid = current_user.id
    stmt = select(UserAttribute).where(
        UserAttribute.user_id == uid,
        UserAttribute.namespace == body.namespace,
        UserAttribute.key == body.key,
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    ts = datetime.now(timezone.utc)
    if existing:
        existing.value_text = body.value
        existing.updated_at = ts
        await db.commit()
        await db.refresh(existing)
        return UserAttributeResponse(
            namespace=existing.namespace,
            key=existing.key,
            value=existing.value_text,
            updated_at=existing.updated_at,
        )

    row = UserAttribute(
        user_id=uid,
        namespace=body.namespace,
        key=body.key,
        value_text=body.value,
        updated_at=ts,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return UserAttributeResponse(
        namespace=row.namespace,
        key=row.key,
        value=row.value_text,
        updated_at=row.updated_at,
    )


@router.get("/experiments/{slug}/variant", response_model=ExperimentVariantResponse)
async def get_experiment_variant(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExperimentVariantResponse:
    """Return stable variant for this user; creates assignment if experiment is running."""
    res = await db.execute(select(Experiment).where(Experiment.slug == slug.strip()))
    experiment = res.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experimento não encontrado")
    if experiment.status != ExperimentStatus.RUNNING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experimento não está ativo",
        )

    uid = current_user.id
    r2 = await db.execute(
        select(ExperimentAssignment).where(
            ExperimentAssignment.experiment_id == experiment.id,
            ExperimentAssignment.user_id == uid,
        )
    )
    assignment = r2.scalar_one_or_none()
    if assignment:
        return ExperimentVariantResponse(
            experiment_slug=experiment.slug,
            variant=assignment.variant,
            experiment_id=experiment.id,
        )

    variant = _assign_variant(experiment, uid)
    row = ExperimentAssignment(
        experiment_id=experiment.id,
        user_id=uid,
        variant=variant,
    )
    db.add(row)
    try:
        await db.commit()
        await db.refresh(row)
    except IntegrityError:
        await db.rollback()
        r3 = await db.execute(
            select(ExperimentAssignment).where(
                ExperimentAssignment.experiment_id == experiment.id,
                ExperimentAssignment.user_id == uid,
            )
        )
        existing_row = r3.scalar_one()
        return ExperimentVariantResponse(
            experiment_slug=experiment.slug,
            variant=existing_row.variant,
            experiment_id=experiment.id,
        )

    return ExperimentVariantResponse(
        experiment_slug=experiment.slug,
        variant=row.variant,
        experiment_id=experiment.id,
    )
