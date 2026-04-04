"""
Database models for Olcan Compass v2.5
"""

from app.models.user import User
from app.models.archetype import Archetype, Ability, EvolutionRequirement, ArchetypeStats
from app.models.companion import Companion, CompanionActivity, CompanionBattle, CompanionEvolution, CompanionCustomization
from app.models.marketplace import Provider, Service, Review, Conversation, Message
from app.models.progress import UserProgress, Achievement, Quest, UserAchievement, UserQuest
from app.models.guild import Guild, GuildMember, GuildEvent
from app.models.ecommerce import (
    Product, ServiceProvider, ServiceBooking, ShoppingCart, CartItem,
    Order, OrderItem, ProductReview, ShippingZone, Coupon,
    ProductType, ProductCategory, ProductStatus, OrderStatus, ServiceBookingStatus
)

__all__ = [
    "User",
    "Archetype",
    "Ability",
    "EvolutionRequirement",
    "ArchetypeStats",
    "Companion",
    "CompanionActivity",
    "CompanionBattle",
    "CompanionEvolution",
    "CompanionCustomization",
    "Provider",
    "Service",
    "Review",
    "Conversation",
    "Message",
    "UserProgress",
    "Achievement",
    "Quest",
    "UserAchievement",
    "UserQuest",
    "Guild",
    "GuildMember",
    "GuildEvent",
    # E-Commerce Models
    "Product",
    "ServiceProvider",
    "ServiceBooking",
    "ShoppingCart",
    "CartItem",
    "Order",
    "OrderItem",
    "ProductReview",
    "ShippingZone",
    "Coupon",
    "ProductType",
    "ProductCategory",
    "ProductStatus",
    "OrderStatus",
    "ServiceBookingStatus",
]
