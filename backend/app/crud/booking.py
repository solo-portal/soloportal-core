from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.booking import Booking
from app.models.time_slot import TimeSlot
from app.schemas.booking import BookingCreate


def create_booking(
    db: Session, client_id: int | None, booking_in: BookingCreate
) -> Booking | None:
    # ۱. پیدا کردن بازه زمانی همراه با قفل سطر برای جلوگیری از رزرو همزمان (Concurrency Control)
    stmt = select(TimeSlot).where(TimeSlot.id == booking_in.slot_id).with_for_update()
    slot = db.scalar(stmt)
    if not slot or slot.is_booked:
        return None  # بازه وجود ندارد یا قبلاً رزرو شده است

    # ۲. بررسی تطابق خدمت انتخابی با خدمت تعیین‌شده برای این بازه زمانی
    if slot.service_id != booking_in.service_id:
        return None

    # ۳. کاربر لاگین‌شده نمی‌تواند بازه زمانی تعریف‌شده توسط خودش را رزرو کند
    if client_id is not None and slot.user_id == client_id:
        return None

    # ۴. ثبت رزرو (پشتیبانی از رزرو مهمان و کاربر عضو)
    db_booking = Booking(
        slot_id=booking_in.slot_id,
        service_id=booking_in.service_id,
        client_id=client_id,
        client_name=booking_in.client_name.strip(),
        client_email=str(booking_in.client_email).lower().strip(),
        client_phone=booking_in.client_phone.strip(),
        notes=booking_in.notes.strip() if booking_in.notes else None,
        status="CONFIRMED",
    )

    # ۵. غیرفعال کردن بازه زمانی (پر شدن وقت)
    slot.is_booked = True

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def get_user_bookings(db: Session, client_id: int) -> list[Booking]:
    """رزروهایی که کاربر به عنوان مراجع (مشتری) ثبت کرده است."""
    stmt = (
        select(Booking)
        .options(joinedload(Booking.slot).joinedload(TimeSlot.service))
        .where(Booking.client_id == client_id)
        .order_by(Booking.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def get_host_bookings(db: Session, host_user_id: int) -> list[Booking]:
    """رزروهایی که مشتریان برای بازه‌های زمانی این فریلنسر ثبت کرده‌اند."""
    stmt = (
        select(Booking)
        .join(TimeSlot, Booking.slot_id == TimeSlot.id)
        .options(joinedload(Booking.slot).joinedload(TimeSlot.service))
        .where(TimeSlot.user_id == host_user_id)
        .order_by(TimeSlot.start_time.asc())
    )
    return list(db.scalars(stmt).all())


def cancel_booking(db: Session, booking: Booking) -> Booking:
    """لغو رزرو با حفظ تاریخچه (تغییر وضعیت به CANCELLED) و آزاد کردن بازه زمانی."""
    booking.status = "CANCELLED"
    slot = db.get(TimeSlot, booking.slot_id)
    if slot:
        slot.is_booked = False

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking