# Cursor Spring Study Instructions

Read repository root `AGENTS.md` first.

## Scope

This study examines presence cursor tracking in real-time collaborative software under low-frequency discrete network sampling, focusing on 2nd-order spring-mass-damper physics, semi-implicit Euler integration, sub-stepping, and deadband settling.

## Local verification

```bash
npm test             # run pure machines tests
npm run typecheck    # verify typescript
npm run dev          # standalone playground at 127.0.0.1:5226
```

## Boundaries

- Pure algorithms live in `src/lib/machines.ts` without DOM dependencies.
- `StudyView.tsx` and `StageView.tsx` use relative imports only.
- Tokens are imported from repository `design/tokens.css`.
