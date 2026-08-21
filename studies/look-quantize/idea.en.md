# Gaze

Pointer offset becomes a discrete atlas cell. Smooth inside the radius, clamp outside, blink on the other row.

## The problem

A face that looks at the pointer cannot rotate continuously if the art is an atlas — the in-between angles are missing. Jumping to the farthest cell on every move makes small nearby motion flicker. Storing a 50% overlap as a look leaves a double snout when the pointer rests.

## The rule

Divide the pointer offset from the origin by the radius to get a look vector in `[-1, 1]`. If the length is over 1, clamp it onto the circle. Each frame exponentially smooths toward that vector, then quantizes to a 7×3 grid:

```
col = round((lookX * 0.5 + 0.5) * 6)
row = round((lookY * 0.5 + 0.5) * 2)
```

The atlas stores unique poses only. When the cell changes, the last pose crossfades into the next. Overlap is the hop, not a look.

A blink is not a rotation. It is the same cell on the other row (source row = row + 3). Auto-blink switches the source row and leaves the look vector alone.

## Versus continuous turn

| | Continuous / instant cell | Smooth, then quantize |
| --- | --- | --- |
| Atlas | Missing angles are invented, or two faces are stored as one cell | Only existing cells |
| Cell hop | Hard cut, or rest on a ghost | Dissolve, then one pose |
| Outside the radius | Keeps flying with the pointer | Clamped to the circle |
| Blink | A second rotation | Same cell, other row |
