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


@router.get("/seed-db-render", summary="Trigger DB seed from browser (Render hack)")
async def trigger_seed_render(secret_key: str = ""):
    """Run seed scripts remotely since Render shell is not available."""
    if secret_key != "olcan2026omega":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    import os, sys
    from subprocess import Popen, PIPE
    
    # scripts/seed_all.py is located at apps/api-core-v2.5/scripts/seed_all.py
    # Under Docker, apps/api-core-v2.5/ is the root (/app)
    # health.py is at /app/app/api/routes/health.py
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    script_path = os.path.join(base_dir, "scripts", "seed_all.py")
    
    # Let's ensure we are targeting the actual script
    if not os.path.exists(script_path):
        return {"error": f"Path not found: {script_path}", "cwd": os.getcwd()}
    
    try:
        process = Popen([sys.executable, script_path], stdout=PIPE, stderr=PIPE)
        stdout, stderr = process.communicate(timeout=60)
        
        return {
            "status": "Seed Process Executed" if process.returncode == 0 else "Seed Process Failed",
            "stdout": stdout.decode("utf-8", errors="ignore"),
            "stderr": stderr.decode("utf-8", errors="ignore"),
            "returncode": process.returncode
        }
    except Exception as e:
        return {"error": str(e)}


