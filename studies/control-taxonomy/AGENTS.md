# control-taxonomy

Isolated playground for naming a form slot by fill vs pick.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=control-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5182/
npm test             # chooseControl / filterMembers / toggleCapped
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/control-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — the fill/pick tree, member filter, capped toggle (no DOM)
- `src/fields/` — chooser + the six fixtures. Playground is a 12-col: kinds/chooser ~4, live pane ~8 filling height (not a phone). Stage stays compact.
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=text-field|textarea|select|combobox|radio|checkbox`, `state=<fixture>`

## Rules

- Keep the decision tree free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Select here is a short list that closes on pick, not the overlay commit
  taxonomy. Visible radios/checkboxes are not a dropdown.
- Bind the standalone server to `127.0.0.1:5182`.
