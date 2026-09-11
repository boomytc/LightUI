# locator-taxonomy study

Study of in-page locators for long pages.

- `study.json` declares the slug, asks, and links.
- `idea.md` explains why naive continuous scrolling fails and how the 7 locator models map to user intents.
- `src/lib/machines.ts` holds pure algorithms (progress ratio, threshold checks, search score/highlight).
- `src/StudyView.tsx` exports the teaching surface.
- `src/components/playground.tsx` is the intent-first playground.
- `src/StageView.tsx` exports the stage fixture.
