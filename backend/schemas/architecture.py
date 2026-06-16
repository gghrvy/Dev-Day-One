from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ArchNode(BaseModel):
    id: str
    label: str
    type: str
    description: str = ""
    files: list[str] = []


class ArchEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = ""


class GraphData(BaseModel):
    nodes: list[ArchNode]
    edges: list[ArchEdge]


class ArchitectureGraphResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    repo_id: UUID
    graph_data: dict
    generated_at: datetime
