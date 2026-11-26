from datetime import datetime
from pydantic import BaseModel, ConfigDict, model_validator

from app.schemas.service import ServiceRead


class TimeSlotBase(BaseModel):
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def check_time_order(self) -> "TimeSlotBase":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class TimeSlotCreate(TimeSlotBase):
    service_id: int


class TimeSlotRead(TimeSlotBase):
    id: int
    user_id: int
    service_id: int
    is_booked: bool
    created_at: datetime
    service: ServiceRead | None = None

    model_config = ConfigDict(from_attributes=True)