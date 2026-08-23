# notify-taxonomy

Isolated playground for naming a notice by interruption weight.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=notify-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5184/
npm test             # weight / dismiss / badge / persist machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/notify-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — weight, dismiss, persist, badge label (no DOM)
- `src/notices/` — the seven fixtures
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=badge|toast|snackbar|marquee|inbox|alert|banner`, `state=on|off` (badge also `state=<count>`)

## Rules

- Keep the weight machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- A notice does not interrupt the task. Alert must be seen, but it is not
  a modal. Marquee scrolls copy in one strip; it is not a carousel.
- 0 unloads a numeric badge — do not leave an empty dot.
- Bind the standalone server to `127.0.0.1:5184`.
