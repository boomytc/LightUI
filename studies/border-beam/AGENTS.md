# border-beam

Isolated playground for a highlight that travels the border, not the card face.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=border-beam` at repo root:

```bash
npm run dev          # http://127.0.0.1:5197/
npm test             # path / reduced-motion machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/border-beam`.

## Layout

- `idea.md` / `study.json` — travel the border, do not flood the card
- `src/lib/machines.ts` — `pathOf` is `border` | `fill`; `shouldAnimate` is false when reduced (no DOM)
- `src/beam.css` — imported from the card TSX (`@property` angle + conic-gradient)
- `src/StageView.tsx` — `kind=beam|fill`, `state=run|park`

## Rules

- Keep path and motion helpers free of React.
- Relative imports only. Tokens from `design/tokens.css`.
- Bind the standalone server to `127.0.0.1:5197`.
- Brand accent only. No rainbow. Reduced motion is a static stroke.
