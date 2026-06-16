# Dev Day One — Complete Project Plan
> "Every developer, ready from day one."
> v3.1 — Simplified for fast development, $0/month stack

---

## Changelog v3.0 → v3.1

- **Railway → Render free tier** (no credit card, $0/month; UptimeRobot ping to avoid cold starts)
- **Next.js 14 → Next.js 15+** (React 19, `next.config.ts` — v3.0 was internally inconsistent here)
- **Tailwind v3 → v4** (CSS-first config, current shadcn/ui default)
- **Vercel AI SDK v4 → v5** (`@ai-sdk/react`, SSE-based UI message stream protocol; old `0:json\n` format removed)
- **sentence-transformers → fastembed** (ONNX, same 384-dim MiniLM-class embeddings, ~10x lighter — fits Render's 512MB)
- **Dropped LangChain PGVector storage** — we own the `repo_chunks` table with a small custom retriever (v3.0 had indexing write to one table while the retriever searched another)
- **Indexing progress via `indexing_jobs` table + Supabase Postgres Changes** — dropped the redundant SSE endpoint and the unsupported Python `realtime.broadcast()` call
- **MVP scopes to public repos only** — Supabase OAuth `provider_token` is not persisted; private repos via GitHub App in Phase 2
- **Groq model name is a config setting**, verified against Groq's live model list at build time (Groq deprecates models aggressively)
- **`users` table syncs from `auth.users` via trigger** (standard Supabase pattern, now explicit)
- **RLS caveat made explicit**: FastAPI's service-role key bypasses RLS; every endpoint enforces org/repo ownership itself
- **tree-sitter deferred to Phase 2** (nothing in Phase 1 uses it)

---

## 1. Product Overview

**Day One** is the knowledge and architecture layer for software teams.

- **Onboarding** — new developers understand any codebase fast
- **Preservation** — knowledge stays even when senior developers leave

### Core Features
1. **AI Onboarding** — Chat-based guide for new devs joining a repo
2. **Ask Repository (RAG)** — Chat with the codebase like a senior dev
3. **Architecture Intelligence** — Auto-detects services, layers, dependencies
4. **Pattern Detection** — Detects MVC, Repository Pattern, DDD, CQRS, etc.
5. **Impact Analysis** — "What breaks if I change this?"
6. **Knowledge Preservation** — Captures the "why" behind decisions
7. **ADR Management** — Architecture Decision Records storage
8. **API Intelligence** — Tracks internal/external APIs and deprecations

---

## 2. Brand & Theme

### Identity
- **Name:** Day One
- **Tagline:** "Every developer, ready from day one"
- **Secondary:** "Your repository has a map. Use it."

### Color System (Dawn Theme)
```
-- Backgrounds --
--bg-primary:     #09090B   zinc-950
--bg-secondary:   #18181B   zinc-900
--bg-tertiary:    #27272A   zinc-800
--bg-card:        #1C1C1F

-- Text --
--text-primary:   #FAFAFA   zinc-50
--text-secondary: #A1A1AA   zinc-400
--text-muted:     #71717A   zinc-500

-- Accent: Amber / Dawn --
--accent:         #F59E0B   amber-500
--accent-hover:   #D97706   amber-600
--accent-subtle:  #451A03   amber-950
--accent-text:    #FDE68A   amber-200

-- AI Accent: Indigo --
--ai:             #6366F1   indigo-500
--ai-subtle:      #1E1B4B   indigo-950
--ai-text:        #C7D2FE   indigo-200

-- Semantic --
--success:        #10B981
--warning:        #F59E0B
--danger:         #EF4444
--info:           #3B82F6

-- Border --
--border:         rgba(255,255,255,0.08)
--border-hover:   rgba(255,255,255,0.15)
```

### Typography
```
Font Sans:  Inter
Font Mono:  JetBrains Mono

Headings:   700 weight, -0.025em tracking
Body:       400 weight, 14-16px
Code:       JetBrains Mono 400, 13px
Labels:     500 weight, 12px, uppercase, 0.025em tracking
```

### Design Language
- Dark mode only
- Linear.app-inspired sidebar layout
- GSAP scroll animations on landing page
- Framer Motion page transitions (200-300ms)
- Minimal 1px borders (0.08 opacity)
- Amber glow on primary CTAs only

---

## 3. Tech Stack

### Frontend — Next.js 15+
```
Framework:      Next.js 15+ (App Router) + TypeScript + React 19
Styling:        Tailwind CSS v4 + shadcn/ui
Animations:     Framer Motion + GSAP (landing only)
Graphs:         React Flow (architecture viz)
Charts:         D3.js (dependency graphs) + Recharts (dashboards)
AI Streaming:   Vercel AI SDK v5 — useChat from @ai-sdk/react
Realtime:       Supabase Realtime (Postgres Changes)
Icons:          Lucide React
Forms:          React Hook Form + Zod
State:          Zustand + React Query
```

### Backend — FastAPI (handles everything)
```
Framework:      FastAPI (Python 3.11+)
ORM:            SQLAlchemy 2.0 (async) + asyncpg driver
AI/LLM:         Groq API — model name in config (FREE; verify live model
                list at build time, e.g. current Llama-class versatile model)
RAG:            Direct pipeline — embed → pgvector similarity → prompt → Groq
                (LangChain only if/where it earns its place; no LangChain storage)
Embeddings:     fastembed (ONNX) — MiniLM-class, 384 dims
Code Parsing:   tree-sitter (Phase 2 — not installed in MVP)
GitHub:         PyGithub (public repos in MVP; GitHub App for private in Phase 2)
Logging:        Python logging + structlog
Scheduling:     Supabase pg_cron + pg_net
Streaming:      FastAPI StreamingResponse emitting AI SDK v5 SSE protocol
Auth:           Supabase JWT validation (python-jose)
```

### Database — Supabase (all-in-one, free tier)
```
PostgreSQL 15   Primary database
pgvector        Vector embeddings store (vector(384))
Supabase Auth   GitHub OAuth (identity only; users table synced via trigger)
Supabase Realtime  Postgres Changes on indexing_jobs, chat_messages
Supabase Storage   Repo file cache
pg_cron + pg_net   Scheduled jobs (API checks)
```

### Deployment ($0/month, no credit card anywhere)
```
Vercel (Hobby)        Next.js frontend
Render (Free tier)    FastAPI backend — spins down after 15 min idle;
                      free UptimeRobot ping every 10 min keeps it warm
                      (750 free hrs/month covers 24/7)
Supabase (Free)       Database + auth + realtime + storage
Groq (Free)           LLM inference
```

### Removed (for fast development)
```
❌ Redis             → Supabase handles caching + scheduling
❌ Socket.io         → Supabase Realtime
❌ Go service        → FastAPI internal logging
❌ Docker            → Run services locally, deploy directly
❌ Prisma            → SQLAlchemy in FastAPI (single ORM)
❌ Monitoring        → structlog in FastAPI
❌ Railway           → Render free tier (costs $0 instead of $5/mo)
❌ LangChain PGVector → own repo_chunks table + custom retriever
❌ sentence-transformers → fastembed (PyTorch too heavy for 512MB free tier)
```

---

## 4. Resume Coverage

| Resume | What Day One Proves |
|---|---|
| **Software Engineer** | System design, microservices (Next.js + FastAPI), async Python, REST API design, GitHub webhooks, pgvector, Supabase Realtime |
| **Software Developer** | Full stack (Next.js + FastAPI), PostgreSQL, SQLAlchemy, REST APIs, multi-service integration, authentication |
| **Frontend Developer** | React 19, Next.js 15, Tailwind v4, shadcn/ui, GSAP, Framer Motion, React Flow, D3.js, Recharts, Vercel AI SDK streaming |
| **AI Developer** | FastAPI, RAG pipeline from first principles, Groq API, pgvector, embeddings, streaming responses, prompt engineering |

---

## 5. Architecture

```
┌──────────────────────────────────────────────┐
│   Next.js 15 — Frontend Only                 │
│   Tailwind v4 · shadcn/ui · Framer Motion    │
│   GSAP · React Flow · D3.js · Recharts       │
│   Vercel AI SDK v5 (streaming chat UI)       │
├──────────────────────────────────────────────┤
│   FastAPI — All Backend Logic                │
│   SQLAlchemy · Groq · fastembed              │
│   structlog · GitHub Webhooks                │
├──────────────────────────────────────────────┤
│   Supabase — Everything Data                 │
│   PostgreSQL + pgvector                      │
│   Auth (GitHub OAuth)                        │
│   Realtime (Postgres Changes)                │
│   Storage · pg_cron · pg_net                 │
├──────────────────────────────────────────────┤
│   External                                   │
│   GitHub API · GitHub OAuth · Groq API       │
├──────────────────────────────────────────────┤
│   Deploy — $0/month                          │
│   Vercel (Next.js) · Render (FastAPI)        │
│   Supabase Cloud                             │
└──────────────────────────────────────────────┘
```

---

## 6. File Structure

```
day-one/
│
├── frontend/                              # Next.js 15
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                  # Landing — GSAP animations
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx                # Sidebar + navbar
│   │       ├── dashboard/page.tsx
│   │       ├── repos/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/
│   │       │       ├── layout.tsx        # Repo tabs
│   │       │       ├── page.tsx
│   │       │       ├── onboard/page.tsx
│   │       │       ├── ask/page.tsx
│   │       │       ├── architecture/page.tsx
│   │       │       ├── patterns/page.tsx
│   │       │       ├── impact/page.tsx
│   │       │       ├── knowledge/page.tsx
│   │       │       ├── adrs/
│   │       │       │   ├── page.tsx
│   │       │       │   └── [adrId]/page.tsx
│   │       │       └── apis/page.tsx
│   │       ├── team/page.tsx
│   │       └── settings/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── repo-tabs.tsx
│   │   ├── landing/
│   │   │   ├── hero.tsx                  # GSAP scroll hero
│   │   │   ├── features.tsx
│   │   │   └── how-it-works.tsx
│   │   ├── chat/
│   │   │   ├── chat-interface.tsx        # AI SDK v5 useChat
│   │   │   ├── message-bubble.tsx
│   │   │   └── source-citation.tsx
│   │   ├── architecture/
│   │   │   ├── arch-graph.tsx            # React Flow
│   │   │   └── dep-chart.tsx             # D3.js
│   │   ├── metrics/
│   │   │   └── code-metrics.tsx          # Recharts
│   │   ├── repos/
│   │   │   ├── repo-card.tsx
│   │   │   ├── connect-repo.tsx
│   │   │   └── indexing-progress.tsx     # Realtime Postgres Changes
│   │   └── adrs/
│   │       ├── adr-card.tsx
│   │       └── adr-editor.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser client
│   │   │   └── server.ts                 # Server client
│   │   ├── api/
│   │   │   └── client.ts                 # FastAPI calls (attaches Supabase JWT)
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── use-repo.ts
│   │   ├── use-indexing-progress.ts      # Supabase Postgres Changes
│   │   └── use-repo-chat.ts              # AI SDK v5 useChat wrapper
│   │
│   ├── types/index.ts
│   ├── middleware.ts                     # Auth protection
│   ├── .env.local
│   ├── next.config.ts
│   └── package.json                      # (Tailwind v4: no tailwind.config.ts)
│
└── backend/                              # FastAPI
    ├── main.py                           # App entry + CORS
    ├── config.py                         # Settings (pydantic-settings) incl. GROQ_MODEL
    ├── database.py                       # SQLAlchemy async engine
    ├── auth.py                           # Supabase JWT middleware + ownership checks
    │
    ├── models/
    │   ├── __init__.py
    │   ├── organization.py               # SQLAlchemy models
    │   ├── user.py
    │   ├── repository.py
    │   ├── indexing_job.py               # progress rows → Realtime
    │   ├── knowledge.py
    │   ├── adr.py
    │   ├── api_entry.py
    │   ├── chat.py
    │   └── onboarding.py
    │
    ├── schemas/
    │   ├── __init__.py
    │   └── *.py                          # Pydantic request/response
    │
    ├── routers/
    │   ├── __init__.py
    │   ├── repos.py                      # Repo CRUD + connect
    │   ├── indexing.py                   # Repo indexing endpoint
    │   ├── rag.py                        # Ask repository (streaming)
    │   ├── onboarding.py                 # AI onboarding (streaming)
    │   ├── architecture.py               # Arch detection (Phase 2)
    │   ├── patterns.py                   # Pattern detection (Phase 2)
    │   ├── impact.py                     # Impact analysis (Phase 2)
    │   ├── knowledge.py                  # Knowledge CRUD (Phase 3)
    │   ├── adrs.py                       # ADR CRUD (Phase 3)
    │   ├── apis.py                       # API intelligence CRUD (Phase 3)
    │   └── webhooks.py                   # GitHub webhook handler
    │
    ├── services/
    │   ├── __init__.py
    │   ├── embeddings.py                 # fastembed wrapper
    │   ├── groq_client.py                # Groq API wrapper (model from config)
    │   ├── rag.py                        # retrieve → prompt → stream pipeline
    │   ├── retriever.py                  # pgvector similarity search (custom, ~20 lines)
    │   ├── github_parser.py              # Fetch + parse public repos
    │   ├── code_chunker.py               # Chunk code into segments
    │   ├── ai_stream.py                  # AI SDK v5 SSE protocol formatter
    │   ├── arch_detector.py              # Phase 2
    │   ├── pattern_detector.py           # Phase 2
    │   └── impact_analyzer.py            # Phase 2
    │
    ├── utils/
    │   ├── logger.py                     # structlog setup
    │   └── supabase.py                   # Supabase admin client
    │
    ├── requirements.txt
    ├── .env
    └── render.yaml                       # Render deploy (replaces Procfile)
```

---

## 7. Database Schema

```python
# backend/models/repository.py
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from database import Base

class Repository(Base):
    __tablename__ = "repositories"
    id           = Column(String, primary_key=True, default=generate_cuid)
    org_id       = Column(String, ForeignKey("organizations.id"))
    name         = Column(String, nullable=False)
    full_name    = Column(String, nullable=False)       # owner/repo
    github_url   = Column(String)
    github_id    = Column(Integer, unique=True)
    description  = Column(String)
    is_private   = Column(Boolean, default=False)       # MVP: public only
    indexed      = Column(Boolean, default=False)
    indexed_at   = Column(DateTime)
    created_at   = Column(DateTime, default=func.now())
```

```sql
-- repo_chunks: WE own this table (no LangChain storage layout).
-- Created via Supabase migration:
CREATE TABLE repo_chunks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id    text NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  file_path  text NOT NULL,
  content    text NOT NULL,
  embedding  vector(384),
  metadata   jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON repo_chunks USING hnsw (embedding vector_cosine_ops);

-- indexing_jobs: progress rows; frontend subscribes via Postgres Changes
CREATE TABLE indexing_jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id     text NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pending',  -- pending|running|done|failed
  progress    int  NOT NULL DEFAULT 0,          -- 0-100
  error       text,
  started_at  timestamptz DEFAULT now(),
  finished_at timestamptz
);
ALTER PUBLICATION supabase_realtime ADD TABLE indexing_jobs;

-- users table syncs from auth.users via trigger (standard Supabase pattern):
CREATE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Other tables follow same pattern: organizations, users, knowledge_entries,
-- adrs, api_entries, chat_sessions, chat_messages, onboarding_sessions
```

> **RLS note:** RLS is enabled on all tables, but it only protects direct
> frontend → Supabase reads. FastAPI uses the service-role key, which
> **bypasses RLS** — every FastAPI endpoint must verify the requesting
> user's org/repo ownership itself (enforced in `auth.py` dependencies).

---

## 8. API Endpoints (FastAPI)

### Repositories
```
GET    /repos                     List repos
POST   /repos                     Connect repo (public repos in MVP)
GET    /repos/{id}                Repo details
DELETE /repos/{id}                Remove repo
POST   /repos/{id}/index          Trigger indexing (background task →
                                  writes progress to indexing_jobs;
                                  frontend gets it via Supabase Realtime)
POST   /webhooks/github           GitHub webhook handler
```
*(v3.0's SSE `/index/status` endpoint removed — Realtime already covers it.)*

### AI Features (streaming)
```
POST   /repos/{id}/ask            RAG chat — StreamingResponse (AI SDK v5 SSE)
POST   /repos/{id}/onboard        Onboarding chat — same pipeline, different
                                  system prompt
GET    /repos/{id}/architecture   Phase 2
GET    /repos/{id}/patterns       Phase 2
POST   /repos/{id}/impact         Phase 2
```

### CRUD (Phase 3)
```
GET/POST/PUT/DELETE  /repos/{id}/knowledge[/{kid}]
GET/POST/PUT/DELETE  /repos/{id}/adrs[/{aid}]
GET/POST/PUT         /repos/{id}/apis[/{apiid}]
```

---

## 9. Streaming Implementation (AI SDK v5)

### FastAPI → AI SDK v5 UI message stream (SSE)
```python
# backend/routers/rag.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.rag import answer_question
from services.ai_stream import to_ai_sdk_sse   # formats v5 SSE events

router = APIRouter()

@router.post("/repos/{repo_id}/ask")
async def ask_repository(repo_id: str, body: AskRequest):
    async def generate():
        # v5 protocol: SSE events — start / text-start / text-delta /
        # text-end / finish, then [DONE]
        async for event in to_ai_sdk_sse(answer_question(repo_id, body)):
            yield event

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"x-vercel-ai-ui-message-stream": "v1"},
    )
```

### Frontend → AI SDK v5 useChat
```typescript
// frontend/components/chat/chat-interface.tsx
"use client"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState } from "react"

export function ChatInterface({ repoId, token }: { repoId: string; token: string }) {
  const [input, setInput] = useState("")   // v5: input state is yours
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/repos/${repoId}/ask`,
      headers: { Authorization: `Bearer ${token}` },  // Supabase JWT
    }),
  })

  return (
    <div>
      {messages.map(m => <MessageBubble key={m.id} message={m} />)}
      <form onSubmit={e => { e.preventDefault(); sendMessage({ text: input }); setInput("") }}>
        <input value={input} onChange={e => setInput(e.target.value)} />
      </form>
    </div>
  )
}
```

> Cross-origin note: the frontend calls Render directly, so the Supabase
> JWT travels in the `Authorization` header (cookies don't cross origins).
> FastAPI CORS must allow the Vercel domain.

---

## 10. Indexing Progress (Postgres Changes — replaces broadcast + SSE)

The backend simply updates the `indexing_jobs` row; Supabase Realtime
pushes the change to subscribed clients. No Python realtime client needed,
and progress survives a page refresh.

```python
# backend/services/indexing.py (inside the background task)
async def update_progress(job_id: str, progress: int, status: str = "running"):
    await db.execute(
        update(IndexingJob)
        .where(IndexingJob.id == job_id)
        .values(progress=progress, status=status)
    )
    await db.commit()
```

```typescript
// frontend/hooks/use-indexing-progress.ts
import { createClient } from "@/lib/supabase/client"

export function useIndexingProgress(repoId: string) {
  const supabase = createClient()
  const [job, setJob] = useState<IndexingJob | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(`indexing:${repoId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "indexing_jobs",
          filter: `repo_id=eq.${repoId}` },
        (payload) => setJob(payload.new as IndexingJob)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [repoId])

  return job
}
```

---

## 11. Supabase pg_cron (replaces Redis scheduler)

```sql
-- Requires pg_net extension (enable alongside pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Store config as database settings (run once):
ALTER DATABASE postgres SET app.api_url = 'https://day-one-api.onrender.com';
ALTER DATABASE postgres SET app.internal_secret = '<INTERNAL_SECRET>';

-- Check external APIs every 6 hours (Phase 3)
SELECT cron.schedule(
  'check-api-deprecations',
  '0 */6 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.api_url') || '/internal/check-apis',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.internal_secret')
      )
    );
  $$
);

-- Clean old chat messages (older than 90 days)
SELECT cron.schedule(
  'cleanup-old-chats',
  '0 0 * * 0',
  $$ DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '90 days'; $$
);
```

> Bonus: the every-6-hours ping also doubles as a keep-warm signal for the
> Render free instance, alongside the UptimeRobot monitor.

---

## 12. RAG Pipeline (direct, no LangChain storage)

```python
# backend/services/retriever.py — the whole "vector store" (~20 lines)
from sqlalchemy import text

async def retrieve_chunks(db, repo_id: str, query_embedding: list[float], k: int = 5):
    result = await db.execute(text("""
        SELECT file_path, content, metadata,
               1 - (embedding <=> :emb) AS similarity
        FROM repo_chunks
        WHERE repo_id = :repo_id
        ORDER BY embedding <=> :emb
        LIMIT :k
    """), {"emb": str(query_embedding), "repo_id": repo_id, "k": k})
    return result.mappings().all()
```

```python
# backend/services/rag.py
from fastembed import TextEmbedding
from groq import AsyncGroq
from config import settings

embedder = TextEmbedding("BAAI/bge-small-en-v1.5")  # 384 dims, ONNX, light
groq = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def answer_question(repo_id: str, body: AskRequest):
    [q_emb] = list(embedder.embed([body.question]))
    chunks = await retrieve_chunks(db, repo_id, q_emb.tolist())

    context = "\n\n".join(
        f"### {c['file_path']}\n```\n{c['content']}\n```" for c in chunks
    )
    stream = await groq.chat.completions.create(
        model=settings.GROQ_MODEL,          # config, NOT hardcoded —
        messages=[                          # Groq deprecates models fast
            {"role": "system", "content": RAG_SYSTEM_PROMPT},
            {"role": "user", "content": f"{context}\n\nQuestion: {body.question}"},
        ],
        stream=True,
    )
    async for chunk in stream:
        if delta := chunk.choices[0].delta.content:
            yield delta
    # sources (file_path + lines) saved to chat_messages after stream ends
```

---

## 13. Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=

# backend/.env
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
GROQ_API_KEY=
GROQ_MODEL=                       # check https://console.groq.com/docs/models
GITHUB_WEBHOOK_SECRET=
GITHUB_TOKEN=                     # optional server PAT for rate limits (public repos)
INTERNAL_SECRET=
FRONTEND_URL=http://localhost:3000
```

---

## 14. Pages Overview

### Landing (/)
- GSAP scroll-triggered hero section
- 8 feature cards with Framer Motion hover
- "How it works" — 3 step flow
- CTA: Connect your first repo

### Dashboard (/dashboard)
- Repo cards + index status badges
- Quick stats row
- Recent activity via Supabase Realtime

### Ask Repository (/dashboard/repos/[id]/ask)
- `useChat` from `@ai-sdk/react` (v5)
- Streaming responses from FastAPI
- Source citations per message
- Session history sidebar

### Architecture (/dashboard/repos/[id]/architecture) — Phase 2
- React Flow interactive graph
- D3.js dependency ring chart
- Node click → drawer with details

### API Intelligence (/dashboard/repos/[id]/apis) — Phase 3
- API inventory table
- Live status via Supabase Realtime
- pg_cron triggers background checks
- Deprecation alert banners

---

## 15. MVP Build Order (Phase 1 — 2 Weeks)

| # | Task | Stack Used |
|---|---|---|
| 1 | Project setup (frontend + backend folders) | Next.js 15 + FastAPI |
| 2 | Supabase project + schema + pgvector + triggers | SQL migrations |
| 3 | GitHub OAuth via Supabase Auth | Supabase Auth |
| 4 | Dashboard layout (sidebar, navbar) | Next.js + shadcn/ui |
| 5 | Connect repo — **public repos only** | FastAPI + PyGithub |
| 6 | Repo indexing (fetch → chunk → embed → pgvector) | FastAPI + fastembed |
| 7 | Indexing progress via indexing_jobs + Realtime | Postgres Changes |
| 8 | Ask Repository (RAG streaming chat) | Groq + AI SDK v5 |
| 9 | AI Onboarding (RAG with onboarding system prompt) | FastAPI streaming |
| 10 | Landing page | GSAP + Framer Motion |
| 11 | Deploy — Vercel + Render + Supabase + UptimeRobot | Deploy ($0) |

**Phase 2 (Month 2):** Architecture viz (React Flow + D3.js), Pattern
detection, Impact analysis, tree-sitter, GitHub App for private repos

**Phase 3 (Month 3):** Knowledge preservation, ADRs, API Intelligence + pg_cron

---

*Day One — Project Plan v3.1*
*Stack: Next.js 15 · FastAPI · Supabase · Groq · AI SDK v5 · fastembed*
*Deploy: Vercel + Render + Supabase Cloud — $0/month, no credit card*
*Built by Tempest*
