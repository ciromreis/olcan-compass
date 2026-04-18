"""
Database models for Olcan Compass v2.5
"""

from app.db.models.user import User
from app.models.archetype import Archetype, Ability, EvolutionRequirement, ArchetypeStats
from app.db.models.companion import Companion, CompanionActivity, CompanionEvolution, CompanionMessage, CompanionMood, CompanionActivityType
from app.db.models.marketplace import ProviderProfile, ServiceListing, Review, Conversation, Message
from app.db.models.task import UserProgress, Achievement, UserAchievement
from app.db.models.quest import QuestTemplate as Quest, UserQuest
from app.db.models.guild import Guild, GuildMember, GuildEvent
# from app.models.ecommerce import (
#     Product, ServiceProvider, ServiceBooking, ShoppingCart, CartItem,
#     Order, OrderItem, ProductReview, ShippingZone, Coupon,
#     ProductType, ProductCategory, ProductStatus, OrderStatus, ServiceBookingStatus
# )

__all__ = [
    "User",
    "Archetype",
    "Ability",
    "EvolutionRequirement",
    "ArchetypeStats",
    "Companion",
    "CompanionActivity",
    "CompanionEvolution",
    "CompanionMessage",
    "CompanionMood",
    "CompanionActivityType",
    "ProviderProfile",
    "ServiceListing",
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
    # E-Commerce Models (commented out - not in new db/models)
    # "Product",
    # "ServiceProvider",
    # "ServiceBooking",
    # "ShoppingCart",
    # "CartItem",
    # "Order",
    # "OrderItem",
    # "ProductReview",
    # "ShippingZone",
    # "Coupon",
    # "ProductType",
    # "ProductCategory",
    # "ProductStatus",
    # "OrderStatus",
    # "ServiceBookingStatus",
]
