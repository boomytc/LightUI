# Guide

Teaching is not a dialog, and not a notice. First decide **when it appears, what it pins to, how the user advances, and whether it still blocks after**.

## The problem

“Make an onboarding” describes the look: something pointing at a button and talking. What actually breaks is an **appear / pin / advance / leftover model that does not match**:

- First visit becomes a centered confirm, so the page is blocked and the real control cannot be clicked
- A new feature is shouted with an unread badge; the number never unloads, and nobody is taught how to use it
- An empty title pops a validation error before they have started typing
- The scrim stays after teaching is done, while a checklist unloads at 100%
- A spotlight cutout is built as a card notch, so the hole does not follow the control
- A tour has no skip, so every step must be endured

One teaching dialog for all of these either locks people out, keeps blocking after it is done, or fails to pin to the thing being taught.

## The rule

Ask when it appears, what it pins to, how it advances, and whether it stays — then pick a skin.

| Model | Advance | Blocks outside | Stays after done |
| --- | --- | --- | --- |
| Tour | **Next** (skip allowed) | Yes — scrim, hole follows the target | No |
| Coach | **Got it** | No — the page stays clickable | No |
| Hotspot | **unread → open → read** | No | No — the dot unloads |
| Spotlight | **Click the control in the hole** | Yes | No |
| Checklist | **Check the tasks** | No | Yes — the list stays at 100% |
| Hint | **Filling the field unmounts it** | No | No |

The three pairs people mix up:

- **A spotlight is not a confirm dialog.** It blocks the outside so they must click that control. A confirm asks whether to do the task; there is no real button in its hole.
- **A hotspot is not an unread badge.** A badge stacks a number. A hotspot teaches a new feature: open, read, the dot unloads.
- **A hint is not a validation error.** A hint appears while the field is still empty and leaves when it is filled. Validation speaks after a wrong value.

The cutout exists to reveal the control being taught. It is not a lock-chip scooped out of a card.

To specify one of these, say three things:

1. **Name** — not “onboarding”
2. **Scene** — first visit to the workbench, a new feature, an empty title, or a getting-started list
3. **Rules** — when it appears, what it pins to, how they advance, whether it still blocks after

Those three become the line on the spec card.

## Versus always a teaching dialog

| | Always a teaching dialog | Split by appear / pin / advance |
| --- | --- | --- |
| First visit | A centered card; the real button cannot be clicked | A tour with a moving hole; Next or Skip |
| One line on Publish | The whole page dims | A coach bubble; the page stays clickable |
| New feature | An unread count that never leaves | A hotspot: open, read, the dot unloads |
| They must act | A Next button, but the control cannot be hit | No Next — click the control in the hole |
| Four getting-started tasks | The guide unloads when finished | At 100% the title becomes Ready; the list stays |
| Empty title | A red validation error | A hint that unmounts when filled |

## The machines

The rules live in DOM-free modules: `guideAdvance`, `guideBlocksOutside`, `guidePersists`, `allowsSkip`, `hotspotNext`, `hintActive`, `tourStep`, `checklistProgress`, `cutoutPad`.
