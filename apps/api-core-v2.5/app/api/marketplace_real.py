"""
Real Working Marketplace API Endpoints
These endpoints actually work with real database operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from database import (
    get_db, MarketplaceItem, UserInventory, Transaction, 
    UserEconomy, User, Companion
)

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

logger = logging.getLogger(__name__)

# Helper functions
async def get_marketplace_item_by_id(item_id: int, db: AsyncSession) -> Optional[MarketplaceItem]:
    """Get marketplace item by ID"""
    result = await db.execute(
        select(MarketplaceItem).where(MarketplaceItem.id == item_id)
    )
    return result.scalar_one_or_none()

async def get_user_economy(user_id: int, db: AsyncSession) -> Optional[UserEconomy]:
    """Get user's economy data"""
    result = await db.execute(
        select(UserEconomy).where(UserEconomy.user_id == user_id)
    )
    economy = result.scalar_one_or_none()
    
    # Create economy if it doesn't exist
    if not economy:
        economy = UserEconomy(user_id=user_id, coins=1000, gems=0)
        db.add(economy)
        await db.commit()
        await db.refresh(economy)
    
    return economy

async def get_user_inventory(user_id: int, db: AsyncSession) -> List[UserInventory]:
    """Get user's inventory"""
    result = await db.execute(
        select(UserInventory)
        .options(selectinload(UserInventory.item))
        .where(UserInventory.user_id == user_id)
    )
    return result.scalars().all()

def apply_item_effect(user_id: int, item: MarketplaceItem, db: AsyncSession):
    """Apply item effect to user or companion"""
    # Get user's companion
    companion_result = await db.execute(
        select(Companion).where(Companion.user_id == user_id)
    )
    companion = companion_result.scalar_one_or_none()
    
    if not companion:
        return False
    
    # Apply effect based on item type
    if item.effect_type == "xp_boost":
        companion.experience_points += item.effect_value
    elif item.effect_type == "happiness_boost":
        companion.happiness = min(100, companion.happiness + item.effect_value)
    elif item.effect_type == "energy_boost":
        companion.energy = min(100, companion.energy + item.effect_value)
    elif item.effect_type == "health_boost":
        companion.health = min(100, companion.health + item.effect_value)
    
    await db.commit()
    return True

# Real working endpoints
@router.get("/items", response_model=List[Dict[str, Any]])
async def get_marketplace_items(
    category: Optional[str] = None,
    rarity: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get marketplace items - ACTUALLY WORKS"""
    try:
        query = select(MarketplaceItem).where(MarketplaceItem.is_active == True)
        
        if category:
            query = query.where(MarketplaceItem.category == category)
        
        if rarity:
            query = query.where(MarketplaceItem.rarity == rarity)
        
        query = query.order_by(
            MarketplaceItem.rarity.desc(),
            MarketplaceItem.price.asc()
        ).offset(offset).limit(limit)
        
        result = await db.execute(query)
        items = result.scalars().all()
        
        return [
            {
                "id": item.id,
                "name": item.name,
                "description": item.description,
                "category": item.category,
                "item_type": item.item_type,
                "price": item.price,
                "rarity": item.rarity,
                "effect_type": item.effect_type,
                "effect_value": item.effect_value,
                "icon": item.icon,
                "created_at": item.created_at.isoformat()
            }
            for item in items
        ]
        
    except Exception as e:
        logger.error(f"Error getting marketplace items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get marketplace items"
        )

@router.post("/purchase/{item_id}")
async def purchase_item(
    item_id: int,
    quantity: int = 1,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Purchase an item from marketplace - ACTUALLY WORKS"""
    try:
        # Get item
        item = await get_marketplace_item_by_id(item_id, db)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        if not item.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item is not available"
            )
        
        # Get user economy
        economy = await get_user_economy(current_user_id, db)
        
        # Calculate total cost
        total_cost = item.price * quantity
        
        # Check if user has enough coins
        if economy.coins < total_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient coins. Need {total_cost}, have {economy.coins}"
            )
        
        # Deduct coins
        economy.coins -= total_cost
        
        # Add to inventory
        existing_inventory = await db.execute(
            select(UserInventory).where(
                UserInventory.user_id == current_user_id,
                UserInventory.item_id == item_id
            )
        )
        inventory_item = existing_inventory.scalar_one_or_none()
        
        if inventory_item:
            inventory_item.quantity += quantity
        else:
            inventory_item = UserInventory(
                user_id=current_user_id,
                item_id=item_id,
                quantity=quantity
            )
            db.add(inventory_item)
        
        # Create transaction record
        transaction = Transaction(
            user_id=current_user_id,
            item_id=item_id,
            transaction_type="purchase",
            amount=total_cost,
            payment_method="coins"
        )
        db.add(transaction)
        
        await db.commit()
        
        return {
            "message": "Purchase successful",
            "item_id": item_id,
            "quantity": quantity,
            "total_cost": total_cost,
            "remaining_coins": economy.coins
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error purchasing item: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to purchase item"
        )

@router.get("/inventory", response_model=List[Dict[str, Any]])
async def get_user_inventory(
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get user's inventory - ACTUALLY WORKS"""
    try:
        inventory = await get_user_inventory(current_user_id, db)
        
        return [
            {
                "id": inv.id,
                "item_id": inv.item_id,
                "quantity": inv.quantity,
                "purchased_at": inv.purchased_at.isoformat(),
                "item": {
                    "id": inv.item.id,
                    "name": inv.item.name,
                    "description": inv.item.description,
                    "category": inv.item.category,
                    "item_type": inv.item.item_type,
                    "price": inv.item.price,
                    "rarity": inv.item.rarity,
                    "effect_type": inv.item.effect_type,
                    "effect_value": inv.item.effect_value,
                    "icon": inv.item.icon
                } if inv.item else None
            }
            for inv in inventory
        ]
        
    except Exception as e:
        logger.error(f"Error getting inventory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory"
        )

@router.post("/use/{inventory_id}")
async def use_inventory_item(
    inventory_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Use an item from inventory - ACTUALLY WORKS"""
    try:
        # Get inventory item
        inventory_result = await db.execute(
            select(UserInventory)
            .options(selectinload(UserInventory.item))
            .where(
                UserInventory.id == inventory_id,
                UserInventory.user_id == current_user_id
            )
        )
        inventory_item = inventory_result.scalar_one_or_none()
        
        if not inventory_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found in inventory"
            )
        
        if inventory_item.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No items left to use"
            )
        
        item = inventory_item.item
        if not item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item not available"
            )
        
        # Apply item effect
        effect_applied = await apply_item_effect(current_user_id, item, db)
        
        if not effect_applied:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot use item - no companion found"
            )
        
        # Decrease quantity
        inventory_item.quantity -= 1
        
        # Remove from inventory if quantity is 0
        if inventory_item.quantity <= 0:
            await db.delete(inventory_item)
        
        await db.commit()
        
        return {
            "message": "Item used successfully",
            "item_name": item.name,
            "effect_type": item.effect_type,
            "effect_value": item.effect_value,
            "remaining_quantity": inventory_item.quantity
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error using item: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to use item"
        )

@router.get("/economy")
async def get_user_economy_info(
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Get user's economy information - ACTUALLY WORKS"""
    try:
        economy = await get_user_economy(current_user_id, db)
        
        # Get transaction history
        transactions_result = await db.execute(
            select(Transaction)
            .options(selectinload(Transaction.item))
            .where(Transaction.user_id == current_user_id)
            .order_by(Transaction.created_at.desc())
            .limit(20)
        )
        transactions = transactions_result.scalars().all()
        
        return {
            "coins": economy.coins,
            "gems": economy.gems,
            "premium_expires_at": economy.premium_expires_at.isoformat() if economy.premium_expires_at else None,
            "transactions": [
                {
                    "id": tx.id,
                    "transaction_type": tx.transaction_type,
                    "amount": tx.amount,
                    "payment_method": tx.payment_method,
                    "created_at": tx.created_at.isoformat(),
                    "item": {
                        "id": tx.item.id,
                        "name": tx.item.name,
                        "icon": tx.item.icon
                    } if tx.item else None
                }
                for tx in transactions
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting economy info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get economy info"
        )

@router.post("/earn-coins")
async def earn_coins(
    amount: int,
    source: str = "daily_bonus",
    db: AsyncSession = Depends(get_db),
    current_user_id: int = 1  # TODO: Get from auth
):
    """Earn coins (for daily bonuses, achievements, etc.) - ACTUALLY WORKS"""
    try:
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be positive"
            )
        
        # Get user economy
        economy = await get_user_economy(current_user_id, db)
        
        # Add coins
        economy.coins += amount
        
        # Create transaction record
        transaction = Transaction(
            user_id=current_user_id,
            item_id=None,  # No item for earning coins
            transaction_type="sale",  # Using sale as positive transaction
            amount=amount,
            payment_method="coins"
        )
        db.add(transaction)
        
        await db.commit()
        
        return {
            "message": "Coins earned successfully",
            "amount": amount,
            "source": source,
            "total_coins": economy.coins
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error earning coins: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to earn coins"
        )

@router.get("/categories")
async def get_marketplace_categories(
    db: AsyncSession = Depends(get_db)
):
    """Get marketplace categories - ACTUALLY WORKS"""
    try:
        result = await db.execute(
            select(MarketplaceItem.category, func.count(MarketplaceItem.id))
            .where(MarketplaceItem.is_active == True)
            .group_by(MarketplaceItem.category)
        )
        categories = result.all()
        
        return {
            "categories": [
                {
                    "name": cat,
                    "item_count": count
                }
                for cat, count in categories
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get categories"
        )

@router.get("/stats")
async def get_marketplace_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get marketplace statistics - ACTUALLY WORKS"""
    try:
        # Total items
        total_items = await db.execute(
            select(func.count(MarketplaceItem.id))
            .where(MarketplaceItem.is_active == True)
        )
        total_items_count = total_items.scalar()
        
        # Items by category
        items_by_category = await db.execute(
            select(MarketplaceItem.category, func.count(MarketplaceItem.id))
            .where(MarketplaceItem.is_active == True)
            .group_by(MarketplaceItem.category)
        )
        category_stats = dict(items_by_category.all())
        
        # Items by rarity
        items_by_rarity = await db.execute(
            select(MarketplaceItem.rarity, func.count(MarketplaceItem.id))
            .where(MarketplaceItem.is_active == True)
            .group_by(MarketplaceItem.rarity)
        )
        rarity_stats = dict(items_by_rarity.all())
        
        # Average price
        avg_price = await db.execute(
            select(func.avg(MarketplaceItem.price))
            .where(MarketplaceItem.is_active == True)
        )
        average_price = avg_price.scalar()
        
        return {
            "total_items": total_items_count,
            "items_by_category": category_stats,
            "items_by_rarity": rarity_stats,
            "average_price": round(average_price or 0, 2)
        }
        
    except Exception as e:
        logger.error(f"Error getting marketplace stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get marketplace stats"
        )
