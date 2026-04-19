"""
Pydantic schemas for the Dossier system (v2.5)
"""

import uuid
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict, Field

from app.db.models.dossier import DossierStatus, DossierDocumentStatus, DossierTaskStatus


# --- Shared ---

class DossierBase(BaseModel):
    title: str = Field(..., max_length=255)
    status: DossierStatus = DossierStatus.DRAFT
    opportunity_id: Optional[uuid.UUID] = None
    deadline: Optional[datetime] = None
    target_readiness: float = 90.0
    is_favorite: bool = False
    profile_snapshot: Dict[str, Any] = Field(default_factory=dict)
    opportunity_context: Dict[str, Any] = Field(default_factory=dict)
    readiness_evaluation: Dict[str, Any] = Field(default_factory=dict)


# --- Dossier Task ---

class DossierTaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    type: str = "generic"
    status: DossierTaskStatus = DossierTaskStatus.TODO
    priority: str = "medium"
    due_date: Optional[datetime] = None
    document_id: Optional[uuid.UUID] = None

class DossierTaskCreate(DossierTaskBase):
    pass

class DossierTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[DossierTaskStatus] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class DossierTaskInDossier(DossierTaskBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# --- Dossier Document ---

class DossierDocumentBase(BaseModel):
    type: str = Field(..., max_length=50)
    title: str = Field(..., max_length=255)
    content: str = ""
    status: DossierDocumentStatus = DossierDocumentStatus.EMPTY
    completion_percentage: int = 0
    word_count: int = 0
    metrics: Dict[str, Any] = Field(default_factory=dict)
    ats_score: Optional[float] = None
    original_document_id: Optional[uuid.UUID] = None

class DossierDocumentCreate(DossierDocumentBase):
    pass

class DossierDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[DossierDocumentStatus] = None
    completion_percentage: Optional[int] = None
    word_count: Optional[int] = None
    metrics: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None

class DossierDocumentInDossier(DossierDocumentBase):
    id: uuid.UUID
    dossier_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# --- Dossier ---

class DossierCreate(DossierBase):
    pass

class DossierUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[DossierStatus] = None
    opportunity_id: Optional[uuid.UUID] = None
    deadline: Optional[datetime] = None
    target_readiness: Optional[float] = None
    current_readiness: Optional[float] = None
    is_favorite: Optional[bool] = None
    profile_snapshot: Optional[Dict[str, Any]] = None
    opportunity_context: Optional[Dict[str, Any]] = None
    readiness_evaluation: Optional[Dict[str, Any]] = None

class DossierResponse(DossierBase):
    id: uuid.UUID
    user_id: uuid.UUID
    current_readiness: float
    created_at: datetime
    updated_at: datetime
    
    # Nested collections
    documents: List[DossierDocumentInDossier] = []
    tasks: List[DossierTaskInDossier] = []
    
    model_config = ConfigDict(from_attributes=True)


class DossierSimpleResponse(DossierBase):
    """Lighter response for lists"""
    id: uuid.UUID
    user_id: uuid.UUID
    current_readiness: float
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    task_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)
