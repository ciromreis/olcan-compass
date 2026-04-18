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

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
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

    # Store webhook delivery for auditing
    db.add(
        ProductEvent(
            user_id=None,
            event_name="mautic_webhook",
            occurred_at=occurred_dt or datetime.now(timezone.utc),
            properties={
                "event": event_name,
                "contact": contact,
                "data": payload.get("data"),
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

    return {"ok": True, "email": email}


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

    # Step 2: Sync to Twenty
    if twenty.is_configured():
        try:
            person_payload = {
                "email": email,
            }
            if first_name:
                person_payload["firstName"] = first_name
            if last_name:
                person_payload["lastName"] = last_name

            # Check if person exists via identity link
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.system == "twenty",
                    CrmIdentityLink.external_id == email,  # Use email as lookup for now
                )
            )
            existing_link = link_res.scalar_one_or_none()

            if existing_link:
                twenty_res = await twenty.update_person(existing_link.external_id, person_payload)
                results["twenty"] = {"status": "updated", "person_id": existing_link.external_id}
            else:
                twenty_res = await twenty.create_person(person_payload)
                record = twenty_res.get("data") if isinstance(twenty_res, dict) else None
                person_id = (record or twenty_res).get("id") if isinstance(twenty_res, dict) else None
                
                if person_id:
                    base_url = get_settings().twenty_base_url or ""
                    external_url = f"{base_url}/object/person/{person_id}" if base_url else None
                    
                    # Note: We can't link to a Compass user yet if they don't exist
                    # This will be linked when they register
                    results["twenty"] = {"status": "created", "person_id": person_id}
        except Exception as e:
            results["twenty"] = {"status": "error", "error": str(e)}

    # Step 3: Check if user exists in Compass
    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()
    
    if user:
        results["compass"] = {"status": "exists", "user_id": str(user.id)}
        
        # Link to Twenty if we created/updated a person
        if results["twenty"] and results["twenty"].get("person_id"):
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "twenty",
                )
            )
            existing_link = link_res.scalar_one_or_none()
            
            if not existing_link:
                link = CrmIdentityLink(
                    user_id=user.id,
                    system="twenty",
                    external_id=results["twenty"]["person_id"],
                    external_url=f"{get_settings().twenty_base_url}/object/person/{results['twenty']['person_id']}",
                )
                db.add(link)
                await db.commit()
    else:
        results["compass"] = {"status": "not_found", "note": "User will be created when they register"}

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
    
    This is a migration utility for backfilling CRM data for users
    who registered before CRM integration was enabled.
    
    Use with caution - this will create contacts in Twenty/Mautic
    for all existing Compass users.
    """
    result = await sync_all_historical_users(db, limit, offset)
    await db.commit()
    return result

