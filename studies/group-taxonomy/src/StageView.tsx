import { DefaultCardsDemo } from "./components/demos/DefaultCardsDemo.js";
import { WhitespaceDemo } from "./components/demos/WhitespaceDemo.js";
import { FormSectionsDemo } from "./components/demos/FormSectionsDemo.js";
import { ActivityListDemo } from "./components/demos/ActivityListDemo.js";
import { ColorBandsDemo } from "./components/demos/ColorBandsDemo.js";
import { PriceCompareDemo } from "./components/demos/PriceCompareDemo.js";
import { readStageQuery } from "./lib/stage-query.js";

export function StageView() {
  const { kind, mode } = readStageQuery();

  function renderDemo() {
    switch (kind) {
      case "cards":
        return <DefaultCardsDemo mode={mode} />;
      case "whitespace":
        return <WhitespaceDemo mode={mode} />;
      case "form":
        return <FormSectionsDemo mode={mode} />;
      case "list":
        return <ActivityListDemo mode={mode} />;
      case "bands":
        return <ColorBandsDemo mode={mode} />;
      case "compare":
        return <PriceCompareDemo mode={mode} />;
      default:
        return <WhitespaceDemo mode={mode} />;
    }
  }

  return (
    <div
      data-stage="root"
      className="grid min-h-dvh place-items-center bg-bg p-4 sm:p-8"
    >
      <div
        data-stage="fixture"
        className="w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-card overflow-hidden"
      >
        {renderDemo()}
      </div>
    </div>
  );
}
