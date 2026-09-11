import { BrowserFrame } from "./components/browser-frame";
import { AccordionDemo } from "./components/demos/accordion";
import { AnchorNavDemo } from "./components/demos/anchor-nav";
import { BackToTopDemo } from "./components/demos/back-to-top";
import { ReadingProgressDemo } from "./components/demos/reading-progress";
import { SearchDemo } from "./components/demos/search";
import { StatusFilterDemo } from "./components/demos/status-filter";
import { StepperDemo } from "./components/demos/stepper";
import { PATTERNS, patternBySlug } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";

function renderDemo(kind: string) {
  switch (kind) {
    case "progress":
      return <ReadingProgressDemo />;
    case "back-to-top":
      return <BackToTopDemo />;
    case "accordion":
      return <AccordionDemo />;
    case "stepper":
      return <StepperDemo />;
    case "search":
      return <SearchDemo />;
    case "status-filter":
      return <StatusFilterDemo />;
    case "anchor":
    default:
      return <AnchorNavDemo />;
  }
}

export function StageView() {
  const { kind } = readStageQuery();
  const current = PATTERNS.some((item) => item.slug === kind)
    ? patternBySlug(kind)
    : patternBySlug("anchor");

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg p-6 sm:p-10">
      <div data-stage="fixture" className="w-full max-w-3xl">
        <BrowserFrame
          title={current.name.zh}
          eyebrow={`Stage · ${current.slug}`}
          badge={
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
              {current.eyebrow.zh}
            </span>
          }
        >
          {renderDemo(kind)}
        </BrowserFrame>
      </div>
    </div>
  );
}
