"""AI Analysis Engines

Concrete implementations for narrative, interview, and readiness analysis
using the prompt registry and AI service abstraction.
"""

import json
from typing import Optional, Dict, Any, List
from uuid import UUID
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.ai_service import (
    AICompletionRequest,
    AIMessage,
    AIProvider,
    AIServiceFactory,
)
from app.db.models import (
    PromptTemplate,
    PromptCategory,
    PromptExecutionLog,
    Narrative,
    InterviewAnswer,
    InterviewSession,
    User,
)


@dataclass
class NarrativeAnalysisResult:
    clarity_score: int
    coherence_score: int
    authenticity_score: int
    narrative_arc: str
    key_strengths: List[str]
    areas_for_improvement: List[str]
    suggested_edits: List[Dict[str, Any]]
    overall_feedback: str
    confidence: float


@dataclass
class InterviewFeedbackResult:
    overall_score: int
    confidence_score: int
    structure_score: int
    content_score: int
    clarity_score: int
    strengths: List[str]
    improvements: List[str]
    specific_feedback: List[Dict[str, str]]
    suggested_practice: List[str]
    confidence: float


@dataclass
class ReadinessAnalysisResult:
    gaps: List[Dict[str, Any]]
    strengths: List[str]
    recommended_sprint_templates: List[str]
    overall_readiness: float
    confidence: float


class PromptRenderer:
    """Renders prompt templates with variable substitution"""
    
    @staticmethod
    def render(template: str, variables: Dict[str, Any]) -> str:
        """Simple template rendering with {variable} substitution"""
        result = template
        for key, value in variables.items():
            placeholder = "{" + key + "}"
            result = result.replace(placeholder, str(value))
        return result


class AIAnalysisEngine:
    """Base class for AI analysis engines"""
    
    def __init__(self, db: AsyncSession, provider: AIProvider = AIProvider.SIMULATION):
        self.db = db
        self.ai_service = AIServiceFactory.create(provider)
        self.prompt_renderer = PromptRenderer()
    
    async def _get_prompt_template(
        self, category: PromptCategory, slug: Optional[str] = None
    ) -> Optional[PromptTemplate]:
        """Get active prompt template by category and optional slug"""
        query = select(PromptTemplate).where(
            PromptTemplate.category == category,
            PromptTemplate.status == "active"
        )
        if slug:
            query = query.where(PromptTemplate.slug == slug)
        
        result = await self.db.execute(query.order_by(PromptTemplate.version.desc()))
        return result.scalar_one_or_none()
    
    async def _execute_prompt(
        self,
        template: PromptTemplate,
        variables: Dict[str, Any],
        user_id: Optional[UUID] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Execute a prompt template and log the execution"""
        # Render the prompt
        rendered_prompt = self.prompt_renderer.render(
            template.user_prompt_template,
            variables
        )
        
        # Create messages
        messages = []
        if template.system_prompt:
            messages.append(AIMessage(role="system", content=template.system_prompt))
        messages.append(AIMessage(role="user", content=rendered_prompt))
        
        # Create request
        request = AICompletionRequest(
            messages=messages,
            model=template.default_model,
            temperature=template.default_temperature,
            max_tokens=template.max_tokens,
            response_format={"type": "json_object"} if template.expected_response_format == "json" else None
        )
        
        # Execute
        response = await self.ai_service.complete(request)
        
        # Log execution
        log = PromptExecutionLog(
            template_id=template.id,
            user_id=user_id,
            related_entity_type=entity_type,
            related_entity_id=entity_id,
            input_variables=variables,
            rendered_prompt=rendered_prompt,
            response_content=response.content,
            response_status="success" if response.finish_reason == "stop" else "error",
            latency_ms=None,  # Would track actual latency
            prompt_tokens=response.usage.get("prompt_tokens"),
            completion_tokens=response.usage.get("completion_tokens"),
            total_tokens=response.usage.get("total_tokens"),
            model_used=response.model,
            provider_used=response.provider.value
        )
        self.db.add(log)
        
        # Update template usage stats
        template.usage_count += 1
        
        await self.db.commit()
        
        # Parse response
        if template.expected_response_format == "json":
            try:
                return json.loads(response.content)
            except json.JSONDecodeError:
                return {"error": "Failed to parse JSON response", "raw": response.content}
        return {"content": response.content}


class NarrativeAnalysisEngine(AIAnalysisEngine):
    """AI analysis for narrative documents"""
    
    async def analyze_narrative(
        self,
        narrative: Narrative,
        user: User,
        narrative_type: Optional[str] = None
    ) -> NarrativeAnalysisResult:
        """Analyze a narrative document"""
        # Get template
        template = await self._get_prompt_template(
            PromptCategory.NARRATIVE_ANALYSIS,
            slug=f"analyze_{narrative_type or 'general'}"
        )
        
        if not template:
            # Fallback to generic template or simulation
            template = await self._get_prompt_template(PromptCategory.NARRATIVE_ANALYSIS)
        
        # Default simulation if no template
        if not template:
            return self._simulate_narrative_analysis(narrative.content)
        
        # Prepare variables
        variables = {
            "narrative_text": narrative.content,
            "narrative_type": narrative_type or narrative.narrative_type.value,
            "target_audience": "admissions committee",
            "word_count": len(narrative.content.split())
        }
        
        # Execute
        result_data = await self._execute_prompt(
            template=template,
            variables=variables,
            user_id=user.id,
            entity_type="narrative",
            entity_id=narrative.id
        )
        
        return NarrativeAnalysisResult(
            clarity_score=result_data.get("clarity_score", 70),
            coherence_score=result_data.get("coherence_score", 75),
            authenticity_score=result_data.get("authenticity_score", 80),
            narrative_arc=result_data.get("narrative_arc", "growth"),
            key_strengths=result_data.get("key_strengths", []),
            areas_for_improvement=result_data.get("areas_for_improvement", []),
            suggested_edits=result_data.get("suggested_edits", []),
            overall_feedback=result_data.get("overall_feedback", "Analysis completed"),
            confidence=result_data.get("confidence", 0.8)
        )
    
    def _simulate_narrative_analysis(self, content: str) -> NarrativeAnalysisResult:
        """Simulate analysis for development without AI"""
        word_count = len(content.split())
        
        return NarrativeAnalysisResult(
            clarity_score=min(95, 60 + word_count // 50),
            coherence_score=min(95, 65 + word_count // 60),
            authenticity_score=85,
            narrative_arc="transformation" if "change" in content.lower() else "growth",
            key_strengths=[
                "Personal voice is authentic",
                "Clear motivation stated",
                "Good structure with beginning, middle, end"
            ],
            areas_for_improvement=[
                "Could add more specific examples",
                "Consider tightening the conclusion"
            ],
            suggested_edits=[
                {
                    "location": "paragraph_2",
                    "original": "...",
                    "suggestion": "Add specific achievement metric here"
                }
            ],
            overall_feedback="Strong personal narrative with authentic voice. Consider adding more concrete details to strengthen impact.",
            confidence=0.82
        )


class InterviewFeedbackEngine(AIAnalysisEngine):
    """AI feedback for interview answers"""
    
    async def analyze_answer(
        self,
        session: InterviewSession,
        answer: InterviewAnswer,
        user: User
    ) -> InterviewFeedbackResult:
        """Analyze an interview answer"""
        template = await self._get_prompt_template(
            PromptCategory.INTERVIEW_FEEDBACK,
            slug="analyze_answer"
        )
        
        if not template:
            return self._simulate_interview_feedback(answer.content)
        
        variables = {
            "question": answer.question_text or "Interview question",
            "answer": answer.content or "",
            "answer_type": answer.answer_type.value,
            "duration_seconds": answer.duration_seconds or 0,
            "target_duration_minutes": "2-3"
        }
        
        result_data = await self._execute_prompt(
            template=template,
            variables=variables,
            user_id=user.id,
            entity_type="interview_answer",
            entity_id=answer.id
        )
        
        return InterviewFeedbackResult(
            overall_score=result_data.get("overall_score", 75),
            confidence_score=result_data.get("confidence_score", 70),
            structure_score=result_data.get("structure_score", 80),
            content_score=result_data.get("content_score", 78),
            clarity_score=result_data.get("clarity_score", 76),
            strengths=result_data.get("strengths", []),
            improvements=result_data.get("improvements", []),
            specific_feedback=result_data.get("specific_feedback", []),
            suggested_practice=result_data.get("suggested_practice", []),
            confidence=result_data.get("confidence", 0.8)
        )
    
    async def generate_session_feedback(
        self,
        session: InterviewSession,
        answers: List[InterviewAnswer],
        user: User
    ) -> Dict[str, Any]:
        """Generate overall feedback for an interview session"""
        template = await self._get_prompt_template(
            PromptCategory.INTERVIEW_FEEDBACK,
            slug="session_summary"
        )
        
        if not template:
            return self._simulate_session_feedback(len(answers))
        
        # Summarize answers
        answer_summaries = [
            {
                "question": a.question_text,
                "score": 75,  # Would use stored score
                "key_points": []
            }
            for a in answers
        ]
        
        variables = {
            "session_type": session.session_type.value,
            "total_questions": len(answers),
            "answer_summaries": json.dumps(answer_summaries),
            "duration_minutes": session.duration_minutes or 30
        }
        
        result = await self._execute_prompt(
            template=template,
            variables=variables,
            user_id=user.id,
            entity_type="interview_session",
            entity_id=session.id
        )
        
        return result
    
    def _simulate_interview_feedback(self, content: str) -> InterviewFeedbackResult:
        """Simulate interview feedback"""
        content_length = len(content.split()) if content else 0
        
        return InterviewFeedbackResult(
            overall_score=min(95, 70 + content_length // 20),
            confidence_score=72,
            structure_score=80,
            content_score=78,
            clarity_score=76,
            strengths=[
                "Clear and articulate delivery",
                "Good use of specific examples",
                "Maintained professional tone"
            ],
            improvements=[
                "Could be more concise",
                "Add more quantifiable achievements"
            ],
            specific_feedback=[
                {
                    "aspect": "Opening",
                    "feedback": "Strong hook, captures attention immediately"
                },
                {
                    "aspect": "Body",
                    "feedback": "Good structure, consider adding one more example"
                }
            ],
            suggested_practice=[
                "STAR method practice",
                "Time management exercises"
            ],
            confidence=0.81
        )
    
    def _simulate_session_feedback(self, num_answers: int) -> Dict[str, Any]:
        return {
            "overall_performance": "good",
            "average_score": 76,
            "strengths": ["Consistent structure", "Clear communication"],
            "areas_for_improvement": ["Depth of examples", "Time management"],
            "recommended_focus": "Technical depth questions",
            "practice_suggestions": ["Mock interviews with peer feedback"]
        }


class ReadinessAnalysisEngine(AIAnalysisEngine):
    """AI analysis for readiness assessments"""
    
    async def analyze_readiness(
        self,
        user: User,
        user_profile: Dict[str, Any],
        route_requirements: Optional[Dict[str, Any]] = None
    ) -> ReadinessAnalysisResult:
        """Analyze user's readiness for a route or generally"""
        template = await self._get_prompt_template(
            PromptCategory.READINESS_ASSESSMENT,
            slug="analyze_readiness"
        )
        
        if not template:
            return self._simulate_readiness_analysis(user_profile)
        
        variables = {
            "user_background": json.dumps(user_profile.get("background", {})),
            "documents_status": json.dumps(user_profile.get("documents", {})),
            "language_scores": json.dumps(user_profile.get("language", {})),
            "experience": json.dumps(user_profile.get("experience", [])),
            "target_requirements": json.dumps(route_requirements or {})
        }
        
        result_data = await self._execute_prompt(
            template=template,
            variables=variables,
            user_id=user.id,
            entity_type="readiness_assessment"
        )
        
        return ReadinessAnalysisResult(
            gaps=result_data.get("gaps", []),
            strengths=result_data.get("strengths", []),
            recommended_sprint_templates=result_data.get("recommended_sprint_templates", []),
            overall_readiness=result_data.get("overall_readiness", 65),
            confidence=result_data.get("confidence", 0.75)
        )
    
    async def generate_sprint_recommendations(
        self,
        gaps: List[Dict[str, Any]],
        user: User
    ) -> List[Dict[str, Any]]:
        """Generate sprint recommendations based on gaps"""
        template = await self._get_prompt_template(
            PromptCategory.SPRINT_GENERATION,
            slug="from_gaps"
        )
        
        if not template:
            return self._simulate_sprint_recommendations(gaps)
        
        variables = {
            "gaps": json.dumps(gaps),
            "max_sprints": 3,
            "user_context": "graduate school preparation"
        }
        
        result = await self._execute_prompt(
            template=template,
            variables=variables,
            user_id=user.id,
            entity_type="sprint_generation"
        )
        
        return result.get("recommendations", [])
    
    def _simulate_readiness_analysis(
        self, user_profile: Dict[str, Any]
    ) -> ReadinessAnalysisResult:
        """Simulate readiness analysis"""
        return ReadinessAnalysisResult(
            gaps=[
                {
                    "category": "language",
                    "severity": "high",
                    "description": "English proficiency needs improvement for academic writing",
                    "blocking": True,
                    "estimated_resolution_days": 90
                },
                {
                    "category": "documentation",
                    "severity": "medium",
                    "description": "Missing two recommendation letters",
                    "blocking": True,
                    "estimated_resolution_days": 30
                },
                {
                    "category": "financial",
                    "severity": "medium",
                    "description": "Proof of funds documentation incomplete",
                    "blocking": False,
                    "estimated_resolution_days": 14
                }
            ],
            strengths=[
                "Strong academic background",
                "Relevant research experience",
                "Clear motivation statement"
            ],
            recommended_sprint_templates=[
                "language_intensive",
                "documentation_gathering",
                "financial_prep"
            ],
            overall_readiness=62,
            confidence=0.78
        )
    
    def _simulate_sprint_recommendations(
        self, gaps: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Simulate sprint recommendations"""
        recommendations = []
        
        for gap in gaps[:3]:
            category = gap.get("category", "general")
            severity = gap.get("severity", "medium")
            
            recommendations.append({
                "name": f"{category.replace('_', ' ').title()} Sprint",
                "description": f"Focus on addressing {category} gap",
                "gap_category": category,
                "duration_days": 21 if severity == "high" else 14,
                "estimated_effort_hours": 30 if severity == "high" else 20,
                "priority": severity,
                "reason": f"Addresses {severity} priority gap in {category}",
                "suggested_tasks": [
                    {"title": f"Assess current {category} status", "category": category},
                    {"title": f"Complete {category} exercise 1", "category": category},
                    {"title": f"Review {category} materials", "category": category}
                ]
            })
        
        return recommendations
