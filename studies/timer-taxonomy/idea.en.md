# Timer

Does this session count up, or count down? Name the **direction of the session** before drawing a number.

## The problem

“Make a timer” describes the look: a number that moves. What actually breaks is **the wrong direction**:

- Count-up is drawn as a fake pomodoro with a cap, pretending to finish at 25
- Count-down is drawn as a number that only grows, so remaining time is invisible
- Focus runs past the cap and becomes negative
- Switching pages while it is running hides the session in the chrome, so it looks stopped
- A spinner replaces the number — indeterminate progress pretending to be a session
- Hitting zero fires a toast, and the timer itself does not stop
- Today’s goal percent is painted onto this session

One moving number for all of these either lies about elapsed time, or lies about how soon it will end.

## The rule

Ask whether this session **counts up from 0**, or **counts down from N minutes**. Then pick a leaf.

| Leaf | When | Machine |
| --- | --- | --- |
| Stopwatch | No session cap; the number is how long has passed | `displaySeconds` = `liveSeconds`; pause keeps accumulated; end zeros it; `sessionProgress` is null |
| Focus | Counts down from N minutes; the number is how long is left | `displaySeconds` = remaining; when elapsed hits the cap it must stop at 0 (pause), never negative; progress is this session’s elapsed/cap, not today’s goal |

Both leaves share:

`liveSeconds(t, now) = accumulated + (running ? now − startedAt : 0)`

`now` and `startedAt` are unix seconds.

While it is running, switching to another fake page **must still expose this session in the top bar** (one time chip). That is a rule, not a third leaf.

Do not replace the number with an indeterminate spinner.

Products often use 25 minutes; the playground uses 1 minute so completion is visible. The stage locks elapsed and does not follow the wall clock.

The pairs people mix up:

- **Timing is not “can this progress be measured.”** Progress asks whether work has a percent. Timing asks which way this session runs.
- **Hitting zero is not a toast.** When focus reaches 0, the timer stops itself in a done state.
- **Count-up is not focus.** Growing a countdown, or capping a stopwatch as a fake pomodoro, both break.

To specify one session clock, say three things:

1. **Name** — not “a timer”: stopwatch, or focus
2. **Scene** — this stretch counts up, or it counts down from N minutes
3. **Rules** — the live formula; pause keeps elapsed; focus stops at 0; the chrome still shows it while running

Those three, in one sentence, are the “Say it this way” card.

## Versus always one moving number

| | Always count-up or a fake tomato | Split by direction |
| --- | --- | --- |
| Free study | A 25-minute cap that pretends to finish | From 0 up, no session cap |
| A focus block | The number only grows | From N down; remaining time |
| Hitting the cap | A toast; the number goes negative | Stop at 0, done |
| Switching to Plan | Chrome hides the session | One time chip still shows it |
| Work percent | Today’s goal painted as this session’s ring | Stopwatch has no session percent; the focus ring is elapsed/cap |

## The machines

The calls live in DOM-free modules: `liveSeconds`, `focusCapSeconds`, `remainingSeconds`, `displaySeconds`, `sessionProgress`, `shouldStopFocus`, `pause` / `start` / `end`, `formatDuration`. The stage uses `stageSnapshot(kind, state)` to lock `{ elapsed, running }` so stills do not follow the wall clock.
