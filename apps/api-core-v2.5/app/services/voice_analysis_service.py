"""
Voice Analysis Service
Inspirado em: Antriview e FoloUp

Transcreve áudio via Whisper e analisa delivery (tom, ritmo, pausas, confiança)
"""

from typing import Dict, Any, Optional
import io
import os
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

# Lazy import — only loaded when transcription is called
_openai_client = None

def _get_openai_client():
    global _openai_client
    if _openai_client is None:
        try:
            from openai import AsyncOpenAI
            _openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        except ImportError:
            logger.warning("openai package not installed — transcription will fall back to stub")
            return None
    return _openai_client


class VoiceAnalysisService:
    """Service for transcribing and analyzing voice recordings"""

    async def transcribe_audio(
        self,
        audio_data: bytes,
        language: str = "pt",
    ) -> Dict[str, Any]:
        """Transcribe audio to text via OpenAI Whisper API.

        Falls back to a stub when the openai package or API key is absent.
        """
        start_ms = time.monotonic()
        client = _get_openai_client()

        if client is None or not os.getenv("OPENAI_API_KEY"):
            logger.info("Whisper unavailable — returning stub transcription")
            return {
                "text": "[Transcrição indisponível — configure OPENAI_API_KEY]",
                "language": language,
                "confidence": 0.0,
                "duration": 0,
                "word_count": 0,
                "processing_time_ms": 0,
            }

        try:
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "recording.webm"

            response = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
                response_format="verbose_json",
            )

            text = response.text or ""
            elapsed_ms = int((time.monotonic() - start_ms) * 1000)

            return {
                "text": text,
                "language": response.language or language,
                "confidence": 0.95,  # Whisper doesn't return confidence; high by default
                "duration": getattr(response, "duration", 0),
                "word_count": len(text.split()),
                "processing_time_ms": elapsed_ms,
            }
        except Exception as exc:
            logger.error("Whisper transcription failed: %s", exc)
            return {
                "text": "",
                "language": language,
                "confidence": 0.0,
                "duration": 0,
                "word_count": 0,
                "processing_time_ms": int((time.monotonic() - start_ms) * 1000),
                "error": str(exc),
            }

    def analyze_delivery(
        self,
        audio_data: bytes,
        transcript: str,
    ) -> Dict[str, Any]:
        """Analyze speech delivery characteristics from transcript."""
        word_count = len(transcript.split())
        hesitations = self._count_hesitations(transcript)
        filler_words = self._count_filler_words(transcript)

        # Estimate speaking rate (assumes ~150 WPM average)
        estimated_duration_min = word_count / 150 if word_count > 0 else 0
        speaking_rate_wpm = word_count / estimated_duration_min if estimated_duration_min > 0 else 0

        # Derive scores from transcript analysis
        hesitation_penalty = min(hesitations * 3, 30)
        filler_penalty = min(filler_words * 2, 20)

        clarity_score = max(50, 85 - hesitation_penalty)
        confidence_score = max(50, 80 - filler_penalty)
        pace_score = 75 if 100 <= speaking_rate_wpm <= 180 else 60
        energy_score = min(90, 60 + word_count // 10)
        tone_score = round((clarity_score + confidence_score) / 2)

        return {
            "tone_score": tone_score,
            "pace_score": pace_score,
            "clarity_score": clarity_score,
            "confidence_score": confidence_score,
            "energy_score": energy_score,
            "hesitation_count": hesitations,
            "filler_word_count": filler_words,
            "speaking_rate_wpm": round(speaking_rate_wpm),
            "feedback": self._generate_delivery_feedback(
                hesitations=hesitations,
                filler_words=filler_words,
                word_count=word_count,
            ),
        }

    def analyze_content_quality(
        self,
        transcript: str,
        question_context: str,
    ) -> Dict[str, Any]:
        """Analyze content quality of the answer."""
        word_count = len(transcript.split())
        has_introduction = self._has_introduction(transcript)
        has_examples = self._has_examples(transcript)
        has_conclusion = self._has_conclusion(transcript)
        relevance_score = self._calculate_relevance(transcript, question_context)
        depth_score = self._calculate_depth(transcript, word_count)

        return {
            "relevance_score": relevance_score,
            "depth_score": depth_score,
            "structure_score": self._calculate_structure_score(has_introduction, has_examples, has_conclusion),
            "word_count": word_count,
            "has_introduction": has_introduction,
            "has_examples": has_examples,
            "has_conclusion": has_conclusion,
            "key_points": self._extract_key_points(transcript),
            "suggestions": self._generate_content_suggestions(relevance_score, depth_score, word_count),
        }

    def generate_comprehensive_feedback(
        self,
        transcript: str,
        delivery_analysis: Dict[str, Any],
        content_analysis: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate comprehensive feedback combining delivery and content."""
        overall_score = (
            delivery_analysis["confidence_score"] * 0.3
            + delivery_analysis["clarity_score"] * 0.2
            + content_analysis["relevance_score"] * 0.3
            + content_analysis["depth_score"] * 0.2
        )

        strengths = []
        if delivery_analysis["confidence_score"] >= 75:
            strengths.append("Demonstrou boa confiança ao falar")
        if delivery_analysis["clarity_score"] >= 75:
            strengths.append("Comunicação clara e articulada")
        if content_analysis["relevance_score"] >= 75:
            strengths.append("Resposta relevante e focada")
        if content_analysis["has_examples"]:
            strengths.append("Usou exemplos concretos")

        improvements = []
        if delivery_analysis["hesitation_count"] > 5:
            improvements.append("Reduza hesitações praticando a resposta")
        if delivery_analysis["filler_word_count"] > 8:
            improvements.append("Evite palavras de preenchimento (né, tipo, etc.)")
        if content_analysis["word_count"] < 50:
            improvements.append("Desenvolva mais sua resposta com detalhes")
        if not content_analysis["has_examples"]:
            improvements.append("Adicione exemplos concretos para ilustrar seus pontos")

        return {
            "overall_score": round(overall_score, 1),
            "transcript": transcript,
            "delivery": delivery_analysis,
            "content": content_analysis,
            "strengths": strengths,
            "improvements": improvements,
            "next_steps": self._generate_next_steps(overall_score, improvements),
        }

    # ------------------------------------------------------------------ helpers

    def _count_hesitations(self, text: str) -> int:
        hesitation_markers = ["hmm", "uhm", "uh", "ah", "eh", "...", "hã"]
        text_lower = text.lower()
        return sum(text_lower.count(m) for m in hesitation_markers)

    def _count_filler_words(self, text: str) -> int:
        fillers = ["né", "tipo", "assim", "sabe", "então", "aí", "like", "you know"]
        text_lower = text.lower()
        return sum(text_lower.count(f" {f} ") for f in fillers)

    def _has_introduction(self, text: str) -> bool:
        markers = ["primeiro", "primeiramente", "para começar", "inicialmente"]
        text_lower = text.lower()
        return any(m in text_lower for m in markers)

    def _has_examples(self, text: str) -> bool:
        markers = ["por exemplo", "como", "quando", "uma vez", "no projeto"]
        text_lower = text.lower()
        return any(m in text_lower for m in markers)

    def _has_conclusion(self, text: str) -> bool:
        markers = ["portanto", "assim", "concluindo", "em resumo", "finalmente"]
        text_lower = text.lower()
        return any(m in text_lower for m in markers)

    def _calculate_relevance(self, text: str, context: str) -> float:
        if not context:
            return 70.0
        context_words = set(context.lower().split())
        text_words = set(text.lower().split())
        if not context_words:
            return 70.0
        return min((len(context_words & text_words) / len(context_words)) * 100, 100.0)

    def _calculate_depth(self, text: str, word_count: int) -> float:
        if word_count < 30:
            return 40.0
        if word_count < 80:
            return 65.0
        if word_count < 150:
            return 80.0
        return 90.0

    def _calculate_structure_score(self, intro: bool, examples: bool, conclusion: bool) -> float:
        return float(33 * intro + 34 * examples + 33 * conclusion)

    def _extract_key_points(self, text: str) -> list:
        sentences = text.split(".")
        return [s.strip() for s in sentences if len(s.strip()) > 20][:3]

    def _generate_delivery_feedback(self, hesitations: int, filler_words: int, word_count: int) -> list:
        feedback = []
        if hesitations > 5:
            feedback.append({"type": "hesitation", "severity": "medium", "message": "Muitas hesitações detectadas. Pratique a resposta para maior fluência."})
        if filler_words > 8:
            feedback.append({"type": "filler_words", "severity": "medium", "message": "Reduza palavras de preenchimento. Pause em vez de usar 'né', 'tipo', etc."})
        if word_count < 50:
            feedback.append({"type": "brevity", "severity": "high", "message": "Resposta muito curta. Desenvolva mais seus pontos com exemplos."})
        return feedback

    def _generate_content_suggestions(self, relevance: float, depth: float, word_count: int) -> list:
        suggestions = []
        if relevance < 60:
            suggestions.append("Foque mais na pergunta específica feita")
        if depth < 60:
            suggestions.append("Adicione mais detalhes e contexto à sua resposta")
        if word_count < 50:
            suggestions.append("Expanda sua resposta com exemplos concretos")
        return suggestions

    def _generate_next_steps(self, score: float, improvements: list) -> list:
        if score < 60:
            return ["Pratique esta resposta mais 2-3 vezes", "Escreva um roteiro com pontos-chave"]
        if score < 80:
            return ["Refine os pontos de melhoria identificados", "Grave novamente focando na clareza"]
        return ["Excelente! Mantenha este padrão nas próximas respostas"]
