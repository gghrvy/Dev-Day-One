# Day One — Phase 1 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Day One MVP — connect a public GitHub repo, index it into pgvector, and chat with it (Ask Repository + AI Onboarding) — deployed for $0/month.

**Architecture:** Next.js 15 frontend (Vercel) talks to a FastAPI backend (Render free tier) over REST with Supabase JWTs in the `Authorization` header. Supabase provides Postgres + pgvector, GitHub OAuth, and Realtime (Postgres Changes on `indexing_jobs`). RAG is a direct pipeline: fastembed → pgvector cosine search → Groq streaming, emitted in the Vercel AI SDK v5 SSE protocol.

**Tech Stack:** Next.js 15 (App Router, React 19, TypeScript), Tailwind v4, shadcn/ui, Framer Motion, GSAP, AI SDK v5 (`@ai-sdk/react`), Supabase JS (`@supabase/ssr`), FastAPI (Python 3.11+), SQLAlchemy 2.0 async + asyncpg, fastembed (`BAAI/bge-small-en-v1.5`, 384 dims), Groq, PyGithub, structlog, pytest.

**Spec:** `docs/superpowers/specs/2026-06-12-day-one-plan-design.md` (v3.1)

---

## Ground Rules (read first)

- **Git:** The user runs ALL git commands themselves. At every "Checkpoint — commit" step, STOP, tell the user the files changed and the suggested commit message, and wait. Never run `git add/commit/push`.
- **Shell:** Windows 11. Use PowerShell syntax (`.venv\Scripts\activate`, `;` not `&&`).
- **Working dir:** `c:\Codes\DevDayOne` — `frontend/` and `backend/` live at the repo root.
- **Secrets:** Never write real secrets into committed files. `.env` / `.env.local` are gitignored; the plan creates `.env.example` files with empty values.
- **Manual gates:** Tasks 2, 3, and 11 require the user to click around in Supabase / Render / Vercel dashboards. The plan says exactly what to do; pause and let the user do it.
- **Testing strategy:** Backend pure logic (chunker, SSE formatter, JWT decode, message parsing) is TDD with pytest. DB- and network-touching code is verified with exact `curl`/browser steps with expected output (no test DB on the free tier). Frontend is verified in the browser with explicit checks.
- **Deviations from spec (intentional, minor):** all IDs are `uuid` (not text cuid — native, simpler); `chat_sessions` table deferred — MVP persists to a flat `chat_messages` table; React Hook Form + Zod deferred until a form needs validation beyond "non-empty string" (YAGNI).

---

### Task 1: Project Setup (frontend + backend skeletons)

**Files:**
- Create: `frontend/` (via create-next-app), `frontend/.env.example`
- Create: `backend/main.py`, `backend/config.py`, `backend/utils/logger.py`, `backend/requirements.txt`, `backend/.env.example`, `backend/pytest.ini`, `backend/tests/conftest.py`, `backend/tests/test_health.py`
- Create: `.gitignore` (root)

- [ ] **Step 1: Root .gitignore**

```gitignore
# root .gitignore
node_modules/
.next/
.venv/
__pycache__/
*.pyc
.env
.env.local
.env*.local
.pytest_cache/
.DS_Store
```

- [ ] **Step 2: Scaffold Next.js 15 frontend**

Run from repo root:
```powershell
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --turbopack
```
Accept defaults for anything else it asks. Expected: `frontend/` exists with `app/`, `next.config.ts`, Tailwind v4 (`@import "tailwindcss"` in `app/globals.css`, no `tailwind.config.ts`).

- [ ] **Step 3: Install frontend dependencies**

```powershell
cd frontend
npm install @supabase/supabase-js @supabase/ssr ai @ai-sdk/react framer-motion gsap zustand @tanstack/react-query lucide-react
npx shadcn@latest init
```
For shadcn init: style **New York**, base color **Zinc**, CSS variables **yes**. Then:
```powershell
npx shadcn@latest add button card input badge avatar progress separator skeleton
```

- [ ] **Step 4: Verify frontend dev server**

Run: `npm run dev` (inside `frontend/`). Open http://localhost:3000 — default Next.js page renders. Stop the server.

- [ ] **Step 5: Frontend env example**

Create `frontend/.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Copy it to `frontend/.env.local` (user fills values in Task 2/3).

- [ ] **Step 6: Backend skeleton — requirements + venv**

Create `backend/requirements.txt`:
```
fastapi
uvicorn[standard]
sqlalchemy[asyncio]
asyncpg
pydantic-settings
python-jose[cryptography]
PyGithub
httpx
fastembed
groq
structlog
pytest
pytest-asyncio
```

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```
Expected: installs cleanly on Python 3.11+ (fastembed pulls onnxruntime, ~100MB — fine).

- [ ] **Step 7: Backend config**

Create `backend/config.py`:
```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    GROQ_API_KEY: str
    GROQ_MODEL: str
    GITHUB_TOKEN: str = ""
    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
```

Create `backend/.env.example`:
```bash
# Supabase "Session pooler" URI (port 5432), scheme changed to postgresql+asyncpg://
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
GROQ_API_KEY=
GROQ_MODEL=
GITHUB_TOKEN=
FRONTEND_URL=http://localhost:3000
```
Copy to `backend/.env`.

- [ ] **Step 8: Logger util**

Create `backend/utils/__init__.py` (empty) and `backend/utils/logger.py`:
```python
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)


def get_logger(name: str):
    return structlog.get_logger(name)
```

- [ ] **Step 9: Write the failing health test**

Create `backend/pytest.ini`:
```ini
[pytest]
asyncio_mode = auto
```

Create `backend/tests/__init__.py` (empty) and `backend/tests/conftest.py`:
```python
import os

# Set BEFORE any app import so config.Settings() never fails in CI/tests.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-secret")
os.environ.setdefault("GROQ_API_KEY", "test-key")
os.environ.setdefault("GROQ_MODEL", "test-model")
```

Create `backend/tests/test_health.py`:
```python
from fastapi.testclient import TestClient

from main import app


def test_health():
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

Run: `pytest tests/test_health.py -v` (from `backend/`, venv active).
Expected: FAIL — `ModuleNotFoundError: No module named 'main'`.

- [ ] **Step 10: Implement main.py**

Create `backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from utils.logger import get_logger

log = get_logger(__name__)

app = FastAPI(title="Day One API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 11: Run test to verify it passes**

Run: `pytest tests/test_health.py -v`
Expected: `1 passed`.

- [ ] **Step 12: Verify server boots**

Run: `uvicorn main:app --reload` — open http://localhost:8000/health → `{"status":"ok"}`. Stop it.

- [ ] **Step 13: Checkpoint — commit (user)**

Tell the user: frontend scaffold + backend skeleton ready. Suggested message: `feat: scaffold Next.js 15 frontend and FastAPI backend skeleton`.

---

### Task 2: Supabase Project + Schema + pgvector + Triggers

**Files:**
- Create: `backend/migrations/001_initial.sql`

**Manual prerequisite (user):** Create a free project at https://supabase.com (org → New project, region close to user, save the DB password). Then fill in:
- `frontend/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
- `backend/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (same page), `SUPABASE_JWT_SECRET` (Project Settings → API → JWT Settings → JWT Secret), `DATABASE_URL` = the **Session pooler** connection string (Connect → Session pooler, port 5432) with scheme changed from `postgresql://` to `postgresql+asyncpg://`.

> Why session pooler: asyncpg's prepared statements break behind the transaction pooler (port 6543). Session mode (5432) works unmodified.

- [ ] **Step 1: Write the migration file**

Create `backend/migrations/001_initial.sql`:
```sql
-- Day One — initial schema (run in Supabase SQL Editor)
create extension if not exists vector;

-- ── Core tables ────────────────────────────────────────────────
create table organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  avatar_url text,
  org_id     uuid references organizations(id),
  created_at timestamptz default now()
);

create table repositories (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  full_name   text not null,            -- owner/repo
  github_url  text,
  github_id   bigint unique,
  description text,
  is_private  boolean default false,    -- MVP: public only
  indexed     boolean default false,
  indexed_at  timestamptz,
  created_at  timestamptz default now()
);

create table indexing_jobs (
  id          uuid primary key default gen_random_uuid(),
  repo_id     uuid not null references repositories(id) on delete cascade,
  status      text not null default 'pending',  -- pending|running|done|failed
  progress    int  not null default 0,          -- 0-100
  error       text,
  started_at  timestamptz default now(),
  finished_at timestamptz
);

create table repo_chunks (
  id         uuid primary key default gen_random_uuid(),
  repo_id    uuid not null references repositories(id) on delete cascade,
  file_path  text not null,
  content    text not null,
  embedding  vector(384),
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);
create index on repo_chunks using hnsw (embedding vector_cosine_ops);

create table chat_messages (
  id         uuid primary key default gen_random_uuid(),
  repo_id    uuid not null references repositories(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  mode       text not null default 'ask',   -- ask|onboard
  role       text not null,                 -- user|assistant
  content    text not null,
  sources    jsonb default '[]',
  created_at timestamptz default now()
);

-- ── auth.users → public.users + personal org (trigger) ────────
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare new_org_id uuid;
begin
  insert into organizations (name)
  values (coalesce(new.raw_user_meta_data->>'user_name', new.email, 'personal'))
  returning id into new_org_id;

  insert into users (id, email, avatar_url, org_id)
  values (new.id, new.email, new.raw_user_meta_data->>'avatar_url', new_org_id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS (protects direct frontend→Supabase reads only;
--        FastAPI uses service-role key which BYPASSES RLS) ─────
alter table organizations enable row level security;
alter table users         enable row level security;
alter table repositories  enable row level security;
alter table indexing_jobs enable row level security;
alter table repo_chunks   enable row level security;
alter table chat_messages enable row level security;

create policy "read own user" on users
  for select to authenticated using (id = auth.uid());

create policy "read own org" on organizations
  for select to authenticated
  using (id in (select org_id from users where id = auth.uid()));

create policy "read own org repos" on repositories
  for select to authenticated
  using (org_id in (select org_id from users where id = auth.uid()));

create policy "read own org jobs" on indexing_jobs
  for select to authenticated
  using (repo_id in (
    select r.id from repositories r
    join users u on u.org_id = r.org_id
    where u.id = auth.uid()
  ));
-- repo_chunks / chat_messages: no policies → no direct frontend access. Intentional.

-- ── Realtime: stream indexing_jobs updates to the frontend ────
alter publication supabase_realtime add table indexing_jobs;
```

- [ ] **Step 2: Run the migration (user)**

User pastes the whole file into Supabase **SQL Editor** → Run. Expected: "Success. No rows returned".

- [ ] **Step 3: Verify schema**

In SQL Editor run:
```sql
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
```
Expected rows: `chat_messages, indexing_jobs, organizations, repo_chunks, repositories, users`.

- [ ] **Step 4: Verify trigger fires**

In SQL Editor:
```sql
select tgname from pg_trigger where tgname = 'on_auth_user_created';
```
Expected: 1 row. (Real end-to-end check happens after OAuth login in Task 3.)

- [ ] **Step 5: Checkpoint — commit (user)**

Suggested message: `feat: add Supabase initial schema migration (pgvector, RLS, realtime)`.

---

### Task 3: GitHub OAuth via Supabase Auth

**Files:**
- Create: `frontend/lib/supabase/client.ts`, `frontend/lib/supabase/server.ts`
- Create: `frontend/middleware.ts`
- Create: `frontend/app/(auth)/login/page.tsx`
- Create: `frontend/app/auth/callback/route.ts`

**Manual prerequisite (user):**
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App. Homepage `http://localhost:3000`; callback URL = the one Supabase shows under Authentication → Sign In / Providers → GitHub (looks like `https://<ref>.supabase.co/auth/v1/callback`).
2. In Supabase, enable the GitHub provider and paste Client ID + Secret.
3. Supabase → Authentication → URL Configuration: Site URL `http://localhost:3000`, add redirect URL `http://localhost:3000/auth/callback`.

- [ ] **Step 1: Browser Supabase client**

Create `frontend/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Server Supabase client**

Create `frontend/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // called from a Server Component — middleware refreshes sessions
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Auth middleware**

Create `frontend/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return response
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

- [ ] **Step 4: Login page**

Create `frontend/app/(auth)/login/page.tsx`:
```tsx
"use client"

import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const signIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-white/[0.08] bg-[#1C1C1F] p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Day One</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Every developer, ready from day one.
          </p>
        </div>
        <Button onClick={signIn} className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-600">
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: OAuth callback route**

Create `frontend/app/auth/callback/route.ts`:
```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

- [ ] **Step 6: Verify the full flow (browser)**

Run `npm run dev`. Visit http://localhost:3000/dashboard → expect redirect to `/login` (404 on /dashboard is fine until Task 4 — the redirect is what matters... actually middleware redirects BEFORE 404, so you land on /login). Click **Continue with GitHub** → GitHub consent → land on `/dashboard` (404 page for now — that's expected, route arrives in Task 4).

- [ ] **Step 7: Verify trigger created the user + org**

Supabase SQL Editor:
```sql
select u.email, o.name as org from users u join organizations o on o.id = u.org_id;
```
Expected: 1 row with your GitHub email/username.

- [ ] **Step 8: Checkpoint — commit (user)**

Suggested message: `feat: GitHub OAuth via Supabase Auth (login, callback, middleware)`.

---

### Task 4: Dashboard Layout + Dawn Theme

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/app/layout.tsx`
- Create: `frontend/components/layout/sidebar.tsx`, `frontend/components/layout/navbar.tsx`
- Create: `frontend/app/(dashboard)/layout.tsx`, `frontend/app/(dashboard)/dashboard/page.tsx`
- Create: `frontend/components/providers.tsx`, `frontend/types/index.ts`

- [ ] **Step 1: Dawn theme tokens**

In `frontend/app/globals.css`, after the `@import "tailwindcss";` line (keep everything shadcn generated), append:
```css
@theme {
  --color-dawn-bg: #09090B;
  --color-dawn-bg2: #18181B;
  --color-dawn-bg3: #27272A;
  --color-dawn-card: #1C1C1F;
  --color-dawn-text: #FAFAFA;
  --color-dawn-text2: #A1A1AA;
  --color-dawn-muted: #71717A;
  --color-dawn-accent: #F59E0B;
  --color-dawn-accent-hover: #D97706;
  --color-dawn-ai: #6366F1;
  --color-dawn-border: rgba(255, 255, 255, 0.08);
}

body {
  background-color: var(--color-dawn-bg);
  color: var(--color-dawn-text);
}
```

- [ ] **Step 2: Fonts + root layout**

Replace `frontend/app/layout.tsx`:
```tsx
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Day One — Every developer, ready from day one",
  description: "The knowledge and architecture layer for software teams.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Shared types**

Create `frontend/types/index.ts`:
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
  error: string | null
}
```

- [ ] **Step 4: React Query provider**

Create `frontend/components/providers.tsx`:
```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

- [ ] **Step 5: Sidebar**

Create `frontend/components/layout/sidebar.tsx`:
```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderGit2 } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/repos", label: "Repositories", icon: FolderGit2 },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.08] bg-[#09090B]">
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight text-zinc-50">
          Day One
        </Link>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50",
              pathname === href && "bg-zinc-900 text-zinc-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 6: Navbar (user avatar + sign out)**

Create `frontend/components/layout/navbar.tsx`:
```tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAvatarUrl(user?.user_metadata?.avatar_url ?? null)
    })
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b border-white/[0.08] px-6">
      <Avatar className="h-7 w-7">
        {avatarUrl && <AvatarImage src={avatarUrl} />}
        <AvatarFallback>D1</AvatarFallback>
      </Avatar>
      <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
        <LogOut className="h-4 w-4 text-zinc-400" />
      </Button>
    </header>
  )
}
```

- [ ] **Step 7: Dashboard layout + landing stub page**

Create `frontend/app/(dashboard)/layout.tsx`:
```tsx
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Providers } from "@/components/providers"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-[#09090B]">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
```

Create `frontend/app/(dashboard)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Connect a repository to get started.
      </p>
    </div>
  )
}
```

Also delete the default content of `frontend/app/page.tsx` and replace with a stub (full landing comes in Task 10):
```tsx
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link href="/login" className="text-amber-500 underline">
        Day One — sign in
      </Link>
    </main>
  )
}
```

- [ ] **Step 8: Verify in browser**

`npm run dev` → log in → http://localhost:3000/dashboard shows sidebar (Day One, Dashboard, Repositories), navbar with your GitHub avatar, dark Dawn background. Sign-out button returns you to `/login`.

- [ ] **Step 9: Checkpoint — commit (user)**

Suggested message: `feat: dashboard layout with Dawn theme, sidebar, navbar`.

---

### Task 5: Connect Repo (backend CRUD + frontend pages)

**Files:**
- Create: `backend/database.py`, `backend/auth.py`
- Create: `backend/models/__init__.py`, `backend/models/core.py`
- Create: `backend/schemas/__init__.py`, `backend/schemas/repo.py`
- Create: `backend/routers/__init__.py`, `backend/routers/repos.py`
- Modify: `backend/main.py`
- Test: `backend/tests/test_auth.py`
- Create: `frontend/lib/api/client.ts`, `frontend/components/repos/repo-card.tsx`, `frontend/components/repos/connect-repo.tsx`
- Create: `frontend/app/(dashboard)/repos/page.tsx`, `frontend/app/(dashboard)/repos/new/page.tsx`

- [ ] **Step 1: Database engine + session**

Create `backend/database.py`:
```python
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db():
    async with SessionLocal() as session:
        yield session
```

- [ ] **Step 2: SQLAlchemy models (match the SQL migration exactly)**

Create `backend/models/__init__.py`:
```python
from models.core import ChatMessage, IndexingJob, Organization, Repository, User

__all__ = ["Organization", "User", "Repository", "IndexingJob", "ChatMessage"]
```

Create `backend/models/core.py`:
```python
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
```

- [ ] **Step 3: Write failing JWT decode test**

Create `backend/tests/test_auth.py`:
```python
import pytest
from fastapi import HTTPException
from jose import jwt

from auth import decode_token

SECRET = "test-secret"  # matches conftest SUPABASE_JWT_SECRET


def make_token(sub: str = "11111111-1111-1111-1111-111111111111", aud: str = "authenticated") -> str:
    return jwt.encode({"sub": sub, "aud": aud}, SECRET, algorithm="HS256")


def test_valid_token_returns_sub():
    assert decode_token(make_token()) == "11111111-1111-1111-1111-111111111111"


def test_wrong_audience_rejected():
    with pytest.raises(HTTPException) as exc:
        decode_token(make_token(aud="anon"))
    assert exc.value.status_code == 401


def test_garbage_token_rejected():
    with pytest.raises(HTTPException) as exc:
        decode_token("not-a-jwt")
    assert exc.value.status_code == 401
```

Run: `pytest tests/test_auth.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'auth'`.

- [ ] **Step 4: Implement auth.py**

Create `backend/auth.py`:
```python
import uuid

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Repository, User

bearer = HTTPBearer()


def decode_token(token: str) -> str:
    """Validate a Supabase JWT and return the user id (sub claim)."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload["sub"]
    except (JWTError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    user_id = decode_token(creds.credentials)
    user = await db.get(User, uuid.UUID(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_owned_repo(repo_id: str, user: User, db: AsyncSession) -> Repository:
    """Service-role key bypasses RLS — ownership MUST be checked here."""
    try:
        rid = uuid.UUID(repo_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Repository not found")
    repo = await db.get(Repository, rid)
    if repo is None or repo.org_id != user.org_id:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo
```

- [ ] **Step 5: Run auth tests**

Run: `pytest tests/test_auth.py -v`
Expected: `3 passed`.

- [ ] **Step 6: Repo schemas**

Create `backend/schemas/__init__.py` (empty) and `backend/schemas/repo.py`:
```python
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
```

- [ ] **Step 7: Repos router**

Create `backend/routers/__init__.py` (empty) and `backend/routers/repos.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from github import Github, UnknownObjectException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from config import settings
from database import get_db
from models import Repository, User
from schemas.repo import ConnectRepoRequest, RepoResponse

router = APIRouter(prefix="/repos", tags=["repos"])


@router.get("", response_model=list[RepoResponse])
async def list_repos(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Repository)
        .where(Repository.org_id == user.org_id)
        .order_by(Repository.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=RepoResponse, status_code=201)
async def connect_repo(
    body: ConnectRepoRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    gh = Github(settings.GITHUB_TOKEN or None)
    try:
        gh_repo = gh.get_repo(body.full_name)
    except UnknownObjectException:
        raise HTTPException(404, "Repository not found on GitHub (is it public?)")
    if gh_repo.private:
        raise HTTPException(400, "Private repositories are not supported yet")

    existing = await db.execute(
        select(Repository).where(
            Repository.org_id == user.org_id,
            Repository.github_id == gh_repo.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Repository already connected")

    repo = Repository(
        org_id=user.org_id,
        name=gh_repo.name,
        full_name=gh_repo.full_name,
        github_url=gh_repo.html_url,
        github_id=gh_repo.id,
        description=gh_repo.description,
        is_private=False,
    )
    db.add(repo)
    await db.commit()
    await db.refresh(repo)
    return repo


@router.get("/{repo_id}", response_model=RepoResponse)
async def get_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_owned_repo(repo_id, user, db)


@router.delete("/{repo_id}", status_code=204)
async def delete_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = await get_owned_repo(repo_id, user, db)
    await db.delete(repo)
    await db.commit()
```

In `backend/main.py`, add after the CORS middleware block:
```python
from routers import repos as repos_router

app.include_router(repos_router.router)
```

- [ ] **Step 8: Smoke-test against real Supabase**

Run `uvicorn main:app --reload`. Get a real token: in the browser devtools console on http://localhost:3000/dashboard (logged in):
```javascript
JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.endsWith("-auth-token")))).access_token
```
Then (PowerShell):
```powershell
$token = "<paste token>"
curl -s -H "Authorization: Bearer $token" http://localhost:8000/repos
```
Expected: `[]`. Then connect a repo:
```powershell
curl -s -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{\"full_name\": \"fastapi/fastapi\"}' http://localhost:8000/repos
```
Expected: 201 JSON with `"full_name": "fastapi/fastapi"`, `"indexed": false`. Repeat → 409. No token → 403/401.

- [ ] **Step 9: Frontend API client**

Create `frontend/lib/api/client.ts`:
```typescript
import { createClient } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")
  return session.access_token
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })
  if (res.status === 204) return undefined as T
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(body.detail ?? "Request failed")
  }
  return res.json()
}
```

- [ ] **Step 10: Repo card + repos list page**

Create `frontend/components/repos/repo-card.tsx`:
```tsx
import Link from "next/link"
import { FolderGit2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Repository } from "@/types"

export function RepoCard({ repo }: { repo: Repository }) {
  return (
    <Link
      href={`/dashboard/repos/${repo.id}`}
      className="block rounded-lg border border-white/[0.08] bg-[#1C1C1F] p-4 transition-colors hover:border-white/[0.15]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-zinc-50">{repo.full_name}</span>
        </div>
        <Badge variant={repo.indexed ? "default" : "secondary"}>
          {repo.indexed ? "Indexed" : "Not indexed"}
        </Badge>
      </div>
      {repo.description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{repo.description}</p>
      )}
    </Link>
  )
}
```

Create `frontend/app/(dashboard)/repos/page.tsx`:
```tsx
"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api/client"
import { RepoCard } from "@/components/repos/repo-card"
import type { Repository } from "@/types"

export default function ReposPage() {
  const { data: repos, isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Repositories</h1>
        <Button asChild className="bg-amber-500 text-zinc-950 hover:bg-amber-600">
          <Link href="/dashboard/repos/new">
            <Plus className="mr-1.5 h-4 w-4" /> Connect repo
          </Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        {repos?.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
        {repos?.length === 0 && (
          <p className="text-sm text-zinc-400">No repositories yet. Connect one to start.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 11: Connect repo form + page**

Create `frontend/components/repos/connect-repo.tsx`:
```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api/client"
import type { Repository } from "@/types"

export function ConnectRepo() {
  const [fullName, setFullName] = useState("")
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (full_name: string) =>
      apiFetch<Repository>("/repos", {
        method: "POST",
        body: JSON.stringify({ full_name }),
      }),
    onSuccess: (repo) => {
      queryClient.invalidateQueries({ queryKey: ["repos"] })
      router.push(`/dashboard/repos/${repo.id}`)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (fullName.trim()) mutation.mutate(fullName.trim())
      }}
      className="max-w-md space-y-4"
    >
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Public GitHub repository
        </label>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="owner/repo  (e.g. vercel/next.js)"
          className="mt-1.5"
        />
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
      )}
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="bg-amber-500 text-zinc-950 hover:bg-amber-600"
      >
        {mutation.isPending ? "Connecting…" : "Connect repository"}
      </Button>
      <p className="text-xs text-zinc-500">
        Private repositories are coming in a later release.
      </p>
    </form>
  )
}
```

Create `frontend/app/(dashboard)/repos/new/page.tsx`:
```tsx
import { ConnectRepo } from "@/components/repos/connect-repo"

export default function NewRepoPage() {
  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">Connect a repository</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">
        Day One indexes the code so you can ask it anything.
      </p>
      <ConnectRepo />
    </div>
  )
}
```

- [ ] **Step 12: Verify in browser**

With both servers running: Repositories page lists `fastapi/fastapi` (from Step 8). Connect another repo via the form (e.g. `pallets/flask`) → redirected to `/dashboard/repos/<id>` (404 for now — repo detail page arrives in Task 7). List shows both.

- [ ] **Step 13: Checkpoint — commit (user)**

Suggested message: `feat: connect public GitHub repos (FastAPI CRUD + repos UI)`.

---

### Task 6: Repo Indexing (fetch → chunk → embed → pgvector)

**Files:**
- Create: `backend/services/__init__.py`, `backend/services/code_chunker.py`, `backend/services/github_parser.py`, `backend/services/embeddings.py`, `backend/services/indexing.py`
- Create: `backend/routers/indexing.py`
- Modify: `backend/main.py`
- Test: `backend/tests/test_code_chunker.py`

- [ ] **Step 1: Write failing chunker tests**

Create `backend/services/__init__.py` (empty) and `backend/tests/test_code_chunker.py`:
```python
from services.code_chunker import CHUNK_LINES, OVERLAP_LINES, chunk_file


def test_empty_file_yields_no_chunks():
    assert chunk_file("a.py", "") == []


def test_short_file_yields_single_chunk():
    content = "line1\nline2\nline3"
    chunks = chunk_file("a.py", content)
    assert len(chunks) == 1
    assert chunks[0]["content"] == content
    assert chunks[0]["file_path"] == "a.py"
    assert chunks[0]["metadata"] == {"start_line": 1, "end_line": 3}


def test_long_file_chunks_with_overlap():
    lines = [f"line{i}" for i in range(1, 121)]  # 120 lines
    chunks = chunk_file("b.py", "\n".join(lines))
    assert len(chunks) == 3  # 1-60, 51-110, 101-120 (step = 60-10 = 50)
    assert chunks[0]["metadata"] == {"start_line": 1, "end_line": 60}
    assert chunks[1]["metadata"] == {"start_line": 51, "end_line": 110}
    assert chunks[2]["metadata"] == {"start_line": 101, "end_line": 120}
    # overlap: last OVERLAP_LINES of chunk 0 == first OVERLAP_LINES of chunk 1
    tail = chunks[0]["content"].splitlines()[-OVERLAP_LINES:]
    head = chunks[1]["content"].splitlines()[:OVERLAP_LINES]
    assert tail == head


def test_exact_chunk_size_single_chunk():
    lines = [f"l{i}" for i in range(CHUNK_LINES)]
    chunks = chunk_file("c.py", "\n".join(lines))
    assert len(chunks) == 1
```

Run: `pytest tests/test_code_chunker.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'services.code_chunker'`.

- [ ] **Step 2: Implement chunker**

Create `backend/services/code_chunker.py`:
```python
CHUNK_LINES = 60
OVERLAP_LINES = 10


def chunk_file(file_path: str, content: str) -> list[dict]:
    """Split file content into overlapping line-window chunks."""
    lines = content.splitlines()
    if not lines:
        return []
    chunks = []
    step = CHUNK_LINES - OVERLAP_LINES
    for start in range(0, len(lines), step):
        window = lines[start : start + CHUNK_LINES]
        chunks.append({
            "file_path": file_path,
            "content": "\n".join(window),
            "metadata": {"start_line": start + 1, "end_line": start + len(window)},
        })
        if start + CHUNK_LINES >= len(lines):
            break
    return chunks
```

- [ ] **Step 3: Run chunker tests**

Run: `pytest tests/test_code_chunker.py -v`
Expected: `4 passed`.

- [ ] **Step 4: GitHub tarball fetcher**

> Design note: PyGithub is used for repo metadata (Task 5); file CONTENT comes from one tarball download — a single HTTP request instead of one API call per file, which would burn the 60 req/h unauthenticated rate limit on any real repo.

Create `backend/services/github_parser.py`:
```python
import io
import os
import tarfile

import httpx

from config import settings

ALLOWED_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java", ".rb",
    ".md", ".sql", ".json", ".yaml", ".yml", ".toml", ".css", ".html",
}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", "__pycache__", ".next", "vendor", ".venv"}
MAX_FILE_BYTES = 100_000


async def fetch_repo_files(full_name: str) -> list[tuple[str, str]]:
    """Download a public repo's default-branch tarball; return (path, content) pairs."""
    url = f"https://api.github.com/repos/{full_name}/tarball"
    headers = {"Authorization": f"Bearer {settings.GITHUB_TOKEN}"} if settings.GITHUB_TOKEN else {}
    async with httpx.AsyncClient(follow_redirects=True, timeout=120) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()

    files: list[tuple[str, str]] = []
    with tarfile.open(fileobj=io.BytesIO(resp.content), mode="r:gz") as tar:
        for member in tar.getmembers():
            if not member.isfile() or member.size > MAX_FILE_BYTES:
                continue
            parts = member.name.split("/")[1:]  # strip "<owner>-<repo>-<sha>/" prefix
            if not parts or any(p in SKIP_DIRS for p in parts):
                continue
            path = "/".join(parts)
            if os.path.splitext(path)[1].lower() not in ALLOWED_EXTENSIONS:
                continue
            fobj = tar.extractfile(member)
            if fobj is None:
                continue
            try:
                content = fobj.read().decode("utf-8")
            except UnicodeDecodeError:
                continue
            files.append((path, content))
    return files
```

- [ ] **Step 5: Embeddings wrapper**

Create `backend/services/embeddings.py`:
```python
from fastembed import TextEmbedding

_model: TextEmbedding | None = None


def get_embedder() -> TextEmbedding:
    """Lazy singleton — model download (~70MB) happens on first call, not import."""
    global _model
    if _model is None:
        _model = TextEmbedding("BAAI/bge-small-en-v1.5")  # 384 dims — matches vector(384)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [e.tolist() for e in get_embedder().embed(texts)]
```

- [ ] **Step 6: Indexing background service**

Create `backend/services/indexing.py`:
```python
import json
from datetime import datetime, timezone

from sqlalchemy import text, update

from database import SessionLocal
from models import IndexingJob, Repository
from services.code_chunker import chunk_file
from services.embeddings import embed_texts
from services.github_parser import fetch_repo_files
from utils.logger import get_logger

log = get_logger(__name__)

EMBED_BATCH = 64


async def _set_job(db, job_id, **values):
    await db.execute(update(IndexingJob).where(IndexingJob.id == job_id).values(**values))
    await db.commit()


async def run_indexing(job_id: str, repo_id: str, full_name: str) -> None:
    """Background task: fetch → chunk → embed → insert. Owns its DB session."""
    async with SessionLocal() as db:
        try:
            await _set_job(db, job_id, status="running", progress=5)

            files = await fetch_repo_files(full_name)
            await _set_job(db, job_id, progress=20)

            chunks = [c for path, content in files for c in chunk_file(path, content)]
            if not chunks:
                raise ValueError("No indexable files found in repository")
            await _set_job(db, job_id, progress=30)

            # Re-index safety: clear previous chunks
            await db.execute(text("DELETE FROM repo_chunks WHERE repo_id = :rid"), {"rid": repo_id})
            await db.commit()

            for i in range(0, len(chunks), EMBED_BATCH):
                batch = chunks[i : i + EMBED_BATCH]
                vectors = embed_texts([c["content"] for c in batch])
                await db.execute(
                    text("""
                        INSERT INTO repo_chunks (repo_id, file_path, content, embedding, metadata)
                        VALUES (:repo_id, :file_path, :content, CAST(:embedding AS vector), CAST(:metadata AS jsonb))
                    """),
                    [
                        {
                            "repo_id": repo_id,
                            "file_path": c["file_path"],
                            "content": c["content"],
                            "embedding": json.dumps(v),
                            "metadata": json.dumps(c["metadata"]),
                        }
                        for c, v in zip(batch, vectors)
                    ],
                )
                await db.commit()
                progress = 30 + int(60 * min(1.0, (i + EMBED_BATCH) / len(chunks)))
                await _set_job(db, job_id, progress=progress)

            await db.execute(
                update(Repository)
                .where(Repository.id == repo_id)
                .values(indexed=True, indexed_at=datetime.now(timezone.utc))
            )
            await _set_job(
                db, job_id, status="done", progress=100,
                finished_at=datetime.now(timezone.utc),
            )
            log.info("indexing_done", repo=full_name, chunks=len(chunks))
        except Exception as exc:
            log.error("indexing_failed", repo=full_name, error=str(exc))
            await _set_job(
                db, job_id, status="failed", error=str(exc)[:500],
                finished_at=datetime.now(timezone.utc),
            )
```

- [ ] **Step 7: Indexing router**

Create `backend/routers/indexing.py`:
```python
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import IndexingJob, User
from services.indexing import run_indexing

router = APIRouter(prefix="/repos", tags=["indexing"])


@router.post("/{repo_id}/index", status_code=202)
async def trigger_indexing(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = await get_owned_repo(repo_id, user, db)
    job = IndexingJob(id=uuid.uuid4(), repo_id=repo.id)
    db.add(job)
    await db.commit()
    background_tasks.add_task(run_indexing, str(job.id), str(repo.id), repo.full_name)
    return {"job_id": str(job.id)}
```

In `backend/main.py`, extend the router imports:
```python
from routers import indexing as indexing_router
from routers import repos as repos_router

app.include_router(repos_router.router)
app.include_router(indexing_router.router)
```

- [ ] **Step 8: End-to-end indexing smoke test**

With uvicorn running (first run downloads the fastembed model — allow a minute). Pick a SMALL repo for speed; connect `octocat/Hello-World` is too tiny (no allowed files) — use e.g. `tiangolo/fastapi`'s smaller cousin or your own small repo; `pallets/click` is a good size.
```powershell
$token = "<paste token>"
$repo = curl -s -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{\"full_name\": \"pallets/click\"}' http://localhost:8000/repos | ConvertFrom-Json
curl -s -X POST -H "Authorization: Bearer $token" "http://localhost:8000/repos/$($repo.id)/index"
```
Expected: `{"job_id": "..."}` immediately. Then in Supabase SQL Editor (repeat until done):
```sql
select status, progress, error from indexing_jobs order by started_at desc limit 1;
select count(*) from repo_chunks;
```
Expected: status walks `running` → `done`, progress hits 100, `repo_chunks` count > 100, and `repositories.indexed` = true for that repo.

- [ ] **Step 9: Checkpoint — commit (user)**

Suggested message: `feat: repo indexing pipeline (tarball fetch, chunking, fastembed, pgvector)`.

---

### Task 7: Indexing Progress UI (Supabase Realtime)

**Files:**
- Create: `frontend/hooks/use-indexing-progress.ts`
- Create: `frontend/components/repos/indexing-progress.tsx`
- Create: `frontend/app/(dashboard)/repos/[id]/layout.tsx`, `frontend/app/(dashboard)/repos/[id]/page.tsx`
- Create: `frontend/components/layout/repo-tabs.tsx`

- [ ] **Step 1: Realtime hook**

Create `frontend/hooks/use-indexing-progress.ts`:
```typescript
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { IndexingJob } from "@/types"

export function useIndexingProgress(repoId: string) {
  const [job, setJob] = useState<IndexingJob | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Pick up an in-flight job on mount (progress survives refresh)
    supabase
      .from("indexing_jobs")
      .select("*")
      .eq("repo_id", repoId)
      .order("started_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setJob(data[0] as IndexingJob)
      })

    const channel = supabase
      .channel(`indexing:${repoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "indexing_jobs",
          filter: `repo_id=eq.${repoId}`,
        },
        (payload) => setJob(payload.new as IndexingJob)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [repoId])

  return job
}
```

- [ ] **Step 2: Progress component**

Create `frontend/components/repos/indexing-progress.tsx`:
```tsx
"use client"

import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { apiFetch } from "@/lib/api/client"
import { useIndexingProgress } from "@/hooks/use-indexing-progress"

export function IndexingProgress({ repoId, indexed }: { repoId: string; indexed: boolean }) {
  const job = useIndexingProgress(repoId)
  const queryClient = useQueryClient()
  const prevStatus = useRef<string | undefined>(undefined)

  const start = useMutation({
    mutationFn: () => apiFetch(`/repos/${repoId}/index`, { method: "POST" }),
  })

  useEffect(() => {
    if (prevStatus.current === "running" && job?.status === "done") {
      queryClient.invalidateQueries({ queryKey: ["repo", repoId] })
      queryClient.invalidateQueries({ queryKey: ["repos"] })
    }
    prevStatus.current = job?.status
  }, [job?.status, queryClient, repoId])

  const running = job?.status === "running" || job?.status === "pending" || start.isPending

  return (
    <div className="space-y-3 rounded-lg border border-white/[0.08] bg-[#1C1C1F] p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-50">Index</span>
        <Button
          size="sm"
          disabled={running}
          onClick={() => start.mutate()}
          className="bg-amber-500 text-zinc-950 hover:bg-amber-600"
        >
          {running ? "Indexing…" : indexed ? "Re-index" : "Index repository"}
        </Button>
      </div>
      {running && job && (
        <div className="space-y-1.5">
          <Progress value={job.progress} />
          <p className="text-xs text-zinc-500">{job.progress}% — {job.status}</p>
        </div>
      )}
      {job?.status === "failed" && (
        <p className="text-sm text-red-500">Indexing failed: {job.error}</p>
      )}
      {job?.status === "done" && <p className="text-sm text-emerald-500">Indexed ✓</p>}
    </div>
  )
}
```

- [ ] **Step 3: Repo tabs + detail layout**

Create `frontend/components/layout/repo-tabs.tsx`:
```tsx
"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { segment: "", label: "Overview" },
  { segment: "/ask", label: "Ask" },
  { segment: "/onboard", label: "Onboard" },
]

export function RepoTabs() {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const base = `/dashboard/repos/${id}`

  return (
    <nav className="flex gap-1 border-b border-white/[0.08]">
      {tabs.map(({ segment, label }) => {
        const href = `${base}${segment}`
        const active = pathname === href
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "border-b-2 border-transparent px-3 py-2 text-sm text-zinc-400 hover:text-zinc-50",
              active && "border-amber-500 text-zinc-50"
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
```

Create `frontend/app/(dashboard)/repos/[id]/layout.tsx`:
```tsx
import { RepoTabs } from "@/components/layout/repo-tabs"

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <RepoTabs />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
```

- [ ] **Step 4: Repo overview page**

Create `frontend/app/(dashboard)/repos/[id]/page.tsx`:
```tsx
"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api/client"
import { IndexingProgress } from "@/components/repos/indexing-progress"
import type { Repository } from "@/types"

export default function RepoOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: repo, isLoading } = useQuery({
    queryKey: ["repo", id],
    queryFn: () => apiFetch<Repository>(`/repos/${id}`),
  })

  if (isLoading) return <Skeleton className="h-40" />
  if (!repo) return <p className="text-sm text-zinc-400">Repository not found.</p>

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{repo.full_name}</h1>
        {repo.description && <p className="mt-1 text-sm text-zinc-400">{repo.description}</p>}
      </div>
      <IndexingProgress repoId={repo.id} indexed={repo.indexed} />
    </div>
  )
}
```

- [ ] **Step 5: Verify live progress in browser**

Open a repo's detail page → click **Index repository** → progress bar climbs live (5 → 20 → 30 → …100) WITHOUT refreshing, then "Indexed ✓". Refresh mid-run → progress is still showing (initial fetch). If nothing moves: check Supabase → Database → Replication that `indexing_jobs` is in the `supabase_realtime` publication, and that you're logged in (RLS policy gates the stream).

- [ ] **Step 6: Checkpoint — commit (user)**

Suggested message: `feat: live indexing progress via Supabase Realtime postgres changes`.

---

### Task 8: Ask Repository (RAG streaming chat)

**Files:**
- Create: `backend/services/ai_stream.py`, `backend/services/retriever.py`, `backend/services/rag.py`
- Create: `backend/schemas/chat.py`
- Create: `backend/routers/rag.py`
- Modify: `backend/main.py`
- Test: `backend/tests/test_ai_stream.py`, `backend/tests/test_chat_schema.py`
- Create: `frontend/components/chat/chat-interface.tsx`, `frontend/components/chat/message-bubble.tsx`, `frontend/components/chat/source-citation.tsx`
- Create: `frontend/app/(dashboard)/repos/[id]/ask/page.tsx`

- [ ] **Step 1: Write failing AI SDK v5 SSE formatter tests**

Create `backend/tests/test_ai_stream.py`:
```python
import json

from services.ai_stream import to_ai_sdk_sse


async def collect(gen):
    return [item async for item in gen]


def parse(sse_line: str) -> dict:
    assert sse_line.startswith("data: ") and sse_line.endswith("\n\n")
    return json.loads(sse_line[len("data: "):])


async def fake_events():
    yield {"sources": [{"file_path": "a.py"}]}
    yield {"delta": "Hello"}
    yield {"delta": " world"}


async def test_full_event_sequence():
    out = await collect(to_ai_sdk_sse(fake_events()))
    types = [parse(line)["type"] for line in out[:-1]]
    assert types == ["start", "data-sources", "text-start", "text-delta", "text-delta", "text-end", "finish"]
    assert out[-1] == "data: [DONE]\n\n"


async def test_deltas_carry_text_and_shared_id():
    out = await collect(to_ai_sdk_sse(fake_events()))
    events = [parse(line) for line in out[:-1]]
    deltas = [e for e in events if e["type"] == "text-delta"]
    assert [d["delta"] for d in deltas] == ["Hello", " world"]
    text_ids = {e["id"] for e in events if e["type"].startswith("text-")}
    assert len(text_ids) == 1


async def test_sources_become_data_part():
    out = await collect(to_ai_sdk_sse(fake_events()))
    events = [parse(line) for line in out[:-1]]
    src = next(e for e in events if e["type"] == "data-sources")
    assert src["data"] == [{"file_path": "a.py"}]


async def empty_events():
    return
    yield  # pragma: no cover


async def test_no_deltas_still_valid_stream():
    out = await collect(to_ai_sdk_sse(empty_events()))
    types = [parse(line)["type"] for line in out[:-1]]
    assert types == ["start", "finish"]  # no text-start/end without text
```

Run: `pytest tests/test_ai_stream.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'services.ai_stream'`.

- [ ] **Step 2: Implement the SSE formatter**

Create `backend/services/ai_stream.py`:
```python
import json
import uuid
from typing import AsyncIterator


def _ev(obj: dict) -> str:
    return f"data: {json.dumps(obj)}\n\n"


async def to_ai_sdk_sse(events: AsyncIterator[dict]) -> AsyncIterator[str]:
    """Convert {'sources': [...]} / {'delta': str} events into the
    Vercel AI SDK v5 UI message stream protocol (SSE)."""
    message_id = uuid.uuid4().hex
    yield _ev({"type": "start"})
    text_started = False
    async for event in events:
        if "sources" in event:
            yield _ev({"type": "data-sources", "data": event["sources"]})
        elif "delta" in event:
            if not text_started:
                yield _ev({"type": "text-start", "id": message_id})
                text_started = True
            yield _ev({"type": "text-delta", "id": message_id, "delta": event["delta"]})
    if text_started:
        yield _ev({"type": "text-end", "id": message_id})
    yield _ev({"type": "finish"})
    yield "data: [DONE]\n\n"
```

- [ ] **Step 3: Run formatter tests**

Run: `pytest tests/test_ai_stream.py -v`
Expected: `4 passed`.

- [ ] **Step 4: Write failing chat schema tests (v5 useChat request body)**

Create `backend/tests/test_chat_schema.py`:
```python
import pytest

from schemas.chat import ChatRequest, last_user_text


def make_request(parts):
    return ChatRequest.model_validate({
        "id": "chat-1",
        "messages": [
            {"id": "m1", "role": "assistant", "parts": [{"type": "text", "text": "earlier answer"}]},
            {"id": "m2", "role": "user", "parts": parts},
        ],
    })


def test_extracts_last_user_text():
    req = make_request([{"type": "text", "text": "What does auth.py do?"}])
    assert last_user_text(req.messages) == "What does auth.py do?"


def test_joins_multiple_text_parts():
    req = make_request([
        {"type": "text", "text": "part one"},
        {"type": "step-start"},
        {"type": "text", "text": "part two"},
    ])
    assert last_user_text(req.messages) == "part one part two"


def test_no_user_message_raises():
    req = ChatRequest.model_validate({
        "messages": [{"id": "m1", "role": "assistant", "parts": [{"type": "text", "text": "hi"}]}]
    })
    with pytest.raises(ValueError):
        last_user_text(req.messages)
```

Run: `pytest tests/test_chat_schema.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'schemas.chat'`.

- [ ] **Step 5: Implement chat schema**

Create `backend/schemas/chat.py`:
```python
from pydantic import BaseModel, ConfigDict


class UIMessagePart(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: str
    text: str | None = None


class UIMessage(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    role: str
    parts: list[UIMessagePart]


class ChatRequest(BaseModel):
    """Body sent by AI SDK v5 useChat/DefaultChatTransport."""
    model_config = ConfigDict(extra="allow")
    id: str | None = None
    messages: list[UIMessage]


def last_user_text(messages: list[UIMessage]) -> str:
    for message in reversed(messages):
        if message.role == "user":
            text = " ".join(p.text for p in message.parts if p.type == "text" and p.text)
            if text:
                return text
    raise ValueError("No user message with text parts found")
```

- [ ] **Step 6: Run chat schema tests**

Run: `pytest tests/test_chat_schema.py -v`
Expected: `3 passed`. Also run the full suite: `pytest -v` → everything passes.

- [ ] **Step 7: Retriever (the whole "vector store")**

Create `backend/services/retriever.py`:
```python
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def retrieve_chunks(
    db: AsyncSession, repo_id: str, query_embedding: list[float], k: int = 5
) -> list[dict]:
    result = await db.execute(
        text("""
            SELECT file_path, content, metadata,
                   1 - (embedding <=> CAST(:emb AS vector)) AS similarity
            FROM repo_chunks
            WHERE repo_id = :repo_id
            ORDER BY embedding <=> CAST(:emb AS vector)
            LIMIT :k
        """),
        {"emb": str(query_embedding), "repo_id": repo_id, "k": k},
    )
    return [dict(row) for row in result.mappings().all()]
```

- [ ] **Step 8: RAG service**

Create `backend/services/rag.py`:
```python
from typing import AsyncIterator

from groq import AsyncGroq
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from services.embeddings import embed_texts
from services.retriever import retrieve_chunks

groq = AsyncGroq(api_key=settings.GROQ_API_KEY)

ASK_SYSTEM_PROMPT = """You are Day One, a senior developer who knows this repository inside out.
Answer questions about the codebase using ONLY the provided context chunks.
Cite file paths when referencing code. If the context doesn't contain the answer,
say so plainly — never invent code that isn't shown."""

ONBOARD_SYSTEM_PROMPT = """You are Day One, a friendly senior developer onboarding a new teammate
to this repository. Using ONLY the provided context chunks, explain concepts step by step,
assume the reader is skilled but new to THIS codebase, suggest what to read next,
and cite file paths. If the context doesn't contain the answer, say so plainly."""


async def answer_question(
    db: AsyncSession, repo_id: str, question: str, system_prompt: str
) -> AsyncIterator[dict]:
    """Yields {'sources': [...]} once, then {'delta': str} events."""
    [query_embedding] = embed_texts([question])
    chunks = await retrieve_chunks(db, repo_id, query_embedding)

    yield {
        "sources": [
            {
                "file_path": c["file_path"],
                "start_line": (c["metadata"] or {}).get("start_line"),
                "end_line": (c["metadata"] or {}).get("end_line"),
            }
            for c in chunks
        ]
    }

    context = "\n\n".join(
        f"### {c['file_path']}\n```\n{c['content']}\n```" for c in chunks
    )
    stream = await groq.chat.completions.create(
        model=settings.GROQ_MODEL,  # config, never hardcoded — Groq deprecates models fast
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{context}\n\nQuestion: {question}"},
        ],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield {"delta": delta}
```

- [ ] **Step 9: RAG router (streaming + message persistence)**

Create `backend/routers/rag.py`:
```python
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, get_owned_repo
from database import get_db
from models import ChatMessage, User
from schemas.chat import ChatRequest, last_user_text
from services.ai_stream import to_ai_sdk_sse
from services.rag import ASK_SYSTEM_PROMPT, ONBOARD_SYSTEM_PROMPT, answer_question

router = APIRouter(prefix="/repos", tags=["ai"])


def _chat_endpoint(mode: str, system_prompt: str):
    async def endpoint(
        repo_id: str,
        body: ChatRequest,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
    ):
        repo = await get_owned_repo(repo_id, user, db)
        question = last_user_text(body.messages)

        async def events_with_persistence():
            answer_parts: list[str] = []
            sources: list = []
            async for event in answer_question(db, str(repo.id), question, system_prompt):
                if "sources" in event:
                    sources = event["sources"]
                elif "delta" in event:
                    answer_parts.append(event["delta"])
                yield event
            db.add(ChatMessage(repo_id=repo.id, user_id=user.id, mode=mode,
                               role="user", content=question))
            db.add(ChatMessage(repo_id=repo.id, user_id=user.id, mode=mode,
                               role="assistant", content="".join(answer_parts), sources=sources))
            await db.commit()

        return StreamingResponse(
            to_ai_sdk_sse(events_with_persistence()),
            media_type="text/event-stream",
            headers={"x-vercel-ai-ui-message-stream": "v1"},
        )

    return endpoint


router.post("/{repo_id}/ask")(_chat_endpoint("ask", ASK_SYSTEM_PROMPT))
router.post("/{repo_id}/onboard")(_chat_endpoint("onboard", ONBOARD_SYSTEM_PROMPT))
```

In `backend/main.py`, extend router registration:
```python
from routers import indexing as indexing_router
from routers import rag as rag_router
from routers import repos as repos_router

app.include_router(repos_router.router)
app.include_router(indexing_router.router)
app.include_router(rag_router.router)
```

**Manual prerequisite (user):** Get a free Groq API key at https://console.groq.com → API Keys. Check https://console.groq.com/docs/models for a current production chat model and set BOTH in `backend/.env`:
```
GROQ_API_KEY=gsk_...
GROQ_MODEL=<current model id from the live list>
```

- [ ] **Step 10: Backend streaming smoke test**

With uvicorn running and an indexed repo:
```powershell
$token = "<paste token>"
curl -N -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{\"messages\": [{\"id\": \"m1\", \"role\": \"user\", \"parts\": [{\"type\": \"text\", \"text\": \"What is this repository about?\"}]}]}' "http://localhost:8000/repos/<repo_id>/ask"
```
Expected: SSE lines stream live — `data: {"type": "start"}`, `data: {"type": "data-sources", ...}`, many `text-delta` events, `finish`, `data: [DONE]`. Then in Supabase: `select role, mode, left(content, 60) from chat_messages;` → 2 rows (user + assistant).

- [ ] **Step 11: Chat UI components**

Create `frontend/components/chat/source-citation.tsx`:
```tsx
import { FileCode2 } from "lucide-react"

export interface Source {
  file_path: string
  start_line?: number | null
  end_line?: number | null
}

export function SourceCitation({ sources }: { sources: Source[] }) {
  if (!sources.length) return null
  const unique = [...new Map(sources.map((s) => [s.file_path, s])).values()]
  return (
    <div className="flex flex-wrap gap-1.5">
      {unique.map((s) => (
        <span
          key={s.file_path}
          className="inline-flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-950/50 px-1.5 py-0.5 font-mono text-[11px] text-indigo-200"
        >
          <FileCode2 className="h-3 w-3" />
          {s.file_path}
          {s.start_line && `:${s.start_line}`}
        </span>
      ))}
    </div>
  )
}
```

Create `frontend/components/chat/message-bubble.tsx`:
```tsx
import type { UIMessage } from "ai"
import { cn } from "@/lib/utils"
import { SourceCitation, type Source } from "./source-citation"

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] space-y-2 rounded-lg px-3.5 py-2.5 text-sm",
          isUser
            ? "bg-amber-500/10 text-amber-200"
            : "border border-white/[0.08] bg-[#1C1C1F] text-zinc-50"
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <p key={i} className="whitespace-pre-wrap leading-relaxed">
                {part.text}
              </p>
            )
          }
          if (part.type === "data-sources") {
            return <SourceCitation key={i} sources={part.data as Source[]} />
          }
          return null
        })}
      </div>
    </div>
  )
}
```

Create `frontend/components/chat/chat-interface.tsx`:
```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { SendHorizonal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getToken } from "@/lib/api/client"
import { MessageBubble } from "./message-bubble"

interface ChatInterfaceProps {
  repoId: string
  endpoint: "ask" | "onboard"
  placeholder: string
  emptyState: string
}

export function ChatInterface({ repoId, endpoint, placeholder, emptyState }: ChatInterfaceProps) {
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    getToken().then(setToken)
  }, [])

  if (!token) return null
  return (
    <ChatInner
      key={`${repoId}-${endpoint}`}
      repoId={repoId}
      endpoint={endpoint}
      token={token}
      placeholder={placeholder}
      emptyState={emptyState}
    />
  )
}

function ChatInner({
  repoId,
  endpoint,
  token,
  placeholder,
  emptyState,
}: ChatInterfaceProps & { token: string }) {
  const [input, setInput] = useState("") // AI SDK v5: input state is yours
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/repos/${repoId}/${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
    }),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const busy = status === "submitted" || status === "streaming"

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <p className="max-w-sm text-sm text-zinc-400">{emptyState}</p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim() || busy) return
          sendMessage({ text: input })
          setInput("")
        }}
        className="flex gap-2 border-t border-white/[0.08] pt-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={busy}
        />
        <Button
          type="submit"
          disabled={busy || !input.trim()}
          className="bg-indigo-500 text-white hover:bg-indigo-600"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 12: Ask page**

Create `frontend/app/(dashboard)/repos/[id]/ask/page.tsx`:
```tsx
"use client"

import { use } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function AskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="h-[calc(100vh-10rem)]">
      <ChatInterface
        repoId={id}
        endpoint="ask"
        placeholder="Ask anything about this codebase…"
        emptyState="Ask the repository like you'd ask the senior dev who wrote it."
      />
    </div>
  )
}
```

- [ ] **Step 13: Verify chat in browser**

On an indexed repo → Ask tab → type "How does this project handle errors?" → answer streams token by token, indigo source-citation chips show file paths. Network tab: request to `/repos/<id>/ask` with `text/event-stream` response.

- [ ] **Step 14: Checkpoint — commit (user)**

Suggested message: `feat: Ask Repository RAG chat (pgvector retrieval, Groq streaming, AI SDK v5)`.

---

### Task 9: AI Onboarding

**Files:**
- Create: `frontend/app/(dashboard)/repos/[id]/onboard/page.tsx`

> The backend endpoint (`POST /repos/{id}/onboard`) and `ONBOARD_SYSTEM_PROMPT` were built in Task 8 — same pipeline, different prompt. This task is only the page.

- [ ] **Step 1: Onboard page**

Create `frontend/app/(dashboard)/repos/[id]/onboard/page.tsx`:
```tsx
"use client"

import { use } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function OnboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="h-[calc(100vh-10rem)]">
      <ChatInterface
        repoId={id}
        endpoint="onboard"
        placeholder="e.g. Where should I start reading? What's the architecture?"
        emptyState="Your AI onboarding buddy. Ask where to start, how things fit together, or what to read first."
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Onboard tab → ask "I'm new here, where should I start?" → streamed answer has an onboarding tone (step-by-step, suggests files to read), distinct from the Ask tab's tone.

- [ ] **Step 3: Checkpoint — commit (user)**

Suggested message: `feat: AI onboarding chat`.

---

### Task 10: Landing Page (GSAP + Framer Motion)

**Files:**
- Create: `frontend/components/landing/hero.tsx`, `frontend/components/landing/features.tsx`, `frontend/components/landing/how-it-works.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Hero with GSAP scroll animation**

Create `frontend/components/landing/hero.tsx`:
```tsx
"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-stagger", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      })
      gsap.to(".hero-glow", {
        scrollTrigger: { trigger: ref.current, start: "top top", scrub: true },
        opacity: 0.15,
        scale: 1.4,
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-32 text-center">
      <div className="hero-glow pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500 opacity-25 blur-[120px]" />
      <p className="hero-stagger text-xs font-medium uppercase tracking-widest text-amber-500">
        The knowledge layer for software teams
      </p>
      <h1 className="hero-stagger mx-auto mt-4 max-w-3xl text-5xl font-bold tracking-tight text-zinc-50">
        Every developer, ready from day one.
      </h1>
      <p className="hero-stagger mx-auto mt-5 max-w-xl text-lg text-zinc-400">
        Your repository has a map. Use it. Onboard new developers in hours, not
        months — and keep the knowledge when seniors leave.
      </p>
      <div className="hero-stagger mt-8 flex justify-center gap-3">
        <Button asChild size="lg" className="bg-amber-500 text-zinc-950 shadow-[0_0_30px_-5px] shadow-amber-500/50 hover:bg-amber-600">
          <Link href="/login">Connect your first repo</Link>
        </Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Features grid (8 cards, Framer Motion hover)**

Create `frontend/components/landing/features.tsx`:
```tsx
"use client"

import { motion } from "framer-motion"
import {
  BookOpenCheck, MessageSquareCode, Network, Puzzle,
  Radar, BrainCircuit, ScrollText, Webhook,
} from "lucide-react"

const features = [
  { icon: BookOpenCheck, title: "AI Onboarding", desc: "A chat guide for every new dev joining a repo." },
  { icon: MessageSquareCode, title: "Ask Repository", desc: "Chat with the codebase like a senior dev." },
  { icon: Network, title: "Architecture Intelligence", desc: "Auto-detects services, layers, dependencies." },
  { icon: Puzzle, title: "Pattern Detection", desc: "Finds MVC, Repository Pattern, DDD, CQRS and more." },
  { icon: Radar, title: "Impact Analysis", desc: "Know what breaks before you change it." },
  { icon: BrainCircuit, title: "Knowledge Preservation", desc: "Captures the why behind decisions." },
  { icon: ScrollText, title: "ADR Management", desc: "Architecture Decision Records, organized." },
  { icon: Webhook, title: "API Intelligence", desc: "Tracks internal & external APIs and deprecations." },
]

export function Features() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-50">
        One platform, the whole picture
      </h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-white/[0.08] bg-[#1C1C1F] p-5"
          >
            <Icon className="h-5 w-5 text-amber-500" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-50">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: How it works**

Create `frontend/components/landing/how-it-works.tsx`:
```tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const steps = [
  { n: "01", title: "Connect", desc: "Point Day One at any public GitHub repository." },
  { n: "02", title: "Index", desc: "We chunk and embed the code into a searchable map." },
  { n: "03", title: "Ask", desc: "Chat with the repo — onboarding, answers, citations." },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-50">
        How it works
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map(({ n, title, desc }, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            className="text-center"
          >
            <span className="font-mono text-sm text-amber-500">{n}</span>
            <h3 className="mt-2 font-semibold text-zinc-50">{title}</h3>
            <p className="mt-1.5 text-sm text-zinc-400">{desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-14 text-center">
        <Button asChild size="lg" className="bg-amber-500 text-zinc-950 hover:bg-amber-600">
          <Link href="/login">Get started — it&apos;s free</Link>
        </Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Assemble the landing page**

Replace `frontend/app/page.tsx`:
```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090B]">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-bold tracking-tight text-zinc-50">Day One</span>
        <Button asChild variant="ghost" className="text-zinc-400 hover:text-zinc-50">
          <Link href="/login">Sign in</Link>
        </Button>
      </header>
      <Hero />
      <Features />
      <HowItWorks />
      <footer className="border-t border-white/[0.08] px-6 py-8 text-center text-xs text-zinc-500">
        Day One — every developer, ready from day one.
      </footer>
    </main>
  )
}
```

- [ ] **Step 5: Verify in browser**

http://localhost:3000 → hero text staggers in, amber glow shifts on scroll, feature cards lift on hover, steps fade in on scroll, CTAs link to `/login`. Run `npm run build` → compiles with no type errors.

- [ ] **Step 6: Checkpoint — commit (user)**

Suggested message: `feat: landing page with GSAP hero and Framer Motion sections`.

---

### Task 11: Deploy — Vercel + Render + Supabase + UptimeRobot ($0/month)

**Files:**
- Create: `backend/render.yaml`

- [ ] **Step 1: Render blueprint**

Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: day-one-api
    runtime: python
    plan: free
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: PYTHON_VERSION
        value: "3.12.6"
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: SUPABASE_JWT_SECRET
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: GROQ_MODEL
        sync: false
      - key: GITHUB_TOKEN
        sync: false
      - key: FRONTEND_URL
        sync: false
```

> Note: render.yaml at `backend/render.yaml` works when you point Render's Blueprint at the repo root and it detects the file — if Render doesn't find it, move it to the repo root and keep `rootDir: backend`.

- [ ] **Step 2: Checkpoint — commit + push (user)**

User commits (`feat: add Render deploy blueprint`) and pushes the repo to GitHub (public or private — their choice).

- [ ] **Step 3: Deploy backend on Render (user)**

1. https://render.com → New → Blueprint → connect the GitHub repo. (No credit card needed.)
2. Fill every `sync: false` env var with the values from `backend/.env` — except `FRONTEND_URL`, set it to the Vercel URL after Step 4 (set `http://localhost:3000` for now).
3. Deploy. First build takes a few minutes (fastembed/onnxruntime).
4. Verify: `https://day-one-api.onrender.com/health` → `{"status":"ok"}`.

> Free-tier memory note: the fastembed model loads lazily on first index/ask, peaking ~300–400MB — inside the 512MB limit. If the instance OOMs on a huge repo, that repo is too big for the free tier; index a smaller one.

- [ ] **Step 4: Deploy frontend on Vercel (user)**

1. https://vercel.com → Add New Project → import the repo → **Root Directory: `frontend`** (framework auto-detected: Next.js).
2. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same as local), `NEXT_PUBLIC_API_URL=https://day-one-api.onrender.com`.
3. Deploy → note the production URL (e.g. `https://day-one.vercel.app`).

- [ ] **Step 5: Wire the three services together (user)**

1. Render → day-one-api → Environment → set `FRONTEND_URL=https://day-one.vercel.app` (exact origin, no trailing slash) → redeploy.
2. Supabase → Authentication → URL Configuration → Site URL `https://day-one.vercel.app`, add redirect URL `https://day-one.vercel.app/auth/callback` (keep the localhost ones for dev).

- [ ] **Step 6: Keep-warm with UptimeRobot (user)**

https://uptimerobot.com (free) → Add New Monitor → HTTP(s) → URL `https://day-one-api.onrender.com/health` → interval 5 minutes. This stops Render's 15-min idle spin-down (~50s cold start). 750 free hrs/month covers 24/7 for one service.

- [ ] **Step 7: Full production smoke test**

On the Vercel URL: landing renders → sign in with GitHub → connect a small public repo → index it (watch live progress) → Ask tab streams an answer with citations → Onboard tab works. Check Render logs for structlog JSON lines; check Supabase `chat_messages` has rows.

- [ ] **Step 8: Done — Phase 1 MVP shipped**

Tell the user Phase 1 is complete and deployed at $0/month. Phase 2 (architecture viz, patterns, impact, tree-sitter, GitHub App) gets its own spec + plan.

---

## Self-Review Notes

- **Spec coverage:** MVP build-order tasks 1–11 map one-to-one onto plan Tasks 1–11. Streaming protocol (spec §9), Realtime progress (§10), RAG pipeline (§12), schema (§7), env vars (§13), deploy (§3) are all implemented. pg_cron (§11) is Phase 3 in the spec and intentionally absent here.
- **Deferred (explicit, not placeholders):** chat history sidebar UI (messages ARE persisted; the sidebar is Phase 1.5 polish), `chat_sessions` table, React Hook Form + Zod, signup page (GitHub OAuth only — `/login` covers both), webhooks router (spec lists `POST /webhooks/github` but nothing in Phase 1 consumes webhook events; it lands with re-index-on-push in Phase 2).
- **Type consistency check:** `ChatRequest`/`last_user_text` used identically in tests and router; `events` dict contract (`{"sources"}`/`{"delta"}`) consistent between `rag.py`, `ai_stream.py`, and tests; `IndexingJob`/`Repository` TS types match SQL columns; `endpoint: "ask" | "onboard"` matches the two FastAPI routes.
