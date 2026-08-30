import { HoldDemo } from "./components/demos/hold-demo";
import { ModalDemo } from "./components/demos/modal-demo";
import { PopconfirmDemo } from "./components/demos/popconfirm-demo";
import { SelectDemo } from "./components/demos/select-demo";
import { SwipeDemo } from "./components/demos/swipe-demo";
import { TypeDemo } from "./components/demos/type-demo";
import { UndoDemo } from "./components/demos/undo-demo";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { kind } = readStageQuery();

  function renderDemo() {
    switch (kind) {
      case "undo":
        return <UndoDemo />;
      case "hold":
        return <HoldDemo />;
      case "swipe":
        return <SwipeDemo />;
      case "pop":
        return <PopconfirmDemo />;
      case "type":
        return <TypeDemo />;
      case "select":
        return <SelectDemo />;
      case "modal":
      default:
        return <ModalDemo />;
    }
  }

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg p-6 sm:p-10">
      <div data-stage="fixture" className="w-full max-w-2xl">
        {renderDemo()}
      </div>
    </div>
  );
}
