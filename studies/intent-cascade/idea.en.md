# Menu intent · Safe triangle

Extracted from a menu-intent demo. The extract is the judgment, not the host chrome.

## The problem

Sliding from the first level into the second briefly crosses other items. If hover-to-open is literal, the submenu is stolen on the way.

A flat 200ms hover delay is also wrong: vertical scanning becomes sticky, and a diagonal is often still too short.

## The rule

After a submenu opens, the previous pointer sample and the leading-edge corners form a triangle (the safe corridor).

Each frame:

1. **Point in the triangle**, or **slope to the top falls and slope to the bottom rises** (heading into the cone) → treat as heading into the submenu. Do not switch the first-level highlight.
2. The pointer turns, leaves the corridor, or dwells on another item past `restDelay` (280ms by default) → switch immediately.
3. The pointer is already in the submenu panel → lock the path (the overlay turns green).
4. The gap between columns is also safe, so a small gutter does not break the corridor.
5. Moving up and down the first column, not toward the submenu → switch immediately. Intent only protects a path that looks like it is entering the submenu.

The blue overlay uses the **live** pointer as the third vertex so the corridor is visible. The real test uses the **previous** sample — otherwise the pointer sits on its own vertex and intent cannot be measured.

## Pseudocode

```
function predictsIntent(prev, curr, top, bot, pad = 6) {
  if (pointInTriangle(curr, prev, top, bot, pad)) return true
  // Amazon / jquery-menu-aim slope test
  return slope(curr, top) < slope(prev, top)
      && slope(curr, bot) > slope(prev, bot)
}
```

`pointInTriangle` uses same-side cross products and a little pad, so a long thin corridor is not lost to sampling jitter.

## Versus a flat delay

| | Flat delay | Intent |
| --- | --- | --- |
| Vertical scan | Sticky | Instant |
| Diagonal into submenu | May still switch mid-path | Protected in the corridor |
| Dwell on the wrong item | Wait the fixed time | Give up after `restDelay` |

## Lineage

- Amazon mega dropdown, Ben Kamens, 2013
- [jquery-menu-aim](https://github.com/kamens/jQuery-menu-aim)
- Floating UI [`safePolygon`](https://floating-ui.com/docs/usehover#safepolygon)

This study draws the corridor so you can debug it.

## What was kept, what was dropped

Kept:

- Triangle / slope / `predictsIntent`
- Pointer history, rest delay, gap bridge, lock after entering the submenu
- Blue / green overlay as teaching chrome
- A filter tree as the operable fixture
- Three contrast gestures: diagonal, vertical, third level

Dropped: routing, sign-in, database, and host chrome from the source demo.

The only structural change: `useIntentCascade` takes a `tree` and `initialPath` instead of hard-coded demo data. Geometry stays DOM-free.
