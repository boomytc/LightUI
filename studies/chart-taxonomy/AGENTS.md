# chart-taxonomy

Isolated playground for naming a chart by intent, then mark.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.
Charts are small SVG/CSS — no Recharts, no d3.

## Commands

From this directory, or `make dev-study STUDY=chart-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5187/
npm test             # intent / mark / axis / pie / line-requires-time
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/chart-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — intent, mark, axis-from-zero, pie cap (no DOM)
- `src/lib/catalog.ts` — sample series
- `src/charts/` — six intent fixtures as SVG marks
- `src/StageView.tsx` — one kind, one locked followup, no chrome
- `src/lib/stage-query.ts` — `kind=change|compare|share|relate|flow|ability`, `state=primary|alt`

## Rules

- Keep the taxonomy machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder. Extra CSS lives in `src/charts/charts.css` and is
  imported from a demo TSX, not from `styles.css`.
- The first question is intent, not a chart-type encyclopedia.
  Time trends are not pies. Long names are not columns.
- Bind the standalone server to `127.0.0.1:5187`.
