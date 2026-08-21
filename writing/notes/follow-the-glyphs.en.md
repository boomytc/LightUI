---
title: The sweep follows the glyphs
date: 2026-08-21
summary: Clip the shine to the letters. Width is in ch; duration is length times seconds per glyph — not a box-level sheen.
related: glyph-sweep
---

A title shine often sweeps the whole box, or uses a fixed-pixel band. Short and long lines fall out of step, and a type-size change mis-sizes the beam.

Keep the letters transparent. Clip a 300%-wide band into the glyphs with `background-clip: text`. Animate only `background-position`. Half-width is `spread × 0.5ch`. Duration is character count times seconds per glyph, so a short word finishes first and a long line still keeps time. Speed to the right is faster.
