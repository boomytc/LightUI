import { Playground } from "./intent/Playground";

export function StageView() {
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full max-w-3xl">
        <Playground enabled showTriangles restDelay={280} bare />
      </div>
    </div>
  );
}
