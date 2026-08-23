# layout-taxonomy

Isolated playground for naming a page by its skeleton.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=layout-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5189/
npm test             # measure / bleed / uneven / panes
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/layout-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — measure, bleed, uneven height, pane count, split clamp (no DOM)
- `src/layouts/` — seven miniature pages in a window frame
- `src/StageView.tsx` — one kind, `state=default`, no chrome
- `src/lib/stage-query.ts` — `kind=single|landing|masonry|fullscreen|splitter|dashboard|modular`, `state=default`

## Rules

- Keep the layout machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`layouts/layout.css`).
- The whole-page skeleton is not sidebar occupancy. Column layout is not
  where the top bar goes. Masonry is not a carousel. A splitter is not a drawer.
- Bind the standalone server to `127.0.0.1:5189`.
