# validation-taxonomy

Isolated playground for naming form errors by *when* they speak.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=validation-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5185/
npm test             # validateField / visibleErrors / shownByLesson
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/validation-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — validateField, visibleErrors, shownByLesson, month grid (no DOM)
- `src/form/` — one activity form; the kind switcher changes *when* errors appear
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=blur|inline|submit`, `state=error|ok`

## Rules

- Keep the timing machines free of React and date-fns. Compare dates as ISO strings.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- When to speak is not fill versus pick. An inline miss is not a toast.
  Marking every miss on submit is not a confirm modal.
- The idle-looking submit still receives a click (`aria-disabled`, not `disabled`).
- Bind the standalone server to `127.0.0.1:5185`.
