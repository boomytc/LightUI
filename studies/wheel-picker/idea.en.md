# Wheel Picker

When selecting ordered options or time units, should it be typed, expanded into a long list, or aligned via a wheel picker? First determine **how continuous flick gestures snap to a discrete baseline while cylindrical perspective establishes spatial depth**.

## The Problem

"Pick a time / pick a number" specifies only the target value. What breaks in touch environments is input friction and cognitive dissonance:

- **Soft keyboard intrusion**: Spawning an on-screen keyboard covers half the display, forces mode switches, and invites invalid inputs like `25:80` requiring tedious validation errors;
- **60-row flat list explosion**: Dumping 60 minutes into a flat select overloads the screen. Fast flicking easily overshoots the target, with no physical sense of progression;
- **No baseline snap quantization**: Without discrete snap, the list stops midway between two rows, leaving ambiguous selection states;
- **No cylindrical depth attenuation**: Flat rendering treats all items with identical visual weight, collapsing the distinction between selected baseline and surrounding candidates.

## The Rule

Ordered discrete collections (hours, minutes, dates, stepped durations) follow the **dual/multi-column wheel + baseline snap + cylindrical perspective** model.

| Mechanism | Physical & Geometric Rule | Benefit |
| --- | --- | --- |
| **Scroll Snap Quantization** | Fixed 40px item height. Release snaps via $\text{round}(\text{scrollTop} / 40)$ | Never halts on seams; release guarantees unambiguous selection |
| **Cylindrical 3D Perspective** | Distance attenuates opacity from 100% to 18%, rotates text $-18^\circ \times \text{offset}$ around the X-axis | Replicates mechanical drum curvature, focusing center while defocusing edges |
| **Independent Columns** | Hours (00–23) and minutes (00–59) scroll without gesture interference | Shortest interaction path for both coarse and fine values |
| **Flick & Tap Dual Access** | Supports continuous flicks and direct tap-to-center on neighbors | Rapid traversal plus single-tap precision |

Key contrasts:

- **Wheel picker is not a flat dropdown.** Flat selects fit 5–15 non-ordered categories. Wheel pickers serve ordered scales with cyclic step constraints.
- **Wheel picker is not a desktop option rail.** Desktop wheel rails track mouse wheel ticks for category switching. Wheel pickers are touch-centric input controls.
- **Wheel snap is not sheet snap.** Sheet snap (`sheet-snap`) quantizes container coverage height. Wheel snap quantizes list items onto a viewport baseline.

Interaction formula:
1. **Name** — Wheel Picker (Drum Roll Picker)
2. **Gesture** — Vertical flick / continuous scroll
3. **Result** — Central baseline snap with optical depth

## Versus Naive Alternatives

| | Text Field | Flat Select List | Wheel Picker |
| --- | --- | --- | --- |
| Keyboard | Pops obstructive keyboard | No keyboard | **Zero keyboard interference** |
| Validation Risk | High (regex, range checks) | Low | **Zero invalid states by construction** |
| Viewport Space | Compact, but requires typing | 60 rows explode viewport | **Compact 190px dual-column stage** |
| Spatial Cue | None | Flat stack | **3D drum curvature rotation** |

## The Machines

Algorithms live in pure, DOM-free modules: `pad2`, `calcItemOffset`, `calcCylinderVisual`, `resolveScrollIndex`, and `formatTimeString`.
