# path-morph

Isolated playground for vector path morphing: 2D Procrustes similarity alignment and polar interpolation versus naive Cartesian coordinate lerp.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. Pure math pipeline without runtime DOM dependencies or external animation libraries.

## Commands

From this directory, or `make dev-study STUDY=path-morph` at repo root:

```bash
npm run dev          # http://127.0.0.1:5214/
npm test             # invariants: Procrustes, polar interpolation, corners, surjective matching
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/path-morph`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/StageView.tsx` — one preset, one locked state, no chrome
- `src/lib/core/` — pure DOM-free math pipeline (parse, normalize, resample, plan, interpolate, serialize, spring)
- `src/lib/presets.ts` — curated iconic pairs (Menu↔X, ArrowRight↔Down, Play↔Pause, Plus↔Cross...)
- `src/lib/morph-machine.ts` — frame evaluation and geometric metrics
- `src/morph/Playground.tsx` — dual side-by-side comparison stage + scrubber + diagnostics

## Rules

- Keep the math pipeline strictly DOM-free.
- Relative imports only (`../lib/...`). The lab compiles this tree from outside this folder.
- Bind the standalone server to `127.0.0.1:5214`.
