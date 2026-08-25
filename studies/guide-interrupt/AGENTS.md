# guide-interrupt

Isolated playground for naming a teaching interrupt: when it appears,
what it pins to, how it advances, and whether it still blocks after.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=guide-interrupt` at repo root:

```bash
npm run dev          # http://127.0.0.1:5204/
npm test             # advance / block / persist / skip / hotspot / hint / tour / cutout
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/guide-interrupt`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — kind → advance / block / persist / skip, plus
  hotspot, hint, tour, checklist, cutout pad (no DOM)
- `src/guides/` — one workbench; kinds are top chips. Do not stamp a
  390 phone in empty gray.
- `src/StageView.tsx` — compact window fixture, one kind, one locked
  state, no chrome
- `src/lib/stage-query.ts` — `kind=tour|coach|hotspot|spotlight|checklist|hint`;
  tour `state=step1|step2|done`, hotspot `unread|open|read`, others `start|mid|done`

## Rules

- Keep the guide machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Six leaves only. Spotlight has no Next — the real control in the hole
  advances. Checklist stays at 100%. Hint unmounts when the field is filled.
- A spotlight is not a confirm dialog. A hotspot is not an unread badge.
  A hint is not a validation error. A cutout scrim is not a card notch.
- Bind the standalone server to `127.0.0.1:5204`.
