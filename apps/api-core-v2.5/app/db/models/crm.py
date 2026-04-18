"""CRM identity links.

Stores external IDs for CRM/marketing systems so staff can jump from Compass
user records to Twenty/Mautic and keep sync idempotent.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CrmIdentityLink(Base):
    __tablename__ = "crm_identity_links"
    __table_args__ = (
        UniqueConstraint("system", "external_id", name="uq_crm_identity_system_external"),
        UniqueConstraint("user_id", "system", name="uq_crm_identity_user_system"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    # Internal actor (Compass user). Future: support provider/org entities explicitly.
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # External system identifier (e.g. "twenty", "mautic")
    system: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    external_id: Mapped[str] = mapped_column(String(128), nullable=False)
    external_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

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

