from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    slug: str
    headline: str | None = Field(default=None, max_length=200)
    bio: str | None = None
    phone_number: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    slug: str | None = Field(default=None, min_length=2, max_length=100)
    headline: str | None = Field(default=None, max_length=200)
    bio: str | None = None
    phone_number: str | None = Field(default=None, max_length=20)


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)