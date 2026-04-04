"""
Voice Analysis Service
Inspirado em: Antriview e FoloUp

Transcreve áudio e analisa delivery (tom, ritmo, pausas, confiança)
"""

from typing import Dict, Any, Optional
import io
import base64
from datetime import datetime

# Placeholder para integração futura com Whisper API ou similar
# import openai


class VoiceAnalysisService:
    """Service for transcribing and analyzing voice recordings"""
    
    def __init__(self):
        # Configuração futura para API de transcrição
        # self.whisper_api_key = os.getenv("OPENAI_API_KEY")
        pass
    
    async def transcribe_audio(
        self,
        audio_data: bytes,
        language: str = "pt"
    ) -> Dict[str, Any]:
        """
        Transcreve áudio para texto
        
        Args:
            audio_data: Bytes do arquivo de áudio
            language: Código do idioma (pt, en, es, etc.)
            
        Returns:
            Dict com transcrição e metadados
        """
        # TODO: Integrar com Whisper API ou similar
        # Por enquanto, retorna placeholder
        
        # Simulação de transcrição
        # Em produção, usar:
        # response = openai.Audio.transcribe(
        #     model="whisper-1",
        #     file=audio_data,
        #     language=language
        # )
        
        return {
            "text": "[Transcrição será processada quando API estiver configurada]",
            "language": language,
            "confidence": 0.0,
            "duration": 0,
            "word_count": 0,
            "processing_time_ms": 0
        }
    
    def analyze_delivery(
        self,
        audio_data: bytes,
        transcript: str
    ) -> Dict[str, Any]:
        """
        Analisa características de delivery da fala
        
        Args:
            audio_data: Bytes do arquivo de áudio
            transcript: Texto transcrito
            
        Returns:
            Dict com análise de delivery
        """
        # TODO: Implementar análise de áudio
        # Características a analisar:
        # - Tom de voz (pitch)
        # - Velocidade (words per minute)
        # - Pausas e hesitações
        # - Volume e energia
        # - Variação tonal
        
        # Análise básica baseada em transcript
        word_count = len(transcript.split())
        
        # Detectar hesitações comuns
        hesitations = self._count_hesitations(transcript)
        
        # Detectar palavras de preenchimento
        filler_words = self._count_filler_words(transcript)
        
        return {
            "tone_score": 70,  # Placeholder
            "pace_score": 75,  # Placeholder
            "clarity_score": 80,  # Placeholder
            "confidence_score": 72,  # Placeholder
            "energy_score": 68,  # Placeholder
            "hesitation_count": hesitations,
            "filler_word_count": filler_words,
            "speaking_rate_wpm": word_count * 2,  # Estimativa
            "feedback": self._generate_delivery_feedback(
                hesitations=hesitations,
                filler_words=filler_words,
                word_count=word_count
            )
        }
    
    def analyze_content_quality(
        self,
        transcript: str,
        question_context: str
    ) -> Dict[str, Any]:
        """
        Analisa qualidade do conteúdo da resposta
        
        Args:
            transcript: Texto transcrito
            question_context: Contexto da pergunta
            
        Returns:
            Dict com análise de conteúdo
        """
        word_count = len(transcript.split())
        
        # Análise de estrutura
        has_introduction = self._has_introduction(transcript)
        has_examples = self._has_examples(transcript)
        has_conclusion = self._has_conclusion(transcript)
        
        # Análise de relevância
        relevance_score = self._calculate_relevance(transcript, question_context)
        
        # Análise de profundidade
        depth_score = self._calculate_depth(transcript, word_count)
        
        return {
            "relevance_score": relevance_score,
            "depth_score": depth_score,
            "structure_score": self._calculate_structure_score(
                has_introduction, has_examples, has_conclusion
            ),
            "word_count": word_count,
            "has_introduction": has_introduction,
            "has_examples": has_examples,
            "has_conclusion": has_conclusion,
            "key_points": self._extract_key_points(transcript),
            "suggestions": self._generate_content_suggestions(
                relevance_score, depth_score, word_count
            )
        }
    
    def generate_comprehensive_feedback(
        self,
        transcript: str,
        delivery_analysis: Dict[str, Any],
        content_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Gera feedback abrangente combinando delivery e conteúdo
        
        Args:
            transcript: Texto transcrito
            delivery_analysis: Análise de delivery
            content_analysis: Análise de conteúdo
            
        Returns:
            Dict com feedback completo
        """
        # Score geral (média ponderada)
        overall_score = (
            delivery_analysis["confidence_score"] * 0.3 +
            delivery_analysis["clarity_score"] * 0.2 +
            content_analysis["relevance_score"] * 0.3 +
            content_analysis["depth_score"] * 0.2
        )
        
        # Identificar pontos fortes
        strengths = []
        if delivery_analysis["confidence_score"] >= 75:
            strengths.append("Demonstrou boa confiança ao falar")
        if delivery_analysis["clarity_score"] >= 75:
            strengths.append("Comunicação clara e articulada")
        if content_analysis["relevance_score"] >= 75:
            strengths.append("Resposta relevante e focada")
        if content_analysis["has_examples"]:
            strengths.append("Usou exemplos concretos")
        
        # Identificar áreas de melhoria
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
            "next_steps": self._generate_next_steps(overall_score, improvements)
        }
    
    # Helper methods
    
    def _count_hesitations(self, text: str) -> int:
        """Conta hesitações no texto"""
        hesitation_markers = ["hmm", "uhm", "uh", "ah", "eh", "...", "hã"]
        count = 0
        text_lower = text.lower()
        for marker in hesitation_markers:
            count += text_lower.count(marker)
        return count
    
    def _count_filler_words(self, text: str) -> int:
        """Conta palavras de preenchimento"""
        fillers = ["né", "tipo", "assim", "sabe", "então", "aí", "like", "you know"]
        count = 0
        text_lower = text.lower()
        for filler in fillers:
            count += text_lower.count(f" {filler} ")
        return count
    
    def _has_introduction(self, text: str) -> bool:
        """Verifica se tem introdução clara"""
        intro_markers = ["primeiro", "primeiramente", "para começar", "inicialmente"]
        text_lower = text.lower()
        return any(marker in text_lower for marker in intro_markers)
    
    def _has_examples(self, text: str) -> bool:
        """Verifica se usa exemplos"""
        example_markers = ["por exemplo", "como", "quando", "uma vez", "no projeto"]
        text_lower = text.lower()
        return any(marker in text_lower for marker in example_markers)
    
    def _has_conclusion(self, text: str) -> bool:
        """Verifica se tem conclusão"""
        conclusion_markers = ["portanto", "assim", "concluindo", "em resumo", "finalmente"]
        text_lower = text.lower()
        return any(marker in text_lower for marker in conclusion_markers)
    
    def _calculate_relevance(self, text: str, context: str) -> float:
        """Calcula relevância da resposta"""
        # Análise simples - em produção usar embeddings
        if not context:
            return 70.0
        
        context_words = set(context.lower().split())
        text_words = set(text.lower().split())
        overlap = len(context_words & text_words)
        
        if len(context_words) == 0:
            return 70.0
        
        relevance = (overlap / len(context_words)) * 100
        return min(relevance, 100.0)
    
    def _calculate_depth(self, text: str, word_count: int) -> float:
        """Calcula profundidade da resposta"""
        if word_count < 30:
            return 40.0
        elif word_count < 80:
            return 65.0
        elif word_count < 150:
            return 80.0
        else:
            return 90.0
    
    def _calculate_structure_score(
        self, has_intro: bool, has_examples: bool, has_conclusion: bool
    ) -> float:
        """Calcula score de estrutura"""
        score = 0
        if has_intro:
            score += 33
        if has_examples:
            score += 34
        if has_conclusion:
            score += 33
        return float(score)
    
    def _extract_key_points(self, text: str) -> list:
        """Extrai pontos-chave do texto"""
        # Análise simples - dividir por sentenças
        sentences = text.split(".")
        key_points = [s.strip() for s in sentences if len(s.strip()) > 20]
        return key_points[:3]  # Top 3
    
    def _generate_delivery_feedback(
        self, hesitations: int, filler_words: int, word_count: int
    ) -> list:
        """Gera feedback de delivery"""
        feedback = []
        
        if hesitations > 5:
            feedback.append({
                "type": "hesitation",
                "severity": "medium",
                "message": "Muitas hesitações detectadas. Pratique a resposta para maior fluência."
            })
        
        if filler_words > 8:
            feedback.append({
                "type": "filler_words",
                "severity": "medium",
                "message": "Reduza palavras de preenchimento. Pause em vez de usar 'né', 'tipo', etc."
            })
        
        if word_count < 50:
            feedback.append({
                "type": "brevity",
                "severity": "high",
                "message": "Resposta muito curta. Desenvolva mais seus pontos com exemplos."
            })
        
        return feedback
    
    def _generate_content_suggestions(
        self, relevance: float, depth: float, word_count: int
    ) -> list:
        """Gera sugestões de conteúdo"""
        suggestions = []
        
        if relevance < 60:
            suggestions.append("Foque mais na pergunta específica feita")
        
        if depth < 60:
            suggestions.append("Adicione mais detalhes e contexto à sua resposta")
        
        if word_count < 50:
            suggestions.append("Expanda sua resposta com exemplos concretos")
        
        return suggestions
    
    def _generate_next_steps(self, score: float, improvements: list) -> list:
        """Gera próximos passos"""
        steps = []
        
        if score < 60:
            steps.append("Pratique esta resposta mais 2-3 vezes")
            steps.append("Escreva um roteiro com pontos-chave")
        elif score < 80:
            steps.append("Refine os pontos de melhoria identificados")
            steps.append("Grave novamente focando na clareza")
        else:
            steps.append("Excelente! Mantenha este padrão nas próximas respostas")
        
        return steps
