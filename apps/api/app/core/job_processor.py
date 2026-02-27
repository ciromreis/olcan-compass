"""Background Job Processing

Async task queue for AI processing jobs.
Uses a simple async queue that can be swapped for Celery/ARQ later.
"""

import asyncio
from typing import Optional, Dict, Any, Callable, List
from uuid import UUID
from datetime import datetime, timezone
from enum import Enum
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AIJobQueue, PromptTemplate
from app.core.ai_engines import (
    NarrativeAnalysisEngine,
    InterviewFeedbackEngine,
    ReadinessAnalysisEngine,
)

logger = logging.getLogger(__name__)


class JobType(str, Enum):
    NARRATIVE_ANALYSIS = "narrative_analysis"
    INTERVIEW_FEEDBACK = "interview_feedback"
    READINESS_ASSESSMENT = "readiness_assessment"
    GAP_ANALYSIS = "gap_analysis"
    SPRINT_GENERATION = "sprint_generation"
    OPPORTUNITY_MATCHING = "opportunity_matching"


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AIJobProcessor:
    """Processor for AI background jobs"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self._processors: Dict[JobType, Callable] = {
            JobType.NARRATIVE_ANALYSIS: self._process_narrative_analysis,
            JobType.INTERVIEW_FEEDBACK: self._process_interview_feedback,
            JobType.READINESS_ASSESSMENT: self._process_readiness_assessment,
            JobType.GAP_ANALYSIS: self._process_gap_analysis,
            JobType.SPRINT_GENERATION: self._process_sprint_generation,
        }
    
    async def submit_job(
        self,
        job_type: JobType,
        entity_type: str,
        entity_id: UUID,
        user_id: UUID,
        prompt_template_id: Optional[UUID] = None,
        custom_prompt: Optional[str] = None,
        priority: int = 5
    ) -> AIJobQueue:
        """Submit a new job to the queue"""
        job = AIJobQueue(
            job_type=job_type.value,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            prompt_template_id=prompt_template_id,
            custom_prompt=custom_prompt,
            priority=priority,
            status=JobStatus.PENDING.value,
            retry_count=0,
            max_retries=3
        )
        
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)
        
        logger.info(f"Submitted job {job.id} of type {job_type}")
        
        return job
    
    async def get_job_status(self, job_id: UUID) -> Optional[AIJobQueue]:
        """Get job status by ID"""
        from sqlalchemy import select
        result = await self.db.execute(
            select(AIJobQueue).where(AIJobQueue.id == job_id)
        )
        return result.scalar_one_or_none()
    
    async def cancel_job(self, job_id: UUID, user_id: UUID) -> bool:
        """Cancel a pending job"""
        job = await self.get_job_status(job_id)
        
        if not job or job.user_id != user_id:
            return False
        
        if job.status not in [JobStatus.PENDING.value, JobStatus.PROCESSING.value]:
            return False
        
        job.status = JobStatus.CANCELLED.value
        job.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        
        logger.info(f"Cancelled job {job_id}")
        
        return True
    
    async def process_job(self, job_id: UUID) -> bool:
        """Process a single job"""
        job = await self.get_job_status(job_id)
        
        if not job:
            logger.error(f"Job {job_id} not found")
            return False
        
        if job.status != JobStatus.PENDING.value:
            logger.warning(f"Job {job_id} not in pending status: {job.status}")
            return False
        
        # Mark as processing
        job.status = JobStatus.PROCESSING.value
        job.started_at = datetime.now(timezone.utc)
        job.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        
        try:
            # Get processor
            job_type = JobType(job.job_type)
            processor = self._processors.get(job_type)
            
            if not processor:
                raise ValueError(f"No processor for job type: {job_type}")
            
            # Execute
            result = await processor(job)
            
            # Mark completed
            job.status = JobStatus.COMPLETED.value
            job.result_data = result
            job.completed_at = datetime.now(timezone.utc)
            job.updated_at = datetime.now(timezone.utc)
            
            await self.db.commit()
            
            logger.info(f"Completed job {job_id}")
            
            return True
            
        except Exception as e:
            logger.exception(f"Failed to process job {job_id}")
            
            # Update retry count
            job.retry_count += 1
            
            if job.retry_count >= job.max_retries:
                job.status = JobStatus.FAILED.value
                job.error_message = str(e)
            else:
                # Back to pending for retry
                job.status = JobStatus.PENDING.value
            
            job.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            
            return False
    
    async def get_pending_jobs(
        self,
        limit: int = 10,
        job_type: Optional[JobType] = None
    ) -> List[AIJobQueue]:
        """Get pending jobs ordered by priority"""
        from sqlalchemy import select, and_
        
        query = select(AIJobQueue).where(
            and_(
                AIJobQueue.status == JobStatus.PENDING.value,
                AIJobQueue.scheduled_for.is_(None) | (AIJobQueue.scheduled_for <= datetime.now(timezone.utc))
            )
        )
        
        if job_type:
            query = query.where(AIJobQueue.job_type == job_type.value)
        
        query = query.order_by(AIJobQueue.priority, AIJobQueue.created_at)
        
        result = await self.db.execute(query.limit(limit))
        return list(result.scalars().all())
    
    async def process_batch(self, batch_size: int = 5) -> int:
        """Process a batch of pending jobs"""
        jobs = await self.get_pending_jobs(limit=batch_size)
        
        processed = 0
        for job in jobs:
            success = await self.process_job(job.id)
            if success:
                processed += 1
        
        return processed
    
    # Individual job processors
    
    async def _process_narrative_analysis(self, job: AIJobQueue) -> Dict[str, Any]:
        """Process narrative analysis job"""
        from sqlalchemy import select
        from app.db.models import Narrative, User
        
        # Load narrative
        narrative_result = await self.db.execute(
            select(Narrative).where(Narrative.id == job.entity_id)
        )
        narrative = narrative_result.scalar_one()
        
        # Load user
        user_result = await self.db.execute(
            select(User).where(User.id == job.user_id)
        )
        user = user_result.scalar_one()
        
        # Analyze
        engine = NarrativeAnalysisEngine(self.db)
        result = await engine.analyze_narrative(narrative, user)
        
        # Save to narrative_analysis table
        from app.db.models import NarrativeAnalysis
        
        analysis = NarrativeAnalysis(
            narrative_id=narrative.id,
            version_id=narrative.current_version_id,
            clarity_score=result.clarity_score,
            coherence_score=result.coherence_score,
            authenticity_score=result.authenticity_score,
            narrative_arc=result.narrative_arc,
            key_strengths=result.key_strengths,
            areas_for_improvement=result.areas_for_improvement,
            suggested_edits=result.suggested_edits,
            overall_feedback=result.overall_feedback,
            model_version="simulation-v1",
            confidence_score=result.confidence,
            processing_time_ms=0
        )
        
        self.db.add(analysis)
        await self.db.commit()
        
        return {
            "analysis_id": str(analysis.id),
            "clarity_score": result.clarity_score,
            "coherence_score": result.coherence_score,
            "authenticity_score": result.authenticity_score
        }
    
    async def _process_interview_feedback(self, job: AIJobQueue) -> Dict[str, Any]:
        """Process interview feedback job"""
        from sqlalchemy import select
        from app.db.models import InterviewAnswer, InterviewSession, User
        
        # Load answer
        answer_result = await self.db.execute(
            select(InterviewAnswer).where(InterviewAnswer.id == job.entity_id)
        )
        answer = answer_result.scalar_one()
        
        # Load session
        session_result = await self.db.execute(
            select(InterviewSession).where(InterviewSession.id == answer.session_id)
        )
        session = session_result.scalar_one()
        
        # Load user
        user_result = await self.db.execute(
            select(User).where(User.id == job.user_id)
        )
        user = user_result.scalar_one()
        
        # Analyze
        engine = InterviewFeedbackEngine(self.db)
        result = await engine.analyze_answer(session, answer, user)
        
        # Save feedback to answer
        answer.feedback_data = {
            "overall_score": result.overall_score,
            "confidence_score": result.confidence_score,
            "structure_score": result.structure_score,
            "content_score": result.content_score,
            "clarity_score": result.clarity_score,
            "strengths": result.strengths,
            "improvements": result.improvements,
            "specific_feedback": result.specific_feedback,
            "suggested_practice": result.suggested_practice
        }
        answer.analysis_status = "completed"
        
        await self.db.commit()
        
        return {
            "answer_id": str(answer.id),
            "overall_score": result.overall_score,
            "status": "completed"
        }
    
    async def _process_readiness_assessment(self, job: AIJobQueue) -> Dict[str, Any]:
        """Process readiness assessment job"""
        from sqlalchemy import select
        from app.db.models import User, PsychProfile
        
        # Load user
        user_result = await self.db.execute(
            select(User).where(User.id == job.user_id)
        )
        user = user_result.scalar_one()
        
        # Load profile data
        profile_result = await self.db.execute(
            select(PsychProfile).where(PsychProfile.user_id == user.id)
        )
        profile = profile_result.scalar_one_or_none()
        
        # Build user profile data
        user_profile = {
            "background": {
                "education_level": "undergraduate"  # Would be from user profile
            },
            "documents": {},
            "language": {},
            "experience": []
        }
        
        if profile:
            user_profile["psych_scores"] = {
                "openness": profile.openness_score,
                "conscientiousness": profile.conscientiousness_score
            }
        
        # Analyze
        engine = ReadinessAnalysisEngine(self.db)
        result = await engine.analyze_readiness(user, user_profile)
        
        # Save to readiness_assessments table
        from app.db.models import ReadinessAssessment
        
        assessment = ReadinessAssessment(
            user_id=user.id,
            overall_readiness=result.overall_readiness,
            confidence_score=70,  # Would calculate from profile
            documentation_score=60,
            financial_score=65,
            language_score=55,
            experience_score=75,
            gaps_identified=result.gaps,
            strengths=result.strengths,
            assessment_type="ai_analysis",
            recommended_sprint_template_ids=result.recommended_sprint_templates
        )
        
        self.db.add(assessment)
        await self.db.commit()
        
        return {
            "assessment_id": str(assessment.id),
            "overall_readiness": result.overall_readiness,
            "gaps_count": len(result.gaps)
        }
    
    async def _process_gap_analysis(self, job: AIJobQueue) -> Dict[str, Any]:
        """Process gap analysis job"""
        # Similar to readiness assessment but focused on specific route
        return {"status": "processed", "gaps_found": 3}
    
    async def _process_sprint_generation(self, job: AIJobQueue) -> Dict[str, Any]:
        """Process sprint generation job"""
        from sqlalchemy import select
        from app.db.models import User, ReadinessAssessment, SprintTemplate
        
        # Load user and latest assessment
        user_result = await self.db.execute(
            select(User).where(User.id == job.user_id)
        )
        user = user_result.scalar_one()
        
        assessment_result = await self.db.execute(
            select(ReadinessAssessment)
            .where(ReadinessAssessment.user_id == user.id)
            .order_by(ReadinessAssessment.created_at.desc())
        )
        assessment = assessment_result.scalar_one_or_none()
        
        if not assessment:
            return {"error": "No readiness assessment found"}
        
        # Generate recommendations
        engine = ReadinessAnalysisEngine(self.db)
        recommendations = await engine.generate_sprint_recommendations(
            assessment.gaps_identified,
            user
        )
        
        # Find matching templates
        templates_result = await self.db.execute(
            select(SprintTemplate).where(SprintTemplate.is_active == True)
        )
        templates = templates_result.scalars().all()
        
        matched_sprints = []
        for rec in recommendations[:3]:
            category = rec.get("gap_category", "general")
            matching = [t for t in templates if t.target_gap_category == category]
            
            if matching:
                template = matching[0]
                from datetime import date, timedelta
                
                from app.db.models import UserSprint, SprintStatus
                
                sprint = UserSprint(
                    user_id=user.id,
                    template_id=template.id,
                    name=rec.get("name", template.name),
                    description=rec.get("description", template.description),
                    gap_category=category,
                    status=SprintStatus.PLANNED,
                    target_end_date=date.today() + timedelta(days=rec.get("duration_days", 14)),
                    estimated_effort_hours=rec.get("estimated_effort_hours", template.estimated_effort_hours),
                    ai_guidance=rec.get("reason")
                )
                
                self.db.add(sprint)
                matched_sprints.append({
                    "sprint_id": str(sprint.id),
                    "name": sprint.name,
                    "category": category
                })
        
        await self.db.commit()
        
        return {
            "generated_sprints": len(matched_sprints),
            "sprints": matched_sprints
        }


# Simple async worker that can run in background
class AIJobWorker:
    """Background worker for processing AI jobs"""
    
    def __init__(self, db_session_factory):
        self.db_session_factory = db_session_factory
        self._running = False
        self._task = None
    
    async def start(self):
        """Start the worker loop"""
        self._running = True
        self._task = asyncio.create_task(self._worker_loop())
        logger.info("AI Job Worker started")
    
    async def stop(self):
        """Stop the worker loop"""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("AI Job Worker stopped")
    
    async def _worker_loop(self):
        """Main worker loop"""
        while self._running:
            try:
                async with self.db_session_factory() as db:
                    processor = AIJobProcessor(db)
                    processed = await processor.process_batch(batch_size=5)
                    
                    if processed == 0:
                        # No jobs, sleep before checking again
                        await asyncio.sleep(5)
                    else:
                        # Small delay between batches
                        await asyncio.sleep(1)
                        
            except Exception as e:
                logger.exception("Error in worker loop")
                await asyncio.sleep(10)  # Back off on error
