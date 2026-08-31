# Path Morph

Vector path and icon state micro-transitions. First decide **whether to decompose motion into rigid similarity rotation/scale via 2D Procrustes or linearly interpolate raw coordinates**; preserve corners with arc-length anchors, and handle differing subpath counts with surjective cell division.

## The problem

In menu/close, play/pause, and directional arrows, the most common pitfall when building a path morph is **linearly interpolating raw Cartesian coordinates as $(1-t)A + tB$**:

- **Chord collapse**: In ArrowRight → ArrowDown, rotating vertices travel along the chord, causing the arrowhead to shrink inward by ~30% at $t=0.5$.
- **Shearing & shrinking**: In Plus → Cross, coordinates pinch along the axes, collapsing the intermediate frame into a tiny diamond.
- **Orientation flips**: Straight lines symmetric under inversion tie in residual; naive solvers easily pick a jarring 135° flip instead of a subtle ±45° fold.
- **Popping & vanishing**: Transitioning from 1 subpath to 2 bars (Play → Pause) lacks subpath correspondence, popping elements out of nowhere.
- **Corner softening**: Sampling without corner anchors rounds sharp vertices and checkmarks in transit.

Hand-crafting custom keyframes and rotation groups per icon pair is tedious, fragile, and non-generalizable.

## The rule

Decompose geometric deformation into closed-form similarity alignment and polar space interpolation:

| Mechanism | Math / Geometry Model | Problem Solved |
| --- | --- | --- |
| **2D Procrustes Alignment** | $\theta^* = \operatorname{atan2}(S_{xy}-S_{yx}, S_{xx}+S_{yy})$ | Emergent optimal rotation $\theta^*$ and scale $\sigma^*$ in closed form, no hand-declared groups. |
| **Polar Interpolation** | $P(t) = c(t) + \sigma^t R(t\theta) [(1-t)a + t\tilde{b}]$ | Rigid rotation in polar space; completely eliminates chord collapse and inward shrinkage. |
| **Corner-Anchored Resampling** | 8-point Gauss-Legendre quadrature + corner detection | 100% fidelity at rest endpoints; corners smoothly unfold and sharpen in transit. |
| **Surjective Cell Division** | Centroid-distance pairing + duplication in place | Leftover subpaths duplicate and separate naturally, reading like organic cell division. |
| **Minimal-Rotation Tie-Break $\lambda$** | $\text{score} = \text{res} + \lambda \cdot |\theta| / \pi$ | Resolves line inversion by picking the shortest angular path (±45° over 135°). |
| **Global Hybrid (Block Transport)** | Global centroid block transport | Multi-subpath congruent shapes rotate rigidly without centroids drifting inward. |

## Versus naive coordinate lerp

| | Naive Coordinate Lerp | Polar Procrustes |
| --- | --- | --- |
| **Arrow Right → Down** | Travels along the chord, collapses mid-flight | Rigidly pivots 90° around its centroid |
| **Menu → Close** | Prone to awkward 135° flips | $\lambda$ tie-break folds smoothly at ±45° |
| **1 subpath → 2 bars** | Pops in from a single dimensionless point | Duplicates and divides in place (cell division) |
| **Intermediate Look** | Soft, pinched, sheared | Crisp, energetic, physically continuous |

## The machines

The pipeline consists entirely of DOM-free mathematical functions: `resampleIcon` (Gauss-Legendre + corner detection) $\to$ `buildPlan` (Procrustes + surjective matching + $\lambda$ tie-break) $\to$ `interpPolar` (polar similarity interpolation) $\to$ `serialize`. Each plan takes only 0.01~0.4ms to compute, enabling arbitrary frame rates, scrubbing, and seamless interruptions.
