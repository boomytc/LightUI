# Morph

The same entry morphs in place. First decide **whether it changes width, height, radius, or layout**; then whether it holds the expanded state, or reverses along the same path.

## The problem

“Make a morph” describes the look: something gets bigger. What actually breaks is an **axis that does not match the identity**:

- A circle becomes a pill, but height wobbles and the center anchor is lost
- A pill becomes a card, but the title unmounts and remounts, so identity blinks
- Extra controls pop in, instead of opening along a `0fr` track
- Only the radius should change, but width and height scale too, so hierarchy becomes zoom
- The same nodes should become two columns, but a second set of DOM replaces them
- Collapse fades the whole block out and unmounts it, instead of content leaving first and the container following

One `scale` for all of these either snaps identity, or treats hierarchy as magnification.

## The rule

Ask which axis moves, where it is anchored, and whether content follows the container. Skin comes after.

| Model | Axis | Anchor | Rule |
| --- | --- | --- | --- |
| Circle → pill | **Width** | Center | Height locked; radius 999 throughout. The icon stays mounted |
| Pill → card | **Height** | Top | Radius 999→24. The header stays mounted. Body waits until the container has grown |
| Compact | **Size + layout** | Top-left | Same content identity. Extra controls open `0fr→1fr` |
| Radius | **Radius** | — | Width and height locked. This is hierarchy, not scale |
| Size | **Size** | Top-left | Content hierarchy unchanged; grow down-right. Do not reflow nodes |
| Reflow | **Layout** | — | Same nodes, stack → two columns, reading order kept |
| Reverse | **Reverse** | Center | Card → pill → dot. Content leaves first, then height, then width. The check stays in the final dot |

The three pairs people mix up:

- **Changing only the radius is not a zoom.** Locked width and height, radius only: that is where the block sits in the hierarchy. `scale` makes the whole block larger; identity remains, hierarchy blurs.
- **A reverse collapse is not a fade-unmount.** Walk the path back: body leaves, the container becomes a pill, then a dot. `opacity: 0` then unmount means the next click is a new entry.
- **Reflow is not a new set of nodes.** Stack to two columns, same DOM, same reading order. Swapping in another card is advancing a frame, not a morph.

To specify a morph, say three things:

1. **Name** — not “a morph”
2. **Scene** — a search chip widening, a notice opening, hierarchy only, or collapsing back to a dot
3. **Rules** — which axis, which anchor, content before the container or after

Those three, in one sentence, are the “Say it this way” card.

## Versus always `scale`

| | Always `scale` | Split by axis / path |
| --- | --- | --- |
| Search circle | The whole chip zooms; height wobbles | Height locked at 48; width grows from the center |
| Notice pill | The title unmounts; a new card opens | The header stays; only height grows |
| Hierarchy change | Size scales with it | Size stays; only radius changes |
| Close | Fade-unmount; the next click is a new entry | Content leaves, the container follows; the check remains in the dot |

A morph is not a new overlay, not a cut to another frame, and not a rail that pushes the main column. While identity holds, it is this block that changes.

## The machines

The calls live in DOM-free modules: `morphAxis`, `morphAnchor`, `locksSize` (true only for radius), `keepsIdentity`, `reverseOrder` (true only for reverse), `reverseBeat` (content → height → width), `contentAfterContainer`, `morphBox`, `reverseBox`. Reduced motion: duration 0.
