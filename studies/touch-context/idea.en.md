# Touch Context Menu

On touch targets, how should gestures disambiguate hold duration from movement drift, and anchor context actions with boundary avoidance? First determine **the in-place hold time threshold, drift cancellation mechanics, and anchored popover placement with viewport flip avoidance**.

## The Problem

"Hold to open menu" states only the outcome. What breaks in touch interfaces is timing/drift ambiguity and misaligned placement:

- **Zero drift tolerance**: Requiring absolute stillness causes minor physiological finger tremors (2–4px) to cancel the hold, generating user frustration;
- **Missing drift cancellation creates ghost menus**: When users flick down a chat stream, uncancelled hold timers fire midway through the scroll, spawning unwanted popup menus;
- **Full-screen modal blocking**: Long-pressing a chat bubble pops an aggressive centered dialog, covering surrounding messages and breaking reading context;
- **Menu clipping off-screen**: Anchoring mechanically downward cuts off the bottom options when pressing messages near the display edge.

## The Rule

Touch context menus follow the **micro-press feedback + 460ms hold threshold + 10px Euclidean drift cancellation + anchored boundary flip** model.

| Phase | Physical & Geometric Rule | Benefit & Behavior |
| --- | --- | --- |
| **Micro-Press Feedback** | Immediate `scale(0.98)` indentation on `pointerdown` | Provides reassuring physical feedback that hold charging is underway |
| **460ms Time Threshold** | Starts a 460ms precision timer and progress interpolation | Quick taps (< 250ms) remain standard activations; holds trigger menu |
| **10px Euclidean Drift Cancel** | If $\sqrt{\Delta x^2 + \Delta y^2} > 10\text{px}$, immediately cancel timer | Tolerates gentle tremors; yields instantly to native vertical scrolling |
| **Viewport Clamping & Flipping** | Clamps horizontally within container margins; flips vertically above target if bottom overflows | 100% visible and reachable without clipping |
| **Light Scrim Dismiss** | Mounts a transparent backdrop; any outside tap dismisses instantly | Ephemeral, low-friction lifecycle |

Key contrasts:

- **Touch context menu is not press-to-select.** Context menus surface single-item actions (copy/reply/forward) without changing view modes; press-to-select (`press-select`) turns the entire list into a batch management state.
- **Touch context menu is not a desktop popover.** Desktop popovers (`overlay-taxonomy`) are clicked via precise mice on static buttons; touch context menus are invoked by fingers over scrollable feeds with drift disambiguation.
- **Touch context menu is not hold-to-confirm.** Hold-to-confirm (`confirm-taxonomy`) uses a 2-second hold to safeguard destructive operations; context menus are transient shortcuts.

Interaction formula:
1. **Name** — Touch Context Menu
2. **Gesture** — In-place hold on bubble ~460ms
3. **Result** — Anchored single-item action menu with edge flip avoidance

## Versus Naive Alternatives

| | Centered Modal Dialog | Zero-Disambiguation Hold | 460ms Disambiguated Menu |
| --- | --- | --- | --- |
| Interruption | Heavy; blocks conversation | Ghost menus interrupt feed | **Lightweight, conversation remains readable** |
| Scroll Coexistence | Hijacks vertical scroll | Spawns menus during flick | **10px drift cancels timer instantly** |
| Positioning | Fixed screen center | Clips at bottom edges | **Anchored to touch point; flips at edges** |
| Dismiss Cost | Must hunt cancel button | Taps outside | **Light scrim dismisses on any outside tap** |

## The Machines

Algorithms live in pure, DOM-free modules: `shouldCancelHold`, `calcClampedMenuPosition`, and `calcHoldProgress`.
