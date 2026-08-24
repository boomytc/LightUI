---
title: Aligning is not “looking centered”
date: 2026-08-24
summary: First ask whether you are lining up the baseline, the focal point, or the box. Centering the frame or the image lines up the wrong thing.
related: align-craft
---

“Nudge it so it lines up” describes a feeling. What actually breaks is lining up the wrong thing: price and unit sit on `items-center`, so the baselines miss; a cover uses `contain` and the empty bands look like a bad crop, or `cover` parks at `50% 50%` and the subject is cut off; icon and label never name the cross axis, so the icon drifts. Treating all of this as “move it toward the middle” either misses the baseline, crops the focus, or squares the boxes while the eye still sees a tilt.

First ask what you are aligning.

- **Baseline**: the line the glyphs sit on, `align-items: baseline`, not `items-center` on the frame.
- **Focus**: the subject in the frame, fill with `cover` and follow the figure, not default `50% 50%`.
- **Box**: the seam and the edge, space with `gap`, not leftover `margin` by eye, pad to the cap, position with `inset`.

A circle looks smaller than a square of the same size, and a play triangle’s mass sits to the left. Optical alignment still places boxes. It just refuses the geometric center.

Changing the skeleton is not alignment, in [Layout](/s/layout-taxonomy). How the questions chain is on the [map](/graph).
