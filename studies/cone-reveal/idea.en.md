# Cone reveal

A secret should not light up as a whole string. A cone shoots from a fixed origin; only glyphs inside the cone become plaintext. Outside, they stay discs.

## What breaks without it

Password, key, and one-time-code fields usually get the grain wrong:

1. **Whole-string toggle.** One eye icon flips the entire value to plaintext. Shoulder surfers, screen recordings, and passers-by get the secret in a single glance. Box-level unblur (clearing a CSS `filter: blur` on hover) is the same grain: the box lights up, not the glyphs.
2. **Nearest cell.** Whichever glyph is closest to the pointer lights up. Sweeping the row strobes from letter to letter; you cannot read a word, and it is not a flashlight.

The first question is grain: the whole string, one cell, or a continuous angular field?

## The rule

**The lamp must sit above the glyph baseline**, perched at the top-right of the field. If the origin shares the row’s horizontal line, every glyph subtends angle π and the cone can only light the whole string or none of it. Raise the origin and near glyphs aim more downward, far glyphs more leftward — the row gains angular width the cone can cut.

Each frame takes a target angle from the pointer (or an auto-search nod) and eases toward it. Every glyph center is scored with cone coverage. Default **full beam width** is 34° (half-angle 17°):

- Distance greater than `maxDist` → coverage 0
- Distance under about 4px → coverage 1 (the lamp neighborhood is fully lit)
- Inside the half-angle: coverage falls from 1 to 0.55 along distance
- Outside the half-angle, a `0.22 × halfAngle` soft edge (smoothstep) stops glyphs from flickering on the rim
- Coverage must exceed 0.38 to count as inside; **the test cone is narrowed to 0.72 of the drawn cone**, so letters appear in the core, not on the fringe

Glyphs outside the cone stay discs; glyphs inside become characters. The paint pass punches the same angle out of a veil, so geometry and reveal share one cone.

Auto-search is a small nod around the parked leftward angle so the rim keeps cutting the row — not a full-page wander. A recent pointer move retargets the cone. Closing the lamp returns every glyph to a disc.

## Why not the naive alternatives

| Approach | Mechanism | Failure |
| --- | --- | --- |
| **Whole-string eye / box unblur** | One boolean, or a field-level `filter` | No spatial grain; the whole secret is visible at once |
| **Nearest glyph** | 1-NN cell | Cannot read a word; sweeping strobes |
| **Cone coverage** | Perched angular field + soft edge + threshold | You must sweep to read; a shoulder glance only sees the lit slice |
