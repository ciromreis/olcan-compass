"""
Real WebSocket API Endpoints for Olcan Compass
Provides WebSocket connections for real-time features
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import logging
import json

from database import get_db
from app.websocket_server import websocket_endpoint, manager, broadcast_system_message

router = APIRouter(tags=["websocket"])

logger = logging.getLogger(__name__)

@router.websocket("/ws/{user_id}")
async def websocket_connection(websocket: WebSocket, user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Main WebSocket endpoint for real-time communication
    
    Connect to: ws://localhost:8000/api/v1/ws/{user_id}
    
    Supported message types:
    - subscribe: Subscribe to a room
    - unsubscribe: Unsubscribe from a room
    - companion_care: Handle companion care activities
    - guild_battle: Handle guild battle actions
    - marketplace_update: Handle marketplace updates
    - video_recording: Handle video recording updates
    - ping: Keep connection alive
    """
    await websocket_endpoint(websocket, user_id, db)

@router.post("/broadcast/system")
async def broadcast_system_message_endpoint(
    message_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Broadcast a system message to all connected users
    
    Example payload:
    {
        "message": "System maintenance in 5 minutes",
        "type": "maintenance_warning"
    }
    """
    try:
        message = message_data.get("message", "")
        message_type = message_data.get("type", "system")
        
        await broadcast_system_message(message, message_type)
        
        return {
            "message": "System message broadcasted successfully",
            "recipients": len(manager.get_connected_users())
        }
    
    except Exception as e:
        logger.error(f"Error broadcasting system message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to broadcast system message"
        )

@router.post("/broadcast/guild/{guild_id}")
async def broadcast_guild_message(
    guild_id: int,
    message_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Broadcast a message to all members of a specific guild
    
    Example payload:
    {
        "type": "guild_announcement",
        "message": "Guild meeting tonight at 8 PM",
        "sender_id": 123
    }
    """
    try:
        room = f"guild_{guild_id}"
        
        # Send to all guild members
        await manager.send_to_room(room, {
            "type": message_data.get("type", "guild_message"),
            "data": message_data
        })
        
        return {
            "message": "Guild message broadcasted successfully",
            "guild_id": guild_id,
            "recipients": len(manager.get_room_users(room))
        }
    
    except Exception as e:
        logger.error(f"Error broadcasting guild message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to broadcast guild message"
        )

@router.post("/notify/companion/{user_id}")
async def send_companion_notification(
    user_id: int,
    notification_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Send a companion-related notification to a specific user
    
    Example payload:
    {
        "type": "care_reminder",
        "message": "Your companion needs care!",
        "companion_stats": {
            "health": 30,
            "happiness": 20,
            "energy": 15
        }
    }
    """
    try:
        await manager.send_personal_message(user_id, {
            "type": "companion_notification",
            "data": notification_data
        })
        
        return {
            "message": "Companion notification sent successfully",
            "user_id": user_id
        }
    
    except Exception as e:
        logger.error(f"Error sending companion notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send companion notification"
        )

@router.get("/stats/connections")
async def get_connection_stats(db: AsyncSession = Depends(get_db)):
    """
    Get WebSocket connection statistics
    
    Returns:
    - Total connected users
    - Users in each room
    - Connection uptime
    """
    try:
        connected_users = manager.get_connected_users()
        room_stats = {}
        
        for room in manager.room_subscriptions.keys():
            room_stats[room] = len(manager.get_room_users(room))
        
        return {
            "total_connected_users": len(connected_users),
            "connected_users": connected_users,
            "room_stats": room_stats,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    
    except Exception as e:
        logger.error(f"Error getting connection stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get connection stats"
        )

@router.post("/trigger/companion-care/{user_id}")
async def trigger_companion_care_activity(
    user_id: int,
    activity_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger a companion care activity and broadcast real-time updates
    
    Example payload:
    {
        "activity_type": "feed",
        "companion_id": 1,
        "effects": {
            "health": 10,
            "happiness": 5,
            "energy": 5,
            "xp": 10
        }
    }
    """
    try:
        from app.websocket_server import WebSocketEvents
        
        # Handle the companion care activity
        await WebSocketEvents.handle_companion_care(user_id, activity_data, db)
        
        return {
            "message": "Companion care activity triggered successfully",
            "user_id": user_id,
            "activity_type": activity_data.get("activity_type")
        }
    
    except Exception as e:
        logger.error(f"Error triggering companion care: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger companion care activity"
        )

@router.post("/trigger/guild-battle/{battle_id}")
async def trigger_guild_battle_action(
    battle_id: int,
    battle_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger a guild battle action and broadcast real-time updates
    
    Example payload:
    {
        "action": "attack",
        "guild_id": 1,
        "opponent_guild_id": 2,
        "attacker_guild_id": 1,
        "defender_guild_id": 2,
        "damage": 15
    }
    """
    try:
        from app.websocket_server import WebSocketEvents
        
        # Handle the guild battle action
        await WebSocketEvents.handle_guild_battle(battle_data, db)
        
        return {
            "message": "Guild battle action triggered successfully",
            "battle_id": battle_id,
            "action": battle_data.get("action")
        }
    
    except Exception as e:
        logger.error(f"Error triggering guild battle: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger guild battle action"
        )

@router.post("/trigger/marketplace-update")
async def trigger_marketplace_update(
    update_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger a marketplace update and broadcast real-time notifications
    
    Example payload:
    {
        "type": "purchase",
        "user_id": 123,
        "item_id": 456,
        "item_name": "Health Potion"
    }
    """
    try:
        from app.websocket_server import WebSocketEvents
        
        # Handle the marketplace update
        await WebSocketEvents.handle_marketplace_update(update_data, db)
        
        return {
            "message": "Marketplace update triggered successfully",
            "type": update_data.get("type")
        }
    
    except Exception as e:
        logger.error(f"Error triggering marketplace update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger marketplace update"
        )

@router.post("/trigger/video-recording-update")
async def trigger_video_recording_update(
    recording_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger a video recording status update and broadcast real-time notifications
    
    Example payload:
    {
        "user_id": 123,
        "recording_id": 456,
        "status": "processing",
        "video_title": "My Interview Practice",
        "additional_data": {
            "duration": 180,
            "file_size": 50000000
        }
    }
    """
    try:
        from app.websocket_server import WebSocketEvents
        
        # Handle the video recording update
        await WebSocketEvents.handle_video_recording_update(recording_data, db)
        
        return {
            "message": "Video recording update triggered successfully",
            "status": recording_data.get("status")
        }
    
    except Exception as e:
        logger.error(f"Error triggering video recording update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger video recording update"
        )
