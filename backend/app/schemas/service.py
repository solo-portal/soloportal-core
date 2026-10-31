from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: str | None = None
    duration_minutes: int = Field(default=30, gt=0, le=480)
    price: int = Field(default=0, ge=0)
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceRead(ServiceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)