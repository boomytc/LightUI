# overlay-taxonomy

Isolated playground for naming floating layers by interrupt vs attach.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=overlay-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5183/
npm test             # interrupt / backdrop / popover cap / restoreFocus
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/overlay-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — interrupt, backdrop, anchor, restore, presence (no DOM)
- `src/overlays/` — the three fixtures. Playground is a full-width
  document (list / settings) filling the pane; kinds are top chips.
  Do not stamp a 390 phone in empty gray.
- `src/StageView.tsx` — compact window fixture, one kind, one locked
  state, no chrome
- `src/lib/stage-query.ts` — `kind=modal|drawer|popover`, `state=open|closed`

## Rules

- Keep the overlay machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Three leaves only: modal, drawer, popover. Delete in a popover opens a
  modal — that is composition, not a fourth kind.
- A content drawer is not a hamburger nav. A right drawer is not an
  off-canvas rail. A popover is not a dropdown that commits a value.
- Bind the standalone server to `127.0.0.1:5183`.
