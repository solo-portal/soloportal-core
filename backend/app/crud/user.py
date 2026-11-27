from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def get_user_by_slug(db: Session, slug: str) -> User | None:
    return db.scalar(select(User).where(User.slug == slug))


def search_users(db: Session, query: str | None = None, limit: int = 50) -> list[User]:
    """جستجوی فریلنسرها و کاربران فعال بر اساس نام، اسلاگ یا عنوان تخصصی."""
    stmt = select(User).where(User.is_active == True)
    if query and query.strip():
        pattern = f"%{query.strip()}%"
        stmt = stmt.where(
            or_(
                User.full_name.ilike(pattern),
                User.slug.ilike(pattern),
                User.headline.ilike(pattern),
            )
        )
    stmt = stmt.order_by(User.id.desc()).limit(limit)
    return list(db.scalars(stmt).all())


def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        slug=user_in.slug.lower().strip(),
        headline=user_in.headline,
        bio=user_in.bio,
        phone_number=user_in.phone_number,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "slug" and isinstance(value, str):
            value = value.lower().strip()
        elif field in ("full_name", "headline") and isinstance(value, str):
            value = value.strip()
        setattr(user, field, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user