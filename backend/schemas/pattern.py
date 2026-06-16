from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PatternItem(BaseModel):
    name: str
    confidence: str
    description: str
    evidence: list[str]


class PatternDetectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    repo_id: UUID
    patterns: list[PatternItem]
    raw_analysis: str | None
    detected_at: datetime
