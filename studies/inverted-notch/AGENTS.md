# inverted-notch

Isolated playground for punching an inverted corner out of a parent clip.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=inverted-notch` at repo root:

```bash
npm run dev          # http://127.0.0.1:5178/
npm test             # notch / clip unit tests
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/inverted-notch`.

## Layout

- `idea.md` / `study.json` — cut vs stitch
- `src/StudyView.tsx` — teaching surface
- `src/lib/geometry.ts` — notch size, shape()/path(), scoop contrast (no DOM)
- `src/StageView.tsx` — one locked technique and chip/exploded state
- `src/lib/stage-query.ts` — `kind=shape|path|scoop`, `state=closed|open|exploded`

## Rules

- Keep `notchSize`, `svgPath`, and `punchesChipHole` free of React.
- Relative imports only. Tokens from `design/tokens.css`.
- Do not stitch the notch with a matching-color patch.
- Bind the standalone server to `127.0.0.1:5178`.
