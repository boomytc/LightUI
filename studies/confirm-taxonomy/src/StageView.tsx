import { KindDemo } from "./confirm/Playground";
import { type ConfirmSlug } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";

const KINDS: ConfirmSlug[] = ["undo", "hold", "swipe", "pop", "modal", "type", "select"];

function asKind(value: string): ConfirmSlug {
  return KINDS.includes(value as ConfirmSlug) ? (value as ConfirmSlug) : "modal";
}

export function StageView() {
  const { kind } = readStageQuery();

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg p-6 sm:p-10">
      <div data-stage="fixture" className="w-full max-w-2xl">
        <KindDemo slug={asKind(kind)} />
      </div>
    </div>
  );
}
