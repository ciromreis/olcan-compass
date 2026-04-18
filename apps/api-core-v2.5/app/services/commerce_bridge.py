from __future__ import annotations

import json
from http.client import RemoteDisconnected
from decimal import Decimal, InvalidOperation
from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import get_settings


CATALOG_PATH = (
    Path(__file__).resolve().parents[4] / "data" / "commerce" / "olcan-products.json"
)


def _load_catalog() -> list[dict[str, Any]]:
    with CATALOG_PATH.open("r", encoding="utf-8") as catalog_file:
        data = json.load(catalog_file)
        if not isinstance(data, list):
            raise ValueError("Canonical commerce catalog must be a list.")
        return data


def _catalog_by_handle() -> dict[str, dict[str, Any]]:
    return {item["handle"]: item for item in _load_catalog()}


def _format_brl(amount: int | None) -> str:
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
                normalized = int(Decimal(str(amount)) / Decimal("100"))
            except (InvalidOperation, ValueError):
                continue
            return normalized, (currency or "BRL").upper()

        prices = variant.get("prices") or []
        for price in prices:
            amount = price.get("amount")
            currency = price.get("currency_code")
            if amount is None:
                continue
            try:
                normalized = int(Decimal(str(amount)) / Decimal("100"))
            except (InvalidOperation, ValueError):
                continue
            return normalized, (currency or "BRL").upper()

    return None, "BRL"


class CommerceBridgeService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.marketplace_engine_url.rstrip("/")

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.settings.marketplace_publishable_key:
            headers["x-publishable-api-key"] = self.settings.marketplace_publishable_key
        return headers

    def _request_json(
        self, path: str, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        query = f"?{urlencode(params or {})}" if params else ""
        request = Request(
            f"{self.base_url}{path}{query}",
            headers=self._headers(),
            method="GET",
        )

        with urlopen(request, timeout=8) as response:
            payload = response.read().decode("utf-8")
            return json.loads(payload) if payload else {}

    def _catalog_url_for(self, handle: str) -> str:
        return f"{self.settings.commerce_catalog_url.rstrip('/')}/{handle}"

    def _compose_product(
        self, medusa_product: dict[str, Any] | None, catalog_item: dict[str, Any]
    ) -> dict[str, Any]:
        medusa_product = medusa_product or {}
        price_amount, price_currency = _extract_variant_price(medusa_product)
        overlay_price = catalog_item.get("price_brl")

        if price_amount is None and overlay_price is not None:
            price_amount = int(overlay_price)
            price_currency = "BRL"

        checkout_url = catalog_item.get("checkout_url")
        handle = medusa_product.get("handle") or catalog_item["handle"]
        title = medusa_product.get("title") or catalog_item["title"]
        description = medusa_product.get("description") or catalog_item["description"]

        return {
            "id": medusa_product.get("id") or catalog_item["id"],
            "source": "medusa" if medusa_product else "catalog",
            "title": title,
            "legacy_title": catalog_item.get("legacy_title"),
            "handle": handle,
            "slug": handle,
            "description": description,
            "short_description": catalog_item.get("short_description"),
            "thumbnail": medusa_product.get("thumbnail"),
            "images": [
                image.get("url")
                for image in medusa_product.get("images", [])
                if image.get("url")
            ],
            "product_type": catalog_item.get("product_type", "digital"),
            "category": catalog_item.get("category", "Marketplace"),
            "area": catalog_item.get("area"),
            "format": catalog_item.get("format"),
            "language": catalog_item.get("language"),
            "version": catalog_item.get("version"),
            "phase": catalog_item.get("phase"),
            "status": catalog_item.get("status"),
            "revenue_model": catalog_item.get("revenue_model"),
            "platform_sale": catalog_item.get("platform_sale"),
            "tags": list(catalog_item.get("tags", [])),
            "features": list(catalog_item.get("features", [])),
            "specifications": list(catalog_item.get("specifications", [])),
            "modules": list(catalog_item.get("modules", [])),
            "audience": list(catalog_item.get("audience", [])),
            "cta_label": catalog_item.get("cta_label"),
            "catalog_visibility": catalog_item.get("catalog_visibility", "public"),
            "is_featured": bool(catalog_item.get("is_featured")),
            "is_olcan_official": bool(catalog_item.get("is_olcan_official", True)),
            "is_bestseller": bool(catalog_item.get("is_bestseller")),
            "is_new": bool(catalog_item.get("is_new")),
            "price_amount": price_amount,
            "price_currency": price_currency,
            "price_display": catalog_item.get("price_display_override")
            or _format_brl(price_amount),
            "compare_at_price_amount": catalog_item.get("compare_at_price_brl"),
            "compare_at_price_display": _format_brl(
                catalog_item["compare_at_price_brl"]
            )
            if catalog_item.get("compare_at_price_brl")
            else None,
            "checkout_mode": catalog_item.get("checkout_mode", "catalog_only"),
            "checkout_url": checkout_url,
            "catalog_url": self._catalog_url_for(handle),
        }

    def list_public_products(self, limit: int = 24) -> list[dict[str, Any]]:
        catalog = _catalog_by_handle()
        products_by_handle: dict[str, dict[str, Any]] = {}

        try:
            data = self._request_json("/store/products", {"limit": limit})
            for product in data.get("products", []):
                handle = product.get("handle")
                if not handle or handle not in catalog:
                    continue
                products_by_handle[handle] = self._compose_product(product, catalog[handle])
        except (HTTPError, URLError, TimeoutError, RemoteDisconnected, json.JSONDecodeError):
            pass

        for handle, catalog_item in catalog.items():
            if catalog_item.get("catalog_visibility") != "public":
                continue
            if handle not in products_by_handle:
                products_by_handle[handle] = self._compose_product(None, catalog_item)

        return list(products_by_handle.values())[:limit]

    def get_public_product(self, handle: str) -> dict[str, Any] | None:
        catalog = _catalog_by_handle()
        catalog_item = catalog.get(handle)
        if not catalog_item or catalog_item.get("catalog_visibility") != "public":
            return None

        try:
            data = self._request_json(f"/store/products/{handle}")
            product = data.get("product")
            if product:
                return self._compose_product(product, catalog_item)
        except (HTTPError, URLError, TimeoutError, RemoteDisconnected, json.JSONDecodeError):
            pass

        return self._compose_product(None, catalog_item)


@lru_cache
def get_commerce_bridge_service() -> CommerceBridgeService:
    return CommerceBridgeService()
