"""
Simple in-memory cache service
For production, replace with Redis
"""

import time
from typing import Optional, Any, Dict
from threading import Lock


class CacheService:
    """Simple in-memory cache with TTL support"""

    def __init__(self):
        self._cache: Dict[str, tuple[Any, float]] = {}
        self._lock = Lock()

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if expired/not found
        """
        with self._lock:
            if key not in self._cache:
                return None
            
            value, expires_at = self._cache[key]
            
            if time.time() > expires_at:
                # Expired, remove from cache
                del self._cache[key]
                return None
            
            return value

    def set(self, key: str, value: Any, ttl: int = 300):
        """
        Set value in cache with TTL
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (default 5 minutes)
        """
        with self._lock:
            expires_at = time.time() + ttl
            self._cache[key] = (value, expires_at)

    def delete(self, key: str):
        """Delete key from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]

    def clear(self):
        """Clear all cache"""
        with self._lock:
            self._cache.clear()


# Singleton instance
cache_service = CacheService()
