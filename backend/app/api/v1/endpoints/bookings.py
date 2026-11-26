from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.booking import (
    cancel_booking,
    create_booking,
    get_host_bookings,
    get_user_bookings,
)
from app.db.session import get_db
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def book_time_slot(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ثبت رزرو جلسه (فقط برای کاربران احراز هویت شده مجاز است)."""
    booking = create_booking(db, client_id=current_user.id, booking_in=booking_in)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked, invalid for this service, or does not exist.",
        )
    return booking


@router.get("/mine", response_model=list[BookingRead])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """لیست رزروهایی که کاربر جاری به عنوان مشتری ثبت کرده است."""
    return get_user_bookings(db, client_id=current_user.id)


@router.get("/host", response_model=list[BookingRead])
def list_host_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """لیست تمام رزروهایی که مشتریان برای جلسات این فریلنسر ثبت کرده‌اند."""
    return get_host_bookings(db, host_user_id=current_user.id)


@router.get("/host/stats")
def get_host_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """آمار تجمیعی داشبورد فریلنسر (مجموع رزروها، جلسات پیش‌رو، درآمد کل و مراجعان یکتا)."""
    bookings = get_host_bookings(db, host_user_id=current_user.id)
    now = datetime.now(timezone.utc)
    confirmed = [b for b in bookings if b.status == "CONFIRMED"]
    upcoming = [b for b in confirmed if b.slot and b.slot.start_time >= now]
    total_revenue = sum(b.slot.service.price for b in confirmed if b.slot and b.slot.service)
    unique_clients = len({b.client_email for b in confirmed})
    return {
        "total_bookings": len(confirmed),
        "upcoming_bookings": len(upcoming),
        "total_revenue": total_revenue,
        "active_clients": unique_clients,
    }


@router.delete("/{booking_id}", status_code=status.HTTP_200_OK)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """لغو رزرو توسط مشتری ثبت‌کننده یا فریلنسر صاحب بازه زمانی."""
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found.",
        )

    is_client = booking.client_id == current_user.id
    is_host = booking.slot is not None and booking.slot.user_id == current_user.id
    if not (is_client or is_host):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to cancel this booking.",
        )

    if booking.status == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled.",
        )

    cancelled = cancel_booking(db, booking)
    return {
        "message": "Booking successfully cancelled and time slot released.",
        "booking_id": cancelled.id,
        "status": cancelled.status,
    }