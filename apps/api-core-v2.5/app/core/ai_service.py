"""AI Service Abstraction Layer

Provides a unified interface for multiple AI providers (OpenAI, Anthropic, OpenClaw, etc.)
with adapter pattern for easy provider switching.

Provider selection is driven by the AI_PROVIDER env var (see config.py).
Default: "simulation" — no API keys needed, returns hardcoded scores.

To add a new provider:
  1. Create a class extending AIProviderAdapter
  2. Register it in AIServiceFactory._adapters
  3. Add its API key / config fields to config.py Settings
  4. The get_ai_service() singleton will pick it up automatically
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, List, Dict, Any, AsyncGenerator
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    OPENCLAW = "openclaw"
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
    
    def __init__(self, default_model: str = "simulation", **kwargs: Any):
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
        elif "polish" in last_message.lower() or "rewrite" in last_message.lower():
            content = self._simulate_forge_polish(last_message)
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
    
    def _simulate_forge_polish(self, prompt: str) -> str:
        import json
        # Extract a snippet of the input text from the prompt if present
        snippet = prompt[200:400] if len(prompt) > 200 else prompt
        polished = (
            f"[Polished by Olcan Forge — SIMULATION MODE]\n\n"
            f"My journey began with a transformative realization: the gap between where I stood "
            f"and where I aspired to be was not defined by circumstance, but by deliberate action. "
            f"Through systematic preparation and focused effort, I developed the resilience and "
            f"clarity necessary to pursue this opportunity with conviction.\n\n"
            f"{snippet}\n\n"
            f"This experience crystallized my commitment to excellence and reinforced my belief "
            f"that meaningful impact emerges from the intersection of preparation, purpose, and persistence."
        )
        return json.dumps({
            "polished_content": polished,
            "changes_summary": "Enhanced opening impact, strengthened narrative arc, clarified motivation, improved conclusion coherence.",
            "word_count_before": len(prompt.split()),
            "word_count_after": len(polished.split()),
            "methodology_applied": "STAR",
            "confidence": 0.88
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


class OpenClawAdapter(AIProviderAdapter):
    """OpenClaw adapter — Olcan's future primary AI provider.

    When the OpenClaw API is ready, implement the HTTP calls here.
    Until then, this adapter validates that an API key is configured and
    falls back to raising a clear error so callers know the provider
    isn't live yet.

    Env vars needed:
        OPENCLAW_API_KEY   — the secret key
        OPENCLAW_BASE_URL  — defaults to https://api.openclaw.ai
    """

    provider = AIProvider.OPENCLAW

    def __init__(
        self,
        api_key: Optional[str] = None,
        default_model: Optional[str] = None,
        base_url: str = "https://api.openclaw.ai",
    ):
        if not api_key:
            raise ValueError(
                "OpenClaw API key is required. Set the OPENCLAW_API_KEY env var."
            )
        super().__init__(api_key=api_key, default_model=default_model or "openclaw-v1")
        self.base_url = base_url.rstrip("/")

    async def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        """Send completion to OpenClaw.

        TODO: Replace stub with real HTTP call when OpenClaw API is available.
        The request/response shapes are modelled after the OpenAI-compatible
        chat completions format, which OpenClaw is expected to follow.
        """
        # ── Stub implementation — replace with httpx call ──
        # import httpx
        # async with httpx.AsyncClient() as client:
        #     resp = await client.post(
        #         f"{self.base_url}/v1/chat/completions",
        #         headers={"Authorization": f"Bearer {self.api_key}"},
        #         json={
        #             "model": request.model or self.default_model,
        #             "messages": [{"role": m.role, "content": m.content} for m in request.messages],
        #             "temperature": request.temperature,
        #             "max_tokens": request.max_tokens,
        #         },
        #         timeout=60.0,
        #     )
        #     resp.raise_for_status()
        #     data = resp.json()
        #     return AICompletionResponse(
        #         content=data["choices"][0]["message"]["content"],
        #         model=data["model"],
        #         provider=self.provider,
        #         usage=data.get("usage", {}),
        #         finish_reason=data["choices"][0].get("finish_reason", "stop"),
        #         raw_response=data,
        #     )

        raise NotImplementedError(
            "OpenClaw API integration is pending. "
            "Uncomment the httpx implementation above once the API is live. "
            "In the meantime, set AI_PROVIDER=simulation in your .env file."
        )

    async def complete_stream(
        self, request: AICompletionRequest
    ) -> AsyncGenerator[str, None]:
        raise NotImplementedError("OpenClaw streaming not yet implemented.")
        yield  # noqa: unreachable — makes this a valid generator

    async def health_check(self) -> bool:
        """Check if OpenClaw API is reachable."""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{self.base_url}/health",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=5.0,
                )
                return resp.status_code == 200
        except Exception:
            return False


class AIServiceFactory:
    """Factory for creating AI service instances.

    All known adapters are registered here. The get_ai_service() singleton
    reads AI_PROVIDER from config.py to decide which one to instantiate.
    """

    _adapters: Dict[AIProvider, type] = {
        AIProvider.SIMULATION: SimulationAdapter,
        AIProvider.OPENCLAW: OpenClawAdapter,
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
        default_model: Optional[str] = None,
        **kwargs: Any,
    ) -> AIProviderAdapter:
        """Create an AI provider adapter instance"""
        if provider not in cls._adapters:
            raise ValueError(
                f"Unknown AI provider: {provider}. "
                f"Available: {list(cls._adapters.keys())}"
            )

        adapter_class = cls._adapters[provider]
        return adapter_class(api_key=api_key, default_model=default_model, **kwargs)

    @classmethod
    def get_available_providers(cls) -> List[AIProvider]:
        """Get list of available providers"""
        return list(cls._adapters.keys())


# ---------------------------------------------------------------------------
# Global singleton — reads provider choice from config.py
# ---------------------------------------------------------------------------
_ai_service: Optional[AIProviderAdapter] = None


def get_ai_service() -> AIProviderAdapter:
    """Get or create the global AI service instance.

    Provider is determined by settings.ai_provider (env var AI_PROVIDER).
    Falls back to SIMULATION if the configured provider can't be initialised.
    """
    global _ai_service
    if _ai_service is not None:
        return _ai_service

    from app.core.config import settings

    provider_name = settings.ai_provider.lower().strip()

    try:
        provider = AIProvider(provider_name)
    except ValueError:
        logger.warning(
            "Unknown AI_PROVIDER '%s' — falling back to simulation.", provider_name
        )
        provider = AIProvider.SIMULATION

    # Build kwargs depending on provider
    kwargs: Dict[str, Any] = {}

    if provider == AIProvider.OPENCLAW:
        kwargs["api_key"] = settings.openclaw_api_key
        kwargs["default_model"] = settings.openclaw_default_model
        kwargs["base_url"] = settings.openclaw_base_url
    elif provider == AIProvider.OPENAI:
        kwargs["api_key"] = settings.openai_api_key
        kwargs["default_model"] = settings.openai_default_model
    elif provider == AIProvider.ANTHROPIC:
        kwargs["api_key"] = settings.anthropic_api_key
        kwargs["default_model"] = settings.anthropic_default_model

    try:
        _ai_service = AIServiceFactory.create(provider, **kwargs)
        logger.info("AI service initialised: provider=%s", provider.value)
    except (ValueError, NotImplementedError) as exc:
        logger.warning(
            "Failed to initialise AI provider '%s': %s — falling back to simulation.",
            provider.value,
            exc,
        )
        _ai_service = AIServiceFactory.create(AIProvider.SIMULATION)

    return _ai_service


def get_ai_provider_enum() -> AIProvider:
    """Return the AIProvider enum for the currently active service.

    Useful for logging which provider was used in usage logs.
    """
    service = get_ai_service()
    return service.provider


def set_ai_service(service: AIProviderAdapter):
    """Set the global AI service instance (useful for tests)."""
    global _ai_service
    _ai_service = service


def reset_ai_service():
    """Reset the singleton so the next call to get_ai_service() re-reads config.

    Call this after changing settings.ai_provider at runtime (e.g. in tests).
    """
    global _ai_service
    _ai_service = None
