# Slide to Confirm

For critical irreversible actions, how should continuous physical displacement eliminate confirmation fatigue misclicks? Define **directional travel damping, release spring rollback, and a single-threshold commitment gate**.

## Problem

"Slide to confirm" only describes visual form. What actually breaks is **downgrading catastrophic operations into trivial clicks, causing modal fatigue and fatal accidental triggers**:

- **Modal Dialog Fatigue**: Faced with "Wipe Production Database", "Terminate Cloud Cluster", or "Large Sum Wire Transfer", modals pop up so frequently that users develop automated muscle memory—blindly pressing Enter or double-clicking the blue primary button without reading warnings;
- **Accidental Sustained Hold**: Simple long-press (hold) introduces temporal friction, but accidental sustained pressure in a pocket or bag can easily charge a 2-3 second timer;
- **No Damping or Rollback**: If a slider lacks physical damping and spring reset upon release, an interrupted slide leaves the state hanging in mid-air—neither committed nor dismissed;
- **Vague Thresholds**: Without a strict directional displacement threshold (e.g. 85% of track length), loose wobbles trigger the action, defeating physical commitment.

Using simple buttons or undamped sliders for irreversible operations either causes unintentional destruction or indefinite hanging states.

## Rules

Slide to confirm follows a **directional track travel + rubber-band damping + 85% critical threshold + release spring reset** model.

| Phase | Physical & Geometric Rules | UX & System Behavior |
| --- | --- | --- |
| **Idle** | Thumb sits at origin; prompt text displays a subtle shimmer sweep | Clearly indicates slide direction and flags high-stakes danger |
| **Dragging** | Thumb offset tracks pointer 1:1; beyond travel $L$ exponential resistance applies; reverse drag is similarly damped | Ensures users feel genuine mechanical resistance, preventing loose slips |
| **Text & Visual Evolution** | Track prompt rapidly fades ($\max(0, 1 - r \times 1.5)$); track fill extends with progress, turning active accent past 85% | Progressively reveals commitment; user visually sees when entering the point of no return |
| **Resetting** | If released with $r < 0.85$, state transitions to `resetting`, smoothly springing back (300ms) to origin | Allows remorse at any moment before the threshold without side effects |
| **Committed** | If released or moved past $r \ge 0.85$, thumb snaps to right edge, triggers haptic feedback, and executes action | Requires sustained, intentional, directional effort across substantial travel to commit |

Key distinctions:

- **Slide confirm is not list swipe.** List swipe (`swipe-action`) uses 8px vector disambiguation to reveal quick actions on a list row; slide-confirm is a standalone high-consequence gate with a single threshold.
- **Slide confirm is not confirmation ladder.** Confirmation taxonomy (`confirm-taxonomy`) spans tooltips, two-step clicks, and dialogs; slide confirm is physical displacement commitment at the pinnacle of destructive gates.
- **Slide confirm is not drag commit.** Drag commit (`drag-commit`) focuses on spatial drop zones and list reordering; slide confirm is scalar displacement along a 1D track.

Formula:
1. **Name** — Slide to Confirm
2. **Gesture** — Slide thumb across track past 85% critical threshold
3. **Outcome** — Past threshold locks and commits; release before threshold springs back safely

## Difference from Modals and Simple Hold

| | Modal Confirmation | Simple Hold | Continuous Slide Confirm |
| --- | --- | --- | --- |
| Misclick Immunity | Very low; prone to muscle-memory Enter clicks | Medium; accidental pressure can still charge timer | **Extremely high; requires sustained directional vector travel** |
| Cognitive Friction | Disruptive dialog, easily dismissed | Passive waiting; poor sense of time passing | **Engaging physical feedback; real-time visual progress** |
| Cancel Mechanism | Click "Cancel" button | Release finger | **Instant spring rollback on release with clear damping** |
| Target Scenario | Low/medium destructive actions (trash bin) | Medium actions (password reset) | **Irreversible catastrophic actions (destroy cluster, wipe data)** |

## Machine

The state machine lives in a pure algorithm module without DOM: `calcMaxTravel` (track travel distance), `calcDampedOffset` (rubber-band damped travel), `calcSlideProgress` (normalized 0-1 progress), `calcTextOpacity` (linear fade-out), and `isThresholdReached` (85% gate adjudication).
