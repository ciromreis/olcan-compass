"""
User model for Olcan Compass v2.5
Compatible with existing database structure
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

try:
    from app.core.database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    
    # Profile information
    avatar_url = Column(String)
    bio = Column(String)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    
    # Preferences
    preferences = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships - Commented out due to ID type mismatch with ecommerce models
    # service_provider = relationship("ServiceProvider", back_populates="user", uselist=False, lazy="selectin")
    # shopping_cart = relationship("ShoppingCart", back_populates="user", uselist=False, lazy="selectin")
    # orders = relationship("Order", back_populates="user", lazy="selectin")
    
    def __repr__(self):
        return f"<User {self.username}>"
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "level": self.level,
            "xp": self.xp,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "is_premium": self.is_premium,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
