from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.user import create_user, get_user_by_email, get_user_by_slug
from app.db.session import get_db
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # بررسی یکتا بودن ایمیل
    if get_user_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists.",
        )

    # بررسی یکتا بودن اسلاگ
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