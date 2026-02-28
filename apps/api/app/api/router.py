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
from app.api.routes.constraints import router as constraints_router

# Economics-driven intelligence routes
from app.api.routes.credentials import router as credentials_router
from app.api.routes.temporal_matching import router as temporal_matching_router
from app.api.routes.opportunity_cost import router as opportunity_cost_router
from app.api.routes.escrow import router as escrow_router
from app.api.routes.scenarios import router as scenarios_router
from app.api.routes.admin_economics import router as admin_economics_router
from app.api.routes.user_data import router as user_data_router

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
    router.include_router(constraints_router, tags=["User Constraints"])

    # Economics Intelligence
    router.include_router(credentials_router, tags=["Economics - Credentials"])
    router.include_router(temporal_matching_router, tags=["Economics - Temporal Matching"])
    router.include_router(opportunity_cost_router, tags=["Economics - Opportunity Cost"])
    router.include_router(escrow_router, tags=["Economics - Escrow"])
    router.include_router(scenarios_router, tags=["Economics - Scenarios"])
    router.include_router(admin_economics_router, tags=["Economics - Admin"])
    router.include_router(user_data_router, tags=["User Data Management"])


# Keep /api/* for current frontend and /api/v1/* for backward compatibility.
api_router = APIRouter()
api_router_v1 = APIRouter(prefix="/v1")
_mount_all_routes(api_router)
_mount_all_routes(api_router_v1)
api_router.include_router(api_router_v1)
