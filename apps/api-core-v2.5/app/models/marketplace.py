"""
Marketplace models for Olcan Compass v2.5
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Profile information
    name = Column(String, nullable=False)
    bio = Column(Text)
    avatar = Column(String)
    
    # Professional details
    specialties = Column(JSON, default=[])  # List of specialty categories
    languages = Column(JSON, default=[])
    country = Column(String)
    timezone = Column(String)
    
    # Verification and ratings
    verified = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_accepting_clients = Column(Boolean, default=True)
    
    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    services = relationship("Service", back_populates="provider", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="provider", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Provider {self.name}>"


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    
    # Service details
    title = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration = Column(Integer)  # Duration in minutes
    
    # Service type and category
    service_type = Column(String)  # coaching, consulting, mentoring, etc.
    category = Column(String)
    
    # Availability
    is_active = Column(Boolean, default=True)
    max_bookings_per_week = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    provider = relationship("Provider", back_populates="services")
    
    def __repr__(self):
        return f"<Service {self.title}>"


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"))
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text)
    
    # Review metadata
    is_verified_purchase = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    provider = relationship("Provider", back_populates="reviews")
    user = relationship("User")
    service = relationship("Service")
    
    def __repr__(self):
        return f"<Review {self.id} - {self.rating} stars>"


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    
    # Conversation metadata
    subject = Column(String)
    status = Column(String, default="active")  # active, archived, closed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_message_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User")
    provider = relationship("Provider")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conversation {self.id}>"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Message content
    content = Column(Text, nullable=False)
    attachments = Column(JSON, default=[])
    
    # Message status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User")
    
    def __repr__(self):
        return f"<Message {self.id}>"
