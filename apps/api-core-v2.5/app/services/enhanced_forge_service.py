"""
Enhanced Document Forge Service

Core service for multi-process management, document variations, task recommendations,
and gamification integration in the Olcan Compass v2.5 Enhanced Document Forge.
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.models.enhanced_forge import (
    Process, ProcessTask, DocumentVariation, ProcessTemplate, 
    TechnicalReport, ExportJob, CMSFormData, ProcessEvent,
    ProcessStatus, ProcessTaskStatus, TaskPriority, DocumentVariationType
)
from app.models.progress import UserProgress
from app.schemas.enhanced_forge import (
    ProcessCreate, ProcessUpdate, ProcessTaskCreate, ProcessTaskUpdate,
    DocumentVariationCreate, DocumentVariationUpdate, XPEventData, AuraFeedbackData
)
from app.services.xp_calculator import XPCalculator, get_or_create_user_progress
from app.services.companion_service import CompanionService


class EnhancedForgeService:
    """Core service for Enhanced Document Forge System"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.xp_calculator = XPCalculator()
        self.companion_service = CompanionService(db)
    
    # ============================================================
    # Process Management
    # ============================================================
    
    async def create_process(self, user_id: str, process_data: ProcessCreate) -> Process:
        """Create a new process with intelligent task generation"""
        
        # Create the process
        process = Process(
            user_id=user_id,
            **process_data.model_dump()
        )
        self.db.add(process)
        await self.db.flush()
        
        # Generate tasks from template if available
        await self._generate_tasks_from_template(process)
        
        # Record process creation event
        await self._record_process_event(
            process_id=process.id,
            user_id=user_id,
            event_type="process_created",
            event_category="process",
            event_data={"process_type": process.process_type},
            xp_awarded=25
        )
        
        # Update gamification
        await self._update_gamification_for_process_creation(user_id)
        
        await self.db.commit()
        return process
    
    async def update_process(self, process_id: uuid.UUID, user_id: str, 
                           process_data: ProcessUpdate) -> Optional[Process]:
        """Update process and recalculate readiness score"""
        
        result = await self.db.execute(
            select(Process).where(
                and_(Process.id == process_id, Process.user_id == user_id)
            )
        )
        process = result.scalar_one_or_none()
        
        if not process:
            return None
        
        # Update fields
        update_data = process_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(process, field, value)
        
        # Recalculate readiness score
        await self._recalculate_readiness_score(process)
        
        # Update momentum based on activity
        await self._update_momentum_score(process, user_id)
        
        await self.db.commit()
        return process
    
    async def get_process_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive process dashboard with analytics"""
        
        # Get all processes
        result = await self.db.execute(
            select(Process)
            .where(Process.user_id == user_id)
            .options(selectinload(Process.tasks))
            .order_by(Process.updated_at.desc())
        )
        processes = result.scalars().all()
        
        # Calculate aggregate statistics
        total_processes = len(processes)
        active_processes = len([p for p in processes if p.status == ProcessStatus.ACTIVE])
        completed_processes = len([p for p in processes if p.status == ProcessStatus.COMPLETED])
        
        avg_readiness = sum(p.readiness_score for p in processes) / total_processes if total_processes > 0 else 0
        avg_momentum = sum(p.momentum_score for p in processes) / total_processes if total_processes > 0 else 0
        
        # Upcoming deadlines (next 30 days)
        upcoming_deadline_cutoff = datetime.utcnow() + timedelta(days=30)
        upcoming_deadlines = [
            p for p in processes 
            if p.deadline and p.deadline <= upcoming_deadline_cutoff and p.status != ProcessStatus.COMPLETED
        ]
        
        # Overdue processes
        overdue_processes = [
            p for p in processes 
            if p.deadline and p.deadline < datetime.utcnow() and p.status != ProcessStatus.COMPLETED
        ]
        
        return {
            "processes": processes,
            "total_processes": total_processes,
            "active_processes": active_processes,
            "completed_processes": completed_processes,
            "average_readiness_score": avg_readiness,
            "average_momentum_score": avg_momentum,
            "upcoming_deadlines": upcoming_deadlines,
            "overdue_processes": overdue_processes,
            "processes_by_type": self._group_processes_by_type(processes),
            "processes_by_status": self._group_processes_by_status(processes)
        }
    
    # ============================================================
    # Task Management and Recommendation Engine
    # ============================================================
    
    async def create_task(self, user_id: str, task_data: ProcessTaskCreate) -> ProcessTask:
        """Create a new task with XP calculation"""
        
        # Calculate XP reward based on priority and user progress
        progress = await get_or_create_user_progress(self.db, user_id)
        
        # Adjust XP based on priority
        xp_multiplier = {
            TaskPriority.LOW: 0.8,
            TaskPriority.MEDIUM: 1.0,
            TaskPriority.HIGH: 1.5,
            TaskPriority.CRITICAL: 2.0
        }
        
        base_xp = task_data.xp_reward or 10
        calculated_xp = int(base_xp * xp_multiplier.get(task_data.priority, 1.0))
        
        task = ProcessTask(
            user_id=user_id,
            xp_reward=calculated_xp,
            **task_data.model_dump(exclude={"xp_reward"})
        )
        self.db.add(task)
        await self.db.flush()
        
        # Record task creation event
        await self._record_process_event(
            process_id=task.process_id,
            user_id=user_id,
            event_type="task_created",
            event_category="task",
            event_data={"task_type": task.task_type, "priority": task.priority.value},
            xp_awarded=5
        )
        
        await self.db.commit()
        return task
    
    async def complete_task(self, task_id: uuid.UUID, user_id: str, 
                          completion_notes: Optional[str] = None) -> Dict[str, Any]:
        """Complete a task and update gamification system"""
        
        result = await self.db.execute(
            select(ProcessTask)
            .where(and_(ProcessTask.id == task_id, ProcessTask.user_id == user_id))
            .options(selectinload(ProcessTask.process))
        )
        task = result.scalar_one_or_none()
        
        if not task or task.status == ProcessTaskStatus.COMPLETED:
            return {"success": False, "message": "Task not found or already completed"}
        
        # Update task
        task.status = ProcessTaskStatus.COMPLETED
        task.completed_at = datetime.utcnow()
        if completion_notes:
            task.completion_notes = completion_notes
        
        # Get user progress
        progress = await get_or_create_user_progress(self.db, user_id)
        
        # Check if this is first task of the day
        today = datetime.utcnow().date()
        is_first_task_today = (
            progress.last_activity_date is None or 
            progress.last_activity_date.date() != today
        )
        
        # Calculate XP reward
        xp_earned = self.xp_calculator.calculate_task_xp(
            priority=task.priority.value,
            is_first_task_today=is_first_task_today,
            streak_days=progress.streak_current
        )
        
        # Update user progress
        old_level = progress.current_level
        progress.total_xp += xp_earned
        progress.document_forge_xp += xp_earned
        progress.tasks_completed_total += 1
        progress.tasks_completed_today += 1 if is_first_task_today else 0
        progress.last_activity_date = datetime.utcnow()
        progress.last_forge_activity = datetime.utcnow()
        
        # Update level
        new_level = self.xp_calculator.calculate_level_from_xp(progress.total_xp)
        level_up = new_level > old_level
        progress.current_level = new_level
        
        # Update streak
        from app.services.xp_calculator import StreakManager
        new_streak, streak_broken = StreakManager.calculate_new_streak(
            progress.streak_current, progress.last_activity_date
        )
        progress.streak_current = new_streak
        if new_streak > progress.streak_best:
            progress.streak_best = new_streak
        
        # Record task completion event
        await self._record_process_event(
            process_id=task.process_id,
            user_id=user_id,
            event_type="task_completed",
            event_category="task",
            event_data={
                "task_type": task.task_type,
                "priority": task.priority.value,
                "xp_earned": xp_earned,
                "level_up": level_up
            },
            xp_awarded=xp_earned
        )
        
        # Update process readiness score
        await self._recalculate_readiness_score(task.process)
        
        # Update momentum score
        await self._update_momentum_score(task.process, user_id)
        
        # Send feedback to Aura companion
        await self._send_aura_feedback(user_id, {
            "activity_type": "task_completed",
            "progress_data": {
                "task_priority": task.priority.value,
                "xp_earned": xp_earned,
                "level_up": level_up,
                "streak_days": new_streak
            },
            "momentum_change": 5.0,  # Task completion increases momentum
            "readiness_improvement": 2.0,
            "streak_impact": not streak_broken
        })
        
        await self.db.commit()
        
        return {
            "success": True,
            "task": task,
            "xp_earned": xp_earned,
            "total_xp": progress.total_xp,
            "level_up": level_up,
            "new_level": new_level if level_up else None,
            "streak_updated": True,
            "new_streak": new_streak,
            "readiness_score_updated": True
        }
    
    async def get_task_recommendations(self, process_id: uuid.UUID, user_id: str) -> List[Dict[str, Any]]:
        """Generate intelligent task recommendations based on process type and user profile"""
        
        # Get process and existing tasks
        result = await self.db.execute(
            select(Process)
            .where(and_(Process.id == process_id, Process.user_id == user_id))
            .options(selectinload(Process.tasks))
        )
        process = result.scalar_one_or_none()
        
        if not process:
            return []
        
        # Get process template
        template_result = await self.db.execute(
            select(ProcessTemplate).where(ProcessTemplate.process_type == process.process_type)
        )
        template = template_result.scalar_one_or_none()
        
        if not template:
            return self._generate_generic_task_recommendations(process)
        
        # Get user progress for personalization
        progress = await get_or_create_user_progress(self.db, user_id)
        
        # Generate recommendations based on template and user profile
        existing_task_types = {task.template_task_id for task in process.tasks if task.template_task_id}
        
        recommendations = []
        for task_template in template.task_templates:
            if task_template.get("id") not in existing_task_types:
                # Personalize task based on user level and progress
                personalized_task = self._personalize_task_recommendation(
                    task_template, progress, process
                )
                recommendations.append(personalized_task)
        
        # Sort by priority and user level appropriateness
        recommendations.sort(key=lambda x: (x["priority_score"], x["xp_reward"]), reverse=True)
        
        return recommendations[:10]  # Return top 10 recommendations
    
    # ============================================================
    # Document Variation Management
    # ============================================================
    
    async def create_document_variation(self, user_id: str, 
                                      variation_data: DocumentVariationCreate) -> DocumentVariation:
        """Create a document variation with content analysis"""
        
        variation = DocumentVariation(
            user_id=user_id,
            **variation_data.model_dump()
        )
        self.db.add(variation)
        await self.db.flush()
        
        # Analyze content for ATS score, authenticity, etc.
        await self._analyze_document_variation(variation)
        
        # Record document variation creation event
        await self._record_process_event(
            process_id=variation.process_id,
            user_id=user_id,
            event_type="document_variation_created",
            event_category="document",
            event_data={"variation_type": variation.variation_type.value},
            xp_awarded=15
        )
        
        # Update gamification
        progress = await get_or_create_user_progress(self.db, user_id)
        progress.variations_created += 1
        progress.document_forge_xp += 15
        
        await self.db.commit()
        return variation
    
    async def propagate_base_document_changes(self, base_document_id: uuid.UUID, 
                                            user_id: str) -> List[DocumentVariation]:
        """Propagate changes from base document to all variations"""
        
        # Get all variations of the base document
        result = await self.db.execute(
            select(DocumentVariation).where(
                and_(
                    DocumentVariation.base_document_id == base_document_id,
                    DocumentVariation.user_id == user_id
                )
            )
        )
        variations = result.scalars().all()
        
        # Get base document content (would need to implement this)
        # base_document = await self._get_base_document(base_document_id)
        
        updated_variations = []
        for variation in variations:
            # Update shared sections while preserving customizations
            await self._update_variation_shared_content(variation)
            updated_variations.append(variation)
        
        await self.db.commit()
        return updated_variations
    
    # ============================================================
    # Technical Report Generation
    # ============================================================
    
    async def generate_technical_report(self, process_id: uuid.UUID, user_id: str,
                                      report_type: str = "standard") -> TechnicalReport:
        """Generate comprehensive technical report for a process"""
        
        # Get process with all related data
        result = await self.db.execute(
            select(Process)
            .where(and_(Process.id == process_id, Process.user_id == user_id))
            .options(
                selectinload(Process.tasks),
                selectinload(Process.documents),
                selectinload(Process.document_variations),
                selectinload(Process.events)
            )
        )
        process = result.scalar_one_or_none()
        
        if not process:
            raise ValueError("Process not found")
        
        # Generate report content
        report_data = await self._compile_technical_report_data(process)
        
        report = TechnicalReport(
            process_id=process_id,
            user_id=user_id,
            report_type=report_type,
            title=f"Technical Report: {process.title}",
            executive_summary=report_data["executive_summary"],
            content_sections=report_data["content_sections"],
            metrics_data=report_data["metrics_data"],
            timeline_data=report_data["timeline_data"],
            recommendations=report_data["recommendations"]
        )
        
        self.db.add(report)
        await self.db.flush()
        
        # Record report generation event
        await self._record_process_event(
            process_id=process_id,
            user_id=user_id,
            event_type="technical_report_generated",
            event_category="report",
            event_data={"report_type": report_type},
            xp_awarded=30
        )
        
        await self.db.commit()
        return report
    
    # ============================================================
    # Private Helper Methods
    # ============================================================
    
    async def _generate_tasks_from_template(self, process: Process):
        """Generate tasks from process template"""
        
        template_result = await self.db.execute(
            select(ProcessTemplate).where(ProcessTemplate.process_type == process.process_type)
        )
        template = template_result.scalar_one_or_none()
        
        if not template:
            return
        
        # Create tasks from template
        for i, task_template in enumerate(template.task_templates):
            task = ProcessTask(
                process_id=process.id,
                user_id=process.user_id,
                title=task_template["title"],
                description=task_template.get("description"),
                task_type=task_template.get("type", "template"),
                category=task_template.get("category", "general"),
                priority=TaskPriority(task_template.get("priority", "medium")),
                xp_reward=task_template.get("xp_reward", 10),
                estimated_hours=task_template.get("estimated_hours"),
                template_task_id=task_template.get("id"),
                task_metadata=task_template.get("metadata", {})
            )
            self.db.add(task)
    
    async def _recalculate_readiness_score(self, process: Process):
        """Recalculate process readiness score based on tasks and documents"""
        
        # Get task completion percentage
        total_tasks = len(process.tasks)
        completed_tasks = len([t for t in process.tasks if t.status == ProcessTaskStatus.COMPLETED])
        task_completion_rate = completed_tasks / total_tasks if total_tasks > 0 else 0
        
        # Get document completion (would need to implement document counting)
        document_completion_rate = 0.5  # Placeholder
        
        # Calculate readiness score (weighted average)
        readiness_score = (
            task_completion_rate * 0.6 +  # Tasks: 60%
            document_completion_rate * 0.3 +  # Documents: 30%
            0.1  # Profile completeness: 10%
        ) * 100
        
        process.readiness_score = min(readiness_score, 100.0)
    
    async def _update_momentum_score(self, process: Process, user_id: str):
        """Update process momentum score based on recent activity"""
        
        # Get recent events (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        result = await self.db.execute(
            select(ProcessEvent).where(
                and_(
                    ProcessEvent.process_id == process.id,
                    ProcessEvent.user_id == user_id,
                    ProcessEvent.created_at >= week_ago
                )
            )
        )
        recent_events = result.scalars().all()
        
        # Calculate momentum based on activity frequency and recency
        if not recent_events:
            process.momentum_score = max(process.momentum_score - 10, 0)
            return
        
        # More recent activity has higher weight
        momentum_points = 0
        for event in recent_events:
            days_ago = (datetime.utcnow() - event.created_at).days
            weight = max(1 - (days_ago / 7), 0.1)  # Decay over 7 days
            momentum_points += event.xp_awarded * weight
        
        # Normalize to 0-100 scale
        process.momentum_score = min(momentum_points / 10, 100.0)
    
    async def _record_process_event(self, process_id: uuid.UUID, user_id: str,
                                  event_type: str, event_category: str,
                                  event_data: Dict[str, Any], xp_awarded: int = 0):
        """Record a process event for analytics and gamification"""
        
        event = ProcessEvent(
            process_id=process_id,
            user_id=user_id,
            event_type=event_type,
            event_category=event_category,
            event_data=event_data,
            xp_awarded=xp_awarded
        )
        self.db.add(event)
    
    async def _update_gamification_for_process_creation(self, user_id: str):
        """Update gamification system for process creation"""
        
        progress = await get_or_create_user_progress(self.db, user_id)
        progress.total_xp += 25
        progress.document_forge_xp += 25
        
        # Update level if needed
        new_level = self.xp_calculator.calculate_level_from_xp(progress.total_xp)
        progress.current_level = new_level
    
    async def _send_aura_feedback(self, user_id: str, feedback_data: Dict[str, Any]):
        """Send feedback to Aura companion system"""
        
        # This would integrate with the existing companion service
        await self.companion_service.process_activity_feedback(user_id, feedback_data)
    
    async def _analyze_document_variation(self, variation: DocumentVariation):
        """Analyze document variation for ATS score, authenticity, etc."""
        
        # Placeholder for AI analysis
        # This would integrate with existing AI services
        variation.ats_score = 75.0  # Placeholder
        variation.authenticity_score = 85.0  # Placeholder
        variation.cultural_fit_score = 80.0  # Placeholder
    
    async def _compile_technical_report_data(self, process: Process) -> Dict[str, Any]:
        """Compile comprehensive technical report data"""
        
        # Calculate metrics
        total_tasks = len(process.tasks)
        completed_tasks = len([t for t in process.tasks if t.status == ProcessTaskStatus.COMPLETED])
        overdue_tasks = len([
            t for t in process.tasks 
            if t.due_date and t.due_date < datetime.utcnow() and t.status != ProcessTaskStatus.COMPLETED
        ])
        
        # Generate timeline data
        timeline_events = []
        for task in process.tasks:
            if task.completed_at:
                timeline_events.append({
                    "date": task.completed_at.isoformat(),
                    "type": "task_completed",
                    "title": task.title,
                    "xp_earned": task.xp_reward
                })
        
        # Generate recommendations
        recommendations = []
        if overdue_tasks > 0:
            recommendations.append({
                "type": "urgent",
                "title": "Address Overdue Tasks",
                "description": f"You have {overdue_tasks} overdue tasks that need immediate attention."
            })
        
        if process.readiness_score < process.target_readiness:
            gap = process.target_readiness - process.readiness_score
            recommendations.append({
                "type": "improvement",
                "title": "Increase Readiness Score",
                "description": f"Focus on completing tasks to increase readiness by {gap:.1f} points."
            })
        
        return {
            "executive_summary": f"Process '{process.title}' is {process.readiness_score:.1f}% ready with {completed_tasks}/{total_tasks} tasks completed.",
            "content_sections": {
                "overview": {
                    "process_type": process.process_type,
                    "status": process.status.value,
                    "deadline": process.deadline.isoformat() if process.deadline else None,
                    "readiness_score": process.readiness_score,
                    "momentum_score": process.momentum_score
                },
                "task_summary": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "overdue_tasks": overdue_tasks,
                    "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                }
            },
            "metrics_data": {
                "readiness_trend": [process.readiness_score],  # Would track over time
                "momentum_trend": [process.momentum_score],
                "task_completion_velocity": completed_tasks / max((datetime.utcnow() - process.created_at).days, 1)
            },
            "timeline_data": {
                "events": timeline_events,
                "milestones": []  # Would be populated from process milestones
            },
            "recommendations": recommendations
        }
    
    def _group_processes_by_type(self, processes: List[Process]) -> Dict[str, int]:
        """Group processes by type for analytics"""
        
        type_counts = {}
        for process in processes:
            type_counts[process.process_type] = type_counts.get(process.process_type, 0) + 1
        return type_counts
    
    def _group_processes_by_status(self, processes: List[Process]) -> Dict[str, int]:
        """Group processes by status for analytics"""
        
        status_counts = {}
        for process in processes:
            status_counts[process.status.value] = status_counts.get(process.status.value, 0) + 1
        return status_counts
    
    def _generate_generic_task_recommendations(self, process: Process) -> List[Dict[str, Any]]:
        """Generate generic task recommendations when no template is available"""
        
        return [
            {
                "title": "Research Requirements",
                "description": f"Research specific requirements for {process.process_type}",
                "priority": "high",
                "xp_reward": 20,
                "estimated_hours": 2,
                "priority_score": 90
            },
            {
                "title": "Prepare Documents",
                "description": "Gather and prepare required documents",
                "priority": "high",
                "xp_reward": 25,
                "estimated_hours": 3,
                "priority_score": 85
            },
            {
                "title": "Review Application",
                "description": "Review and finalize application materials",
                "priority": "medium",
                "xp_reward": 15,
                "estimated_hours": 1,
                "priority_score": 70
            }
        ]
    
    def _personalize_task_recommendation(self, task_template: Dict[str, Any], 
                                       progress: UserProgress, process: Process) -> Dict[str, Any]:
        """Personalize task recommendation based on user profile"""
        
        # Adjust XP reward based on user level
        base_xp = task_template.get("xp_reward", 10)
        level_multiplier = 1 + (progress.current_level - 1) * 0.1
        adjusted_xp = int(base_xp * level_multiplier)
        
        # Calculate priority score based on process urgency and user preferences
        priority_score = task_template.get("priority_score", 50)
        
        if process.deadline:
            days_until_deadline = (process.deadline - datetime.utcnow()).days
            if days_until_deadline <= 7:
                priority_score += 30
            elif days_until_deadline <= 30:
                priority_score += 15
        
        return {
            **task_template,
            "xp_reward": adjusted_xp,
            "priority_score": priority_score,
            "personalization_notes": f"Adjusted for Level {progress.current_level} user"
        }