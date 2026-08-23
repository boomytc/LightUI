# button-taxonomy

Isolated playground for naming a click by weight: solid, outline, text.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=button-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5190/
npm test             # weight / filled / tooManyPrimaries / roleFor
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/button-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — weight, fill, primary cap, role (no DOM)
- `src/buttons/` — one scene: the trio, plus a two-solid wrong bar
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=solid|outline|text`, `state=ok|wrong`

## Rules

- Keep the weight machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Three leaves only: solid, outline, text. Radius, icons, and tone are
  skin, not extra kinds. One filled primary per region.
- Button weight is not fill versus pick. A primary is not “the only
  action in a dialog.” A text button is not link navigation.
- Bind the standalone server to `127.0.0.1:5190`.
