"""Pydantic schemas for analytics ingestion APIs."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ProductEventItem(BaseModel):
    event_name: str = Field(..., min_length=1, max_length=120)
    properties: dict[str, Any] = Field(default_factory=dict)
    occurred_at: Optional[datetime] = None
    session_id: Optional[str] = Field(None, max_length=64)
    client_source: Optional[str] = Field(None, max_length=32)
    app_release: Optional[str] = Field(None, max_length=64)

    @field_validator("event_name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("event_name required")
        return s


class ProductEventBatchRequest(BaseModel):
    events: list[ProductEventItem] = Field(..., min_length=1, max_length=50)


class ProductEventBatchResponse(BaseModel):
    inserted: int


class UserAttributeUpsertRequest(BaseModel):
    namespace: str = Field(default="analytics", max_length=48)
    key: str = Field(..., min_length=1, max_length=80)
    value: str = Field(..., min_length=1, max_length=8000)

    @field_validator("namespace", "key")
    @classmethod
    def strip_ns_key(cls, v: str) -> str:
        return v.strip()


class UserAttributeResponse(BaseModel):
    namespace: str
    key: str
    value: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserAttributeListResponse(BaseModel):
    items: list[UserAttributeResponse]


class ExperimentVariantResponse(BaseModel):
    experiment_slug: str
    variant: str
    experiment_id: UUID
