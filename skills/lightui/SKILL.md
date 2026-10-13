---
name: lightui
description: >
  Route LightUI work to the right layer (studies, products/lab, products/genui,
  design tokens, docs, or project skills). Use when adding or extracting a
  UI/UX study, changing the lab catalog, adding a generative UI component or
  agent contract, deciding where a file belongs, or the user mentions LightUI
  / study / lab / catalog / genui. Slash command: /lightui.
---

# LightUI workspace router

Read `AGENTS.md` first.

## Put work here

| Ask | Go to |
| --- | --- |
| New idea, extract/replicate an interaction, change a playground | `studies/<slug>/` and follow **lightui-study** |
| Catalog home, study frame, site chrome, routing | `products/lab/` and follow **lightui-lab** |
| Generative UI component, registry, or agent contract | `products/genui/` (read its `AGENTS.md`) |
| Public note | `writing/notes/` (`docs/writing.md`) |
| Color, type, radius, shadow | `design/tokens.css` |
| Index / how-to | `docs/catalog.md`, `docs/conventions.md`, `docs/study-contract.md` |
| Incoming Grok/vibe sandbox | `sandboxes/unintegrated/`; extract with **lightui-study**; then `sandboxes/integrated/` |
| Fixture stills (generated) | `make stills` from `/s/<slug>/stage` — do not commit png / mp4 |

Root `package.json` is workspaces only. Do not add app `src/` at repo root.
Do not create empty study folders. Deliverable generative-UI components live
only in `products/genui/`. Do not start a component library anywhere else.
`products/genui` does not import studies or lab. Studies and lab import
`@lightui/genui` only. The agent contract is `products/genui/contract/` (v0).

## Default commands

```bash
make install
make catalog
make test
make typecheck
make dev                 # lab at http://127.0.0.1:5173/
make dev-study STUDY=<slug>
```

After adding or renaming a study, set `category` on `study.json` and run
`make catalog` in the same change. `make test` and `make typecheck` run
`make catalog-check`.
