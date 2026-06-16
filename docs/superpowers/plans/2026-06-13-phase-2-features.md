# Dev Day One — Phase 2 Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 6 remaining Dev Day One features: ADR Management, Pattern Detection, Knowledge Preservation, Architecture Intelligence, Impact Analysis, and API Intelligence.

**Architecture:** Each feature follows the same pattern — SQL migration → SQLAlchemy model → Pydantic schema → FastAPI router → React page + components. Features 2, 4, 5, 6 use Groq LLM analysis over indexed repo chunks. All new routes are added to the context panel navigation in Task 1.

**Tech Stack:** FastAPI, SQLAlchemy 2.0 async, Pydantic v2, Next.js 15 App Router, React Query, @xyflow/react (Architecture graph), Groq llama-3.3-70b-versatile, Tailwind v4, shadcn/ui

---

## File Map

**New backend files:**
- `backend/migrations/002_phase2.sql`
- `backend/schemas/adr.py`
- `backend/schemas/pattern.py`
- `backend/schemas/knowledge.py`
- `backend/schemas/architecture.py`
- `backend/schemas/impact.py`
- `backend/schemas/api_intel.py`
- `backend/routers/adrs.py`
- `backend/routers/patterns.py`
- `backend/routers/knowledge.py`
- `backend/routers/architecture.py`
- `backend/routers/impact.py`
- `backend/routers/api_intel.py`
- `backend/services/pattern_detector.py`
- `backend/services/arch_analyzer.py`
- `backend/services/impact_analyzer.py`
- `backend/services/api_scanner.py`

**Modified backend files:**
- `backend/models/core.py` — add 6 new models
- `backend/models/__init__.py` — export new models
- `backend/main.py` — register 6 new routers

**New frontend files:**
- `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/new/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/[adr_id]/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/patterns/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/knowledge/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/knowledge/new/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/architecture/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/impact/page.tsx`
- `frontend/app/(dashboard)/dashboard/repos/[id]/apis/page.tsx`
- `frontend/components/adrs/adr-card.tsx`
- `frontend/components/adrs/adr-form.tsx`
- `frontend/components/patterns/pattern-card.tsx`
- `frontend/components/knowledge/knowledge-card.tsx`
- `frontend/components/knowledge/knowledge-form.tsx`
- `frontend/components/architecture/arch-graph.tsx`
- `frontend/components/impact/impact-form.tsx`
- `frontend/components/api-intel/api-table.tsx`

**Modified frontend files:**
- `frontend/components/layout/context-panel.tsx` — add 6 new nav items
- `frontend/types/index.ts` — add 6 new interfaces

---

## Task 1: DB Migration — All Phase 2 Tables

**Files:**
- Create: `backend/migrations/002_phase2.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- backend/migrations/002_phase2.sql

-- ADRs (Architecture Decision Records)
CREATE TABLE IF NOT EXISTS adrs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'proposed',
    context      TEXT NOT NULL DEFAULT '',
    decision     TEXT NOT NULL DEFAULT '',
    consequences TEXT NOT NULL DEFAULT '',
    linked_files JSONB NOT NULL DEFAULT '[]',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern detections
CREATE TABLE IF NOT EXISTS pattern_detections (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    patterns     JSONB NOT NULL DEFAULT '[]',
    raw_analysis TEXT,
    detected_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repo_id)
);

-- Knowledge entries
CREATE TABLE IF NOT EXISTS knowledge_entries (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id    UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id),
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    file_path  TEXT,
    tags       JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Architecture graphs
CREATE TABLE IF NOT EXISTS architecture_graphs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    graph_data   JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repo_id)
);

-- Impact analyses (stored history)
CREATE TABLE IF NOT EXISTS impact_analyses (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id    UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    query      TEXT NOT NULL,
    result     JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API inventory
CREATE TABLE IF NOT EXISTS api_inventory (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id      UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    api_type     TEXT NOT NULL DEFAULT 'internal',
    version      TEXT,
    endpoint     TEXT,
    file_path    TEXT,
    status       TEXT NOT NULL DEFAULT 'active',
    detected_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repo_id, name, api_type)
);
```

- [ ] **Step 2: Run the migration in Supabase**

Go to your Supabase project → SQL Editor → paste the contents of `backend/migrations/002_phase2.sql` → Run.

Verify: all 6 tables appear in the Table Editor.

---

## Task 2: Backend Models — Add 6 New SQLAlchemy Models

**Files:**
- Modify: `backend/models/core.py`
- Modify: `backend/models/__init__.py`

- [ ] **Step 1: Add models to `backend/models/core.py`**

Append to the end of the existing file:

```python
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
```

- [ ] **Step 2: Update `backend/models/__init__.py`**

```python
from models.core import (
    ApiInventoryItem,
    Adr,
    ArchitectureGraph,
    ChatMessage,
    ImpactAnalysis,
    IndexingJob,
    KnowledgeEntry,
    Organization,
    PatternDetection,
    Repository,
    User,
)
```

---

## Task 3: Frontend Types + Navigation

**Files:**
- Modify: `frontend/types/index.ts`
- Modify: `frontend/components/layout/context-panel.tsx`

- [ ] **Step 1: Update `frontend/types/index.ts`**

Replace the full file with:

```typescript
export interface Repository {
  id: string
  name: string
  full_name: string
  github_url: string | null
  description: string | null
  indexed: boolean
  indexed_at: string | null
  created_at: string
}

export interface IndexingJob {
  id: string
  repo_id: string
  status: "pending" | "running" | "done" | "failed"
  progress: number
  error?: string | null
  started_at: string
  finished_at?: string | null
}

export interface Adr {
  id: string
  repo_id: string
  title: string
  status: "proposed" | "accepted" | "deprecated" | "superseded"
  context: string
  decision: string
  consequences: string
  linked_files: string[]
  created_at: string
  updated_at: string
}

export interface Pattern {
  name: string
  confidence: "high" | "medium" | "low"
  description: string
  evidence: string[]
}

export interface PatternDetection {
  id: string
  repo_id: string
  patterns: Pattern[]
  raw_analysis: string | null
  detected_at: string
}

export interface KnowledgeEntry {
  id: string
  repo_id: string
  author_id: string
  title: string
  body: string
  file_path: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ArchNode {
  id: string
  label: string
  type: "service" | "module" | "database" | "external" | "layer"
  description?: string
  files?: string[]
}

export interface ArchEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface ArchitectureGraph {
  id: string
  repo_id: string
  graph_data: { nodes: ArchNode[]; edges: ArchEdge[] }
  generated_at: string
}

export interface ImpactResult {
  summary: string
  affected_files: { path: string; reason: string; risk: "high" | "medium" | "low" }[]
  risk_level: "high" | "medium" | "low"
}

export interface ImpactAnalysis {
  id: string
  repo_id: string
  query: string
  result: ImpactResult
  created_at: string
}

export interface ApiInventoryItem {
  id: string
  repo_id: string
  name: string
  api_type: "internal" | "external"
  version: string | null
  endpoint: string | null
  file_path: string | null
  status: "active" | "deprecated" | "unknown"
  detected_at: string
}
```

- [ ] **Step 2: Update `frontend/components/layout/context-panel.tsx`**

Replace the `subPages` constant:

```typescript
const subPages = [
  { label: "Overview", segment: "" },
  { label: "Ask", segment: "/ask" },
  { label: "Onboard", segment: "/onboard" },
  { label: "Architecture", segment: "/architecture" },
  { label: "Patterns", segment: "/patterns" },
  { label: "Impact", segment: "/impact" },
  { label: "Knowledge", segment: "/knowledge" },
  { label: "ADRs", segment: "/adrs" },
  { label: "APIs", segment: "/apis" },
]
```

---

## Task 4: ADR Management — Backend

**Files:**
- Create: `backend/schemas/adr.py`
- Create: `backend/routers/adrs.py`
- Modify: `backend/main.py`

- [ ] **Step 1: Create `backend/schemas/adr.py`**

```python
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
```

- [ ] **Step 2: Create `backend/routers/adrs.py`**

```python
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import Adr, User
from schemas.adr import AdrCreate, AdrResponse, AdrUpdate

router = APIRouter(prefix="/repos/{repo_id}/adrs", tags=["adrs"])


@router.get("", response_model=list[AdrResponse])
async def list_adrs(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(Adr).where(Adr.repo_id == uuid.UUID(repo_id)).order_by(Adr.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=AdrResponse, status_code=201)
async def create_adr(
    repo_id: str,
    body: AdrCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = Adr(repo_id=uuid.UUID(repo_id), **body.model_dump())
    db.add(adr)
    await db.commit()
    await db.refresh(adr)
    return adr


@router.get("/{adr_id}", response_model=AdrResponse)
async def get_adr(
    repo_id: str,
    adr_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = await db.get(Adr, uuid.UUID(adr_id))
    if not adr or adr.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "ADR not found")
    return adr


@router.patch("/{adr_id}", response_model=AdrResponse)
async def update_adr(
    repo_id: str,
    adr_id: str,
    body: AdrUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = await db.get(Adr, uuid.UUID(adr_id))
    if not adr or adr.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "ADR not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(adr, field, value)
    await db.commit()
    await db.refresh(adr)
    return adr


@router.delete("/{adr_id}", status_code=204)
async def delete_adr(
    repo_id: str,
    adr_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    adr = await db.get(Adr, uuid.UUID(adr_id))
    if not adr or adr.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "ADR not found")
    await db.delete(adr)
    await db.commit()
```

- [ ] **Step 3: Register routers in `backend/main.py`**

Add these imports and `app.include_router` calls after the existing routers:

```python
from routers import adrs as adrs_router
from routers import patterns as patterns_router
from routers import knowledge as knowledge_router
from routers import architecture as architecture_router
from routers import impact as impact_router
from routers import api_intel as api_intel_router

# after existing app.include_router calls:
app.include_router(adrs_router.router)
app.include_router(patterns_router.router)
app.include_router(knowledge_router.router)
app.include_router(architecture_router.router)
app.include_router(impact_router.router)
app.include_router(api_intel_router.router)
```

---

## Task 5: ADR Management — Frontend

**Files:**
- Create: `frontend/components/adrs/adr-card.tsx`
- Create: `frontend/components/adrs/adr-form.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/page.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/new/page.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/[adr_id]/page.tsx`

- [ ] **Step 1: Create `frontend/components/adrs/adr-card.tsx`**

```tsx
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Adr } from "@/types"

const STATUS_STYLES: Record<string, string> = {
  proposed:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  deprecated: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  superseded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

export function AdrCard({ adr, repoId }: { adr: Adr; repoId: string }) {
  return (
    <Link
      href={`/dashboard/repos/${repoId}/adrs/${adr.id}`}
      className="group flex items-start justify-between border-b border-white/[0.04] px-5 py-4 transition-colors hover:bg-white/[0.02]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">
          {adr.title}
        </p>
        {adr.decision && (
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{adr.decision}</p>
        )}
        <p className="mt-1 font-mono text-[10px] text-zinc-700">
          {new Date(adr.created_at).toLocaleDateString()}
        </p>
      </div>
      <span
        className={cn(
          "ml-4 flex-shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] capitalize",
          STATUS_STYLES[adr.status] ?? STATUS_STYLES.proposed
        )}
      >
        {adr.status}
      </span>
    </Link>
  )
}
```

- [ ] **Step 2: Create `frontend/components/adrs/adr-form.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import type { Adr } from "@/types"

interface AdrFormProps {
  repoId: string
  initial?: Partial<Adr>
  adrId?: string
}

const STATUSES = ["proposed", "accepted", "deprecated", "superseded"]

export function AdrForm({ repoId, initial, adrId }: AdrFormProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title:        initial?.title ?? "",
    status:       initial?.status ?? "proposed",
    context:      initial?.context ?? "",
    decision:     initial?.decision ?? "",
    consequences: initial?.consequences ?? "",
    linked_files: (initial?.linked_files ?? []).join("\n"),
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        linked_files: form.linked_files.split("\n").map((s) => s.trim()).filter(Boolean),
      }
      return adrId
        ? apiFetch<Adr>(`/repos/${repoId}/adrs/${adrId}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch<Adr>(`/repos/${repoId}/adrs`, { method: "POST", body: JSON.stringify(body) })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adrs", repoId] })
      router.push(`/dashboard/repos/${repoId}/adrs`)
    },
  })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
      className="space-y-5 px-5 py-5"
    >
      <div>
        <label className="label">Title</label>
        <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>

      <div>
        <label className="label">Status</label>
        <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Context — what is the situation?</label>
        <textarea className="input min-h-[80px]" value={form.context} onChange={(e) => set("context", e.target.value)} />
      </div>

      <div>
        <label className="label">Decision — what did we decide?</label>
        <textarea className="input min-h-[80px]" value={form.decision} onChange={(e) => set("decision", e.target.value)} />
      </div>

      <div>
        <label className="label">Consequences — what are the trade-offs?</label>
        <textarea className="input min-h-[80px]" value={form.consequences} onChange={(e) => set("consequences", e.target.value)} />
      </div>

      <div>
        <label className="label">Linked files (one per line)</label>
        <textarea className="input font-mono text-xs min-h-[60px]" value={form.linked_files} onChange={(e) => set("linked_files", e.target.value)} placeholder="src/auth/middleware.ts" />
      </div>

      {mutation.isError && (
        <p className="text-xs text-red-500">{(mutation.error as Error).message}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !form.title.trim()}
        className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
      >
        {mutation.isPending ? "Saving…" : adrId ? "Save changes" : "Create ADR"}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Add global input/label utility classes to `frontend/app/globals.css`**

Append to `frontend/app/globals.css`:

```css
@layer utilities {
  .label {
    @apply mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600;
  }
  .input {
    @apply w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none;
  }
}
```

- [ ] **Step 4: Create `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/page.tsx`**

```tsx
"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { AdrCard } from "@/components/adrs/adr-card"
import type { Adr } from "@/types"

export default function AdrsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: adrs = [], isLoading } = useQuery({
    queryKey: ["adrs", id],
    queryFn: () => apiFetch<Adr[]>(`/repos/${id}/adrs`),
  })

  const action = (
    <Link
      href={`/dashboard/repos/${id}/adrs/new`}
      className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-900 hover:bg-amber-400"
    >
      <Plus className="h-3 w-3" />
      New ADR
    </Link>
  )

  return (
    <div>
      <PageHeader title="Architecture Decision Records" meta={adrs.length ? `${adrs.length} records` : undefined} action={action} />
      <div className="mt-2">
        {isLoading && <p className="px-5 py-4 text-sm text-zinc-600">Loading…</p>}
        {!isLoading && adrs.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">No ADRs yet. Document your first architecture decision.</p>
            <Link href={`/dashboard/repos/${id}/adrs/new`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400">
              <Plus className="h-3.5 w-3.5" /> Create first ADR
            </Link>
          </div>
        )}
        {adrs.map((adr) => <AdrCard key={adr.id} adr={adr} repoId={id} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/new/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { AdrForm } from "@/components/adrs/adr-form"

export default function NewAdrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="New ADR" meta="Architecture Decision Record" />
      <AdrForm repoId={id} />
    </div>
  )
}
```

- [ ] **Step 6: Create `frontend/app/(dashboard)/dashboard/repos/[id]/adrs/[adr_id]/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { AdrForm } from "@/components/adrs/adr-form"
import type { Adr } from "@/types"

export default function AdrDetailPage({ params }: { params: Promise<{ id: string; adr_id: string }> }) {
  const { id, adr_id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()

  const { data: adr, isLoading } = useQuery({
    queryKey: ["adr", adr_id],
    queryFn: () => apiFetch<Adr>(`/repos/${id}/adrs/${adr_id}`),
  })

  const del = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/adrs/${adr_id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adrs", id] })
      router.push(`/dashboard/repos/${id}/adrs`)
    },
  })

  if (isLoading) return <p className="px-5 py-4 text-sm text-zinc-600">Loading…</p>
  if (!adr) return <p className="px-5 py-4 text-sm text-red-500">ADR not found.</p>

  const deleteAction = (
    <button
      onClick={() => { if (confirm("Delete this ADR?")) del.mutate() }}
      className="flex items-center gap-1.5 rounded-md border border-red-500/20 px-3 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10"
    >
      <Trash2 className="h-3 w-3" /> Delete
    </button>
  )

  return (
    <div>
      <PageHeader title={adr.title} meta={adr.status} action={deleteAction} />
      <AdrForm repoId={id} initial={adr} adrId={adr_id} />
    </div>
  )
}
```

---

## Task 6: Pattern Detection — Backend

**Files:**
- Create: `backend/schemas/pattern.py`
- Create: `backend/services/pattern_detector.py`
- Create: `backend/routers/patterns.py`

- [ ] **Step 1: Create `backend/schemas/pattern.py`**

```python
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
```

- [ ] **Step 2: Create `backend/services/pattern_detector.py`**

```python
import json

from groq import AsyncGroq

from config import settings
from services.retriever import retrieve_chunks

PATTERN_SYSTEM = """You are an expert software architect. Analyze the provided code samples and identify architectural patterns.

Return a JSON object with this exact structure:
{
  "patterns": [
    {
      "name": "Pattern Name",
      "confidence": "high|medium|low",
      "description": "One sentence explaining how this pattern is used in this specific codebase",
      "evidence": ["file/path.ext: explains what you see", "another/file.ext: what you see"]
    }
  ],
  "raw_analysis": "A 2-3 paragraph narrative about the overall architecture"
}

Common patterns to look for: MVC, Repository Pattern, Service Layer, Domain-Driven Design, CQRS, Event-Driven, Hexagonal Architecture, Microservices, Monolith, Factory Pattern, Observer Pattern, Middleware Chain.

Only report patterns you see clear evidence of. Do not hallucinate patterns."""


async def detect_patterns(repo_id: str) -> dict:
    """Sample chunks from repo and ask Groq to identify architectural patterns."""
    chunks = await retrieve_chunks(
        repo_id=repo_id,
        query="architecture service layer repository pattern controller model",
        top_k=20,
    )

    if not chunks:
        return {"patterns": [], "raw_analysis": "No indexed content found for this repository."}

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": PATTERN_SYSTEM},
            {"role": "user", "content": f"Analyze these code samples:\n\n{context[:12000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = response.choices[0].message.content
    return json.loads(content)
```

- [ ] **Step 3: Create `backend/routers/patterns.py`**

```python
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db, SessionLocal
from models import PatternDetection, User
from schemas.pattern import PatternDetectionResponse
from services.pattern_detector import detect_patterns

router = APIRouter(prefix="/repos/{repo_id}/patterns", tags=["patterns"])


async def _run_detection(repo_id: str) -> None:
    async with SessionLocal() as db:
        result = await detect_patterns(repo_id)
        existing = await db.execute(
            select(PatternDetection).where(PatternDetection.repo_id == uuid.UUID(repo_id))
        )
        detection = existing.scalar_one_or_none()
        if detection:
            detection.patterns = result.get("patterns", [])
            detection.raw_analysis = result.get("raw_analysis")
        else:
            detection = PatternDetection(
                repo_id=uuid.UUID(repo_id),
                patterns=result.get("patterns", []),
                raw_analysis=result.get("raw_analysis"),
            )
            db.add(detection)
        await db.commit()


@router.get("", response_model=PatternDetectionResponse | None)
async def get_patterns(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(PatternDetection).where(PatternDetection.repo_id == uuid.UUID(repo_id))
    )
    return result.scalar_one_or_none()


@router.post("/detect", status_code=202)
async def trigger_detection(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    background_tasks.add_task(_run_detection, repo_id)
    return {"status": "detecting"}
```

---

## Task 7: Pattern Detection — Frontend

**Files:**
- Create: `frontend/components/patterns/pattern-card.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/patterns/page.tsx`

- [ ] **Step 1: Create `frontend/components/patterns/pattern-card.tsx`**

```tsx
import { cn } from "@/lib/utils"
import type { Pattern } from "@/types"

const CONFIDENCE: Record<string, string> = {
  high:   "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  medium: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  low:    "text-zinc-400 border-zinc-500/20 bg-zinc-500/10",
}

export function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100">{pattern.name}</h3>
        <span className={cn("rounded border px-2 py-0.5 font-mono text-[10px]", CONFIDENCE[pattern.confidence])}>
          {pattern.confidence} confidence
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-zinc-400">{pattern.description}</p>
      {pattern.evidence.length > 0 && (
        <ul className="space-y-1">
          {pattern.evidence.map((e, i) => (
            <li key={i} className="font-mono text-[11px] text-zinc-600">↳ {e}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/app/(dashboard)/dashboard/repos/[id]/patterns/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Cpu } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { PatternCard } from "@/components/patterns/pattern-card"
import type { PatternDetection } from "@/types"

export default function PatternsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data: detection, isLoading } = useQuery({
    queryKey: ["patterns", id],
    queryFn: () => apiFetch<PatternDetection | null>(`/repos/${id}/patterns`),
  })

  const detect = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/patterns/detect`, { method: "POST" }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["patterns", id] }), 5000)
    },
  })

  const action = (
    <button
      onClick={() => detect.mutate()}
      disabled={detect.isPending}
      className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
    >
      <Cpu className="h-3 w-3" />
      {detect.isPending ? "Detecting…" : detection ? "Re-detect" : "Detect patterns"}
    </button>
  )

  return (
    <div>
      <PageHeader title="Pattern Detection" meta={detection ? `${detection.patterns.length} patterns found` : undefined} action={action} />
      <div className="px-5 py-5">
        {isLoading && <p className="text-sm text-zinc-600">Loading…</p>}

        {!isLoading && !detection && (
          <div className="py-10 text-center">
            <Cpu className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">No patterns detected yet. Click "Detect patterns" to analyze this codebase.</p>
          </div>
        )}

        {detection && (
          <>
            {detection.raw_analysis && (
              <div className="mb-6 rounded-xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Analysis</p>
                <p className="text-sm leading-relaxed text-zinc-400">{detection.raw_analysis}</p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {detection.patterns.map((p) => <PatternCard key={p.name} pattern={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## Task 8: Knowledge Preservation — Backend

**Files:**
- Create: `backend/schemas/knowledge.py`
- Create: `backend/routers/knowledge.py`

- [ ] **Step 1: Create `backend/schemas/knowledge.py`**

```python
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
```

- [ ] **Step 2: Create `backend/routers/knowledge.py`**

```python
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import KnowledgeEntry, User
from schemas.knowledge import KnowledgeCreate, KnowledgeResponse, KnowledgeUpdate

router = APIRouter(prefix="/repos/{repo_id}/knowledge", tags=["knowledge"])


@router.get("", response_model=list[KnowledgeResponse])
async def list_knowledge(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(KnowledgeEntry)
        .where(KnowledgeEntry.repo_id == uuid.UUID(repo_id))
        .order_by(KnowledgeEntry.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=KnowledgeResponse, status_code=201)
async def create_knowledge(
    repo_id: str,
    body: KnowledgeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    entry = KnowledgeEntry(
        repo_id=uuid.UUID(repo_id),
        author_id=user.id,
        **body.model_dump(),
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.patch("/{entry_id}", response_model=KnowledgeResponse)
async def update_knowledge(
    repo_id: str,
    entry_id: str,
    body: KnowledgeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    entry = await db.get(KnowledgeEntry, uuid.UUID(entry_id))
    if not entry or entry.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "Entry not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(entry, k, v)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_knowledge(
    repo_id: str,
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    entry = await db.get(KnowledgeEntry, uuid.UUID(entry_id))
    if not entry or entry.repo_id != uuid.UUID(repo_id):
        raise HTTPException(404, "Entry not found")
    await db.delete(entry)
    await db.commit()
```

---

## Task 9: Knowledge Preservation — Frontend

**Files:**
- Create: `frontend/components/knowledge/knowledge-card.tsx`
- Create: `frontend/components/knowledge/knowledge-form.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/knowledge/page.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/knowledge/new/page.tsx`

- [ ] **Step 1: Create `frontend/components/knowledge/knowledge-card.tsx`**

```tsx
import { FileCode2, Tag } from "lucide-react"
import type { KnowledgeEntry } from "@/types"

export function KnowledgeCard({ entry }: { entry: KnowledgeEntry }) {
  return (
    <div className="border-b border-white/[0.04] px-5 py-4">
      <div className="mb-1.5 flex items-start justify-between">
        <h3 className="font-medium text-zinc-100">{entry.title}</h3>
        <span className="ml-4 flex-shrink-0 font-mono text-[10px] text-zinc-700">
          {new Date(entry.created_at).toLocaleDateString()}
        </span>
      </div>
      {entry.body && (
        <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">{entry.body}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {entry.file_path && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-400">
            <FileCode2 className="h-3 w-3" /> {entry.file_path}
          </span>
        )}
        {entry.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-0.5 rounded-full border border-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-zinc-500">
            <Tag className="h-2.5 w-2.5" /> {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/components/knowledge/knowledge-form.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import type { KnowledgeEntry } from "@/types"

export function KnowledgeForm({ repoId, initial, entryId }: { repoId: string; initial?: Partial<KnowledgeEntry>; entryId?: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title:     initial?.title ?? "",
    body:      initial?.body ?? "",
    file_path: initial?.file_path ?? "",
    tags:      (initial?.tags ?? []).join(", "),
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => {
      const body = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), file_path: form.file_path || null }
      return entryId
        ? apiFetch<KnowledgeEntry>(`/repos/${repoId}/knowledge/${entryId}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch<KnowledgeEntry>(`/repos/${repoId}/knowledge`, { method: "POST", body: JSON.stringify(body) })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", repoId] })
      router.push(`/dashboard/repos/${repoId}/knowledge`)
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-5 px-5 py-5">
      <div>
        <label className="label">Title</label>
        <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div>
        <label className="label">Why — the rationale or context</label>
        <textarea className="input min-h-[120px]" value={form.body} onChange={(e) => set("body", e.target.value)} placeholder="Why was this decision made? What should future devs know?" />
      </div>
      <div>
        <label className="label">Linked file (optional)</label>
        <input className="input font-mono text-xs" value={form.file_path} onChange={(e) => set("file_path", e.target.value)} placeholder="src/auth/middleware.ts" />
      </div>
      <div>
        <label className="label">Tags (comma separated)</label>
        <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="auth, security, performance" />
      </div>
      {mutation.isError && <p className="text-xs text-red-500">{(mutation.error as Error).message}</p>}
      <button type="submit" disabled={mutation.isPending || !form.title.trim()} className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50">
        {mutation.isPending ? "Saving…" : entryId ? "Save changes" : "Add knowledge"}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Create `frontend/app/(dashboard)/dashboard/repos/[id]/knowledge/page.tsx`**

```tsx
"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { KnowledgeCard } from "@/components/knowledge/knowledge-card"
import type { KnowledgeEntry } from "@/types"

export default function KnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => apiFetch<KnowledgeEntry[]>(`/repos/${id}/knowledge`),
  })

  const action = (
    <Link href={`/dashboard/repos/${id}/knowledge/new`} className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-900 hover:bg-amber-400">
      <Plus className="h-3 w-3" /> Add entry
    </Link>
  )

  return (
    <div>
      <PageHeader title="Knowledge Base" meta={entries.length ? `${entries.length} entries` : undefined} action={action} />
      <div className="mt-2">
        {isLoading && <p className="px-5 py-4 text-sm text-zinc-600">Loading…</p>}
        {!isLoading && entries.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">No knowledge entries yet. Document the "why" behind your decisions.</p>
          </div>
        )}
        {entries.map((e) => <KnowledgeCard key={e.id} entry={e} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `frontend/app/(dashboard)/dashboard/repos/[id]/knowledge/new/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { KnowledgeForm } from "@/components/knowledge/knowledge-form"

export default function NewKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="Add Knowledge" meta="Document the why" />
      <KnowledgeForm repoId={id} />
    </div>
  )
}
```

---

## Task 10: Architecture Intelligence — Backend

**Files:**
- Create: `backend/schemas/architecture.py`
- Create: `backend/services/arch_analyzer.py`
- Create: `backend/routers/architecture.py`

- [ ] **Step 1: Create `backend/schemas/architecture.py`**

```python
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
```

- [ ] **Step 2: Create `backend/services/arch_analyzer.py`**

```python
import json

from groq import AsyncGroq

from config import settings
from services.retriever import retrieve_chunks

ARCH_SYSTEM = """You are an expert software architect. Analyze the provided code samples and produce an architecture graph.

Return a JSON object with this exact structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Node Name",
      "type": "service|module|database|external|layer",
      "description": "What this node does",
      "files": ["path/to/file.ext"]
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "node-id",
      "target": "node-id",
      "label": "calls|reads|writes|extends|uses"
    }
  ]
}

Types:
- service: a distinct service or microservice
- module: a code module or package
- database: a database or data store
- external: an external API or third-party service
- layer: an architectural layer (controllers, services, repositories)

Keep it focused — 6 to 16 nodes maximum. Only include nodes with clear evidence."""


async def analyze_architecture(repo_id: str) -> dict:
    chunks = await retrieve_chunks(
        repo_id=repo_id,
        query="import export module service controller repository database API client",
        top_k=25,
    )

    if not chunks:
        return {"nodes": [], "edges": []}

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": ARCH_SYSTEM},
            {"role": "user", "content": f"Analyze this codebase and produce an architecture graph:\n\n{context[:14000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    return json.loads(response.choices[0].message.content)
```

- [ ] **Step 3: Create `backend/routers/architecture.py`**

```python
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import SessionLocal, get_db
from models import ArchitectureGraph, User
from schemas.architecture import ArchitectureGraphResponse
from services.arch_analyzer import analyze_architecture

router = APIRouter(prefix="/repos/{repo_id}/architecture", tags=["architecture"])


async def _run_analysis(repo_id: str) -> None:
    async with SessionLocal() as db:
        graph_data = await analyze_architecture(repo_id)
        existing = await db.execute(
            select(ArchitectureGraph).where(ArchitectureGraph.repo_id == uuid.UUID(repo_id))
        )
        graph = existing.scalar_one_or_none()
        if graph:
            graph.graph_data = graph_data
        else:
            graph = ArchitectureGraph(repo_id=uuid.UUID(repo_id), graph_data=graph_data)
            db.add(graph)
        await db.commit()


@router.get("", response_model=ArchitectureGraphResponse | None)
async def get_architecture(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(ArchitectureGraph).where(ArchitectureGraph.repo_id == uuid.UUID(repo_id))
    )
    return result.scalar_one_or_none()


@router.post("/analyze", status_code=202)
async def trigger_analysis(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    background_tasks.add_task(_run_analysis, repo_id)
    return {"status": "analyzing"}
```

---

## Task 11: Architecture Intelligence — Frontend

**Files:**
- Create: `frontend/components/architecture/arch-graph.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/architecture/page.tsx`

- [ ] **Step 1: Install React Flow**

```powershell
cd c:\Codes\DevDayOne\frontend
npm install @xyflow/react
```

- [ ] **Step 2: Create `frontend/components/architecture/arch-graph.tsx`**

```tsx
"use client"

import { useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { ArchitectureGraph } from "@/types"

const TYPE_COLORS: Record<string, string> = {
  service:  "#6366F1",
  module:   "#F59E0B",
  database: "#10B981",
  external: "#EC4899",
  layer:    "#8B5CF6",
}

function buildNodes(graph: ArchitectureGraph["graph_data"]): Node[] {
  return graph.nodes.map((n, i) => ({
    id: n.id,
    position: { x: (i % 4) * 220, y: Math.floor(i / 4) * 160 },
    data: { label: n.label, description: n.description, type: n.type },
    style: {
      background: "#0C0C0E",
      border: `1px solid ${TYPE_COLORS[n.type] ?? "#3f3f46"}`,
      borderRadius: "8px",
      color: "#fafafa",
      fontSize: "12px",
      padding: "10px 14px",
      minWidth: "120px",
    },
  }))
}

function buildEdges(graph: ArchitectureGraph["graph_data"]): Edge[] {
  return graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: "#3f3f46" },
    labelStyle: { fill: "#71717a", fontSize: "10px" },
    labelBgStyle: { fill: "#0C0C0E" },
  }))
}

export function ArchGraph({ graph }: { graph: ArchitectureGraph }) {
  const [nodes, , onNodesChange] = useNodesState(buildNodes(graph.graph_data))
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(graph.graph_data))
  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge(c, eds)), [setEdges])

  return (
    <div className="h-[520px] w-full rounded-xl border border-white/[0.06] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} />
        <Controls />
        <MiniMap nodeColor={(n) => TYPE_COLORS[(n.data as { type: string }).type] ?? "#3f3f46"} maskColor="#09090B99" />
      </ReactFlow>
    </div>
  )
}
```

- [ ] **Step 3: Create `frontend/app/(dashboard)/dashboard/repos/[id]/architecture/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { GitFork } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { ArchGraph } from "@/components/architecture/arch-graph"
import type { ArchitectureGraph } from "@/types"

export default function ArchitecturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data: graph, isLoading } = useQuery({
    queryKey: ["architecture", id],
    queryFn: () => apiFetch<ArchitectureGraph | null>(`/repos/${id}/architecture`),
  })

  const analyze = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/architecture/analyze`, { method: "POST" }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["architecture", id] }), 8000)
    },
  })

  const action = (
    <button
      onClick={() => analyze.mutate()}
      disabled={analyze.isPending}
      className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
    >
      <GitFork className="h-3 w-3" />
      {analyze.isPending ? "Analyzing…" : graph ? "Re-analyze" : "Generate graph"}
    </button>
  )

  return (
    <div>
      <PageHeader title="Architecture Intelligence" meta={graph ? `Generated ${new Date(graph.generated_at).toLocaleDateString()}` : undefined} action={action} />
      <div className="px-5 py-5">
        {isLoading && <p className="text-sm text-zinc-600">Loading…</p>}
        {!isLoading && !graph && (
          <div className="py-10 text-center">
            <GitFork className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">No architecture map yet. Click "Generate graph" to auto-detect services, modules, and dependencies.</p>
            <p className="mt-1 text-xs text-zinc-700">Takes ~10 seconds for the AI to analyze the codebase.</p>
          </div>
        )}
        {graph && <ArchGraph graph={graph} />}
        {graph && (
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { color: "bg-indigo-500", label: "Service" },
              { color: "bg-amber-500", label: "Module" },
              { color: "bg-emerald-500", label: "Database" },
              { color: "bg-pink-500", label: "External" },
              { color: "bg-purple-500", label: "Layer" },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                {l.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Task 12: Impact Analysis — Backend + Frontend

**Files:**
- Create: `backend/schemas/impact.py`
- Create: `backend/services/impact_analyzer.py`
- Create: `backend/routers/impact.py`
- Create: `frontend/components/impact/impact-form.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/impact/page.tsx`

- [ ] **Step 1: Create `backend/schemas/impact.py`**

```python
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
```

- [ ] **Step 2: Create `backend/services/impact_analyzer.py`**

```python
import json

from groq import AsyncGroq

from config import settings
from services.retriever import retrieve_chunks

IMPACT_SYSTEM = """You are an expert software engineer performing impact analysis.

Given a change description, analyze the provided code samples and identify what could break.

Return a JSON object with this exact structure:
{
  "summary": "A 2-3 sentence summary of the impact",
  "affected_files": [
    {
      "path": "src/path/to/file.ts",
      "reason": "Why this file is affected",
      "risk": "high|medium|low"
    }
  ],
  "risk_level": "high|medium|low"
}

risk_level rules:
- high: core functionality, auth, payments, data integrity
- medium: multiple dependent components affected
- low: isolated change, well-contained"""


async def analyze_impact(repo_id: str, query: str) -> dict:
    chunks = await retrieve_chunks(repo_id=repo_id, query=query, top_k=15)

    if not chunks:
        return {
            "summary": "No indexed content found.",
            "affected_files": [],
            "risk_level": "low",
        }

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": IMPACT_SYSTEM},
            {"role": "user", "content": f"Change: {query}\n\nRelevant code:\n\n{context[:12000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    return json.loads(response.choices[0].message.content)
```

- [ ] **Step 3: Create `backend/routers/impact.py`**

```python
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import ImpactAnalysis, User
from schemas.impact import ImpactAnalysisResponse, ImpactRequest
from services.impact_analyzer import analyze_impact

router = APIRouter(prefix="/repos/{repo_id}/impact", tags=["impact"])


@router.get("", response_model=list[ImpactAnalysisResponse])
async def list_impact(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(ImpactAnalysis)
        .where(ImpactAnalysis.repo_id == uuid.UUID(repo_id))
        .order_by(ImpactAnalysis.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.post("", response_model=ImpactAnalysisResponse, status_code=201)
async def run_impact(
    repo_id: str,
    body: ImpactRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await analyze_impact(repo_id, body.query)
    analysis = ImpactAnalysis(
        repo_id=uuid.UUID(repo_id),
        query=body.query,
        result=result,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis
```

- [ ] **Step 4: Create `frontend/components/impact/impact-form.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Zap } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import type { ImpactAnalysis } from "@/types"

const RISK_STYLES: Record<string, string> = {
  high:   "text-red-400 border-red-500/20 bg-red-500/10",
  medium: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  low:    "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
}

export function ImpactForm({ repoId }: { repoId: string }) {
  const [query, setQuery] = useState("")

  const mutation = useMutation({
    mutationFn: () => apiFetch<ImpactAnalysis>(`/repos/${repoId}/impact`, {
      method: "POST",
      body: JSON.stringify({ query }),
    }),
  })

  const result = mutation.data?.result

  return (
    <div className="space-y-5 px-5 py-5">
      <form
        onSubmit={(e) => { e.preventDefault(); if (query.trim()) mutation.mutate() }}
        className="flex gap-2"
      >
        <input
          className="input flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "What breaks if I change the auth middleware?"'
        />
        <button
          type="submit"
          disabled={mutation.isPending || !query.trim()}
          className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          <Zap className="h-3.5 w-3.5" />
          {mutation.isPending ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={cn("rounded border px-2 py-0.5 font-mono text-[11px]", RISK_STYLES[result.risk_level])}>
              {result.risk_level} risk
            </span>
            <p className="text-sm text-zinc-400">{result.summary}</p>
          </div>

          {result.affected_files.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
              <div className="border-b border-white/[0.04] px-4 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Affected files</p>
              </div>
              {result.affected_files.map((f) => (
                <div key={f.path} className="flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0">
                  <span className={cn("mt-0.5 flex-shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px]", RISK_STYLES[f.risk])}>
                    {f.risk}
                  </span>
                  <div>
                    <p className="font-mono text-[12px] text-zinc-200">{f.path}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{f.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create `frontend/app/(dashboard)/dashboard/repos/[id]/impact/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { ImpactForm } from "@/components/impact/impact-form"

export default function ImpactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="Impact Analysis" meta="What breaks if I change X?" />
      <ImpactForm repoId={id} />
    </div>
  )
}
```

---

## Task 13: API Intelligence — Backend + Frontend

**Files:**
- Create: `backend/schemas/api_intel.py`
- Create: `backend/services/api_scanner.py`
- Create: `backend/routers/api_intel.py`
- Create: `frontend/components/api-intel/api-table.tsx`
- Create: `frontend/app/(dashboard)/dashboard/repos/[id]/apis/page.tsx`

- [ ] **Step 1: Create `backend/schemas/api_intel.py`**

```python
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
```

- [ ] **Step 2: Create `backend/services/api_scanner.py`**

```python
import json

from groq import AsyncGroq

from config import settings
from services.retriever import retrieve_chunks

SCAN_SYSTEM = """You are analyzing a codebase to inventory all APIs.

Return a JSON object with this structure:
{
  "apis": [
    {
      "name": "Stripe API",
      "api_type": "external",
      "version": "v1",
      "endpoint": "https://api.stripe.com/v1",
      "file_path": "src/services/payment.ts",
      "status": "active"
    }
  ]
}

api_type:
- "internal": an API route defined in this codebase
- "external": a third-party API being called

status:
- "active": in current use
- "deprecated": appears deprecated or unused
- "unknown": cannot determine

Extract every distinct API endpoint, SDK client, and HTTP call you can identify. Include version if visible in imports or config. Do not duplicate entries."""


async def scan_apis(repo_id: str) -> list[dict]:
    chunks = await retrieve_chunks(
        repo_id=repo_id,
        query="API endpoint fetch axios http request client SDK import version URL",
        top_k=20,
    )

    if not chunks:
        return []

    context = "\n\n---\n\n".join(
        f"File: {c['file_path']}\n{c['content']}" for c in chunks
    )

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": SCAN_SYSTEM},
            {"role": "user", "content": f"Scan for APIs:\n\n{context[:14000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    data = json.loads(response.choices[0].message.content)
    return data.get("apis", [])
```

- [ ] **Step 3: Create `backend/routers/api_intel.py`**

```python
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import SessionLocal, get_db
from models import ApiInventoryItem, User
from schemas.api_intel import ApiItemResponse
from services.api_scanner import scan_apis

router = APIRouter(prefix="/repos/{repo_id}/apis", tags=["api-intel"])


async def _run_scan(repo_id: str) -> None:
    async with SessionLocal() as db:
        apis = await scan_apis(repo_id)
        await db.execute(
            delete(ApiInventoryItem).where(ApiInventoryItem.repo_id == uuid.UUID(repo_id))
        )
        for api in apis:
            item = ApiInventoryItem(repo_id=uuid.UUID(repo_id), **api)
            db.add(item)
        await db.commit()


@router.get("", response_model=list[ApiItemResponse])
async def list_apis(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    result = await db.execute(
        select(ApiInventoryItem)
        .where(ApiInventoryItem.repo_id == uuid.UUID(repo_id))
        .order_by(ApiInventoryItem.api_type, ApiInventoryItem.name)
    )
    return result.scalars().all()


@router.post("/scan", status_code=202)
async def trigger_scan(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await get_owned_repo(repo_id, user, db)
    background_tasks.add_task(_run_scan, repo_id)
    return {"status": "scanning"}
```

- [ ] **Step 4: Create `frontend/components/api-intel/api-table.tsx`**

```tsx
import { cn } from "@/lib/utils"
import type { ApiInventoryItem } from "@/types"

const TYPE_BADGE: Record<string, string> = {
  internal: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  external: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

const STATUS_BADGE: Record<string, string> = {
  active:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  deprecated: "bg-zinc-500/10 text-zinc-500 border-zinc-700/40",
  unknown:    "bg-zinc-800/50 text-zinc-600 border-zinc-700/40",
}

export function ApiTable({ items }: { items: ApiInventoryItem[] }) {
  const internal = items.filter((i) => i.api_type === "internal")
  const external = items.filter((i) => i.api_type === "external")

  return (
    <div className="space-y-6">
      {[{ label: "Internal APIs", list: internal }, { label: "External APIs", list: external }].map(({ label, list }) =>
        list.length > 0 ? (
          <div key={label}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">{label}</p>
            <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
              {list.map((item, i) => (
                <div key={item.id} className={cn("flex items-start gap-3 px-4 py-3", i < list.length - 1 && "border-b border-white/[0.04]")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] font-medium text-zinc-200">{item.name}</span>
                      {item.version && (
                        <span className="font-mono text-[10px] text-zinc-600">{item.version}</span>
                      )}
                      <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px]", TYPE_BADGE[item.api_type])}>
                        {item.api_type}
                      </span>
                      <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px]", STATUS_BADGE[item.status])}>
                        {item.status}
                      </span>
                    </div>
                    {item.endpoint && <p className="mt-0.5 font-mono text-[11px] text-zinc-600 truncate">{item.endpoint}</p>}
                    {item.file_path && <p className="mt-0.5 font-mono text-[11px] text-zinc-700">{item.file_path}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create `frontend/app/(dashboard)/dashboard/repos/[id]/apis/page.tsx`**

```tsx
"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Radio } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { ApiTable } from "@/components/api-intel/api-table"
import type { ApiInventoryItem } from "@/types"

export default function ApisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data: apis = [], isLoading } = useQuery({
    queryKey: ["apis", id],
    queryFn: () => apiFetch<ApiInventoryItem[]>(`/repos/${id}/apis`),
  })

  const scan = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/apis/scan`, { method: "POST" }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["apis", id] }), 8000)
    },
  })

  const action = (
    <button
      onClick={() => scan.mutate()}
      disabled={scan.isPending}
      className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
    >
      <Radio className="h-3 w-3" />
      {scan.isPending ? "Scanning…" : apis.length ? "Re-scan" : "Scan APIs"}
    </button>
  )

  return (
    <div>
      <PageHeader title="API Intelligence" meta={apis.length ? `${apis.length} APIs found` : undefined} action={action} />
      <div className="px-5 py-5">
        {isLoading && <p className="text-sm text-zinc-600">Loading…</p>}
        {!isLoading && apis.length === 0 && (
          <div className="py-10 text-center">
            <Radio className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">No APIs inventoried yet. Click "Scan APIs" to detect all internal and external APIs used in this codebase.</p>
          </div>
        )}
        {apis.length > 0 && <ApiTable items={apis} />}
      </div>
    </div>
  )
}
```

---

## Task 14: Verify Build + Commit Checkpoints

**Files:**
- No new files

- [ ] **Step 1: Run backend tests**

```powershell
cd c:\Codes\DevDayOne\backend
.venv\Scripts\python.exe -m pytest tests/ -v
```

Expected: all existing tests pass. No new tests needed for LLM-dependent services (non-deterministic output).

- [ ] **Step 2: Run frontend build**

```powershell
cd c:\Codes\DevDayOne\frontend
npm run build
```

Expected: clean build, all new routes appear in route list.

- [ ] **Step 3: Smoke test in browser**

With backend running (`uvicorn main:app --reload`):
1. Navigate to a repo → click each new nav item (ADRs, Patterns, Impact, Knowledge, Architecture, APIs)
2. All pages load without 404 or JS errors
3. Create one ADR → verify it appears in the list
4. Add one Knowledge entry → verify it saves
5. Trigger Pattern Detection → wait 10s → refresh → verify patterns appear
6. Trigger Architecture Analysis → wait 10s → refresh → verify graph renders

- [ ] **Step 4: Suggested commit messages**

After Task 1 (migration):
```
feat: add phase 2 db tables (adrs, patterns, knowledge, architecture, impact, apis)
```

After Tasks 2-5 (ADR):
```
feat: ADR management — full CRUD backend + frontend
```

After Tasks 6-7 (Patterns):
```
feat: pattern detection — Groq-powered architecture pattern analysis
```

After Tasks 8-9 (Knowledge):
```
feat: knowledge preservation — team rationale docs linked to files
```

After Tasks 10-11 (Architecture):
```
feat: architecture intelligence — React Flow interactive dependency graph
```

After Tasks 12 (Impact):
```
feat: impact analysis — AI-powered change risk assessment
```

After Task 13 (API Intel):
```
feat: API intelligence — inventory internal and external APIs
```
