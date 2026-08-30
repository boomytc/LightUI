import { BrowserFrame } from "./components/browser-frame";
import { AccordionDemo } from "./components/demos/accordion";
import { AnchorNavDemo } from "./components/demos/anchor-nav";
import { BackToTopDemo } from "./components/demos/back-to-top";
import { ReadingProgressDemo } from "./components/demos/reading-progress";
import { SearchDemo } from "./components/demos/search";
import { StatusFilterDemo } from "./components/demos/status-filter";
import { StepperDemo } from "./components/demos/stepper";
import { PATTERNS } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { kind } = readStageQuery();
  const current = PATTERNS.find((p) => p.slug === kind) ?? PATTERNS[2]; // default to anchor

  function renderDemo() {
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

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg p-6 sm:p-10">
      <div data-stage="fixture" className="w-full max-w-3xl">
        <BrowserFrame
          title={current.name.zh}
          eyebrow={`Stage Fixture · ${current.slug}`}
          badge={
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
              {current.eyebrow.zh}
            </span>
          }
        >
          {renderDemo()}
        </BrowserFrame>
      </div>
    </div>
  );
}
