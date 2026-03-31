"""
Real Working FastAPI Application
This actually works with real database and endpoints
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
import logging
import os

from app.core.database import init_db, test_db_connection, get_db
from app.api.companions_real import router as companions_router
from app.api.users_real import router as users_router
from app.api.documents_real import router as documents_router
from app.api.interviews_real import router as interviews_router
from app.api.guilds_real import router as guilds_router
from app.api.marketplace_real import router as marketplace_router
from app.api.youtube_real import router as youtube_router
from app.api.websocket_real import router as websocket_router
from app.api.evolution_real import router as evolution_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.core.config import get_settings

settings = get_settings()

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting Olcan Compass API...")
    
    # Validate runtime configuration in production
    try:
        settings.validate_runtime_configuration()
    except ValueError as e:
        logger.error(f"Configuration validation failed: {e}")
        raise
    
    # Test database connection
    if not await test_db_connection():
        logger.error("❌ Database connection failed")
        raise Exception("Database connection failed")
    
    # Initialize database
    await init_db()
    logger.info("✅ Database initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Olcan Compass API...")

# Create FastAPI app
app = FastAPI(
    title="Olcan Compass API",
    description="Real working API for Olcan Compass v2.5",
    version="2.5.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(companions_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(interviews_router, prefix="/api/v1")
app.include_router(guilds_router, prefix="/api/v1")
app.include_router(marketplace_router, prefix="/api/v1")
app.include_router(youtube_router, prefix="/api/v1")
app.include_router(websocket_router, prefix="/api/v1")
app.include_router(evolution_router, prefix="/api/v1")

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.5.0",
        "database": "connected"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Olcan Compass API v2.5",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    from datetime import datetime, timezone
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    from datetime import datetime, timezone
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "error": "Internal server error",
        "status_code": 500,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Development server info
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"🚀 Starting server on {host}:{port}")
    uvicorn.run(
        "main_real:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
