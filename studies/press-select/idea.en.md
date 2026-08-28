# Press to Select

Is this press in a list an immediate open or activating multi-selection? First decide: **tap opens, long-press activates selection mode**, or **permanent checkboxes**.

## Problem

“Multi-select” only specifies that multiple items can be chosen. What actually breaks is **gesture ambiguity and cramped screen width in touch environments**:

- Permanent checkboxes on narrow mobile screens consume valuable horizontal space and cause frequent misclicks.
- Tap, long-press, and scroll gesture collide: scrolling triggers accidental selection, or finger trembling cancels a legitimate hold.
- Entering selection mode without clear cancellation or batch action docks traps the user in selection state.
- Lacking strict time delays and spatial drift thresholds results in sluggish or unstable gesture detection.

Treating these scenarios with permanent checkboxes or naive holds causes layout bloat or gesture conflicts.

## Rule

First distinguish between **desktop mouse/keyboard** and **mobile touch screen**, then pick the selection paradigm.

| Platform & Mode | Default Behavior | Multi-select Activation | Space Efficiency |
| --- | --- | --- | --- |
| Desktop (Permanent) | Hover/Click inspect | Checkboxes resident + `Shift` range | Ample width, pointer precision |
| Mobile (Modal on-demand) | Tap opens detail | Hold ~480ms activates selection mode; drift cancels | Full width for content; checkboxes appear dynamically |

Disambiguation State Machine:

1. **Pointer Down (`pointerdown`)**: Record origin $(x_0, y_0)$, apply subtle shrink feedback (`scale(0.98)`), start 480ms timer;
2. **Pointer Move (`pointermove`)**: Compute drift squared $\Delta x^2 + \Delta y^2$. If exceeding tolerance (`64px`, i.e. 8px radius), classify as **list scroll**, immediately cancel timer and yield to native scroll;
3. **Hold Qualified (`hold timeout`)**: Timer fires, enter `selecting` mode, auto-check targeted item, reveal checkboxes and floating bottom action bar;
4. **Pointer Up (`pointerup`)**: If released before 480ms without drift, classify as **regular tap** to open item; if already in `selecting` mode, toggle checkbox.

Key distinctions:

- **Long-press modal state is not permanent checkboxes.** Permanent checkboxes belong to desktop environments; mobile long-press isolates low-frequency batch operations in a dedicated mode.
- **Long-press activation is not a drag commit.** Dragging alters position; long-press transforms the operating paradigm through elapsed time at a stationary point.
- **Multi-selection is not list paging.** Paging changes visible records; selection changes the target set of operations.

## Machine

Logic in DOM-free modules: `gestureVerdict(heldMs, driftSq)`, `shouldCancelHold(dx, dy)`, `toggleSelection(list, id)`, `selectAll(allIds)`.
