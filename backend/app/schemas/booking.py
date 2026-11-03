from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BookingCreate(BaseModel):
    slot_id: int
    service_id: int


class BookingRead(BaseModel):
    id: int
    slot_id: int
    service_id: int
    client_id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)