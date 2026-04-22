"""Dossier-specific API routes.

These are mounted separately to avoid route collision with /routes/{route_id}.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User
from app.services.dossier_orchestrator import get_master_dossier_for_user
from app.utils.pdf_renderer import generate_dossier_pdf

router = APIRouter(prefix="", tags=["Dossier"])


@router.get("/dossier-export", tags=["Dossier"])
async def export_dossier_html(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    """Export Master Strategic Dossier as HTML.
    
    Returns HTML that can be saved as PDF.
    """
    try:
        payload = await get_master_dossier_for_user(current_user.id)
        html_bytes = await generate_dossier_pdf(payload)
        
        filename = f"olcan_dossier_{payload.metadata.user_name.replace(' ', '_')}_{payload.metadata.generated_at.strftime('%Y%m%d')}.html"
        
        return StreamingResponse(
            iter([html_bytes]),
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate: {str(e)}")


@router.get("/dossier-payload", tags=["Dossier"])
async def get_dossier_payload(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    """Get raw dossier payload as JSON."""
    try:
        return await get_master_dossier_for_user(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))