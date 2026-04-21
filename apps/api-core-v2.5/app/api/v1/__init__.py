"""
API v1 router
"""

from fastapi import APIRouter

from app.api.v1 import auth, users, companions, marketplace, leaderboard, documents, dossiers
from app.api.routes import forge_interview

api_router = APIRouter(prefix="/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, tags=["users"])  # has own prefix /users
api_router.include_router(companions.router, prefix="/companions", tags=["companions"])
api_router.include_router(marketplace.router, tags=["marketplace"])  # has own prefix /marketplace
api_router.include_router(leaderboard.router, tags=["leaderboard"])  # has own prefix /leaderboard
api_router.include_router(documents.router, tags=["documents"])  # has own prefix /documents
api_router.include_router(dossiers.router, tags=["dossiers"])  # has own prefix /dossiers
api_router.include_router(forge_interview.router, tags=["forge-interview"])  # has own prefix /forge-interview
