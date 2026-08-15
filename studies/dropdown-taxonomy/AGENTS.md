# dropdown-taxonomy

Isolated playground for naming overlay pickers by commit model.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=dropdown-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5175/
npm test             # multi / cascader / date-range machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/dropdown-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/multi-select.ts` — toggle / max / remove (no DOM)
- `src/lib/cascader.ts` — parent expands, leaf commits (no DOM)
- `src/lib/date-range.ts` — from / to / nights / past lock (no DOM)
- `src/overlays/` — the seven fixtures
- `references/` — first-party lab stills and the Remotion film (`make films`)

## Rules

- Keep the three machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Grouped Select must not build a path. Cascader must not commit a parent.
- Bind the standalone server to `127.0.0.1:5175`.
