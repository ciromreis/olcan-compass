"""Narrative Forge — AI Polish endpoint.

POST /forge/{narrative_id}/polish
  - Requires auth
  - Costs 1 forge credit per call
  - Returns polished text + diff summary
  - Saves the result as a new NarrativeVersion
"""

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User, Narrative, NarrativeVersion
from app.core.ai_engines import ForgePolishEngine
from app.core.ai_service import AIProvider, get_ai_service, get_ai_provider_enum

router = APIRouter(prefix="/forge", tags=["Narrative Forge"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class PolishRequest(BaseModel):
    methodology: Literal["STAR", "CAR", "free"] = "STAR"
    target_word_count: int = Field(default=650, ge=50, le=2000)


class PolishResponse(BaseModel):
    narrative_id: uuid.UUID
    new_version_id: uuid.UUID
    polished_content: str
    changes_summary: str
    word_count_before: int
    word_count_after: int
    methodology_applied: str
    credits_remaining: int


class CreditsResponse(BaseModel):
    forge_credits: int


class DirectPolishRequest(BaseModel):
    content: str = Field(..., min_length=10, description="Text content to polish")
    methodology: Literal["STAR", "CAR", "free"] = "STAR"
    target_word_count: int = Field(default=650, ge=50, le=2000)


class DirectPolishResponse(BaseModel):
    polished_content: str
    changes_summary: str
    word_count_before: int
    word_count_after: int
    methodology_applied: str
    credits_remaining: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_narrative_or_404(
    narrative_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession
) -> Narrative:
    result = await db.execute(
        select(Narrative).where(
            Narrative.id == narrative_id,
            Narrative.user_id == user_id,
        )
    )
    narrative = result.scalar_one_or_none()
    if not narrative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Narrative not found.",
        )
    return narrative


async def _get_current_content(narrative: Narrative, db: AsyncSession) -> str:
    """Return the content of the current version, or empty string."""
    if not narrative.current_version_id:
        return ""
    result = await db.execute(
        select(NarrativeVersion).where(NarrativeVersion.id == narrative.current_version_id)
    )
    version = result.scalar_one_or_none()
    return version.content if version else ""


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/credits", response_model=CreditsResponse)
async def get_credits(
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's remaining Forge credits."""
    return CreditsResponse(forge_credits=current_user.forge_credits)


@router.post("/polish", response_model=DirectPolishResponse)
async def polish_content_direct(
    request: DirectPolishRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Polish arbitrary text content using AI without requiring a backend narrative.

    Used by the frontend forge editor for local documents.
    Costs 1 Forge credit. Usage is logged but no NarrativeVersion is created.
    """
    if current_user.forge_credits < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient Forge credits. Purchase more credits to continue.",
        )

    ai_provider = get_ai_provider_enum()
    engine = ForgePolishEngine(db=db, provider=ai_provider)
    result = await engine.polish(
        content=request.content,
        methodology=request.methodology,
        target_word_count=request.target_word_count,
        user=current_user,
        narrative_id=None,
    )

    current_user.forge_credits -= 1

    from app.db.models.billing import ForgeUsageLog
    db.add(ForgeUsageLog(
        user_id=current_user.id,
        narrative_id=None,
        ai_provider=ai_provider.value,
        methodology=request.methodology,
        input_word_count=result.word_count_before,
        output_word_count=result.word_count_after,
    ))
    await db.commit()

    return DirectPolishResponse(
        polished_content=result.polished_content,
        changes_summary=result.changes_summary,
        word_count_before=result.word_count_before,
        word_count_after=result.word_count_after,
        methodology_applied=result.methodology_applied,
        credits_remaining=current_user.forge_credits,
    )


@router.post("/{narrative_id}/polish", response_model=PolishResponse)
async def polish_narrative(
    narrative_id: uuid.UUID,
    request: PolishRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Polish a narrative document using AI.

    Costs 1 Forge credit. The polished text is saved as a new NarrativeVersion
    and becomes the narrative's current version.
    """
    # Credit check
    if current_user.forge_credits < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient Forge credits. Purchase more credits to continue.",
        )

    narrative = await _get_narrative_or_404(narrative_id, current_user.id, db)
    content = await _get_current_content(narrative, db)

    if not content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Narrative has no content to polish. Add text first.",
        )

    # Run AI polish — provider determined by AI_PROVIDER env var (see config.py)
    ai_provider = get_ai_provider_enum()
    engine = ForgePolishEngine(db=db, provider=ai_provider)
    result = await engine.polish(
        content=content,
        methodology=request.methodology,
        target_word_count=request.target_word_count,
        user=current_user,
        narrative_id=narrative_id,
    )

    # Persist new version
    new_version = NarrativeVersion(
        narrative_id=narrative_id,
        version_number=narrative.version_count + 1,
        content=result.polished_content,
        content_plain=result.polished_content,
        word_count=result.word_count_after,
        change_summary=f"AI Polish ({request.methodology}): {result.changes_summary[:200]}",
    )
    db.add(new_version)
    await db.flush()  # get new_version.id

    # Update narrative metadata
    narrative.current_version_id = new_version.id
    narrative.version_count += 1
    narrative.updated_at = datetime.now(timezone.utc)

    # Deduct credit and log usage
    current_user.forge_credits -= 1

    from app.db.models.billing import ForgeUsageLog  # imported here to avoid circular
    db.add(ForgeUsageLog(
        user_id=current_user.id,
        narrative_id=narrative_id,
        ai_provider=ai_provider.value,
        methodology=request.methodology,
        input_word_count=result.word_count_before,
        output_word_count=result.word_count_after,
    ))

    await db.commit()

    return PolishResponse(
        narrative_id=narrative_id,
        new_version_id=new_version.id,
        polished_content=result.polished_content,
        changes_summary=result.changes_summary,
        word_count_before=result.word_count_before,
        word_count_after=result.word_count_after,
        methodology_applied=result.methodology_applied,
        credits_remaining=current_user.forge_credits,
    )
