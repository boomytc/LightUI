# Sidebar

Flush-left is only the skin. First decide the **space model**.

## The problem

“Make a sidebar” describes placement: a nav rail on the left. What actually breaks is **how space is given back to the main view**:

- Does it occupy space by default?
- Flush to the edge, or inset?
- Does expand change width, or overlay a layer?
- Are the items a tree, or a selector?
- Is a parent a category, or a page?

One flush-left rail for all of these either permanently squeezes the canvas, or hides the entry on a small screen.

## The rule

Pick the model by occupancy and what expand changes, then talk about the skin.

| Model | Occupies by default | What expand does |
| --- | --- | --- |
| Floating island | Yes, but not flush | Still a card; inset + shadow make the layer |
| Option wheel | Yes | Items roll on an arc; only the baseline item is current. A selector, not a tree |
| Multi-level | Yes | A parent files the list; children indent |
| Collapsible | Yes, width is variable | Labels when open; icons only when shut; the main view grows |
| Off-canvas | **No** | Slides in over the canvas; Esc / backdrop closes |

Two pairs people mix up:

- **Collapsible is not off-canvas.** Collapsed still occupies an icon rail. Off-canvas has zero width until it opens.
- **Multi-level is not a wheel.** Multi-level is a tree. A wheel is an ordered selector; only the item on the baseline is current.

To name a sidebar, say three things:

1. **Name** — not “a sidebar”
2. **Scene** — workspace, portfolio, admin, analytics, long-form TOC
3. **Rule** — flush / inset, occupancy, grow vs overlay, whether a parent is a page

## Versus “just pin an aside”

| | One flush rail | By space model |
| --- | --- | --- |
| Portfolio browse | Every item looks current | Wheel: only the baseline item is selected |
| Analytics | Always 240px | Collapse and the chart eats the width back |
| Long article | TOC permanently crowds the text | Off-canvas yields the column until asked |
| Dense admin | One flat list never ends | Parents file; children indent |

## Machines

The multi-level fixture here is click-to-accordion.

The machines live without DOM: `stepIndex`, `wheelVisual`, `toggleBranch`, `occupyPx`.
