from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slot_id: Mapped[int] = mapped_column(
        ForeignKey("time_slots.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )
    client_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(50), default="CONFIRMED", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # روابط با سایر جداول
    slot: Mapped["TimeSlot"] = relationship("TimeSlot", back_populates="booking")
    service: Mapped["Service"] = relationship("Service")
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id], back_populates="bookings_made")