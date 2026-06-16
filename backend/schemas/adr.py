from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AdrCreate(BaseModel):
    title: str
    status: str = "proposed"
    context: str = ""
    decision: str = ""
    consequences: str = ""
    linked_files: list[str] = []


class AdrUpdate(BaseModel):
    title: str | None = None
    status: str | None = None
    context: str | None = None
    decision: str | None = None
    consequences: str | None = None
    linked_files: list[str] | None = None


class AdrResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    repo_id: UUID
    title: str
    status: str
    context: str
    decision: str
    consequences: str
    linked_files: list[str]
    created_at: datetime
    updated_at: datetime
