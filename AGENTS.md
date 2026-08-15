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
writing/                 public notes and about (the site blog)
products/lab/            the site: home, studies, notes, about
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
| Public essay / about copy | `writing/` |
| Color, type, radius, shadow | `design/tokens.css` |
| How to add a study | `docs/conventions.md` + `docs/study-contract.md` |
| Agent procedure | `skills/lightui*` |

Do not create empty study folders. Do not start a workspace-level component
library. If two studies later share a true primitive, extract it then.

## Study contract

Every study must contain `idea.md`, `study.json`, `src/StudyView.tsx`
(named export `StudyView`), `README.md`, and `AGENTS.md`. Details:
`docs/study-contract.md`.

The lab discovers studies with `import.meta.glob`. Adding a study does not
mean editing a registry. Run `make catalog` so `docs/catalog.md` matches.

## Skills

Repository agent skills live under root-level `skills/<name>/SKILL.md`,
same as other Light* workspaces. Do not put them in `.grok/skills/`.

- `skills/lightui` — where a change belongs
- `skills/lightui-study` — extract / add a study
- `skills/lightui-lab` — the public site in `products/lab`

## Boundaries

- Like LightGame / LightAgent: the unit of work lives one level down.
- Like LightPet: `products/lab` is a standalone product root.
- Like LightCanvas: bind playgrounds and the lab to `127.0.0.1`.
- Unlike LightCanvas: this is not a single product. Studies stay independent.
- When extracting from an external sandbox, copy the idea and the teaching
  playground. Do not copy auth, PWA, preview bridges, or deploy adapters.

## Validation

```bash
make install
make catalog
make test
make typecheck
make dev
```

Lab: `http://127.0.0.1:5173/`.
Standalone study: `make dev-study STUDY=intent-cascade` → `:5174`.

## Cleanup

Remove transient `dist/`, `.cache/`, and one-off screenshots that are not
deliberate `references/` fixtures.
