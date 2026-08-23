# Border beam

The highlight should travel the rounded border. It should not flood the card.

## The problem

A membership card needs to be seen. The usual fix is a glow on the whole card, or a sheen that sweeps the face. Copy and price light up together, the edge stops being an edge, and the accent turns into fog.

## The rule

The highlight is a short arc on the border. Stack a `conic-gradient` in a transparent border; register the angle with `@property` and spin it. A solid inner fill keeps the cone in the stroke. Use the brand accent only.

- The animation only changes `--beam-angle`, from `0deg` to `360deg`.
- Park pins the angle on a corner so the highlight is still on the edge.
- `prefers-reduced-motion` stops the spin and leaves a static stroke.

## Versus flooding the card

| | Whole-card glow | Border path |
| --- | --- | --- |
| Where the light is | Face and inner shadow | Travels the rounded stroke |
| Content | Covered by the sheen | Solid fill; type stays put |
| Reduced motion | Still pulses, or freezes as fog | Static stroke |
