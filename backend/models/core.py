import uuid

from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID

from database import Base


class Organization(Base):
    __tablename__ = "organizations"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"
    id         = Column(UUID(as_uuid=True), primary_key=True)
    email      = Column(String)
    avatar_url = Column(String)
    org_id     = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    is_admin   = Column(Boolean, default=False, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Repository(Base):
    __tablename__ = "repositories"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id      = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name        = Column(String, nullable=False)
    full_name   = Column(String, nullable=False)
    github_url  = Column(String)
    github_id   = Column(BigInteger, unique=True)
    description = Column(String)
    is_private  = Column(Boolean, default=False)
    indexed     = Column(Boolean, default=False)
    indexed_at  = Column(DateTime(timezone=True))
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class IndexingJob(Base):
    __tablename__ = "indexing_jobs"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id     = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    status      = Column(String, nullable=False, default="pending")
    progress    = Column(Integer, nullable=False, default=0)
    error       = Column(String)
    started_at  = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True))


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id    = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    mode       = Column(String, nullable=False, default="ask")
    role       = Column(String, nullable=False)
    content    = Column(String, nullable=False)
    sources    = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Adr(Base):
    __tablename__ = "adrs"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id      = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    title        = Column(String, nullable=False)
    status       = Column(String, nullable=False, default="proposed")
    context      = Column(String, nullable=False, default="")
    decision     = Column(String, nullable=False, default="")
    consequences = Column(String, nullable=False, default="")
    linked_files = Column(JSONB, nullable=False, default=list)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PatternDetection(Base):
    __tablename__ = "pattern_detections"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id      = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    patterns     = Column(JSONB, nullable=False, default=list)
    raw_analysis = Column(String)
    detected_at  = Column(DateTime(timezone=True), server_default=func.now())


class KnowledgeEntry(Base):
    __tablename__ = "knowledge_entries"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id    = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    author_id  = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title      = Column(String, nullable=False)
    body       = Column(String, nullable=False, default="")
    file_path  = Column(String)
    tags       = Column(JSONB, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ArchitectureGraph(Base):
    __tablename__ = "architecture_graphs"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id      = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    graph_data   = Column(JSONB, nullable=False, default=dict)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())


class ImpactAnalysis(Base):
    __tablename__ = "impact_analyses"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id    = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    query      = Column(String, nullable=False)
    result     = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ApiInventoryItem(Base):
    __tablename__ = "api_inventory"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id     = Column(UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=False)
    name        = Column(String, nullable=False)
    api_type    = Column(String, nullable=False, default="internal")
    version     = Column(String)
    endpoint    = Column(String)
    file_path   = Column(String)
    status      = Column(String, nullable=False, default="active")
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
