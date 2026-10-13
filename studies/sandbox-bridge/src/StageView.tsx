import { SandboxStage } from "./components/SandboxStage";
import { KIND_IDS, isKindId, lockedStep, validateCall } from "./lib/machines";
import { TEACHING_SOURCE } from "./lib/samples";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("stream", IDS);
  const phaseKind = isKindId(kind) ? kind : "stream";
  const step = lockedStep(TEACHING_SOURCE, phaseKind, state || "final");
  const refused = validateCall("openLink", { url: "http://example.com/sandbox-bridge" });
  const scripted =
    phaseKind === "bridge" && !refused.ok
      ? [{ id: -1, tone: "bad" as const, title: "openLink 被拒绝", detail: refused.reason }]
      : [];

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-4 py-8">
      <div data-stage="fixture" className="w-[720px] max-w-full">
        <SandboxStage step={step} interactive={false} scripted={scripted} />
      </div>
    </div>
  );
}
