# Notice

Naming a notice only says it should speak. First decide **how loudly this notice should interrupt**.

## The problem

“Show a notice” describes the look: a line of copy appears. What actually breaks is an **interruption weight that does not match the machine**:

- An unread count is built as a dialog you must dismiss
- A successful save blocks the form until you click OK
- Delete asks “are you sure?” instead of doing it and offering undo
- Several announcements become a carousel that swaps the whole view
- An export-done flash vanishes, with nowhere to look it up
- A leaked-key risk is a toast that disappears in two seconds
- Maintenance only pops on the current page, then dies on navigate
- An empty list is written as a notice
- A progress bar is treated as a toast

One “just pop it” for all of these either interrupts the task, lets people miss the message, or treats a must-handle risk as a skippable result.

## The rule

Pick the rung by *must they see it, must they act, can they miss it*. Skin comes after.

| Rung | When | Machine |
| --- | --- | --- |
| Weak · Badge | Only a number | Stack it on the icon; **unload at 0, no empty dot**; 99+ past 99; do not pop |
| Weak · Toast | Only a result | Mid-top of the content, ~**2.4s** then gone; no mask, the form keeps moving |
| Mid · Snackbar | One immediate action too | ~**5s**; include Undo; delete first, then offer a way back — no confirm dialog |
| Mid · Marquee | Several items in turn | One strip under the header; **pause on hover**; not a carousel that swaps the view |
| Mid · Inbox | They may look later | Write it into the bell list; a badge for unread; do not stop the current work |
| Strong · Alert | Must see, must handle | Pin it in the content; it stays until handled; **not a page-blocking modal** |
| Strong · Banner | The whole product | Sit under the nav; survive page changes; the person closes it |

The three pairs people mix up:

- **A notice is not a dialog.** A notice does not interrupt the current task. If they must handle it before they can continue, that is a dialog. An alert must be seen, but the content is still usable.
- **A marquee is not a carousel.** A marquee rotates copy in one strip. A carousel takes the whole view away.
- **An alert is not a toast.** A risk cannot vanish in two seconds. A toast only reports a result that already happened.

A numeric badge and a text badge are two shapes. This study teaches the **numeric badge**: unload at 0. A text badge (“New”, “Hot”) marks status — do not use it as an unread count.

An empty state is not a notice. Progress is not a toast.

To specify one of these, say three things:

1. **Name** — not “a notice”
2. **Scene** — unread count, save succeeded, undo a delete, log an export, or site-wide maintenance
3. **Rule** — hide at 0 / ~2.4s / undoable / logged / stays until handled / survives navigation

Those three, in one sentence, are the “Say it this way” card. Copy it and it is the spec; there is no second way to say it.

## Versus “just pop it”

| | One dialog or toast | Split by interruption weight |
| --- | --- | --- |
| Unread messages | A pop per arrival | A badge with a number, a glance |
| Save profile | Block the form for OK | A 2.4s toast; hands stay on the field |
| Delete a draft | Ask “are you sure?” first | Delete now; undo for five seconds |
| Several announcements | A hero carousel swaps the page | A header marquee; pause on hover |
| Export done | A flash, then gone | Written to the inbox; the bell keeps it |
| Leaked key | A toast that lasts two seconds | An alert pinned in the content until Reset |
| Tonight’s maintenance | Only on this page | A banner under the nav; it survives a page change |

## The machines

The rungs live in DOM-free modules: `weight`, `autoDismissMs`, `persists`, `needsAction`, `hideBadge`, `badgeLabel`, `interruptsTask`. None of the seven leaves interrupt the task — including alert.
