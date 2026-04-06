from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.health_economics import router as health_economics_router
from app.api.routes.auth import router as auth_router
from app.api.routes.psychology import router as psychology_router
from app.api.routes.routes import router as routes_router
from app.api.routes.narrative import router as narrative_router
from app.api.routes.interview import router as interview_router
from app.api.routes.application import router as application_router
from app.api.routes.sprint import router as sprint_router
from app.api.routes.ai import router as ai_router
from app.api.routes.marketplace import router as marketplace_router
from app.api.routes.commerce import router as commerce_router
from app.api.routes.org import router as org_router
from app.api.routes.constraints import router as constraints_router
COMPANIONS_AVAILABLE = False
try:
    from app.api.companions import router as companions_router
    COMPANIONS_AVAILABLE = True
except ImportError as e:
    print(f"[INFO] Companion routes not loaded: {e}")

# Economics-driven intelligence routes
from app.api.routes.credentials import router as credentials_router
from app.api.routes.temporal_matching import router as temporal_matching_router
from app.api.routes.opportunity_cost import router as opportunity_cost_router
from app.api.routes.escrow import router as escrow_router
from app.api.routes.scenarios import router as scenarios_router
from app.api.routes.admin_economics import router as admin_economics_router
from app.api.routes.user_data import router as user_data_router

# V2.5 New API endpoints - loaded separately to avoid breaking v2.0
V25_AVAILABLE = False
try:
    from app.api.v1.auth import router as auth_v25_router
    from app.api.v1.companions import router as companions_v25_router
    from app.api.v1.marketplace import router as marketplace_v25_router
    from app.api.v1.users import router as users_v25_router
    V25_AVAILABLE = True
except ImportError as e:
    # V2.5 endpoints not available - this is fine, v2.0 will continue working
    print(f"[INFO] V2.5 endpoints not loaded: {e}")
    pass

def _mount_all_routes(router: APIRouter) -> None:
    router.include_router(health_router, tags=["health"])
    router.include_router(health_economics_router, tags=["health"])
    router.include_router(auth_router, tags=["Authentication"])
    router.include_router(psychology_router, tags=["Psychological Engine"])
    router.include_router(routes_router, tags=["Route Engine"])
    router.include_router(narrative_router, tags=["Narrative Intelligence"])
    router.include_router(interview_router, tags=["Interview Intelligence"])
    router.include_router(application_router, tags=["Application Management"])
    router.include_router(sprint_router, tags=["Readiness Engine"])
    router.include_router(ai_router, tags=["AI Service Layer"])
    router.include_router(marketplace_router, tags=["Marketplace"])
    router.include_router(commerce_router, tags=["Commerce"])
    router.include_router(org_router, tags=["Organizations"])
    router.include_router(constraints_router, tags=["User Constraints"])
    if COMPANIONS_AVAILABLE:
        router.include_router(companions_router, tags=["Companions"])

    # Economics Intelligence
    router.include_router(credentials_router, tags=["Economics - Credentials"])
    router.include_router(temporal_matching_router, tags=["Economics - Temporal Matching"])
    router.include_router(opportunity_cost_router, tags=["Economics - Opportunity Cost"])
    router.include_router(escrow_router, tags=["Economics - Escrow"])
    router.include_router(scenarios_router, tags=["Economics - Scenarios"])
    router.include_router(admin_economics_router, tags=["Economics - Admin"])
    router.include_router(user_data_router, tags=["User Data Management"])
    
    # V2.5 Enhanced endpoints (if available)
    if V25_AVAILABLE:
        router.include_router(auth_v25_router, prefix="/v2.5", tags=["V2.5 - Authentication"])
        router.include_router(companions_v25_router, prefix="/v2.5", tags=["V2.5 - Companions"])
        router.include_router(marketplace_v25_router, prefix="/v2.5", tags=["V2.5 - Marketplace"])
        router.include_router(users_v25_router, prefix="/v2.5", tags=["V2.5 - Users"])


# Keep /api/* for current frontend and /api/v1/* for backward compatibility.
api_router = APIRouter()
api_router_v1 = APIRouter(prefix="/v1")
_mount_all_routes(api_router)
_mount_all_routes(api_router_v1)
api_router.include_router(api_router_v1)
