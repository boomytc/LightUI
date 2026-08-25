# container-morph

Isolated playground for naming a continuous morph: width, height, radius,
or layout; hold the expanded state, or reverse along the same path.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.
No framer-motion. CSS transitions only.

## Commands

From this directory, or `make dev-study STUDY=container-morph` at repo root:

```bash
npm run dev          # http://127.0.0.1:5202/
npm test             # morphAxis / morphBox / reverseBeat / locksSize
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/container-morph`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — axis, anchor, box, reverse beats (no DOM)
- `src/morph/` — one document fixture; kinds are top chips.
  Do not stamp a 390 phone in empty gray.
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=circle-pill|…`,
  `state=collapsed|expanded` (reverse: `card|pill|dot`)

## Rules

- Keep the morph machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder. Do not rely on `@/` in StudyView / StageView.
- Seven leaves: circle-pill, pill-card, compact, radius, size, reflow,
  reverse. Changing radius is hierarchy, not scale. Reverse is content
  out, then height, then width — not a fade-unmount.
- Extra CSS is imported from a file in the `StudyView` tree (`morph/morph.css`).
- Bind the standalone server to `127.0.0.1:5202`.
- Work page: the document fills the content column.
