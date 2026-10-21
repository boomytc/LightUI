# event-timeline

Read root AGENTS.md. A date sequence is not task progress.

- Reveal state and stale-run guards live in src/lib/machines.ts. Timers stay in StudyView.
- Keep event dates and identities stable during playback. Latest is not the playback cursor.
- Stage: kind=history, state=start|mid|all. Locked nodes, no timers or controls.
- Relative imports and design tokens only. Dev: 127.0.0.1:5236.
- npm test, npm run typecheck, npm run build.
