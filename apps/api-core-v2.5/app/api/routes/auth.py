from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from jose import JWTError, jwt
import uuid
from datetime import datetime, timezone

from app.core.config import get_settings
from app.core.security import hash_password, create_token_pair, verify_password
from app.core.security.tokens import generate_verification_token, generate_password_reset_token
from app.core.auth import (
    get_current_user, 
    authenticate_user, 
    validate_password_strength
)
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.token import (
    AuthRegisterRequest,
    AuthResponse,
    Token,
    UserProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    VerificationResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    PasswordResetResponse,
    OrganizationAccessRequest,
)
from app.services.email import (
    EmailDeliveryError,
    send_organization_access_request_email,
    send_password_reset_email,
    send_verification_email,
)
from app.services.opportunity_cost import (
    calculate_cumulative_opportunity_cost,
    calculate_user_momentum,
)
from app.db.models.psychology import PsychProfile
from sqlalchemy import select
from app.services.crm_sync_orchestrator import on_user_registered, on_email_verified

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()
security = HTTPBearer()


def _user_profile_response(user: User) -> UserProfileResponse:
    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        language=user.language,
        timezone=user.timezone,
        role=user.role.value,
        is_verified=user.is_verified,
        is_premium=user.is_premium,
        created_at=user.created_at,
    )


async def _build_user_profile_response(user: User, db: AsyncSession) -> UserProfileResponse:
    profile = _user_profile_response(user)
    
    # Economics Telemetry
    try:
        # Get active route to find an opportunity for cost calculation
        # If no routes, use defaults in service
        from app.db.models.route import Route
        route_result = await db.execute(
            select(Route).where(Route.user_id == user.id, Route.is_active == True).limit(1)
        )
        active_route = route_result.scalar_one_or_none()
        
        # Calculate Economics
        momentum = await calculate_user_momentum(user.id, db)
        profile.momentum = {"momentum_score": momentum, "last_activity_days": 0} # Simplified for now
        
        if active_route and active_route.opportunity_id:
            econ_data = await calculate_cumulative_opportunity_cost(user.id, active_route.opportunity_id, db)
            profile.economics = econ_data
        else:
            # Default/Fallback economics if no active route
            profile.economics = {
                'daily_cost': 136.98, # R$ 50k / 365 default
                'monthly_cost': 4109.58,
                'yearly_cost': 50000.0,
                'cumulative_cost': 0.0,
                'days_since_start': 0,
                'currency': 'BRL'
            }
    except Exception:
        # Silent fail for telemetry logic to avoid breaking login
        pass

    # Psychology / OIOS Archetype
    try:
        psych_result = await db.execute(
            select(PsychProfile).where(PsychProfile.user_id == user.id)
        )
        psych = psych_result.scalar_one_or_none()
        if psych:
            profile.psychology = psych
    except Exception:
        pass

    return profile


def build_verification_url(token: str) -> str:
    return f"{settings.frontend_url.rstrip('/')}/verify-email?token={token}"


def build_password_reset_url(token: str) -> str:
    return f"{settings.frontend_url.rstrip('/')}/reset-password/confirm?token={token}"


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(
    request: Request,
    payload: AuthRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Registrar novo usuário com email e senha"""
    normalized_email = payload.email.strip().lower()

    # Check if user already exists
    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized_email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Validate password strength
    if not validate_password_strength(payload.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha não atende aos requisitos"
        )
    
    # Create new user
    verification_token, verification_expires = generate_verification_token()
    new_user = User(
        email=normalized_email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        verification_token=verification_token,
        verification_token_expires=verification_expires,
        language=settings.default_user_language,
        timezone=settings.default_user_timezone,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # CRM sync — fire-and-forget style (orchestrator catches all exceptions)
    await on_user_registered(db, new_user, source="web_registration")

    try:
        await send_verification_email(
            to_email=new_user.email,
            full_name=new_user.full_name,
            verification_url=build_verification_url(verification_token),
        )
    except EmailDeliveryError as exc:
        if settings.env == "production":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            )
    
    # Create tokens
    access_token, refresh_token = create_token_pair(
        str(new_user.id),
        new_user.email,
        new_user.role.value
    )
    
    return AuthResponse(
        user_id=str(new_user.id),
        email=new_user.email,
        role=new_user.role.value,
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    """Login com email e senha — aceita JSON (`email`/`password`) ou form OAuth2 (`username`/`password`)."""
    content_type = (request.headers.get("content-type") or "").lower()
    email: str | None = None
    password: str | None = None

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            body = {}
        if isinstance(body, dict):
            email = body.get("email")
            password = body.get("password")
    else:
        form = await request.form()
        raw_user = form.get("username") or form.get("email")
        email = str(raw_user) if raw_user is not None else None
        raw_pw = form.get("password")
        password = str(raw_pw) if raw_pw is not None else None

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email e senha são obrigatórios",
        )

    user = await authenticate_user(str(email), str(password), db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token, refresh_token = create_token_pair(
        str(user.id),
        user.email,
        user.role.value,
    )

    return AuthResponse(
        user_id=str(user.id),
        email=user.email,
        role=user.role.value,
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Atualizar token de acesso usando token de atualização"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tipo de token inválido"
            )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user - convert to UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo"
        )
    
    # Create new token pair
    access_token, refresh_token = create_token_pair(
        str(user.id),
        user.email,
        user.role.value
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/logout")
async def logout():
    """Logout - o cliente deve descartar os tokens"""
    return {"message": "Logout realizado com sucesso"}


@router.get("/me", response_model=UserProfileResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obter perfil do usuário atual com telemetria Omega"""
    return await _build_user_profile_response(current_user, db)


@router.put("/me", response_model=UserProfileResponse)
async def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualizar perfil do usuário atual"""
    data = payload.model_dump(exclude_unset=True)
    for key in ("language", "timezone"):
        if key in data and data[key] is None:
            del data[key]
    if "full_name" in data:
        current_user.full_name = data["full_name"]
    if "avatar_url" in data:
        current_user.avatar_url = data["avatar_url"]
    if "language" in data:
        current_user.language = data["language"]
    if "timezone" in data:
        current_user.timezone = data["timezone"]

    await db.commit()
    await db.refresh(current_user)

    return await _build_user_profile_response(current_user, db)


@router.put("/me/password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Alterar senha do usuário"""
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    # Validate new password
    if not validate_password_strength(request.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nova senha não atende aos requisitos"
        )
    
    # Update password
    current_user.hashed_password = hash_password(request.new_password)
    await db.commit()
    
    return {"message": "Senha atualizada com sucesso"}


# --- Email Verification Endpoints ---

@router.post("/verify-email", response_model=VerificationResponse)
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verificar email com token"""
    result = await db.execute(
        select(User).where(User.verification_token == request.token)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de verificação inválido"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já verificado"
        )
    
    if user.verification_token_expires and user.verification_token_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de verificação expirado"
        )
    
    user.is_verified = True
    user.verified_at = datetime.now(timezone.utc)
    user.verification_token = None
    user.verification_token_expires = None

    await db.commit()

    # CRM sync — tag user as verified
    await on_email_verified(db, user)

    return VerificationResponse(
        message="Email verificado com sucesso",
        is_verified=True
    )


@router.post("/resend-verification", response_model=dict)
async def resend_verification(
    request: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Reenviar email de verificação"""
    normalized_email = request.email.strip().lower()

    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized_email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return {"message": "Se o email existir, um novo link de verificação será enviado"}
    
    if user.is_verified:
        return {"message": "Email já verificado"}
    
    # Generate new token
    token, expires = generate_verification_token()
    user.verification_token = token
    user.verification_token_expires = expires
    
    await db.commit()
    
    try:
        await send_verification_email(
            to_email=user.email,
            full_name=user.full_name,
            verification_url=build_verification_url(token),
        )
    except EmailDeliveryError as exc:
        if settings.env == "production":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            )

    return {"message": "Link de verificação enviado"}


@router.post("/request-organization-access", response_model=dict)
async def request_organization_access(
    request: OrganizationAccessRequest,
    current_user: User = Depends(get_current_user),
):
    """Registrar pedido de onboarding institucional"""
    try:
        await send_organization_access_request_email(
            requester_email=current_user.email,
            requester_name=current_user.full_name,
            organization_name=request.organization_name.strip(),
            requested_role=request.requested_role.strip(),
        )
    except EmailDeliveryError as exc:
        if settings.env == "production":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            )

    return {
        "message": "Pedido institucional registrado. Nossa equipe fará o onboarding manual."
    }


# --- Password Reset Endpoints ---

@router.post("/forgot-password", response_model=dict)
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Solicitar recuperação de senha"""
    normalized_email = payload.email.strip().lower()

    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized_email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return {"message": "Se o email existir, um link de recuperação será enviado"}
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta desativada"
        )
    
    # Rate limiting: max 3 password resets per day
    if user.password_reset_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Número máximo de tentativas excedido. Tente novamente amanhã."
        )
    
    # Generate reset token
    token, expires = generate_password_reset_token()
    user.password_reset_token = token
    user.password_reset_token_expires = expires
    user.password_reset_count += 1
    
    await db.commit()
    
    reset_url = build_password_reset_url(token)
    try:
        await send_password_reset_email(
            to_email=user.email,
            full_name=user.full_name,
            reset_url=reset_url,
        )
    except EmailDeliveryError as exc:
        if settings.env == "production":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            )

    if settings.env != "production":
        return {
            "message": "Link de recuperação gerado (modo desenvolvimento)",
            "token": token,
            "reset_url": reset_url,
        }

    return {"message": "Link de recuperação enviado"}


@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Redefinir senha com token"""
    result = await db.execute(
        select(User).where(User.password_reset_token == request.token)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de redefinição inválido"
        )
    
    if user.password_reset_token_expires and user.password_reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de redefinição expirado"
        )
    
    if not validate_password_strength(request.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nova senha não atende aos requisitos"
        )
    
    user.hashed_password = hash_password(request.new_password)
    user.password_reset_token = None
    user.password_reset_token_expires = None
    
    await db.commit()
    
    return PasswordResetResponse(
        message="Senha redefinida com sucesso"
    )
