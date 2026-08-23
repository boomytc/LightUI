# Align

Alignment is not “looks straight.” First decide **whether you are lining up the baseline, the focal point, or the box**.

## The problem

“Nudge it so it lines up” describes a feeling. What actually breaks is **lining up the wrong thing**:

- Price “128” and “/mo” sit on `items-center`, so the baselines miss
- A cover uses `contain` and the empty bands look like a bad crop; or it uses `cover` parked at `50% 50%` and the subject is cut off
- Icon and label never name the cross axis, so the icon drifts
- Spacing is leftover `margin` judged by eye; one edit opens a seam somewhere else
- The first line sticks to the box; `padding-top` ignores line-height / cap-height
- Circles, squares, and mixed type sit on the geometric center and look low
- An overlay guesses pixels with `translate` and slips when the size changes

Treating all of this as “move it toward the middle” either misses the baseline, crops the subject, or squares the boxes while the eye still sees a tilt.

## The rule

Name what you are aligning, then write the CSS. Seven spells, seven switches.

| Spell | Aligns | Right | Wrong |
| --- | --- | --- | --- |
| Baseline | Text baseline | `align-items: baseline` | `items-center` on the margin box |
| Cover | Focal point | `object-fit: cover`, `object-position` on the subject (e.g. `50% 88%`) | `contain` letterboxing, or default `50% 50%` |
| Axis | Box | Icon + label `align-items: center` | No axis named, the icon floats |
| Margin | Gap | Parent `gap`, children `margin: 0` | Random `margin` by eye |
| Padding | Edge | `padding-top` from line-height / cap-height | First line flush to the top |
| Optical | Visual mass | Circle slightly larger, triangle nudged right | Geometric center |
| Inset | Edge | Absolute positioning with `inset` | `translate` guesses |

Cover is one job with two faces: fill the frame, then put the focus on the subject. When the subject is not in the geometric middle, `cover` plus default centering is a blind crop.

Optical alignment still places boxes. It just refuses the bounding-box center: a circle looks smaller than a square of the same size, and a play triangle’s mass sits to the left.

## Versus “nudge it center”

| | Eyeball center | Name the alignment |
| --- | --- | --- |
| Price + unit | Box midlines, baselines miss | One text baseline |
| Tall crop to square | Empty bands, or a missing head | Fill, focus follows the figure |
| Icon row | Icon top-aligned | Cross-axis center |
| Card rhythm | Each item’s own margin | One gap |
| Large title | Glued to the top | Cap sits on the inset |
| Triangle in a round button | Geometric center, looks left | A slight optical shift right |
| Overlay | Translate guess | Inset on four sides |

Swapping the page skeleton is a different question. This one only asks which seam you are lining up.
