# pending-taxonomy

Isolated playground for naming a wait: skeleton holds layout, empty offers a next step, veil covers an unknown shell.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=pending-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5204/
npm test             # reservesLayout / hasAction / allowsSpinner / occupancy
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/pending-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — reservesLayout, hasAction, allowsSpinner, occupancy (no DOM)
- `src/pending/` — three leaves: skeleton / empty / page veil. StudyView: occupancy cards + live window (not a 390 phone)
- `src/StageView.tsx` — one kind, one locked occupancy, no chrome; fixture stays 390
- `src/lib/stage-query.ts` — `kind=skeleton|empty|page`, `state=loading|ready|empty`

## Rules

- Keep the occupancy machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`pending/pending.css`).
- A skeleton is not a looping spinner. An empty state is not a notice.
  A veil is not a skeleton. None of the three leaves may spin.
  Empty copy is not 「暂无数据」. The veil must not draw a fake bar.
- Bind the standalone server to `127.0.0.1:5204`.
- Work page: the list fills the content column. Do not stamp `.pending-window` at 390.
- Stage stays 390. 390px viewport: stack, no horizontal scroll.
