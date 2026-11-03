from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.booking import cancel_booking, create_booking, get_user_bookings
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
    booking = create_booking(db, client_id=current_user.id, booking_in=booking_in)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked or does not exist.",
        )
    return booking


@router.get("/mine", response_model=list[BookingRead])
def list_my_bookings(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    return get_user_bookings(db, client_id=current_user.id)


@router.delete("/{booking_id}", status_code=status.HTTP_200_OK)
def delete_booking(
        booking_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found.",
        )

    if booking.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to cancel this booking.",
        )

    cancel_booking(db, booking)
    return {"message": "Booking successfully cancelled and time slot released."}