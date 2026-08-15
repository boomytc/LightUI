# LightUI Workspace Instructions

## Scope

LightUI is a study workspace for UI/UX ideas: self-implemented behaviors and
excellent interactions observed elsewhere.

The repository root is not an application. It holds catalog, design tokens,
aggregate commands, and project skills.

- Treat each `studies/<slug>/` as a study root before editing that idea.
- Treat `products/lab/` as the product root before editing the catalog UI.
- Read this file first, then the local `AGENTS.md`.

## Layout

```
skills/                  agent workflows for this repo
design/                  visual source (tokens, base, favicon)
docs/                    catalog, conventions, study / writing contracts
writing/                 public notes (the site blog)
products/lab/            the site: home, studies, graph, notes
studies/<slug>/          one idea + isolated playground
scripts/sync-catalog.mjs regenerate docs/catalog.md
```

Root `package.json` is a workspace orchestrator only. Do not put app `src/`
at the repository root.

## Where to put work

| Change | Put it here |
| --- | --- |
| New or extracted UI idea | `studies/<slug>/` |
| Catalog browsing, study frame, site chrome | `products/lab/` |
| Public essay | `writing/notes/` |
| Color, type, radius, shadow | `design/tokens.css` |
| How to add a study | `docs/conventions.md` + `docs/study-contract.md` |
| Agent procedure | `skills/lightui*` |
| Fixture stills (generated) | `make stills` from `/s/<slug>/stage` — do not commit png / mp4 |

Do not create empty study folders. Do not start a workspace-level component
library. If two studies later share a true primitive, extract it then.

## Study contract

Every study must contain `idea.md`, `study.json`, `src/StudyView.tsx`
(named export `StudyView`), `README.md`, and `AGENTS.md`. Details:
`docs/study-contract.md`.

The lab discovers studies with `import.meta.glob`. Adding a study does not
mean editing a registry. Run `make catalog` so `docs/catalog.md` matches.

## Skills

Repository agent skills live under root-level `skills/<name>/SKILL.md`.
Do not put them in `.grok/skills/`.

- `skills/lightui` — where a change belongs
- `skills/lightui-study` — extract / add a study
- `skills/lightui-lab` — the public site in `products/lab`

## Boundaries

- The unit of work lives one level down: `studies/<slug>/` or `products/lab/`.
- `products/lab` is a standalone product root. Bind it and playgrounds to
  `127.0.0.1`.
- This is not a single-app repo. Studies stay independent and do not import
  each other.
- When bringing a sandbox in, copy the idea and the teaching playground.
  Do not copy auth, PWA, preview bridges, or deploy adapters. Do not put
  lineage or a kept/dropped diary on public pages.
- Do not mention or link sibling private repositories from this repo's
  public pages or README.

## Validation

```bash
make install
make catalog
make test
make typecheck
make dev
```

Lab: `http://127.0.0.1:5173/`.
Standalone study: `make dev-study STUDY=<slug>`. Ports: see
`docs/conventions.md` (5174–5177 taken, next `5178`).

## Cleanup

Remove transient `dist/`, `.cache/`, and generated `references/` media.
Do not commit mp4 or stills.
