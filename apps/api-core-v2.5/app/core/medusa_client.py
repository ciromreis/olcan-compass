"""
MedusaJS Client for Olcan Compass
Async wrapper around MedusaJS Store API
"""

from typing import Optional, Dict, List, Any
import httpx
from app.core.config import settings


class MedusaClient:
    """Async client for MedusaJS e-commerce backend"""

    def __init__(self, base_url: Optional[str] = None):
        # Reads MARKETPLACE_ENGINE_URL env var via the unified settings object.
        # Do NOT use os.getenv("MEDUSA_URL") — that env var is not defined in
        # .env.example and bypasses the settings validation layer.
        self.base_url = base_url or settings.marketplace_engine_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    async def list_products(
        self,
        category_id: Optional[str] = None,
        collection_id: Optional[str] = None,
        q: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """
        List products from MedusaJS store
        
        Args:
            category_id: Filter by category ID
            collection_id: Filter by collection ID
            q: Search query
            limit: Number of products to return
            offset: Pagination offset
            
        Returns:
            Dict with 'products' list and 'count' total
        """
        params = {"limit": limit, "offset": offset}
        
        if category_id:
            params["category_id[]"] = category_id
        if collection_id:
            params["collection_id[]"] = collection_id
        if q:
            params["q"] = q

        try:
            response = await self.client.get(
                f"{self.base_url}/store/products",
                params=params,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"MedusaJS API error: {e}")
            # Return empty result on error
            return {"products": [], "count": 0}

    async def get_product(self, id_or_handle: str) -> Optional[Dict[str, Any]]:
        """
        Get a single product by ID or handle
        
        Args:
            id_or_handle: Product ID or URL handle
            
        Returns:
            Product dict or None if not found
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/store/products/{id_or_handle}"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("product")
        except httpx.HTTPError as e:
            print(f"MedusaJS API error: {e}")
            return None

    async def list_collections(self) -> List[Dict[str, Any]]:
        """
        List all product collections
        
        Returns:
            List of collection dicts
        """
        try:
            response = await self.client.get(f"{self.base_url}/store/collections")
            response.raise_for_status()
            data = response.json()
            return data.get("collections", [])
        except httpx.HTTPError as e:
            print(f"MedusaJS API error: {e}")
            return []

    async def get_collection(self, collection_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a single collection
        
        Args:
            collection_id: Collection ID
            
        Returns:
            Collection dict or None if not found
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/store/collections/{collection_id}"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("collection")
        except httpx.HTTPError as e:
            print(f"MedusaJS API error: {e}")
            return None

    async def list_categories(self) -> List[Dict[str, Any]]:
        """
        List all product categories
        
        Returns:
            List of category dicts
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/store/product-categories"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("product_categories", [])
        except httpx.HTTPError as e:
            print(f"MedusaJS API error: {e}")
            return []


# Singleton instance
medusa_client = MedusaClient()
