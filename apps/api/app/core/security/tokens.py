import secrets
from datetime import datetime, timedelta, timezone


def generate_secure_token() -> str:
    """Generate a cryptographically secure token"""
    return secrets.token_urlsafe(32)


def generate_verification_token() -> tuple[str, datetime]:
    """Generate verification token with expiration (24 hours)"""
    token = generate_secure_token()
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    return token, expires


def generate_password_reset_token() -> tuple[str, datetime]:
    """Generate password reset token with expiration (1 hour)"""
    token = generate_secure_token()
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    return token, expires
