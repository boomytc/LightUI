# fill-taxonomy

Isolated playground for naming what a field discloses before filling, while filling, and after submit.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=fill-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5208/
npm test             # phaseOf / identityLost / shownCopy / sectionsFor / phoneRepair
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/fill-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — phaseOf, identityLost, fieldMark, shownCopy, hintKind, sectionsFor, phoneRepair, repairPlacement, outcomeComplete (no DOM)
- `src/fill/` — seven duty scenes grouped by before / during / after
- `src/fill/Playground.tsx` — desktop: form (~28–32rem) | three moments, filling the pane. No 390 cap.
- `src/StageView.tsx` — one kind, one locked state, no chrome; fixture stays `max-w-[390px]`
- `src/lib/stage-query.ts` — `kind=label|required|helper|group|hint|repair|done`, `state=naive|clear`

## Rules

- Keep the duty machines free of React. Helper and error never stack (`shownCopy`).
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- What to disclose is not fill versus pick. A field-level fix is not when
  the error speaks. A completed submit is not a toast.
- A placeholder is never a label. Color is not the only required signal.
- Repair names where the miss sits (`repairPlacement`), not when it speaks.
- When `state` is `naive` or `clear`, pick that card from `state`. Snapshot
  only fills values.
- Bind the standalone server to `127.0.0.1:5208`.
