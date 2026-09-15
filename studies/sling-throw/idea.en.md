# Sling throw

When tuning a value on a track, leaving the track should not clamp back to 1-D. Cross the vertical off-track threshold, release, and commit the ballistic landing.

## What breaks without it

Continuous sliders usually treat the off-track dimension as noise:

1. **Clamp to the track.** A classic `input[type=range]` drops Y. The pointer can leave the track and still only follows X. Jumping far still means dragging the whole span, with no preview of where you will land.
2. **Treat it as a threshold gate.** Sliding past 85% is a confirm, not a way to change a continuous value.

Teleporting to the current X on release, with no flight, is the same sling rule with the parabola turned off (reduced motion takes this path). It is not a different grain.

The first question is: is the off-track dimension noise to discard, or a throw?

## The rule

On the track, the ball follows X and locks Y. More than **14px vertically** off the track (above or below), it becomes a slingshot. While sliding on the rail, the anchor follows the current value; leaving the track pulls from that point, not from the pointer-down origin.

- Pull = `limitPull(ball − anchor)`, with a 32% soft stretch past 260px
- Horizontal speed opposes the pull: `vx = −pull.x × 2.85`
- Vertical speed is chosen to return to the track and clear a peak of `42 + |Δy| × 0.34`; a pull from below rises through the track then falls
- The parabola’s intersection with the track is the landing; X is clamped to the rail, then quantized to step
- While pulling: rubber bands from the fork (±7px on the rail) and sampled trajectory dots; the predicted value sits at the landing
- On release: if there is a prediction, fly the ball along the same parabola (compress flights longer than 0.7s); reduced motion skips the flight and commits the prediction

Release inside the threshold commits the current X. Arrow keys still nudge by step — the sling is the pointer’s off-track channel, not the only way to change the value.

## Why not the naive alternatives

| Approach | Mechanism | Failure |
| --- | --- | --- |
| **Clamp to 1-D** | Drop Y, follow X | Far jumps still drag the whole span; no landing preview |
| **On-track threshold** | One-way displacement confirm | That is a commit gate, not a continuous value |
| **Sling landing** | Off-track threshold + intercept + quantize | Farther horizontal pull, farther jump; the landing is the new value |
