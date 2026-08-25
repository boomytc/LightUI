# drag-commit

Isolated playground for naming what a drag drop commits.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.
Pointer events + CSS. No dnd-kit, no framer-motion.

## Commands

From this directory, or `make dev-study STUDY=drag-commit` at repo root:

```bash
npm run dev          # http://127.0.0.1:5203/
npm test             # commitKind / insertIndexY / dropzoneHit / moveItem / transfer / snapback / threshold / edge scroll
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/drag-commit`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — commit, insert, hit, move, transfer, snapback, threshold, edge scroll (no DOM)
- `src/drag/` — four fixtures. Playground is a full-width document filling the pane; kinds are top chips.
- `src/StageView.tsx` — compact window fixture, one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=reorder|dropzone|transfer|snapback`, `state=idle|lift`

## Rules

- Keep the drag machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from outside this folder.
- Four leaves only: reorder, dropzone, transfer, snapback. A placeholder hole is a hint, not a fifth kind. Autoscroll lives inside the reorder playground (64px edge), not as a kind.
- A hole is not another commit. A snap-back is not a successful drop. A cross-list transfer is not a same-list reorder.
- Bind the standalone server to `127.0.0.1:5203`.
