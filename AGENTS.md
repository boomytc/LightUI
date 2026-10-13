# LightUI Workspace Instructions

## Scope

LightUI is a study workspace for UI/UX ideas: self-implemented behaviors and
excellent interactions observed elsewhere.

The repository root is not an application. It holds catalog, design tokens,
aggregate commands, and project skills.

- Treat each `studies/<slug>/` as a study root before editing that idea.
- Treat `products/lab/` as the product root before editing the catalog UI.
- Treat `products/genui/` as the product root before editing generative UI
  components, the registry, or the agent contract.
- Read this file first, then the local `AGENTS.md`.

## Layout

```
skills/                  agent workflows for this repo
design/                  visual source (tokens, base, favicon)
docs/                    catalog, conventions, study / writing contracts
writing/                 public notes (the site blog)
products/lab/            the site: home, studies, graph, notes
products/genui/          generative UI: components, registry, contract v0
studies/<slug>/          one idea + playground + stage
scripts/sync-catalog.mjs regenerate docs/catalog.md
scripts/capture-stage.py export stage stills (`make stills`)
sandboxes/               gitignored local inbox (not a package, not a study)
```

Root `package.json` is a workspace orchestrator only. Do not put app `src/`
at the repository root.

## Where to put work

| Change | Put it here |
| --- | --- |
| New or extracted UI idea | `studies/<slug>/` |
| Catalog browsing, study frame, site chrome | `products/lab/` |
| Generative UI component, registry, or agent contract | `products/genui/` |
| Public essay | `writing/notes/` |
| Color, type, radius, shadow | `design/tokens.css` |
| How to add a study | `docs/conventions.md` + `docs/study-contract.md` |
| Agent procedure | `skills/lightui*` |
| Incoming Grok/vibe sandbox | `sandboxes/unintegrated/`; after extract, move to `sandboxes/integrated/` |
| Fixture stills (generated) | `make stills` from `/s/<slug>/stage` — do not commit png |

Do not create empty study folders. Deliverable generative-UI components live
only in `products/genui/`. Do not start a component library anywhere else
(studies, lab, or the repository root). If two studies later share a true
primitive that is not a generative-UI component, extract it then.

Dependency direction is checked, not only documented. `products/genui` must
not import `studies/*` or `products/lab`. Studies and lab may import the
public entry `@lightui/genui` (`products/genui/src/index.ts`) and nothing
deeper. `npm test` and `npm run typecheck` fail on a violation.

The contract external agents read is `products/genui/contract/` (current
version `v0`). LightAgent uses that directory as the only source. Do not
derive or export the contract from the TypeScript implementation. A test
fails when the registry and `contract/v0/components.json` disagree.

## Study contract

Every study must contain `idea.md`, `study.json`, `src/StudyView.tsx`,
`src/StageView.tsx`, `README.md`, and `AGENTS.md`. Details:
`docs/study-contract.md`.

The lab discovers studies with `import.meta.glob`. Adding a study does not
mean editing a catalog array. Run `make catalog` so `docs/catalog.md`
matches. After-add files (category map, stage shots, port):
`docs/conventions.md`.

## Skills

Repository agent skills live under root-level `skills/<name>/SKILL.md`.
Do not put them in `.grok/skills/`.

- `skills/lightui` — where a change belongs
- `skills/lightui-study` — extract / add a study
- `skills/lightui-lab` — the public site in `products/lab`

## Boundaries

- The unit of work lives one level down: `studies/<slug>/`, `products/lab/`,
  or `products/genui/`.
- `products/lab` is a standalone product root. Bind it and playgrounds to
  `127.0.0.1`.
- `products/genui` does not import studies or lab. Studies and lab reach it
  only through `@lightui/genui`. The agent contract is
  `products/genui/contract/` (v0), not an export generated from the
  implementation.
- This is not a single-app repo. Studies stay independent and do not import
  each other.
- When bringing a sandbox in, copy the idea and the teaching playground.
  Do not copy auth, PWA, preview bridges, or deploy adapters. Do not put
  lineage or a kept/dropped diary on public pages.
- `sandboxes/` is a machine-local archive (gitignored). New dumps go in
  `sandboxes/unintegrated/`. After a study is extracted, move the original
  folder to `sandboxes/integrated/`. Do not put sandboxes under
  `studies/` — npm workspaces and the lab glob would pick them up.
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
Do not commit stills. Do not delete `sandboxes/` — it is a durable local
archive, not cache.
