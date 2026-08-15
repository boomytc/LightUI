---
name: lightui-lab
description: >
  Build or restyle the LightUI public site in products/lab: home, studies
  portfolio, notes/blog, study frame, routing. Use when changing
  the presentable index, /studies, /graph, /notes, /s/:slug, lab chrome,
  or the user says lab UI / catalog / 作品集 / 博客 / LightUI site.
  Slash command: /lightui-lab.
---

# LightUI site

Product root: `products/lab/`. Read its `AGENTS.md`.

This is the unified public face. Do not add a second site product.
Do not link out to sibling private repositories.

## Rules

- Discover studies in `src/lib/catalog.ts`. Discover notes in
  `src/lib/notes.ts` from `writing/notes/*.md`. No hand-written lists.
- Frame studies; do not move playground code into the site.
- Public essays live in `writing/`. See `docs/writing.md`.
- Tokens live in `design/tokens.css`. `@source` must include `studies/**`.
- Keep `src/lib/nav.ts` until nested routes actually hurt.
- Bind `127.0.0.1:5173`.

## Routes

`/` home · `/studies` · `/graph` · `/s/<slug>` · `/s/<slug>/stage` · `/notes` · `/notes/<slug>`

`/s/<slug>/stage` is not in the site nav. It is the fixture stage.

## Verify

Home shows a featured study and latest notes. `/studies` lists every
`active` / `draft` study. `/notes` lists `writing/notes`. After visual
changes, check desktop and ~390px;
no page-level horizontal scroll.
