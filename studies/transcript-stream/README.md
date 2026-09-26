# @lightui/transcript-stream

Real-time multi-speaker speech streaming stenography, late-bound voiceprint identification, cross-talk collision, and post-meeting minutes workbench.

## Three-Phase Lifecycle

1. **Pre-meeting Voiceprint Drawer (`prep`)**: Roster cards, 192-dim CAMPPlus embeddings, 3s voice recording, drag-and-drop audio enrollment.
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

## Bridging to LightASR (`products/meeting_minutes`)

This study provides the exact reference frontend architecture for LightASR.
Events emitted by `realtime_pipeline.py` via `StreamingMeetingEvent.to_dict()` are consumed directly by `src/lib/machines.ts` without intermediate adapters.

The study supports both:
- **Simulated stream playback** (with speed controls, step-by-step stepping, and manual overlap injection)
- **Live WebSocket streaming** (`ws://127.0.0.1:8765/ws`) connected directly to LightASR.
