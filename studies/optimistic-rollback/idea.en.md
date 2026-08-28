# Optimistic Update

When an action is triggered, does the UI wait for network ACK or commit optimistically? First decide: **assume success and react immediately**, or **wait for server confirmation**.

## Problem

“Like, bookmark, follow” only states that an action exists. What actually breaks is **feedback timing and failure handling**:

- Clicking favorite locks the button with a spinner for 800ms while waiting for HTTP response, creating sluggish interaction.
- The UI changes instantly, but remains active even after network failure, giving the user a false impression of success.
- Rapid multi-clicks return out of order, causing flicker and settling on the wrong state.
- Irreversible actions like payment or account deletion are built optimistically, causing severe real-world discrepancies upon failure.
- When an error occurs without a snapshot rollback, a floating toast leaves the user confused about the actual persisted state.

Handling all these with a single “always wait” or “fake it without rollback” leads to either sluggishness or deception.

## Rule

First ask if the action is **reversible low-risk** or **irreversible high-risk**, then select the response mode.

| Action Type | Response Mode | Failure Handling | Typical Scene |
| --- | --- | --- | --- |
| Reversible Low-risk | Optimistic (`optimistic`) | Roll back in place from `snapshot` + semantic toast | Like, favorite, follow, star, toggle |
| Irreversible High-risk | Pessimistic (`pessimistic`) | Lock trigger, show spinner, commit on success | Payment, deletion, password change, permission transfer |

State machine flow:

1. **Trigger (`trigger`)**: Capture `snapshot` of previous state, increment sequential token, immediately switch UI value, transition phase to `syncing`;
2. **Background Sync (`async request`)**: If token is outdated (superseded by a later click), drop stale response;
3. **Sync Success (`synced`)**: Transition from `syncing` to `synced`, then settle to `idle`;
4. **Sync Failure (`rollback`)**: If token remains active, restore from `snapshot`, mark `error`, and show descriptive toast.

Key distinctions:

- **Optimistic update is not a skeleton placeholder.** A skeleton holds space before data arrives; optimistic update is instant feedback to user action.
- **Optimistic update is not a progress bar.** Progress is for long tasks; low-risk toggles must react immediately without waiting.
- **Optimistic state is not a notification toast.** A toast reports a completed event; optimistic state is a bidirectional state machine with rollback snapshot.
- **Optimistic trigger is not button weight.** Weight defines visual prominence; optimism defines network synchronization semantics.

## Machine

Logic in DOM-free modules: `isOptimisticAllowed(kind)`, `createOptimisticState(current, next, token)`, `rollbackOptimisticState(snapshot, token, latestToken)`, `commitOptimisticState(token, latestToken)`.
