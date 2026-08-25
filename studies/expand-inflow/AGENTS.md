# expand-inflow

Isolated playground for naming extra content that pushes document flow
instead of covering it.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=expand-inflow` at repo root:

```bash
npm run dev          # http://127.0.0.1:5206/
npm test             # coversPage / exclusiveOpen / toggle / tree / readmore
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/expand-inflow`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — covers, exclusive, row-in-flow, toggle, tree
  select vs expand, read-more height (no DOM)
- `src/expand/` — the six fixtures. Playground is a full-width document
  filling the pane; kinds are top chips. Extra content is in flow.
  Do not `position: absolute` the extra block for row or accordion.
  Do not stamp a 390 phone in empty gray.
- `src/StageView.tsx` — compact window fixture, one kind, one locked
  state, no chrome
- `src/lib/stage-query.ts` — `kind=accordion|collapse|tree|row|readmore|card`;
  accordion `state=a|b`; tree `state=expanded|collapsed`; others `open|closed`

## Rules

- Keep the expand machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Six leaves only: accordion, collapse, tree, row, readmore, card.
  No drawer (that is interrupt / attach). No load-more (that is list growth).
- Height uses CSS grid `0fr` → `1fr`. Do not guess `max-height`.
- Bind the standalone server to `127.0.0.1:5206`.
