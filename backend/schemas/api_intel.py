from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ApiItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    repo_id: UUID
    name: str
    api_type: str
    version: str | None
    endpoint: str | None
    file_path: str | None
    status: str
    detected_at: datetime
