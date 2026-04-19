"""CRM Bridge services.

Purpose:
- Keep Compass as source-of-truth for authentication + core journey.
- Push critical identity + lifecycle events into Twenty (CRM) and Mautic (marketing).
- Preserve idempotency with `crm_identity_links`.

This module intentionally does not auto-sync on login/registration by default
to avoid impacting the live system. Sync is driven by explicit admin actions
and/or queued jobs later.
"""

from __future__ import annotations

import hmac
import hashlib
from typing import Any
from urllib.parse import urlencode

import httpx

from app.core.config import get_settings


def _strip_trailing_slash(value: str) -> str:
    return value[:-1] if value.endswith("/") else value


class TwentyClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = _strip_trailing_slash(settings.twenty_base_url or "")
        self.api_key = settings.twenty_api_key or ""
        self.timeout = httpx.Timeout(10.0)

    def is_configured(self) -> bool:
        return bool(self.base_url and self.api_key)

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=self.timeout,
        )

    async def create_person(self, payload: dict[str, Any]) -> dict[str, Any]:
        async with self._client() as client:
            res = await client.post("/rest/people", json=payload)
            res.raise_for_status()
            return res.json()

    async def update_person(self, person_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        async with self._client() as client:
            res = await client.patch(f"/rest/people/{person_id}", json=payload)
            res.raise_for_status()
            return res.json()

    async def get_person(self, person_id: str) -> dict[str, Any]:
        async with self._client() as client:
            res = await client.get(f"/rest/people/{person_id}")
            res.raise_for_status()
            return res.json()

    async def search_person_by_email(self, email: str) -> dict[str, Any] | None:
        """Search for an existing person by email. Returns the first match or None."""
        async with self._client() as client:
            res = await client.get(
                "/rest/people",
                params={"filter": f"email[eq]:{email}", "limit": "1"},
            )
            res.raise_for_status()
            data = res.json()
            records = data.get("data", {}).get("people", [])
            if not records:
                # Try top-level list format
                records = data.get("data", []) if isinstance(data.get("data"), list) else []
            return records[0] if records else None

    async def add_note_to_person(self, person_id: str, note: str) -> dict[str, Any]:
        """Add a note/activity to a person in Twenty."""
        async with self._client() as client:
            res = await client.post(
                "/rest/notes",
                json={
                    "body": note,
                    "personId": person_id,
                },
            )
            res.raise_for_status()
            return res.json()


class MauticClient:
    """Client for Mautic marketing automation API.
    
    Mautic API docs: https://developer.mautic.org/#contacts
    """
    
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = _strip_trailing_slash(settings.mautic_base_url or "")
        self.api_key = settings.mautic_api_key or ""
        self.timeout = httpx.Timeout(10.0)

    def is_configured(self) -> bool:
        return bool(self.base_url and self.api_key)

    def _client(self) -> httpx.AsyncClient:
        # Mautic typically uses Basic Auth or OAuth2
        # For simplicity, we assume API key is passed as a header or query param
        # Adjust authentication method based on your Mautic setup
        return httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=self.timeout,
        )

    async def create_contact(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Create a new contact in Mautic.
        
        Payload should contain contact fields like:
        - email (required)
        - firstname
        - lastname
        - tags (list of strings)
        - custom fields
        """
        async with self._client() as client:
            res = await client.post("/api/contacts/new", json=payload)
            res.raise_for_status()
            return res.json()

    async def update_contact(self, contact_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        """Update an existing contact in Mautic."""
        async with self._client() as client:
            res = await client.patch(f"/api/contacts/{contact_id}/edit", json=payload)
            res.raise_for_status()
            return res.json()

    async def get_contact(self, contact_id: int) -> dict[str, Any]:
        """Get a contact by ID."""
        async with self._client() as client:
            res = await client.get(f"/api/contacts/{contact_id}")
            res.raise_for_status()
            return res.json()

    async def get_contact_by_email(self, email: str) -> dict[str, Any]:
        """Search for a contact by email address."""
        async with self._client() as client:
            # Mautic search API
            params = {"search": email, "where": "email"}
            res = await client.get("/api/contacts", params=params)
            res.raise_for_status()
            data = res.json()
            contacts = data.get("contacts", [])
            return contacts[0] if contacts else None

    async def add_tag_to_contact(self, contact_id: int, tag: str) -> dict[str, Any]:
        """Add a tag to a contact in Mautic."""
        async with self._client() as client:
            res = await client.post(
                f"/api/contacts/{contact_id}/tags/add",
                json={"tags": [tag]},
            )
            res.raise_for_status()
            return res.json()

    async def remove_tag_from_contact(self, contact_id: int, tag: str) -> dict[str, Any]:
        """Remove a tag from a contact in Mautic."""
        async with self._client() as client:
            res = await client.post(
                f"/api/contacts/{contact_id}/tags/remove",
                json={"tags": [tag]},
            )
            res.raise_for_status()
            return res.json()


def verify_twenty_webhook(signature_hex: str | None, timestamp: str | None, raw_body: bytes, secret: str) -> bool:
    """Validate Twenty webhook signature (HMAC SHA256).

    Format: sign `{timestamp}:{raw_json}`.
    Signature header is hex string.
    """
    if not signature_hex or not timestamp:
        return False
    try:
        message = timestamp.encode() + b":" + raw_body
        expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature_hex)
    except Exception:
        return False


def verify_mautic_webhook(raw_body: bytes, headers: dict[str, str]) -> bool:
    """Validate Mautic webhook signature using HMAC-SHA256 when a secret is configured.

    Mautic can POST a X-Mautic-Signature header (SHA256 hex-digest of the body).
    If no secret is configured we accept the request (you should restrict by IP on nginx).
    """
    from app.core.config import get_settings
    settings = get_settings()
    secret = settings.mautic_webhook_secret
    if not secret:
        return True  # No secret configured — accept (restrict by IP at infra level)
    sig_header = headers.get("x-mautic-signature") or headers.get("X-Mautic-Signature")
    if not sig_header:
        return False
    try:
        expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, sig_header)
    except Exception:
        return False


twenty = TwentyClient()
mautic = MauticClient()

