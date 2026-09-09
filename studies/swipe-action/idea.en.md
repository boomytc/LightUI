# Swipe Action

When swiping a list row horizontally, how should gestures disambiguate axis intent and resolve between action reveal and overswipe commit? First establish the **gesture deadband and axis-locking mechanism, alongside the dual-threshold resolution model (snap reveal vs direct commit)**.

## The Problem

"Add swipe-to-delete" specifies only the visual consequence. What breaks in touch interfaces is gesture collision and fragmented intent resolution:

- **Axis conflict swallows scrolling**: As users scroll smoothly down a feed, a 3px horizontal wobble is mistaken for a swipe, freezing the scroll. Conversely, horizontal gestures are stolen by vertical inertia;
- **Permanent danger icons**: Pinning a trash can to every row clutters the interface and invites disastrous accidental taps;
- **Missing overswipe forces mechanical second taps**: A user dragging past 180px has unambiguously expressed destructive intent, yet naive implementations force them to release and tap the button anyway;
- **Multi-row exposure zebra stripes**: Opening row 1 and then swiping row 2 leaves both open, degrading the list into a jagged, untidy state.

## The Rule

List row swiping follows the **vector deadband disambiguation + boundary damping + dual-threshold release + mutual exclusivity** model.

| Phase | Physical & Geometric Rule | User & System Behavior |
| --- | --- | --- |
| **8px Deadband Lock** | $\sqrt{\Delta x^2 + \Delta y^2} < 8\text{px}$ remains undecided. If $|\Delta y| > |\Delta x|$, pass through to native scroll; if $|\Delta x| \ge |\Delta y|$, lock horizontally and capture pointer | Never hijacks vertical browsing; immune to fingertip jitter |
| **Dual-Threshold Resolution** | ① $\text{displacement} < 45\%\times 148\text{px}$: spring rollback to 0<br>② $45\% \le \text{displacement} < 172\text{px}$: snap open action tray<br>③ $\text{displacement} \ge 172\text{px}$: overswipe triggers instant deletion | Light swipe reveals options; deep swipe commits in a single fluid gesture |
| **Mutual Exclusivity** | Touching or swiping any other row springs all previously opened rows shut | Guarantees at most one active action tray across the view |
| **Tap-Outside Dismissal** | Tapping the front face of an open row or empty space collapses it | Zero-cost cancel channel without requiring an explicit cancel tap |

Key contrasts:

- **Swipe action is not a confirm barrier.** Confirmation sliders (`confirm-taxonomy`) serve high-risk security barriers. Swipe actions are a multi-state list productivity tool.
- **Swipe action is not press to select.** Swipe acts on a single row inline; long-press (`press-select`) transitions the entire list to batch selection mode.
- **Swipe action is not pull to refresh.** Pull-to-refresh (`pull-refresh`) is a container-level vertical gesture; swipe actions are intra-row horizontal gestures.
- **Swipe action is not drag reorder.** Drag-to-commit (`drag-commit`) alters the physical ordering of items.

Interaction formula:
1. **Name** — Swipe Action (Swipe to Reveal & Commit)
2. **Gesture** — Swipe left / deep continuous swipe
3. **Result** — Reveal action tray, or overswipe to commit deletion

## Versus Naive Alternatives

| | Permanent Buttons | Raw Zero-Deadband Swipe | 8px Deadband + Dual-Threshold |
| --- | --- | --- | --- |
| Layout Space | Eats 48px row width | Full width | **Full width, 100% content density** |
| Accidental Triggers | High | Very high (freezes vertical feed) | **Very low (8px vector lock, vertical priority)** |
| Interaction Steps | 1 step, but dangerous | 2 steps (swipe then tap) | **Light swipe = 2 steps; deep swipe = 1 step** |
| Multi-Row State | Independent | Leaves ragged open states | **Strict single-row mutual exclusivity** |

## The Machines

Algorithms live in pure, DOM-free modules: `resolveGestureLock`, `calcDragOffset`, `resolveSwipeRelease`, and `calcActionProgress`.
