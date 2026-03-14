"""Marketplace API Routes - Phase 3

Provider discovery, service listings, bookings, and reviews.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import (
    User,
    UserRole,
    ProviderProfile,
    ProviderCredential,
    ServiceListing,
    ServiceAvailability,
    Booking,
    Review,
    Conversation,
    Message,
    ProviderStatus,
    ServiceType,
    BookingStatus,
    PaymentStatus,
)

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


# === PROVIDER DISCOVERY ===

@router.get("/providers", response_model=Dict[str, Any])
async def list_providers(
    service_type: Optional[ServiceType] = None,
    specialization: Optional[str] = None,
    target_region: Optional[str] = None,
    language: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Discover marketplace providers"""
    query = select(ProviderProfile).where(ProviderProfile.status == ProviderStatus.APPROVED)
    
    if service_type:
        # Join with services to filter by type
        query = query.join(ServiceListing).where(
            ServiceListing.service_type == service_type,
            ServiceListing.is_active == True
        )
    
    if specialization:
        query = query.where(
            ProviderProfile.specializations.contains([specialization])
        )
    
    if target_region:
        query = query.where(
            ProviderProfile.target_regions.contains([target_region])
        )
    
    if language:
        query = query.where(
            ProviderProfile.languages_spoken.contains([language])
        )
    
    if min_rating:
        query = query.where(ProviderProfile.rating_average >= min_rating)
    
    if is_featured is not None:
        # Join with services to check featured status
        pass  # Would need to handle this in the result filtering
    
    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Order by rating and experience
    query = query.order_by(
        desc(ProviderProfile.rating_average),
        desc(ProviderProfile.completed_bookings)
    )
    
    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    providers = result.scalars().all()
    
    # Build response
    items = []
    for provider in providers:
        user_result = await db.execute(
            select(User).where(User.id == provider.user_id)
        )
        user = user_result.scalar_one_or_none()

        # Get services for this provider
        services_result = await db.execute(
            select(ServiceListing).where(
                ServiceListing.provider_id == provider.id,
                ServiceListing.is_active == True
            )
        )
        services = services_result.scalars().all()
        
        # Check price filter
        if max_price:
            services = [s for s in services if float(s.price_amount) <= max_price]
            if not services:
                continue
        
        items.append({
            "id": str(provider.id),
            "user_id": str(provider.user_id),
            "full_name": user.full_name if user else None,
            "avatar_url": user.avatar_url if user else None,
            "headline": provider.headline,
            "bio": provider.bio,
            "current_title": provider.current_title,
            "current_organization": provider.current_organization,
            "years_experience": provider.years_experience,
            "specializations": provider.specializations,
            "target_regions": provider.target_regions,
            "target_institutions": provider.target_institutions,
            "languages_spoken": provider.languages_spoken,
            "rating_average": provider.rating_average,
            "review_count": provider.review_count,
            "total_bookings": provider.total_bookings,
            "response_rate": provider.response_rate,
            "response_time_hours": provider.response_time_hours,
            "timezone": provider.timezone,
            "services": [
                {
                    "id": str(s.id),
                    "title": s.title,
                    "service_type": s.service_type.value,
                    "price_amount": float(s.price_amount),
                    "price_currency": s.price_currency,
                    "is_featured": s.is_featured
                }
                for s in services[:3]  # Top 3 services
            ]
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/providers/{provider_id}", response_model=Dict[str, Any])
async def get_provider(
    provider_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed provider profile"""
    result = await db.execute(
        select(ProviderProfile).where(
            ProviderProfile.id == provider_id,
            ProviderProfile.status == ProviderStatus.APPROVED
        )
    )
    provider = result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Get all services
    services_result = await db.execute(
        select(ServiceListing).where(
            ServiceListing.provider_id == provider.id,
            ServiceListing.is_active == True
        ).order_by(desc(ServiceListing.is_featured))
    )
    services = services_result.scalars().all()
    
    # Get credentials
    credentials_result = await db.execute(
        select(ProviderCredential).where(
            ProviderCredential.provider_id == provider.id,
            ProviderCredential.verification_status == "verified"
        )
    )
    credentials = credentials_result.scalars().all()
    
    # Get recent reviews
    reviews_result = await db.execute(
        select(Review).where(
            Review.provider_id == provider.id,
            Review.is_public == True
        ).order_by(desc(Review.created_at)).limit(5)
    )
    reviews = reviews_result.scalars().all()

    user_result = await db.execute(
        select(User).where(User.id == provider.user_id)
    )
    user = user_result.scalar_one_or_none()
    
    return {
        "id": str(provider.id),
        "user_id": str(provider.user_id),
        "full_name": user.full_name if user else None,
        "avatar_url": user.avatar_url if user else None,
        "headline": provider.headline,
        "bio": provider.bio,
        "current_title": provider.current_title,
        "current_organization": provider.current_organization,
        "years_experience": provider.years_experience,
        "education": provider.education,
        "specializations": provider.specializations,
        "target_regions": provider.target_regions,
        "target_institutions": provider.target_institutions,
        "languages_spoken": provider.languages_spoken,
        "profile_video_url": provider.profile_video_url,
        "portfolio_links": provider.portfolio_links,
        "rating_average": provider.rating_average,
        "review_count": provider.review_count,
        "total_bookings": provider.total_bookings,
        "response_rate": provider.response_rate,
        "response_time_hours": provider.response_time_hours,
        "timezone": provider.timezone,
        "services": [
            {
                "id": str(s.id),
                "title": s.title,
                "description": s.description,
                "service_type": s.service_type.value,
                "delivery_method": s.delivery_method.value,
                "duration_minutes": s.duration_minutes,
                "pricing_type": s.pricing_type.value,
                "price_amount": float(s.price_amount),
                "price_currency": s.price_currency,
                "includes": s.includes,
                "prerequisites": s.prerequisites,
                "deliverables": s.deliverables,
                "advance_booking_days": s.advance_booking_days,
                "is_featured": s.is_featured
            }
            for s in services
        ],
        "credentials": [
            {
                "id": str(c.id),
                "credential_type": c.credential_type,
                "title": c.title,
                "issuing_organization": c.issuing_organization,
                "issue_date": c.issue_date.isoformat() if c.issue_date else None,
                "verification_status": c.verification_status
            }
            for c in credentials
        ],
        "recent_reviews": [
            {
                "id": str(r.id),
                "overall_rating": r.overall_rating,
                "title": r.title,
                "content": r.content,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "is_verified": r.is_verified
            }
            for r in reviews
        ]
    }


# === SERVICES ===

@router.get("/services", response_model=Dict[str, Any])
async def list_services(
    service_type: Optional[ServiceType] = None,
    delivery_method: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List available services"""
    query = select(ServiceListing).where(
        ServiceListing.is_active == True,
        ServiceListing.provider_id.in_(
            select(ProviderProfile.id).where(ProviderProfile.status == ProviderStatus.APPROVED)
        )
    )
    
    if service_type:
        query = query.where(ServiceListing.service_type == service_type)
    
    if delivery_method:
        query = query.where(ServiceListing.delivery_method == delivery_method)
    
    if min_price:
        query = query.where(ServiceListing.price_amount >= min_price)
    
    if max_price:
        query = query.where(ServiceListing.price_amount <= max_price)
    
    # Count
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Order by featured then rating
    query = query.order_by(
        desc(ServiceListing.is_featured),
        desc(ServiceListing.total_bookings)
    )
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    services = result.scalars().all()
    
    items = []
    for service in services:
        # Get provider info
        provider_result = await db.execute(
            select(ProviderProfile).where(ProviderProfile.id == service.provider_id)
        )
        provider = provider_result.scalar_one()
        
        # === ECONOMICS INTEGRATION: Performance Guarantee ===
        has_performance_guarantee = False
        if hasattr(service, 'performance_bound') and service.performance_bound:
            has_performance_guarantee = True
        
        success_rate = None
        if hasattr(service, 'performance_success_rate') and service.performance_success_rate:
            success_rate = float(service.performance_success_rate)
        
        item = {
            "id": str(service.id),
            "title": service.title,
            "description": service.description,
            "service_type": service.service_type.value,
            "delivery_method": service.delivery_method.value,
            "duration_minutes": service.duration_minutes,
            "pricing_type": service.pricing_type.value,
            "price_amount": float(service.price_amount),
            "price_currency": service.price_currency,
            "is_featured": service.is_featured,
            "has_performance_guarantee": has_performance_guarantee,
            "provider": {
                "id": str(provider.id),
                "headline": provider.headline,
                "rating_average": provider.rating_average,
                "review_count": provider.review_count
            }
        }
        
        if success_rate is not None:
            item["performance_success_rate"] = success_rate
        
        items.append(item)
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/services/{service_id}", response_model=Dict[str, Any])
async def get_service(
    service_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed service information"""
    result = await db.execute(
        select(ServiceListing).where(
            ServiceListing.id == service_id,
            ServiceListing.is_active == True
        )
    )
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get provider
    provider_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.id == service.provider_id)
    )
    provider = provider_result.scalar_one()
    
    # Get availability (next 30 days)
    availability_result = await db.execute(
        select(ServiceAvailability).where(
            ServiceAvailability.service_id == service.id,
            ServiceAvailability.is_available == True,
            ServiceAvailability.date >= date.today(),
            ServiceAvailability.date <= date.today() + timedelta(days=30)
        ).order_by(ServiceAvailability.date, ServiceAvailability.start_time)
    )
    availability = availability_result.scalars().all()
    
    return {
        "id": str(service.id),
        "title": service.title,
        "description": service.description,
        "service_type": service.service_type.value,
        "delivery_method": service.delivery_method.value,
        "duration_minutes": service.duration_minutes,
        "pricing_type": service.pricing_type.value,
        "price_amount": float(service.price_amount),
        "price_currency": service.price_currency,
        "min_price": float(service.min_price) if service.min_price else None,
        "max_price": float(service.max_price) if service.max_price else None,
        "includes": service.includes,
        "excludes": service.excludes,
        "prerequisites": service.prerequisites,
        "deliverables": service.deliverables,
        "advance_booking_days": service.advance_booking_days,
        "provider": {
            "id": str(provider.id),
            "headline": provider.headline,
            "bio": provider.bio,
            "rating_average": provider.rating_average,
            "review_count": provider.review_count,
            "languages_spoken": provider.languages_spoken,
            "timezone": provider.timezone
        },
        "availability": [
            {
                "id": str(a.id),
                "date": a.date.isoformat(),
                "start_time": a.start_time.isoformat() if a.start_time else None,
                "end_time": a.end_time.isoformat() if a.end_time else None
            }
            for a in availability[:10]  # First 10 slots
        ]
    }


# === BOOKINGS ===

@router.post("/bookings", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new booking request"""
    service_id = UUID(booking_data["service_id"])
    availability_id = booking_data.get("availability_id")
    
    # Get service
    service_result = await db.execute(
        select(ServiceListing).where(
            ServiceListing.id == service_id,
            ServiceListing.is_active == True
        )
    )
    service = service_result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get provider
    provider_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.id == service.provider_id)
    )
    provider = provider_result.scalar_one()
    
    # Determine scheduled time
    scheduled_date = None
    scheduled_start = None
    scheduled_end = None
    
    if availability_id:
        avail_result = await db.execute(
            select(ServiceAvailability).where(
                ServiceAvailability.id == UUID(availability_id),
                ServiceAvailability.service_id == service.id,
                ServiceAvailability.is_available == True
            )
        )
        availability = avail_result.scalar_one_or_none()
        
        if not availability:
            raise HTTPException(status_code=400, detail="Time slot not available")
        
        scheduled_date = availability.date
        scheduled_start = availability.start_time
        scheduled_end = availability.end_time
        
        # Mark slot as unavailable
        availability.is_available = False
    else:
        # Proposed time from client
        scheduled_date = date.fromisoformat(booking_data["proposed_date"])
        scheduled_start = datetime.combine(
            scheduled_date,
            datetime.min.time(),
            tzinfo=timezone.utc,
        )
        scheduled_end = scheduled_start + timedelta(minutes=service.duration_minutes or 60)
    
    # Calculate pricing
    price_agreed = service.price_amount
    platform_fee = price_agreed * Decimal("0.15")  # 15% platform fee
    provider_earnings = price_agreed - platform_fee
    
    # Create booking
    booking = Booking(
        client_id=current_user.id,
        provider_id=provider.id,
        service_id=service.id,
        scheduled_date=scheduled_date,
        scheduled_start=scheduled_start,
        scheduled_end=scheduled_end,
        timezone=booking_data.get("timezone", provider.timezone or "UTC"),
        client_notes=booking_data.get("notes"),
        price_agreed=price_agreed,
        platform_fee=platform_fee,
        provider_earnings=provider_earnings,
        status=BookingStatus.PENDING,
        payment_status=PaymentStatus.PENDING.value,
    )
    
    db.add(booking)
    await db.flush()  # Get booking ID
    
    # Link availability to booking if applicable
    if availability_id:
        availability.booking_id = booking.id
    
    await db.commit()
    await db.refresh(booking)
    
    # === ECONOMICS INTEGRATION: Escrow Creation ===
    # Trigger escrow creation for performance-bound services
    is_performance_bound = (
        hasattr(service, 'performance_bound') and service.performance_bound
    )
    
    if is_performance_bound:
        try:
            from app.tasks.escrow import create_escrow_task
            create_escrow_task.delay(
                str(booking.id),
                float(price_agreed * Decimal("0.30")),  # 30% held in escrow
                {
                    "type": "readiness_improvement",
                    "min_improvement": 10
                }
            )
        except Exception:
            pass  # Celery/Redis not available in free-tier deploy
    
    return {
        "booking_id": str(booking.id),
        "status": booking.status.value,
        "scheduled_date": booking.scheduled_date.isoformat(),
        "price_agreed": float(booking.price_agreed),
        "platform_fee": float(booking.platform_fee),
        "has_performance_guarantee": is_performance_bound,
        "message": "Booking request sent to provider"
    }


@router.get("/bookings", response_model=Dict[str, Any])
async def list_bookings(
    status: Optional[BookingStatus] = None,
    as_provider: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's bookings (as client or provider)"""
    if as_provider:
        # Get provider profile
        provider_result = await db.execute(
            select(ProviderProfile).where(ProviderProfile.user_id == current_user.id)
        )
        provider = provider_result.scalar_one_or_none()
        
        if not provider:
            raise HTTPException(status_code=403, detail="You are not a provider")
        
        query = select(Booking).where(Booking.provider_id == provider.id)
    else:
        query = select(Booking).where(Booking.client_id == current_user.id)
    
    if status:
        query = query.where(Booking.status == status)
    
    # Count
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Order
    query = query.order_by(desc(Booking.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    items = []
    for booking in bookings:
        # Get related data
        service_result = await db.execute(
            select(ServiceListing).where(ServiceListing.id == booking.service_id)
        )
        service = service_result.scalar_one()
        
        provider_result = await db.execute(
            select(ProviderProfile).where(ProviderProfile.id == booking.provider_id)
        )
        provider = provider_result.scalar_one()
        
        items.append({
            "id": str(booking.id),
            "status": booking.status.value,
            "service": {
                "id": str(service.id),
                "title": service.title,
                "service_type": service.service_type.value
            },
            "provider": {
                "id": str(provider.id),
                "headline": provider.headline,
                "full_name": (
                    await db.execute(
                        select(User.full_name).where(User.id == provider.user_id)
                    )
                ).scalar_one_or_none(),
            },
            "scheduled_date": booking.scheduled_date.isoformat(),
            "scheduled_start": booking.scheduled_start.isoformat() if booking.scheduled_start else None,
            "meeting_url": booking.meeting_url,
            "price_agreed": float(booking.price_agreed),
            "payment_status": booking.payment_status.value,
            "created_at": booking.created_at.isoformat() if booking.created_at else None
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.patch("/bookings/{booking_id}", response_model=Dict[str, Any])
async def update_booking(
    booking_id: UUID,
    update_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update booking status (confirm, cancel, complete)"""
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check authorization
    provider_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    is_client = booking.client_id == current_user.id
    is_provider = provider and booking.provider_id == provider.id
    
    if not is_client and not is_provider:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_status = update_data.get("status")
    
    if new_status == "confirmed" and is_provider:
        if booking.status != BookingStatus.PENDING:
            raise HTTPException(status_code=400, detail="Can only confirm pending bookings")
        booking.status = BookingStatus.CONFIRMED
        
    elif new_status == "cancelled":
        if booking.status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Cannot cancel completed/cancelled booking")
        booking.status = BookingStatus.CANCELLED
        booking.cancelled_by = "client" if is_client else "provider"
        booking.cancelled_at = datetime.utcnow()
        booking.cancellation_reason = update_data.get("reason")
        
    elif new_status == "completed" and is_provider:
        if booking.status != BookingStatus.CONFIRMED:
            raise HTTPException(status_code=400, detail="Can only complete confirmed bookings")
        booking.status = BookingStatus.COMPLETED
        booking.completed_at = datetime.utcnow()
        booking.provider_summary = update_data.get("summary")
        
        # === ECONOMICS INTEGRATION: Escrow Resolution ===
        # Trigger escrow resolution task when booking is completed
        try:
            from app.tasks.escrow import resolve_escrow_task
            resolve_escrow_task.delay(str(booking.id))
        except Exception:
            pass  # Celery/Redis not available in free-tier deploy
        
    else:
        raise HTTPException(status_code=400, detail="Invalid status transition")
    
    booking.updated_at = datetime.utcnow()
    await db.commit()
    
    return {
        "booking_id": str(booking.id),
        "status": booking.status.value,
        "message": f"Booking {new_status}"
    }


# === REVIEWS ===

@router.post("/reviews", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a review for a completed booking"""
    booking_id = UUID(review_data["booking_id"])
    
    # Get booking
    result = await db.execute(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.client_id == current_user.id,
            Booking.status == BookingStatus.COMPLETED
        )
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Completed booking not found")
    
    # Check if already reviewed
    existing_result = await db.execute(
        select(Review).where(Review.booking_id == booking_id)
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Booking already reviewed")
    
    # Create review
    review = Review(
        booking_id=booking.id,
        client_id=current_user.id,
        provider_id=booking.provider_id,
        service_id=booking.service_id,
        overall_rating=review_data["overall_rating"],
        communication_rating=review_data.get("communication_rating"),
        expertise_rating=review_data.get("expertise_rating"),
        value_rating=review_data.get("value_rating"),
        would_recommend=review_data.get("would_recommend"),
        title=review_data.get("title"),
        content=review_data.get("content"),
        is_public=review_data.get("is_public", True)
    )
    
    db.add(review)
    
    # Update provider stats
    provider_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.id == booking.provider_id)
    )
    provider = provider_result.scalar_one()
    
    # Recalculate average rating
    all_reviews_result = await db.execute(
        select(Review).where(Review.provider_id == provider.id)
    )
    all_reviews = all_reviews_result.scalars().all()
    
    if all_reviews:
        avg_rating = sum(r.overall_rating for r in all_reviews) / len(all_reviews)
        provider.rating_average = avg_rating
        provider.review_count = len(all_reviews)
    
    await db.commit()
    await db.refresh(review)
    
    return {
        "review_id": str(review.id),
        "message": "Review submitted successfully"
    }


@router.get("/reviews", response_model=Dict[str, Any])
async def list_reviews(
    provider_id: Optional[UUID] = None,
    service_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List reviews"""
    query = select(Review).where(Review.is_public == True)
    
    if provider_id:
        query = query.where(Review.provider_id == provider_id)
    
    if service_id:
        query = query.where(Review.service_id == service_id)
    
    # Count
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Order
    query = query.order_by(desc(Review.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    items = []
    for review in reviews:
        items.append({
            "id": str(review.id),
            "overall_rating": review.overall_rating,
            "communication_rating": review.communication_rating,
            "expertise_rating": review.expertise_rating,
            "value_rating": review.value_rating,
            "would_recommend": review.would_recommend,
            "title": review.title,
            "content": review.content,
            "provider_response": review.provider_response,
            "is_verified": review.is_verified,
            "created_at": review.created_at.isoformat() if review.created_at else None
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }


# === CONVERSATIONS ===

@router.get("/conversations", response_model=List[Dict[str, Any]])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's conversations with providers"""
    # Get provider profile if user is a provider
    provider_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if provider:
        # Provider sees conversations with them
        query = select(Conversation).where(
            Conversation.provider_id == provider.id,
            Conversation.provider_archived == False
        )
    else:
        # Client sees their conversations
        query = select(Conversation).where(
            Conversation.client_id == current_user.id,
            Conversation.client_archived == False
        )
    
    query = query.where(Conversation.is_active == True)
    query = query.order_by(desc(Conversation.last_message_at))
    
    result = await db.execute(query)
    conversations = result.scalars().all()
    
    items = []
    for conv in conversations:
        # Get other party info
        if provider:
            # We're the provider, get client info
            other_result = await db.execute(
                select(User).where(User.id == conv.client_id)
            )
        else:
            # We're the client, get provider info
            other_result = await db.execute(
                select(ProviderProfile).where(ProviderProfile.id == conv.provider_id)
            )
        other = other_result.scalar_one()

        other_name = getattr(other, "headline", None) or getattr(other, "email", None) or "Unknown"
        if isinstance(other, ProviderProfile):
            provider_user_result = await db.execute(
                select(User.full_name).where(User.id == other.user_id)
            )
            other_name = provider_user_result.scalar_one_or_none() or other_name
        
        # Get last message
        last_msg_result = await db.execute(
            select(Message).where(
                Message.conversation_id == conv.id,
                Message.is_deleted == False
            ).order_by(desc(Message.created_at)).limit(1)
        )
        last_msg = last_msg_result.scalar_one_or_none()
        
        items.append({
            "id": str(conv.id),
            "other_party": {
                "id": str(other.id),
                "name": other_name,
            },
            "last_message": {
                "content": last_msg.content[:100] if last_msg else None,
                "created_at": last_msg.created_at.isoformat() if last_msg else None,
                "is_read": last_msg.is_read if last_msg else True
            } if last_msg else None,
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None
        })
    
    return items


@router.post("/conversations", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def start_conversation(
    data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start a new conversation with a provider"""
    provider_id = UUID(data["provider_id"])
    
    # Check if provider exists and is approved
    provider_result = await db.execute(
        select(ProviderProfile).where(
            ProviderProfile.id == provider_id,
            ProviderProfile.status == ProviderStatus.APPROVED
        )
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Check if conversation already exists
    existing_result = await db.execute(
        select(Conversation).where(
            Conversation.client_id == current_user.id,
            Conversation.provider_id == provider_id
        )
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        return {
            "conversation_id": str(existing.id),
            "message": "Conversation already exists"
        }
    
    # Create conversation
    conversation = Conversation(
        client_id=current_user.id,
        provider_id=provider_id,
        related_service_id=UUID(data["service_id"]) if data.get("service_id") else None
    )
    
    db.add(conversation)
    await db.flush()
    
    # Add initial message if provided
    if data.get("message"):
        message = Message(
            conversation_id=conversation.id,
            sender_id=current_user.id,
            content=data["message"]
        )
        db.add(message)
        conversation.last_message_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "conversation_id": str(conversation.id),
        "message": "Conversation started"
    }


@router.get("/conversations/{conversation_id}/messages", response_model=List[Dict[str, Any]])
async def get_messages(
    conversation_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages in a conversation"""
    # Verify access
    conv_result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check authorization
    provider_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    is_client = conversation.client_id == current_user.id
    is_provider = provider and conversation.provider_id == provider.id
    
    if not is_client and not is_provider:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get messages
    query = select(Message).where(
        Message.conversation_id == conversation_id,
        Message.is_deleted == False
    ).order_by(desc(Message.created_at))
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Mark unread messages as read
    for msg in messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
            msg.read_at = datetime.utcnow()
    
    await db.commit()
    
    return [
        {
            "id": str(m.id),
            "sender_id": str(m.sender_id),
            "is_me": m.sender_id == current_user.id,
            "content": m.content,
            "message_type": m.message_type,
            "file_url": m.file_url,
            "file_name": m.file_name,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "is_read": m.is_read
        }
        for m in reversed(messages)  # Return in chronological order
    ]


@router.post("/conversations/{conversation_id}/messages", response_model=Dict[str, Any])
async def send_message(
    conversation_id: UUID,
    message_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message in a conversation"""
    # Verify access
    conv_result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    provider_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    is_client = conversation.client_id == current_user.id
    is_provider = provider and conversation.provider_id == provider.id
    
    if not is_client and not is_provider:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create message
    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message_data["content"],
        message_type=message_data.get("message_type", "text"),
        file_url=message_data.get("file_url"),
        file_name=message_data.get("file_name"),
        file_size=message_data.get("file_size")
    )
    
    db.add(message)
    
    # Update conversation
    conversation.last_message_at = datetime.utcnow()
    conversation.is_active = True
    
    await db.commit()
    await db.refresh(message)
    
    return {
        "message_id": str(message.id),
        "created_at": message.created_at.isoformat() if message.created_at else None
    }


# === PROVIDER DASHBOARD (for providers only) ===

@router.get("/provider/dashboard", response_model=Dict[str, Any])
async def provider_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Provider dashboard stats and overview"""
    # Get provider profile
    result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.user_id == current_user.id)
    )
    provider = result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="You are not a provider")
    
    # Stats
    pending_bookings_result = await db.execute(
        select(func.count()).where(
            Booking.provider_id == provider.id,
            Booking.status == BookingStatus.PENDING
        )
    )
    pending_bookings = pending_bookings_result.scalar()
    
    upcoming_result = await db.execute(
        select(func.count()).where(
            Booking.provider_id == provider.id,
            Booking.status == BookingStatus.CONFIRMED,
            Booking.scheduled_date >= date.today()
        )
    )
    upcoming = upcoming_result.scalar()
    
    total_revenue_result = await db.execute(
        select(func.sum(Booking.provider_earnings)).where(
            Booking.provider_id == provider.id,
            Booking.status == BookingStatus.COMPLETED
        )
    )
    total_revenue = total_revenue_result.scalar() or 0
    
    # Recent bookings
    recent_bookings_result = await db.execute(
        select(Booking).where(
            Booking.provider_id == provider.id
        ).order_by(desc(Booking.created_at)).limit(5)
    )
    recent = recent_bookings_result.scalars().all()
    
    return {
        "provider_id": str(provider.id),
        "status": provider.status.value,
        "stats": {
            "total_bookings": provider.total_bookings,
            "completed_bookings": provider.completed_bookings,
            "pending_bookings": pending_bookings,
            "upcoming_bookings": upcoming,
            "rating_average": provider.rating_average,
            "review_count": provider.review_count,
            "total_revenue": float(total_revenue)
        },
        "recent_bookings": [
            {
                "id": str(b.id),
                "status": b.status.value,
                "scheduled_date": b.scheduled_date.isoformat(),
                "price_agreed": float(b.price_agreed)
            }
            for b in recent
        ]
    }


@router.post("/provider/apply", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def apply_as_provider(
    application_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Apply to become a marketplace provider"""
    # Check if already applied
    existing_result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.user_id == current_user.id)
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Application already submitted")
    
    # Create provider profile
    provider = ProviderProfile(
        user_id=current_user.id,
        headline=application_data.get("headline"),
        bio=application_data.get("bio"),
        current_title=application_data.get("current_title"),
        current_organization=application_data.get("current_organization"),
        years_experience=application_data.get("years_experience"),
        education=application_data.get("education", []),
        specializations=application_data.get("specializations", []),
        target_regions=application_data.get("target_regions", []),
        target_institutions=application_data.get("target_institutions", []),
        languages_spoken=application_data.get("languages_spoken", []),
        timezone=application_data.get("timezone"),
        application_answers=application_data.get("answers"),
        status=ProviderStatus.PENDING
    )

    if current_user.role == UserRole.USER:
        current_user.role = UserRole.PROVIDER
    
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    
    return {
        "provider_id": str(provider.id),
        "status": provider.status.value,
        "message": "Application submitted for review"
    }
