# Chart read

After the chart is drawn, this gesture is a readout, a filter, or a window change. Picking the mark is a different question; so is drilling a board.

## The problem

“Add some interaction to the chart” describes the look: the pointer does something. What actually breaks is a **gesture that writes the wrong state**:

- The legend is treated as a color key, then a click hides the only remaining series
- A crosshair drags the whole plot, so reading a point becomes a window change
- A brush meant to derive an average zooms the axis on release
- Clicking a bar swaps the mark, though the path did not change
- A tooltip grows the plot, so it jumps when the card unmounts
- Drill-down is built as another dashboard
- Snapping to the nearest point is built as gaze landing on a cell

One hover for all of these either turns a readout into a filter, or a filter into a zoom.

## The rule

Ask whether this hand is a readout, a filter, a range, a window, or a path — then bind the pointer.

| Gesture | Class | Rule |
| --- | --- | --- |
| Crosshair / highlight / tooltip | **read** | Snap to the nearest index. Hide on leave. Highlight a narrative point (anomaly dip or peak) and dim the rest. The tooltip is absolutely positioned; plot size stays locked |
| Legend | **filter** | Toggle series visibility. The last visible series cannot hide |
| Brush | **range** | Pointer down marks the origin; drag an inclusive span; up freezes it. Derive avg and peak. Do not change the display window |
| Zoom | **window** | An `[start, end]` slice. Wheel or 30 / 7 / 3, scaled around the cursor, span at least `minSpan` |
| Drill | **path** | Push a child id only if it has children; a leaf does not push. Breadcrumb pops. A path on one chart, not a board that drills from the result |

The three pairs people mix up:

- **A legend is filter state, not decoration.** A click changes which series are on. A color key must not hide the last series.
- **Drilling a path is not switching the mark.** The mark answers what the data is for seeing. A bar click pushes channel → category → page.
- **A frozen brush is not a zoom window.** The brush leaves a range and its avg/peak; the axis stays. Zoom is what changes `[start, end]`.

Nearest-index snap is reading a point, not gaze landing on a cell. The chart rounds onto an index; gaze quantizes an offset onto an atlas cell.

To specify this gesture, say three things:

1. **Name** — not “add interaction”
2. **Scene** — read a point, hide a series, brush a range for stats, wheel the window, or click a bar to change path
3. **Rules** — leave unmounts; the last series stays; a frozen brush is not a zoom; a leaf does not push

Those three, in one sentence, are the “Say it this way” card.

## Versus always a tooltip

| | Always a tooltip | Split by read / filter / window |
| --- | --- | --- |
| Read a point | The card grows the plot | Leave unmounts the card; size stays |
| Hide a series | The legend is a color key | A filter; the last series stays |
| Brush a span | It becomes a zoom | A frozen range, avg and peak |
| See one week | Hover does not change the window | `zoomWindow` slices `[start, end]` around the cursor |
| Channel, then down | Swap in a pie | The same bars push a path |

## The machines

The rules live in DOM-free modules: `gestureClass`, `nearestIndex`, `brushPointerDown/Move/Up`, `rangeStats`, `legendToggle`, `zoomWindow`, `drillPush` / `drillPop`.
