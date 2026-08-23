# timer-taxonomy

Isolated playground for naming a session clock: count up, or count down.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=timer-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5198/
npm test             # liveSeconds / pause / remaining / sessionProgress
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/timer-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — liveSeconds, remaining, start / pause / end (no DOM)
- `src/timer/` — two leaves in a full-width desk well; stage still uses a window frame
- `src/StageView.tsx` — one kind, one locked snapshot, no chrome, 390 fixture
- `src/lib/stage-query.ts` — `kind=stopwatch|focus`, `state=idle|running|paused|done`

## Rules

- Keep the timer machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`timer/timer.css`).
- A stopwatch has no session cap and no session percent. Focus counts down
  and pauses at 0. Hitting zero is not a toast. While running, a header chip
  still shows the session on another fake page. Do not replace the number
  with a spinner.
- Bind the standalone server to `127.0.0.1:5198`.
- Work page: the clock is the idea — full-width well, kinds as 累计/专注
  on top, occupancy chip in the remaining space (not a phone chrome).
  Stage stays a 390 fixture. Stack, no horizontal scroll.
