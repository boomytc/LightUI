import { DEFAULT_SNAP_HEIGHTS } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { PhoneSheet } from "./PhoneSheet";

export function StageView() {
  const { snap } = readStageQuery();
  const currentHeight = DEFAULT_SNAP_HEIGHTS[snap];

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture">
        <PhoneSheet
          height={currentHeight}
          snap={snap}
          innerScrollAllowed={snap === "full"}
          badge={`${snap} · ${currentHeight}px`}
          sheetAttr="sheet"
        />
      </div>
    </div>
  );
}
