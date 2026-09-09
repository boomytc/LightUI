# Sheet Snap

Multi-snap bottom sheets are not binary modals. The real design requirement is **how direct pointer tracking with overdrag damping resolves into discrete snap points via velocity and displacement upon release**.

## Problem

"Add a bottom sheet" only states that a panel can slide up from below. What truly breaks is **reducing a multi-stage continuous gesture to binary toggles or rigid static-distance nearest snapping**:

- **Binary all-or-nothing**: Either covering the whole map or completely tucked away; users cannot keep a summary peek or half-screen route while scanning the map.
- **Static-distance nearest snapping (velocity-blind)**: Judging purely by $|H - H_{\text{snap}}|$ upon release. When users flick upward quickly, if the release occurs below the midpoint, the sheet snaps backwards to collapsed, creating an unresponsive, sluggish feel.
- **Hard clamped overdrag**: Clamping rigidly at min and max heights destroys natural physical resistance.
- **Gesture conflict**: Long content inside an expanded sheet easily conflicts with the sheet drag gesture.

## Rules

Define **discrete snap points**, **overdrag damping**, and **velocity-driven projection**.

| Snap | Height | Primary Role | Underlay Visibility |
| --- | --- | --- | --- |
| `peek` (Collapsed) | ~118px | Title, opening status, quick action | ~75% visible |
| `half` (Half-screen) | ~260px | Key attributes, tags, short summary | ~50% visible |
| `full` (Expanded) | ~460px | Detailed content, reviews, inner scrollable list | Focused on details |

State Machine:

1. **Direct Tracking & Overdrag Damping**:
   - Within bounds $[\text{minSnap}, \text{maxSnap}]$, 1:1 tracking: $H = H_{\text{start}} - \Delta y$.
   - Beyond bounds, apply damping factor $k_{\text{damping}} = 0.20$.
2. **Velocity-driven Projection**:
   - Sample vertical velocity $v_y$ prior to release ($\text{px/ms}$).
   - **Fast flick up ($v_y < -0.45$)**: Advance to next higher snap point (`peek` → `half`, `half` → `full`).
   - **Fast flick down ($v_y > 0.45$)**: Advance to next lower snap point (`full` → `half`, `half` → `peek`).
   - **Low-speed release ($|v_y| < 0.45$)**: Snap to closest point by distance.
3. **Scroll Handoff**:
   - Below `full`, inner scroll is locked; drag belongs entirely to sheet.
   - At `full`, inner scroll takes priority when $scrollTop > 0$; when $scrollTop \le 0$ and pulling down, hand off back to sheet collapse.

## Machines

Implemented in pure functions:
- `clampHeight(raw, min, max, damping)`
- `resolveSnapRelease(height, vy, snaps, threshold)`
- `computeVelocity(samples)`
- `canScrollContent(snap, isDragging)`
