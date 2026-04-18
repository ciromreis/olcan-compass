"""
Commerce Proxy API
Unified endpoint that proxies MedusaJS and enriches with PayloadCMS metadata
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel

from app.core.medusa_client import medusa_client
from app.core.cms_client import cms_client
from app.core.cache_service import cache_service


router = APIRouter(prefix="/commerce", tags=["commerce"])


class ProductResponse(BaseModel):
    """Enriched product response"""
    id: str
    title: str
    handle: str
    description: Optional[str] = None
    subtitle: Optional[str] = None
    thumbnail: Optional[str] = None
    images: List[dict] = []
    variants: List[dict] = []
    categories: List[dict] = []
    tags: List[dict] = []
    metadata: dict = {}
    created_at: str
    updated_at: str
    # CMS-enriched fields
    is_olcan_official: bool = False
    is_featured: bool = False
    journey_tags: List[str] = []
    recommended_for: List[str] = []


class ProductListResponse(BaseModel):
    """Paginated product list response"""
    items: List[ProductResponse]
    count: int
    limit: int
    offset: int


@router.get("/public/products", response_model=ProductListResponse)
async def list_products(
    category: Optional[str] = Query(None, description="Filter by category ID"),
    collection: Optional[str] = Query(None, description="Filter by collection ID"),
    search: Optional[str] = Query(None, alias="q", description="Search query"),
    is_featured: Optional[bool] = Query(None, description="Filter featured products"),
    is_olcan_official: Optional[bool] = Query(None, description="Filter Olcan official products"),
    limit: int = Query(50, ge=1, le=100, description="Number of products"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
):
    """
    List products from unified commerce endpoint
    
    This endpoint:
    1. Fetches products from MedusaJS
    2. Enriches with metadata from PayloadCMS
    3. Caches results for 5 minutes
    4. Returns unified product list
    """
    # Build cache key
    cache_key = f"products:{category}:{collection}:{search}:{is_featured}:{is_olcan_official}:{limit}:{offset}"
    
    # Check cache
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    # Fetch from MedusaJS
    medusa_response = await medusa_client.list_products(
        category_id=category,
        collection_id=collection,
        q=search,
        limit=limit,
        offset=offset,
    )

    products = medusa_response.get("products", [])
    count = medusa_response.get("count", 0)

    # Get product IDs for CMS enrichment
    product_ids = [p["id"] for p in products]
    
    # Fetch CMS metadata
    cms_metadata = {}
    if product_ids:
        cms_metadata = await cms_client.get_product_metadata(product_ids)

    # Enrich products with CMS data
    enriched_products = []
    for product in products:
        product_id = product["id"]
        meta = cms_metadata.get(product_id, {})
        
        enriched = ProductResponse(
            id=product["id"],
            title=product.get("title", ""),
            handle=product.get("handle", ""),
            description=product.get("description"),
            subtitle=product.get("subtitle"),
            thumbnail=product.get("thumbnail"),
            images=product.get("images", []),
            variants=product.get("variants", []),
            categories=product.get("categories", []),
            tags=product.get("tags", []),
            metadata=product.get("metadata", {}),
            created_at=product.get("created_at", ""),
            updated_at=product.get("updated_at", ""),
            # CMS enrichment
            is_olcan_official=meta.get("is_olcan_official", False),
            is_featured=meta.get("is_featured", False),
            journey_tags=meta.get("journey_tags", []),
            recommended_for=meta.get("recommended_for", []),
        )
        
        enriched_products.append(enriched)

    # Apply CMS filters if specified
    if is_featured is not None:
        enriched_products = [p for p in enriched_products if p.is_featured == is_featured]
    
    if is_olcan_official is not None:
        enriched_products = [p for p in enriched_products if p.is_olcan_official == is_olcan_official]

    # Build response
    response = ProductListResponse(
        items=enriched_products,
        count=len(enriched_products),  # Adjusted count after filtering
        limit=limit,
        offset=offset,
    )

    # Cache for 5 minutes
    cache_service.set(cache_key, response, ttl=300)

    return response


@router.get("/public/products/{slug_or_id}", response_model=dict)
async def get_product(slug_or_id: str):
    """
    Get a single product by slug or ID
    
    Returns enriched product with CMS metadata
    """
    # Check cache
    cache_key = f"product:{slug_or_id}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    # Fetch from MedusaJS
    product = await medusa_client.get_product(slug_or_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Fetch CMS metadata
    cms_metadata = await cms_client.get_product_metadata([product["id"]])
    meta = cms_metadata.get(product["id"], {})

    # Enrich product
    enriched = {
        **product,
        "is_olcan_official": meta.get("is_olcan_official", False),
        "is_featured": meta.get("is_featured", False),
        "journey_tags": meta.get("journey_tags", []),
        "recommended_for": meta.get("recommended_for", []),
    }

    # Cache for 5 minutes
    cache_service.set(cache_key, {"item": enriched}, ttl=300)

    return {"item": enriched}


@router.get("/public/collections")
async def list_collections():
    """List all product collections from MedusaJS"""
    # Check cache
    cache_key = "collections:all"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    collections = await medusa_client.list_collections()
    
    response = {"collections": collections}
    
    # Cache for 10 minutes
    cache_service.set(cache_key, response, ttl=600)
    
    return response


@router.get("/public/categories")
async def list_categories():
    """List all product categories from MedusaJS"""
    # Check cache
    cache_key = "categories:all"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    categories = await medusa_client.list_categories()
    
    response = {"categories": categories}
    
    # Cache for 10 minutes
    cache_service.set(cache_key, response, ttl=600)
    
    return response
