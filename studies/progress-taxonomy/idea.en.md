# Progress

A spinner only says you are waiting. First decide **whether this progress can be measured**.

## The problem

“Make a progress bar” describes the look: a track that moves. What actually breaks is **drawing unmeasurable work as a fake percent, or looping measurable work forever**:

- An upload knows its bytes, but only gets a spinner
- A sync has no ETA, yet a fake percent crawls to 99% and sticks
- A multi-step job is drawn as one continuous bar, so you cannot see which step is stuck
- Chat wait and speech recognition get 0–100, so it looks like they are about to finish
- A skeleton holds layout space and is mistaken for “work is happening”
- The result is a toast; once the bar is gone, you do not know if it succeeded
- Stage steps are drawn as tab chevrons: that is a selection model, not the work itself moving forward

One spinner or fake percent for all of these either leaves people waiting in the dark, or tells them it is almost done when it is not.

## The rule

Ask whether progress can be measured, then pick a leaf.

**Measurable (determinate):** show 0–100, stop at done — never loop a fake percent.

| Leaf | For | Rule |
| --- | --- | --- |
| Smooth fill | Upload / download | `transform: scaleX(p)`, origin on the left, not `width` |
| Stage steps | A job in stages | `done` / `active` / `todo` nodes, not a fake bar |
| Circular percent | Completeness | SVG `dashoffset` from 12 o’clock, stop at 100% |
| Liquid fill | Volume / a dashboard | Level uses `translateY`, optional wave, stop when full |

**Unmeasurable (indeterminate):** no percent, loop “still working”.

| Leaf | For | Rule |
| --- | --- | --- |
| Loop spin | A refresh with no ETA | An open arc rotates; it does not walk to 100% |
| Radar sweep | Search / probe | A conic sector sweeps; not a generic spinner |
| Bounce dots | A short chat wait | Three dots bounce in turn; no track |
| Audio wave | Speech recognition | Bars `scaleY`; not a static volume icon |

The pairs people mix up:

- **Progress is not a skeleton.** Progress is work happening. A skeleton is layout placeholder — that question lives elsewhere.
- **Progress is not a toast.** A toast says the result is out. Progress says the work is still going.
- **Stage steps are not tab chevrons.** A chevron row is a navigation selection model: land on a step, view that step. Here the nodes *are* the work: done is checked, active is working, later has not started.
- **Indeterminate work does not get a fake percent.** Spin, radar, dots, and wave only promise “still here,” not “how much is left.”

To specify one of these, say three things:

1. **Measurable or not** — if it can be measured, walk to 100 and stop; if not, loop
2. **Scene** — upload, parse steps, a dashboard, sync, scan, chat, voice
3. **Rules** — scaleX, three-state nodes, dashoffset, liquid level, open arc, radar sector, dots, wave

## Versus always spinning / a fake percent

| | Always a spinner or fake % | Ask whether it can be measured |
| --- | --- | --- |
| Upload / download | A spinner, or 1% faked to 99% | scaleX on a real percent, then stop |
| Parse in stages | One continuous bar; you cannot see the stuck step | Three-state nodes; the current step moves |
| Dashboard completeness | The ring keeps spinning | dashoffset walks to 100 and stops |
| Capacity on a wall | A thin ring or a fake rise | The level fills and stops |
| Sync / scan | A fake percent stuck at 99% | An open arc or radar loops, with no number |
| Chat wait | A tiny bar | Bounce dots |
| Speech recognition | A static speaker icon | The waveform moves |

## The machines

Category and geometry live in DOM-free modules: `category`, `clampProgress` (0..1), `showPercent` (determinate only), `stepKind` (`done` / `active` / `todo`; active is current), `circularOffset = C * (1-p)`, `shouldLoop`, `prefersStatic`. Fill uses scaleX; do not measure width.

When `prefers-reduced-motion`: determinate may freeze at the current *p*, or jump to done; indeterminate becomes a static mark and does not keep looping.
