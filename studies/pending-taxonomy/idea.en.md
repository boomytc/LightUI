# Pending

While content is missing, what should occupy the screen? First decide whether a **skeleton holds the layout**, or an **empty state offers a next step**.

## The problem

“Make a loading state” describes the look: a spinner, gray blocks, or a blank board. What actually breaks is a **placeholder that does not match the content**:

- The list is still arriving, so a spinner sits in the middle and the page jumps when it lands
- The shimmer flashes opacity, which reads as an alarm, not as a reserved seat
- Arrival is a hard cut, so cards pop in
- The list is empty, but the copy says “no data”, or the board is blank
- The empty state is a toast: a glance, then gone, with no next step
- Reduced motion still runs the shimmer

One spinner or “no data” for all of these either jumps the layout, or leaves people with nothing to do.

## The rule

Ask whether content is **still on the way**, or **already here and this set is empty**. Then pick a leaf.

| Leaf | When | Machine |
| --- | --- | --- |
| Skeleton | Structure is known; content is still arriving | `reservesLayout`; placeholder size matches the final layout; shimmer is a **background-position loop**, not an opacity flash; a short crossfade on arrival; **do not replace the skeleton with a spinner**; `prefers-reduced-motion` stops the shimmer and leaves gray blocks |
| Empty | It has arrived; this set is empty | `hasAction`; an icon, one human title, one line of guidance, **one primary button**; no “no data”, no blank board |

Both leaves have **`allowsSpinner` false**. A spinner is indeterminate progress, not a pending occupancy.

The two pairs people mix up:

- **A skeleton is not a looping spinner.** A skeleton holds layout until the real content replaces it. A spinner says work is happening and progress cannot be measured.
- **An empty state is not a notice.** A notice reports something that already happened. An empty state occupies this region: why it is empty, and where to go next.

To specify one wait, say three things:

1. **Name** — not “a loading state”: a skeleton, or an empty state
2. **Scene** — content still arriving, or arrived and this set is empty
3. **Rules** — blocks match layout, background shimmer, short crossfade; or a human title plus one primary

Those three, in one sentence, are the “Say it this way” card.

## Versus always a spinner / “no data”

| | Always a spinner or a blank | Split by occupancy |
| --- | --- | --- |
| A card list loading | A spinner in the middle; a jump on arrival | Three fake cards match the real ones, then a fade |
| Reduced motion | The shimmer still flashes | Stop the shimmer; leave gray blocks |
| No briefs yet | “No data”, or a white board | “No briefs yet” + guidance + New brief |
| Work still computing | A skeleton as progress | Progress is another question; this study does not spin |

## The machines

The calls live in DOM-free modules: `reservesLayout(kind)` (true for skeleton), `hasAction(kind)` (true for empty), `allowsSpinner(kind)` (false for both), `occupancy(kind, state)` (skeleton / content / empty). Shimmer is `background-position`, not an opacity blink.
