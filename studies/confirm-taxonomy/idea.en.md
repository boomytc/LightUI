# Confirmation Ladder

Secondary confirmations for destructive actions should not be a one-size-fits-all modal. Interruption weight and cognitive friction must **strictly scale with irreversibility and scope of consequence**.

## Problem

"Always pop a modal before any dangerous action" is a ubiquitous anti-pattern. What breaks is the **mismatch between confirmation friction and destructive severity**:

- Reversible actions (archiving, email sending, soft trash) interrupt the user with blocking modals, causing "modal fatigue" where users habitually dismiss prompts without reading.
- Mobile destructive buttons exposed permanently in list items trigger frequent accidental clicks.
- Catastrophic irreversible actions (dropping production databases, wiping team spaces) protected only by a naive modal are confirmed by reflex.
- Vague prompt copy ("Are you sure?", "Do you want to proceed?") hides what specific resources will be permanently erased.

Using the same centered dialog for everything from "undo email" to "destroy database" slows down benign workflows while failing to prevent catastrophic accidents.

## Rules

Match the confirmation mechanism to the severity and irreversibility of the consequence:

| Risk Level | Safeguard Model | Interruption Weight | Core Interaction Rule |
| --- | --- | --- | --- |
| **01. Reversible** | Undo Toast | **Zero interrupt · Post-action** | Optimistic execution; 5s top undo toast with explicit target; commit only after timeout |
| **02. Accidental Click** | Hold to Confirm | **Mild interrupt · 2 seconds** | Pointer capture + rAF live progress; resets to zero on release/cancel; block context menus |
| **03. List Accidental Tap** | Swipe to Reveal | **Spatial isolation · Two-step** | Hide danger triggers beneath content; drag past threshold to reveal, tap again to delete |
| **04. Local Medium Risk** | Popconfirm | **Local interrupt** | Anchored directly to trigger; no full-screen scrim; clear entity name; closes on outside click |
| **05. Severe Decision** | Modal Confirm | **Global interrupt** | Strong backdrop blocking page; Esc / Cancel exit; focus traps on Cancel; danger accent |
| **06. Irreversible Destruction** | Type to Confirm | **Cognitive friction** | Fully enumerate dependencies; require exact case-sensitive string matching (e.g. `DELETE`) |
| **07. Highest Risk / Termination** | Checklist Review | **Dedicated full panel** | Enumerate impact scale; require checking off all individual consequences before unlock |

Key distinctions:

- **Destructive confirmation ladder is not overlay geometry.** Overlay taxonomy explores positioning and task blocking; the confirmation ladder explores scaling friction against risk.
- **Confirmation safeguards are not button visual hierarchy.** Button weights guide visual attention; confirmation safeguards prevent accidental devastation.
- **Post-action undo windows are not network rollback.** Undo windows provide user remorse periods; network rollback is automated error recovery.
- **Hold-to-confirm is not long-press multi-select.** Hold-to-confirm uses continuous duration as a barrier; long-press selection toggles list inspection mode.

## Naive Modals vs Confirmation Ladder

| Scenario | One-Size-Fits-All Modal | Risk-Matched Safeguard |
| --- | --- | --- |
| Send email / proposal | Modal interrupts flow; irreversible once sent | Instant send + top 5s Undo Toast |
| Voice memo deletion | Accidental click easily confirms | 2s hold with progress fill, cancel on release |
| Task list item delete | Red button in every row | Swipe/drag to reveal danger button |
| Production DB drop | Habitual Enter key confirms | Require typing `DELETE` + show 12M row impact |
| Team workspace deletion | Tiny modal hides critical losses | Dedicated checklist page requiring 100% check-off |

## Machines

Pure algorithms stay isolated in DOM-free modules: `calculateHoldProgress`, `resolveSwipeOffset`, `isTypeMatchValid`, `areAllChecklistItemsSelected`.
