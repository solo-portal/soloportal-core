from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # رابطه دوطرفه با مدل User
    user: Mapped["User"] = relationship("User", back_populates="time_slots")

    # رابطه با مدل Service
    service: Mapped["Service"] = relationship("Service", back_populates="time_slots")

    # رابطه یک‌به‌چند با Booking (یک رزرو فعال + تاریخچه رزروهای لغوشده)
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="slot", cascade="all, delete-orphan"
    )