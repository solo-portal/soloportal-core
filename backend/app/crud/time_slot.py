from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.time_slot import TimeSlot
from app.schemas.time_slot import TimeSlotCreate


def has_overlapping_slot(
    db: Session, user_id: int, start_time: datetime, end_time: datetime
) -> bool:
    stmt = select(TimeSlot).where(
        TimeSlot.user_id == user_id,
        TimeSlot.start_time < end_time,
        TimeSlot.end_time > start_time,
    )
    return db.scalar(stmt) is not None


def create_user_time_slot(
    db: Session, user_id: int, slot_in: TimeSlotCreate
) -> TimeSlot:
    db_slot = TimeSlot(
        user_id=user_id,
        service_id=slot_in.service_id,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
        is_booked=False,
    )
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot


def get_available_slots_by_user_id(
    db: Session,
    user_id: int,
    service_id: int | None = None,
    only_available: bool = True,
) -> list[TimeSlot]:
    stmt = (
        select(TimeSlot)
        .options(joinedload(TimeSlot.service))
        .where(TimeSlot.user_id == user_id)
    )
    if service_id is not None:
        stmt = stmt.where(TimeSlot.service_id == service_id)
    if only_available:
        stmt = stmt.where(TimeSlot.is_booked == False)
    stmt = stmt.order_by(TimeSlot.start_time.asc())
    return list(db.scalars(stmt).all())


def delete_time_slot(db: Session, slot: TimeSlot) -> None:
    db.delete(slot)
    db.commit()