# table-taxonomy

Isolated playground for where find, see, and act live on a record table: header facets, chips, amount sort, a sticky header, column visibility, one row action, and a bulk bar that waits for a count.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=table-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5231/
npm test             # rowMatches / cycleSort / chips / columnOn / selectionMark / reduceDesk
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/table-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — rowMatches, visibleCustomers, cycleSort, chipsOf, columnOn, bulkVisible, selectionMark, reduceDesk (no DOM)
- `src/lib/seed.ts` — example customers
- `src/table/` — Playground, Desk, panels
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=filter|sort|sticky|actions|columns|bulk|chips` and `state`

## Rules

- Keep the machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from outside this folder.
- A facet draft does not change the table until Apply. OR inside a facet, AND across facets. The name query is not a chip.
- Sort cycles none → desc → asc → none and does not change the count.
- The header sticks inside the table scrollport. The name column cannot be hidden.
- View stays on the row. Delete sits in the overflow, after a separator.
- The bulk bar replaces search only when the selection count is above zero. Select-all checks the visible rows.
- Stage locks one leaf. `?kind=&state=` are the capture params. The table stays usable.
- Bind the standalone server to `127.0.0.1:5231`.
- The work page fills the content column. The stage fixture is `max-w-3xl`.
