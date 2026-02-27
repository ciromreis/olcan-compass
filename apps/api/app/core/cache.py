"""
Redis Caching Layer - Performance Optimization

Este módulo fornece funções para cache de dados usando Redis,
melhorando a performance de consultas frequentes.
"""

import json
import uuid
from typing import Optional, Any, Union
from datetime import timedelta

import redis.asyncio as redis
from app.core.config import get_settings

settings = get_settings()

# Cliente Redis global
_redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """
    Obtém ou cria o cliente Redis.
    
    Returns:
        Cliente Redis assíncrono
    """
    global _redis_client
    
    if _redis_client is None:
        _redis_client = redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True
        )
    
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
    key = _credential_cache_key(user_id)
    
    await client.setex(
        key,
        ttl,
        json.dumps(credentials_data, default=str)
    )


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
    key = _credential_cache_key(user_id)
    
    data = await client.get(key)
    if data:
        return json.loads(data)
    return None


async def invalidate_credentials_cache(user_id: Union[str, uuid.UUID]) -> None:
    """
    Invalida cache de credenciais do usuário.
    
    Args:
        user_id: UUID do usuário
    """
    client = await get_redis_client()
    key = _credential_cache_key(user_id)
    await client.delete(key)


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
    key = _temporal_preference_cache_key(user_id)
    
    await client.setex(key, ttl, str(temporal_preference))


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
    key = _temporal_preference_cache_key(user_id)
    
    data = await client.get(key)
    if data:
        return int(data)
    return None


async def invalidate_temporal_preference_cache(user_id: Union[str, uuid.UUID]) -> None:
    """
    Invalida cache de preferência temporal do usuário.
    
    Args:
        user_id: UUID do usuário
    """
    client = await get_redis_client()
    key = _temporal_preference_cache_key(user_id)
    await client.delete(key)


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
    key = _momentum_cache_key(user_id)
    
    await client.setex(key, ttl, str(momentum_score))


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
    key = _momentum_cache_key(user_id)
    
    data = await client.get(key)
    if data:
        return int(data)
    return None


async def invalidate_momentum_cache(user_id: Union[str, uuid.UUID]) -> None:
    """
    Invalida cache de momentum do usuário.
    
    Args:
        user_id: UUID do usuário
    """
    client = await get_redis_client()
    key = _momentum_cache_key(user_id)
    await client.delete(key)


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
    key = _frontier_cache_key(user_id, constraints_hash)
    
    await client.setex(
        key,
        ttl,
        json.dumps(frontier_data, default=str)
    )


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
    key = _frontier_cache_key(user_id, constraints_hash)
    
    data = await client.get(key)
    if data:
        return json.loads(data)
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
    
    if constraints_hash:
        # Invalidar cache específico
        key = _frontier_cache_key(user_id, constraints_hash)
        await client.delete(key)
    else:
        # Invalidar todos os caches de fronteira do usuário
        pattern = f"frontier:user:{user_id}:*"
        keys = await client.keys(pattern)
        if keys:
            await client.delete(*keys)


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
    
    serialized = json.dumps(value, default=str)
    
    if ttl:
        await client.setex(key, ttl, serialized)
    else:
        await client.set(key, serialized)


async def cache_get(key: str) -> Optional[Any]:
    """
    Obtém valor genérico do cache.
    
    Args:
        key: Chave do cache
        
    Returns:
        Valor armazenado ou None se não existir
    """
    client = await get_redis_client()
    
    data = await client.get(key)
    if data:
        return json.loads(data)
    return None


async def cache_delete(key: str) -> None:
    """
    Remove valor do cache.
    
    Args:
        key: Chave do cache
    """
    client = await get_redis_client()
    await client.delete(key)


async def cache_exists(key: str) -> bool:
    """
    Verifica se chave existe no cache.
    
    Args:
        key: Chave do cache
        
    Returns:
        True se existir, False caso contrário
    """
    client = await get_redis_client()
    return await client.exists(key) > 0
