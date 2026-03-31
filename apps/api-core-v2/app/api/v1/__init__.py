"""
API v1 router
"""

from fastapi import APIRouter

from app.api.v1 import auth, users, companions, marketplace, leaderboard, documents

api_router = APIRouter(prefix="/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(companions.router, prefix="/companions", tags=["companions"])
api_router.include_router(marketplace.router, prefix="/marketplace", tags=["marketplace"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
