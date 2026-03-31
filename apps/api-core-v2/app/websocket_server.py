"""
Real-time WebSocket Server for Olcan Compass
Handles live updates for guild battles, companion care, marketplace, and more
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Any, Optional
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and rooms"""
    
    def __init__(self):
        # Active connections by user_id
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Room subscriptions (guild_id, marketplace, etc.)
        self.room_subscriptions: Dict[str, Set[int]] = {}
        # User sessions
        self.user_sessions: Dict[int, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Connect a user to WebSocket"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        
        # Initialize user session
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {
                "connected_at": datetime.utcnow().isoformat(),
                "last_activity": datetime.utcnow().isoformat(),
                "subscriptions": set()
            }
        
        logger.info(f"User {user_id} connected to WebSocket")
        
        # Send welcome message
        await self.send_personal_message(user_id, {
            "type": "connection_established",
            "data": {
                "user_id": user_id,
                "connected_at": self.user_sessions[user_id]["connected_at"]
            }
        })
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """Disconnect a user from WebSocket"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        # Clean up subscriptions
        if user_id in self.user_sessions:
            subscriptions = self.user_sessions[user_id]["subscriptions"]
            for room in subscriptions:
                if room in self.room_subscriptions:
                    self.room_subscriptions[room].discard(user_id)
                    if not self.room_subscriptions[room]:
                        del self.room_subscriptions[room]
            del self.user_sessions[user_id]
        
        logger.info(f"User {user_id} disconnected from WebSocket")
    
    async def send_personal_message(self, user_id: int, message: Dict[str, Any]):
        """Send message to specific user"""
        if user_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.active_connections[user_id].discard(conn)
    
    async def send_to_room(self, room: str, message: Dict[str, Any]):
        """Send message to all users in a room"""
        if room in self.room_subscriptions:
            disconnected_users = set()
            for user_id in self.room_subscriptions[room]:
                await self.send_personal_message(user_id, message)
            
            # Clean up disconnected users
            for user_id in disconnected_users:
                self.room_subscriptions[room].discard(user_id)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Send message to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(user_id, message)
    
    def subscribe_to_room(self, user_id: int, room: str):
        """Subscribe user to a room"""
        if room not in self.room_subscriptions:
            self.room_subscriptions[room] = set()
        
        self.room_subscriptions[room].add(user_id)
        
        if user_id in self.user_sessions:
            self.user_sessions[user_id]["subscriptions"].add(room)
        
        logger.info(f"User {user_id} subscribed to room {room}")
    
    def unsubscribe_from_room(self, user_id: int, room: str):
        """Unsubscribe user from a room"""
        if room in self.room_subscriptions:
            self.room_subscriptions[room].discard(user_id)
            if not self.room_subscriptions[room]:
                del self.room_subscriptions[room]
        
        if user_id in self.user_sessions:
            self.user_sessions[user_id]["subscriptions"].discard(room)
        
        logger.info(f"User {user_id} unsubscribed from room {room}")
    
    def get_connected_users(self) -> List[int]:
        """Get list of connected user IDs"""
        return list(self.active_connections.keys())
    
    def get_room_users(self, room: str) -> List[int]:
        """Get list of users subscribed to a room"""
        return list(self.room_subscriptions.get(room, []))

# Global connection manager
manager = ConnectionManager()

class WebSocketEvents:
    """Handles different WebSocket events"""
    
    @staticmethod
    async def handle_companion_care(user_id: int, activity_data: Dict[str, Any], db: AsyncSession):
        """Handle companion care activity with real-time updates"""
        try:
            # Get companion data (simplified for example)
            companion_data = {
                "name": "Spark",
                "health": 85,
                "happiness": 90,
                "energy": 75,
                "level": 5,
                "experience_points": 250
            }
            
            # Calculate effects
            effects = {
                "feed": {"health": 10, "happiness": 5, "energy": 5, "xp": 10},
                "train": {"health": -5, "happiness": -10, "energy": -15, "xp": 20},
                "play": {"health": 0, "happiness": 15, "energy": -10, "xp": 8},
                "rest": {"health": 10, "energy": 20, "happiness": 0, "xp": 5}
            }
            
            activity_type = activity_data.get("activity_type", "feed")
            effect = effects.get(activity_type, effects["feed"])
            
            # Update companion stats
            companion_data["health"] = max(0, min(100, companion_data["health"] + effect["health"]))
            companion_data["happiness"] = max(0, min(100, companion_data["happiness"] + effect["happiness"]))
            companion_data["energy"] = max(0, min(100, companion_data["energy"] + effect["energy"]))
            companion_data["experience_points"] += effect["xp"]
            
            # Check for level up
            new_level = companion_data["experience_points"] // 100 + 1
            if new_level > companion_data["level"]:
                companion_data["level"] = new_level
                # Send level up notification
                await manager.send_personal_message(user_id, {
                    "type": "companion_level_up",
                    "data": {
                        "new_level": new_level,
                        "companion": companion_data
                    }
                })
            
            # Send real-time update
            await manager.send_personal_message(user_id, {
                "type": "companion_updated",
                "data": {
                    "activity": activity_type,
                    "effects": effect,
                    "companion": companion_data,
                    "timestamp": datetime.utcnow().isoformat()
                }
            })
            
            # Send notification to guild members if user is in guild
            await WebSocketEvents.notify_guild_members(user_id, {
                "type": "guild_member_activity",
                "data": {
                    "user_id": user_id,
                    "activity": f"cared for companion ({activity_type})",
                    "companion_name": companion_data["name"]
                }
            })
            
        except Exception as e:
            logger.error(f"Error handling companion care: {e}")
    
    @staticmethod
    async def handle_guild_battle(battle_data: Dict[str, Any], db: AsyncSession):
        """Handle guild battle with real-time updates"""
        try:
            battle_id = battle_data.get("battle_id")
            guild_id = battle_data.get("guild_id")
            opponent_guild_id = battle_data.get("opponent_guild_id")
            action = battle_data.get("action")  # "start", "attack", "defend", "end"
            
            # Create room for battle
            battle_room = f"battle_{battle_id}"
            
            if action == "start":
                await manager.send_to_room(battle_room, {
                    "type": "battle_started",
                    "data": {
                        "battle_id": battle_id,
                        "guilds": [guild_id, opponent_guild_id],
                        "status": "active"
                    }
                })
            
            elif action == "attack":
                # Simulate battle action
                attacker_id = battle_data.get("attacker_guild_id")
                defender_id = battle_data.get("defender_guild_id")
                damage = battle_data.get("damage", 10)
                
                await manager.send_to_room(battle_room, {
                    "type": "battle_action",
                    "data": {
                        "battle_id": battle_id,
                        "action": "attack",
                        "attacker_guild_id": attacker_id,
                        "defender_guild_id": defender_id,
                        "damage": damage,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
            elif action == "end":
                winner_id = battle_data.get("winner_guild_id")
                
                await manager.send_to_room(battle_room, {
                    "type": "battle_ended",
                    "data": {
                        "battle_id": battle_id,
                        "winner_guild_id": winner_id,
                        "final_scores": battle_data.get("final_scores", {}),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
                
                # Clean up battle room
                if battle_room in manager.room_subscriptions:
                    del manager.room_subscriptions[battle_room]
            
        except Exception as e:
            logger.error(f"Error handling guild battle: {e}")
    
    @staticmethod
    async def handle_marketplace_update(update_data: Dict[str, Any], db: AsyncSession):
        """Handle marketplace updates with real-time notifications"""
        try:
            update_type = update_data.get("type")  # "purchase", "new_item", "price_change"
            
            if update_type == "purchase":
                user_id = update_data.get("user_id")
                item_id = update_data.get("item_id")
                item_name = update_data.get("item_name")
                
                # Send purchase confirmation
                await manager.send_personal_message(user_id, {
                    "type": "purchase_completed",
                    "data": {
                        "item_id": item_id,
                        "item_name": item_name,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
                
                # Notify marketplace subscribers
                await manager.send_to_room("marketplace", {
                    "type": "marketplace_activity",
                    "data": {
                        "activity": "purchase",
                        "item_id": item_id,
                        "item_name": item_name,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
            elif update_type == "new_item":
                item_data = update_data.get("item_data")
                
                await manager.send_to_room("marketplace", {
                    "type": "new_item_added",
                    "data": {
                        "item": item_data,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                })
            
        except Exception as e:
            logger.error(f"Error handling marketplace update: {e}")
    
    @staticmethod
    async def handle_video_recording_update(recording_data: Dict[str, Any], db: AsyncSession):
        """Handle video recording status updates"""
        try:
            user_id = recording_data.get("user_id")
            recording_id = recording_data.get("recording_id")
            status = recording_data.get("status")  # "started", "stopped", "processing", "completed"
            
            await manager.send_personal_message(user_id, {
                "type": "recording_status_update",
                "data": {
                    "recording_id": recording_id,
                    "status": status,
                    "timestamp": datetime.utcnow().isoformat(),
                    **recording_data.get("additional_data", {})
                }
            })
            
            # If recording completed, notify guild members
            if status == "completed":
                await WebSocketEvents.notify_guild_members(user_id, {
                    "type": "guild_member_video_completed",
                    "data": {
                        "user_id": user_id,
                        "recording_id": recording_id,
                        "video_title": recording_data.get("video_title")
                    }
                })
            
        except Exception as e:
            logger.error(f"Error handling video recording update: {e}")
    
    @staticmethod
    async def notify_guild_members(user_id: int, message: Dict[str, Any]):
        """Notify all guild members of a user's activity"""
        try:
            # This would typically involve database lookup to find guild_id
            # For now, we'll use a placeholder
            guild_id = f"guild_{user_id % 10 + 1}"  # Placeholder logic
            
            await manager.send_to_room(guild_id, message)
        except Exception as e:
            logger.error(f"Error notifying guild members: {e}")

# WebSocket endpoint handler
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: AsyncSession):
    """Main WebSocket endpoint"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            message_data = message.get("data", {})
            
            # Update last activity
            if user_id in manager.user_sessions:
                manager.user_sessions[user_id]["last_activity"] = datetime.utcnow().isoformat()
            
            # Handle different message types
            if message_type == "subscribe":
                room = message_data.get("room")
                if room:
                    manager.subscribe_to_room(user_id, room)
                    await manager.send_personal_message(user_id, {
                        "type": "subscription_confirmed",
                        "data": {"room": room}
                    })
            
            elif message_type == "unsubscribe":
                room = message_data.get("room")
                if room:
                    manager.unsubscribe_from_room(user_id, room)
                    await manager.send_personal_message(user_id, {
                        "type": "unsubscription_confirmed",
                        "data": {"room": room}
                    })
            
            elif message_type == "companion_care":
                await WebSocketEvents.handle_companion_care(user_id, message_data, db)
            
            elif message_type == "guild_battle":
                await WebSocketEvents.handle_guild_battle(message_data, db)
            
            elif message_type == "marketplace_update":
                await WebSocketEvents.handle_marketplace_update(message_data, db)
            
            elif message_type == "video_recording":
                await WebSocketEvents.handle_video_recording_update(message_data, db)
            
            elif message_type == "ping":
                await manager.send_personal_message(user_id, {
                    "type": "pong",
                    "data": {"timestamp": datetime.utcnow().isoformat()}
                })
            
            else:
                await manager.send_personal_message(user_id, {
                    "type": "error",
                    "data": {"message": f"Unknown message type: {message_type}"}
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)

# Utility functions for external use
async def broadcast_system_message(message: str, message_type: str = "system"):
    """Broadcast a system message to all connected users"""
    await manager.broadcast({
        "type": message_type,
        "data": {
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
    })

async def send_guild_message(guild_id: int, message: Dict[str, Any]):
    """Send message to all guild members"""
    room = f"guild_{guild_id}"
    await manager.send_to_room(room, message)

async def send_companion_notification(user_id: int, notification: Dict[str, Any]):
    """Send companion-related notification to user"""
    await manager.send_personal_message(user_id, {
        "type": "companion_notification",
        "data": notification
    })

async def get_active_user_count() -> int:
    """Get count of active connected users"""
    return len(manager.get_connected_users())

async def get_room_user_count(room: str) -> int:
    """Get count of users in a specific room"""
    return len(manager.get_room_users(room))
