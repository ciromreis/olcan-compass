from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App settings
    app_name: str = "olcan-compass-api"
    env: str = "development"
    api_prefix: str = "/api"
    debug: bool = False
    log_level: str = "INFO"

    # CORS
    cors_allow_origins: str = "http://localhost:3000,http://localhost:3001,https://olcan-compass-web.netlify.app,https://compass.olcan.com.br"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/compass"
    database_echo: bool = False
    db_pool_size: int = 20
    db_max_overflow: int = 40
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800

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

    # Defaults for new user profiles (Olcan Compass primary locale)
    default_user_language: str = "pt-BR"
    default_user_timezone: str = "America/Sao_Paulo"

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

    # Commerce engine bridge
    marketplace_engine_url: str = "http://localhost:9000"
    marketplace_publishable_key: str = ""
    commerce_catalog_url: str = "http://localhost:3001/marketplace"
    commerce_checkout_curso_cidadao_mundo_url: str = "https://pay.hotmart.com/N97314230U"
    commerce_checkout_kit_application_url: str = "https://pay.hotmart.com/X85073158P"
    commerce_checkout_rota_internacionalizacao_url: str = "https://pay.hotmart.com/K97966494E"

    # Encryption (for PII hashing)
    encryption_key: str = "your-32-byte-encryption-key-change-in-production"

    # ============================================================
    # CRM Integration (Twenty + Mautic bridge)
    # ============================================================
    twenty_base_url: str | None = None  # e.g. https://crm.olcan.com.br
    twenty_api_key: str | None = None   # Settings → APIs & Webhooks → API Keys
    twenty_webhook_secret: str | None = None

    mautic_base_url: str | None = None  # e.g. https://mautic.olcan.com.br
    mautic_api_key: str | None = None   # Mautic API key (Basic Auth token or OAuth, depending on setup)

    # ============================================================
    # AI Provider Configuration
    # ============================================================
    # Which AI backend to use: "simulation" | "openclaw" | "openai" | "anthropic"
    # In development, defaults to "simulation" (no API keys needed).
    # Set AI_PROVIDER env var to switch.
    ai_provider: str = "simulation"

    # OpenClaw — future primary provider
    openclaw_api_key: str | None = None
    openclaw_base_url: str = "https://api.openclaw.ai"
    openclaw_default_model: str = "openclaw-v1"

    # OpenAI (fallback / alternative)
    openai_api_key: str | None = None
    openai_default_model: str = "gpt-4o"

    # Anthropic (fallback / alternative)
    anthropic_api_key: str | None = None
    anthropic_default_model: str = "claude-sonnet-4-20250514"

    # Feature Flags
    feature_credentials_enabled: bool = True
    feature_temporal_matching_enabled: bool = True
    feature_opportunity_cost_enabled: bool = True
    feature_escrow_enabled: bool = True
    feature_scenario_optimization_enabled: bool = True
    
    # CRM Sync Feature Flags (control automatic sync behavior)
    feature_crm_sync_registration_enabled: bool = False  # Auto-sync on registration
    feature_crm_sync_email_verification_enabled: bool = False  # Auto-sync on email verify
    feature_crm_sync_subscription_enabled: bool = False  # Auto-sync on subscription changes
    feature_crm_sync_booking_enabled: bool = False  # Auto-sync on booking completion
    feature_crm_sync_queue_enabled: bool = False  # Use Celery queue for sync (prod recommendation)

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"

    def validate_runtime_configuration(self) -> None:
        insecure_defaults = {
            "jwt_secret_key": "change-this-to-a-secure-random-string-in-production",
            "stripe_secret_key": "sk_test_your_stripe_secret_key",
            "stripe_publishable_key": "pk_test_your_stripe_publishable_key",
            "stripe_webhook_secret": "whsec_your_webhook_secret",
            "encryption_key": "your-32-byte-encryption-key-change-in-production",
        }

        if not self.is_production:
            return

        invalid_fields = [
            field_name
            for field_name, insecure_value in insecure_defaults.items()
            if getattr(self, field_name) == insecure_value
        ]

        if invalid_fields:
            raise ValueError(
                "Production configuration contains insecure defaults for: "
                + ", ".join(invalid_fields)
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Singleton instance — import as `from app.core.config import settings`
settings = get_settings()
