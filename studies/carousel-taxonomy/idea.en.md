# Carousel

A set of frames only says it will change. First decide **how this set advances**.

## The problem

“Make a banner / carousel” describes the look: a few pictures in a group that move on. What actually breaks is a **cut that does not match the motion you mean to commit**:

- A brand hero is built as a hard sideways slide, so it flashes a knife-cut
- A portfolio window is flattened onto a track, so the sides have no volume
- Recommendation cards become a banner, so you cannot peel the top one
- A lookbook is translated, so there is no spine
- A photo wall is stuffed into a dotted carousel, so you only ever see one
- A product 360 is four side photos sliding left and right
- A campaign hero only moves one layer, so there is no near and far
- Several announcements become a cut that takes the whole view away
- A masonry wall is called a carousel
- Table pagination is built as a marquee

One `translateX` for all of these either cuts too hard, or takes away a view that should have stayed.

## The rule

Ask what the motion commits. Skin comes after.

| Model | The cut | What it commits |
| --- | --- | --- |
| Classic slide | Whole-page `translateX` | The track tweens only `transform`; **dots stay bound to the page** |
| Fade | Opacity only | **No translation**, so the layout does not jump |
| 3D coverflow | Center large, sides rotate | Perspective; a side card comes back to center |
| Card stack | Peel the top card | Cards below lift and turn a little; not a horizontal track |
| Page flip | `rotateY` on the spine | Both pages stay in view |
| Accordion gallery | One expands, others shrink | Columns retune; the view is not taken away |
| 360° spin | Rotate a product, not slides | Drag is an angle |
| Parallax | Layers at 0.3 / 0.7 / 1.0 | Not a single-layer slide |

The control-dictionary rule holds for every cut: **dots sync the index**; autoplay **pauses on hover**; `prefers-reduced-motion` **kills autoplay**; if a fade still moves, it is **opacity only**.

The three pairs people mix up:

- **Advancing frames is not a notice marquee.** A carousel takes the whole view away. A marquee rotates copy in one strip.
- **A carousel is not masonry.** Masonry shows many blocks at once. A carousel is how a set of frames advances.
- **List pagination is not a marquee.** Previous / next on a table commits a page of rows, not a loop of posters on a track. Pagination is paging — do not open it as a ninth carousel kind.

To specify one of these, say three things:

1. **Name** — not “a carousel”
2. **Scene** — a banner, a window, a stack, a book, a product 360, or a hero
3. **Rules** — translate, opacity only, coverflow, peel, page-turn, accordion, rotate the object, or stagger the layers

Those three become the line on the spec card.

## Versus always sliding left with three dots

| | Always a sideways slide | Split by how it advances |
| --- | --- | --- |
| Headlines | Fine | Whole pages translate; dots sync |
| Brand hero | A knife-cut in the middle | Crossfade in place |
| Portfolio | The sides are flat | Center large; sides turn with volume |
| Today’s pick | You have to hit an arrow | Peel the top card |
| Digital magazine | There is no book | Turn on the spine |
| Photo wall | Only one frame at a time | The current one expands; neighbors keep a strip |
| Hardware | Four side photos slide | Hold and turn a full circle |
| Campaign hero | One layer translates | Near and far at different speeds |
| Header announcements | The whole view is taken away | That is a marquee, not a carousel |

## The machines

The rules live in DOM-free modules: `stepIndex` (classic wraps), `shouldAutoplay` (false on hover or reduced motion), `fadeUsesOpacityOnly`, `transitionProps`, `isRotateNotSlide`. Reduced motion keeps fade on opacity and jumps every other cut.
