# Login

“Make a login page” only says there is a form. First decide **whether login is a card, a split, immersive, a role gate, or steps**.

## The problem

“Make a login” describes the look: email, password, a button. What actually breaks is a **gate that does not match the product**:

- A quiet tool is drawn as a full-bleed poster, so arrivals cannot find the card
- A studio that needs to speak brand is only a white card in empty space
- Travel or event atmosphere is boxed into a SaaS card, so the punch is gone
- Personal and enterprise fields differ, but they are jammed into one long form
- Email, verify, and password land on one screen, so one view does three jobs

One centered white card for all of these either leaves brand nowhere to stand, hides the role gate, or scares people off with a wall of fields.

## The rule

Pick the stage by *how arrival stands*. Skin comes after. The fields are fake — this study does not ask about auth, only about staging.

| Stage | When | Machine |
| --- | --- | --- |
| Centered card | Quiet SaaS, a generic tool | **One pane**; the card floats in whitespace |
| Split | Brand on the left, form on the right | **Two panes**; `paneCount` is 2 |
| Immersive | Full-bleed image or wash | **One pane**; the form sits on the ground, not in a second column |
| Role gate | Identities differ, fields differ | **Pick a role first**; `needsRole` |
| Steps | Email → verify → password | **One job per screen**; `isStepped`; not one long form |

The four pairs people mix up:

- **How the login card sits is not the page skeleton.** Floating card, split, immersive — that is the gate. How the rest of the page is laid out is a skeleton question.
- **Login is not a selling hero.** A hero sells a promise. Login has to let people in.
- **A split is not immersive.** A split is two panes: brand, then form. Immersive is one ground; the form sits on it.
- **A role gate is not steps.** A role is pick an identity, then enter its form. Steps are one identity, one field per screen.

To specify one of these, say three things:

1. **Name** — not “make a login page”
2. **Scene** — a quiet tool, a brand split, atmosphere, pick an identity first, or too many fields
3. **Rules** — one floating card, two brand panes, sit on the wash, pick a role, one job per screen

Those three, in one sentence, are the “Say it this way” card.

## Versus always a centered white card

| | Always a white card | Split by stage |
| --- | --- | --- |
| A SaaS desk | Accidental match | The card floats in whitespace |
| A studio | Brand has nowhere to stand | Brand left, form right |
| A travel account | The poster is cropped into a card | The form sits on a full-bleed wash |
| Personal / enterprise | Two field sets in one form | Pick a role, then each form |
| Many verify steps | Three questions on one screen | Email, then password — one job each |

## The machines

The calls live in DOM-free modules: `paneCount`, `isStepped`, `needsRole`. Only the split has two panes. Only the role gate picks an identity first. Only steps advance a screen.
