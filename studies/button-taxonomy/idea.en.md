# Button

“Make a button” only says it can be clicked. First decide **how heavy this action should be**.

## The problem

“Make a button” describes the look: something you can press. What actually breaks is **weight that does not match the job in this region**:

- Two filled buttons in one region, so it is unclear which to hit first
- A secondary action is filled too, and it competes with the primary
- A weak action is drawn with a stroke, so it reads as a second primary
- The primary is a line of text, so a scan misses it
- “How heavy” is treated as “fill versus pick”
- Cancel and confirm in a dialog are the same weight
- A text button is built as a link to another page

One filled style for all of these either shouts twice in one region, or hides the click that should commit.

## The rule

Name the action as primary, secondary, or weak in this region. Skin comes after.

| Leaf | Weight | Chrome | What it is for |
| --- | --- | --- | --- |
| Solid | **Primary** | Filled | The one main action in this region: download, submit, sign up |
| Outline | **Secondary** | A stroke, no fill | A pair that does not compete: learn more, cancel |
| Text | **Tertiary** | No border, no fill | A quiet out: not now, forgot password |

**A region may have only one solid.** `tooManyPrimaries` is true when the filled count is greater than 1.

Corner radius can change inside the same weight — rounded, pill, and full-width are skin, not a fourth leaf. Changing the radius does not change the weight, and it does not license a second fill.

The three pairs people mix up:

- **Button weight is not fill versus pick.** One line or a paragraph, compared in view or a short list — that is how a field commits an answer. A button asks how heavy this click is.
- **The primary is not “the only action in a dialog.”** Overlay asks whether the layer interrupts, and whether it sticks to the trigger. A dialog can still hold confirm (solid) and cancel (outline). Interrupt does not mean a single button.
- **A text button is not link navigation.** A text button is still a weak action on this page. Going somewhere else is nav.

To specify one of these, say three things:

1. **Name** — not “a button”: solid, outline, or text
2. **Scene** — the primary, secondary, or weak action in this region
3. **Rules** — one solid per region; outline does not compete; text has no chrome

Those three become the line on the spec card.

## Versus always filling

| | Always solid | Split by weight |
| --- | --- | --- |
| A download card | Three filled buttons; no first click | Download now is solid, learn more is outline, not now is text |
| Sign in | Forgot password is filled too | Sign in is solid; forgot password is a line of text |
| A confirm dialog | Cancel and confirm weigh the same | Confirm is solid; cancel is outline |

## The machines

The judgment lives in DOM-free modules: `weight`, `filled`, `tooManyPrimaries`, `roleFor`. Only solid is filled. More than one solid in a region is wrong.
