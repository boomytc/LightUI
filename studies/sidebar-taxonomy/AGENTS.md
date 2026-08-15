# sidebar-taxonomy

Isolated playground for naming left rails by space model.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=sidebar-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5176/
npm test             # wheel / accordion / occupy machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/sidebar-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/wheel.ts` — step / offset / baseline visual (no DOM)
- `src/lib/accordion.ts` — parent toggle / default child (no DOM)
- `src/lib/space.ts` — occupy vs overlay widths (no DOM)
- `src/rails/` — the five fixtures
- `references/` — first-party lab stills and the Remotion film (`make films`, pipeline in LightWeaver)

## Rules

- Keep the three machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Collapsible must still occupy when shut. Off-canvas must occupy zero.
- A wheel is a selector, not a tree. A parent files; it is not a page.
- Bind the standalone server to `127.0.0.1:5176`.
