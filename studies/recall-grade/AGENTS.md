# recall-grade

Isolated playground for a two-face recall card: the flip is to compare; the commit is a grade that schedules the next interval.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=recall-grade` at repo root:

```bash
npm run dev          # http://127.0.0.1:5199/
npm test             # dueCards / canGrade / applyGrade / intervalDays / nextIndexAfterGrade
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/recall-grade`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — dueCards, canGrade, applyGrade (no DOM)
- `src/recall/` — one deck in a window frame
- `src/StageView.tsx` — one kind `deck`, one locked face, no chrome
- `src/lib/stage-query.ts` — `kind=deck`, `state=question|answer|empty` (default `answer`)

## Rules

- Keep the scheduling machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`recall/recall.css`).
- Question face cannot grade. Again resets the count and stays due today.
  Hard keeps the count and waits one day. Good steps `[1, 3, 7, 14, 30]`.
- Empty copy is not 「暂无数据」. Grades are not a confirm dialog.
  Do not ship a live swipe carousel as a second product.
- Bind the standalone server to `127.0.0.1:5199`.
- 390px: stack, no horizontal scroll.
