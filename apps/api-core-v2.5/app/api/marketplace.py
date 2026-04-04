"""
Marketplace API

REST endpoints for marketplace resources, purchases, and reviews.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.resource import ResourceType, ResourceCategory, ResourceStatus
from ..services.marketplace_service import MarketplaceService

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


# ============================================================================
# SCHEMAS
# ============================================================================

class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10)
    resource_type: ResourceType
    category: ResourceCategory
    price: float = Field(..., ge=0)
    tags: Optional[List[str]] = None
    difficulty_level: Optional[str] = None
    estimated_time_minutes: Optional[int] = None
    content_url: Optional[str] = None
    preview_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, ge=0)
    category: Optional[ResourceCategory] = None
    tags: Optional[List[str]] = None
    difficulty_level: Optional[str] = None
    estimated_time_minutes: Optional[int] = None
    content_url: Optional[str] = None
    preview_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    meta_description: Optional[str] = None


class ResourceResponse(BaseModel):
    id: str
    creator_id: str
    title: str
    description: str
    resource_type: ResourceType
    category: ResourceCategory
    status: ResourceStatus
    price: float
    currency: str
    is_premium: int
    content_url: Optional[str]
    preview_url: Optional[str]
    thumbnail_url: Optional[str]
    tags: Optional[List[str]]
    difficulty_level: Optional[str]
    estimated_time_minutes: Optional[int]
    view_count: int
    download_count: int
    purchase_count: int
    rating: float
    review_count: int
    slug: Optional[str]
    created_at: str
    updated_at: str
    published_at: Optional[str]

    class Config:
        from_attributes = True


class PurchaseResponse(BaseModel):
    id: str
    user_id: str
    resource_id: str
    amount_paid: float
    currency: str
    status: str
    download_count: int
    purchased_at: str

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=100)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    id: str
    resource_id: str
    user_id: str
    rating: int
    title: Optional[str]
    comment: Optional[str]
    is_verified_purchase: int
    helpful_count: int
    created_at: str

    class Config:
        from_attributes = True


class CollectionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    resource_ids: List[str] = Field(..., min_items=1)
    price: float = Field(default=0.0, ge=0)
    discount_percentage: int = Field(default=0, ge=0, le=100)


class CollectionResponse(BaseModel):
    id: str
    creator_id: str
    title: str
    description: Optional[str]
    resource_ids: List[str]
    price: float
    discount_percentage: int
    view_count: int
    purchase_count: int
    is_public: int
    is_featured: int
    created_at: str

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/resources", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_data: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new marketplace resource"""
    
    service = MarketplaceService(db)
    
    try:
        resource = service.create_resource(
            creator_id=current_user.id,
            **resource_data.model_dump()
        )
        
        return ResourceResponse(
            id=resource.id,
            creator_id=resource.creator_id,
            title=resource.title,
            description=resource.description,
            resource_type=resource.resource_type,
            category=resource.category,
            status=resource.status,
            price=resource.price,
            currency=resource.currency,
            is_premium=resource.is_premium,
            content_url=resource.content_url,
            preview_url=resource.preview_url,
            thumbnail_url=resource.thumbnail_url,
            tags=resource.tags,
            difficulty_level=resource.difficulty_level,
            estimated_time_minutes=resource.estimated_time_minutes,
            view_count=resource.view_count,
            download_count=resource.download_count,
            purchase_count=resource.purchase_count,
            rating=resource.rating,
            review_count=resource.review_count,
            slug=resource.slug,
            created_at=resource.created_at.isoformat(),
            updated_at=resource.updated_at.isoformat(),
            published_at=resource.published_at.isoformat() if resource.published_at else None
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/resources", response_model=List[ResourceResponse])
async def get_resources(
    resource_type: Optional[ResourceType] = None,
    category: Optional[ResourceCategory] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = Query(default="created_at", regex="^(created_at|price_asc|price_desc|rating|popular)$"),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get marketplace resources with filtering"""
    
    service = MarketplaceService(db)
    
    resources = service.get_resources(
        resource_type=resource_type,
        category=category,
        min_price=min_price,
        max_price=max_price,
        search_query=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    
    return [
        ResourceResponse(
            id=r.id,
            creator_id=r.creator_id,
            title=r.title,
            description=r.description,
            resource_type=r.resource_type,
            category=r.category,
            status=r.status,
            price=r.price,
            currency=r.currency,
            is_premium=r.is_premium,
            content_url=r.content_url,
            preview_url=r.preview_url,
            thumbnail_url=r.thumbnail_url,
            tags=r.tags,
            difficulty_level=r.difficulty_level,
            estimated_time_minutes=r.estimated_time_minutes,
            view_count=r.view_count,
            download_count=r.download_count,
            purchase_count=r.purchase_count,
            rating=r.rating,
            review_count=r.review_count,
            slug=r.slug,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat(),
            published_at=r.published_at.isoformat() if r.published_at else None
        )
        for r in resources
    ]


@router.get("/resources/featured", response_model=List[ResourceResponse])
async def get_featured_resources(
    limit: int = Query(default=10, le=50),
    db: Session = Depends(get_db)
):
    """Get featured/popular resources"""
    
    service = MarketplaceService(db)
    resources = service.get_featured_resources(limit=limit)
    
    return [
        ResourceResponse(
            id=r.id,
            creator_id=r.creator_id,
            title=r.title,
            description=r.description,
            resource_type=r.resource_type,
            category=r.category,
            status=r.status,
            price=r.price,
            currency=r.currency,
            is_premium=r.is_premium,
            content_url=r.content_url,
            preview_url=r.preview_url,
            thumbnail_url=r.thumbnail_url,
            tags=r.tags,
            difficulty_level=r.difficulty_level,
            estimated_time_minutes=r.estimated_time_minutes,
            view_count=r.view_count,
            download_count=r.download_count,
            purchase_count=r.purchase_count,
            rating=r.rating,
            review_count=r.review_count,
            slug=r.slug,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat(),
            published_at=r.published_at.isoformat() if r.published_at else None
        )
        for r in resources
    ]


@router.get("/resources/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific resource"""
    
    service = MarketplaceService(db)
    resource = service.get_resource(resource_id)
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    return ResourceResponse(
        id=resource.id,
        creator_id=resource.creator_id,
        title=resource.title,
        description=resource.description,
        resource_type=resource.resource_type,
        category=resource.category,
        status=resource.status,
        price=resource.price,
        currency=resource.currency,
        is_premium=resource.is_premium,
        content_url=resource.content_url,
        preview_url=resource.preview_url,
        thumbnail_url=resource.thumbnail_url,
        tags=resource.tags,
        difficulty_level=resource.difficulty_level,
        estimated_time_minutes=resource.estimated_time_minutes,
        view_count=resource.view_count,
        download_count=resource.download_count,
        purchase_count=resource.purchase_count,
        rating=resource.rating,
        review_count=resource.review_count,
        slug=resource.slug,
        created_at=resource.created_at.isoformat(),
        updated_at=resource.updated_at.isoformat(),
        published_at=resource.published_at.isoformat() if resource.published_at else None
    )


@router.patch("/resources/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: str,
    updates: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a resource"""
    
    service = MarketplaceService(db)
    
    try:
        resource = service.update_resource(
            resource_id=resource_id,
            creator_id=current_user.id,
            updates=updates.model_dump(exclude_unset=True)
        )
        
        return ResourceResponse(
            id=resource.id,
            creator_id=resource.creator_id,
            title=resource.title,
            description=resource.description,
            resource_type=resource.resource_type,
            category=resource.category,
            status=resource.status,
            price=resource.price,
            currency=resource.currency,
            is_premium=resource.is_premium,
            content_url=resource.content_url,
            preview_url=resource.preview_url,
            thumbnail_url=resource.thumbnail_url,
            tags=resource.tags,
            difficulty_level=resource.difficulty_level,
            estimated_time_minutes=resource.estimated_time_minutes,
            view_count=resource.view_count,
            download_count=resource.download_count,
            purchase_count=resource.purchase_count,
            rating=resource.rating,
            review_count=resource.review_count,
            slug=resource.slug,
            created_at=resource.created_at.isoformat(),
            updated_at=resource.updated_at.isoformat(),
            published_at=resource.published_at.isoformat() if resource.published_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/resources/{resource_id}/publish", response_model=ResourceResponse)
async def publish_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Publish a resource to marketplace"""
    
    service = MarketplaceService(db)
    
    try:
        resource = service.publish_resource(resource_id, current_user.id)
        
        return ResourceResponse(
            id=resource.id,
            creator_id=resource.creator_id,
            title=resource.title,
            description=resource.description,
            resource_type=resource.resource_type,
            category=resource.category,
            status=resource.status,
            price=resource.price,
            currency=resource.currency,
            is_premium=resource.is_premium,
            content_url=resource.content_url,
            preview_url=resource.preview_url,
            thumbnail_url=resource.thumbnail_url,
            tags=resource.tags,
            difficulty_level=resource.difficulty_level,
            estimated_time_minutes=resource.estimated_time_minutes,
            view_count=resource.view_count,
            download_count=resource.download_count,
            purchase_count=resource.purchase_count,
            rating=resource.rating,
            review_count=resource.review_count,
            slug=resource.slug,
            created_at=resource.created_at.isoformat(),
            updated_at=resource.updated_at.isoformat(),
            published_at=resource.published_at.isoformat() if resource.published_at else None
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/resources/{resource_id}/purchase", response_model=PurchaseResponse)
async def purchase_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Purchase a resource"""
    
    service = MarketplaceService(db)
    
    try:
        purchase = service.purchase_resource(
            user_id=current_user.id,
            resource_id=resource_id
        )
        
        return PurchaseResponse(
            id=purchase.id,
            user_id=purchase.user_id,
            resource_id=purchase.resource_id,
            amount_paid=purchase.amount_paid,
            currency=purchase.currency,
            status=purchase.status,
            download_count=purchase.download_count,
            purchased_at=purchase.purchased_at.isoformat()
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/purchases", response_model=List[PurchaseResponse])
async def get_purchases(
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's purchases"""
    
    service = MarketplaceService(db)
    purchases = service.get_user_purchases(current_user.id, limit=limit, offset=offset)
    
    return [
        PurchaseResponse(
            id=p.id,
            user_id=p.user_id,
            resource_id=p.resource_id,
            amount_paid=p.amount_paid,
            currency=p.currency,
            status=p.status,
            download_count=p.download_count,
            purchased_at=p.purchased_at.isoformat()
        )
        for p in purchases
    ]


@router.post("/resources/{resource_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    resource_id: str,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a review for a resource"""
    
    service = MarketplaceService(db)
    
    try:
        review = service.create_review(
            user_id=current_user.id,
            resource_id=resource_id,
            **review_data.model_dump()
        )
        
        return ReviewResponse(
            id=review.id,
            resource_id=review.resource_id,
            user_id=review.user_id,
            rating=review.rating,
            title=review.title,
            comment=review.comment,
            is_verified_purchase=review.is_verified_purchase,
            helpful_count=review.helpful_count,
            created_at=review.created_at.isoformat()
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/resources/{resource_id}/reviews", response_model=List[ReviewResponse])
async def get_reviews(
    resource_id: str,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get reviews for a resource"""
    
    service = MarketplaceService(db)
    reviews = service.get_resource_reviews(resource_id, limit=limit, offset=offset)
    
    return [
        ReviewResponse(
            id=r.id,
            resource_id=r.resource_id,
            user_id=r.user_id,
            rating=r.rating,
            title=r.title,
            comment=r.comment,
            is_verified_purchase=r.is_verified_purchase,
            helpful_count=r.helpful_count,
            created_at=r.created_at.isoformat()
        )
        for r in reviews
    ]


@router.post("/collections", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a resource collection"""
    
    service = MarketplaceService(db)
    
    try:
        collection = service.create_collection(
            creator_id=current_user.id,
            **collection_data.model_dump()
        )
        
        return CollectionResponse(
            id=collection.id,
            creator_id=collection.creator_id,
            title=collection.title,
            description=collection.description,
            resource_ids=collection.resource_ids,
            price=collection.price,
            discount_percentage=collection.discount_percentage,
            view_count=collection.view_count,
            purchase_count=collection.purchase_count,
            is_public=collection.is_public,
            is_featured=collection.is_featured,
            created_at=collection.created_at.isoformat()
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
