# chart-read

Isolated playground for naming a chart gesture: readout, filter, range, window, or path.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.
Charts are SVG + pointer math — no Recharts, no d3.

## Commands

From this directory, or `make dev-study STUDY=chart-read` at repo root:

```bash
npm run dev          # http://127.0.0.1:5205/
npm test             # gestureClass / nearestIndex / brush / stats / legend / zoom / drill
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/chart-read`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — kind, class, nearest index, brush, stats, legend, zoom, drill (no DOM)
- `src/charts/` — one SVG line, bars for drill. Playground is kind chips filling the pane.
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=brush|crosshair|highlight|tooltip|legend|zoom|drill`;
  state per kind (`idle|frozen`, `hide|snap`, `anomaly|peak`, `hide|show`,
  `all|filtered`, `30|7|3`, `l1|l2`)

## Rules

- Keep the machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder. Extra CSS lives in `src/charts/charts.css` and is
  imported from a demo TSX, not from `styles.css`.
- A readout is not a window change. A legend is a filter, not decoration.
  A frozen brush is not zoom. Drill is a path on one chart, not a dashboard
  platter. Nearest-index snap is not gaze on a cell.
- Bind the standalone server to `127.0.0.1:5205`.
