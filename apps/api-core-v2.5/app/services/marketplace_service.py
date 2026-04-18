"""Marketplace service - business logic for marketplace operations.

This service handles:
- Booking creation and completion
- Review submission
- Provider service completion
- Event emission for gamification integration
- Achievement and quest progress updates
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.marketplace import (
    Booking, Review, ProviderProfile, ServiceListing,
    BookingStatus, PaymentStatus
)
import logging

logger = logging.getLogger(__name__)


class MarketplaceService:
    """Service for marketplace operations with gamification integration."""

    @staticmethod
    async def complete_booking(
        db: AsyncSession,
        booking_id: UUID,
        user_id: UUID
    ) -> Dict[str, Any]:
        """
        Complete a booking and trigger gamification events.
        
        Args:
            db: Database session
            booking_id: Booking ID
            user_id: User ID (client or provider)
            
        Returns:
            Dict with booking data and gamification updates
        """
        try:
            # Get booking
            result = await db.execute(
                select(Booking).where(Booking.id == booking_id)
            )
            booking = result.scalar_one_or_none()

            if not booking:
                logger.error(f"Booking {booking_id} not found")
                return {"error": "Booking not found"}

            # Update booking status
            booking.status = BookingStatus.COMPLETED
            booking.completed_at = datetime.now(timezone.utc)
            booking.payment_status = PaymentStatus.RELEASED

            await db.flush()

            # Determine if user is client or provider
            is_client = booking.client_id == user_id
            is_provider = False
            
            if not is_client:
                # Check if user is the provider
                provider_result = await db.execute(
                    select(ProviderProfile).where(
                        and_(
                            ProviderProfile.id == booking.provider_id,
                            ProviderProfile.user_id == user_id
                        )
                    )
                )
                provider = provider_result.scalar_one_or_none()
                is_provider = provider is not None

            # Update achievement progress for client
            achievements_unlocked = []
            quests_updated = []
            
            if is_client:
                # Check marketplace booking achievements
                from app.services.achievement_service import AchievementService
                
                # Get client's booking count
                booking_count = await db.scalar(
                    select(func.count(Booking.id))
                    .where(
                        Booking.client_id == user_id,
                        Booking.status == BookingStatus.COMPLETED
                    )
                )

                # Check for achievement unlocks
                if booking_count in [1, 5, 20]:
                    condition = {"marketplace_bookings_completed": booking_count}
                    unlocked = await AchievementService._unlock_by_condition(
                        db, user_id, condition
                    )
                    if unlocked:
                        achievements_unlocked.extend(unlocked)

                # Update quest progress
                from app.services.quest_service import QuestService
                updated = await QuestService.update_quest_progress(
                    db,
                    user_id,
                    "marketplace_booking_completed",
                    {
                        "booking_id": str(booking_id),
                        "service_type": str(booking.service_id)
                    }
                )
                if updated:
                    quests_updated.extend(updated)

            # Update achievement progress for provider
            if is_provider:
                from app.services.achievement_service import AchievementService
                
                # Get provider's completed service count
                service_count = await db.scalar(
                    select(func.count(Booking.id))
                    .where(
                        Booking.provider_id == booking.provider_id,
                        Booking.status == BookingStatus.COMPLETED
                    )
                )

                # Check for achievement unlocks
                if service_count in [1, 10, 50]:
                    condition = {"marketplace_services_provided": service_count}
                    unlocked = await AchievementService._unlock_by_condition(
                        db, user_id, condition
                    )
                    if unlocked:
                        achievements_unlocked.extend(unlocked)

                # Update provider profile stats
                provider_result = await db.execute(
                    select(ProviderProfile).where(ProviderProfile.id == booking.provider_id)
                )
                provider = provider_result.scalar_one_or_none()
                if provider:
                    provider.completed_bookings += 1

                # Update quest progress
                from app.services.quest_service import QuestService
                updated = await QuestService.update_quest_progress(
                    db,
                    user_id,
                    "marketplace_service_provided",
                    {
                        "booking_id": str(booking_id),
                        "service_type": str(booking.service_id)
                    }
                )
                if updated:
                    quests_updated.extend(updated)

            await db.commit()

            logger.info(
                f"Booking {booking_id} completed. "
                f"Achievements unlocked: {len(achievements_unlocked)}, "
                f"Quests updated: {len(quests_updated)}"
            )

            return {
                "booking_id": str(booking_id),
                "status": booking.status.value,
                "completed_at": booking.completed_at,
                "achievements_unlocked": [
                    {
                        "id": str(ua.id),
                        "achievement_id": str(ua.achievement_id),
                        "name": ua.achievement.name,
                        "icon": ua.achievement.icon,
                        "xp_bonus": ua.achievement.xp_bonus
                    }
                    for ua in achievements_unlocked
                ],
                "quests_updated": [
                    {
                        "id": str(q.id),
                        "name": q.template.name,
                        "progress": q.progress,
                        "progress_percentage": q.progress_percentage,
                        "completed": q.status.value == "completed"
                    }
                    for q in quests_updated
                ]
            }

        except Exception as e:
            logger.error(f"Error completing booking {booking_id}: {str(e)}")
            await db.rollback()
            return {"error": str(e)}

    @staticmethod
    async def submit_review(
        db: AsyncSession,
        booking_id: UUID,
        client_id: UUID,
        overall_rating: int,
        content: Optional[str] = None,
        communication_rating: Optional[int] = None,
        expertise_rating: Optional[int] = None,
        value_rating: Optional[int] = None,
        would_recommend: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Submit a review for a completed booking.
        
        Args:
            db: Database session
            booking_id: Booking ID
            client_id: Client user ID
            overall_rating: Overall rating (1-5)
            content: Review text
            communication_rating: Communication rating (1-5)
            expertise_rating: Expertise rating (1-5)
            value_rating: Value rating (1-5)
            would_recommend: Would recommend boolean
            
        Returns:
            Dict with review data and gamification updates
        """
        try:
            # Get booking
            result = await db.execute(
                select(Booking).where(
                    and_(
                        Booking.id == booking_id,
                        Booking.client_id == client_id,
                        Booking.status == BookingStatus.COMPLETED
                    )
                )
            )
            booking = result.scalar_one_or_none()

            if not booking:
                logger.error(f"Booking {booking_id} not found or not completed")
                return {"error": "Booking not found or not completed"}

            # Check if review already exists
            existing_result = await db.execute(
                select(Review).where(Review.booking_id == booking_id)
            )
            existing = existing_result.scalar_one_or_none()

            if existing:
                logger.warning(f"Review already exists for booking {booking_id}")
                return {"error": "Review already exists"}

            # Create review
            review = Review(
                booking_id=booking_id,
                client_id=client_id,
                provider_id=booking.provider_id,
                service_id=booking.service_id,
                overall_rating=overall_rating,
                communication_rating=communication_rating,
                expertise_rating=expertise_rating,
                value_rating=value_rating,
                would_recommend=would_recommend,
                content=content,
                is_verified=True  # Verified purchase
            )

            db.add(review)
            await db.flush()

            # Update provider stats
            provider_result = await db.execute(
                select(ProviderProfile).where(ProviderProfile.id == booking.provider_id)
            )
            provider = provider_result.scalar_one_or_none()

            if provider:
                # Recalculate average rating
                total_reviews = provider.review_count + 1
                new_average = (
                    (provider.rating_average * provider.review_count + overall_rating)
                    / total_reviews
                )
                provider.rating_average = new_average
                provider.review_count = total_reviews

            # Check achievements for client
            from app.services.achievement_service import AchievementService
            
            review_count = await db.scalar(
                select(func.count(Review.id))
                .where(Review.client_id == client_id)
            )

            achievements_unlocked = []
            if review_count in [1, 10]:
                condition = {"marketplace_reviews": review_count}
                unlocked = await AchievementService._unlock_by_condition(
                    db, client_id, condition
                )
                if unlocked:
                    achievements_unlocked.extend(unlocked)

            # Check achievements for provider (5-star reviews)
            if overall_rating == 5:
                provider_user_id = provider.user_id if provider else None
                if provider_user_id:
                    five_star_count = await db.scalar(
                        select(func.count(Review.id))
                        .where(
                            Review.provider_id == booking.provider_id,
                            Review.overall_rating == 5
                        )
                    )

                    if five_star_count in [1, 10]:
                        condition = {"marketplace_five_star_reviews": five_star_count}
                        provider_unlocked = await AchievementService._unlock_by_condition(
                            db, provider_user_id, condition
                        )
                        if provider_unlocked:
                            achievements_unlocked.extend(provider_unlocked)

            # Update quest progress
            from app.services.quest_service import QuestService
            quests_updated = await QuestService.update_quest_progress(
                db,
                client_id,
                "marketplace_review_submitted",
                {
                    "booking_id": str(booking_id),
                    "rating": overall_rating
                }
            )

            await db.commit()

            logger.info(
                f"Review submitted for booking {booking_id}. "
                f"Rating: {overall_rating}/5. "
                f"Achievements unlocked: {len(achievements_unlocked)}"
            )

            return {
                "review_id": str(review.id),
                "overall_rating": overall_rating,
                "achievements_unlocked": [
                    {
                        "id": str(ua.id),
                        "achievement_id": str(ua.achievement_id),
                        "name": ua.achievement.name,
                        "icon": ua.achievement.icon,
                        "xp_bonus": ua.achievement.xp_bonus
                    }
                    for ua in achievements_unlocked
                ],
                "quests_updated": [
                    {
                        "id": str(q.id),
                        "name": q.template.name,
                        "progress": q.progress,
                        "progress_percentage": q.progress_percentage,
                        "completed": q.status.value == "completed"
                    }
                    for q in quests_updated
                ]
            }

        except Exception as e:
            logger.error(f"Error submitting review for booking {booking_id}: {str(e)}")
            await db.rollback()
            return {"error": str(e)}

    @staticmethod
    async def create_booking(
        db: AsyncSession,
        client_id: UUID,
        provider_id: UUID,
        service_id: UUID,
        scheduled_start: datetime,
        scheduled_end: datetime,
        price_agreed: float,
        client_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new booking and trigger gamification events.
        
        Args:
            db: Database session
            client_id: Client user ID
            provider_id: Provider profile ID
            service_id: Service listing ID
            scheduled_start: Start datetime
            scheduled_end: End datetime
            price_agreed: Agreed price
            client_notes: Client notes
            
        Returns:
            Dict with booking data and gamification updates
        """
        try:
            # Calculate platform fee (15%)
            platform_fee = price_agreed * 0.15
            provider_earnings = price_agreed - platform_fee

            # Create booking
            booking = Booking(
                client_id=client_id,
                provider_id=provider_id,
                service_id=service_id,
                scheduled_date=scheduled_start.date(),
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                timezone="UTC",  # Should be passed from client
                status=BookingStatus.PENDING,
                price_agreed=price_agreed,
                platform_fee=platform_fee,
                provider_earnings=provider_earnings,
                client_notes=client_notes,
                payment_status=PaymentStatus.PENDING
            )

            db.add(booking)
            await db.flush()

            # Check for first booking achievement
            from app.services.achievement_service import AchievementService
            
            booking_count = await db.scalar(
                select(func.count(Booking.id))
                .where(Booking.client_id == client_id)
            )

            achievements_unlocked = []
            if booking_count == 1:
                condition = {"marketplace_bookings": 1}
                unlocked = await AchievementService._unlock_by_condition(
                    db, client_id, condition
                )
                if unlocked:
                    achievements_unlocked.extend(unlocked)

            # Update quest progress
            from app.services.quest_service import QuestService
            quests_updated = await QuestService.update_quest_progress(
                db,
                client_id,
                "marketplace_booking_created",
                {
                    "booking_id": str(booking.id),
                    "service_id": str(service_id)
                }
            )

            await db.commit()

            logger.info(
                f"Booking created: {booking.id}. "
                f"Achievements unlocked: {len(achievements_unlocked)}"
            )

            return {
                "booking_id": str(booking.id),
                "status": booking.status.value,
                "scheduled_start": booking.scheduled_start,
                "scheduled_end": booking.scheduled_end,
                "price_agreed": float(booking.price_agreed),
                "achievements_unlocked": [
                    {
                        "id": str(ua.id),
                        "achievement_id": str(ua.achievement_id),
                        "name": ua.achievement.name,
                        "icon": ua.achievement.icon,
                        "xp_bonus": ua.achievement.xp_bonus
                    }
                    for ua in achievements_unlocked
                ],
                "quests_updated": [
                    {
                        "id": str(q.id),
                        "name": q.template.name,
                        "progress": q.progress,
                        "progress_percentage": q.progress_percentage,
                        "completed": q.status.value == "completed"
                    }
                    for q in quests_updated
                ]
            }

        except Exception as e:
            logger.error(f"Error creating booking: {str(e)}")
            await db.rollback()
            return {"error": str(e)}
