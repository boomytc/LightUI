import { useMemo } from "react";
import { SandboxStage, callErrorReason } from "./components/SandboxStage";
import { KIND_IDS, isKindId, lockedStep, validateCall } from "./lib/machines";
import { TEACHING_SOURCE } from "./lib/samples";
import { useLocale } from "./lib/site-locale";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const locale = useLocale();
  const { kind, state } = readStageQuery("stream", IDS);
  const phaseKind = isKindId(kind) ? kind : "stream";
  const step = lockedStep(TEACHING_SOURCE, phaseKind, state || "final");
  const scripted = useMemo(() => {
    const refused = validateCall("openLink", { url: "http://example.com/sandbox-bridge" });
    if (phaseKind !== "bridge" || refused.ok) return [];
    return [
      {
        id: -1,
        tone: "bad" as const,
        title: locale === "en" ? "openLink rejected" : "openLink 被拒绝",
        detail: callErrorReason(refused.code, refused.reason, locale),
      },
    ];
  }, [locale, phaseKind]);

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-4 py-8">
      <div data-stage="fixture" className="w-[720px] max-w-full">
        <SandboxStage step={step} interactive={false} scripted={scripted} locale={locale} />
      </div>
    </div>
  );
}
