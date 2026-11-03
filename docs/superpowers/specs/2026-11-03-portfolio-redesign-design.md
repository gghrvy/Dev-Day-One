# Dev Day One — Portfolio Redesign Spec

**Date:** 2026-11-03
**Replaces:** the visual direction in `2026-06-13-frontend-redesign-design.md` (that spec's two-tier sidebar and row-based lists are kept where noted).
**Scope:** every page in `frontend/app`, plus the slots Phase 3 (demo mode) needs.

## 1. What the product is, for whom, and the page's job

- **Subject:** your first day on an unfamiliar codebase. The product orients you: where things are, how they connect, and why they were built that way.
- **Audience:** engineers and hiring managers looking at a portfolio piece. They're technical, skeptical and short on time.
- **Primary job:** get a visitor from the landing page to a real, cited answer about the sample repo in under a minute.

## 2. Direction: wayfinding

The visual language comes from transit and road wayfinding: signage that tells a stranger *you are here, this way, next stop*. That is what the product does for a new engineer.

### Palette

| Name | Hex | Role |
|---|---|---|
| Graphite | `#191B1E` | Page background. A warm mid-dark, not near-black. |
| Asphalt | `#22252A` | Raised surfaces: panels, inputs, the code view |
| Kerb | `#33373D` | Rules, borders, inactive route segments |
| Chalk | `#ECE9E2` | Primary text |
| Fog | `#9AA0A8` | Secondary text and metadata (AA contrast on Graphite) |
| Signal | `#F2C230` | "You are here": active nav, primary action, focus ring. Used sparingly. |
| Route | `#4FB3A5` | Citations and links into code: anything that takes you to a file |

Status colours reuse these colours instead of adding new ones. Indexed is Route, in progress is Signal, failed is `#E5735C`, the only extra colour, used only for errors. The purple/indigo "AI" accent is removed completely.

### Type

**Overpass**, a typeface derived from the US Highway Gothic road-sign letterforms, for display and UI. **Overpass Mono** for code, file paths and line numbers only, never as decoration on labels. Both are loaded through `next/font/google`; Inter and JetBrains Mono go.

Scale (ratio 1.25 from a 16px base): 12.8 / 16 / 20 / 25 / 31 / 39 / 61 (landing display only).
- Headlines: weight 800, tight tracking (−0.02em), sentence case.
- Body: 400 at 16px, line-height 1.55, measure ≤ 72ch.
- Labels: sentence case. No all-caps eyebrows, no tracked-out labels.

### Radius and depth

There are two radii, chosen by hierarchy. 4px for controls (buttons, inputs, chips). 10px for the two kinds of large container (code view, graph canvas). Rows and lists get no radius. No shadows on flat surfaces; one shadow is used only for overlays (command palette, mobile drawer).

### The signature element: the route line

Cited answers draw a **route line**: a 2px vertical line in the left margin, with a station dot for each cited file. Each station is a link (`path:start–end`) in Route teal. The same device appears in three places:
1. the landing hero (a real question about the sample repo, its answer, and its route),
2. every chat answer in Ask and Onboard,
3. the "Try it in three steps" path. This is a real sequence, so numbered stations are honest there.

Nothing else on the site gets decorative treatment. All the boldness goes into this one element.

### Motion

- **One orchestrated moment:** on the landing hero, the route line draws in station by station (≈900ms total).
- Everything else moves only in response to the user: drawer open, row expand, streaming text.
- `prefers-reduced-motion`: the route appears fully drawn, and there are no transforms.

## 3. Layouts

### Landing (`/`)

```
┌──────────────────────────────────────────────────────────────┐
│ ▣ Dev Day One                          Open the demo   GitHub │
├──────────────────────────────────────────────────────────────┤
│ [Public demo notice slot — Phase 3]                           │
│                                                              │
│  Your first day on a                 ┌───────────────────────┐│
│  codebase, already                   │ Q: How does a chat     ││
│  oriented.                           │ answer get its sources?││
│                                      │ ●─ routers/rag.py:62-90 ││
│  Working tool, shown with sample     │ │  answer text…        ││
│  data: it reads its own source.      │ ●─ services/rag.py:24-55││
│  [Open the sample repo]              │ ●─ services/retriever…  ││
│                                      └───────────────────────┘│
│ ── Try it in three steps ─────────────────────────────────── │
│  ●──────────────●──────────────●                              │
│  Open the       Ask where       See what breaks               │
│  sample repo    auth lives      if you change it              │
│ ── What it shows you ────────────────────────────────────────│
│  Ask · Onboard · Architecture · Patterns · APIs · Impact      │
│  (one row each: name, one-line purpose, screenshot crop)      │
│ footer: source on GitHub · privacy · terms                    │
└──────────────────────────────────────────────────────────────┘
```

Left-aligned throughout, with a 12-column grid and a 1200px max width. The features are a list of rows with real screenshot crops, not a card grid. The fake terminal and the stats row are removed.

### App shell (`/dashboard/**`)

- **Desktop (≥1024px):** one 232px sidebar. The top holds the logo and repo switcher. Below it, the selected repo's pages form a vertical line: Overview, Ask, Onboard, Architecture, Patterns, APIs, Impact, Decisions (ADRs), Notes (knowledge), History. The current page is marked with a Signal "you are here" dot. Settings and the account link sit at the bottom. The 44px icon rail is removed.
- **Mobile (<1024px):** a 56px top bar (logo, current page name, menu button). The menu opens a full-height drawer with the same line nav. There is no horizontal scroll at 375px.
- **Every page:** the page header has a title, a single sentence explaining what the page shows, and actions on the right. The Phase 3 demo notice goes directly under the shell's top edge.

### Repo pages

- **Ask / Onboard:** a single column, ≤ 760px. Each answer has a route line with its citations, and code opens in an Asphalt code view. Suggested questions appear as plain text buttons.
- **Architecture:** a full-width graph canvas. Node types are told apart by shape and outline (service = square, database = cylinder-ish rounded, external = dashed), not by five extra colours. A side sheet shows details.
- **Patterns, APIs, Decisions, Notes, History:** rows with rules, no cards. The detail opens inline (Patterns: evidence list; Decisions: full record).
- **Impact:** the query, then the risk level as a sign plate (Signal for medium, error colour for high, Route for low), then the affected files as rows.

### Login / settings / admin

These are restyled to the same tokens. In demo mode they are hidden or show a short "not available in the public demo" state (Phase 3).

## 4. Quality floor (checked on every page)

- Screenshots at 1440px and 375px, with no horizontal scroll (`scrollWidth === clientWidth`).
- A visible 2px Signal focus ring with offset on every interactive element. The tab order follows reading order.
- `prefers-reduced-motion` respected.
- Text contrast is AA or better. Signal text is used only on Graphite/Asphalt (≈10:1), never Signal on Chalk.
- Every empty, loading and error state is written as an instruction ("Index this repo to ask questions"), with no apology text.

## 5. Out of scope

- Light theme.
- New features or backend changes; Phase 3 handles demo mode separately.
- Logo redesign: the existing `logo-mark.tsx` is recoloured to Signal on Graphite.
