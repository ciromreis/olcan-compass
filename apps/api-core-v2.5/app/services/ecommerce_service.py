"""
E-Commerce Service

Business logic for marketplace e-commerce functionality:
- Product management (digital, physical, services)
- Shopping cart operations
- Order processing
- Service provider management
- Payment integration
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_
from datetime import datetime, timedelta
import uuid
import secrets

from ..models.ecommerce import (
    Product,
    ProductType,
    ProductCategory,
    ProductStatus,
    ServiceProvider,
    ServiceBooking,
    ServiceBookingStatus,
    ShoppingCart,
    CartItem,
    Order,
    OrderItem,
    OrderStatus,
    ProductReview,
    ShippingZone,
    Coupon
)


class EcommerceService:
    """Service for e-commerce operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ============================================================================
    # PRODUCT MANAGEMENT
    # ============================================================================
    
    def create_product(
        self,
        seller_id: str,
        name: str,
        description: str,
        product_type: ProductType,
        category: ProductCategory,
        price: float,
        **kwargs
    ) -> Product:
        """Create a new product listing"""
        
        # Generate slug
        slug = self._generate_slug(name)
        
        product = Product(
            id=str(uuid.uuid4()),
            seller_id=seller_id,
            name=name,
            description=description,
            product_type=product_type,
            category=category,
            price=price,
            slug=slug,
            **kwargs
        )
        
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        
        return product
    
    def get_products(
        self,
        product_type: Optional[ProductType] = None,
        category: Optional[ProductCategory] = None,
        status: ProductStatus = ProductStatus.ACTIVE,
        is_olcan_official: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        tags: Optional[List[str]] = None,
        sort_by: str = "created_at",
        limit: int = 50,
        offset: int = 0
    ) -> List[Product]:
        """Get products with filtering"""
        
        query = self.db.query(Product).filter(Product.status == status)
        
        if product_type:
            query = query.filter(Product.product_type == product_type)
        
        if category:
            query = query.filter(Product.category == category)
        
        if is_olcan_official is not None:
            query = query.filter(Product.is_olcan_official == is_olcan_official)
        
        if is_featured is not None:
            query = query.filter(Product.is_featured == is_featured)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                    Product.short_description.ilike(search_term)
                )
            )
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        if tags:
            # Filter products that have any of the specified tags
            for tag in tags:
                query = query.filter(Product.tags.contains([tag]))
        
        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "rating":
            query = query.order_by(Product.rating.desc())
        elif sort_by == "popular":
            query = query.order_by(Product.sales_count.desc())
        elif sort_by == "newest":
            query = query.order_by(Product.created_at.desc())
        else:
            query = query.order_by(Product.created_at.desc())
        
        products = query.offset(offset).limit(limit).all()
        
        return products
    
    def get_product(self, product_id: str, increment_views: bool = True) -> Optional[Product]:
        """Get product by ID"""
        
        product = self.db.query(Product).filter(Product.id == product_id).first()
        
        if product and increment_views:
            product.view_count += 1
            self.db.commit()
        
        return product
    
    def get_product_by_slug(self, slug: str, increment_views: bool = True) -> Optional[Product]:
        """Get product by slug"""
        
        product = self.db.query(Product).filter(Product.slug == slug).first()
        
        if product and increment_views:
            product.view_count += 1
            self.db.commit()
        
        return product
    
    def update_product(
        self,
        product_id: str,
        seller_id: str,
        updates: Dict[str, Any]
    ) -> Product:
        """Update product (seller only)"""
        
        product = self.db.query(Product).filter(
            Product.id == product_id,
            Product.seller_id == seller_id
        ).first()
        
        if not product:
            raise ValueError("Product not found or unauthorized")
        
        # Update allowed fields
        allowed_fields = [
            'name', 'description', 'short_description', 'price', 'compare_at_price',
            'stock_quantity', 'images', 'video_url', 'tags', 'meta_title', 'meta_description',
            'weight_kg', 'dimensions_cm', 'service_duration_minutes', 'service_delivery_days'
        ]
        
        for field in allowed_fields:
            if field in updates:
                setattr(product, field, updates[field])
        
        product.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(product)
        
        return product
    
    def publish_product(self, product_id: str, seller_id: str) -> Product:
        """Publish product to marketplace"""
        
        product = self.db.query(Product).filter(
            Product.id == product_id,
            Product.seller_id == seller_id
        ).first()
        
        if not product:
            raise ValueError("Product not found or unauthorized")
        
        product.status = ProductStatus.ACTIVE
        product.published_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(product)
        
        return product
    
    # ============================================================================
    # SHOPPING CART
    # ============================================================================
    
    def get_or_create_cart(self, user_id: str) -> ShoppingCart:
        """Get or create user's shopping cart"""
        
        cart = self.db.query(ShoppingCart).filter(ShoppingCart.user_id == user_id).first()
        
        if not cart:
            cart = ShoppingCart(
                id=str(uuid.uuid4()),
                user_id=user_id
            )
            self.db.add(cart)
            self.db.commit()
            self.db.refresh(cart)
        
        return cart
    
    def add_to_cart(
        self,
        user_id: str,
        product_id: str,
        quantity: int = 1,
        booking_date: Optional[datetime] = None,
        booking_notes: Optional[str] = None
    ) -> CartItem:
        """Add product to cart"""
        
        cart = self.get_or_create_cart(user_id)
        product = self.get_product(product_id, increment_views=False)
        
        if not product:
            raise ValueError("Product not found")
        
        if product.status != ProductStatus.ACTIVE:
            raise ValueError("Product not available")
        
        # Check if product already in cart
        existing_item = self.db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        ).first()
        
        if existing_item:
            existing_item.quantity += quantity
            existing_item.price_at_add = product.price
            self.db.commit()
            self.db.refresh(existing_item)
            return existing_item
        
        # Create new cart item
        cart_item = CartItem(
            id=str(uuid.uuid4()),
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity,
            price_at_add=product.price,
            booking_date=booking_date,
            booking_notes=booking_notes
        )
        
        self.db.add(cart_item)
        cart.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(cart_item)
        
        return cart_item
    
    def update_cart_item(
        self,
        user_id: str,
        cart_item_id: str,
        quantity: int
    ) -> CartItem:
        """Update cart item quantity"""
        
        cart = self.get_or_create_cart(user_id)
        
        cart_item = self.db.query(CartItem).filter(
            CartItem.id == cart_item_id,
            CartItem.cart_id == cart.id
        ).first()
        
        if not cart_item:
            raise ValueError("Cart item not found")
        
        if quantity <= 0:
            self.db.delete(cart_item)
        else:
            cart_item.quantity = quantity
        
        cart.updated_at = datetime.utcnow()
        self.db.commit()
        
        if quantity > 0:
            self.db.refresh(cart_item)
            return cart_item
        
        return None
    
    def remove_from_cart(self, user_id: str, cart_item_id: str) -> bool:
        """Remove item from cart"""
        
        cart = self.get_or_create_cart(user_id)
        
        cart_item = self.db.query(CartItem).filter(
            CartItem.id == cart_item_id,
            CartItem.cart_id == cart.id
        ).first()
        
        if not cart_item:
            raise ValueError("Cart item not found")
        
        self.db.delete(cart_item)
        cart.updated_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def clear_cart(self, user_id: str) -> bool:
        """Clear all items from cart"""
        
        cart = self.get_or_create_cart(user_id)
        
        self.db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        cart.updated_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def get_cart_total(self, user_id: str) -> Dict[str, Any]:
        """Calculate cart totals"""
        
        cart = self.get_or_create_cart(user_id)
        
        subtotal = 0.0
        item_count = 0
        
        for item in cart.items:
            subtotal += item.price_at_add * item.quantity
            item_count += item.quantity
        
        return {
            "subtotal": subtotal,
            "item_count": item_count,
            "tax": 0.0,  # TODO: Calculate based on location
            "shipping": 0.0,  # TODO: Calculate based on items and location
            "total": subtotal
        }
    
    # ============================================================================
    # ORDER PROCESSING
    # ============================================================================
    
    def create_order(
        self,
        user_id: str,
        shipping_address: Optional[Dict] = None,
        billing_address: Optional[Dict] = None,
        payment_method: str = "stripe",
        customer_notes: Optional[str] = None
    ) -> Order:
        """Create order from cart"""
        
        cart = self.get_or_create_cart(user_id)
        
        if not cart.items:
            raise ValueError("Cart is empty")
        
        # Calculate totals
        totals = self.get_cart_total(user_id)
        
        # Generate order number
        order_number = self._generate_order_number()
        
        # Create order
        order = Order(
            id=str(uuid.uuid4()),
            user_id=user_id,
            order_number=order_number,
            subtotal=totals['subtotal'],
            tax=totals['tax'],
            shipping_cost=totals['shipping'],
            total=totals['total'],
            payment_method=payment_method,
            shipping_address=shipping_address,
            billing_address=billing_address,
            customer_notes=customer_notes
        )
        
        self.db.add(order)
        self.db.flush()
        
        # Create order items from cart
        for cart_item in cart.items:
            order_item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                product_id=cart_item.product_id,
                product_name=cart_item.product.name,
                product_type=cart_item.product.product_type.value,
                quantity=cart_item.quantity,
                unit_price=cart_item.price_at_add,
                total_price=cart_item.price_at_add * cart_item.quantity
            )
            
            # Handle digital products
            if cart_item.product.product_type == ProductType.DIGITAL:
                order_item.download_url = cart_item.product.digital_file_url
                order_item.download_expires_at = datetime.utcnow() + timedelta(days=30)
            
            # Handle service bookings
            if cart_item.product.requires_booking and cart_item.booking_date:
                booking = ServiceBooking(
                    id=str(uuid.uuid4()),
                    provider_id=cart_item.product.seller_id,  # Assuming seller is provider
                    customer_id=user_id,
                    product_id=cart_item.product_id,
                    service_type=cart_item.product.category.value,
                    scheduled_at=cart_item.booking_date,
                    duration_minutes=cart_item.product.service_duration_minutes or 60,
                    price=cart_item.price_at_add,
                    notes=cart_item.booking_notes
                )
                self.db.add(booking)
                self.db.flush()
                order_item.booking_id = booking.id
            
            self.db.add(order_item)
            
            # Update product stats
            cart_item.product.sales_count += cart_item.quantity
            
            # Update inventory for physical products
            if cart_item.product.track_inventory:
                if cart_item.product.stock_quantity >= cart_item.quantity:
                    cart_item.product.stock_quantity -= cart_item.quantity
                else:
                    raise ValueError(f"Insufficient stock for {cart_item.product.name}")
        
        self.db.commit()
        self.db.refresh(order)
        
        # Clear cart after order creation
        self.clear_cart(user_id)
        
        return order
    
    def get_order(self, order_id: str, user_id: str) -> Optional[Order]:
        """Get order by ID"""
        
        order = self.db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()
        
        return order
    
    def get_user_orders(
        self,
        user_id: str,
        status: Optional[OrderStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Order]:
        """Get user's orders"""
        
        query = self.db.query(Order).filter(Order.user_id == user_id)
        
        if status:
            query = query.filter(Order.status == status)
        
        orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
        
        return orders
    
    def update_order_status(
        self,
        order_id: str,
        status: OrderStatus,
        tracking_number: Optional[str] = None
    ) -> Order:
        """Update order status (admin/seller)"""
        
        order = self.db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise ValueError("Order not found")
        
        order.status = status
        
        if tracking_number:
            order.tracking_number = tracking_number
        
        if status == OrderStatus.SHIPPED:
            order.shipped_at = datetime.utcnow()
        elif status == OrderStatus.DELIVERED:
            order.delivered_at = datetime.utcnow()
        elif status == OrderStatus.CANCELLED:
            order.cancelled_at = datetime.utcnow()
        
        order.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(order)
        
        return order
    
    # ============================================================================
    # SERVICE PROVIDERS
    # ============================================================================
    
    def create_service_provider(
        self,
        user_id: str,
        business_name: str,
        bio: str,
        **kwargs
    ) -> ServiceProvider:
        """Create service provider profile"""
        
        # Check if already exists
        existing = self.db.query(ServiceProvider).filter(
            ServiceProvider.user_id == user_id
        ).first()
        
        if existing:
            raise ValueError("Service provider profile already exists")
        
        provider = ServiceProvider(
            id=str(uuid.uuid4()),
            user_id=user_id,
            business_name=business_name,
            bio=bio,
            **kwargs
        )
        
        self.db.add(provider)
        self.db.commit()
        self.db.refresh(provider)
        
        return provider
    
    def get_service_providers(
        self,
        specializations: Optional[List[str]] = None,
        is_verified: Optional[bool] = None,
        min_rating: Optional[float] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[ServiceProvider]:
        """Get service providers with filtering"""
        
        query = self.db.query(ServiceProvider).filter(
            ServiceProvider.is_accepting_bookings == True
        )
        
        if is_verified is not None:
            query = query.filter(ServiceProvider.is_verified == is_verified)
        
        if min_rating:
            query = query.filter(ServiceProvider.rating >= min_rating)
        
        if specializations:
            for spec in specializations:
                query = query.filter(ServiceProvider.specializations.contains([spec]))
        
        providers = query.order_by(ServiceProvider.rating.desc()).offset(offset).limit(limit).all()
        
        return providers
    
    # ============================================================================
    # REVIEWS
    # ============================================================================
    
    def create_review(
        self,
        product_id: str,
        user_id: str,
        rating: int,
        title: Optional[str] = None,
        comment: Optional[str] = None,
        order_id: Optional[str] = None
    ) -> ProductReview:
        """Create product review"""
        
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        
        # Check if already reviewed
        existing = self.db.query(ProductReview).filter(
            ProductReview.product_id == product_id,
            ProductReview.user_id == user_id
        ).first()
        
        if existing:
            raise ValueError("Already reviewed this product")
        
        # Check if verified purchase
        is_verified = False
        if order_id:
            order = self.db.query(Order).filter(
                Order.id == order_id,
                Order.user_id == user_id
            ).first()
            if order:
                is_verified = any(item.product_id == product_id for item in order.items)
        
        review = ProductReview(
            id=str(uuid.uuid4()),
            product_id=product_id,
            user_id=user_id,
            order_id=order_id,
            rating=rating,
            title=title,
            comment=comment,
            is_verified_purchase=is_verified
        )
        
        self.db.add(review)
        
        # Update product rating
        product = self.get_product(product_id, increment_views=False)
        if product:
            total_rating = product.rating * product.review_count + rating
            product.review_count += 1
            product.rating = total_rating / product.review_count
        
        self.db.commit()
        self.db.refresh(review)
        
        return review
    
    # ============================================================================
    # HELPER METHODS
    # ============================================================================
    
    def _generate_slug(self, name: str) -> str:
        """Generate URL-friendly slug"""
        import re
        
        slug = name.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        
        # Ensure uniqueness
        base_slug = slug
        counter = 1
        while self.db.query(Product).filter(Product.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def _generate_order_number(self) -> str:
        """Generate unique order number"""
        import time
        
        timestamp = int(time.time())
        random_part = secrets.token_hex(4).upper()
        order_number = f"ORD-{timestamp}-{random_part}"
        
        return order_number
