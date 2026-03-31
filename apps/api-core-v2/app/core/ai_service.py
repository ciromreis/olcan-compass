"""AI Service Abstraction Layer

Provides a unified interface for multiple AI providers (OpenAI, Anthropic, etc.)
with adapter pattern for easy provider switching.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, List, Dict, Any, AsyncGenerator
from enum import Enum


class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    SIMULATION = "simulation"  # For testing/development


@dataclass
class AIMessage:
    role: str  # system, user, assistant
    content: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class AICompletionRequest:
    messages: List[AIMessage]
    model: Optional[str] = None
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    response_format: Optional[Dict[str, Any]] = None  # For structured JSON output


@dataclass
class AICompletionResponse:
    content: str
    model: str
    provider: AIProvider
    usage: Dict[str, int]  # prompt_tokens, completion_tokens, total_tokens
    finish_reason: str
    raw_response: Optional[Dict[str, Any]] = None


class AIProviderAdapter(ABC):
    """Abstract base class for AI provider adapters"""
    
    provider: AIProvider
    
    def __init__(self, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self.api_key = api_key
        self.default_model = default_model
    
    @abstractmethod
    async def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        """Send completion request to AI provider"""
        pass
    
    @abstractmethod
    async def complete_stream(
        self, request: AICompletionRequest
    ) -> AsyncGenerator[str, None]:
        """Stream completion from AI provider"""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if provider is available"""
        pass


class SimulationAdapter(AIProviderAdapter):
    """Simulation adapter for development/testing without API keys"""
    
    provider = AIProvider.SIMULATION
    
    def __init__(self, default_model: str = "simulation"):
        super().__init__(api_key="simulation", default_model=default_model)
    
    async def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        """Return simulated response based on prompt content"""
        last_message = request.messages[-1].content if request.messages else ""
        
        # Simple simulation patterns
        if "narrative" in last_message.lower() and "analyze" in last_message.lower():
            content = self._simulate_narrative_analysis()
        elif "interview" in last_message.lower() and "feedback" in last_message.lower():
            content = self._simulate_interview_feedback()
        elif "readiness" in last_message.lower() or "gap" in last_message.lower():
            content = self._simulate_readiness_analysis()
        elif "score" in last_message.lower() or "rate" in last_message.lower():
            content = self._simulate_scoring()
        else:
            content = '{"result": "Simulated AI response", "confidence": 0.85}'
        
        return AICompletionResponse(
            content=content,
            model=self.default_model or "simulation-v1",
            provider=self.provider,
            usage={"prompt_tokens": 100, "completion_tokens": 50, "total_tokens": 150},
            finish_reason="stop",
            raw_response={"simulated": True}
        )
    
    async def complete_stream(
        self, request: AICompletionRequest
    ) -> AsyncGenerator[str, None]:
        """Simulate streaming response"""
        response = await self.complete(request)
        words = response.content.split()
        for word in words:
            yield word + " "
    
    async def health_check(self) -> bool:
        return True
    
    def _simulate_narrative_analysis(self) -> str:
        import json
        return json.dumps({
            "clarity_score": 75,
            "coherence_score": 82,
            "authenticity_score": 88,
            "narrative_arc": "transformation",
            "key_strengths": ["Compelling opening", "Clear motivation", "Strong conclusion"],
            "areas_for_improvement": ["Add more specific examples", "Clarify timeline"],
            "suggested_edits": [
                {"location": "paragraph_2", "suggestion": "Expand on specific achievement"}
            ],
            "overall_feedback": "Strong narrative with clear progression. Consider adding more concrete details.",
            "confidence": 0.87
        })
    
    def _simulate_interview_feedback(self) -> str:
        import json
        return json.dumps({
            "overall_score": 78,
            "confidence_score": 72,
            "structure_score": 85,
            "content_score": 80,
            "clarity_score": 75,
            "strengths": ["Clear communication", "Good structure", "Relevant examples"],
            "improvements": ["More concise answers", "Stronger opening statements"],
            "specific_feedback": [
                {"question": "Tell me about yourself", "feedback": "Good overview, add more achievements"},
                {"question": "Why this program", "feedback": "Strong motivation, be more specific"}
            ],
            "suggested_practice": ["STAR method practice", "Technical depth questions"],
            "confidence": 0.82
        })
    
    def _simulate_readiness_analysis(self) -> str:
        import json
        return json.dumps({
            "gaps": [
                {
                    "category": "language",
                    "severity": "high",
                    "description": "TOEFL score below target (85 vs required 100)",
                    "blocking": True,
                    "estimated_resolution_days": 90
                },
                {
                    "category": "documentation",
                    "severity": "medium", 
                    "description": "Missing recommendation letters",
                    "blocking": True,
                    "estimated_resolution_days": 30
                }
            ],
            "strengths": ["Strong academic background", "Relevant research experience"],
            "recommended_sprint_templates": ["language_intensive", "documentation_gathering"],
            "overall_readiness": 65,
            "confidence": 0.79
        })
    
    def _simulate_scoring(self) -> str:
        import json
        return json.dumps({
            "score": 82,
            "breakdown": {
                "clarity": 80,
                "relevance": 85,
                "completeness": 78,
                "originality": 88
            },
            "confidence": 0.81
        })


class AIServiceFactory:
    """Factory for creating AI service instances"""
    
    _adapters: Dict[AIProvider, type] = {
        AIProvider.SIMULATION: SimulationAdapter,
    }
    
    @classmethod
    def register_adapter(cls, provider: AIProvider, adapter_class: type):
        """Register a new provider adapter"""
        cls._adapters[provider] = adapter_class
    
    @classmethod
    def create(
        cls,
        provider: AIProvider,
        api_key: Optional[str] = None,
        default_model: Optional[str] = None
    ) -> AIProviderAdapter:
        """Create an AI provider adapter instance"""
        if provider not in cls._adapters:
            raise ValueError(f"Unknown AI provider: {provider}")
        
        adapter_class = cls._adapters[provider]
        return adapter_class(api_key=api_key, default_model=default_model)
    
    @classmethod
    def get_available_providers(cls) -> List[AIProvider]:
        """Get list of available providers"""
        return list(cls._adapters.keys())


# Global service instance
_ai_service: Optional[AIProviderAdapter] = None


def get_ai_service() -> AIProviderAdapter:
    """Get or create default AI service instance"""
    global _ai_service
    if _ai_service is None:
        # Default to simulation for development
        _ai_service = AIServiceFactory.create(AIProvider.SIMULATION)
    return _ai_service


def set_ai_service(service: AIProviderAdapter):
    """Set the global AI service instance"""
    global _ai_service
    _ai_service = service
