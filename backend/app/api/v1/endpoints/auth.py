from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.crud.user import get_user_by_email
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login_access_token(form_data: LoginRequest, db: Session = Depends(get_db)):
    # ۱. پیدا کردن کاربر با ایمیل
    user = get_user_by_email(db, email=form_data.email)

    # ۲. بررسی وجود کاربر و صحت رمز عبور
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account.",
        )

    # ۳. تولید توکن دسترسی
    access_token = create_access_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user