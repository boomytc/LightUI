# Inverted corner

Punch the inverted corner out of the parent. A matching-color patch shows a seam the moment the background changes.

## The problem

A lock chip sits in the top-left of a card, with a gap so the page shows through.

The naive build stitches the notch back with a pseudo-element and a same-color `box-shadow`. Change the background, or make the card translucent, and the seam appears. `corner-shape: scoop` is the shortest CSS, but it only scoops one `border-radius` corner. It cannot nest a chip or leave a see-through gap.

## The rule

Walk a rounded rect, then at the top-left reverse around the chip (three counter-clockwise arcs). Notch size is chip plus gap. The same variables drive the chip and the clip, so widening the chip on hover grows the hole without changing the arc structure.

| Technique | Hole follows the chip | See-through gap | Path interpolates |
| --- | --- | --- | --- |
| `clip-path: shape()` | Yes (CSS variables) | Yes | Yes |
| `clip-path: path()` | Yes (recomputed pixels) | Yes | Recompute |
| `corner-shape: scoop` | No | No | Radius only |

`shape()` uses CSS units (Chrome 135+ / Safari 18.4+). Fall back to `path()` when it is missing.

## Versus stitching

| | Matching patch / scoop | Punch the parent |
| --- | --- | --- |
| Background change | Patch color misses | The hole is still a clip |
| Chip grows | Patch misaligns | `--chip-w` grows the hole |
| Translucent card | Seam shows | The page shows through the hole |
