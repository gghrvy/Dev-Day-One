# Dev Day One — Frontend Redesign Design Spec

**Date:** 2026-06-13
**Scope:** Full frontend redesign — landing page, login, dashboard app shell, all dashboard pages
**Brand status:** Logo/brand kit deferred — "D" amber square placeholder used throughout; real assets to follow separately

---

## 1. Design Direction

**Refined Minimal with presence.** No gradients, no glow effects, no decorative backgrounds. Presence comes from:
- Tight typographic hierarchy with deliberate scale contrast
- Left-border active states (not background pills)
- Monospace font for all technical data (file counts, timestamps, percentages)
- One amber hairline accent per page (under the page title)
- Semantic color: amber = action/brand, indigo = AI, green = success/indexed

**What to avoid:**
- Identical border-radius on every element (current: `0.625rem` everywhere)
- Stacked card grids for list data
- Background-pill active states in navigation
- Centered hero with two buttons and no product visual

---

## 2. Design Token Changes (`globals.css`)

Only three changes to the existing Dawn token set:

| Token | Old value | New value | Reason |
|---|---|---|---|
| `--radius` | `0.625rem` | `0.375rem` | Sharper, less bubbly — matches the minimal aesthetic |
| `--color-dawn-surface` | _(new)_ | `#111113` | Mid-layer surface between `--color-dawn-bg2` and `--color-dawn-card`; used for chat input, inner containers |

All other Dawn tokens remain unchanged:
- `--color-dawn-bg: #09090B` · `--color-dawn-bg2: #18181B` · `--color-dawn-bg3: #27272A`
- `--color-dawn-card: #1C1C1F` · `--color-dawn-text: #FAFAFA` · `--color-dawn-text2: #A1A1AA`
- `--color-dawn-muted: #71717A` · `--color-dawn-accent: #F59E0B` · `--color-dawn-ai: #6366F1`
- `--color-dawn-border: rgba(255,255,255,0.08)`

---

## 3. App Shell — Two-Tier Sidebar

Replaces the existing `<Sidebar>` + `<Navbar>` combination entirely. No top navbar.

### 3a. Icon Rail (`components/layout/icon-rail.tsx`)

- Width: `44px`, background: `#080809`
- Right border: `1px solid rgba(255,255,255,0.04)`
- Contents top→bottom:
  - Amber "D" logo mark (22×22px, `border-radius: 5px`) — links to `/dashboard`
  - Repos icon (`FolderGit2` from lucide) — active state: `border-left: 2px solid #F59E0B`, no background change
  - Settings icon (`Settings`) — inactive by default
  - Spacer (`flex:1`)
  - User avatar circle (22×22px, `#1C1C1F` bg) at bottom — triggers sign-out or account menu
- No tooltips required for v1; icons are self-explanatory

### 3b. Context Panel (`components/layout/context-panel.tsx`)

- Width: `168px`, background: `#0C0C0E`
- Right border: `1px solid rgba(255,255,255,0.05)`
- **v1: context panel always shows Repos content** — Settings rail icon navigates to a future settings page; context panel does not change in this release.
- **When "Repos" is active in rail:**
  - Panel title: "Repositories" (`font-size:11px font-weight:700`)
  - Repo list: each repo is one row — left color stripe (2px, green=indexed / amber=indexing), repo name, expand chevron
  - Selected repo expands inline showing sub-nav: Overview · Ask · Onboard
  - Active sub-item: `border-left: 2px solid #6366F1` (indigo), `background: rgba(99,102,241,0.06)`
  - Indexing repo shows monospace `71%` instead of chevron
  - "+ Connect" link at bottom in muted color
- User avatar / sign-out at very bottom, same as icon rail bottom slot

### 3c. Dashboard Layout (`app/(dashboard)/layout.tsx`)

- Remove `<Navbar>` import and usage
- Layout: `flex flex-row min-h-screen` → `<IconRail>` + `<ContextPanel>` + `<main flex-1>`
- `<main>` has no internal padding from layout — each page sets its own

### 3d. Page Header Pattern (applied per page, not in layout)

Every dashboard page opens with:
```
<page-title font-size:20px font-weight:800 tracking-tight>
  {title}
</page-title>
<page-meta font-size:9px font-family:monospace color:dawn-muted>
  {metadata string}
</page-meta>
<div amber hairline: h-px bg-dawn-accent/60 w-8 mt-4 mb-0 />
<div full-width rule: h-px bg-dawn-border mt-0 mb-0 />
```

---

## 4. Landing Page (`app/page.tsx` + `components/landing/`)

### 4a. Nav (`components/landing/nav.tsx` — new file)

- Height: `44px`, fixed, `bg-[#09090B]/80 backdrop-blur border-b border-dawn-border`
- Left: `DevDayOne.` wordmark — `font-weight:800 tracking-tight`, amber period
- Right: "Docs" · "Pricing" links (muted) + "Sign in" amber button (`border-radius: 4px`)
- No background fill on scroll (border already separates it)

### 4b. Hero — Split Two-Column (`components/landing/hero.tsx` — rewrite)

Left column (~50%):
- Small indigo line + `font-size:9px` uppercase label "Powered by RAG + Groq"
- Headline: `font-size:clamp(32px,5vw,56px) font-weight:900 tracking-tighter` — "Every dev, ready on **day one.**" (amber on "day one.")
- `32px wide 2px tall` divider rule in `rgba(255,255,255,0.1)`
- Subtitle: `font-size:14px color:dawn-muted line-height:1.7`
- CTA pair: amber "Start free" button + muted text "No credit card · GitHub login"

Right column (~50%):
- Fake browser chrome (dot trio + URL bar in `#111113`)
- Inside: a representative chat exchange showing the product in action — user asks "How does auth work?", AI responds with inline code chips and filename source tags
- Below chrome: monospace caption "answered from 2,341 indexed files · 1.2s"
- GSAP entry animation retained (fade + translate-y, stagger left then right)

### 4c. Features (`components/landing/features.tsx` — rewrite)

- Three columns, no card borders
- Each: small colored square icon (amber / indigo / green, 20×20px `border-radius:5px`), `font-weight:600` title, muted description
- No decorative shadows or card backgrounds

### 4d. How It Works (`components/landing/how-it-works.tsx` — rewrite)

- Three steps in a row
- Step number: `font-size:32px font-weight:800 font-family:monospace color:dawn-border` (large, very muted)
- Step title below in normal weight
- Step description in muted small text
- No numbered badges or circles

### 4e. Footer

- Single row: left `DevDayOne.` wordmark, right `© 2026 Dev Day One`
- `font-size:11px color:dawn-muted`
- Top border: `1px solid dawn-border`

---

## 5. Login Page (`app/(auth)/login/page.tsx` — rewrite)

Two-column full-screen layout, no card border:

**Left column** (~55%, background `#0C0C0E`):
- Large `DevDayOne.` wordmark centered vertically
- Tagline beneath: "Every developer, ready from day one."
- Bottom of column: one trust line — e.g., "Built on the $0 stack · GitHub · Supabase · Groq"

**Right column** (~45%, background `#09090B`):
- Centered vertically: headline "Sign in", GitHub OAuth button (amber, full-width of inner container ~280px), fine print below
- No card border — white space does the containment

---

## 6. Repos List Page (`app/(dashboard)/repos/page.tsx` + `components/repos/repo-card.tsx`)

### repo-card.tsx → becomes repo-row.tsx

Replace `RepoCard` grid with a table-like list. Each `RepoRow`:
- Left: `2px × 32px` color stripe (`#4ADE80` indexed / `#F59E0B` indexing / `#3F3F46` not indexed)
- Repo name: `font-size:12px font-weight:600 tracking-tight`
- Below name: monospace metadata `font-size:9px color:dawn-muted` — "{n} files · {time} ago"
- Indexing state: inline progress bar (1.5px height) + monospace percentage, replaces metadata line
- Right: "Ask" button (`#1C1C1F` bg, muted text) + "Onboard" button (indigo tint bg + border)
- Row separator: `1px solid rgba(255,255,255,0.03)` (lighter than dawn-border)
- Hover: `background: rgba(255,255,255,0.015)` — barely perceptible

Remove the `grid` layout from the page; replace with `flex flex-col`.

### repos/page.tsx

- Page header pattern (see §3d)
- "+ New" button top-right: amber, `border-radius:4px font-weight:700`
- Skeleton loading: replace `<Skeleton className="h-24">` with row-shaped skeletons matching the new row height
- Empty state: `font-size:10px color:dawn-muted` plain text, no dashed box

---

## 7. Repo Detail Pages

### 7a. Layout (`app/(dashboard)/repos/[id]/layout.tsx`)

- Remove `<RepoTabs>` component — tabs are replaced by the sidebar sub-nav (Overview · Ask · Onboard in context panel)
- Layout renders breadcrumb + page header, then `{children}`
- Breadcrumb: `Repositories / {repo.full_name}` in `font-size:9px color:dawn-muted`

### 7b. Overview (`app/(dashboard)/repos/[id]/page.tsx`)

- Three editorial stat numbers in one contained block (`#111113` bg, subtle border):
  - Files indexed: `font-size:24px font-weight:800` in `dawn-text`
  - Chunks: `font-size:24px font-weight:800` in `dawn-accent` (amber)
  - Index time: `font-size:24px font-weight:800` in `dawn-ai` (indigo)
  - Each with `font-size:8px uppercase letter-spacing` label below
- Two quick-action cards below in a 2-col grid:
  - "Ask the codebase" — `border: 1px solid rgba(245,158,11,0.12)`, amber "Go to Ask →" link
  - "Onboard a new hire" — `border: 1px solid rgba(99,102,241,0.12)`, indigo "Go to Onboard →" link

### 7c. `IndexingProgress` component

Reuse existing realtime logic. Restyle:
- Replace `<Progress>` shadcn component with a raw `1.5px` div bar
- Show monospace `{n} / {total} files` and percentage
- Pulse dot (green when done, amber when in progress) instead of text badge

---

## 8. Chat Interface (`components/chat/chat-interface.tsx` — rewrite)

### Empty state

- Centered column: indigo `Sparkles` icon (24px)
- One-line heading: `font-size:13px font-weight:600`
- 3–4 suggested prompt chips: `font-size:10px border:1px solid dawn-border rounded padding:4px 10px` — clicking fills the input

### Messages

**User messages:**
- Right-aligned column
- `font-size:8px font-family:monospace color:dawn-muted` label "YOU" above
- Bubble: `background:#1C1C1F border-radius:8px 2px 8px 8px padding:8px 11px font-size:11px`

**AI messages:**
- Left-aligned column
- `font-size:8px font-family:monospace color:dawn-ai` label "AI" above
- No bubble — `border-left:2px solid dawn-ai padding:8px 11px font-size:11px line-height:1.7`
- Inline code: `font-family:monospace font-size:10px background:#1C1C1F padding:1px 4px border-radius:3px`
- Filename mentions: monospace, `color:dawn-accent`
- Source file tags below response: `font-size:8px border:1px solid dawn-border color:dawn-muted padding:2px 6px border-radius:3px font-family:monospace`

### Input bar

Replace separate `<Input>` + `<Button>` with a unified container:
- `background:#111113 border:1px solid rgba(255,255,255,0.07) border-radius:7px`
- Inner `<input>` unstyled (transparent bg, no border), `font-size:11px placeholder:dawn-muted`
- Indigo send button (22×22px, `border-radius:4px`) right-aligned inside container
- `border-top: none` — container floats above content with `padding:10px 18px 14px`

### MessageBubble (`components/chat/message-bubble.tsx`)

Apply above user/AI styles. If `message.role === "user"` → right-aligned bubble. If `"assistant"` → left-border treatment.

### SourceCitation (`components/chat/source-citation.tsx`)

Style as monospace file tags (see above). No card wrapping.

---

## 9. Connect Repo Form (`app/(dashboard)/repos/new/page.tsx` + `components/repos/connect-repo.tsx`)

Two-column form layout:
- Left (~45%): label `font-weight:600` + description `font-size:10px color:dawn-muted`
- Right (~55%): `<Input>` + amber submit button
- No card border around the form — use page header pattern for the page title

---

## 10. New shadcn/ui Components to Install

None required. All new UI uses existing primitives (`Button`, `Input`, `Skeleton`) or raw divs with Tailwind. The redesign moves away from heavy component usage toward intentional raw HTML for custom treatments.

**Remove usage of:**
- `<Badge>` — replaced by left color stripes and monospace text
- `<Progress>` — replaced by raw `1.5px` div bars (shadcn Progress component no longer used)

---

## 11. File Changes Summary

| File | Action |
|---|---|
| `app/globals.css` | Update `--radius`, add `--color-dawn-surface` |
| `app/(dashboard)/layout.tsx` | Replace Sidebar+Navbar with IconRail+ContextPanel |
| `components/layout/sidebar.tsx` | Delete |
| `components/layout/navbar.tsx` | Delete |
| `components/layout/icon-rail.tsx` | New |
| `components/layout/context-panel.tsx` | New |
| `components/layout/repo-tabs.tsx` | Delete (tabs move to sidebar) |
| `app/page.tsx` | Update nav markup |
| `components/landing/nav.tsx` | New |
| `components/landing/hero.tsx` | Rewrite |
| `components/landing/features.tsx` | Rewrite |
| `components/landing/how-it-works.tsx` | Rewrite |
| `app/(auth)/login/page.tsx` | Rewrite |
| `app/(dashboard)/repos/page.tsx` | Update layout, use RepoRow |
| `components/repos/repo-card.tsx` | Rename → `repo-row.tsx`, rewrite |
| `components/repos/indexing-progress.tsx` | Restyle |
| `app/(dashboard)/repos/[id]/layout.tsx` | Remove RepoTabs, add breadcrumb |
| `app/(dashboard)/repos/[id]/page.tsx` | Rewrite overview content |
| `components/chat/chat-interface.tsx` | Rewrite |
| `components/chat/message-bubble.tsx` | Rewrite styles |
| `components/chat/source-citation.tsx` | Restyle |
| `app/(dashboard)/repos/new/page.tsx` | Update layout |
| `components/repos/connect-repo.tsx` | Restyle as two-column form |

---

## 12. Out of Scope

- Logo / brand mark (deferred — to be handled separately with brand kit)
- OG image / favicon (deferred — depends on final logo)
- Dark/light mode toggle (app is dark-only)
- New pages or features (pure visual redesign)
- Backend changes
- Animation library changes (GSAP retained on landing hero)
