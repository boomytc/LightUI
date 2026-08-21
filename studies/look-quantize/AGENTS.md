# look-quantize

Isolated playground for pointer-offset → smoothed look → discrete atlas cell.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, game shell, or tweakpane.

## Commands

From this directory, or `make dev-study STUDY=look-quantize` at repo root:

```bash
npm run dev          # http://127.0.0.1:5180/
npm test             # look vector / cell unit tests
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/look-quantize`.

## Layout

- `idea.md` / `study.json` — quantize, do not invent a continuous turn
- `src/lib/look.ts` — clamp, smooth, lookToCell, unique-cell hop fade, blink row (no DOM)
- `src/assets/look-atlas.png` — 7×3 look cells plus 7×3 blink rows
- `src/StageView.tsx` — `kind=center|left|right|up|blink`

## Rules

- Keep `targetFromOffset` and `lookToCell` free of React.
- Relative imports only. Tokens from `design/tokens.css`.
- This is not a mascot product. Bind `127.0.0.1:5180`.
