"""Google OAuth endpoint — verifies Google ID token, creates or logs in user."""

import uuid
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import create_token_pair
from app.db.models.user import User
from app.db.session import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
OAUTH_SENTINEL_PASSWORD = "!oauth:google:"  # Never matches a bcrypt hash


class GoogleOAuthRequest(BaseModel):
    credential: str


class OAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_new_user: bool = False


async def _verify_google_token(credential: str, client_id: str | None) -> dict:
    """Call Google tokeninfo endpoint and return the verified payload."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(GOOGLE_TOKENINFO_URL, params={"id_token": credential})

    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token Google inválido")

    payload = response.json()

    if "error" in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token Google inválido")

    # Verify audience matches our client ID when configured
    if client_id and payload.get("aud") != client_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não pertence a esta aplicação")

    if not payload.get("email"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email não fornecido pelo Google")

    return payload


@router.post("/oauth/google", response_model=OAuthResponse)
async def google_oauth(body: GoogleOAuthRequest, db: AsyncSession = Depends(get_db)):
    settings = get_settings()

    payload = await _verify_google_token(body.credential, settings.google_client_id)

    email: str = payload["email"].lower().strip()
    full_name: str | None = payload.get("name")
    avatar_url: str | None = payload.get("picture")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    is_new_user = False

    if user is None:
        is_new_user = True
        username_base = email.split("@")[0]
        user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=OAUTH_SENTINEL_PASSWORD,
            full_name=full_name,
            avatar_url=avatar_url,
            is_active=True,
            is_verified=True,  # Google already verified the email
            language="pt-BR",
            timezone="America/Sao_Paulo",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info("New user created via Google OAuth: %s", email)
    else:
        # Update avatar/name from Google if not set
        changed = False
        if not user.avatar_url and avatar_url:
            user.avatar_url = avatar_url
            changed = True
        if not user.full_name and full_name:
            user.full_name = full_name
            changed = True
        if changed:
            await db.commit()

    access_token, refresh_token = create_token_pair(
        user_id=str(user.id),
        email=user.email,
        role=user.role.value,
    )

    return OAuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        is_new_user=is_new_user,
    )
