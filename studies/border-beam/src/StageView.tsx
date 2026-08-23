import { MembershipCard } from "./MembershipCard";
import { useLocale } from "./lib/site-locale";
import { readStageQuery } from "./lib/stage-query";
import { useReducedMotion } from "./lib/use-reduced-motion";

export function StageView() {
  const { kind, state } = readStageQuery();
  const locale = useLocale();
  const reduced = useReducedMotion();

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8">
      <div data-stage="fixture" className="w-[390px] max-w-full min-w-0 overflow-x-hidden">
        <MembershipCard kind={kind} state={state} reduced={reduced} locale={locale} />
      </div>
    </div>
  );
}
