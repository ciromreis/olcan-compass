"""
Document Service

Business logic for document creation, editing, and AI-assisted improvements.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from ..models.document import Document, DocumentTemplate, DocumentReview, DocumentType, DocumentStatus
from ..models.companion import Companion
from ..models.user import User


class DocumentService:
    """Service for managing career documents"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_document(
        self,
        user_id: str,
        title: str,
        document_type: DocumentType,
        template_id: Optional[str] = None,
        companion_id: Optional[str] = None
    ) -> Document:
        """Create a new document from scratch or template"""
        
        # Get template if provided
        template = None
        if template_id:
            template = self.db.query(DocumentTemplate).filter(
                DocumentTemplate.id == template_id
            ).first()
            if template:
                template.usage_count += 1
        
        # Initialize content structure
        content = {}
        style_config = {}
        
        if template:
            content = template.structure.copy()
            style_config = template.default_style.copy() if template.default_style else {}
        else:
            # Default structure based on document type
            content = self._get_default_structure(document_type)
        
        # Create document
        document = Document(
            id=str(uuid.uuid4()),
            user_id=user_id,
            companion_id=companion_id,
            title=title,
            document_type=document_type,
            status=DocumentStatus.DRAFT,
            content=content,
            template_id=template_id,
            style_config=style_config,
            version=1
        )
        
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        
        return document
    
    def update_document(
        self,
        document_id: str,
        user_id: str,
        updates: Dict[str, Any]
    ) -> Document:
        """Update document content or metadata"""
        
        document = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        if not document:
            raise ValueError("Document not found")
        
        # Update allowed fields
        allowed_fields = ['title', 'content', 'raw_text', 'style_config', 'status']
        for field in allowed_fields:
            if field in updates:
                setattr(document, field, updates[field])
        
        document.updated_at = datetime.utcnow()
        
        # Mark as completed if status changed
        if updates.get('status') == DocumentStatus.COMPLETED and not document.completed_at:
            document.completed_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(document)
        
        return document
    
    def create_version(
        self,
        document_id: str,
        user_id: str,
        title: Optional[str] = None
    ) -> Document:
        """Create a new version of an existing document"""
        
        parent = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        if not parent:
            raise ValueError("Parent document not found")
        
        # Create new version
        new_version = Document(
            id=str(uuid.uuid4()),
            user_id=user_id,
            companion_id=parent.companion_id,
            title=title or f"{parent.title} (v{parent.version + 1})",
            document_type=parent.document_type,
            status=DocumentStatus.DRAFT,
            content=parent.content.copy(),
            raw_text=parent.raw_text,
            template_id=parent.template_id,
            style_config=parent.style_config.copy() if parent.style_config else None,
            version=parent.version + 1,
            parent_document_id=parent.id
        )
        
        self.db.add(new_version)
        self.db.commit()
        self.db.refresh(new_version)
        
        return new_version
    
    def get_user_documents(
        self,
        user_id: str,
        document_type: Optional[DocumentType] = None,
        status: Optional[DocumentStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Document]:
        """Get user's documents with optional filtering"""
        
        query = self.db.query(Document).filter(Document.user_id == user_id)
        
        if document_type:
            query = query.filter(Document.document_type == document_type)
        
        if status:
            query = query.filter(Document.status == status)
        
        documents = query.order_by(Document.updated_at.desc()).offset(offset).limit(limit).all()
        
        return documents
    
    def get_document(self, document_id: str, user_id: str) -> Optional[Document]:
        """Get a specific document"""
        
        return self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
    
    def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a document"""
        
        document = self.db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        if not document:
            return False
        
        self.db.delete(document)
        self.db.commit()
        
        return True
    
    def request_companion_review(
        self,
        document_id: str,
        user_id: str
    ) -> DocumentReview:
        """Request AI review from companion"""
        
        document = self.get_document(document_id, user_id)
        if not document:
            raise ValueError("Document not found")
        
        # Get companion
        companion = None
        if document.companion_id:
            companion = self.db.query(Companion).filter(
                Companion.id == document.companion_id
            ).first()
        
        # Generate AI review (placeholder - would integrate with AI service)
        review_data = self._generate_ai_review(document, companion)
        
        # Create review record
        review = DocumentReview(
            id=str(uuid.uuid4()),
            document_id=document_id,
            companion_id=document.companion_id,
            overall_score=review_data['overall_score'],
            strengths=review_data['strengths'],
            improvements=review_data['improvements'],
            detailed_feedback=review_data['detailed_feedback'],
            section_scores=review_data['section_scores'],
            review_type='companion',
            is_automated=1
        )
        
        self.db.add(review)
        
        # Update document stats
        document.ai_suggestions_count += len(review_data['improvements'])
        
        self.db.commit()
        self.db.refresh(review)
        
        return review
    
    def get_templates(
        self,
        document_type: Optional[DocumentType] = None,
        is_premium: Optional[bool] = None
    ) -> List[DocumentTemplate]:
        """Get available document templates"""
        
        query = self.db.query(DocumentTemplate)
        
        if document_type:
            query = query.filter(DocumentTemplate.document_type == document_type)
        
        if is_premium is not None:
            query = query.filter(DocumentTemplate.is_premium == (1 if is_premium else 0))
        
        templates = query.order_by(DocumentTemplate.usage_count.desc()).all()
        
        return templates
    
    def _get_default_structure(self, document_type: DocumentType) -> Dict[str, Any]:
        """Get default content structure for document type"""
        
        structures = {
            DocumentType.RESUME: {
                "sections": [
                    {"id": "header", "type": "header", "content": {"name": "", "title": "", "contact": {}}},
                    {"id": "summary", "type": "text", "title": "Professional Summary", "content": ""},
                    {"id": "experience", "type": "list", "title": "Experience", "items": []},
                    {"id": "education", "type": "list", "title": "Education", "items": []},
                    {"id": "skills", "type": "tags", "title": "Skills", "items": []}
                ]
            },
            DocumentType.COVER_LETTER: {
                "sections": [
                    {"id": "header", "type": "header", "content": {"name": "", "contact": {}}},
                    {"id": "greeting", "type": "text", "content": "Dear Hiring Manager,"},
                    {"id": "body", "type": "text", "content": ""},
                    {"id": "closing", "type": "text", "content": "Sincerely,"}
                ]
            },
            DocumentType.PORTFOLIO: {
                "sections": [
                    {"id": "intro", "type": "text", "title": "About Me", "content": ""},
                    {"id": "projects", "type": "gallery", "title": "Projects", "items": []}
                ]
            }
        }
        
        return structures.get(document_type, {"sections": []})
    
    def _generate_ai_review(
        self,
        document: Document,
        companion: Optional[Companion]
    ) -> Dict[str, Any]:
        """Generate AI-powered document review (placeholder)"""
        
        # This would integrate with actual AI service
        # For now, return structured placeholder data
        
        return {
            "overall_score": 75,
            "strengths": [
                "Clear and concise language",
                "Well-structured sections",
                "Relevant experience highlighted"
            ],
            "improvements": [
                "Add more quantifiable achievements",
                "Expand on technical skills",
                "Include industry keywords"
            ],
            "detailed_feedback": "Your document shows strong potential. Consider adding specific metrics to demonstrate impact.",
            "section_scores": {
                "summary": 80,
                "experience": 70,
                "education": 85,
                "skills": 65
            }
        }
