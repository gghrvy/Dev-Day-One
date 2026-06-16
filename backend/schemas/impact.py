from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ImpactRequest(BaseModel):
    query: str


class AffectedFile(BaseModel):
    path: str
    reason: str
    risk: str


class ImpactResult(BaseModel):
    summary: str
    affected_files: list[AffectedFile]
    risk_level: str


class ImpactAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    repo_id: UUID
    query: str
    result: dict
    created_at: datetime
