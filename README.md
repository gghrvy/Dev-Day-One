# Dev Day One

> Chat with your codebase. Understand it. Ship faster.

Dev Day One is an AI-powered knowledge assistant for GitHub repositories. Connect a repo, index your code with a single click, then ask questions in natural language, explore architecture graphs, generate ADRs, detect code patterns, and analyze feature impact — all from a clean dark dashboard.

![Next.js](https://img.shields.io/badge/Next.js_15-black?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_LLaMA_3.3_70B-F55036?logo=groq&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?logo=python&logoColor=white)

**[Live Demo](https://devdayone.vercel.app)** · **[Report a Bug](../../issues)**

---

## Features

- **Chat with your repo** — Ask anything about your codebase using RAG-powered retrieval backed by Groq LLaMA 3.3 70B. Responses include syntax-highlighted code snippets.
- **Architecture graph** — Auto-generated interactive node graph of your repo's component and module relationships, built with React Flow.
- **ADR management** — Generate, review, and track Architecture Decision Records through a full draft → proposed → accepted → deprecated workflow.
- **Pattern detection** — Identifies code patterns, anti-patterns, and structural issues across the entire repo.
- **Impact analysis** — Understands how changes in one part of the codebase ripple through others.
- **API intelligence** — Scans and documents every API endpoint in your repo automatically.
- **Knowledge base** — Semantic search over indexed code chunks using vector embeddings (FastEmbed).
- **Indexing history** — Full job history with status, timing, and per-repo re-index on demand.
- **Command palette** — `Ctrl+K` global search across repos, pages, and actions.

---

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Framer Motion |
| UI Components | React Query, AI SDK v5 (`useChat`), React Flow (`@xyflow/react`) |
| Backend | FastAPI, SQLAlchemy 2.0 async, asyncpg |
| Database / Auth | Supabase (PostgreSQL + pgvector), GitHub OAuth, Google OAuth |
| AI / LLM | Groq `llama-3.3-70b-versatile`, FastEmbed (vector embeddings) |
| Dev tooling | `node dev.js` — starts both frontend and backend in one command |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                   Browser                    │
│  Next.js App Router  ·  React Query          │
│  AI SDK v5 useChat   ·  React Flow graph     │
└───────────────┬─────────────────────────────┘
                │ REST + SSE streaming
┌───────────────▼─────────────────────────────┐
│              FastAPI Backend                 │
│  /repos  /chat  /architecture  /adrs         │
│  /patterns  /impact  /knowledge  /indexing   │
└──────┬───────────────────────┬──────────────┘
       │                       │
┌──────▼──────┐    ┌───────────▼──────────────┐
│  Supabase   │    │        Groq API           │
│  PostgreSQL │    │  llama-3.3-70b-versatile  │
│  pgvector   │    │  (chat + analysis)        │
│  Auth       │    └──────────────────────────┘
└─────────────┘
```

**Indexing pipeline:** GitHub repo → `github_parser` → `code_chunker` → `embeddings` (FastEmbed) → pgvector. Each file is chunked by logical boundaries, embedded, and stored for semantic retrieval.

**Chat pipeline:** User message → vector similarity search → top-k chunks as context → Groq LLM → streamed response with `useChat`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key
- A GitHub OAuth App (for GitHub login)
- A Google OAuth Client (for Google login)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/DevDayOne.git
cd DevDayOne
```

### 2. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && pip install -r requirements.txt
```

### 3. Configure environment variables

**`backend/.env`**
```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GITHUB_TOKEN=your_github_pat          # optional, increases rate limit
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run database migrations

Run the SQL files in `backend/migrations/` in order against your Supabase project via the SQL editor.

### 5. Start the dev server

```bash
# From the project root — starts both frontend and backend
node dev.js
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:8000`.

---

## Project Structure

```
DevDayOne/
├── frontend/                   # Next.js App Router
│   ├── app/
│   │   ├── (auth)/             # Login page
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   │   └── dashboard/
│   │   │       ├── repos/      # Repo list + per-repo detail
│   │   │       └── settings/   # Account settings
│   │   ├── admin/              # Admin panel
│   │   ├── terms/ privacy/     # Legal pages
│   │   └── layout.tsx
│   ├── components/
│   │   ├── chat/               # Chat UI, code blocks, follow-ups
│   │   ├── layout/             # Icon rail, sidebar, nav
│   │   └── ui/                 # Modal, command palette, toasts
│   └── lib/
│       ├── api.ts              # apiFetch wrapper
│       └── toast-bridge.ts     # Non-React toast emitter
│
├── backend/                    # FastAPI
│   ├── routers/                # Route handlers
│   │   ├── rag.py              # Chat / Q&A
│   │   ├── architecture.py     # Arch graph
│   │   ├── adrs.py             # ADR CRUD + workflow
│   │   ├── knowledge.py        # Semantic search
│   │   ├── patterns.py         # Pattern detection
│   │   ├── impact.py           # Impact analysis
│   │   ├── api_intel.py        # API endpoint scanner
│   │   └── indexing.py         # Index jobs
│   ├── services/               # Business logic
│   │   ├── github_parser.py    # Repo file fetching
│   │   ├── code_chunker.py     # Semantic code splitting
│   │   ├── embeddings.py       # FastEmbed vector generation
│   │   ├── retriever.py        # pgvector similarity search
│   │   ├── ai_stream.py        # Groq streaming wrapper
│   │   ├── arch_analyzer.py    # Architecture graph builder
│   │   ├── pattern_detector.py # Pattern analysis
│   │   └── impact_analyzer.py  # Change impact mapping
│   ├── migrations/             # SQL migration files
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   └── config.py               # Pydantic settings
│
├── docs/                       # Specs and implementation plans
└── dev.js                      # One-command dev launcher
```

---

## API Reference

The backend exposes a REST + SSE API at `http://localhost:8000`.  
Interactive docs available at `http://localhost:8000/docs` (Swagger UI).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/repos` | List connected repos |
| `POST` | `/repos` | Connect a new GitHub repo |
| `POST` | `/indexing/{repo_id}` | Trigger indexing job |
| `GET` | `/indexing/{repo_id}/history` | Indexing job history |
| `POST` | `/chat/{repo_id}` | Chat with a repo (streaming) |
| `GET` | `/architecture/{repo_id}` | Architecture graph nodes + edges |
| `GET` | `/adrs/{repo_id}` | List ADRs |
| `POST` | `/adrs/{repo_id}` | Generate new ADR |
| `PATCH` | `/adrs/{adr_id}` | Update ADR status |
| `GET` | `/knowledge/{repo_id}` | Semantic knowledge search |
| `GET` | `/patterns/{repo_id}` | Detected code patterns |
| `GET` | `/impact/{repo_id}` | Impact analysis |
| `GET` | `/api-intel/{repo_id}` | Scanned API endpoints |

---


## License

MIT
