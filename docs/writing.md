# Public writing

Editorial content for the LightUI site. This is not operator documentation
(`docs/`) and not a study (`studies/`).

```
writing/about.md              /about (zh)
writing/about.en.md           /about (en)
writing/notes/<slug>.md       /notes/<slug> (zh)
writing/notes/<slug>.en.md    /notes/<slug> (en)
```

English files are optional. Missing `.en.md` falls back to the Chinese note.

## Note file

```md
---
title: 斜线不该换菜单
date: 2026-08-15
updated: 2026-08-15
summary: One or two sentences.
related: intent-cascade
---

Body in Markdown. `date` is the day the note was written (`YYYY-MM-DD`).
`updated` is optional; omit it when it would match `date`. The lab
sorts by `updated`, falling back to `date`. `related` is an optional
comma-separated list of study slugs.
```

The site discovers notes with `import.meta.glob`. Do not edit a registry.
Keep notes short. A study's `idea.md` stays the technical write-up; a note
is the public essay around it.
