---
name: lightui-study
description: >
  Extract or add a LightUI study: idea.md, study.json, isolated playground,
  and StudyView export. Use when replicating a UI/UX behavior, extracting
  from an external demo or sandbox, creating studies/<slug>, or the user
  says add study / extract idea / 抽离 / 复刻交互. Slash command: /lightui-study.
---

# Add or extract a study

Do not invent a second copy of these rules. Follow the files:

- `docs/conventions.md` — naming, required files, after-add checks
- `docs/study-contract.md` — `study.json` fields and `StudyView` contract
- `studies/intent-cascade/` — the reference implementation

## Procedure

1. Decide **kind vs new study**. Same question, new skin → add a kind
   to the existing study. A new first question → new `studies/<slug>/`.
   See `docs/conventions.md`. Name the **behavior** (`intent-cascade`,
   not `grok-demo`).
2. Write `idea.md` **before** scaffolding UI. Problem, rule, why not the
   naive alternative. Do not add lineage or a kept/dropped source diary.
3. Add `study.json` matching the folder slug. Set `created` and
   `updated` (`YYYY-MM-DD`). Set `asks` (the question this study
   answers) and `links` to the next question (`after`) or a mix-up
   (`contrast`). Do not list neighbor studies in `idea.md`.
4. Implement the playground in `studies/<slug>/`. Export
   `StudyView` from `src/StudyView.tsx` and `StageView` from
   `src/StageView.tsx` (one kind, one locked state, no chrome).
   Standalone chrome stays in `src/App.tsx` only (`?stage=1` mounts
   the stage).
5. Relative imports only. Tokens from `design/tokens.css`. Bind
   `127.0.0.1`. Give the study its own port (lab is 5173; next free is
   in `docs/conventions.md`).
6. Do not edit a lab registry. Discovery is `import.meta.glob`.
7. Run `make catalog`, then `make test` and `make typecheck`.
8. Open `/studies` and `/s/<slug>`. Exercise the interaction, not just a
   screenshot. Check the 理念 tab renders `idea.md`.

## Extracting from an external project

Copy the teaching surface and the rule (geometry, timing, state). Leave
behind routers, auth, databases, PWA, preview bridges, and deploy
adapters. Do not copy sandbox screenshots or source clips. Do not commit
stills or mp4s into `references/` — those are generated from the
stage (`make stills`) and gitignored. `SOURCE.md` is operator-only
if present. Do not screenshot `/s/<slug>` teaching pages.
