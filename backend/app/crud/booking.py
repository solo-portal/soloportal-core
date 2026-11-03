from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.time_slot import TimeSlot
from app.schemas.booking import BookingCreate


def create_booking(db: Session, client_id: int, booking_in: BookingCreate) -> Booking | None:
    # ۱. پیدا کردن بازه زمانی
    slot = db.get(TimeSlot, booking_in.slot_id)
    if not slot or slot.is_booked:
        return None  # بازه وجود ندارد یا قبلاً رزرو شده است

    # ۲. ثبت رزرو
    db_booking = Booking(
        slot_id=booking_in.slot_id,
        service_id=booking_in.service_id,
        client_id=client_id,
        status="CONFIRMED",
    )

    # ۳. غیرفعال کردن بازه زمانی (پر شدن وقت)
    slot.is_booked = True

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def get_user_bookings(db: Session, client_id: int) -> list[Booking]:
    stmt = select(Booking).where(Booking.client_id == client_id).order_by(Booking.created_at.desc())
    return list(db.scalars(stmt).all())


def cancel_booking(db: Session, booking: Booking) -> None:
    # آزاد کردن بازه زمانی مربوطه
    slot = db.get(TimeSlot, booking.slot_id)
    if slot:
        slot.is_booked = False

    db.delete(booking)
    db.commit()