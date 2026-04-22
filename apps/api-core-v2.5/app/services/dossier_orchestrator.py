"""Dossier Orchestrator Service for Master Strategic Dossier Export.

This service aggregates data from multiple domain services to create a unified
Master Dossier Payload that can be rendered as PDF.

Cross-domain aggregation:
1. PsychProfileService → OIOS Archetype, Readiness Scores
2. RouteBuilderService → Route, Milestones, Tasks
3. DocumentService → CVs, Motivation Letters, etc.
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.route import Route, RouteMilestone, DynamicMilestone
from app.db.models.sprint import SprintTask
from app.db.models.task import Task, TaskStatus
from app.db.models.document import Document
from app.db.models.dossier import Dossier


# ============================================================
# Pydantic Models for Dossier Payload
# ============================================================

class MasterDossierMetadata(BaseModel):
    generated_at: datetime
    user_name: str
    target_destination: Optional[str] = None
    route_name: Optional[str] = None
    deadline: Optional[datetime] = None


class IdentityReadiness(BaseModel):
    archetype: str
    archetype_display: str
    readiness_score: float
    dimensions: Dict[str, float]  # academic, financial, linguistic, operational
    risk_flags: List[str] = []


class MilestoneData(BaseModel):
    id: UUID
    title: str
    description: str
    order: int
    status: str
    completed_at: Optional[datetime] = None


class StrategicRouteAgenda(BaseModel):
    route_name: str
    route_type: str  # academic, corporate, nomad
    timeline_months: int
    completed_milestones: int
    pending_milestones: int
    milestones: List[MilestoneData] = []


class TaskData(BaseModel):
    id: UUID
    title: str
    category: str
    priority: str
    status: str
    due_date: Optional[datetime] = None
    xp_reward: int


class ExecutionArtifact(BaseModel):
    id: UUID
    type: str
    title: str
    olcan_score: Optional[int] = None
    status: str
    word_count: int
    created_at: datetime


class MasterDossierPayload(BaseModel):
    """Unified payload for Master Dossier Export."""
    metadata: MasterDossierMetadata
    identity_readiness: Optional[IdentityReadiness] = None
    strategic_route: Optional[StrategicRouteAgenda] = None
    upcoming_tasks: List[TaskData] = []
    execution_artifacts: List[ExecutionArtifact] = []

    class Config:
        json_schema_extra = {
            "example": {
                "metadata": {
                    "generated_at": "2026-04-22T10:00:00Z",
                    "user_name": "Valentino",
                    "target_destination": "Germany - Tech Visa"
                },
                "identity_readiness": {
                    "archetype": "technical_bridge_builder",
                    "archetype_display": "Technical Bridge Builder",
                    "readiness_score": 78,
                    "dimensions": {"academic": 80, "financial": 60, "linguistic": 90}
                },
                "strategic_route": {
                    "route_name": "Senior Developer Relocation",
                    "timeline_months": 6,
                    "completed_milestones": 2,
                    "pending_milestones": 4
                }
            }
        }


# ============================================================
# Orchestrator Service
# ============================================================

class DossierOrchestrator:
    """Aggregates data from multiple domain services for Master Dossier."""

    def __init__(self, db):
        self.db = db

    async def get_master_dossier(self, user_id: UUID) -> MasterDossierPayload:
        """Build Master Dossier Payload for a user."""
        
        # 1. Get user info
        from sqlalchemy import select
        from sqlalchemy.ext.asyncio import AsyncSession
        
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        metadata = MasterDossierMetadata(
            generated_at=datetime.now(timezone.utc),
            user_name=user.full_name or user.email.split('@')[0],
            target_destination=None,
            route_name=None
        )

        # 2. Get active route (if any)
        route_result = await self.db.execute(
            select(Route)
            .where(Route.user_id == user_id)
            .where(Route.status == "active")
            .order_by(Route.created_at.desc())
        )
        route = route_result.scalar_one_or_none()
        
        strategic_route = None
        if route:
            milestones = await self._get_route_milestones(route.id)
            metadata.route_name = route.name
            metadata.target_destination = f"{route.destination_country} - {route.opportunity_type}"
            metadata.deadline = route.target_deadline
            
            completed = sum(1 for m in milestones if m.status == "completed")
            strategic_route = StrategicRouteAgenda(
                route_name=route.name,
                route_type=route.opportunity_type,
                timeline_months=route.target_months or 6,
                completed_milestones=completed,
                pending_milestones=len(milestones) - completed,
                milestones=milestones
            )

        # 3. Get upcoming tasks (from active sprints)
        upcoming_tasks = await self._get_upcoming_tasks(user_id)

        # 4. Get execution artifacts (documents)
        artifacts = await self._get_execution_artifacts(user_id)

        # 5. Try to get OIOS readiness data from psychology service
        identity_readiness = await self._get_identity_readiness(user_id)

        return MasterDossierPayload(
            metadata=metadata,
            identity_readiness=identity_readiness,
            strategic_route=strategic_route,
            upcoming_tasks=upcoming_tasks,
            execution_artifacts=artifacts
        )

    async def _get_route_milestones(self, route_id: UUID) -> List[MilestoneData]:
        """Get milestones for a route."""
        result = await self.db.execute(
            select(Milestone)
            .where(Milestone.route_id == route_id)
            .order_by(Milestone.order)
        )
        milestones = result.scalars().all()
        
        return [
            MilestoneData(
                id=m.id,
                title=m.title,
                description=m.description or "",
                order=m.order,
                status=m.status,
                completed_at=m.completed_at
            )
            for m in milestones
        ]

    async def _get_upcoming_tasks(self, user_id: UUID, limit: int = 10) -> List[TaskData]:
        """Get pending/in-progress tasks for user's active route."""
        result = await self.db.execute(
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]))
            .order_by(Task.due_date.asc().nullslast())
            .limit(limit)
        )
        tasks = result.scalars().all()
        
        return [
            TaskData(
                id=t.id,
                title=t.title,
                category=t.category.value if t.category else "general",
                priority=t.priority.value if t.priority else "medium",
                status=t.status.value,
                due_date=t.due_date,
                xp_reward=t.xp_reward or 10
            )
            for t in tasks
        ]

    async def _get_execution_artifacts(self, user_id: UUID, limit: int = 5) -> List[ExecutionArtifact]:
        """Get user's recent documents."""
        result = await self.db.execute(
            select(Document)
            .where(Document.user_id == user_id)
            .order_by(Document.updated_at.desc())
            .limit(limit)
        )
        docs = result.scalars().all()
        
        return [
            ExecutionArtifact(
                id=d.id,
                type=d.document_type,
                title=d.title,
                olcan_score=d.olcan_score,
                status=d.status.value if d.status else "draft",
                word_count=len(d.raw_text or "") // 5,  # rough estimate
                created_at=d.created_at
            )
            for d in docs
        ]

    async def _get_identity_readiness(self, user_id: UUID) -> Optional[IdentityReadiness]:
        """Get OIOS readiness data from psychology service."""
        # Try to get from user psychology profile
        # This would call PsychProfileService if available
        # For now, return None and let frontend handle missing data
        return None


async def get_master_dossier_for_user(user_id: UUID) -> MasterDossierPayload:
    """Factory function to get Master Dossier."""
    async with get_db() as db:
        orchestrator = DossierOrchestrator(db)
        return await orchestrator.get_master_dossier(user_id)