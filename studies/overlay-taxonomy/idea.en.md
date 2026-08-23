# Overlay

Floating is only the look. First decide **whether it interrupts the current task, and whether it sticks to the trigger**.

## The problem

“Make a dialog” describes the look: something covering the page. What actually breaks is an **interrupt model and an anchor that do not match**:

- Four avatar actions become a centered card, so the whole page is blocked
- A delete confirm closes on the scrim, so a miss-tap undoes the confirm
- A multi-field edit is stuffed into a small centered card, so it cannot scroll or sit next to the list
- A content editor that slides in is built as the site hamburger
- A temporary edit drawer is built as an off-canvas rail that does not occupy space
- An action menu is built as a dropdown that commits a value

One centered card for all of these either inflates a light action into a block, or lets a heavy decision dismiss on empty space.

## The rule

Ask interrupt vs attach first. Skin comes after.

| Model | Interrupt | Anchor | Dismiss |
| --- | --- | --- | --- |
| Modal | **Must be handled first** | Centered in the viewport | Strong scrim; a dangerous action must not close on the scrim; Esc / buttons; focus stays in the dialog and returns to the trigger |
| Drawer | **Weak interrupt** | Slides in from the right; the list stays visible | Light scrim; a click on the scrim closes it. Use this when there are many fields — do not cram them into a centered card |
| Popover | **Does not interrupt** | **Stuck to the trigger** | No strong scrim; outside click / Esc / the trigger again. 2–7 items; more than that is a drawer. Delete in the menu opens a modal |

The two pairs people mix up:

- **A content drawer is not a hamburger nav.** The drawer is an edit form on this page, from the right, with the list still underneath. A hamburger pulls site destinations in from the edge.
- **A right-hand drawer is not an off-canvas rail.** The drawer covers the current task and goes away when you are done. An off-canvas rail is about occupancy: whether the main column yields.

To specify one of these, say three things:

1. **Name** — not “a dialog”
2. **Scene** — a delete confirm, fields beside a list, or a few actions next to the avatar
3. **Rules** — interrupt or not, stuck to the trigger or not, scrim-dismiss or not

Those three become the line on the spec card.

## Versus always centering a card

| | Always a centered modal | Split by interrupt / attach |
| --- | --- | --- |
| Avatar menu | A card blocks the page | A popover on the avatar; the page is still readable |
| Delete a file | A scrim click closes it, so there was no confirm | Cancel, confirm, or Esc |
| Edit a product | A small card, no list to compare | A right drawer; fields scroll; the list stays |
| Delete in a menu | Light action and heavy decision are the same layer | The popover is the action; the modal is the confirm |

A popover is also not a dropdown that opens downward and commits a value. An action menu does not submit a form value. Deleting an account is a second, blocking decision.

## The machines

The rules live in DOM-free modules: `interruptKind`, `hasBackdrop`, `backdropDismiss`, `anchorsToTrigger`, `restoreFocus`, `tooManyForPopover`. Exit animation state is `presence`.
