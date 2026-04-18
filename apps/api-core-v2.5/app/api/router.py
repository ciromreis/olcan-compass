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
from app.api.commerce_proxy import router as commerce_proxy_router
from app.api.aura_ai import router as aura_ai_router
# Economics-driven intelligence routes
from app.api.routes.credentials import router as credentials_router
from app.api.routes.temporal_matching import router as temporal_matching_router
from app.api.routes.opportunity_cost import router as opportunity_cost_router
from app.api.routes.escrow import router as escrow_router
from app.api.routes.scenarios import router as scenarios_router
from app.api.routes.admin_economics import router as admin_economics_router
from app.api.routes.user_data import router as user_data_router
from app.api.routes.forge import router as forge_router
from app.api.routes.billing import router as billing_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.crm import router as crm_router
from app.api.routes.tasks import router as tasks_router
# Previously unmounted routes — mounted April 14, 2026
from app.api.routes.guild import router as guild_router
from app.api.routes.quest import router as quest_router
from app.api.routes.achievement import router as achievement_router
from app.api.routes.social import router as social_router
from app.api.routes.boards import router as boards_router
from app.api.routes.archetypes import router as archetypes_router
from app.api.routes.route_builder import router as route_builder_router
from app.api.routes.questions import router as questions_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.gamification import router as gamification_router

# V1 aggregate router — provides /v1/companions, /v1/documents, /v1/leaderboard, etc.
# These are the endpoints the frontend actually calls (forgeApi, auraApi).
V1_AVAILABLE = False
try:
    from app.api.v1 import api_router as v1_aggregate_router
    V1_AVAILABLE = True
except ImportError as e:
    print(f"[INFO] V1 endpoints not loaded: {e}")
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
    router.include_router(commerce_proxy_router, tags=["Commerce Proxy"])
    router.include_router(aura_ai_router, tags=["Aura AI"])
    router.include_router(org_router, tags=["Organizations"])
    router.include_router(constraints_router, tags=["User Constraints"])

    # Economics Intelligence
    router.include_router(credentials_router, tags=["Economics - Credentials"])
    router.include_router(temporal_matching_router, tags=["Economics - Temporal Matching"])
    router.include_router(opportunity_cost_router, tags=["Economics - Opportunity Cost"])
    router.include_router(escrow_router, tags=["Economics - Escrow"])
    router.include_router(scenarios_router, tags=["Economics - Scenarios"])
    router.include_router(admin_economics_router, tags=["Economics - Admin"])
    router.include_router(user_data_router, tags=["User Data Management"])
    router.include_router(forge_router, tags=["Narrative Forge"])
    router.include_router(billing_router, tags=["Billing"])
    router.include_router(analytics_router, tags=["Analytics"])
    router.include_router(crm_router, tags=["CRM"])
    router.include_router(tasks_router, tags=["Task Management"])

    # Gamification & Social (previously unmounted)
    router.include_router(guild_router, tags=["Guilds"])
    router.include_router(quest_router, tags=["Quests"])
    router.include_router(achievement_router, tags=["Achievements"])
    router.include_router(social_router, tags=["Social"])
    router.include_router(boards_router, tags=["Boards"])
    router.include_router(archetypes_router, tags=["Archetypes"])
    router.include_router(route_builder_router, tags=["Route Builder"])
    router.include_router(questions_router, tags=["Questions"])
    router.include_router(notifications_router, tags=["Notifications"])
    router.include_router(gamification_router, tags=["Gamification"])


# Keep /api/* for current frontend and /api/v1/* for backward compatibility.
api_router = APIRouter()
api_router_v1 = APIRouter(prefix="/v1")
_mount_all_routes(api_router)
_mount_all_routes(api_router_v1)
api_router.include_router(api_router_v1)

# Mount v1 aggregate router (companions, documents, leaderboard, forge-interview)
# This provides the /v1/companions/*, /v1/documents/* paths the frontend expects.
if V1_AVAILABLE:
    api_router.include_router(v1_aggregate_router)
