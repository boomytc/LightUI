# Public writing

Editorial content for the LightUI site. This is not operator documentation
(`docs/`) and not a study (`studies/`).

```
writing/about.md           /about
writing/notes/<slug>.md    /notes/<slug>
```

## Note file

```md
---
title: 斜线不该换菜单
date: 2026-08-15
summary: One or two sentences.
related: intent-cascade
---

Body in Markdown. `related` is an optional comma-separated list of study slugs.
```

The site discovers notes with `import.meta.glob`. Do not edit a registry.
Keep notes short. A study's `idea.md` stays the technical write-up; a note
is the public essay around it.
