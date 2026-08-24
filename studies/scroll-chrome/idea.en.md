# Scrollbar

Is this a start cue, or a position track? Name **what the bar reports** before the skin.

## The problem

“Make a cooler scrollbar” describes the look: hide the OS thumb, paint dots or an arrow. What actually breaks is **a job that does not match**:

- Still at the top, but a column of position dots, so “there is more below” is invisible
- Already scrolling, and the arrow still bobs — cue and track share one widget
- Dots look like a table of contents, but a click seeks a scroll fraction, not a heading
- How far the document has been read is drawn as work going 0–100
- No overflow, and the decoration stays
- The OS thumb is hidden and the custom chrome is `aria-hidden`, so the keyboard has nothing to grab
- The track follows the window, while a long pane in a column scrolls a different cell

One morph for all of these either hides where you are, or pretends a click is a section.

## The rule

Ask whether you are still at the top, or already moving. Then pick a leaf.

| Leaf | When | Machine |
| --- | --- | --- |
| Native | Overflow belongs to the OS | `hidesNative` is false; the thumb is continuous |
| Cue | Overflow, and still at the top | `showsCue`; a click is `current + viewport`; unload after leaving the top |
| Track | Overflow | `showsTrack`; `focus = round(fraction × (n − 1))`; a click is `i / (n − 1) × max` |

Bind the track to **this viewport**, not `window`. Not enough overflow → `hidden`.

The dots quantize a scroll fraction, not a heading. Reduced motion: no bob, extensions land in one step, seeks are not smoothed.

Do not stitch cue and track into one morph. Those are two jobs.

The pairs people mix up:

- **A document fraction is not work progress.** Progress asks whether work can be counted to 100. This asks what overflow reports.
- **Dots are not section anchors.** Highlighting the heading in view is nav.
- **A cue is not a track.** Invite down only at the top; report position only once moving.

To name a scrollbar, use three things:

1. **Name** — not “a cool scrollbar”; native, cue, or track
2. **Scene** — still at the top, or already moving; is there overflow
3. **Rule** — whether the OS thumb stays; cue only at the top; track seeks a fraction

Those three collapse to the line on the card.

## Versus “always a cooler bar”

| | Always a morph | Split by job |
| --- | --- | --- |
| At the top | Already a column of dots | Cue: there is more |
| Moving | The arrow stays, or both fight | Track: where you are |
| Short pane | Decoration stays | hidden |
| A click | Unclear landing | One screen, or i/(n−1) |

## Machine

Judgment lives off-DOM: `hidesNative`, `showsCue`, `showsTrack`, `focusDot`, `seekTop`. Stage `state=start|mid|end|fit` locks the fraction; `fit` is no overflow.
