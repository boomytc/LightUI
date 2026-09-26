# transcript-stream

Isolated playground and interactive study for real-time multi-speaker speech streaming stenography, late-bound speaker identification, cross-talk collision, and minutes handoff.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.
No model calls, no API keys. Uses simulated real-time event sequences conforming to the streaming meeting protocol.

## Commands

From this directory, or `make dev-study STUDY=transcript-stream` at repo root:

```bash
npm run dev          # http://127.0.0.1:5232/
npm test             # processMeetingEvent / calcSessionMetrics / filterTurns / getSpeakerTheme
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/transcript-stream`.

## Layout

- `idea.md` / `study.json` — multi-speaker streaming turns, late-bound identification, cross-talk, minutes
- `src/StudyView.tsx` — interactive 3-phase teaching surface
- `src/lib/types.ts` — event contract & session data models
- `src/lib/machines.ts` — event reduction, telemetry computation, speaker palettes, stage snapshotting
- `src/lib/mock-data.ts` — realistic streaming event sequences with cross-talk and late identity resolution
- `src/components/` — `VoiceprintDrawer`, `LiveStage`, `MinutesBoard`
- `src/StageView.tsx` — fixture without lab chrome
- `src/lib/stage-query.ts` — `kind=live|prep|summary`, `state=default|overlap|drawer`

## Rules

- Keep the machines free of React and DOM.
- Relative imports only (`../lib/...`). The lab compiles this tree from outside this folder.
- Follow the `StreamingMeetingEvent` protocol strictly.
- Bind the standalone server to `127.0.0.1:5232`.
