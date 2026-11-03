import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    status: str
    progress: int
    error: str | None
    # indexing_jobs has no created_at column; the API keeps the field name, sourced from started_at
    created_at: datetime | None = Field(validation_alias="started_at")
