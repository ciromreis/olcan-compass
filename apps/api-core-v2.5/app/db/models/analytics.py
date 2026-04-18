"""Cross-cutting analytics: product events, experiments, user dimensions.

These tables support data science, funnels, and A/B tests without replacing
domain-specific logs (prompt_execution_logs, sprint activity, etc.).
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Enum,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ExperimentStatus(str, enum.Enum):
    DRAFT = "draft"
    RUNNING = "running"
    ARCHIVED = "archived"


class ProductEvent(Base):
    """Append-only product / behavioral events (warehouse-friendly grain)."""

    __tablename__ = "product_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    event_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    properties: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    client_source: Mapped[str | None] = mapped_column(String(32), nullable=True)
    app_release: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Experiment(Base):
    """A/B or multivariate test definition (managed by product / data)."""

    __tablename__ = "experiments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ExperimentStatus] = mapped_column(
        Enum(ExperimentStatus, values_callable=lambda x: [e.value for e in x], native_enum=False),
        default=ExperimentStatus.DRAFT,
        nullable=False,
        index=True,
    )
    # e.g. ["control", "treatment"] — first bucket uses split_a_percent
    variant_labels: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    split_a_percent: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class ExperimentAssignment(Base):
    """Stable variant assignment per user per experiment."""

    __tablename__ = "experiment_assignments"
    __table_args__ = (
        UniqueConstraint("experiment_id", "user_id", name="uq_experiment_assignment_user"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    experiment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("experiments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    variant: Mapped[str] = mapped_column(String(64), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class UserAttribute(Base):
    """Slowly updated user dimensions for cohorts / segmentation (key-value)."""

    __tablename__ = "user_attributes"
    __table_args__ = (
        UniqueConstraint("user_id", "namespace", "key", name="uq_user_attribute_ns_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    namespace: Mapped[str] = mapped_column(String(48), nullable=False, default="analytics")
    key: Mapped[str] = mapped_column(String(80), nullable=False)
    value_text: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
