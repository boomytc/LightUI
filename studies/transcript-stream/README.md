# @lightui/transcript-stream

Real-time multi-speaker speech streaming stenography, late-bound voiceprint identification, cross-talk collision, and post-meeting minutes workbench.

## Three-Phase Lifecycle

1. **Pre-meeting Voiceprint Drawer (`prep`)**: Roster cards, 192-dim voiceprint embeddings, 3s voice recording, drag-and-drop audio enrollment.
2. **Live Meeting Dual-Stream Stage (`live`)**: Smooth incremental typewriter, late-bound speaker name resolution glow, cross-talk collision (`⚡重叠`) badge, acoustic visualizer, and end-meeting trigger.
3. **Post-meeting Minutes Workbench (`summary`)**: Split-screen with chronological transcript (filtered by speaker name or keyword) and high-fidelity Markdown minutes with editable cards, checkbox action items, and one-click export (Markdown, styled HTML, and PDF).

## Commands

```bash
# Standalone dev
npm run dev -w @lightui/transcript-stream

# Typecheck
npm run typecheck -w @lightui/transcript-stream

# Tests
npm run test -w @lightui/transcript-stream
```

Binds to `http://127.0.0.1:5232`.
Stage fixture: `http://127.0.0.1:5232/?stage=1`

## Reference Architecture & Interactive Scenarios

This study is a self-contained UI/UX reference implementation and interactive playground:
- **Standard Protocol Contract**: Consumes `StreamingMeetingEvent` directly through the pure state reducer `src/lib/machines.ts`.
- **Zero Backend Coupling**: Runs 100% in-browser without external service processes, server daemons, or network dependencies.
- **Rich Interactive Scenarios**: Includes full meeting lifecycle flow, intense cross-talk collision testing, and late-bound speaker resolution scenarios with step-by-step event stepping, playback speed controls, and manual overlap injection.
