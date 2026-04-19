"""Lifecycle event sync for CRM integration.

This module provides hooks for syncing key lifecycle events from Compass
into Twenty (CRM) and Mautic (marketing automation).

Events synced:
- User registration
- Email verification
- Subscription upgrade/change
- Booking completion
- Marketplace vendor/provider activation

All sync operations are feature-flagged and can be queued for production reliability.
"""

from __future__ import annotations

import logging
from typing import Any
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models import CrmIdentityLink, ProductEvent, User
from app.services.crm_bridge import twenty, mautic

logger = logging.getLogger(__name__)


async def sync_user_registration(
    db: AsyncSession,
    user: User,
    source: str = "compass_registration",
) -> dict[str, Any]:
    """Sync a newly registered user into Twenty + Mautic.
    
    This should be called after successful user registration.
    Creates contacts in both systems and stores identity links.
    """
    settings = get_settings()
    results = {"user_id": str(user.id), "email": user.email, "twenty": None, "mautic": None}

    # Build common payload
    full_name = (user.full_name or "").strip()
    first_name = full_name.split(" ")[0] if full_name else None
    last_name = " ".join(full_name.split(" ")[1:]) if full_name and len(full_name.split(" ")) > 1 else None

    # Sync to Twenty
    if twenty.is_configured():
        try:
            # Check for existing identity link first (idempotent)
            existing_link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "twenty",
                )
            )
            existing_link = existing_link_res.scalar_one_or_none()

            person_payload: dict[str, Any] = {"email": user.email}
            if first_name:
                person_payload["firstName"] = first_name
            if last_name:
                person_payload["lastName"] = last_name

            if existing_link:
                # Update existing record
                await twenty.update_person(existing_link.external_id, person_payload)
                results["twenty"] = {"status": "updated", "person_id": existing_link.external_id}
            else:
                # Search by email to avoid duplicates (e.g. historical backfill)
                existing_person = await twenty.search_person_by_email(user.email)
                if existing_person:
                    person_id = str(existing_person.get("id", ""))
                    if person_id:
                        await twenty.update_person(person_id, person_payload)
                        base_url = settings.twenty_base_url or ""
                        external_url = f"{base_url}/object/person/{person_id}" if base_url else None
                        link = CrmIdentityLink(
                            user_id=user.id,
                            system="twenty",
                            external_id=person_id,
                            external_url=external_url,
                        )
                        db.add(link)
                        results["twenty"] = {"status": "linked_existing", "person_id": person_id}
                else:
                    twenty_res = await twenty.create_person(person_payload)
                    record = twenty_res.get("data") if isinstance(twenty_res, dict) else None
                    person_id_raw = (record or twenty_res).get("id") if isinstance(twenty_res, dict) else None
                    person_id = str(person_id_raw) if person_id_raw else None
                    if person_id:
                        base_url = settings.twenty_base_url or ""
                        external_url = f"{base_url}/object/person/{person_id}" if base_url else None
                        link = CrmIdentityLink(
                            user_id=user.id,
                            system="twenty",
                            external_id=person_id,
                            external_url=external_url,
                        )
                        db.add(link)
                        results["twenty"] = {"status": "created", "person_id": person_id}
                        logger.info(f"Created Twenty person for user {user.id}: {person_id}")
        except Exception as e:
            results["twenty"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to sync user {user.id} to Twenty: {e}")

    # Sync to Mautic
    if mautic.is_configured():
        try:
            # Check for existing identity link (idempotent)
            existing_link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "mautic",
                )
            )
            existing_link = existing_link_res.scalar_one_or_none()

            mautic_payload = {
                "email": user.email,
                "firstname": first_name,
                "lastname": last_name,
                "tags": ["compass_user", "registered"],
            }

            if existing_link:
                await mautic.update_contact(int(existing_link.external_id), mautic_payload)
                results["mautic"] = {"status": "updated", "contact_id": existing_link.external_id}
            else:
                # Search by email before creating
                existing_contact = await mautic.get_contact_by_email(user.email)
                if existing_contact:
                    contact_id = str(existing_contact.get("id", ""))
                    if contact_id:
                        await mautic.update_contact(int(contact_id), mautic_payload)
                        link = CrmIdentityLink(
                            user_id=user.id,
                            system="mautic",
                            external_id=contact_id,
                        )
                        db.add(link)
                        results["mautic"] = {"status": "linked_existing", "contact_id": contact_id}
                else:
                    mautic_res = await mautic.create_contact(mautic_payload)
                    contact_id_raw = mautic_res.get("contact", {}).get("id")
                    contact_id = str(contact_id_raw) if contact_id_raw else None
                    if contact_id:
                        link = CrmIdentityLink(
                            user_id=user.id,
                            system="mautic",
                            external_id=contact_id,
                        )
                        db.add(link)
                        results["mautic"] = {"status": "created", "contact_id": contact_id}
                        logger.info(f"Created Mautic contact for user {user.id}: {contact_id}")
        except Exception as e:
            results["mautic"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to sync user {user.id} to Mautic: {e}")

    # Store event
    db.add(
        ProductEvent(
            user_id=user.id,
            event_name="user_registered_crm_sync",
            occurred_at=datetime.now(timezone.utc),
            properties=results,
            client_source="compass",
        )
    )

    return results


async def sync_email_verification(
    db: AsyncSession,
    user: User,
) -> dict[str, Any]:
    """Tag user as verified in Mautic and add note in Twenty."""
    results = {"user_id": str(user.id), "email": user.email, "twenty": None, "mautic": None}

    # Add note in Twenty
    if twenty.is_configured():
        try:
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "twenty",
                )
            )
            link = link_res.scalar_one_or_none()

            if link:
                note = f"✅ Email verified on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"
                await twenty.add_note_to_person(link.external_id, note)
                results["twenty"] = {"status": "note_added"}
        except Exception as e:
            results["twenty"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to add verification note for user {user.id} in Twenty: {e}")

    # Add tag in Mautic
    if mautic.is_configured():
        try:
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "mautic",
                )
            )
            link = link_res.scalar_one_or_none()

            if link:
                await mautic.add_tag_to_contact(int(link.external_id), "email_verified")
                results["mautic"] = {"status": "tag_added"}
        except Exception as e:
            results["mautic"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to add verification tag for user {user.id} in Mautic: {e}")

    # Store event
    db.add(
        ProductEvent(
            user_id=user.id,
            event_name="email_verified_crm_sync",
            occurred_at=datetime.now(timezone.utc),
            properties=results,
            client_source="compass",
        )
    )

    return results


async def sync_subscription_change(
    db: AsyncSession,
    user: User,
    subscription_tier: str,
    action: str = "upgraded",  # upgraded, downgraded, cancelled
) -> dict[str, Any]:
    """Sync subscription changes to CRM systems."""
    results = {
        "user_id": str(user.id),
        "email": user.email,
        "subscription_tier": subscription_tier,
        "action": action,
        "twenty": None,
        "mautic": None,
    }

    # Add note in Twenty
    if twenty.is_configured():
        try:
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "twenty",
                )
            )
            link = link_res.scalar_one_or_none()

            if link:
                note = f"💳 Subscription {action} to {subscription_tier} on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"
                await twenty.add_note_to_person(link.external_id, note)
                results["twenty"] = {"status": "note_added"}
        except Exception as e:
            results["twenty"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to sync subscription change for user {user.id} in Twenty: {e}")

    # Add tag in Mautic
    if mautic.is_configured():
        try:
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "mautic",
                )
            )
            link = link_res.scalar_one_or_none()

            if link:
                tag = f"subscriber_{subscription_tier.lower()}"
                await mautic.add_tag_to_contact(int(link.external_id), tag)
                results["mautic"] = {"status": "tag_added"}
        except Exception as e:
            results["mautic"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to sync subscription change for user {user.id} in Mautic: {e}")

    # Store event
    db.add(
        ProductEvent(
            user_id=user.id,
            event_name="subscription_changed_crm_sync",
            occurred_at=datetime.now(timezone.utc),
            properties=results,
            client_source="compass",
        )
    )

    return results


async def sync_booking_completion(
    db: AsyncSession,
    user: User,
    booking_id: str,
    service_name: str,
) -> dict[str, Any]:
    """Sync booking completion to CRM systems."""
    results = {
        "user_id": str(user.id),
        "email": user.email,
        "booking_id": booking_id,
        "service_name": service_name,
        "twenty": None,
        "mautic": None,
    }

    # Add note in Twenty
    if twenty.is_configured():
        try:
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "twenty",
                )
            )
            link = link_res.scalar_one_or_none()

            if link:
                note = f"📅 Booking completed: {service_name} (ID: {booking_id}) on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"
                await twenty.add_note_to_person(link.external_id, note)
                results["twenty"] = {"status": "note_added"}
        except Exception as e:
            results["twenty"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to sync booking for user {user.id} in Twenty: {e}")

    # Add tag in Mautic
    if mautic.is_configured():
        try:
            link_res = await db.execute(
                select(CrmIdentityLink).where(
                    CrmIdentityLink.user_id == user.id,
                    CrmIdentityLink.system == "mautic",
                )
            )
            link = link_res.scalar_one_or_none()

            if link:
                await mautic.add_tag_to_contact(int(link.external_id), "booking_completed")
                results["mautic"] = {"status": "tag_added"}
        except Exception as e:
            results["mautic"] = {"status": "error", "error": str(e)}
            logger.error(f"Failed to sync booking for user {user.id} in Mautic: {e}")

    # Store event
    db.add(
        ProductEvent(
            user_id=user.id,
            event_name="booking_completed_crm_sync",
            occurred_at=datetime.now(timezone.utc),
            properties=results,
            client_source="compass",
        )
    )

    return results
