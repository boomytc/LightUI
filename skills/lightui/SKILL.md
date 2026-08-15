---
name: lightui
description: >
  Route LightUI work to the right layer (studies, products/lab, design tokens,
  docs, or project skills). Use when adding or extracting a UI/UX study,
  changing the lab catalog, deciding where a file belongs, or the user
  mentions LightUI / study / lab / catalog. Slash command: /lightui.
---

# LightUI workspace router

Read `AGENTS.md` first.

## Put work here

| Ask | Go to |
| --- | --- |
| New idea, extract/replicate an interaction, change a playground | `studies/<slug>/` and follow **lightui-study** |
| Catalog home, study frame, site chrome, routing | `products/lab/` and follow **lightui-lab** |
| Public note | `writing/notes/` (`docs/writing.md`) |
| Color, type, radius, shadow | `design/tokens.css` |
| Index / how-to | `docs/catalog.md`, `docs/conventions.md`, `docs/study-contract.md` |
| Fixture stills (generated) | `make stills` from `/s/<slug>/stage` — do not commit png / mp4 |

Root `package.json` is workspaces only. Do not add app `src/` at repo root.
Do not create empty study folders or a shared component library.

## Default commands

```bash
make install
make catalog
make test
make typecheck
make dev                 # lab at http://127.0.0.1:5173/
make dev-study STUDY=<slug>
```

After adding or renaming a study, run `make catalog` in the same change.
