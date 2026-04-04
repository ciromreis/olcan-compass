"""
Forge-Interview Integration Service

Connects documents from Narrative Forge with Interview Intelligence Engine.
Enables contextual interview preparation based on CV/documents.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.db.models.document import Document
from app.db.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
    InterviewQuestionType,
    InterviewSessionStatus
)


class ForgeInterviewIntegrationService:
    """Service for integrating Forge documents with Interview sessions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_questions_from_document(
        self,
        document_id: uuid.UUID,
        user_id: uuid.UUID,
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate contextual interview questions based on document content
        
        Args:
            document_id: UUID of the document
            user_id: UUID of the user
            num_questions: Number of questions to generate
            
        Returns:
            List of generated questions with metadata
        """
        # Get document
        document = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        if not document:
            raise ValueError("Document not found")
        
        # Extract key information from document
        content = document.content
        doc_type = document.document_type
        
        # Generate contextual questions based on content
        questions = self._generate_contextual_questions(
            content=content,
            doc_type=doc_type,
            num_questions=num_questions
        )
        
        return questions
    
    def create_interview_from_document(
        self,
        document_id: uuid.UUID,
        user_id: uuid.UUID,
        session_type: str,
        target_institution: Optional[str] = None
    ) -> InterviewSession:
        """
        Create an interview session linked to a document
        
        Args:
            document_id: UUID of the source document
            user_id: UUID of the user
            session_type: Type of interview session
            target_institution: Target institution/company
            
        Returns:
            Created InterviewSession
        """
        # Get document
        document = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        if not document:
            raise ValueError("Document not found")
        
        # Generate questions
        questions = self.generate_questions_from_document(
            document_id=document_id,
            user_id=user_id,
            num_questions=8
        )
        
        # Create interview session
        session = InterviewSession(
            id=uuid.uuid4(),
            user_id=user_id,
            source_narrative_id=document_id,
            source_narrative_title=document.title,
            session_type=session_type,
            target_institution=target_institution,
            status=InterviewSessionStatus.SCHEDULED,
            question_ids=[q["id"] for q in questions],
            total_questions=len(questions),
            estimated_duration_minutes=len(questions) * 3
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def get_interview_feedback_for_document(
        self,
        document_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> Dict[str, Any]:
        """
        Get aggregated interview feedback for a document
        
        Args:
            document_id: UUID of the document
            user_id: UUID of the user
            
        Returns:
            Aggregated feedback and suggestions
        """
        # Get all interview sessions linked to this document
        sessions = self.db.query(InterviewSession).filter(
            InterviewSession.source_narrative_id == document_id,
            InterviewSession.user_id == user_id,
            InterviewSession.status == InterviewSessionStatus.COMPLETED
        ).all()
        
        if not sessions:
            return {
                "has_feedback": False,
                "sessions_count": 0,
                "suggestions": []
            }
        
        # Aggregate scores
        avg_overall = sum(s.overall_score or 0 for s in sessions) / len(sessions)
        avg_clarity = sum(s.clarity_score or 0 for s in sessions) / len(sessions)
        avg_confidence = sum(s.confidence_score or 0 for s in sessions) / len(sessions)
        
        # Collect improvement areas
        all_improvements = []
        for session in sessions:
            all_improvements.extend(session.improvement_areas or [])
        
        # Generate document improvement suggestions
        suggestions = self._generate_document_suggestions(
            sessions=sessions,
            avg_scores={
                "overall": avg_overall,
                "clarity": avg_clarity,
                "confidence": avg_confidence
            },
            improvement_areas=all_improvements
        )
        
        return {
            "has_feedback": True,
            "sessions_count": len(sessions),
            "average_scores": {
                "overall": round(avg_overall, 1),
                "clarity": round(avg_clarity, 1),
                "confidence": round(avg_confidence, 1)
            },
            "suggestions": suggestions,
            "latest_session_id": str(sessions[-1].id) if sessions else None
        }
    
    def _generate_contextual_questions(
        self,
        content: str,
        doc_type: str,
        num_questions: int
    ) -> List[Dict[str, Any]]:
        """Generate questions based on document content"""
        
        # Extract key points from content
        key_points = self._extract_key_points(content)
        
        # Question templates based on document type
        templates = {
            "cv": [
                "Conte-me sobre sua experiência em {topic}",
                "Como você desenvolveu suas habilidades em {skill}?",
                "Descreva um desafio que você enfrentou em {context}",
                "Por que você escolheu trabalhar com {area}?",
                "Quais são seus objetivos relacionados a {goal}?"
            ],
            "motivation_letter": [
                "Por que você está interessado neste programa/posição?",
                "Como sua experiência prévia se alinha com seus objetivos?",
                "Quais são suas principais motivações para esta candidatura?",
                "Como você pretende contribuir para a instituição?",
                "Onde você se vê daqui a 5 anos?"
            ],
            "personal_statement": [
                "Conte-me sobre sua jornada até aqui",
                "O que o torna único como candidato?",
                "Descreva uma experiência transformadora em sua vida",
                "Como você lida com desafios e adversidades?",
                "Quais valores guiam suas decisões?"
            ]
        }
        
        # Get templates for document type
        question_templates = templates.get(doc_type, templates["cv"])
        
        # Generate questions
        questions = []
        for i in range(min(num_questions, len(question_templates))):
            questions.append({
                "id": str(uuid.uuid4()),
                "text": question_templates[i],
                "type": "contextual",
                "source": "document_analysis",
                "difficulty": "medium"
            })
        
        return questions
    
    def _extract_key_points(self, content: str) -> List[str]:
        """Extract key points from document content"""
        # Simple extraction - in production, use NLP
        lines = content.split('\n')
        key_points = [line.strip() for line in lines if len(line.strip()) > 20]
        return key_points[:10]
    
    def _generate_document_suggestions(
        self,
        sessions: List[InterviewSession],
        avg_scores: Dict[str, float],
        improvement_areas: List[str]
    ) -> List[Dict[str, str]]:
        """Generate suggestions for document improvement based on interview feedback"""
        
        suggestions = []
        
        # Low clarity score
        if avg_scores["clarity"] < 60:
            suggestions.append({
                "type": "clarity",
                "priority": "high",
                "suggestion": "Suas respostas nas entrevistas indicam que alguns pontos do seu currículo podem estar confusos. Considere reescrever seções-chave com mais clareza e especificidade."
            })
        
        # Low confidence score
        if avg_scores["confidence"] < 60:
            suggestions.append({
                "type": "confidence",
                "priority": "medium",
                "suggestion": "Adicione mais detalhes quantificáveis e conquistas específicas para fortalecer seu currículo e aumentar sua confiança ao falar sobre suas experiências."
            })
        
        # Common improvement areas
        if "structure" in str(improvement_areas).lower():
            suggestions.append({
                "type": "structure",
                "priority": "high",
                "suggestion": "Organize melhor as seções do seu currículo. Use uma estrutura clara: Experiência → Formação → Competências → Idiomas."
            })
        
        if "examples" in str(improvement_areas).lower():
            suggestions.append({
                "type": "examples",
                "priority": "high",
                "suggestion": "Adicione exemplos concretos de projetos e resultados em cada experiência listada. Use o formato: Ação → Resultado → Impacto."
            })
        
        return suggestions
