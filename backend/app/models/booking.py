from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        # ایندکس یکتای شرطی: هر اسلات فقط یک رزرو فعال (CONFIRMED) می‌تواند داشته باشد،
        # اما تاریخچه رزروهای لغوشده (CANCELLED) برای همان اسلات حفظ می‌شود.
        Index(
            "uq_bookings_active_slot",
            "slot_id",
            unique=True,
            postgresql_where=text("status = 'CONFIRMED'"),
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slot_id: Mapped[int] = mapped_column(
        ForeignKey("time_slots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )
    client_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    client_name: Mapped[str] = mapped_column(String(150), nullable=False)
    client_email: Mapped[str] = mapped_column(String(255), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="CONFIRMED", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # روابط با سایر جداول
    slot: Mapped["TimeSlot"] = relationship("TimeSlot", back_populates="bookings")
    service: Mapped["Service"] = relationship("Service")
    client: Mapped["User | None"] = relationship(
        "User", foreign_keys=[client_id], back_populates="bookings_made"
    )