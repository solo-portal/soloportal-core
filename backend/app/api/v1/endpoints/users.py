from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.service import (
    create_user_service,
    delete_service,
    get_services_by_user_id,
    update_service,
)
from app.crud.time_slot import (
    create_user_time_slot,
    delete_time_slot,
    get_available_slots_by_user_id,
    has_overlapping_slot,
)
from app.crud.user import (
    create_user,
    get_user_by_email,
    get_user_by_slug,
    search_users,
    update_user,
)
from app.db.session import get_db
from app.models.service import Service
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate
from app.schemas.time_slot import TimeSlotCreate, TimeSlotRead
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_or_search_users(
    q: str | None = None,
    db: Session = Depends(get_db),
):
    """جستجو و دریافت لیست متخصصان فعال بر اساس نام، اسلاگ یا عنوان تخصصی."""
    return search_users(db, query=q)


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


@router.put("/me", response_model=UserRead)
def update_my_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ویرایش پروفایل کاربر لاگین‌شده (نام، عنوان تخصصی، بیوگرافی، اسلاگ و شماره تماس)."""
    if user_in.slug is not None:
        normalized_slug = user_in.slug.lower().strip()
        existing = get_user_by_slug(db, slug=normalized_slug)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this slug already exists.",
            )
    return update_user(db, user=current_user, user_in=user_in)


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

    # 1. بررسی وجود سرویس و تعلق آن به همین فریلنسر
    service = db.get(Service, slot_in.service_id)
    if not service or service.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service not found or does not belong to this user.",
        )
    if not service.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create a time slot for an inactive service.",
        )

    # 2. اعتبارسنجی همخوانی مدت زمان اسلات با مدت زمان سرویس
    slot_duration = int((slot_in.end_time - slot_in.start_time).total_seconds() / 60)
    if slot_duration != service.duration_minutes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Slot duration ({slot_duration} minutes) does not match service duration ({service.duration_minutes} minutes).",
        )

    # 3. بررسی عدم تداخل زمانی با سایر بازه‌های فریلنسر
    if has_overlapping_slot(db, user.id, slot_in.start_time, slot_in.end_time):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This time slot overlaps with an existing slot.",
        )

    return create_user_time_slot(db, user_id=user.id, slot_in=slot_in)


@router.get("/{slug}/slots", response_model=list[TimeSlotRead])
def list_user_available_slots(
    slug: str,
    service_id: int | None = None,
    only_available: bool = True,
    db: Session = Depends(get_db),
):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return get_available_slots_by_user_id(
        db, user_id=user.id, service_id=service_id, only_available=only_available
    )


@router.put("/{slug}/services/{service_id}", response_model=ServiceRead)
def update_user_service(
    slug: str,
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this service.",
        )
    service = db.get(Service, service_id)
    if not service or service.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")
    return update_service(db, service=service, service_in=service_in)


@router.delete("/{slug}/services/{service_id}", status_code=status.HTTP_200_OK)
def delete_user_service(
    slug: str,
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this service.",
        )
    service = db.get(Service, service_id)
    if not service or service.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")
    delete_service(db, service=service)
    return {"message": "Service deleted successfully."}


@router.delete("/{slug}/slots/{slot_id}", status_code=status.HTTP_200_OK)
def delete_user_slot(
    slug: str,
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user_by_slug(db, slug=slug.lower().strip())
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this time slot.",
        )
    slot = db.get(TimeSlot, slot_id)
    if not slot or slot.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time slot not found.")
    if slot.is_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a time slot that is already booked.",
        )
    delete_time_slot(db, slot=slot)
    return {"message": "Time slot deleted successfully."}