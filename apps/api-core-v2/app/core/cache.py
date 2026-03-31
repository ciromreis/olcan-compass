"""
Redis Caching Layer - Performance Optimization

Este módulo fornece funções para cache de dados usando Redis,
melhorando a performance de consultas frequentes.

Graceful degradation: all cache operations silently return None/no-op
when Redis is unavailable (e.g. Render free tier without Redis).
"""

import json
import logging
import uuid
from typing import Optional, Any, Union

try:
    import redis.asyncio as redis
    _REDIS_AVAILABLE = True
except ImportError:  # pragma: no cover
    _REDIS_AVAILABLE = False

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Global Redis client — None when Redis is unconfigured or unreachable
_redis_client: Optional[Any] = None
_redis_disabled: bool = False  # set True after first failed connection attempt


async def get_redis_client() -> Optional[Any]:
    """
    Returns a Redis client, or None if Redis is unavailable.

    Never raises — callers must handle a None return gracefully.
    """
    global _redis_client, _redis_disabled

    if not _REDIS_AVAILABLE or _redis_disabled:
        return None

    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            # Verify the connection is actually live
            await _redis_client.ping()
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis unavailable — caching disabled. Reason: %s", exc)
            _redis_client = None
            _redis_disabled = True

    return _redis_client


async def close_redis_client() -> None:
    """Fecha a conexão com Redis."""
    global _redis_client
    
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None


# Cache Keys
def _credential_cache_key(user_id: Union[str, uuid.UUID]) -> str:
    """Gera chave de cache para credenciais do usuário."""
    return f"credentials:user:{user_id}"


def _temporal_preference_cache_key(user_id: Union[str, uuid.UUID]) -> str:
    """Gera chave de cache para preferência temporal do usuário."""
    return f"temporal:user:{user_id}"


def _momentum_cache_key(user_id: Union[str, uuid.UUID]) -> str:
    """Gera chave de cache para score de momentum do usuário."""
    return f"momentum:user:{user_id}"


def _frontier_cache_key(user_id: Union[str, uuid.UUID], constraints_hash: str) -> str:
    """Gera chave de cache para fronteira viável."""
    return f"frontier:user:{user_id}:constraints:{constraints_hash}"


# Credentials Cache
async def cache_user_credentials(
    user_id: Union[str, uuid.UUID],
    credentials_data: Any,
    ttl: int = 3600
) -> None:
    """
    Armazena credenciais do usuário em cache.

    Args:
        user_id: UUID do usuário
        credentials_data: Dados das credenciais (serializável em JSON)
        ttl: Tempo de vida em segundos (padrão: 1 hora)
    """
    client = await get_redis_client()
    if client is None:
        return
    key = _credential_cache_key(user_id)
    try:
        await client.setex(key, ttl, json.dumps(credentials_data, default=str))
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache write failed for %s: %s", key, exc)


async def get_cached_credentials(
    user_id: Union[str, uuid.UUID]
) -> Optional[Any]:
    """
    Obtém credenciais do usuário do cache.

    Args:
        user_id: UUID do usuário

    Returns:
        Dados das credenciais ou None se não estiver em cache
    """
    client = await get_redis_client()
    if client is None:
        return None
    key = _credential_cache_key(user_id)
    try:
        data = await client.get(key)
        if data:
            return json.loads(data)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache read failed for %s: %s", key, exc)
    return None


async def invalidate_credentials_cache(user_id: Union[str, uuid.UUID]) -> None:
    """
    Invalida cache de credenciais do usuário.

    Args:
        user_id: UUID do usuário
    """
    client = await get_redis_client()
    if client is None:
        return
    key = _credential_cache_key(user_id)
    try:
        await client.delete(key)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache delete failed for %s: %s", key, exc)


# Temporal Preference Cache
async def cache_temporal_preference(
    user_id: Union[str, uuid.UUID],
    temporal_preference: int,
    ttl: int = 7200
) -> None:
    """
    Armazena preferência temporal do usuário em cache.

    Args:
        user_id: UUID do usuário
        temporal_preference: Score de preferência temporal (0-100)
        ttl: Tempo de vida em segundos (padrão: 2 horas)
    """
    client = await get_redis_client()
    if client is None:
        return
    key = _temporal_preference_cache_key(user_id)
    try:
        await client.setex(key, ttl, str(temporal_preference))
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache write failed for %s: %s", key, exc)


async def get_cached_temporal_preference(
    user_id: Union[str, uuid.UUID]
) -> Optional[int]:
    """
    Obtém preferência temporal do usuário do cache.

    Args:
        user_id: UUID do usuário

    Returns:
        Score de preferência temporal ou None se não estiver em cache
    """
    client = await get_redis_client()
    if client is None:
        return None
    key = _temporal_preference_cache_key(user_id)
    try:
        data = await client.get(key)
        if data:
            return int(data)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache read failed for %s: %s", key, exc)
    return None


async def invalidate_temporal_preference_cache(user_id: Union[str, uuid.UUID]) -> None:
    """
    Invalida cache de preferência temporal do usuário.

    Args:
        user_id: UUID do usuário
    """
    client = await get_redis_client()
    if client is None:
        return
    key = _temporal_preference_cache_key(user_id)
    try:
        await client.delete(key)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache delete failed for %s: %s", key, exc)


# Momentum Score Cache
async def cache_momentum_score(
    user_id: Union[str, uuid.UUID],
    momentum_score: int,
    ttl: int = 1800
) -> None:
    """
    Armazena score de momentum do usuário em cache.

    Args:
        user_id: UUID do usuário
        momentum_score: Score de momentum
        ttl: Tempo de vida em segundos (padrão: 30 minutos)
    """
    client = await get_redis_client()
    if client is None:
        return
    key = _momentum_cache_key(user_id)
    try:
        await client.setex(key, ttl, str(momentum_score))
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache write failed for %s: %s", key, exc)


async def get_cached_momentum_score(
    user_id: Union[str, uuid.UUID]
) -> Optional[int]:
    """
    Obtém score de momentum do usuário do cache.

    Args:
        user_id: UUID do usuário

    Returns:
        Score de momentum ou None se não estiver em cache
    """
    client = await get_redis_client()
    if client is None:
        return None
    key = _momentum_cache_key(user_id)
    try:
        data = await client.get(key)
        if data:
            return int(data)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache read failed for %s: %s", key, exc)
    return None


async def invalidate_momentum_cache(user_id: Union[str, uuid.UUID]) -> None:
    """
    Invalida cache de momentum do usuário.

    Args:
        user_id: UUID do usuário
    """
    client = await get_redis_client()
    if client is None:
        return
    key = _momentum_cache_key(user_id)
    try:
        await client.delete(key)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache delete failed for %s: %s", key, exc)


# Feasible Frontier Cache
async def cache_feasible_frontier(
    user_id: Union[str, uuid.UUID],
    constraints_hash: str,
    frontier_data: Any,
    ttl: int = 86400
) -> None:
    """
    Armazena fronteira viável em cache.

    Args:
        user_id: UUID do usuário
        constraints_hash: Hash das constraints para identificação única
        frontier_data: Dados da fronteira (serializável em JSON)
        ttl: Tempo de vida em segundos (padrão: 24 horas)
    """
    client = await get_redis_client()
    if client is None:
        return
    key = _frontier_cache_key(user_id, constraints_hash)
    try:
        await client.setex(key, ttl, json.dumps(frontier_data, default=str))
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache write failed for %s: %s", key, exc)


async def get_cached_feasible_frontier(
    user_id: Union[str, uuid.UUID],
    constraints_hash: str
) -> Optional[Any]:
    """
    Obtém fronteira viável do cache.

    Args:
        user_id: UUID do usuário
        constraints_hash: Hash das constraints

    Returns:
        Dados da fronteira ou None se não estiver em cache
    """
    client = await get_redis_client()
    if client is None:
        return None
    key = _frontier_cache_key(user_id, constraints_hash)
    try:
        data = await client.get(key)
        if data:
            return json.loads(data)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache read failed for %s: %s", key, exc)
    return None


async def invalidate_frontier_cache(
    user_id: Union[str, uuid.UUID],
    constraints_hash: Optional[str] = None
) -> None:
    """
    Invalida cache de fronteira viável do usuário.

    Args:
        user_id: UUID do usuário
        constraints_hash: Hash específico ou None para invalidar todos
    """
    client = await get_redis_client()
    if client is None:
        return
    try:
        if constraints_hash:
            key = _frontier_cache_key(user_id, constraints_hash)
            await client.delete(key)
        else:
            pattern = f"frontier:user:{user_id}:*"
            keys = await client.keys(pattern)
            if keys:
                await client.delete(*keys)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache invalidation failed for user %s: %s", user_id, exc)


# Generic Cache Helpers
async def cache_set(
    key: str,
    value: Any,
    ttl: Optional[int] = None
) -> None:
    """
    Armazena valor genérico em cache.

    Args:
        key: Chave do cache
        value: Valor a armazenar (serializável em JSON)
        ttl: Tempo de vida em segundos (opcional)
    """
    client = await get_redis_client()
    if client is None:
        return
    serialized = json.dumps(value, default=str)
    try:
        if ttl:
            await client.setex(key, ttl, serialized)
        else:
            await client.set(key, serialized)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache set failed for %s: %s", key, exc)


async def cache_get(key: str) -> Optional[Any]:
    """
    Obtém valor genérico do cache.

    Args:
        key: Chave do cache

    Returns:
        Valor armazenado ou None se não existir
    """
    client = await get_redis_client()
    if client is None:
        return None
    try:
        data = await client.get(key)
        if data:
            return json.loads(data)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache get failed for %s: %s", key, exc)
    return None


async def cache_delete(key: str) -> None:
    """
    Remove valor do cache.

    Args:
        key: Chave do cache
    """
    client = await get_redis_client()
    if client is None:
        return
    try:
        await client.delete(key)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache delete failed for %s: %s", key, exc)


async def cache_exists(key: str) -> bool:
    """
    Verifica se chave existe no cache.

    Args:
        key: Chave do cache

    Returns:
        True se existir, False caso contrário
    """
    client = await get_redis_client()
    if client is None:
        return False
    try:
        return await client.exists(key) > 0
    except Exception as exc:  # noqa: BLE001
        logger.debug("Cache exists failed for %s: %s", key, exc)
        return False
