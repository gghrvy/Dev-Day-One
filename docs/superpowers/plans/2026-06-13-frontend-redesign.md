# Dev Day One Frontend Redesign â€” Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all Dev Day One frontend pages with the "Refined Minimal with presence" aesthetic â€” two-tier sidebar replacing the top navbar, editorial typography, monospace for technical data, semantic color usage, and a split-column landing page with live product demo in the hero.

**Architecture:** Shell-first. Tokens â†’ app shell (icon rail + context panel, replacing sidebar + navbar) â†’ dashboard pages â†’ landing/login. All changes are pure frontend/visual â€” zero backend, API, or data logic changes. The context panel replaces the `<RepoTabs>` component entirely; repo sub-navigation now lives in the sidebar. GSAP is retained on the landing hero.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, shadcn/ui (radix-nova), lucide-react, @tanstack/react-query, GSAP, TypeScript

**Read before starting:**
- `frontend/AGENTS.md` â€” this project uses a newer Next.js version with breaking API changes
- `frontend/types/index.ts` â€” `Repository { id, name, full_name, github_url, description, indexed, indexed_at, created_at }` and `IndexingJob { id, repo_id, status, progress, error }`
- `frontend/app/globals.css` â€” Dawn token names (e.g. `bg-dawn-accent`, `text-dawn-ai`)

**Dev server:** `cd frontend && npm run dev` â€” runs on `http://localhost:3000`

---

## File Map

| File | Action |
|---|---|
| `frontend/app/globals.css` | Modify â€” `--radius`, add `--color-dawn-surface` |
| `frontend/components/layout/page-header.tsx` | **Create** |
| `frontend/components/layout/icon-rail.tsx` | **Create** |
| `frontend/components/layout/context-panel.tsx` | **Create** |
| `frontend/components/layout/sidebar.tsx` | **Delete** |
| `frontend/components/layout/navbar.tsx` | **Delete** |
| `frontend/components/layout/repo-tabs.tsx` | **Delete** |
| `frontend/app/(dashboard)/layout.tsx` | Modify â€” swap shell |
| `frontend/app/(dashboard)/dashboard/page.tsx` | Modify â€” page header |
| `frontend/app/(dashboard)/repos/[id]/layout.tsx` | Modify â€” remove tabs, add breadcrumb |
| `frontend/components/landing/nav.tsx` | **Create** |
| `frontend/components/landing/hero.tsx` | Rewrite |
| `frontend/components/landing/features.tsx` | Rewrite |
| `frontend/components/landing/how-it-works.tsx` | Rewrite |
| `frontend/app/page.tsx` | Modify â€” use new Nav |
| `frontend/app/(auth)/login/page.tsx` | Rewrite |
| `frontend/components/repos/repo-row.tsx` | **Create** |
| `frontend/components/repos/repo-card.tsx` | **Delete** |
| `frontend/app/(dashboard)/repos/page.tsx` | Modify â€” use RepoRow |
| `frontend/app/(dashboard)/repos/[id]/page.tsx` | Rewrite â€” editorial stats |
| `frontend/components/repos/indexing-progress.tsx` | Restyle |
| `frontend/components/chat/chat-interface.tsx` | Rewrite |
| `frontend/components/chat/message-bubble.tsx` | Rewrite |
| `frontend/components/chat/source-citation.tsx` | Restyle |
| `frontend/app/(dashboard)/repos/new/page.tsx` | Modify â€” page header |
| `frontend/components/repos/connect-repo.tsx` | Restyle â€” two-column form |

---

## Task 1: Design tokens + PageHeader component

**Files:**
- Modify: `frontend/app/globals.css`
- Create: `frontend/components/layout/page-header.tsx`

- [ ] **Step 1: Update `--radius` and add `--color-dawn-surface` in `globals.css`**

In the `@theme` block (around line 132), change `--radius` and add the surface token:

```css
/* In the existing @theme inline block near the top of the file, change: */
--radius: 0.375rem;   /* was 0.625rem */

/* In the @theme block at the bottom (the Dawn tokens block), add after --color-dawn-border: */
--color-dawn-surface: #111113;
```

- [ ] **Step 2: Create `page-header.tsx`**

```tsx
// frontend/components/layout/page-header.tsx
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  meta?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, meta, action, className }: PageHeaderProps) {
  return (
    <div className={cn("px-5 pt-5", className)}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tighter text-dawn-text">{title}</h1>
          {meta && (
            <p className="mt-1 font-mono text-[9px] text-dawn-muted">{meta}</p>
          )}
        </div>
        {action && <div className="mb-0.5">{action}</div>}
      </div>
      <div className="relative mt-4 h-px w-full bg-dawn-border">
        <div className="absolute left-0 top-0 h-px w-8 bg-dawn-accent" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Start dev server and verify no build errors**

```bash
cd frontend && npm run dev
```

Expected: server starts, no TypeScript errors, `localhost:3000` loads.


---

## Task 2: Icon Rail component

**Files:**
- Create: `frontend/components/layout/icon-rail.tsx`

The icon rail replaces the left portion of the old `<Sidebar>`. It carries: amber logo mark, nav icons (repos, settings) with a left-amber active indicator, user avatar + sign-out at the bottom. The sign-out logic is ported from the deleted `navbar.tsx`.

- [ ] **Step 1: Create `icon-rail.tsx`**

```tsx
// frontend/components/layout/icon-rail.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { FolderGit2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard/repos", icon: FolderGit2, label: "Repositories" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function IconRail() {
  const pathname = usePathname()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState("?")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAvatarUrl(user?.user_metadata?.avatar_url ?? null)
      const name: string = user?.user_metadata?.full_name ?? user?.email ?? ""
      setInitials(name.charAt(0).toUpperCase() || "?")
    })
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="flex w-11 shrink-0 flex-col items-center border-r border-white/[0.04] bg-[#080809] py-2.5">
      {/* Logo mark */}
      <Link
        href="/dashboard"
        className="mb-3 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-dawn-accent text-[10px] font-black text-[#09090B]"
      >
        D
      </Link>

      {/* Nav icons */}
      <div className="flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <div key={href} className="relative flex w-full justify-center">
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-sm bg-dawn-accent" />
              )}
              <Link
                href={href}
                title={label}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors",
                  active
                    ? "bg-[#1C1C1F] text-zinc-100"
                    : "text-zinc-600 hover:bg-[#111113] hover:text-zinc-300"
                )}
              >
                <Icon className="h-[13px] w-[13px]" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar â€” click to sign out */}
      <button
        onClick={signOut}
        title="Sign out"
        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1C1C1F] text-[8px] font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>
    </aside>
  )
}
```

- [ ] **Step 2: Check TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors in `icon-rail.tsx`.


---

## Task 3: Context Panel component

**Files:**
- Create: `frontend/components/layout/context-panel.tsx`

The context panel renders the repo list and inline sub-navigation. It uses React Query (keyed `["repos"]`) so it shares the cache with the repos page â€” no extra network request when both are mounted. It reads `usePathname()` to determine which repo is expanded and which sub-page is active.

- [ ] **Step 1: Create `context-panel.tsx`**

```tsx
// frontend/components/layout/context-panel.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api/client"
import type { Repository } from "@/types"

const subPages = [
  { label: "Overview", segment: "" },
  { label: "Ask", segment: "/ask" },
  { label: "Onboard", segment: "/onboard" },
]

export function ContextPanel() {
  const pathname = usePathname()
  const { data: repos = [] } = useQuery<Repository[]>({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })

  // Extract active repo id from path â€” exclude /new
  const repoMatch = pathname.match(/\/dashboard\/repos\/([^\/]+)/)
  const activeRepoId = repoMatch?.[1] === "new" ? null : repoMatch?.[1] ?? null

  return (
    <div className="flex w-[168px] shrink-0 flex-col border-r border-white/[0.05] bg-[#0C0C0E]">
      <div className="px-3 pt-3 pb-1">
        <p className="text-[11px] font-bold text-dawn-text">Repositories</p>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-2">
        {repos.map((repo) => {
          const isExpanded = repo.id === activeRepoId
          const stripe = repo.indexed
            ? "bg-[#4ADE80]"
            : repo.id === activeRepoId
            ? "bg-dawn-accent opacity-60"
            : "bg-zinc-700 opacity-40"

          return (
            <div key={repo.id} className="mb-0.5">
              {/* Repo row */}
              <Link
                href={`/dashboard/repos/${repo.id}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-[5px] px-1.5 py-[5px] transition-colors",
                  isExpanded
                    ? "bg-[#1C1C1F] text-dawn-text"
                    : "text-zinc-500 hover:bg-[#111113] hover:text-zinc-300"
                )}
              >
                <span className={cn("h-3.5 w-0.5 shrink-0 rounded-[1px]", stripe)} />
                <span className="flex-1 truncate text-[10px] font-semibold leading-none">
                  {repo.name}
                </span>
                {repo.indexed ? (
                  <ChevronDown
                    className={cn(
                      "h-[7px] w-[7px] shrink-0 text-zinc-600 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                ) : (
                  <span className="shrink-0 font-mono text-[8px] text-dawn-accent">
                    {/* progress shown if we have it â€” otherwise nothing */}
                  </span>
                )}
              </Link>

              {/* Sub-nav â€” shown when expanded */}
              {isExpanded && (
                <div className="ml-3 mt-0.5 flex flex-col gap-0.5 pl-1.5">
                  {subPages.map(({ label, segment }) => {
                    const href = `/dashboard/repos/${repo.id}${segment}`
                    const subActive =
                      segment === ""
                        ? pathname === `/dashboard/repos/${repo.id}`
                        : pathname === href
                    return (
                      <Link
                        key={label}
                        href={href}
                        className={cn(
                          "rounded-[4px] px-2 py-[4px] text-[10px] transition-colors",
                          subActive
                            ? "border-l-2 border-dawn-ai bg-[rgba(99,102,241,0.06)] pl-[6px] font-semibold text-[#818CF8]"
                            : "text-zinc-600 hover:text-zinc-400"
                        )}
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Empty state */}
        {repos.length === 0 && (
          <p className="px-1.5 py-2 text-[10px] text-zinc-700">No repositories yet.</p>
        )}

        {/* Add link */}
        <Link
          href="/dashboard/repos/new"
          className="mt-2 px-1.5 text-[10px] text-zinc-700 transition-colors hover:text-zinc-500"
        >
          + Connect
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors in `context-panel.tsx`.


---

## Task 4: Wire up new dashboard shell

**Files:**
- Modify: `frontend/app/(dashboard)/layout.tsx`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx`
- Delete: `frontend/components/layout/sidebar.tsx`
- Delete: `frontend/components/layout/navbar.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
// frontend/app/(dashboard)/layout.tsx
import { IconRail } from "@/components/layout/icon-rail"
import { ContextPanel } from "@/components/layout/context-panel"
import { Providers } from "@/components/providers"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-dawn-bg">
        <IconRail />
        <ContextPanel />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </Providers>
  )
}
```

- [ ] **Step 2: Update dashboard home page**

```tsx
// frontend/app/(dashboard)/dashboard/page.tsx
import { PageHeader } from "@/components/layout/page-header"

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" meta="Welcome back" />
      <div className="px-5 py-6">
        <p className="text-sm text-dawn-muted">
          Select a repository from the sidebar to get started.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Delete old layout components**

```bash
rm frontend/components/layout/sidebar.tsx
rm frontend/components/layout/navbar.tsx
```

- [ ] **Step 4: Start dev server and visually verify the shell**

```bash
cd frontend && npm run dev
```

Open `http://localhost:3000/dashboard`. Expected:
- 44px amber-logo icon rail on the far left
- 168px context panel next to it showing "Repositories" header
- Main content area to the right with "Dashboard" heading
- No top navbar
- No TypeScript or runtime errors in console


---

## Task 5: Remove repo tabs from repo detail layout

**Files:**
- Modify: `frontend/app/(dashboard)/repos/[id]/layout.tsx`
- Delete: `frontend/components/layout/repo-tabs.tsx`

- [ ] **Step 1: Rewrite `repos/[id]/layout.tsx`**

Read the current file first to see what needs to be removed, then replace it entirely:

```tsx
// frontend/app/(dashboard)/repos/[id]/layout.tsx
"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import type { Repository } from "@/types"

export default function RepoDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: repo } = useQuery<Repository>({
    queryKey: ["repo", id],
    queryFn: () => apiFetch<Repository>(`/repos/${id}`),
  })

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.04] px-5 py-2.5">
        <Link href="/dashboard/repos" className="font-mono text-[9px] text-dawn-muted hover:text-zinc-400 transition-colors">
          Repositories
        </Link>
        <span className="font-mono text-[9px] text-zinc-700">/</span>
        <span className="font-mono text-[9px] font-medium text-zinc-400">
          {repo?.full_name ?? id}
        </span>
      </div>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Delete repo-tabs**

```bash
rm frontend/components/layout/repo-tabs.tsx
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/dashboard/repos` â†’ click a repo (if any exist) â†’ confirm: no tab bar at the top, breadcrumb shows, sub-navigation is in the context panel sidebar.


---

## Task 6: Landing page nav + hero

**Files:**
- Create: `frontend/components/landing/nav.tsx`
- Modify: `frontend/app/page.tsx`
- Rewrite: `frontend/components/landing/hero.tsx`

- [ ] **Step 1: Create landing `nav.tsx`**

```tsx
// frontend/components/landing/nav.tsx
import Link from "next/link"

export function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-11 items-center justify-between border-b border-white/[0.05] bg-[#09090B]/80 px-6 backdrop-blur">
      <span className="text-[13px] font-black tracking-tighter text-dawn-text">
        DevDayOne<span className="text-dawn-accent">.</span>
      </span>
      <div className="flex items-center gap-5">
        <Link href="#how-it-works" className="text-[11px] text-zinc-600 transition-colors hover:text-zinc-400">
          How it works
        </Link>
        <Link
          href="/login"
          className="rounded-[4px] bg-dawn-accent px-3 py-1.5 text-[11px] font-bold text-[#09090B] transition-colors hover:bg-dawn-accent-hover"
        >
          Sign in
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Rewrite `hero.tsx`**

```tsx
// frontend/components/landing/hero.tsx
"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"

export function Hero() {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.from(leftRef.current, { opacity: 0, x: -24, duration: 0.8 })
      .from(rightRef.current, { opacity: 0, x: 24, duration: 0.8 }, "-=0.5")
  }, [])

  return (
    <section className="grid min-h-screen grid-cols-2 pt-11">
      {/* Left: editorial copy */}
      <div
        ref={leftRef}
        className="flex flex-col justify-center border-r border-white/[0.04] px-12 py-16"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px w-4 bg-dawn-ai" />
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-dawn-ai">
            Powered by RAG + Groq
          </span>
        </div>
        <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tighter text-dawn-text">
          Every dev,<br />
          ready on<br />
          <span className="text-dawn-accent">day&nbsp;one.</span>
        </h1>
        <div className="my-5 h-px w-8 bg-white/10" />
        <p className="max-w-xs text-sm leading-relaxed text-dawn-muted">
          Connect a GitHub repo. Get an AI that knows your entire codebase â€” so new hires ship on day one, not week six.
        </p>
        <div className="mt-7 flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-[4px] bg-dawn-accent px-4 py-2 text-[11px] font-bold text-[#09090B] transition-colors hover:bg-dawn-accent-hover"
          >
            Start free
          </Link>
          <span className="text-[10px] text-zinc-700">
            No credit card&nbsp;&nbsp;Â·&nbsp;&nbsp;GitHub login
          </span>
        </div>
      </div>

      {/* Right: live product demo */}
      <div
        ref={rightRef}
        className="flex items-center justify-center bg-[#0A0A0C] px-10 py-16"
      >
        <div className="w-full max-w-md">
          {/* Browser chrome */}
          <div className="overflow-hidden rounded-lg border border-white/[0.06]">
            <div className="flex items-center gap-1.5 border-b border-white/[0.05] bg-[#111113] px-3 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <span className="ml-2 font-mono text-[8px] text-zinc-700">
                devdayone.app / ask
              </span>
            </div>
            <div className="space-y-3 bg-dawn-bg p-4">
              {/* User message */}
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono text-[8px] text-zinc-700">YOU</span>
                <div className="max-w-[85%] rounded-[8px_2px_8px_8px] bg-[#1C1C1F] px-3 py-2 text-[10px] leading-relaxed text-zinc-400">
                  How does auth work in this codebase?
                </div>
              </div>
              {/* AI message */}
              <div className="flex flex-col items-start gap-1">
                <span className="font-mono text-[8px] text-dawn-ai">AI</span>
                <div className="border-l-2 border-dawn-ai pl-3 text-[10px] leading-relaxed text-zinc-400">
                  Auth uses{" "}
                  <code className="rounded bg-[#1C1C1F] px-1 py-0.5 font-mono text-[9px] text-dawn-text">
                    supabase/ssr
                  </code>{" "}
                  with GitHub OAuth. The flow starts in{" "}
                  <span className="font-mono text-[9px] text-dawn-accent">
                    auth/callback/route.ts
                  </span>
                  , exchanges the code for a session, then redirects to{" "}
                  <code className="rounded bg-[#1C1C1F] px-1 py-0.5 font-mono text-[9px] text-dawn-text">
                    /dashboard
                  </code>
                  .
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded border border-white/[0.06] px-1.5 py-0.5 font-mono text-[8px] text-zinc-600">
                      auth/callback/route.ts
                    </span>
                    <span className="rounded border border-white/[0.06] px-1.5 py-0.5 font-mono text-[8px] text-zinc-600">
                      middleware.ts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center font-mono text-[9px] text-zinc-700">
            answered from 2,341 indexed files Â· 1.2s
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Update `app/page.tsx` to use new Nav**

```tsx
// frontend/app/page.tsx
import { LandingNav } from "@/components/landing/nav"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"

export default function Home() {
  return (
    <div className="min-h-screen bg-dawn-bg">
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <footer className="flex items-center justify-between border-t border-white/[0.05] px-8 py-5">
          <span className="text-[11px] font-black tracking-tighter text-dawn-muted">
            DevDayOne<span className="text-dawn-accent">.</span>
          </span>
          <span className="text-[11px] text-zinc-700">Â© 2026 Dev Day One</span>
        </footer>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000`. Expected:
- 44px fixed nav with `DevDayOne.` wordmark (amber dot) and Sign in button
- Split two-column hero â€” editorial copy left, browser-chrome product demo right
- GSAP fade-in on both columns


---

## Task 7: Landing features + how-it-works

**Files:**
- Rewrite: `frontend/components/landing/features.tsx`
- Rewrite: `frontend/components/landing/how-it-works.tsx`

- [ ] **Step 1: Rewrite `features.tsx`**

```tsx
// frontend/components/landing/features.tsx
const features = [
  {
    color: "bg-dawn-accent/10",
    dot: "bg-dawn-accent",
    title: "Ask anything",
    description: "Natural language Q&A over every file in your repository. RAG-powered, source-cited.",
  },
  {
    color: "bg-dawn-ai/10",
    dot: "bg-dawn-ai",
    title: "AI onboarding",
    description: "Auto-generated architecture guide and start-here paths for new hires.",
  },
  {
    color: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    title: "Live indexing",
    description: "Realtime progress. Always up to date with your latest commits.",
  },
]

export function Features() {
  return (
    <section className="border-t border-white/[0.05] px-12 py-16">
      <div className="grid grid-cols-3 gap-10">
        {features.map(({ color, dot, title, description }) => (
          <div key={title}>
            <div className={`mb-3 flex h-5 w-5 items-center justify-center rounded-[5px] ${color}`}>
              <div className={`h-2 w-2 rounded-[2px] ${dot}`} />
            </div>
            <p className="mb-1 text-[11px] font-semibold text-dawn-text">{title}</p>
            <p className="text-[10px] leading-relaxed text-zinc-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Rewrite `how-it-works.tsx`**

```tsx
// frontend/components/landing/how-it-works.tsx
const steps = [
  {
    num: "01",
    title: "Connect your repo",
    description: "Paste a public GitHub URL. We fetch and index every file.",
  },
  {
    num: "02",
    title: "We index everything",
    description: "RAG pipeline chunks, embeds, and stores your code in seconds.",
  },
  {
    num: "03",
    title: "Your team asks questions",
    description: "New hires ask in plain English. The AI answers with source citations.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-white/[0.05] px-12 py-16">
      <div className="grid grid-cols-3 gap-10">
        {steps.map(({ num, title, description }) => (
          <div key={num}>
            <p className="mb-2 font-mono text-3xl font-bold text-white/[0.06]">{num}</p>
            <p className="mb-1 text-[11px] font-semibold text-dawn-text">{title}</p>
            <p className="text-[10px] leading-relaxed text-zinc-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000`, scroll down. Expected:
- Features section: three columns, small colored square icon, no card borders
- How it works: large muted monospace numbers (01 Â· 02 Â· 03), step titles, descriptions


---

## Task 8: Login page â€” two-column

**Files:**
- Rewrite: `frontend/app/(auth)/login/page.tsx`

- [ ] **Step 1: Rewrite login page**

```tsx
// frontend/app/(auth)/login/page.tsx
"use client"

import { createClient } from "@/lib/supabase/client"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.41-2.7 5.38-5.26 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

export default function LoginPage() {
  const signIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="grid min-h-screen grid-cols-[55fr_45fr]">
      {/* Left: brand panel */}
      <div className="flex flex-col justify-between bg-[#0C0C0E] px-12 py-14">
        <span className="text-[13px] font-black tracking-tighter text-dawn-text">
          DevDayOne<span className="text-dawn-accent">.</span>
        </span>
        <div>
          <h1 className="text-[clamp(2rem,3.5vw,3rem)] font-black leading-[1.1] tracking-tighter text-dawn-text">
            Every developer,<br />
            <span className="text-dawn-accent">ready from day one.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-dawn-muted">
            Connect your GitHub repository and get an AI that knows your codebase inside-out.
          </p>
        </div>
        <p className="font-mono text-[9px] text-zinc-700">
          Built on GitHub Â· Supabase Â· Groq Â· the $0 stack
        </p>
      </div>

      {/* Right: sign-in form */}
      <div className="flex items-center justify-center bg-dawn-bg px-12">
        <div className="w-full max-w-[280px] space-y-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-dawn-text">Sign in</h2>
            <p className="mt-1 text-[11px] text-dawn-muted">
              Continue with your GitHub account
            </p>
          </div>
          <button
            onClick={signIn}
            className="flex w-full items-center justify-center gap-2.5 rounded-[4px] bg-dawn-accent py-2.5 text-[11px] font-bold text-[#09090B] transition-colors hover:bg-dawn-accent-hover"
          >
            <GithubIcon className="h-4 w-4" />
            Continue with GitHub
          </button>
          <p className="text-center text-[10px] text-zinc-700">
            Public repositories only in this release.
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/login`. Expected:
- Two-column full-screen layout
- Left: dark `#0C0C0E` panel with large brand headline
- Right: sign-in form with amber GitHub button, no card border


---

## Task 9: RepoRow component + repos list page

**Files:**
- Create: `frontend/components/repos/repo-row.tsx`
- Modify: `frontend/app/(dashboard)/repos/page.tsx`
- Delete: `frontend/components/repos/repo-card.tsx`

- [ ] **Step 1: Create `repo-row.tsx`**

```tsx
// frontend/components/repos/repo-row.tsx
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Repository } from "@/types"

export function RepoRow({ repo }: { repo: Repository }) {
  const stripeColor = repo.indexed ? "bg-[#4ADE80]" : "bg-zinc-700 opacity-40"

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.03] px-5 py-3.5 transition-colors hover:bg-white/[0.015]">
      <div className={cn("h-8 w-0.5 shrink-0 rounded-[1px]", stripeColor)} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold tracking-tight text-dawn-text">
          {repo.full_name}
        </p>
        {repo.description && (
          <p className="mt-0.5 truncate font-mono text-[9px] text-zinc-700">
            {repo.description}
          </p>
        )}
        <p className="mt-0.5 font-mono text-[9px] text-dawn-muted">
          {repo.indexed
            ? `indexed${repo.indexed_at ? ` Â· ${new Date(repo.indexed_at).toLocaleDateString()}` : ""}`
            : "not yet indexed"}
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {repo.indexed && (
          <Link
            href={`/dashboard/repos/${repo.id}/ask`}
            className="rounded-[3px] bg-[#1C1C1F] px-2.5 py-1 text-[9px] text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Ask
          </Link>
        )}
        {repo.indexed && (
          <Link
            href={`/dashboard/repos/${repo.id}/onboard`}
            className="rounded-[3px] border border-dawn-ai/20 bg-dawn-ai/8 px-2.5 py-1 text-[9px] text-[#818CF8] transition-colors hover:bg-dawn-ai/15"
          >
            Onboard
          </Link>
        )}
        {!repo.indexed && (
          <Link
            href={`/dashboard/repos/${repo.id}`}
            className="rounded-[3px] bg-[#1C1C1F] px-2.5 py-1 text-[9px] text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Index â†’
          </Link>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `repos/page.tsx`**

```tsx
// frontend/app/(dashboard)/repos/page.tsx
"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { RepoRow } from "@/components/repos/repo-row"
import { Skeleton } from "@/components/ui/skeleton"
import type { Repository } from "@/types"

export default function ReposPage() {
  const { data: repos, isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })

  return (
    <div>
      <PageHeader
        title="Repositories"
        meta={repos ? `${repos.length} connected` : undefined}
        action={
          <Link
            href="/dashboard/repos/new"
            className="rounded-[4px] bg-dawn-accent px-3 py-1.5 text-[10px] font-bold text-[#09090B] transition-colors hover:bg-dawn-accent-hover"
          >
            + New
          </Link>
        }
      />
      <div className="mt-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-white/[0.03] px-5 py-3.5">
              <Skeleton className="h-8 w-0.5" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        {repos?.map((repo) => <RepoRow key={repo.id} repo={repo} />)}
        {repos?.length === 0 && (
          <p className="px-5 py-4 text-[10px] text-zinc-700">
            No repositories yet.{" "}
            <Link href="/dashboard/repos/new" className="text-dawn-accent hover:underline">
              Connect one â†’
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Delete old `repo-card.tsx`**

```bash
rm frontend/components/repos/repo-card.tsx
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000/dashboard/repos`. Expected:
- Page header with "Repositories" title, amber hairline, "+ New" button top-right
- Repo rows with left color stripe (green = indexed, grey = not indexed)
- Monospace metadata below repo name
- Ask + Onboard buttons only when indexed


---

## Task 10: Repo overview page + IndexingProgress restyle

**Files:**
- Rewrite: `frontend/app/(dashboard)/repos/[id]/page.tsx`
- Restyle: `frontend/components/repos/indexing-progress.tsx`

- [ ] **Step 1: Rewrite repo overview page**

```tsx
// frontend/app/(dashboard)/repos/[id]/page.tsx
"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IndexingProgress } from "@/components/repos/indexing-progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { Repository } from "@/types"

export default function RepoOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: repo, isLoading } = useQuery({
    queryKey: ["repo", id],
    queryFn: () => apiFetch<Repository>(`/repos/${id}`),
  })

  if (isLoading) {
    return (
      <div className="px-5 py-6 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
    )
  }
  if (!repo) return <p className="px-5 py-6 text-sm text-dawn-muted">Repository not found.</p>

  return (
    <div className="px-5 py-6 max-w-xl space-y-5">
      {/* Status block â€” note: file/chunk count not in Repository type; show indexed date */}
      {repo.indexed && (
        <div className="rounded-lg border border-white/[0.05] bg-dawn-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
              <span className="font-mono text-[9px] text-[#4ADE80]">indexed</span>
            </div>
            {repo.indexed_at && (
              <span className="font-mono text-[9px] text-zinc-700">
                {new Date(repo.indexed_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Indexing progress (shown when not yet indexed or re-indexing) */}
      <IndexingProgress repoId={repo.id} indexed={repo.indexed} />

      {/* Quick actions â€” only when indexed */}
      {repo.indexed && (
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/dashboard/repos/${repo.id}/ask`}
            className="rounded-lg border border-dawn-accent/12 bg-dawn-surface p-3 transition-colors hover:border-dawn-accent/20"
          >
            <p className="text-[10px] font-semibold text-dawn-text">Ask the codebase</p>
            <p className="mt-1 text-[9px] leading-relaxed text-zinc-600">
              Natural language Q&amp;A over every file
            </p>
            <p className="mt-3 text-[9px] text-dawn-accent">Go to Ask â†’</p>
          </Link>
          <Link
            href={`/dashboard/repos/${repo.id}/onboard`}
            className="rounded-lg border border-dawn-ai/12 bg-dawn-surface p-3 transition-colors hover:border-dawn-ai/20"
          >
            <p className="text-[10px] font-semibold text-dawn-text">Onboard a new hire</p>
            <p className="mt-1 text-[9px] leading-relaxed text-zinc-600">
              Architecture guide, start-here paths
            </p>
            <p className="mt-3 text-[9px] text-dawn-ai">Go to Onboard â†’</p>
          </Link>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Restyle `indexing-progress.tsx`** (keep all logic, replace visual markup only)

```tsx
// frontend/components/repos/indexing-progress.tsx
"use client"

import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
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
    <div className="rounded-lg border border-white/[0.05] bg-dawn-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={
              running
                ? "h-1.5 w-1.5 rounded-full bg-dawn-accent animate-pulse"
                : indexed
                ? "h-1.5 w-1.5 rounded-full bg-[#4ADE80]"
                : "h-1.5 w-1.5 rounded-full bg-zinc-700"
            }
          />
          <span className="font-mono text-[9px] text-dawn-muted">
            {running ? "indexingâ€¦" : indexed ? "indexed" : "not indexed"}
          </span>
        </div>
        <Button
          size="sm"
          disabled={running}
          onClick={() => start.mutate()}
          className="h-7 rounded-[4px] bg-dawn-accent px-3 text-[10px] font-bold text-[#09090B] hover:bg-dawn-accent-hover"
        >
          {running ? "Indexingâ€¦" : indexed ? "Re-index" : "Index repository"}
        </Button>
      </div>

      {running && job && (
        <div className="mt-3">
          <div className="h-[1.5px] w-full overflow-hidden rounded-full bg-[#27272A]">
            <div
              className="h-full bg-dawn-accent transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[9px] text-dawn-muted">
            {job.progress}% complete
          </p>
        </div>
      )}

      {job?.status === "failed" && (
        <p className="mt-2 text-[10px] text-red-400">Failed: {job.error}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Open a repo's overview page. Expected:
- Stats block (if indexed): three editorial numbers in amber/indigo/white
- IndexingProgress: pulse dot, raw 1.5px progress bar, monospace percentage
- Quick action cards with amber/indigo bordered boxes


---

## Task 11: Chat interface, message bubble, source citation

**Files:**
- Rewrite: `frontend/components/chat/chat-interface.tsx`
- Rewrite: `frontend/components/chat/message-bubble.tsx`
- Restyle: `frontend/components/chat/source-citation.tsx`

- [ ] **Step 1: Rewrite `message-bubble.tsx`**

```tsx
// frontend/components/chat/message-bubble.tsx
import { cn } from "@/lib/utils"
import type { UIMessage } from "ai"

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  const text = message.parts
    ?.filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("") ?? ""

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <span className={cn("font-mono text-[8px]", isUser ? "text-zinc-700" : "text-dawn-ai")}>
        {isUser ? "YOU" : "AI"}
      </span>
      {isUser ? (
        <div className="max-w-[82%] rounded-[8px_2px_8px_8px] bg-[#1C1C1F] px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
          {text}
        </div>
      ) : (
        <div className="max-w-[92%] border-l-2 border-dawn-ai pl-3 text-[11px] leading-relaxed text-zinc-400">
          {text}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Restyle `source-citation.tsx`** (keep `Source` interface and dedup logic, restyle markup only)

```tsx
// frontend/components/chat/source-citation.tsx
export interface Source {
  file_path: string
  start_line?: number | null
  end_line?: number | null
}

export function SourceCitation({ sources }: { sources: Source[] }) {
  if (!sources.length) return null
  const unique = [...new Map(sources.map((s) => [s.file_path, s])).values()]
  return (
    <div className="flex flex-wrap gap-1">
      {unique.map((s) => (
        <span
          key={s.file_path}
          className="rounded border border-white/[0.06] px-1.5 py-0.5 font-mono text-[8px] text-zinc-600"
        >
          {s.file_path}
          {s.start_line ? `:${s.start_line}` : ""}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `chat-interface.tsx`**

```tsx
// frontend/components/chat/chat-interface.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { SendHorizonal } from "lucide-react"
import { getToken } from "@/lib/api/client"
import { MessageBubble } from "./message-bubble"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  repoId: string
  endpoint: "ask" | "onboard"
  placeholder: string
  emptyState: string
  suggestedPrompts?: string[]
}

const defaultSuggestions: Record<"ask" | "onboard", string[]> = {
  ask: [
    "How does authentication work?",
    "Where is the database schema defined?",
    "What does the API layer look like?",
  ],
  onboard: [
    "Where should I start reading?",
    "What's the overall architecture?",
    "What are the main data models?",
  ],
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
}: {
  repoId: string
  endpoint: "ask" | "onboard"
  token: string
  placeholder: string
  emptyState: string
}) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
  const suggestions = defaultSuggestions[endpoint]

  const submit = () => {
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-[13px] font-semibold text-dawn-text">{emptyState}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s)
                    inputRef.current?.focus()
                  }}
                  className="rounded border border-dawn-border px-2.5 py-1 text-[10px] text-dawn-muted transition-colors hover:border-white/[0.12] hover:text-zinc-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-5 pb-5 pt-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-[7px] border bg-dawn-surface px-3 py-2.5 transition-colors",
            busy ? "border-white/[0.05]" : "border-white/[0.07] focus-within:border-white/[0.12]"
          )}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submit())}
            placeholder={placeholder}
            disabled={busy}
            className="flex-1 bg-transparent text-[11px] text-dawn-text placeholder:text-zinc-700 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={busy || !input.trim()}
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-dawn-ai text-white transition-opacity disabled:opacity-30"
          >
            <SendHorizonal className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Open a repo's Ask page (`/dashboard/repos/[id]/ask`). Expected:
- Empty state: heading + 3 suggested prompt chips that fill the input on click
- After sending: user message right-aligned dark bubble, AI message left-bordered indigo
- Input: unified container with indigo send button inside, no separate button
- Suggested prompts disappear once conversation starts


---

## Task 12: Connect repo form restyle

**Files:**
- Modify: `frontend/app/(dashboard)/repos/new/page.tsx`
- Restyle: `frontend/components/repos/connect-repo.tsx`

- [ ] **Step 1: Read current `repos/new/page.tsx`** to see the existing wrapper

```bash
cat frontend/app/\(dashboard\)/repos/new/page.tsx
```

- [ ] **Step 2: Update `repos/new/page.tsx`** to use PageHeader (adapt to match current content):

```tsx
// frontend/app/(dashboard)/repos/new/page.tsx
import { PageHeader } from "@/components/layout/page-header"
import { ConnectRepo } from "@/components/repos/connect-repo"

export default function NewRepoPage() {
  return (
    <div>
      <PageHeader title="Connect repository" meta="Public GitHub repositories only" />
      <div className="px-5 py-6">
        <ConnectRepo />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Restyle `connect-repo.tsx`** (logic unchanged, markup restyled to two-column)

```tsx
// frontend/components/repos/connect-repo.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
      className="max-w-lg"
    >
      <div className="flex items-start gap-8">
        {/* Left: label + description */}
        <div className="w-44 shrink-0 pt-0.5">
          <p className="text-[11px] font-semibold text-dawn-text">GitHub repository</p>
          <p className="mt-1 text-[10px] leading-relaxed text-dawn-muted">
            Enter the full repository name in <span className="font-mono">owner/repo</span> format.
          </p>
          <p className="mt-2 text-[9px] text-zinc-700">Private repos coming soon.</p>
        </div>

        {/* Right: input + submit */}
        <div className="flex-1 space-y-2.5">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. vercel/next.js"
            className="w-full rounded-[4px] border border-white/[0.08] bg-dawn-surface px-3 py-2 text-[11px] text-dawn-text placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
          />
          {mutation.isError && (
            <p className="text-[10px] text-red-400">{(mutation.error as Error).message}</p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending || !fullName.trim()}
            className="rounded-[4px] bg-dawn-accent px-4 py-2 text-[10px] font-bold text-[#09090B] transition-colors hover:bg-dawn-accent-hover disabled:opacity-40"
          >
            {mutation.isPending ? "Connectingâ€¦" : "Connect repository"}
          </button>
        </div>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000/dashboard/repos/new`. Expected:
- PageHeader with "Connect repository" + amber hairline
- Two-column form: description on left, input + button on right
- No card border wrapping the form

- [ ] **Step 5: Final full build check**

```bash
cd frontend && npm run build
```

Expected: build completes with no errors. Fix any TypeScript or import errors before proceeding.


---

## Self-Review Checklist

After completing all tasks, run through these checks:

- [ ] All 14 tasks committed individually
- [ ] `npm run build` passes with zero errors
- [ ] Landing page (`/`): split hero, live demo panel, features, how-it-works, footer
- [ ] Login (`/login`): two-column, no card border
- [ ] Dashboard shell: icon rail + context panel on all dashboard pages, no top navbar
- [ ] Repos list (`/dashboard/repos`): table rows, color stripes, monospace metadata
- [ ] Repo overview (`/dashboard/repos/[id]`): breadcrumb, stats block, quick-action cards
- [ ] Ask/Onboard (`/dashboard/repos/[id]/ask`): empty state with prompts, left-border AI messages, unified input
- [ ] Connect repo (`/dashboard/repos/new`): two-column form
- [ ] `repo-card.tsx`, `sidebar.tsx`, `navbar.tsx`, `repo-tabs.tsx` all deleted
- [ ] No `<Badge>` or `<Progress>` imports remaining in restyled files

