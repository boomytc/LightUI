# tab-taxonomy

Isolated playground for naming in-page tabs by selection model.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=tab-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5181/
npm test             # indicator / pill / step / card / folder machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/tab-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — text bar, step kinds, card radius, folder z, 30° bevel (no DOM)
- `src/tabs/` — the six fixtures
- `src/StageView.tsx` — one kind, one locked tab, compact stamp (no 390 wrap)
- `src/lib/stage-query.ts` — `kind=linear|card|chevron|segmented|folder|image`, `state=<tab id>`

The playground is a full-width panel in the content column: kinds as top chips, the tab model spanning the panel, the body using leftover height. Do not wrap the teaching demo in a 390 stamp.

## Rules

- Keep the geometry machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Linear measures the text span, not the cell. Chevron is a sequence, not
  sibling views. Segmented slices one dataset.
- Bind the standalone server to `127.0.0.1:5181`.
