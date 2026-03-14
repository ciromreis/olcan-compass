from fastapi import APIRouter, Depends, HTTPException, status
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
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.token import (
    AuthRegisterRequest,
    AuthLoginRequest,
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

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()
security = HTTPBearer()


def build_verification_url(token: str) -> str:
    return f"{settings.frontend_url.rstrip('/')}/verify-email?token={token}"


def build_password_reset_url(token: str) -> str:
    return f"{settings.frontend_url.rstrip('/')}/reset-password/confirm?token={token}"


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: AuthRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Registrar novo usuário com email e senha"""
    normalized_email = request.email.strip().lower()

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
    if not validate_password_strength(request.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha não atende aos requisitos"
        )
    
    # Create new user
    verification_token, verification_expires = generate_verification_token()
    new_user = User(
        email=normalized_email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        verification_token=verification_token,
        verification_token_expires=verification_expires,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

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
        token=Token(
            access_token=access_token,
            refresh_token=refresh_token
        )
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: AuthLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login com email e senha"""
    user = await authenticate_user(request.email, request.password, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token, refresh_token = create_token_pair(
        str(user.id),
        user.email,
        user.role.value
    )
    
    return AuthResponse(
        user_id=str(user.id),
        email=user.email,
        role=user.role.value,
        token=Token(
            access_token=access_token,
            refresh_token=refresh_token
        )
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
async def get_me(current_user: User = Depends(get_current_user)):
    """Obter perfil do usuário atual"""
    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        language=current_user.language,
        timezone=current_user.timezone,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )


@router.put("/me", response_model=UserProfileResponse)
async def update_me(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualizar perfil do usuário atual"""
    if request.full_name is not None:
        current_user.full_name = request.full_name
    if request.avatar_url is not None:
        current_user.avatar_url = request.avatar_url
    if request.language is not None:
        current_user.language = request.language
    if request.timezone is not None:
        current_user.timezone = request.timezone
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        language=current_user.language,
        timezone=current_user.timezone,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )


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
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Solicitar recuperação de senha"""
    normalized_email = request.email.strip().lower()

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

    settings = get_settings()
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
