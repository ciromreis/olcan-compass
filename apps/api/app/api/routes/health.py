import time
from importlib.metadata import version, PackageNotFoundError

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()

# Record startup time so we can report uptime
_START_TIME = time.time()


def _get_version() -> str:
    """Return app version from package metadata, or 'dev'."""
    try:
        return version("olcan-compass-api")
    except PackageNotFoundError:
        return "dev"


@router.get("/health", summary="Health check")
async def health(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Liveness + readiness probe used by Render and load-balancers.

    Returns HTTP 200 with ``{"status": "ok"}`` when the service is healthy.
    Returns HTTP 503 if the database is unreachable.
    """
    from fastapi import HTTPException

    # DB ping
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001
        db_status = f"unavailable ({exc})"
        raise HTTPException(status_code=503, detail={"status": "degraded", "db": db_status})

    return {
        "status": "ok",
        "db": db_status,
        "uptime_seconds": round(time.time() - _START_TIME),
        "version": _get_version(),
    }

