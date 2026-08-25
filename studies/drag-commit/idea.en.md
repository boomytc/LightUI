# Drag

The grab is only the gesture. First decide **whether the drop commits a new order, a single receive, a cross-list transfer, or an invalid snap-back**.

## The problem

“Make it draggable” describes the look: something following the pointer. What actually breaks is a **commit model that does not match**:

- A same-list reorder is built as a dropzone, so a drop on empty space swallows the card
- A dropzone is built as a reorder, so a drop outside still changes order
- A cross-list transfer collapses the source while dragging, so it already looks committed
- A drop onto a read-only tray writes the data; the snap-back is only paint
- A placeholder hole is treated as a fifth kind of commit
- Autoscroll at the edge is treated as another kind of drag

One “just drag it” for all of these either fails to commit what it should, or commits what it must not.

## The rule

Ask what the drop commits first. Ghosts, holes, and edge scrolling come after.

| Model | Commit | While dragging | On drop |
| --- | --- | --- | --- |
| Reorder | **A new order** | Others yield a hole; insert on the vertical midline | One new list |
| Dropzone | **A single receive** | Highlight only while the pointer is inside | Inside receives; outside does nothing |
| Transfer | **Source + dest + index** | Source ghost stays, the list does not collapse; dest shows a gap | Both lists in one commit |
| Snap-back | **Reject** | The path may follow the pointer | Model unchanged; the path reverses |

The three pairs people mix up:

- **A placeholder hole is not another commit.** The hole hints where the insert will land. The commit is still a new order or a transfer.
- **A snap-back is not a successful drop.** It returns because the target is invalid; the data arrays must not change.
- **Across lists is not a same-list reorder.** A transfer commits source, dest, and destIndex. The source does not collapse while dragging, or it already looks committed.

To specify one of these, say three things:

1. **Name** — not “a drag”
2. **Scene** — reorder a list, drop into a zone, move queue→today, or hit a read-only tray
3. **Rules** — what the drop commits; whether an invalid target mutates the model

Those three become the line on the spec card.

## Versus always “just drag it”

| | Always a drag | Split by commit |
| --- | --- | --- |
| Task order | Leaving the list still reorders | Insert on the midline, same list |
| Drop into inbox | A drop outside still receives | Receive only inside the zone |
| Queue onto Today | The source vanishes at once | Source keeps a ghost; both lists change on drop |
| Onto read-only | It writes the archive | Turns red, path reverses, arrays stay |

Autoscroll is not a fifth kind. Near the container’s 64px edge the reorder list scrolls itself; the commit is still a new order. The lift threshold is 6px so a click is not a drag.

## The machines

The rules live in DOM-free modules: `commitKind`, `insertIndexY`, `dropzoneHit`, `moveItem`, `transferItem`, `snapbackKeepsModel`, `passedThreshold`, `edgeScrollDelta`.
