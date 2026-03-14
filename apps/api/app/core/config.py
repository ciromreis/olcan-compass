from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App settings
    app_name: str = "olcan-compass-api"
    env: str = "development"
    api_prefix: str = "/api"

    # CORS
    cors_allow_origins: str = "http://localhost:3000,http://localhost:3001,https://olcan-compass-web.netlify.app,https://compass.olcan.com.br"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/compass"

    # Redis and Celery
    redis_url: str = "redis://redis:6379/0"

    # JWT settings
    jwt_secret_key: str = "change-this-to-a-secure-random-string-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    # Password settings
    password_min_length: int = 8
    password_require_uppercase: bool = True
    password_require_number: bool = True

    # Security
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 30

    # Frontend / transactional email
    frontend_url: str = "http://localhost:3000"
    email_from: str = "noreply@olcan.com"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False

    # Stripe Connect (for escrow)
    stripe_secret_key: str = "sk_test_your_stripe_secret_key"
    stripe_publishable_key: str = "pk_test_your_stripe_publishable_key"
    stripe_webhook_secret: str = "whsec_your_webhook_secret"

    # Encryption (for PII hashing)
    encryption_key: str = "your-32-byte-encryption-key-change-in-production"

    # Feature Flags
    feature_credentials_enabled: bool = True
    feature_temporal_matching_enabled: bool = True
    feature_opportunity_cost_enabled: bool = True
    feature_escrow_enabled: bool = True
    feature_scenario_optimization_enabled: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
