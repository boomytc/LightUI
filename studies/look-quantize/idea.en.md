# Gaze

Pointer offset becomes a discrete atlas cell. Smooth inside the radius, clamp outside, blink on the other row.

## The problem

A face that looks at the pointer cannot rotate continuously if the art is an atlas — the in-between angles are missing. Jumping to the farthest cell on every move makes small nearby motion flicker.

## The rule

Divide the pointer offset from the origin by the radius to get a look vector in `[-1, 1]`. If the length is over 1, clamp it onto the circle. Each frame exponentially smooths toward that vector, then quantizes to a 7×3 grid:

```
col = round((lookX * 0.5 + 0.5) * 6)
row = round((lookY * 0.5 + 0.5) * 2)
```

A blink is not a rotation. It is the same cell on the other row (source row = row + 3). Auto-blink switches the source row and leaves the look vector alone.

## Versus continuous turn

| | Continuous / instant cell | Smooth, then quantize |
| --- | --- | --- |
| Atlas | Missing angles are invented | Only existing cells |
| Outside the radius | Keeps flying with the pointer | Clamped to the circle |
| Blink | A second rotation | Same cell, other row |
