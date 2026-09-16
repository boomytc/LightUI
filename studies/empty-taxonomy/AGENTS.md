# empty-taxonomy

Isolated playground for naming why a view is empty: first-use creates, search revises the query, filters loosen, load error retries and keeps the list, all-done only celebrates.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=empty-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5229/
npm test             # emptyCause / emptyAction / showsPrimaryCta / keepsExistingList
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/empty-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — emptyCause, emptyAction, showsPrimaryCta, keepsExistingList (no DOM)
- `src/lib/workspace.ts` — sceneSeed + reduceWorkspace (no DOM)
- `src/empty/` — KindDemo, Customers, FollowUps, Composer
- `src/StageView.tsx` — one kind, one locked cause, no chrome; fixture stays 390
- `src/lib/stage-query.ts` — `kind=first-use|search|filter|error|done`, `state=empty|miss|banner|clear`

## Rules

- Keep the cause machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`empty/empty.css`).
- A miss is not “no data”. A load error is not empty. All done is not first-use.
  Only first-use gets a primary create. Error keeps the last list.
- Bind the standalone server to `127.0.0.1:5229`.
- Work page: the workspace fills the content column. Do not stamp `.empty-window` at 390.
- Stage stays 390. 390px viewport: stack, no horizontal scroll.
