from datetime import datetime
from pydantic import BaseModel, ConfigDict, model_validator


class TimeSlotBase(BaseModel):
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def check_time_order(self) -> "TimeSlotBase":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class TimeSlotCreate(TimeSlotBase):
    pass


class TimeSlotRead(TimeSlotBase):
    id: int
    user_id: int
    is_booked: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)