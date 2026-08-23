# align-craft

Isolated playground for naming what a seam aligns: baseline, focus, or box.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=align-craft` at repo root:

```bash
npm run dev          # http://127.0.0.1:5193/
npm test             # aligns / object-fit / object-position
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/align-craft`.

## Layout

- `idea.md` / `study.json` — baseline vs focus vs box
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — `aligns`, `objectFitFor`, `needsObjectPosition` (no DOM)
- `src/craft/` — seven WRONG / RIGHT constructions
- `src/StageView.tsx` — one kind, one locked wrong|right, no chrome
- `src/lib/stage-query.ts` — `kind=baseline|cover|axis|margin|padding|optical|inset`, `state=wrong|right` (default baseline/right)
- `src/align.css` — imported from TSX so the lab picks it up

## Rules

- Keep `aligns`, `objectFitFor`, and `needsObjectPosition` free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Cover fills with `object-fit: cover` and puts `object-position` on the
  subject (`50% 88%`), not default `50% 50%`.
- Bind the standalone server to `127.0.0.1:5193`.
