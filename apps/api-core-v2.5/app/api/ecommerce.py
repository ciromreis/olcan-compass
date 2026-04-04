"""
E-Commerce API

Public and authenticated endpoints for marketplace e-commerce.
Supports website integration for public product browsing.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from ..core.database import get_db
from ..core.auth import get_current_user, get_optional_user
from ..models.user import User
from ..models.ecommerce import (
    ProductType, ProductCategory, ProductStatus,
    OrderStatus, ServiceBookingStatus
)
from ..services.ecommerce_service import EcommerceService

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


# ============================================================================
# SCHEMAS
# ============================================================================

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    short_description: Optional[str] = Field(None, max_length=500)
    product_type: ProductType
    category: ProductCategory
    price: float = Field(..., ge=0)
    compare_at_price: Optional[float] = None
    
    # Physical product fields
    requires_shipping: bool = False
    weight_kg: Optional[float] = None
    dimensions_cm: Optional[dict] = None
    stock_quantity: int = 0
    track_inventory: bool = False
    
    # Digital product fields
    digital_file_url: Optional[str] = None
    download_limit: Optional[int] = None
    
    # Service fields
    service_duration_minutes: Optional[int] = None
    service_delivery_days: Optional[int] = None
    requires_booking: bool = False
    
    # Media
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    
    # Metadata
    tags: Optional[List[str]] = None
    is_olcan_official: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    compare_at_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    tags: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    seller_id: str
    name: str
    description: str
    short_description: Optional[str]
    product_type: ProductType
    category: ProductCategory
    status: ProductStatus
    price: float
    compare_at_price: Optional[float]
    currency: str
    slug: str
    images: Optional[List[str]]
    video_url: Optional[str]
    tags: Optional[List[str]]
    rating: float
    review_count: int
    sales_count: int
    view_count: int
    is_featured: bool
    is_olcan_official: bool
    is_bestseller: bool
    is_new: bool
    requires_shipping: bool
    stock_quantity: int
    created_at: str
    
    class Config:
        from_attributes = True


class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1)
    booking_date: Optional[datetime] = None
    booking_notes: Optional[str] = None


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    price_at_add: float
    booking_date: Optional[str]
    added_at: str
    
    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    subtotal: float
    item_count: int
    tax: float
    shipping: float
    total: float


class OrderCreate(BaseModel):
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    payment_method: str = "stripe"
    customer_notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    order_number: str
    status: OrderStatus
    subtotal: float
    tax: float
    shipping_cost: float
    discount: float
    total: float
    currency: str
    payment_status: str
    tracking_number: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=200)
    comment: Optional[str] = Field(None, max_length=2000)
    order_id: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    rating: int
    title: Optional[str]
    comment: Optional[str]
    is_verified_purchase: bool
    helpful_count: int
    created_at: str
    
    class Config:
        from_attributes = True


class ServiceProviderCreate(BaseModel):
    business_name: str = Field(..., min_length=3, max_length=200)
    bio: str = Field(..., min_length=50)
    specializations: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    certifications: Optional[List[dict]] = None
    years_experience: Optional[int] = None
    hourly_rate: Optional[float] = None


class ServiceProviderResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    bio: str
    specializations: Optional[List[str]]
    languages: Optional[List[str]]
    years_experience: Optional[int]
    hourly_rate: Optional[float]
    rating: float
    review_count: int
    total_bookings: int
    is_verified: bool
    is_accepting_bookings: bool
    
    class Config:
        from_attributes = True


# ============================================================================
# PUBLIC PRODUCT ENDPOINTS (Website Integration)
# ============================================================================

@router.get("/products/public", response_model=List[ProductResponse])
async def get_public_products(
    product_type: Optional[ProductType] = None,
    category: Optional[ProductCategory] = None,
    is_olcan_official: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    tags: Optional[List[str]] = Query(None),
    sort_by: str = Query(default="newest"),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get public products (accessible from website without auth).
    Perfect for showcasing Olcan infoproducts on the main website.
    """
    
    service = EcommerceService(db)
    
    products = service.get_products(
        product_type=product_type,
        category=category,
        status=ProductStatus.ACTIVE,
        is_olcan_official=is_olcan_official,
        is_featured=is_featured,
        search=search,
        min_price=min_price,
        max_price=max_price,
        tags=tags,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    
    return [
        ProductResponse(
            id=p.id,
            seller_id=p.seller_id,
            name=p.name,
            description=p.description,
            short_description=p.short_description,
            product_type=p.product_type,
            category=p.category,
            status=p.status,
            price=p.price,
            compare_at_price=p.compare_at_price,
            currency=p.currency,
            slug=p.slug,
            images=p.images,
            video_url=p.video_url,
            tags=p.tags,
            rating=p.rating,
            review_count=p.review_count,
            sales_count=p.sales_count,
            view_count=p.view_count,
            is_featured=p.is_featured,
            is_olcan_official=p.is_olcan_official,
            is_bestseller=p.is_bestseller,
            is_new=p.is_new,
            requires_shipping=p.requires_shipping,
            stock_quantity=p.stock_quantity,
            created_at=p.created_at.isoformat()
        )
        for p in products
    ]


@router.get("/products/public/{slug}", response_model=ProductResponse)
async def get_public_product_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get product by slug (public, for website integration).
    Increments view count.
    """
    
    service = EcommerceService(db)
    product = service.get_product_by_slug(slug, increment_views=True)
    
    if not product or product.status != ProductStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return ProductResponse(
        id=product.id,
        seller_id=product.seller_id,
        name=product.name,
        description=product.description,
        short_description=product.short_description,
        product_type=product.product_type,
        category=product.category,
        status=product.status,
        price=product.price,
        compare_at_price=product.compare_at_price,
        currency=product.currency,
        slug=product.slug,
        images=product.images,
        video_url=product.video_url,
        tags=product.tags,
        rating=product.rating,
        review_count=product.review_count,
        sales_count=product.sales_count,
        view_count=product.view_count,
        is_featured=product.is_featured,
        is_olcan_official=product.is_olcan_official,
        is_bestseller=product.is_bestseller,
        is_new=product.is_new,
        requires_shipping=product.requires_shipping,
        stock_quantity=product.stock_quantity,
        created_at=product.created_at.isoformat()
    )


@router.get("/products/public/featured", response_model=List[ProductResponse])
async def get_featured_products(
    limit: int = Query(default=10, le=50),
    db: Session = Depends(get_db)
):
    """Get featured products for website homepage"""
    
    service = EcommerceService(db)
    
    products = service.get_products(
        status=ProductStatus.ACTIVE,
        is_featured=True,
        sort_by="popular",
        limit=limit
    )
    
    return [
        ProductResponse(
            id=p.id,
            seller_id=p.seller_id,
            name=p.name,
            description=p.description,
            short_description=p.short_description,
            product_type=p.product_type,
            category=p.category,
            status=p.status,
            price=p.price,
            compare_at_price=p.compare_at_price,
            currency=p.currency,
            slug=p.slug,
            images=p.images,
            video_url=p.video_url,
            tags=p.tags,
            rating=p.rating,
            review_count=p.review_count,
            sales_count=p.sales_count,
            view_count=p.view_count,
            is_featured=p.is_featured,
            is_olcan_official=p.is_olcan_official,
            is_bestseller=p.is_bestseller,
            is_new=p.is_new,
            requires_shipping=p.requires_shipping,
            stock_quantity=p.stock_quantity,
            created_at=p.created_at.isoformat()
        )
        for p in products
    ]


@router.get("/products/public/olcan-official", response_model=List[ProductResponse])
async def get_olcan_official_products(
    category: Optional[ProductCategory] = None,
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db)
):
    """Get official Olcan infoproducts for website showcase"""
    
    service = EcommerceService(db)
    
    products = service.get_products(
        status=ProductStatus.ACTIVE,
        is_olcan_official=True,
        category=category,
        sort_by="popular",
        limit=limit
    )
    
    return [
        ProductResponse(
            id=p.id,
            seller_id=p.seller_id,
            name=p.name,
            description=p.description,
            short_description=p.short_description,
            product_type=p.product_type,
            category=p.category,
            status=p.status,
            price=p.price,
            compare_at_price=p.compare_at_price,
            currency=p.currency,
            slug=p.slug,
            images=p.images,
            video_url=p.video_url,
            tags=p.tags,
            rating=p.rating,
            review_count=p.review_count,
            sales_count=p.sales_count,
            view_count=p.view_count,
            is_featured=p.is_featured,
            is_olcan_official=p.is_olcan_official,
            is_bestseller=p.is_bestseller,
            is_new=p.is_new,
            requires_shipping=p.requires_shipping,
            stock_quantity=p.stock_quantity,
            created_at=p.created_at.isoformat()
        )
        for p in products
    ]


# ============================================================================
# AUTHENTICATED PRODUCT ENDPOINTS (Compass App)
# ============================================================================

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new product listing (sellers only)"""
    
    service = EcommerceService(db)
    
    product = service.create_product(
        seller_id=current_user.id,
        **product_data.model_dump()
    )
    
    return ProductResponse(
        id=product.id,
        seller_id=product.seller_id,
        name=product.name,
        description=product.description,
        short_description=product.short_description,
        product_type=product.product_type,
        category=product.category,
        status=product.status,
        price=product.price,
        compare_at_price=product.compare_at_price,
        currency=product.currency,
        slug=product.slug,
        images=product.images,
        video_url=product.video_url,
        tags=product.tags,
        rating=product.rating,
        review_count=product.review_count,
        sales_count=product.sales_count,
        view_count=product.view_count,
        is_featured=product.is_featured,
        is_olcan_official=product.is_olcan_official,
        is_bestseller=product.is_bestseller,
        is_new=product.is_new,
        requires_shipping=product.requires_shipping,
        stock_quantity=product.stock_quantity,
        created_at=product.created_at.isoformat()
    )


@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    product_type: Optional[ProductType] = None,
    category: Optional[ProductCategory] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    tags: Optional[List[str]] = Query(None),
    sort_by: str = Query(default="newest"),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get products (authenticated, full access in Compass app)"""
    
    service = EcommerceService(db)
    
    products = service.get_products(
        product_type=product_type,
        category=category,
        status=ProductStatus.ACTIVE,
        search=search,
        min_price=min_price,
        max_price=max_price,
        tags=tags,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    
    return [
        ProductResponse(
            id=p.id,
            seller_id=p.seller_id,
            name=p.name,
            description=p.description,
            short_description=p.short_description,
            product_type=p.product_type,
            category=p.category,
            status=p.status,
            price=p.price,
            compare_at_price=p.compare_at_price,
            currency=p.currency,
            slug=p.slug,
            images=p.images,
            video_url=p.video_url,
            tags=p.tags,
            rating=p.rating,
            review_count=p.review_count,
            sales_count=p.sales_count,
            view_count=p.view_count,
            is_featured=p.is_featured,
            is_olcan_official=p.is_olcan_official,
            is_bestseller=p.is_bestseller,
            is_new=p.is_new,
            requires_shipping=p.requires_shipping,
            stock_quantity=p.stock_quantity,
            created_at=p.created_at.isoformat()
        )
        for p in products
    ]


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get product by ID"""
    
    service = EcommerceService(db)
    product = service.get_product(product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return ProductResponse(
        id=product.id,
        seller_id=product.seller_id,
        name=product.name,
        description=product.description,
        short_description=product.short_description,
        product_type=product.product_type,
        category=product.category,
        status=product.status,
        price=product.price,
        compare_at_price=product.compare_at_price,
        currency=product.currency,
        slug=product.slug,
        images=product.images,
        video_url=product.video_url,
        tags=product.tags,
        rating=product.rating,
        review_count=product.review_count,
        sales_count=product.sales_count,
        view_count=product.view_count,
        is_featured=product.is_featured,
        is_olcan_official=product.is_olcan_official,
        is_bestseller=product.is_bestseller,
        is_new=product.is_new,
        requires_shipping=product.requires_shipping,
        stock_quantity=product.stock_quantity,
        created_at=product.created_at.isoformat()
    )


@router.patch("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    updates: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update product (seller only)"""
    
    service = EcommerceService(db)
    
    try:
        product = service.update_product(
            product_id=product_id,
            seller_id=current_user.id,
            updates=updates.model_dump(exclude_unset=True)
        )
        
        return ProductResponse(
            id=product.id,
            seller_id=product.seller_id,
            name=product.name,
            description=product.description,
            short_description=product.short_description,
            product_type=product.product_type,
            category=product.category,
            status=product.status,
            price=product.price,
            compare_at_price=product.compare_at_price,
            currency=product.currency,
            slug=product.slug,
            images=product.images,
            video_url=product.video_url,
            tags=product.tags,
            rating=product.rating,
            review_count=product.review_count,
            sales_count=product.sales_count,
            view_count=product.view_count,
            is_featured=product.is_featured,
            is_olcan_official=product.is_olcan_official,
            is_bestseller=product.is_bestseller,
            is_new=product.is_new,
            requires_shipping=product.requires_shipping,
            stock_quantity=product.stock_quantity,
            created_at=product.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.post("/products/{product_id}/publish", response_model=ProductResponse)
async def publish_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Publish product to marketplace"""
    
    service = EcommerceService(db)
    
    try:
        product = service.publish_product(product_id, current_user.id)
        
        return ProductResponse(
            id=product.id,
            seller_id=product.seller_id,
            name=product.name,
            description=product.description,
            short_description=product.short_description,
            product_type=product.product_type,
            category=product.category,
            status=product.status,
            price=product.price,
            compare_at_price=product.compare_at_price,
            currency=product.currency,
            slug=product.slug,
            images=product.images,
            video_url=product.video_url,
            tags=product.tags,
            rating=product.rating,
            review_count=product.review_count,
            sales_count=product.sales_count,
            view_count=product.view_count,
            is_featured=product.is_featured,
            is_olcan_official=product.is_olcan_official,
            is_bestseller=product.is_bestseller,
            is_new=product.is_new,
            requires_shipping=product.requires_shipping,
            stock_quantity=product.stock_quantity,
            created_at=product.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


# ============================================================================
# SHOPPING CART ENDPOINTS
# ============================================================================

@router.get("/cart", response_model=CartResponse)
async def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's shopping cart"""
    
    service = EcommerceService(db)
    cart = service.get_or_create_cart(current_user.id)
    totals = service.get_cart_total(current_user.id)
    
    return CartResponse(
        id=cart.id,
        items=[
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_add=item.price_at_add,
                booking_date=item.booking_date.isoformat() if item.booking_date else None,
                added_at=item.added_at.isoformat()
            )
            for item in cart.items
        ],
        **totals
    )


@router.post("/cart/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add item to cart"""
    
    service = EcommerceService(db)
    
    try:
        cart_item = service.add_to_cart(
            user_id=current_user.id,
            **item_data.model_dump()
        )
        
        return CartItemResponse(
            id=cart_item.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price_at_add=cart_item.price_at_add,
            booking_date=cart_item.booking_date.isoformat() if cart_item.booking_date else None,
            added_at=cart_item.added_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/cart/items/{cart_item_id}", response_model=CartItemResponse)
async def update_cart_item(
    cart_item_id: str,
    update_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update cart item quantity"""
    
    service = EcommerceService(db)
    
    try:
        cart_item = service.update_cart_item(
            user_id=current_user.id,
            cart_item_id=cart_item_id,
            quantity=update_data.quantity
        )
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item removed"
            )
        
        return CartItemResponse(
            id=cart_item.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price_at_add=cart_item.price_at_add,
            booking_date=cart_item.booking_date.isoformat() if cart_item.booking_date else None,
            added_at=cart_item.added_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/cart/items/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    cart_item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove item from cart"""
    
    service = EcommerceService(db)
    
    try:
        service.remove_from_cart(current_user.id, cart_item_id)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear all items from cart"""
    
    service = EcommerceService(db)
    service.clear_cart(current_user.id)
    return None


# ============================================================================
# ORDER ENDPOINTS
# ============================================================================

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create order from cart"""
    
    service = EcommerceService(db)
    
    try:
        order = service.create_order(
            user_id=current_user.id,
            **order_data.model_dump()
        )
        
        return OrderResponse(
            id=order.id,
            order_number=order.order_number,
            status=order.status,
            subtotal=order.subtotal,
            tax=order.tax,
            shipping_cost=order.shipping_cost,
            discount=order.discount,
            total=order.total,
            currency=order.currency,
            payment_status=order.payment_status,
            tracking_number=order.tracking_number,
            created_at=order.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[OrderStatus] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's orders"""
    
    service = EcommerceService(db)
    
    orders = service.get_user_orders(
        user_id=current_user.id,
        status=status,
        limit=limit,
        offset=offset
    )
    
    return [
        OrderResponse(
            id=o.id,
            order_number=o.order_number,
            status=o.status,
            subtotal=o.subtotal,
            tax=o.tax,
            shipping_cost=o.shipping_cost,
            discount=o.discount,
            total=o.total,
            currency=o.currency,
            payment_status=o.payment_status,
            tracking_number=o.tracking_number,
            created_at=o.created_at.isoformat()
        )
        for o in orders
    ]


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get order details"""
    
    service = EcommerceService(db)
    order = service.get_order(order_id, current_user.id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        subtotal=order.subtotal,
        tax=order.tax,
        shipping_cost=order.shipping_cost,
        discount=order.discount,
        total=order.total,
        currency=order.currency,
        payment_status=order.payment_status,
        tracking_number=order.tracking_number,
        created_at=order.created_at.isoformat()
    )


# ============================================================================
# REVIEW ENDPOINTS
# ============================================================================

@router.post("/products/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: str,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create product review"""
    
    service = EcommerceService(db)
    
    try:
        review = service.create_review(
            product_id=product_id,
            user_id=current_user.id,
            **review_data.model_dump()
        )
        
        return ReviewResponse(
            id=review.id,
            product_id=review.product_id,
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


# ============================================================================
# SERVICE PROVIDER ENDPOINTS
# ============================================================================

@router.post("/service-providers", response_model=ServiceProviderResponse, status_code=status.HTTP_201_CREATED)
async def create_service_provider(
    provider_data: ServiceProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create service provider profile"""
    
    service = EcommerceService(db)
    
    try:
        provider = service.create_service_provider(
            user_id=current_user.id,
            **provider_data.model_dump()
        )
        
        return ServiceProviderResponse(
            id=provider.id,
            user_id=provider.user_id,
            business_name=provider.business_name,
            bio=provider.bio,
            specializations=provider.specializations,
            languages=provider.languages,
            years_experience=provider.years_experience,
            hourly_rate=provider.hourly_rate,
            rating=provider.rating,
            review_count=provider.review_count,
            total_bookings=provider.total_bookings,
            is_verified=provider.is_verified,
            is_accepting_bookings=provider.is_accepting_bookings
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/service-providers", response_model=List[ServiceProviderResponse])
async def get_service_providers(
    specializations: Optional[List[str]] = Query(None),
    is_verified: Optional[bool] = None,
    min_rating: Optional[float] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get service providers"""
    
    service = EcommerceService(db)
    
    providers = service.get_service_providers(
        specializations=specializations,
        is_verified=is_verified,
        min_rating=min_rating,
        limit=limit,
        offset=offset
    )
    
    return [
        ServiceProviderResponse(
            id=p.id,
            user_id=p.user_id,
            business_name=p.business_name,
            bio=p.bio,
            specializations=p.specializations,
            languages=p.languages,
            years_experience=p.years_experience,
            hourly_rate=p.hourly_rate,
            rating=p.rating,
            review_count=p.review_count,
            total_bookings=p.total_bookings,
            is_verified=p.is_verified,
            is_accepting_bookings=p.is_accepting_bookings
        )
        for p in providers
    ]
