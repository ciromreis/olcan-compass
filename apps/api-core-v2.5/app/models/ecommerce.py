"""
E-Commerce Models

Enhanced marketplace models for full e-commerce functionality:
- Physical products with shipping
- Service providers and bookings
- Shopping cart and orders
- Payment processing
- Inventory management
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

try:
    from app.core.database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


class ProductType(str, enum.Enum):
    """Types of marketplace products"""
    DIGITAL = "digital"  # E-books, templates, courses
    PHYSICAL = "physical"  # Travel adapters, books, merchandise
    SERVICE = "service"  # Translation, resume review, coaching
    HYBRID = "hybrid"  # Course with physical materials


class ProductCategory(str, enum.Enum):
    """Product categories for international career"""
    # Digital Products
    CAREER_GUIDES = "career_guides"
    INTERVIEW_PREP = "interview_prep"
    RESUME_TEMPLATES = "resume_templates"
    COURSES = "courses"
    
    # Services
    TRANSLATION = "translation"
    DOCUMENT_REVIEW = "document_review"
    CAREER_COACHING = "career_coaching"
    VISA_CONSULTING = "visa_consulting"
    RELOCATION_SUPPORT = "relocation_support"
    
    # Physical Products
    TRAVEL_ESSENTIALS = "travel_essentials"
    BOOKS = "books"
    STATIONERY = "stationery"
    TECH_ACCESSORIES = "tech_accessories"
    
    # Hybrid
    CERTIFICATION_PROGRAMS = "certification_programs"


class ProductStatus(str, enum.Enum):
    """Product listing status"""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"


class OrderStatus(str, enum.Enum):
    """Order processing status"""
    PENDING = "pending"
    PAYMENT_PROCESSING = "payment_processing"
    PAID = "paid"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class ServiceBookingStatus(str, enum.Enum):
    """Service booking status"""
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Product(Base):
    """Marketplace product (digital, physical, or service)"""
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Product info
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=True)
    product_type = Column(SQLEnum(ProductType), nullable=False)
    category = Column(SQLEnum(ProductCategory), nullable=False)
    status = Column(SQLEnum(ProductStatus), default=ProductStatus.DRAFT)
    
    # Pricing
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)  # Original price for discounts
    currency = Column(String, default="USD")
    
    # Inventory (for physical products)
    sku = Column(String, unique=True, nullable=True)
    stock_quantity = Column(Integer, default=0)
    track_inventory = Column(Boolean, default=False)
    allow_backorder = Column(Boolean, default=False)
    
    # Shipping (for physical products)
    requires_shipping = Column(Boolean, default=False)
    weight_kg = Column(Float, nullable=True)
    dimensions_cm = Column(JSON, nullable=True)  # {"length": 10, "width": 5, "height": 2}
    shipping_class = Column(String, nullable=True)  # standard, express, international
    
    # Digital delivery
    digital_file_url = Column(String, nullable=True)
    download_limit = Column(Integer, nullable=True)
    license_type = Column(String, nullable=True)  # single, multi, unlimited
    
    # Service details
    service_duration_minutes = Column(Integer, nullable=True)
    service_delivery_days = Column(Integer, nullable=True)
    requires_booking = Column(Boolean, default=False)
    
    # Media
    images = Column(JSON, nullable=True)  # ["url1", "url2", "url3"]
    video_url = Column(String, nullable=True)
    
    # SEO & Discovery
    slug = Column(String, unique=True, nullable=False)
    tags = Column(JSON, nullable=True)
    meta_title = Column(String, nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # Stats
    view_count = Column(Integer, default=0)
    sales_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    # Flags
    is_featured = Column(Boolean, default=False)
    is_olcan_official = Column(Boolean, default=False)  # Official Olcan products
    is_bestseller = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[seller_id])
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")


class ServiceProvider(Base):
    """Service provider profile"""
    __tablename__ = "service_providers"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Provider info
    business_name = Column(String, nullable=False)
    bio = Column(Text, nullable=False)
    specializations = Column(JSON, nullable=True)  # ["translation", "resume_review"]
    languages = Column(JSON, nullable=True)  # ["en", "pt", "es"]
    
    # Credentials
    certifications = Column(JSON, nullable=True)
    years_experience = Column(Integer, nullable=True)
    education = Column(JSON, nullable=True)
    
    # Availability
    timezone = Column(String, nullable=True)
    available_hours = Column(JSON, nullable=True)  # {"monday": ["09:00-17:00"], ...}
    booking_buffer_hours = Column(Integer, default=24)
    
    # Pricing
    hourly_rate = Column(Float, nullable=True)
    minimum_booking_hours = Column(Float, default=1.0)
    
    # Stats
    total_bookings = Column(Integer, default=0)
    completed_bookings = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    response_time_hours = Column(Float, nullable=True)
    
    # Status
    is_verified = Column(Boolean, default=False)
    is_accepting_bookings = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="noload")
    bookings = relationship("ServiceBooking", back_populates="provider")


class ServiceBooking(Base):
    """Service booking/appointment"""
    __tablename__ = "service_bookings"

    id = Column(String, primary_key=True)
    provider_id = Column(String, ForeignKey("service_providers.id"), nullable=False)
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    
    # Booking details
    service_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    
    # Pricing
    price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    
    # Status
    status = Column(SQLEnum(ServiceBookingStatus), default=ServiceBookingStatus.REQUESTED)
    
    # Delivery
    deliverables = Column(JSON, nullable=True)  # Files, documents, etc.
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    provider = relationship("ServiceProvider", back_populates="bookings")
    customer = relationship("User", foreign_keys=[customer_id])
    product = relationship("Product")


class ShoppingCart(Base):
    """User shopping cart"""
    __tablename__ = "shopping_carts"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # user = relationship("User", back_populates="shopping_cart")  # viewonly on User side
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    """Item in shopping cart"""
    __tablename__ = "cart_items"

    id = Column(String, primary_key=True)
    cart_id = Column(String, ForeignKey("shopping_carts.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    
    # Item details
    quantity = Column(Integer, default=1)
    price_at_add = Column(Float, nullable=False)  # Price when added to cart
    
    # Service booking details (if applicable)
    booking_date = Column(DateTime, nullable=True)
    booking_notes = Column(Text, nullable=True)
    
    # Timestamps
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cart = relationship("ShoppingCart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    """Customer order"""
    __tablename__ = "orders"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    order_number = Column(String, unique=True, nullable=False)
    
    # Pricing
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    
    # Payment
    payment_method = Column(String, nullable=True)  # stripe, paypal, etc.
    payment_intent_id = Column(String, nullable=True)
    payment_status = Column(String, default="pending")
    paid_at = Column(DateTime, nullable=True)
    
    # Shipping
    shipping_address = Column(JSON, nullable=True)
    billing_address = Column(JSON, nullable=True)
    shipping_method = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    
    # Status
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    
    # Notes
    customer_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    # user = relationship("User", back_populates="orders")  # viewonly on User side
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Item in an order"""
    __tablename__ = "order_items"

    id = Column(String, primary_key=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    
    # Item details
    product_name = Column(String, nullable=False)  # Snapshot at purchase
    product_type = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Digital delivery
    download_url = Column(String, nullable=True)
    download_count = Column(Integer, default=0)
    download_expires_at = Column(DateTime, nullable=True)
    
    # Service booking
    booking_id = Column(String, ForeignKey("service_bookings.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    booking = relationship("ServiceBooking")


class ProductReview(Base):
    """Product review"""
    __tablename__ = "product_reviews"

    id = Column(String, primary_key=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String, nullable=True)
    comment = Column(Text, nullable=True)
    
    # Media
    images = Column(JSON, nullable=True)
    
    # Metadata
    is_verified_purchase = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User")
    order = relationship("Order")


class ShippingZone(Base):
    """Shipping zones and rates"""
    __tablename__ = "shipping_zones"

    id = Column(String, primary_key=True)
    
    # Zone info
    name = Column(String, nullable=False)
    countries = Column(JSON, nullable=False)  # ["US", "CA", "MX"]
    
    # Rates
    rates = Column(JSON, nullable=False)  # [{"method": "standard", "price": 5.99, "days": "5-7"}, ...]
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Coupon(Base):
    """Discount coupons"""
    __tablename__ = "coupons"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    
    # Discount
    discount_type = Column(String, nullable=False)  # percentage, fixed
    discount_value = Column(Float, nullable=False)
    
    # Constraints
    minimum_purchase = Column(Float, nullable=True)
    maximum_discount = Column(Float, nullable=True)
    usage_limit = Column(Integer, nullable=True)
    usage_count = Column(Integer, default=0)
    
    # Applicability
    applicable_products = Column(JSON, nullable=True)  # Product IDs
    applicable_categories = Column(JSON, nullable=True)
    
    # Validity
    starts_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
