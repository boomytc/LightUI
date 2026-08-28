# Pull to Refresh

When does a downward pull take over scroll, and when does it commit a refresh? First decide: **top boundary damping and threshold commit**, or an **explicit refresh button**.

## Problem

“Pull to refresh” only describes the downward motion. What actually breaks is **takeover timing, damping mechanics, and spring-back sequence**:

- Pulling downward while scrolled halfway triggers an accidental refresh instead of rolling back up.
- Lacking physical damping results in a 1:1 rigid drag, devoid of elastic resistance feedback.
- Releasing after pulling merely 2px fires a network request, causing accidental queries.
- When loading completes without a status toast or timestamp, the header snaps shut jarringly without confirmation.
- Transplanting pull-to-refresh directly to desktop mouse environments feels clumsy and wastes layout space.

Treating these with naive drags or unconditional interceptors causes frequent misfires or rigid touch interactions.

## Rule

First check scroll state and gesture direction, then define the damping and release threshold.

| Phase | Trigger Condition | Visual & Physical Expression |
| --- | --- | --- |
| Normal Scroll | `scrollTop > 0` | Native container scrolling; gesture is not intercepted |
| Dampened Pull | `scrollTop === 0` & `dy > 0` | Intercept gesture; distance $y = \min(y_{\max}, dy \times 0.42)$; indicator rotates proportionally |
| Threshold Met | $y \ge \text{threshold}$ (56px) | Signal ready to release; indicator highlights |
| Commit Refresh | Pointer up beyond threshold | Spring-back and pin at 56px; indicator spins in loop; async fetch begins |
| Abort Snapback | Pointer up below threshold | Seamless elastic snapback to 0px without network request |
| Settle & Collapse | Data ready | Slide down update banner (e.g. "Fetched 3 new items"), delay briefly, then collapse to 0px |

Key distinctions:

- **Pull to refresh is not a scroll track.** A scroll track represents overall document position; pull-to-refresh is an overflow boundary gesture trigger.
- **Top pull to refresh is not bottom record append.** Pull-to-refresh targets the top boundary for fresh items; append targets the bottom to extend visible records.
- **Pull damping indicator is not a work progress bar.** The indicator visualizes pull tension and qualification; once released, it enters an active fetch state.

## Machine

Logic in DOM-free modules: `calculatePull(dy, damping, max)`, `shouldTakeoverScroll(scrollTop, dy)`, `isThresholdMet(pull, threshold)`, `pullProgress(pull, threshold)`.
