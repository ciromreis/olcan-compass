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
    Liveness probe used by Render and load-balancers.

    Always returns HTTP 200 so Render never marks the container as unhealthy.
    DB connectivity status is reported in the response body.
    """
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001
        # Report the error in the body without crashing — the app can still
        # serve requests that don't need a DB-dependent context.
        db_status = f"unavailable: {exc}"

    return {
        "status": "ok",
        "db": db_status,
        "uptime_seconds": round(time.time() - _START_TIME),
        "version": _get_version(),
    }


