"""Enhanced health check system with comprehensive diagnostics.

Provides multiple health check endpoints:
- /health - Basic liveness probe (for load balancers)
- /health/ready - Readiness probe (for Kubernetes/service mesh)
- /health/detailed - Detailed diagnostics (for monitoring)
- /health/metrics - System metrics (for dashboards)
"""

import time
import psutil
from datetime import datetime, timezone
from importlib.metadata import version, PackageNotFoundError
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db

router = APIRouter()

# Record startup time
_START_TIME = time.time()


def _get_version() -> str:
    """Return app version from package metadata, or 'dev'."""
    try:
        return version("olcan-compass-api")
    except PackageNotFoundError:
        return "dev"


# ============================================================
# Basic Health Check (Liveness Probe)
# ============================================================

@router.get("/health", summary="Basic health check")
async def health(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Liveness probe used by Render and load-balancers.
    
    Always returns HTTP 200 so Render never marks the container as unhealthy.
    DB connectivity status is reported in the response body.
    """
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unavailable: {exc}"

    return {
        "status": "ok",
        "db": db_status,
        "uptime_seconds": round(time.time() - _START_TIME),
        "version": _get_version(),
    }


# ============================================================
# Readiness Probe
# ============================================================

@router.get("/health/ready", summary="Readiness probe")
async def health_ready(db: AsyncSession = Depends(get_db)):
    """
    Readiness probe for Kubernetes/service mesh.
    
    Returns 200 only if all critical dependencies are available.
    Returns 503 if not ready to serve traffic.
    """
    checks = {}
    all_healthy = True

    # Check database
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = {"status": "healthy", "latency_ms": None}
    except Exception as exc:
        checks["database"] = {"status": "unhealthy", "error": str(exc)}
        all_healthy = False

    # Check Redis (if configured)
    if settings.redis_url:
        try:
            import redis
            r = redis.from_url(settings.redis_url)
            r.ping()
            checks["redis"] = {"status": "healthy"}
        except Exception as exc:
            checks["redis"] = {"status": "unhealthy", "error": str(exc)}
            all_healthy = False

    # Check Stripe (if configured)
    if settings.stripe_secret_key:
        try:
            import stripe
            stripe.api_key = settings.stripe_secret_key
            # Simple API call to verify key works
            stripe.Balance.retrieve()
            checks["stripe"] = {"status": "healthy"}
        except Exception as exc:
            checks["stripe"] = {"status": "unhealthy", "error": str(exc)}
            all_healthy = False

    if not all_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "not_ready",
                "checks": checks,
            }
        )

    return {
        "status": "ready",
        "checks": checks,
        "version": _get_version(),
    }


# ============================================================
# Detailed Health Check
# ============================================================

@router.get("/health/detailed", summary="Detailed health diagnostics")
async def health_detailed(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Detailed health diagnostics for monitoring and debugging.
    
    Includes system metrics, dependency status, and configuration.
    """
    import psutil

    # System metrics
    process = psutil.Process()
    memory_info = process.memory_info()
    
    system_metrics = {
        "cpu_percent": process.cpu_percent(),
        "memory_rss_mb": round(memory_info.rss / 1024 / 1024, 2),
        "memory_vms_mb": round(memory_info.vms / 1024 / 1024, 2),
        "threads": process.num_threads(),
        "open_files": len(process.open_files()),
        "connections": len(process.net_connections()),
    }

    # Database metrics
    db_metrics = {}
    try:
        start = time.time()
        await db.execute(text("SELECT 1"))
        db_metrics["latency_ms"] = round((time.time() - start) * 1000, 2)
        db_metrics["status"] = "healthy"
        
        # Get database size
        result = await db.execute(text("""
            SELECT pg_size_pretty(pg_database_size(current_database())) as size
        """))
        db_size = result.scalar()
        db_metrics["database_size"] = db_size
        
        # Get connection count
        result = await db.execute(text("""
            SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()
        """))
        db_metrics["active_connections"] = result.scalar()
        
    except Exception as exc:
        db_metrics["status"] = "unhealthy"
        db_metrics["error"] = str(exc)

    # Application info
    app_info = {
        "version": _get_version(),
        "environment": settings.environment,
        "uptime_seconds": round(time.time() - _START_TIME),
        "uptime_hours": round((time.time() - _START_TIME) / 3600, 2),
        "started_at": datetime.fromtimestamp(_START_TIME, tz=timezone.utc).isoformat(),
    }

    # Configuration status
    config_status = {
        "database": "configured" if settings.database_url else "not_configured",
        "redis": "configured" if settings.redis_url else "not_configured",
        "stripe": "configured" if settings.stripe_secret_key else "not_configured",
        "sentry": "configured" if settings.sentry_dsn else "not_configured",
        "twenty_crm": "configured" if settings.twenty_api_key else "not_configured",
        "mautic": "configured" if settings.mautic_api_key else "not_configured",
    }

    return {
        "status": "healthy" if db_metrics.get("status") == "healthy" else "degraded",
        "system": system_metrics,
        "database": db_metrics,
        "application": app_info,
        "configuration": config_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================
# System Metrics
# ============================================================

@router.get("/health/metrics", summary="System metrics")
async def health_metrics() -> dict:
    """
    System metrics for monitoring dashboards.
    
    Returns Prometheus-compatible metrics.
    """
    import psutil

    process = psutil.Process()
    memory_info = process.memory_info()
    
    # System metrics
    system = {
        "cpu_percent": process.cpu_percent(),
        "memory_rss_bytes": memory_info.rss,
        "memory_vms_bytes": memory_info.vms,
        "memory_percent": process.memory_percent(),
        "threads": process.num_threads(),
    }

    # Process metrics
    process_metrics = {
        "uptime_seconds": round(time.time() - _START_TIME),
        "create_time": process.create_time(),
    }

    # Disk metrics
    disk = psutil.disk_usage('/')
    disk_metrics = {
        "disk_total_bytes": disk.total,
        "disk_used_bytes": disk.used,
        "disk_free_bytes": disk.free,
        "disk_percent": disk.percent,
    }

    return {
        "system": system,
        "process": process_metrics,
        "disk": disk_metrics,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================
# Dependency Status
# ============================================================

@router.get("/health/dependencies", summary="Dependency status")
async def health_dependencies(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Check status of all external dependencies.
    """
    dependencies = {}

    # Database
    try:
        start = time.time()
        await db.execute(text("SELECT 1"))
        latency = round((time.time() - start) * 1000, 2)
        dependencies["database"] = {
            "status": "healthy",
            "latency_ms": latency,
            "url": settings.database_url.split('@')[-1] if settings.database_url else None,
        }
    except Exception as exc:
        dependencies["database"] = {
            "status": "unhealthy",
            "error": str(exc),
        }

    # Redis
    if settings.redis_url:
        try:
            import redis
            start = time.time()
            r = redis.from_url(settings.redis_url)
            r.ping()
            latency = round((time.time() - start) * 1000, 2)
            dependencies["redis"] = {
                "status": "healthy",
                "latency_ms": latency,
            }
        except Exception as exc:
            dependencies["redis"] = {
                "status": "unhealthy",
                "error": str(exc),
            }

    # Stripe
    if settings.stripe_secret_key:
        try:
            import stripe
            stripe.api_key = settings.stripe_secret_key
            start = time.time()
            stripe.Balance.retrieve()
            latency = round((time.time() - start) * 1000, 2)
            dependencies["stripe"] = {
                "status": "healthy",
                "latency_ms": latency,
            }
        except Exception as exc:
            dependencies["stripe"] = {
                "status": "unhealthy",
                "error": str(exc),
            }

    # Twenty CRM
    if settings.twenty_base_url:
        try:
            import httpx
            start = time.time()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.twenty_base_url}/graphql",
                    timeout=5.0,
                )
            latency = round((time.time() - start) * 1000, 2)
            dependencies["twenty_crm"] = {
                "status": "healthy" if response.status_code == 200 else "degraded",
                "latency_ms": latency,
            }
        except Exception as exc:
            dependencies["twenty_crm"] = {
                "status": "unhealthy",
                "error": str(exc),
            }

    # Mautic
    if settings.mautic_base_url:
        try:
            import httpx
            start = time.time()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.mautic_base_url}/api/contacts",
                    timeout=5.0,
                )
            latency = round((time.time() - start) * 1000, 2)
            dependencies["mautic"] = {
                "status": "healthy" if response.status_code == 200 else "degraded",
                "latency_ms": latency,
            }
        except Exception as exc:
            dependencies["mautic"] = {
                "status": "unhealthy",
                "error": str(exc),
            }

    return {
        "dependencies": dependencies,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
