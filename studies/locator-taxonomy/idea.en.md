# In-Page Locator

A page growing longer is only a symptom. First decide the user's **intent: continuous reading, structural jump, progressive disclosure, or in-page search and filtering**.

## Problem

AI systems and long documents easily produce monolithic endless pages. What truly breaks the user experience is the **loss of orientation and directional paths**:

- Halfway through an article, users don't know how much is left.
- Scrolled hundreds of pixels deep, returning to the top requires tedious upward dragging.
- Help docs with dozens of sections lack a fast overview and chapter direct-jump.
- Complex forms laid flat without steps cause cognitive overload.
- Low-frequency parameters and FAQs laid flat dilute scanning efficiency.
- Mixed-status lists require manual scanning instead of faceted narrowing.

Relying on raw scrolling for everything causes severe "scroll fatigue" and spatial disorientation.

## Rules

Identify user intent first, then select the matching locator mechanism.

| Intent | Locator Model | Core Mechanism | UX Safeguard |
| --- | --- | --- | --- |
| **Immersive Reading** | Reading Progress | Compute `scrollTop / (scrollHeight - clientHeight)` | Edge-aligned, non-intrusive, stays at 100% when finished |
| **Immersive Reading** | Back to Top | Reveal smoothly after 1.5–2 viewports (>240px) | Respect `prefers-reduced-motion`; never listen on window when container scrolls |
| **Quick Jump** | Anchor TOC | Lateral outline synced with `IntersectionObserver` | Lock scrollspy during click jumps to prevent jitter; configure `scroll-margin-top` |
| **Phased Task** | Stepper | Controlled step index state machine | Highlight current step; allow reviewing completed steps but forbid jumping forward |
| **Progressive Disclosure** | Accordion | Reveal titles by default, expand on demand | Use CSS `grid-template-rows: 0fr / 1fr` for zero-jitter height transition |
| **Exact Retrieval** | In-page Search | Weighted token matching (title > tag > excerpt) | Debounce input, dynamically replace results, highlight hits |
| **Facet Narrowing** | Status Filter | Derived controlled filter slices | Show real-time item counts per status; provide empty states |

Key distinctions:

- **In-page locators are not site-wide routing.** Outlines and progress bars guide within a page structure; site navigation handles cross-route journeys.
- **Reading progress is not scrollbar chrome.** A scrollbar maps viewport to track; reading progress expresses task completion and remaining depth.
- **Outline anchors are not tab switching.** Tabs replace views and cut context; outline jumps preserve context and holistic structure.
- **Steppers are not progressive form disclosure.** Steppers enforce linear phase commits; field disclosure reveals content on demand within a single stage.

## Naive Scrolling vs Intent-Matched Locators

| Scenario | Monolithic Long Scroll | Intent-Matched Locator |
| --- | --- | --- |
| 20-chapter documentation | Endless scrolling to find an API section | Lateral outline with live scrollspy and one-click jump |
| In-depth long reading | Fatigue from unknown remaining length | Bottom reading progress bar clearly showing 0%–100% |
| 50 FAQ questions | Heavy textual clutter | Accordions keeping questions clean and scannable |
| Mixed order list | Scanning pages for completed items | Status filter with live count chips |

## Machines

Pure algorithms live in DOM-free modules: `calculateProgressRatio`, `shouldShowBackToTop`, `searchScoreAndRank`, `canNavigateStep`.
