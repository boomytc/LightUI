import { CascadeMenu } from "./intent/CascadeMenu";
import { TriangleOverlay } from "./intent/TriangleOverlay";
import { useLockedCascade } from "./intent/useLockedCascade";
import { STAGE_IDS, stageFixture } from "./lib/stage-fixtures";
import { readStageQuery } from "./lib/stage-query";

const noop = () => {};

export function StageView() {
  const { kind } = readStageQuery("status", STAGE_IDS);
  const locked = useLockedCascade(stageFixture(kind));

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="relative">
        <div ref={locked.frameRef} className="relative">
          <div ref={locked.rootRef} className="inline-flex">
            <CascadeMenu
              levels={locked.levels}
              open
              path={locked.path}
              hoveredId={locked.hoveredId}
              selectedId={null}
              locale={locked.locale}
              onSelectLeaf={noop}
              onItemClick={noop}
              registerPanel={locked.registerPanel}
              registerItem={locked.registerItem}
            />
          </div>
          <TriangleOverlay
            containerRef={locked.frameRef}
            mouse={locked.mouse}
            bands={locked.bands}
            visible={locked.showTriangles}
            vertices={false}
          />
        </div>
      </div>
    </div>
  );
}
