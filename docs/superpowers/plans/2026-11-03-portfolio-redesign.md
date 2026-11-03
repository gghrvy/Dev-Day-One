# Portfolio Redesign — Phased Plan

Spec: `docs/superpowers/specs/2026-11-03-portfolio-redesign-design.md`

After every step: `npx tsc --noEmit`, backend `pytest`, `next build`. Screenshots at 1440px and 375px for each page touched, with an automated horizontal-scroll check.

## Step A: Foundation
- Replace the Inter/JetBrains fonts with Overpass and Overpass Mono (`next/font/google`) in `app/layout.tsx`.
- In `globals.css`: wayfinding tokens, the two radii, the focus-ring utility, and the reduced-motion base rules. Map the shadcn variables (`--background`, `--primary`, `--ring`…) onto the new tokens so the existing `ui/*` components pick them up.
- Restyle `ui/button`, `input`, `badge`, `skeleton`, `toast`, `modal`, `command-palette` and `logo-mark`.
- New components: `RouteLine` / `RouteStation` (the signature element) and `PageHeader` v2.

## Step B: Landing, terms, privacy
- Rebuild `components/landing/*` to the spec wireframe, with reserved slots for the demo notice, the "three steps" path and the waking-server line (wired in Phase 3).
- The hero route-line animation, with a reduced-motion fallback.
- Screenshots: `/`, `/terms`, `/privacy`.

## Step C: App shell
- Replace `icon-rail` + `context-panel` with a single `Sidebar` (desktop) and a `MobileNav` drawer (<1024px), using the same nav data source.
- Reserve the demo notice slot in `app/(dashboard)/layout.tsx`.

## Ordering note (needs your OK)

Without a logged-in Supabase session, the dashboard pages have nothing to render, so they can't be screenshotted or checked for real. **I propose doing the Phase 3 demo data path (backend fixtures + allow-list + frontend demo switch) right after Step C**, and then restyling the repo pages against the real sample data. All of Phase 3's tests and rules still apply; only the order changes.

## Step D: Repo pages (against sample data)
1. Overview + History
2. Ask + Onboard: route-line citations, code view, suggested questions
3. Architecture: node shapes, side sheet
4. Patterns, APIs, Impact
5. Decisions (ADRs) list/detail, Notes (knowledge) list

## Step E: Remaining pages
- Dashboard home, repos list, login, settings, admin and the "new" forms. These are restyled; in demo mode they're hidden or show a "not available in the public demo" state.

## Step F: Full QA pass
- Every route at 1440px and 375px: horizontal-scroll check, keyboard tab-through with a focus-ring screenshot, and reduced-motion emulation on the landing page.
- `ui-ux-pro-max` review checklist pass; fix what it finds.
