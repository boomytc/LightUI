# intent-cascade

Isolated playground for cascade-menu intent prediction.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=intent-cascade` at repo root:

```bash
npm run dev          # http://127.0.0.1:5174/
npm test             # geometry unit tests
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/intent-cascade`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/geometry.ts` — triangle / slope / intent tests (no DOM)
- `src/intent/useIntentCascade.ts` — pointer sampling, protection, rest delay
- `references/` — optional local stills / film from `make films` (not committed)

## Rules

- Keep `predictsIntent` and `pointInTriangle` free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Visualization (blue / green overlay) is teaching chrome. The real test
  uses the *previous* pointer sample as the third triangle vertex.
- Bind the standalone server to `127.0.0.1:5174`.
