# dashboard-layers

Isolated playground for drilling a board from the result versus serving a platter.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.
Charts are small SVG — no Recharts, no d3.

## Commands

From this directory, or `make dev-study STUDY=dashboard-layers` at repo root:

```bash
npm run dev          # http://127.0.0.1:5194/
npm test             # layerOf / showsAll / canExpand
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/dashboard-layers`.

## Layout

- `idea.md` / `study.json` — drill vs platter
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — layerOf, showsAll, canExpand (no DOM)
- `src/lib/dashboard-data.ts` — one ops fixture, short sparks
- `src/board/` — two leaves in a window frame
- `src/StageView.tsx` — one kind, one locked layer, no chrome
- `src/lib/stage-query.ts` — `kind=layered|platter`, `state=kpi|dim|all`

## Rules

- Keep the layer machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`board/board.css`).
- Drilling is not switching the chart mark. Layers are not a dashboard skin.
- Bind the standalone server to `127.0.0.1:5194`.
- Stage fixture is 390px: stack, no horizontal scroll.
- Playground board fills the work pane. KPI grid and drill columns use
  container queries on the board, not the viewport.
