import asyncio
import uuid
from sqlalchemy import select, func
from app.db.session import get_db
from app.db.models.marketplace import ProviderProfile, ServiceListing, Booking, Review, ProviderStatus
from app.db.models.user import User

async def verify_marketplace_integrity():
    print("=== OLCAN MARKETPLACE DATA INTEGRITY CHECK ===")
    
    async for db in get_db():
        # 1. Total Providers
        providers_count = await db.execute(select(func.count(ProviderProfile.id)))
        count = providers_count.scalar()
        print(f"Total Providers in DB: {count}")
        
        # 2. Approved Providers (Visible)
        approved_count = await db.execute(
            select(func.count(ProviderProfile.id)).where(ProviderProfile.status == ProviderStatus.APPROVED)
        )
        a_count = approved_count.scalar()
        print(f"Approved Providers: {a_count}")
        
        # 3. Total Services
        services_count = await db.execute(select(func.count(ServiceListing.id)))
        s_count = services_count.scalar()
        print(f"Total Service Listings: {s_count}")
        
        # 4. Bookings and Escrows
        bookings_count = await db.execute(select(func.count(Booking.id)))
        b_count = bookings_count.scalar()
        print(f"Total Bookings: {b_count}")
        
        # 5. List approved providers names
        if a_count > 0:
            print("\nApproved Providers List:")
            query = select(User.full_name, ProviderProfile.headline).join(
                ProviderProfile, User.id == ProviderProfile.user_id
            ).where(ProviderProfile.status == ProviderStatus.APPROVED)
            result = await db.execute(query)
            for row in result.all():
                print(f"- {row[0]}: {row[1]}")
        else:
            print("\nWARNING: No approved providers found. Marketplace will appear empty to users.")
            print("To fix this, status must be updated from 'pending' to 'approved' in provider_profiles.")

if __name__ == "__main__":
    try:
        asyncio.run(verify_marketplace_integrity())
    except Exception as e:
        print(f"Error during verification: {e}")
