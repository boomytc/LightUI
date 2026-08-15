# Name the dropdown

Opening downward is only the look. Name the **commit model** first.

## The problem

“Make a dropdown” describes the look: a panel that opens downward. What actually breaks is the **commit rule**:

- Should it close after a pick?
- Is the value one item, a set, a path, an action, or a date span?
- Are group headers a hierarchy?
- Can the main button fire without opening anything?

One Select cannot carry those differences. People lose a selection at the wrong time, cannot reach the default action, or treat a category label as a parent.

## The rule

Pick the model by *what is committed* and *when the panel closes*. Skin comes after.

| Model | What commits | When it closes |
| --- | --- | --- |
| Select | **One** value from a flat fixed list | On pick |
| Multi-select | A set (chips); optional max | **Stays open**; remove a chip, or clear all |
| Grouped Select | Still one value; groups are labels | On pick |
| Cascader | A **path** that must reach a leaf; parents only expand | On leaf pick; the trigger shows the full path |
| Split Button | The body fires the default now; the chevron is overflow | Only the chevron opens a menu |
| Mega Menu | Not a form value — multi-column navigation | On a link, or on another nav item |
| Date range | Check-in, then check-out; past days blocked | A span exists only with both ends; nights = calendar-day difference |

The pair people mix up: **Grouped is filing. Cascader is parent–child.** A group title is not a path. A province is not a finished value.

To specify one of these, say three things:

1. **Name** — not “a dropdown”
2. **Scene** — what is picked once
3. **Rules** — single / multi / must reach a leaf / past disabled / the body must fire

## Versus wrapping everything in a Popover

| | Always a Select | Split by commit model |
| --- | --- | --- |
| Skill tags | Closes after one; second tag never lands | Stays open; chips peel off the trigger |
| Region | Commits “Zhejiang” as the value | Parents expand; a leaf commits the path |
| Publish | Default action buried in a menu | Body publishes; chevron is schedule / draft |
| Hotel dates | One `input type=date` | Two ends, past locked, nights shown |

## Machines

The Cascader here is click-to-expand columns. The Mega Menu is click-to-toggle. Neither tracks the pointer.

The state machines live in DOM-free modules: `toggleMulti`, `pickCascade`, `pickRangeDay`.
