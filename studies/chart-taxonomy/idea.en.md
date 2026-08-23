# Chart

“Make a chart” only says there are numbers. First decide **what this data is for seeing**.

## The problem

“Make a chart” describes the look: numbers, therefore a drawing. What actually breaks is an **intent that does not match the mark**:

- Months are sliced into a pie, so the rise and fall disappear
- City names stand up as columns and rotate 45° to fit
- Unordered categories are joined with a line, as if they had an order
- Ad spend and sales become two lines, though the points are not a time series
- Shown → click → pay are drawn as sibling columns, so the drop is hidden
- Six scores become six columns, so rounded vs lopsided never shows

One pie or one column for all of these either chops the trend, rotates the names, or invents a story between unrelated dots.

Picking the mark is also not drilling a dashboard. First decide what this data is for seeing; clicking into a finer grain is a later question.

## The rule

Ask the intent, then pick the mark. Skin, palette, and 3D come after.

| Intent | The question | The mark |
| --- | --- | --- |
| Change | How it moves over time | Line. Volume too → area. Equally spaced time; break a gap. Do not join unordered categories |
| Compare | Who is bigger, who ranks | Short names: columns. Long names or rank: bars. Axis from 0 |
| Share | How the whole is cut | ≤5 slices, a donut from 12 o'clock. An inner split: stacked. Not a trend |
| Relate | Whether two things move together | Two continuous numbers → scatter. Two dimensions × intensity → heatmap |
| Flow | Where the conversion drops | Funnel. Each step contains the next: shown → click → pay |
| Ability | Several scores, rounded or lopsided | Radar. 5–7 axes, all 0–100, from 0 |

The three pairs people mix up:

- **Picking a mark is not dashboard drill-down.** First decide whether this data is for change, size, share, relation, flow, or ability. Clicking into a finer grain is a later question.
- **Do not pie a time trend.** A pie has no left-to-right. Months are time, not share.
- **Do not stand long names up as columns.** They crowd and rotate. Rankings and full city names use bars, written across.

To specify one of these, say three things:

1. **Name** — not “a chart”
2. **Scene** — change, size, share, relation, flow, or ability
3. **Rules** — time before a line, axis from 0, five pie slices max, a funnel has containment

## Versus always a pie or a column

| | Always a pie or a column | Ask what it is for seeing |
| --- | --- | --- |
| Monthly sales | Twelve slices, no rise or fall | A line, time left to right |
| City ranking | Columns with 45° names | Bars, names written across |
| Five budget slices | Twelve tiny pies, or a 3D pie | A donut from 12 o'clock |
| Spend vs sales | Two lines joining the dots | A scatter, correlation or not |
| Shown to pay | Sibling columns | A funnel; each step contains the next |
| Six scores | Six columns | A radar, rounded or lopsided |

## The machines

The decision lives in DOM-free modules: `intentOf` (the leaf is the question), `markFor(intent, followup)`, `axisFromZero`, `tooManyForPie` (>5), `lineRequiresTime` (only “change” may join with a line).
