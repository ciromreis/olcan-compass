"""Admin CRM bridge routes (Twenty/Mautic).

Staff control should live in Twenty, but Compass must:
- upsert core user identity into CRM
- store external CRM IDs for deep links
- ingest Twenty webhooks for bi-directional sync later
- capture leads from marketing site via Mautic webhook
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

import time

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user, require_admin
from app.core.config import get_settings
from app.db.session import get_db
from app.db.models import CrmIdentityLink, ProductEvent, User
from app.db.models.user import UserRole
from app.services.crm_bridge import twenty, mautic, verify_twenty_webhook, verify_mautic_webhook
from app.services.crm_lifecycle_sync import (
    sync_user_registration,
    sync_email_verification,
    sync_subscription_change,
    sync_booking_completion,
)
from app.services.crm_sync_orchestrator import sync_all_historical_users

router = APIRouter(prefix="/admin/crm", tags=["CRM"])



@router.post("/twenty/users/{user_id}/sync")
async def sync_user_to_twenty(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Upsert a Compass user into Twenty People and store the external id.

    This is intentionally manual/admin-triggered to avoid impacting prod.
    """
    if not twenty.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Twenty não configurado (TWENTY_BASE_URL/TWENTY_API_KEY)",
        )

    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Build a minimal People payload (Twenty accepts custom fields; keep stable basics only)
    full_name = (user.full_name or "").strip()
    first_name = full_name.split(" ")[0] if full_name else None
    last_name = " ".join(full_name.split(" ")[1:]) if full_name and len(full_name.split(" ")) > 1 else None

    person_payload: dict[str, Any] = {
        "email": user.email,
    }
    if first_name:
        person_payload["firstName"] = first_name
    if last_name:
        person_payload["lastName"] = last_name

    link_res = await db.execute(
        select(CrmIdentityLink).where(
            CrmIdentityLink.user_id == user.id,
            CrmIdentityLink.system == "twenty",
        )
    )
    existing_link = link_res.scalar_one_or_none()

    if existing_link:
        twenty_res = await twenty.update_person(existing_link.external_id, person_payload)
        existing_link.updated_at = datetime.now(timezone.utc)
        await db.commit()
        return {
            "status": "updated",
            "twenty_person_id": existing_link.external_id,
            "twenty_response": twenty_res,
        }

    twenty_res = await twenty.create_person(person_payload)
    # Twenty REST responses wrap the record under `data` per docs; tolerate direct record as well.
    record = twenty_res.get("data") if isinstance(twenty_res, dict) else None
    record_id = (record or twenty_res).get("id") if isinstance(twenty_res, dict) else None
    if not record_id:
        raise HTTPException(
            status_code=502,
            detail="Resposta inesperada do Twenty (id ausente)",
        )

    base_url = get_settings().twenty_base_url or ""
    external_url = f"{base_url}/object/person/{record_id}" if base_url else None

    link = CrmIdentityLink(
        user_id=user.id,
        system="twenty",
        external_id=str(record_id),
        external_url=external_url,
    )
    db.add(link)
    await db.commit()
    return {
        "status": "created",
        "twenty_person_id": str(record_id),
        "twenty_response": twenty_res,
    }


@router.post("/twenty/webhooks")
async def twenty_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Receive Twenty webhooks (optional bi-directional sync).

    Security: validate HMAC signature when TWENTY_WEBHOOK_SECRET is set.
    Stores webhook deliveries as `product_events` rows for auditing/DS.
    """
    settings = get_settings()
    raw = await request.body()
    payload = await request.json()

    secret = settings.twenty_webhook_secret
    if secret:
        sig = request.headers.get("x-twenty-webhook-signature")
        ts = request.headers.get("x-twenty-webhook-timestamp")
        if not verify_twenty_webhook(sig, ts, raw, secret):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Assinatura inválida")

    event_name = str(payload.get("event") or "twenty.webhook")
    occurred_at = payload.get("timestamp")
    try:
        occurred_dt = datetime.fromisoformat(occurred_at.replace("Z", "+00:00")) if isinstance(occurred_at, str) else None
    except Exception:
        occurred_dt = None

    db.add(
        ProductEvent(
            user_id=None,
            event_name="twenty_webhook",
            occurred_at=occurred_dt or datetime.now(timezone.utc),
            properties={
                "event": event_name,
                "data": payload.get("data"),
                "received_headers": {
                    "x-twenty-webhook-timestamp": request.headers.get("x-twenty-webhook-timestamp"),
                },
            },
            client_source="twenty",
            app_release=None,
            session_id=None,
        )
    )
    await db.commit()

    return {"ok": True}


@router.post("/mautic/webhooks")
async def mautic_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Receive Mautic webhooks (lead capture + attribution).
    
    This endpoint allows the marketing site to capture leads through Mautic
    and sync them into Compass + Twenty for unified CRM management.
    """
    settings = get_settings()
    raw = await request.body()
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    # Validate webhook signature if configured
    headers = dict(request.headers)
    if not verify_mautic_webhook(raw, headers):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    # Extract contact information from Mautic webhook payload
    contact = payload.get("contact", {})
    email = contact.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required in Mautic webhook payload",
        )

    event_name = str(payload.get("event") or "mautic.webhook")
    occurred_at = payload.get("timestamp")
    try:
        occurred_dt = datetime.fromisoformat(occurred_at.replace("Z", "+00:00")) if isinstance(occurred_at, str) else None
    except Exception:
        occurred_dt = None

    # Attempt to match Mautic contact → Compass user and write/refresh the identity link
    compass_user_res = await db.execute(select(User).where(User.email == email))
    compass_user = compass_user_res.scalar_one_or_none()

    mautic_contact_id = str(contact.get("id", "")) if contact.get("id") else None
    if compass_user and mautic_contact_id:
        existing_mautic_link_res = await db.execute(
            select(CrmIdentityLink).where(
                CrmIdentityLink.user_id == compass_user.id,
                CrmIdentityLink.system == "mautic",
            )
        )
        existing_mautic_link = existing_mautic_link_res.scalar_one_or_none()
        if not existing_mautic_link:
            base_url = get_settings().mautic_base_url or ""
            db.add(CrmIdentityLink(
                user_id=compass_user.id,
                system="mautic",
                external_id=mautic_contact_id,
                external_url=f"{base_url}/s/contacts/view/{mautic_contact_id}" if base_url else None,
            ))

    # Store webhook delivery for auditing
    db.add(
        ProductEvent(
            user_id=compass_user.id if compass_user else None,
            event_name="mautic_webhook",
            occurred_at=occurred_dt or datetime.now(timezone.utc),
            properties={
                "event": event_name,
                "contact": contact,
                "data": payload.get("data"),
                "matched_compass_user": str(compass_user.id) if compass_user else None,
                "received_headers": {
                    "content-type": request.headers.get("content-type"),
                },
            },
            client_source="mautic",
            app_release=None,
            session_id=None,
        )
    )
    await db.commit()

    return {"ok": True, "email": email, "matched_user": str(compass_user.id) if compass_user else None}


@router.post("/leads/sync")
async def sync_lead_from_marketing(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Sync a lead from marketing site into Mautic + Twenty + Compass.
    
    This is the main inbound flow:
    1. Create/update contact in Mautic (marketing automation)
    2. Create/update person in Twenty (CRM)
    3. Create/update user in Compass (if not exists)
    4. Link all identities via crm_identity_links
    
    This endpoint should be called from the marketing site backend
    to avoid CORS issues and keep API keys secure.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required",
        )

    first_name = payload.get("first_name", "")
    last_name = payload.get("last_name", "")
    tags = payload.get("tags", [])
    source = payload.get("source", "marketing_site")
    metadata = payload.get("metadata", {})

    results = {
        "email": email,
        "mautic": None,
        "twenty": None,
        "compass": None,
    }

    # Step 1: Sync to Mautic
    if mautic.is_configured():
        try:
            # Check if contact exists
            existing_contact = await mautic.get_contact_by_email(email)
            
            mautic_payload = {
                "email": email,
                "firstname": first_name,
                "lastname": last_name,
            }
            
            if existing_contact:
                contact_id = existing_contact.get("id")
                mautic_res = await mautic.update_contact(contact_id, mautic_payload)
                results["mautic"] = {"status": "updated", "contact_id": contact_id}
                
                # Add tags if provided
                if tags:
                    for tag in tags:
                        await mautic.add_tag_to_contact(contact_id, tag)
            else:
                mautic_payload["tags"] = tags if tags else []
                mautic_res = await mautic.create_contact(mautic_payload)
                contact_id = mautic_res.get("contact", {}).get("id")
                results["mautic"] = {"status": "created", "contact_id": contact_id}
        except Exception as e:
            results["mautic"] = {"status": "error", "error": str(e)}

    # Step 2: Check if Compass user exists (needed for both Twenty and Mautic link creation)
    res = await db.execute(select(User).where(User.email == email))
    lead_user = res.scalar_one_or_none()
    results["compass"] = (
        {"status": "exists", "user_id": str(lead_user.id)}
        if lead_user
        else {"status": "not_found", "note": "Will be linked when they register"}
    )

    # Step 3: Sync to Twenty
    if twenty.is_configured():
        try:
            person_payload: dict[str, Any] = {"email": email}
            if first_name:
                person_payload["firstName"] = first_name
            if last_name:
                person_payload["lastName"] = last_name

            # Lookup order: DB link (by user_id) → Twenty API (by email) → create
            twenty_link: CrmIdentityLink | None = None
            if lead_user:
                link_res = await db.execute(
                    select(CrmIdentityLink).where(
                        CrmIdentityLink.user_id == lead_user.id,
                        CrmIdentityLink.system == "twenty",
                    )
                )
                twenty_link = link_res.scalar_one_or_none()

            if twenty_link:
                await twenty.update_person(twenty_link.external_id, person_payload)
                results["twenty"] = {"status": "updated", "person_id": twenty_link.external_id}
            else:
                # Search Twenty directly to prevent duplicates when no DB link exists
                existing_person = await twenty.search_person_by_email(email)
                if existing_person:
                    person_id = str(existing_person.get("id", ""))
                    await twenty.update_person(person_id, person_payload)
                    results["twenty"] = {"status": "updated", "person_id": person_id}
                else:
                    twenty_res = await twenty.create_person(person_payload)
                    record = twenty_res.get("data") if isinstance(twenty_res, dict) else None
                    person_id = str((record or twenty_res).get("id", "")) if isinstance(twenty_res, dict) else ""
                    results["twenty"] = {"status": "created" if person_id else "error", "person_id": person_id or None}

                # Write DB link if we have a Compass user and a Twenty person id
                person_id = results["twenty"].get("person_id") or ""
                if lead_user and person_id and results["twenty"].get("status") in ("created", "updated"):
                    base_url = get_settings().twenty_base_url or ""
                    db.add(CrmIdentityLink(
                        user_id=lead_user.id,
                        system="twenty",
                        external_id=person_id,
                        external_url=f"{base_url}/object/person/{person_id}" if base_url else None,
                    ))
        except Exception as e:
            results["twenty"] = {"status": "error", "error": str(e)}

    # Store the lead sync event
    db.add(
        ProductEvent(
            user_id=user.id if user else None,
            event_name="lead_sync",
            occurred_at=datetime.now(timezone.utc),
            properties={
                "source": source,
                "tags": tags,
                "metadata": metadata,
                "results": results,
            },
            client_source="marketing",
            app_release=None,
            session_id=None,
        )
    )
    await db.commit()

    return results


# ============================================================
# Lifecycle Event Sync Endpoints (Admin/Manual Trigger)
# ============================================================


@router.post("/lifecycle/registration/{user_id}")
async def trigger_registration_sync(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Manually trigger registration sync for a user.
    
    Useful for testing or syncing historical users.
    """
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    result = await sync_user_registration(db, user, source="admin_manual_trigger")
    await db.commit()
    return result


@router.post("/lifecycle/email-verification/{user_id}")
async def trigger_email_verification_sync(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Manually trigger email verification sync for a user."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    result = await sync_email_verification(db, user)
    await db.commit()
    return result


@router.post("/lifecycle/subscription/{user_id}")
async def trigger_subscription_sync(
    user_id: UUID,
    subscription_tier: str,
    action: str = "upgraded",
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Manually trigger subscription change sync for a user."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    result = await sync_subscription_change(db, user, subscription_tier, action)
    await db.commit()
    return result


@router.post("/lifecycle/booking/{user_id}")
async def trigger_booking_sync(
    user_id: UUID,
    booking_id: str,
    service_name: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Manually trigger booking completion sync for a user."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    result = await sync_booking_completion(db, user, booking_id, service_name)
    await db.commit()
    return result


@router.get("/users/{user_id}/crm-links")
async def get_user_crm_links(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get all CRM identity links for a user (for admin UI deep links)."""
    res = await db.execute(
        select(CrmIdentityLink).where(CrmIdentityLink.user_id == user_id)
    )
    links = res.scalars().all()

    return {
        "user_id": str(user_id),
        "links": [
            {
                "system": link.system,
                "external_id": link.external_id,
                "external_url": link.external_url,
                "created_at": link.created_at.isoformat(),
                "updated_at": link.updated_at.isoformat(),
            }
            for link in links
        ],
    }


@router.post("/bulk-sync/historical-users")
async def trigger_historical_users_sync(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Bulk sync historical users to CRM systems.

    Migration utility to backfill CRM data for users who registered before CRM
    integration was enabled. Use with caution — creates contacts in Twenty/Mautic.
    """
    result = await sync_all_historical_users(db, limit, offset)
    await db.commit()
    return result


# ============================================================
# CEO / Admin observability endpoints
# ============================================================


@router.get("/health")
async def crm_health_check(
    _: User = Depends(require_admin),
) -> dict[str, Any]:
    """Live connectivity check for Twenty CRM and Mautic.

    Returns real latency and reachability — not just config presence.
    Frontend uses this to render accurate system status badges.
    """
    result: dict[str, Any] = {}

    # --- Twenty ---
    t = time.monotonic()
    if twenty.is_configured():
        try:
            async with twenty._client() as c:
                r = await c.get("/rest/people", params={"limit": "1"})
                r.raise_for_status()
            result["twenty"] = {
                "ok": True,
                "configured": True,
                "latency_ms": int((time.monotonic() - t) * 1000),
            }
        except Exception as exc:
            result["twenty"] = {
                "ok": False,
                "configured": True,
                "error": str(exc),
            }
    else:
        result["twenty"] = {"ok": False, "configured": False}

    # --- Mautic ---
    t = time.monotonic()
    if mautic.is_configured():
        try:
            async with mautic._client() as c:
                r = await c.get("/api/contacts", params={"limit": "1"})
                r.raise_for_status()
            result["mautic"] = {
                "ok": True,
                "configured": True,
                "latency_ms": int((time.monotonic() - t) * 1000),
            }
        except Exception as exc:
            result["mautic"] = {
                "ok": False,
                "configured": True,
                "error": str(exc),
            }
    else:
        result["mautic"] = {"ok": False, "configured": False}

    return result


@router.get("/users")
async def list_users_with_crm_status(
    search: str | None = Query(default=None, description="Filter by email or name (case-insensitive)"),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    synced_only: bool = Query(default=False, description="Show only users with at least one CRM link"),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Paginated user roster with CRM sync status for the CEO dashboard.

    Returns each user's subscription plan, verification state, last login,
    and their Twenty / Mautic link status so the CEO can identify un-synced
    users and trigger per-user syncs from the UI.
    """
    base_q = select(User).where(User.is_active == True)  # noqa: E712

    if search:
        like = f"%{search}%"
        base_q = base_q.where(
            or_(User.email.ilike(like), User.full_name.ilike(like))
        )

    if synced_only:
        # Subquery: users that have at least one crm_identity_links row
        has_link_sub = select(CrmIdentityLink.user_id).distinct().scalar_subquery()
        base_q = base_q.where(User.id.in_(has_link_sub))

    total_res = await db.execute(select(func.count()).select_from(base_q.subquery()))
    total: int = total_res.scalar_one()

    users_res = await db.execute(
        base_q.order_by(User.created_at.desc()).limit(limit).offset(offset)
    )
    users = users_res.scalars().all()

    # Batch-load all CRM links for the returned page (single query, no N+1)
    user_ids = [u.id for u in users]
    links_res = await db.execute(
        select(CrmIdentityLink).where(CrmIdentityLink.user_id.in_(user_ids))
    )
    links_by_user: dict[Any, list[CrmIdentityLink]] = {}
    for lnk in links_res.scalars().all():
        links_by_user.setdefault(lnk.user_id, []).append(lnk)

    def _link_dict(lnk: CrmIdentityLink | None) -> dict[str, Any]:
        if not lnk:
            return {"synced": False, "external_id": None, "external_url": None, "synced_at": None}
        return {
            "synced": True,
            "external_id": lnk.external_id,
            "external_url": lnk.external_url,
            "synced_at": lnk.updated_at.isoformat(),
        }

    rows = []
    for u in users:
        user_links = links_by_user.get(u.id, [])
        twenty_lnk = next((l for l in user_links if l.system == "twenty"), None)
        mautic_lnk = next((l for l in user_links if l.system == "mautic"), None)
        rows.append({
            "user_id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value if u.role else "user",
            "subscription_plan": u.subscription_plan,
            "is_premium": u.is_premium,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat(),
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            "crm": {
                "twenty": _link_dict(twenty_lnk),
                "mautic": _link_dict(mautic_lnk),
            },
        })

    return {"total": total, "limit": limit, "offset": offset, "users": rows}

