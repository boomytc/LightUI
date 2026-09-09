# Swipe Action Study Instructions

Read repository root `AGENTS.md` first.

## Scope

This study examines list row swipe actions, focusing on axis disambiguation, latching thresholds, single-row exclusivity, and overswipe commits.

## Local verification

```bash
npm test             # run pure machines tests
npm run typecheck    # verify typescript
npm run dev          # standalone playground at 127.0.0.1:5218
```

## Boundaries

- Pure algorithms live in `src/lib/machines.ts` without DOM dependencies.
- `StudyView.tsx` uses relative imports only.
- Tokens are imported from repository `design/tokens.css`.
