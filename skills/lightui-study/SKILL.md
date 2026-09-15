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
- `studies/intent-cascade/` — study-shape reference
- `studies/cursor-spring/` — Grok/vibe sandbox extract reference

## Procedure

1. Decide **kind vs new study**. Same question, new skin → add a kind
   to the existing study. A new first question → new `studies/<slug>/`.
   The question may be a machine/taxonomy, a construction (cut vs stitch),
   a motion that follows type/scroll, continuous input quantized to
   discrete state, or sparse samples rebuilt as continuous motion. See
   `docs/conventions.md`. Name the **behavior** (`intent-cascade`,
   `inverted-notch`, not `grok-demo`). Do not add a lab nav module or a
   workspace component library to “make room”.
2. Write `idea.md` **before** scaffolding UI. Problem, rule, why not the
   naive alternative. Do not add lineage or a kept/dropped source diary.
3. Add `study.json` matching the folder slug. Set `created` and
   `updated` (`YYYY-MM-DD`). Set `asks` (the question this study
   answers) and `links` to the next question (`after`) or a mix-up
   (`contrast`). Do not list neighbor studies in `idea.md`.
4. Implement the playground in `studies/<slug>/`. Export
   `StudyView` from `src/StudyView.tsx` and `StageView` from
   `src/StageView.tsx` (one kind, one locked state, no chrome).
   `StudyView` follows the question — not a mandatory seven-kind
   switcher. Stage query is per-study; do not force `closed|open` on
   ideas that are not open/closed widgets. Standalone chrome stays in
   `src/App.tsx` only (`?stage=1` mounts the stage).
5. Relative imports only. Tokens from `design/tokens.css`. Bind
   `127.0.0.1`. Give the study its own port (lab is 5173; next free is
   in `docs/conventions.md`).
6. Do not add the study to a catalog array. Discovery is `import.meta.glob`.
   Do update the after-add files listed in `docs/conventions.md` (port,
   lab `SLUG_CATEGORY_MAP` + its test counts, `scripts/capture-stage.py`
   `SHOTS`).
7. Run `make catalog`, then `make test` and `make typecheck`.
8. Open `/studies` and `/s/<slug>`. Exercise the interaction, not just a
   screenshot. Check the 理念 tab renders `idea.md`. Confirm the category
   chip. If the source was a sandbox, move
   `sandboxes/unintegrated/<name>/` → `sandboxes/integrated/<name>/`.

## Extracting from a Grok / vibe sandbox

Dumps are gitignored under `sandboxes/`. New dumps:
`sandboxes/unintegrated/<name>/`. After extract: that folder →
`sandboxes/integrated/<name>/`. Never under `studies/` (workspaces +
lab glob).

A dump is a full App Builder app (TanStack Start, auth, PWA, preview).
Do not load its `.grok/skills`. Do not copy its `AGENTS.md`. Do not run
it as the study.

1. Name the **behavior** (`cursor-spring`, not `鼠标跟手`). Kind vs new
   study: `docs/conventions.md`.
2. Find the teaching core: unique `src/lib/*.ts` and `src/components/*`
   that are not `auth`, `app-data`, `db`, `env`, `og`, `preview-*`,
   `multiplayer`, `router`. That pair is the rule (geometry, timing,
   state).
3. Write `idea.md` from that rule before scaffolding UI. Optional
   `idea.en.md` — the lab glob-loads it and falls back to `idea.md`.
4. Scaffold `studies/<slug>/` by copying a recent neighbor’s shell
   (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`,
   `src/main.tsx`, `src/App.tsx`, `src/lib/stage-query.ts`). Bind the
   **Next free** port from `docs/conventions.md`. Rewrite the core into
   `src/lib/machines.ts` (pure, tested) and the playground. Relative
   imports. Tokens from `design/tokens.css`. `StageView` locks one
   state, sets `data-stage="fixture"`, and aliases `kind` / `state`
   query params (`scripts/capture-stage.py` always sends those).
5. Leave behind: auth, neon, PWA, preview bridges, app-data, routers,
   server, scripts, `public/__grok`, screenshots, artifacts,
   attachments, sandbox `.grok/`. Do not copy sandbox screenshots or
   source clips. Do not commit stills — `make stills` from the stage.
   Do not screenshot `/s/<slug>` teaching pages.
