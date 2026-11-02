from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.service import create_user_service, get_services_by_user_id
from app.crud.time_slot import (
    create_user_time_slot,
    get_available_slots_by_user_id,
    has_overlapping_slot,
)
from app.crud.user import create_user, get_user_by_email, get_user_by_slug
from app.db.session import get_db
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceRead
from app.schemas.time_slot import TimeSlotCreate, TimeSlotRead
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists.",
        )

    if get_user_by_slug(db, slug=user_in.slug.lower().strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this slug already exists.",
        )

    return create_user(db, user_in=user_in)


@router.get("/{slug}", response_model=UserRead)
def read_user_profile(slug: str, db: Session = Depends(get_db)):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return user


@router.post(
    "/{slug}/services",
    response_model=ServiceRead,
    status_code=status.HTTP_201_CREATED,
)
def create_service_for_user(
    slug: str,
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to add service to this profile.",
        )
    return create_user_service(db, user_id=user.id, service_in=service_in)


@router.get("/{slug}/services", response_model=list[ServiceRead])
def list_user_services(slug: str, db: Session = Depends(get_db)):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return get_services_by_user_id(db, user_id=user.id)


@router.post(
    "/{slug}/slots",
    response_model=TimeSlotRead,
    status_code=status.HTTP_201_CREATED,
)
def create_slot_for_user(
    slug: str,
    slot_in: TimeSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to add time slots to this profile.",
        )

    if has_overlapping_slot(db, user.id, slot_in.start_time, slot_in.end_time):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This time slot overlaps with an existing slot.",
        )

    return create_user_time_slot(db, user_id=user.id, slot_in=slot_in)


@router.get("/{slug}/slots", response_model=list[TimeSlotRead])
def list_user_available_slots(slug: str, db: Session = Depends(get_db)):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return get_available_slots_by_user_id(db, user_id=user.id, only_available=True)