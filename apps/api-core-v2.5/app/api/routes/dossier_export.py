"""Master Strategic Dossier Export API.

This endpoint generates a unified PDF that combines:
- User's psychological profile (OIOS archetype, readiness)
- Active route with milestones
- Pending tasks
- Created documents (CVs, essays, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from uuid import UUID

from app.core.auth import get_current_user_id
from app.services.dossier_orchestrator import get_master_dossier_for_user, MasterDossierPayload
from app.utils.pdf_renderer import generate_dossier_pdf

router = APIRouter(prefix="/api/v1/dossier", tags=["Dossier"])


@router.get("/export", name="export_dossier_pdf")
async def export_master_dossier_pdf(
    user_id: str = Depends(get_current_user_id)
):
    """Export Master Strategic Dossier as PDF.
    
    This aggregates:
    - Identity & Readiness (OIOS profile)
    - Strategic Route (milestones)
    - Upcoming Tasks
    - Execution Artifacts (documents)
    
    Returns a PDF file with the Olcan 'Clinical Boutique' aesthetic.
    """
    try:
        user_uuid = UUID(user_id)
        
        # 1. Build the Master Dossier Payload
        payload = await get_master_dossier_for_user(user_uuid)
        
        # 2. Render as PDF
        pdf_bytes = await generate_dossier_pdf(payload)
        
        # 3. Return as streaming response
        filename = f"olcan_dossier_{payload.metadata.user_name.replace(' ', '_')}_{payload.metadata.generated_at.strftime('%Y%m%d')}.pdf"
        
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")


@router.get("/payload", name="get_dossier_payload")
async def get_dossier_payload(
    user_id: str = Depends(get_current_user_id)
) -> MasterDossierPayload:
    """Get the raw Master Dossier payload as JSON.
    
    Useful for debugging or for the frontend to preview data.
    """
    try:
        user_uuid = UUID(user_id)
        return await get_master_dossier_for_user(user_uuid)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))