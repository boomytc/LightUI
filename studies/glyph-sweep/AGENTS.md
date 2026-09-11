# glyph-sweep

Isolated playground for a text sweep that follows glyphs.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=glyph-sweep` at repo root:

```bash
npm run dev          # http://127.0.0.1:5179/
npm test             # duration / spread unit tests
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/glyph-sweep`.

## Layout

- `idea.md` / `study.json` — follow glyphs, not the box
- `src/lib/shimmer.ts` — duration = length × seconds per glyph, spread in `ch` (no DOM). Box path is a fixed 1.8s / 72px sheen.
- `src/sweep.css` — glyph clip geometry unchanged; compare grid is two wells (跟字形 | 扫整块).
- `src/StageView.tsx` — `kind=classic|aurora|flame`, `state=run|park`. Stage stays the glyph path.

## Rules

- Keep duration and spread helpers free of React.
- Relative imports only. Tokens from `design/tokens.css`.
- Bind the standalone server to `127.0.0.1:5179`.
