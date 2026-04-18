"""
PayloadCMS Client for Olcan Compass
Async wrapper around PayloadCMS API
"""

import os
from typing import Optional, Dict, List, Any
import httpx


class CMSClient:
    """Async client for PayloadCMS content management"""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("CMS_URL", "http://localhost:3001")
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    async def get_product_metadata(
        self, product_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Fetch product metadata from PayloadCMS
        
        Args:
            product_ids: List of product IDs to fetch metadata for
            
        Returns:
            Dict mapping product_id to metadata
        """
        if not product_ids:
            return {}

        try:
            # Query PayloadCMS for product metadata
            # Assuming there's a 'product-metadata' collection
            response = await self.client.get(
                f"{self.base_url}/api/product-metadata",
                params={
                    "where[product_id][in]": ",".join(product_ids),
                    "limit": len(product_ids),
                },
            )
            
            if not response.is_success:
                print(f"CMS API error: {response.status_code}")
                return {}
            
            data = response.json()
            docs = data.get("docs", [])
            
            # Convert list to dict keyed by product_id
            return {
                item["product_id"]: item
                for item in docs
                if "product_id" in item
            }
        except httpx.HTTPError as e:
            print(f"CMS API error: {e}")
            return {}

    async def get_chronicles(
        self,
        limit: int = 20,
        status: str = "published",
    ) -> List[Dict[str, Any]]:
        """
        Fetch community chronicles (blog posts/articles)
        
        Args:
            limit: Number of chronicles to fetch
            status: Publication status filter
            
        Returns:
            List of chronicle documents
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/api/chronicles",
                params={
                    "limit": limit,
                    "where[status][equals]": status,
                    "sort": "-published_at",
                },
            )
            
            if not response.is_success:
                print(f"CMS API error: {response.status_code}")
                return []
            
            data = response.json()
            return data.get("docs", [])
        except httpx.HTTPError as e:
            print(f"CMS API error: {e}")
            return []

    async def get_archetype_definitions(self) -> List[Dict[str, Any]]:
        """
        Fetch archetype definitions from CMS
        
        Returns:
            List of archetype definition documents
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/api/archetypes",
                params={
                    "limit": 50,
                    "where[status][equals]": "published",
                },
            )
            
            if not response.is_success:
                print(f"CMS API error: {response.status_code}")
                return []
            
            data = response.json()
            return data.get("docs", [])
        except httpx.HTTPError as e:
            print(f"CMS API error: {e}")
            return []

    async def get_content_recommendations(
        self,
        journey_tags: Optional[List[str]] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Get content recommendations based on journey tags
        
        Args:
            journey_tags: List of tags to match against
            limit: Number of recommendations
            
        Returns:
            List of recommended content items
        """
        try:
            params = {
                "limit": limit,
                "where[status][equals]": "published",
                "sort": "-published_at",
            }
            
            if journey_tags:
                # Filter by tags if provided
                params["where[tags.label][in]"] = ",".join(journey_tags)
            
            response = await self.client.get(
                f"{self.base_url}/api/chronicles",
                params=params,
            )
            
            if not response.is_success:
                return []
            
            data = response.json()
            return data.get("docs", [])
        except httpx.HTTPError as e:
            print(f"CMS API error: {e}")
            return []


# Singleton instance
cms_client = CMSClient()
