from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.api.router import api_router
from app.core.config import get_settings
from app.core.startup import validate_environment
from app.core.rate_limit import limiter
from contextlib import asynccontextmanager
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    await validate_environment()
    # Seed all reference data if tables are empty
    try:
        from app.db.session import get_sessionmaker
        from app.db.seed_questions import seed_psych_questions
        from app.db.seed_routes import seed_route_templates
        from app.db.seed_interviews import seed_interview_questions
        from app.db.seed_sprints import seed_sprint_templates
        from app.db.seed_opportunities import seed_opportunities
        async with get_sessionmaker()() as db:
            await seed_psych_questions(db)
            await seed_route_templates(db)
            await seed_interview_questions(db)
            await seed_sprint_templates(db)
            await seed_opportunities(db)
    except Exception as e:
        import traceback
        print(f"[seed] Warning: could not seed data: {e}")
        traceback.print_exc()
    yield



def create_app() -> FastAPI:
    settings = get_settings()

    # Iniciar Sentry se o DSN estiver configurado (Monitoramento)
    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.1,
            environment=os.getenv("ENVIRONMENT", "development")
        )

    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    # Configurar rate limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    allow_origins = [o.strip() for o in settings.cors_allow_origins.split(",") if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    app.include_router(api_router, prefix=settings.api_prefix)
    return app


app = create_app()
