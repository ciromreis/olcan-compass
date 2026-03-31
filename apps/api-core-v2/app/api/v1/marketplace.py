"""
Marketplace endpoints for Olcan Compass v2.5
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.marketplace import Provider, Service, Review, Conversation, Message

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


@router.post("/providers", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_provider(
    name: str,
    bio: str,
    specialties: List[str],
    languages: List[str],
    country: str,
    timezone: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new provider profile"""
    # Check if user already has a provider profile
    result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    existing_provider = result.scalar_one_or_none()
    
    if existing_provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a provider profile"
        )
    
    # Create provider
    provider = Provider(
        user_id=current_user.id,
        name=name,
        bio=bio,
        specialties=specialties,
        languages=languages,
        country=country,
        timezone=timezone,
        avatar=current_user.avatar_url,
        verified=False,
        rating=0.0,
        review_count=0,
        is_active=True,
        is_accepting_clients=True
    )
    
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    
    return {
        "id": provider.id,
        "name": provider.name,
        "bio": provider.bio,
        "specialties": provider.specialties,
        "languages": provider.languages,
        "country": provider.country,
        "timezone": provider.timezone,
        "verified": provider.verified,
        "message": "Provider profile created successfully"
    }


@router.get("/providers", response_model=List[dict])
async def get_providers(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all active providers"""
    query = select(Provider).where(Provider.is_active == True)
    
    if category:
        query = query.where(Provider.specialties.contains([category]))
    
    result = await db.execute(query)
    providers = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "bio": p.bio,
            "avatar": p.avatar,
            "specialties": p.specialties,
            "languages": p.languages,
            "country": p.country,
            "verified": p.verified,
            "rating": p.rating,
            "reviewCount": p.review_count,
            "joinedAt": p.joined_at.isoformat() if p.joined_at else None,
        }
        for p in providers
    ]


@router.get("/providers/{provider_id}", response_model=dict)
async def get_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get provider details with services and reviews"""
    result = await db.execute(
        select(Provider).where(Provider.id == provider_id)
    )
    provider = result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    
    # Get services
    services_result = await db.execute(
        select(Service).where(
            Service.provider_id == provider_id,
            Service.is_active == True
        )
    )
    services = services_result.scalars().all()
    
    # Get reviews
    reviews_result = await db.execute(
        select(Review).where(Review.provider_id == provider_id)
        .order_by(Review.created_at.desc())
        .limit(10)
    )
    reviews = reviews_result.scalars().all()
    
    return {
        "id": provider.id,
        "name": provider.name,
        "bio": provider.bio,
        "avatar": provider.avatar,
        "specialties": provider.specialties,
        "languages": provider.languages,
        "country": provider.country,
        "timezone": provider.timezone,
        "verified": provider.verified,
        "rating": provider.rating,
        "reviewCount": provider.review_count,
        "isAcceptingClients": provider.is_accepting_clients,
        "joinedAt": provider.joined_at.isoformat() if provider.joined_at else None,
        "services": [
            {
                "id": s.id,
                "title": s.title,
                "description": s.description,
                "price": s.price,
                "duration": s.duration,
                "serviceType": s.service_type,
                "isActive": s.is_active,
            }
            for s in services
        ],
        "reviews": [
            {
                "id": r.id,
                "rating": r.rating,
                "comment": r.comment,
                "userName": "User",  # Would need to join with user table
                "createdAt": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reviews
        ]
    }


@router.post("/providers/{provider_id}/contact", response_model=dict)
async def contact_provider(
    provider_id: int,
    message: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start a conversation with a provider"""
    # Check if provider exists
    result = await db.execute(
        select(Provider).where(Provider.id == provider_id)
    )
    provider = result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    
    # Check for existing conversation
    conv_result = await db.execute(
        select(Conversation).where(
            Conversation.user_id == current_user.id,
            Conversation.provider_id == provider_id,
            Conversation.status == "active"
        )
    )
    conversation = conv_result.scalar_one_or_none()
    
    # Create new conversation if doesn't exist
    if not conversation:
        conversation = Conversation(
            user_id=current_user.id,
            provider_id=provider_id,
            subject="New inquiry"
        )
        db.add(conversation)
        await db.flush()
    
    # Create message
    new_message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        content=message
    )
    db.add(new_message)
    
    await db.commit()
    
    return {
        "conversationId": conversation.id,
        "message": "Message sent successfully"
    }


@router.get("/conversations", response_model=List[dict])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all conversations for current user"""
    result = await db.execute(
        select(Conversation).where(
            Conversation.user_id == current_user.id
        ).order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()
    
    return [
        {
            "id": c.id,
            "providerId": c.provider_id,
            "subject": c.subject,
            "status": c.status,
            "createdAt": c.created_at.isoformat() if c.created_at else None,
            "lastMessageAt": c.last_message_at.isoformat() if c.last_message_at else None,
        }
        for c in conversations
    ]


@router.get("/conversations/{conversation_id}/messages", response_model=List[dict])
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all messages in a conversation"""
    # Verify user has access to conversation
    conv_result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
    )
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get messages
    result = await db.execute(
        select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    
    return [
        {
            "id": m.id,
            "senderId": m.sender_id,
            "content": m.content,
            "isRead": m.is_read,
            "createdAt": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]
