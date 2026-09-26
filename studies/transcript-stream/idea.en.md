# Transcript Stream: Real-Time Multi-Speaker Speech Streaming and Meeting Minutes UX

Frontend interactions in live speech-to-text stenography and AI meeting tools are significantly more complex than standard unidirectional LLM chat completions.
In live meetings, participants interrupt, talk over each other (cross-talk/overlap), and alternate rapidly. Meanwhile, underlying ASR and Voiceprint Identification (VPR) operate across mismatched temporal windows, inherently requiring "first incremental text, then late-bound speaker resolution".

This study formalizes the **Three-Phase Meeting Lifecycle (Pre-meeting Roster → Live Dual-stream Stage → Post-meeting Minutes Workbench)** and an **event-driven streaming spacetime architecture**.

---

## 1. What breaks for the user if this idea is missing?

1. **Jitter and Full Redraw Tearing**:
   Naive frontends replace whole strings in the DOM on every chunk update, causing the viewport to jump wildly, destroying text selection and causing eye fatigue.
2. **Late-bound Speaker Resolution Split**:
   Streaming ASR produces initial tokens in ~300ms, but reliable voiceprint verification (192-dim Campplus embeddings) requires 1.5s to 3s of continuous clean speech. Without late-bound resolution, initial text either remains stuck as "Unknown / Speaker 0" forever or triggers a jarring full-session rerender once identified.
3. **Cross-talk Context Loss**:
   When multiple participants talk simultaneously, naive single-stream chat interleaves tokens haphazardly. Readers lose track of who interrupted whom and lose emotional context.
4. **Disconnection Between Live and Delivery Modes**:
   During the meeting, users need low-latency typewriter flow, mic visualizers, and RTF telemetry. After the meeting, they require speaker filtering, topics, resolutions, and interactive action items.

---

## 2. Core State Machine and Spatiotemporal Specifications

### (1) Streaming Meeting Event Protocol
A clean unidirectional event contract drives immutable UI transitions:
```ts
interface StreamingMeetingEvent {
  event_type: "new_turn" | "delta" | "tail_flush" | "status";
  timestamp_s: number;
  speaker_id: number;
  speaker_name: string;        // Initially "Speaker 0" or placeholder
  delta_text: string;          // Incremental text chunk
  is_overlap: boolean;         // Cross-talk collision flag
  overlap_speakers: number[];  // Overlapping speaker indices
  cumulative_text: string;     // Full cumulative text
  step_latency_ms: number;     // Step inference latency (e.g. 1.6ms)
  metadata?: {
    just_identified?: boolean; // Just matched voiceprint profile
    identified_name?: string;  // Bound participant real name
    similarity?: number;       // Cosine similarity score (e.g. 0.82)
  };
}
```

### (2) Three-Phase Lifecycle
- **Phase 1: Pre-meeting Voiceprint Drawer (`prep`)**
  - Manages enrolled attendee voiceprints: name, department, sample count, duration, and 192-dim vector summary.
  - Minimalist enrollment: 3-second mic capture with countdown, or drag-and-drop audio file, calculating cosine similarity thresholds.
- **Phase 2: Live Dual-stream Stage (`live`)**
  - **Dynamic Turn Binding**: Creates a new bubble on `new_turn` and assigns distinctive speaker color palettes (Teal, Emerald, Amber, Violet).
  - **Smooth Typewriter Append**: In-situ token append on `delta` with a soft blinking cursor and adaptive scroll lock.
  - **Late-bound Identity Glow**: When `just_identified: true` fires, headers transition gently from anonymous placeholders to real participant names without unmounting elements.
  - **Cross-talk Collision Badge**: Highlights overlapping segments with a warm breathing border pulse and a `⚡重叠` indicator.
  - **Acoustic Telemetry**: Real-time microphone audio visualizer, elapsed time, word count, RTF, and step latency.
- **Phase 3: Post-meeting Minutes Workbench (`summary`)**
  - **Left Pane (Chronological Transcript)**: Segmented speaker stream with physical timestamps, speaker filtering tabs, and quick search.
  - **Right Pane (Structured Minutes)**: Executive summary, topics, decisions, and interactive Action Item cards with owner avatars and completion toggles. Includes copy-markdown and HTML export.
