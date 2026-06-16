from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class ConnectRepoRequest(BaseModel):
    full_name: str  # "owner/repo"

    @field_validator("full_name")
    @classmethod
    def must_be_owner_slash_repo(cls, v: str) -> str:
        v = v.strip().removeprefix("https://github.com/").strip("/")
        if v.count("/") != 1:
            raise ValueError("Expected format: owner/repo")
        return v


class RepoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    full_name: str
    github_url: str | None
    description: str | None
    indexed: bool
    indexed_at: datetime | None
    created_at: datetime
