# Touch Context Study Instructions

Read repository root `AGENTS.md` first.

## Scope

This study examines touch-driven context menus, focusing on hold timing, Euclidean drift cancellation, anchored placement, and viewport collision flipping.

## Local verification

```bash
npm test             # run pure machines tests
npm run typecheck    # verify typescript
npm run dev          # standalone playground at 127.0.0.1:5219
```

## Boundaries

- Pure algorithms live in `src/lib/machines.ts` without DOM dependencies.
- `StudyView.tsx` uses relative imports only.
- Tokens are imported from repository `design/tokens.css`.
