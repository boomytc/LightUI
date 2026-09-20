# picker-taxonomy

Isolated playground for naming which picker a pick needs: a ruler snaps one tick, a range keeps two ends apart, a stepper stops at the floor, a cascade clears children when the parent changes, a date range ends after it starts.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=picker-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5230/
npm test             # choosePicker / snapRuler / applyRangeThumb / stepQty / cascadeSelect / pickDate
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/picker-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — choosePicker, snapRuler, applyRangeThumb, stepQty, cascadeSelect, pickDate (no DOM)
- `src/pickers/` — KindDemo plus the five leaves
- `src/StageView.tsx` — one kind, no chrome; fixture stays 390. The picker stays live; query only locks which leaf.
- `src/lib/stage-query.ts` — `kind=ruler|range|stepper|cascader|dates`, `state=snap|span|floor|path`

## Rules

- Keep the picker machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`pickers/pickers.css`).
- A ruler is not a range. A stepper is not a ruler. A sequential path is not a
  downward column. A date span is not two date fields. A horizontal ruler is not
  a wheel.
- Bind the standalone server to `127.0.0.1:5230`.
- Work page: the phone well fills the demo column. Do not stamp `.picker-phone` at 390.
- Stage stays 390. 390px viewport: stack, no horizontal scroll.
- Do not freeze pointer on the stage. Empty occupancy freezes so the cause
  does not change; these pickers teach by being used.
