from __future__ import annotations

import json
from http.client import RemoteDisconnected
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from functools import lru_cache
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import get_settings


@dataclass(frozen=True)
class CommerceOverlay:
    handle: str
    title: str
    short_description: str
    product_type: str
    category: str
    price_brl: int | None
    compare_at_price_brl: int | None = None
    is_featured: bool = False
    is_olcan_official: bool = True
    is_bestseller: bool = False
    is_new: bool = False
    checkout_mode: str = "external"
    checkout_url: str | None = None
    tags: tuple[str, ...] = ()


def _overlay_catalog() -> dict[str, CommerceOverlay]:
    settings = get_settings()
    return {
        "curso-cidadao-mundo": CommerceOverlay(
            handle="curso-cidadao-mundo",
            title="Curso Cidadão do Mundo",
            short_description="Mapeamento estratégico e preparo mental para uma carreira internacional sustentável.",
            product_type="digital",
            category="Cursos",
            price_brl=497,
            compare_at_price_brl=697,
            is_featured=True,
            is_bestseller=True,
            checkout_url=settings.commerce_checkout_curso_cidadao_mundo_url,
            tags=("curso", "mobilidade", "carreira"),
        ),
        "kit-application": CommerceOverlay(
            handle="kit-application",
            title="Kit Application",
            short_description="Documentos-base e estrutura narrativa para candidaturas internacionais mais consistentes.",
            product_type="digital",
            category="Ferramentas",
            price_brl=997,
            compare_at_price_brl=None,
            is_featured=True,
            checkout_url=settings.commerce_checkout_kit_application_url,
            tags=("curriculo", "cover-letter", "application"),
        ),
        "rota-internacionalizacao": CommerceOverlay(
            handle="rota-internacionalizacao",
            title="Rota de Internacionalização",
            short_description="Mentoria estratégica para organizar decisão, artefatos e execução da sua rota.",
            product_type="service",
            category="Mentorias",
            price_brl=4500,
            compare_at_price_brl=None,
            is_featured=True,
            checkout_url=settings.commerce_checkout_rota_internacionalizacao_url,
            tags=("mentoria", "estrategia", "rota"),
        ),
    }


def _format_brl(amount: int | None, currency: str = "BRL") -> str:
    if amount is None:
        return "Sob consulta"

    value = Decimal(amount)
    normalized = f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {normalized}"


def _extract_variant_price(product: dict[str, Any]) -> tuple[int | None, str]:
    variants = product.get("variants") or []
    for variant in variants:
        calculated = variant.get("calculated_price") or {}
        amount = calculated.get("calculated_amount")
        currency = calculated.get("currency_code")
        if amount is not None:
            try:
                cents = int(Decimal(str(amount)) / Decimal("100"))
            except (InvalidOperation, ValueError):
                continue
            return cents, (currency or "BRL").upper()

        prices = variant.get("prices") or []
        for price in prices:
            amount = price.get("amount")
            currency = price.get("currency_code")
            if amount is None:
                continue
            try:
                cents = int(Decimal(str(amount)) / Decimal("100"))
            except (InvalidOperation, ValueError):
                continue
            return cents, (currency or "BRL").upper()

    return None, "BRL"


class CommerceBridgeService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.marketplace_engine_url.rstrip("/")

    def _request_json(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        query = f"?{urlencode(params or {})}" if params else ""
        request = Request(
            f"{self.base_url}{path}{query}",
            headers=self._headers(),
            method="GET",
        )

        with urlopen(request, timeout=8) as response:
            payload = response.read().decode("utf-8")
            return json.loads(payload) if payload else {}

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.settings.marketplace_publishable_key:
            headers["x-publishable-api-key"] = self.settings.marketplace_publishable_key
        return headers

    def _catalog_url_for(self, handle: str) -> str:
        return f"{self.settings.commerce_catalog_url.rstrip('/')}/{handle}"

    def _merge_product(self, product: dict[str, Any], overlay: CommerceOverlay | None) -> dict[str, Any]:
        price_amount, price_currency = _extract_variant_price(product)

        if overlay and price_amount is None:
            price_amount = overlay.price_brl
            price_currency = "BRL"

        checkout_mode = overlay.checkout_mode if overlay else "catalog_only"
        checkout_url = overlay.checkout_url if overlay else self._catalog_url_for(product.get("handle", ""))

        return {
            "id": product.get("id") or (overlay.handle if overlay else None),
            "source": "medusa",
            "title": product.get("title") or (overlay.title if overlay else ""),
            "handle": product.get("handle") or (overlay.handle if overlay else ""),
            "slug": product.get("handle") or (overlay.handle if overlay else ""),
            "description": product.get("description") or (overlay.short_description if overlay else None),
            "short_description": overlay.short_description if overlay else (product.get("subtitle") or product.get("description")),
            "thumbnail": product.get("thumbnail"),
            "images": [image.get("url") for image in product.get("images", []) if image.get("url")],
            "product_type": overlay.product_type if overlay else "digital",
            "category": overlay.category if overlay else "Marketplace",
            "tags": list(overlay.tags) if overlay else [],
            "is_featured": overlay.is_featured if overlay else False,
            "is_olcan_official": overlay.is_olcan_official if overlay else False,
            "is_bestseller": overlay.is_bestseller if overlay else False,
            "is_new": overlay.is_new if overlay else False,
            "price_amount": price_amount,
            "price_currency": price_currency,
            "price_display": _format_brl(price_amount, price_currency),
            "compare_at_price_amount": overlay.compare_at_price_brl if overlay else None,
            "compare_at_price_display": _format_brl(overlay.compare_at_price_brl, "BRL") if overlay and overlay.compare_at_price_brl else None,
            "checkout_mode": checkout_mode,
            "checkout_url": checkout_url,
            "catalog_url": self._catalog_url_for(product.get("handle") or (overlay.handle if overlay else "")),
        }

    def list_public_products(self, limit: int = 24) -> list[dict[str, Any]]:
        overlays = _overlay_catalog()
        products_by_handle: dict[str, dict[str, Any]] = {}

        try:
            data = self._request_json("/store/products", {"limit": limit})
            for product in data.get("products", []):
                handle = product.get("handle")
                if not handle:
                    continue
                products_by_handle[handle] = self._merge_product(product, overlays.get(handle))
        except (HTTPError, URLError, TimeoutError, RemoteDisconnected, json.JSONDecodeError):
            pass

        for handle, overlay in overlays.items():
            if handle not in products_by_handle:
                products_by_handle[handle] = self._merge_product(
                    {"id": handle, "handle": handle, "title": overlay.title, "description": overlay.short_description, "images": [], "variants": []},
                    overlay,
                )

        return list(products_by_handle.values())

    def get_public_product(self, handle: str) -> dict[str, Any] | None:
        overlays = _overlay_catalog()

        try:
            data = self._request_json(f"/store/products/{handle}")
            product = data.get("product")
            if product:
                return self._merge_product(product, overlays.get(handle))
        except (HTTPError, URLError, TimeoutError, RemoteDisconnected, json.JSONDecodeError):
            pass

        overlay = overlays.get(handle)
        if not overlay:
            return None

        return self._merge_product(
            {"id": handle, "handle": handle, "title": overlay.title, "description": overlay.short_description, "images": [], "variants": []},
            overlay,
        )


@lru_cache
def get_commerce_bridge_service() -> CommerceBridgeService:
    return CommerceBridgeService()
