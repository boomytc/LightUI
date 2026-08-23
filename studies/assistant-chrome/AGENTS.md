# assistant-chrome

Isolated playground for naming where the assistant lives.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.
No model calls, no API keys. Chat uses fake messages only.

## Commands

From this directory, or `make dev-study STUDY=assistant-chrome` at repo root:

```bash
npm run dev          # http://127.0.0.1:5195/
npm test             # occupiesPage / needsSelection / chromeVisible / shouldSendOnEnter
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/assistant-chrome`.

## Layout

- `idea.md` / `study.json` — where the assistant lives
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — occupiesPage, needsSelection, chromeVisible, shouldSendOnEnter (no DOM)
- `src/chrome/` — six miniature windows
- `src/StageView.tsx` — one kind, one locked state, no chrome
- `src/lib/stage-query.ts` — `kind=chat|panel|plugin|float|canvas|invisible`, `state=default` (`plugin` uses `state=open` for the toolbar)

## Rules

- Keep the chrome machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`chrome/chrome.css`).
- Where the assistant lives is not the page skeleton. A selection toolbar
  is not a dialog. A suggestion card is not a chat stream.
- Enter must not send while IME is composing (`isComposing` / keyCode 229).
- Bind the standalone server to `127.0.0.1:5195`.
- 390px: no horizontal scroll.
