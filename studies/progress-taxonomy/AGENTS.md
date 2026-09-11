# progress-taxonomy

Isolated playground for naming progress by whether it can be measured.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=progress-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5205/
npm test             # category / clamp / percent / steps / offset / loop
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/progress-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — category, clamp 0..1, step kinds, circular offset (no DOM)
- `src/meters/` — nine fixtures (4 determinate, 5 indeterminate). StudyView: family cards first, then kinds, meter large in the pane (not a 390 phone).
- `src/StageView.tsx` — one kind, one locked state, 390 fixture, no chrome
- `src/lib/stage-query.ts` — `kind=fill|steps|circular|liquid|spin|radar|dots|wave|button`, `state=mid|done|loop`

## Rules

- Keep the taxonomy machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Determinate walks 0→1 and stops. Indeterminate loops with no percent.
  Fill uses `scaleX`, not `width`. Stage steps are the work, not tab chevrons.
  `showPercent` is true only for determinate kinds.
- Bind the standalone server to `127.0.0.1:5205`.
