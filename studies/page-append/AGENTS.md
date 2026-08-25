# page-append

Isolated playground for naming a batch of records: replace the page, or append at the end.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=page-append` at repo root:

```bash
npm run dev          # http://127.0.0.1:5207/
npm test             # collectionMode / pageSlice / appendCount / collectionView
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/page-append`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — replace vs append, page slice, append count (no DOM)
- `src/records/` — one library of 24 cards; kinds are two chips
- `src/StageView.tsx` — compact window fixture, one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=page|append`, `state=page1|page2|partial|exhausted`

## Rules

- Keep the collection machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`records/records.css`).
- Two leaves only: page (replace, drop old, scroll to top) and append
  (grow visibleCount, keep old nodes, do not scroll to top).
- Append is a button. Do not auto-request on scroll. Paging is not a carousel.
- Bind the standalone server to `127.0.0.1:5207`.
- Work page: the library fills the pane. Do not stamp a 390 phone in empty gray.
- Stage stays a compact window. Locked fixture, no teaching chrome.
