import { KIND_IDS, isKindId, stageSnapshot } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { LiveStage } from "./components/LiveStage";
import { VoiceprintDrawer } from "./components/VoiceprintDrawer";
import { MinutesBoard } from "./components/MinutesBoard";
import { FINAL_MINUTES } from "./lib/mock-data";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("live", IDS);
  const phase = isKindId(kind) ? kind : "live";
  const snapshot = stageSnapshot(phase, state);

  return (
    <div
      data-stage="root"
      className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-8 sm:px-8"
    >
      <div
        data-stage="fixture"
        className="w-[960px] max-w-full min-w-0 overflow-x-hidden rounded-2xl"
      >
        {phase === "prep" && (
          <VoiceprintDrawer
            speakers={snapshot.speakers}
            onAddSpeaker={() => {}}
            isOpen={snapshot.drawerOpen}
            onOpen={() => {}}
            onClose={() => {}}
            onStartMeeting={() => {}}
          />
        )}

        {phase === "live" && (
          <LiveStage
            turns={snapshot.turns}
            telemetry={{
              elapsed_s: 18.2,
              totalChars: 168,
              rtf: 0.024,
              avgLatencyMs: 1.6,
              overlapCount: snapshot.hasOverlapLocked ? 1 : 0,
              speakerStats: {
                0: { chars: 62, turns: 1, duration_s: 6.8 },
                1: { chars: 56, turns: 1, duration_s: 5.3 },
                2: { chars: 50, turns: 1, duration_s: 5.2 },
              },
            }}
            isPlaying={false}
            onTogglePlay={() => {}}
            onStep={() => {}}
            onReset={() => {}}
            onInjectOverlap={() => {}}
            onEndMeeting={() => {}}
            speed={1}
            onChangeSpeed={() => {}}
            autoScroll={true}
            onToggleAutoScroll={() => {}}
          />
        )}

        {phase === "summary" && (
          <MinutesBoard
            turns={snapshot.turns}
            minutes={FINAL_MINUTES}
            onReturnToLive={() => {}}
            onResetToPrep={() => {}}
          />
        )}
      </div>
    </div>
  );
}
