from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.time_slot import TimeSlotRead


class BookingCreate(BaseModel):
    slot_id: int
    service_id: int
    client_name: str = Field(..., min_length=2, max_length=150)
    client_email: EmailStr
    client_phone: str = Field(..., min_length=5, max_length=30)
    notes: str | None = None


class BookingRead(BaseModel):
    id: int
    slot_id: int
    service_id: int
    client_id: int | None = None
    client_name: str
    client_email: str
    client_phone: str
    notes: str | None = None
    status: str
    created_at: datetime
    slot: TimeSlotRead | None = None

    model_config = ConfigDict(from_attributes=True)