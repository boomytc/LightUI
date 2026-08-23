# Hero

“Make a fancy hero” only says it should look expensive. First decide **what the first glance must answer**.

## The problem

“Make a hero” describes the look: a big picture, a slogan, two buttons. What actually breaks is a **first-fold job that does not match the site**:

- A product page is empty talk, so you cannot tell what it solves
- A portfolio dumps a CV, so you cannot tell who they are or how good the work is
- An event asks you to register before it says why now
- A shop rotates five posters, so the one product and the reason to buy disappear
- A news home is packed with nav and subscribe, so you cannot tell what happened
- A course lists a syllabus, so you cannot tell what you will learn to make
- A tool tells a company story, and you cannot try it
- A community sells the platform, and you cannot see who is here

One “fancy image + two buttons” for all of these either answers nobody’s question, or mixes a login card, a landing skeleton, and the first-fold job into one blob.

## The rule

Pick the leaf by *the thing you must confirm without scrolling*. Skin comes after. The first fold is a **job**, not stuffing every homepage module into the viewport, and not making a poster for its own sake.

| Leaf | First glance | Structure |
| --- | --- | --- |
| Product | **What can it solve?** | Value on the left, product shape on the right, trust below |
| Portfolio | **Who are you, and how good is the work?** | Magazine banner + avatar + a piece of work |
| Event | **Why join now?** | Theme + when/where + **one primary** + seats |
| Commerce | **What is for sale, and is it worth it?** | One hero product + price reason + buy now. **No five-poster carousel** |
| Media | **What happened?** | Headline + dek + time and source |
| Education | **What will I learn to make?** | An outcome promise + work slices, not a syllabus list |
| Tool | **What can it do for me?** | One-line capability + **try it here** |
| Community | **Who is here?** | People and topics, not a product pitch |

**One primary per fold.** `primaryCtaCount` is 1 for every leaf. A secondary may exist; a second filled primary may not.

Commerce sets `allowsCarousel` to false: one featured product. `tooManyBanners` is true when the poster count is greater than 1. A portfolio magazine banner may rotate representative work — that is not five sale posters.

The three pairs people mix up:

- **A landing skeleton is not what the first fold answers.** How a landing is banded (promise, proof, CTA) is the page skeleton. This study asks **which question the un-scrolled glance must confirm**.
- **The first fold is not a login card.** A login card asks who you are and whether you may enter. The first fold answers what the person who opened this page cares about right now.
- **Commerce is not five posters; a course is not a syllabus.** A shop features one product. A course promises the work, then offers the outline.

To specify one of these, say three things:

1. **Name** — not “a fancy hero”
2. **Scene** — what the person who opened this page must confirm
3. **Rules** — the first glance gives the answer; one primary; a shop does not rotate five posters

Those three, in one sentence, are the “Say it this way” card.

## Versus always “big image, two buttons”

| | Always a fancy hero | Split by first-glance job |
| --- | --- | --- |
| A team tool | Slogan + demo, no problem named | Value, product, trust |
| A designer home | A CV wall | Avatar, work, style |
| A conference | Two equal buttons | Theme, when/where, one register, seats |
| A furniture shop | Five posters | One product, a reason, buy now |
| A trade brief | Nav, subscribe, ads in the fold | Headline, dek, time and source |
| A design course | A week-by-week list | The finished work, slices, start date |
| A cut-out tool | A company story | One line, try it here |
| A makers’ club | Platform selling points | People and topics, now |

## The machines

The calls live in DOM-free modules: `questionOf`, `primaryCtaCount`, `allowsCarousel`, `tooManyBanners`. Each leaf has a different first-glance question; the primary is always one; a shop must not rotate posters.
