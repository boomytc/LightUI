# Gaze

Pointer offset becomes a discrete atlas cell. Smooth inside the radius, clamp outside, blink on the other row.

## The problem

A face that looks at the pointer cannot rotate continuously if the art is an atlas — the in-between angles are missing. Jumping to the farthest cell on every move makes small nearby motion flicker. Storing a 50% overlap as a look, or dissolving on every hop, flashes a double snout.

## The rule

Divide the pointer offset from the origin by the radius to get a look vector in `[-1, 1]`. If the length is over 1, clamp it onto the circle. Each frame exponentially smooths toward that vector, then quantizes to a 13×3 grid (one unique yaw in-between between each 7×3 key):

```
col = round((lookX * 0.5 + 0.5) * 12)
row = round((lookY * 0.5 + 0.5) * 2)
```

The atlas stores unique poses only. A hop cuts to the next cell. It does not dissolve.

A blink is not a rotation. It is the same cell on the other row (source row = row + 3). Auto-blink switches the source row and leaves the look vector alone.

## Versus continuous turn

| | Continuous / dissolve hop | Smooth, then quantize |
| --- | --- | --- |
| Atlas | Missing angles are invented, or two faces are stored as one cell | Only existing cells |
| Cell hop | Dissolve flashes a double face | Hard cut to the next unique pose |
| Outside the radius | Keeps flying with the pointer | Clamped to the circle |
| Blink | A second rotation | Same cell, other row |
