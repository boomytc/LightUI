# Group Taxonomy

"Building a component" only implies having content. What must be decided first is **the semantic relationship between these content blocks and the appropriate separation technique**.

## The Problem

The most pervasive aesthetic anti-pattern in AI-generated UI and novice design is **"Everything is a Card"**:
- One card for the title, one card for the metrics, and another card for the summary.
- Six form fields in registration turned into six individual bordered, rounded, shadowed white boxes.
- Every single activity log item in a feed wrapped in a bulky card shell.
- A 3-stage narrative ("Why / How / Result") sliced into three disjointed sticky notes.
- Pricing plans rendered as three isolated cards, breaking column comparisons.

This "safe shortcut" aggressively shatters continuous narrative into a **"sticky note wall"**. The user's eye is forced to hop constantly between competing rounded borders and dropshadows, breaking the reading flow and creating generic, cluttered pages.

## The Rules

**Cards should only wrap truly independent, physically separable entities (e.g. draggable task cards in Kanban, collectible bookmarks).**
For everything else, determine the semantic relationship first, then apply the right spatial technique:

| Technique | Relationship | Context | Core Rule & CSS Strategy |
| --- | --- | --- | --- |
| **00 Card Default** | Discrete Entity | Tasks, bookmarks | `border-radius: 16px` + `box-shadow`. Kept as the baseline counter-example; never abuse for sequential chunks |
| **01 Whitespace Sections** | Narrative Flow | Overviews, articles | Advance via vertical rhythm (`margin-top: 2.5rem`) + 1px subtle divider (`border-top`). **No background / radius / shadow** |
| **02 Form Sections** | Cohesive Task | Signup, settings | Group fields by cohesive task (Basic / Work info); use clean grid + bottom underline (`border-bottom`) without wrapping fields |
| **03 Activity Feed** | Sequential Events | Messages, audit logs | Single-column linear stream for one continuous downward eye scan; hover tint, no card wrappers per row |
| **04 Color Bands** | Shared Row Theme | Feature zones, CTAs | Full-width background color bands (`bg-band`) defining distinct macro regions; flat internal items |
| **05 Price Comparison** | Side-by-side Table | Plans, version tiers | Shared table base with vertical hairline column borders (`border-inline-start`); maintains table-wide row alignment |

## Comparison with "Everything is a Card"

| Scenario | Default to Cards (Sticky Note Wall) | Semantic Grouping |
| --- | --- | --- |
| **Product Narrative (Why / How / Result)** | 3 isolated boxes looking like disconnected features | Whitespace sections with fine hairlines, single natural reading axis |
| **User Registration Form (6 fields)** | 6 shadowed boxes scattering visual focus | Form grouped into 2 task sections, flat clean inputs |
| **Team Activity Stream (10 items)** | 10 large cards forcing ocular jumps across grid gaps | Single-column compact list, scanning straight down |
| **Feature Matrix (3 categories × 3 items)** | 9 square boxes cluttering the viewport | 3 full-width thematic color bands with clear hierarchy |
| **Pricing Comparison (3 tiers)** | 3 separated cards making horizontal feature comparison difficult | Shared surface + hairline column dividers, instant alignment |

## AI System Prompt Constraint

```text
When designing a page, evaluate semantic relationships before choosing grouping techniques.
Never default every module into rounded, bordered, shadowed cards.

Rules:
1. Sequential reading (intro, details, longform): Use whitespace and subtle dividers; avoid boxing every paragraph.
2. Form tasks (signup, profile, settings): Group fields by task sections; keep inputs flat without individual cards.
3. Continuous events (messages, logs, feeds): Use a single-column list for a smooth downward scan line.
4. Shared-theme feature zones: Use full-width color bands to define areas; keep internal items borderless.
5. Side-by-side comparisons (pricing, versions): Use vertical hairline dividers on a shared base to maintain table coherence.

Cards belong only to truly independent, draggable or collectible objects. Relationship is the grouping answer.
```

## Machine

Pure logic and evaluation live in `src/lib/machines.ts`:
- `PATTERNS`: 5+1 metadata, CSS rules, and system prompt constraints
- `isPatternId` / `nextPattern` / `prevPattern`: Keyboard navigation state machines
- `gradeQuizAnswer`: Interactive scenario quiz evaluation
