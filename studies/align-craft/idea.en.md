# Align

Alignment is not “looks straight.” First decide **whether you are lining up the baseline, the focal point, the digits, or the box**.

## The problem

“Nudge it so it lines up” describes a feeling. What actually breaks is **lining up the wrong thing**:

- Price “128” and “/mo” sit on `items-center`, so the baselines miss
- A cover uses `contain` and the empty bands look like a bad crop; or it uses `cover` parked at `50% 50%` and the subject is cut off
- Icon and label never name the cross axis, so the icon drifts
- Spacing is leftover `margin` judged by eye; one edit opens a seam somewhere else
- The first line sticks to the box; `padding-top` ignores line-height / cap-height
- Circles, squares, and mixed type sit on the geometric center and look low
- An overlay guesses pixels with `translate` and slips when the size changes
- Invoice amounts are left-aligned with proportional fonts, staggering decimal points and ruining comparisons
- List status badges cling to titles of varying lengths, creating a jagged edge that ruins vertical scanning
- Centering a card container inadvertently centers body paragraphs, bouncing line starts and exhausting reading eyes
- Dialogs and feedback cards center all metadata indiscriminately, scrambling key-value rows and competing with the hero result

Treating all of this as “move it toward the middle” either misses the baseline, crops the subject, or squares the boxes while the eye still sees a tilt.

## The rule

Name what you are aligning, then write the CSS. Eleven spells, eleven switches.

| Spell | Aligns | Right | Wrong |
| --- | --- | --- | --- |
| Baseline | Text baseline | `align-items: baseline` | `items-center` on the margin box |
| Cover | Focal point | `object-fit: cover`, `object-position` on the subject (e.g. `50% 88%`) | `contain` letterboxing, or default `50% 50%` |
| Axis | Box | Icon + label `align-items: center` | No axis named, the icon floats |
| Margin | Gap | Parent `gap`, children `margin: 0` | Random `margin` by eye |
| Padding | Edge | `padding-top` from line-height / cap-height | First line flush to the top |
| Optical | Visual mass | Circle slightly larger, triangle nudged right | Geometric center |
| Inset | Edge | Absolute positioning with `inset` | `translate` guesses |
| Numeric | Decimal & digits | `text-right` + `tabular-nums` + uniform decimals | `text-left`, proportional digits, mismatched decimals |
| Between | Edges & scan line | `justify-between`, status forms a vertical scan column | `justify-start`, status drifts with title length |
| Reading | Left start line | Centered container, text `text-align: left` | Centered text bounces line starts |
| Center | Hero focus & hierarchy | Hero result on center axis, details left-aligned | Indiscriminately centering everything, scrambling keys & values |

Cover is one job with two faces: fill the frame, then put the focus on the subject. When the subject is not in the geometric middle, `cover` plus default centering is a blind crop.

Optical alignment still places boxes. It just refuses the bounding-box center: a circle looks smaller than a square of the same size, and a play triangle’s mass sits to the left.

Comparing numbers requires digit column alignment: tables and financial figures must be right-aligned with `tabular-nums`, or proportional fonts will let narrower digits like 1 distort the decimal column.

Continuous reading demands a stable left origin line: centering a container must never center the text. The core action of a feedback card stands on the vertical center axis, while structured metadata stays left-aligned.

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
| Fee breakdown | Left-aligned proportional numbers | Right-aligned + tabular-nums + decimal lock |
| List status | Clinging to title, drifts left/right | Space-between, vertical scanning column |
| Centered card copy | Centered text, jumping line starts | Centered box, shared left start line |
| Feedback card | Indiscriminately centering all rows | Hero on center axis, details left-aligned |

Swapping the page skeleton is a different question. This one only asks which seam you are lining up.
