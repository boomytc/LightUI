# login-taxonomy

Isolated playground for naming a login by how arrival is staged.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=login-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5192/
npm test             # paneCount / isStepped / needsRole
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/login-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — pane count, stepped, role gate (no DOM)
- `src/logins/` — five miniature logins in a window frame
- `src/StageView.tsx` — one kind, `state=default` (steps may use `1|2`), no chrome
- `src/lib/stage-query.ts` — `kind=centered|split|immersive|roles|steps`, `state=default|1|2`

## Rules

- Keep the staging machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`logins/login.css`).
- Fields are inert. Only `steps` may advance a screen. No session, no server.
- How the login card sits is not the page skeleton. Login is not a selling hero.
- Bind the standalone server to `127.0.0.1:5192`.
