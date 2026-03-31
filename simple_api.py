#!/usr/bin/env python3
"""
Simple API server for Olcan Compass
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Olcan Compass API",
    description="Simple API for Olcan Compass v2.5",
    version="2.5.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def root():
    return {
        "message": "Olcan Compass API v2.5",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.5.0",
        "database": "connected"
    }

# Mock API endpoints
@app.get("/api/v1/companions")
async def get_companions():
    return [
        {
            "id": 1,
            "name": "Phoenix",
            "type": "fire",
            "level": 5,
            "xp": 1500,
            "evolutionStage": "adult",
            "abilities": ["flame", "heal", "fly"]
        },
        {
            "id": 2,
            "name": "Luna",
            "type": "moon",
            "level": 3,
            "xp": 800,
            "evolutionStage": "teen",
            "abilities": ["glow", "shield", "teleport"]
        }
    ]

@app.get("/api/v1/users/profile")
async def get_profile():
    return {
        "id": 1,
        "name": "User",
        "xp": 100,
        "level": 2,
        "companion": {
            "id": 1,
            "name": "Phoenix",
            "type": "fire"
        }
    }

@app.get("/api/v1/marketplace/providers")
async def get_providers():
    return [
        {
            "id": 1,
            "name": "Dr. Silva",
            "specialties": ["career", "leadership"],
            "rating": 4.8,
            "reviewCount": 25,
            "country": "Brazil",
            "languages": ["Portuguese", "English"],
            "verified": True,
            "bio": "Experienced career coach with 10+ years helping professionals achieve their goals.",
            "services": [
                {
                    "id": 1,
                    "title": "Career Strategy Session",
                    "description": "1-on-1 session to plan your career path",
                    "price": 150,
                    "duration": 60,
                    "isActive": True
                }
            ],
            "reviews": [
                {
                    "id": 1,
                    "userName": "John",
                    "rating": 5,
                    "comment": "Excellent coach, helped me land my dream job!",
                    "createdAt": "2024-01-15T10:00:00Z"
                }
            ],
            "joinedAt": "2023-06-01T00:00:00Z"
        }
    ]

if __name__ == "__main__":
    print("🚀 Starting Olcan Compass API...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
