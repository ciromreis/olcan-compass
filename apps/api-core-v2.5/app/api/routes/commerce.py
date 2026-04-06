from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.db.models.user import User
from app.core.config import get_settings

from app.services.commerce_bridge import get_commerce_bridge_service

router = APIRouter(prefix="/commerce", tags=["Commerce"])
settings = get_settings()


class CheckoutIntentRequest(BaseModel):
    handle: str
    origin: str = "compass-app"


def _append_query_params(url: str, params: dict[str, str]) -> str:
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.update({key: value for key, value in params.items() if value})
    return urlunsplit(
        (
            parts.scheme,
            parts.netloc,
            parts.path,
            urlencode(query),
            parts.fragment,
        )
    )


@router.get("/public/products")
async def list_public_products(
    limit: int = Query(24, ge=1, le=60),
):
    service = get_commerce_bridge_service()
    items = service.list_public_products(limit=limit)
    return {
        "items": items,
        "count": len(items),
        "source": "olcan-commerce-bridge",
    }


@router.get("/public/products/{handle}")
async def get_public_product(handle: str):
    service = get_commerce_bridge_service()
    item = service.get_public_product(handle)
    if not item:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return {
        "item": item,
        "source": "olcan-commerce-bridge",
    }


@router.get("/me/context")
async def get_authenticated_commerce_context(
    current_user: User = Depends(get_current_user),
):
    return {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name or current_user.username,
        },
        "catalog_url": settings.commerce_catalog_url,
        "app_catalog_url": f"{settings.frontend_url.rstrip('/')}/marketplace",
        "auth_mode": "olcan-shared-session",
        "checkout_mode": "external-assisted",
        "source": "olcan-commerce-bridge",
    }


@router.post("/me/checkout-intents")
async def create_checkout_intent(
    payload: CheckoutIntentRequest,
    current_user: User = Depends(get_current_user),
):
    service = get_commerce_bridge_service()
    item = service.get_public_product(payload.handle)
    if not item:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    checkout_url = item.get("checkout_url")
    if not checkout_url:
        raise HTTPException(
            status_code=409,
            detail="Este item ainda não possui fluxo de compra disponível",
        )

    intent_url = _append_query_params(
        checkout_url,
        {
            "utm_source": "olcan-compass",
            "utm_medium": "authenticated-session",
            "utm_campaign": item.get("handle") or payload.handle,
            "utm_content": payload.origin,
        },
    )

    return {
        "checkout_url": intent_url,
        "catalog_url": item.get("catalog_url") or settings.commerce_catalog_url,
        "product": item,
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name or current_user.username,
        },
        "auth_mode": "olcan-shared-session",
        "source": "olcan-commerce-bridge",
    }
