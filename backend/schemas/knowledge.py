from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class KnowledgeCreate(BaseModel):
    title: str
    body: str = ""
    file_path: str | None = None
    tags: list[str] = []


class KnowledgeUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    file_path: str | None = None
    tags: list[str] | None = None


class KnowledgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    repo_id: UUID
    author_id: UUID
    title: str
    body: str
    file_path: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime
