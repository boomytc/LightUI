# Layers

The board should drill from the result. Serve KPI, chart, and table on one platter and you can scan the skin, not the cause.

## The problem

“Make a dashboard” describes the look: numbers, cards, a chart. What actually breaks is a **flattened information hierarchy**:

- KPI, trend, and detail are all there on open, so nothing is first
- Clicking a card only swaps the mark; the grain stays the same
- A dashboard skin (KPI + chart + table) is treated as if the structure were done
- The table fills the page, and the row that moved the most is buried
- Three stacked sections you scroll through look layered, but they were still served at once

More charts do not fix this. You get a buffet, or a scanning skin.

## The rule

First decide whether this board drills from the result, or serves everything on one platter. Click a result, then the next layer. Do not lay every table out on open.

| Leaf | When | Machine |
| --- | --- | --- |
| Layered | Find the cause from the result | `canExpand`; `layerOf` walks kpi → dim → detail |
| Platter | Scan at a glance, do not drill | `showsAll`; KPI, mini chart, and table are all in view |

The two pairs people mix up:

- **Drilling is not switching the mark.** The mark answers what this data is for seeing. A drill changes grain: the same metric, from KPI to dimension to a short detail.
- **Layers are not a dashboard skin.** KPI + chart + table is how a page is laid out. Whether the next layer waits for a click is a different question.

To specify one of these, say three things:

1. **Name** — not “a dashboard”: layered, or a platter
2. **Scene** — drill from the result, or scan at a glance
3. **Rules** — a click reveals the next layer; a platter does not drill

Those three, in one sentence, are the “Say it this way” card.

## Versus serving the platter

| | Platter | Layered |
| --- | --- | --- |
| On open | KPI, chart, and table together | Results only |
| Click a KPI | Highlight, or nothing | Open the dimension table |
| Click a row | Still the whole table | A short detail |
| Find the cause | Scan it yourself | Follow the clicks |

## The machines

The calls live in DOM-free modules: `layerOf(view, selection)` (kpi / dim / detail), `showsAll(view)` (true for platter), `canExpand(view)` (true for layered).
