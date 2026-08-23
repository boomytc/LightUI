# nav-taxonomy

Isolated playground for naming site nav by placement, reveal, and scroll.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=nav-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5177/
npm test             # crumb / spy / shrink machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/nav-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/crumb.ts` — trail / current / shorten (no DOM)
- `src/lib/spy.ts` — pick the intersecting section (no DOM)
- `src/lib/shrink.ts` — enter 40 / leave 16 (no DOM)
- `src/navs/` — the nine fixtures
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `references/` — optional local stills from `make stills` (not committed)

## Rules

- Keep the three machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- A breadcrumb is not the primary nav. A drawer is not a full-screen overlay.
- Bind the standalone server to `127.0.0.1:5177`.
- Placement only reads on a page. The playground demo is a full-width page
  mock filling the content column (`min-h` 28rem). Kinds are a top chip row.
  Do not wrap the demo in a 390 phone sitting in a void.
- At 390 the page mock is 100% of viewport-gutter. Hamburger models stay
  usable. No page-level horizontal scroll.
- `StageView` may stay a 390 fixture.
