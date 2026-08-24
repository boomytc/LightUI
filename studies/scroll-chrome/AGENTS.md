# scroll-chrome

Isolated playground for overflow chrome: a start cue, or a position track.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=scroll-chrome` at repo root:

```bash
npm run dev          # http://127.0.0.1:5200/
npm test             # hidesNative / cue / track / seek machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/scroll-chrome`.

## Layout

- `idea.md` / `study.json` — cue vs track vs native thumb
- `src/lib/machines.ts` — `hidesNative`, `showsCue`, `showsTrack`, `focusDot`, `seekTop` (no DOM)
- `src/chrome/Pane.tsx` — one overflowing cell; track binds to that viewport
- `src/StageView.tsx` — `kind=native|cue|track`, `state=start|mid|end|fit`. Fixture stays 390.

## Rules

- Keep visibility and seek helpers free of React.
- Relative imports only. Tokens from `design/tokens.css`.
- Bind the standalone server to `127.0.0.1:5200`.
- Do not stitch cue and track into one morph. Do not treat dots as headings.
- Track is hidden when the pane fits. Reduced motion snaps extensions and skips the bob.
- Stage stays 390.
