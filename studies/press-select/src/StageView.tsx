import { readStageQuery } from "./lib/stage-query";
import { SAMPLE_FILES } from "./lib/utils";
import { FilesPhone } from "./press/FilesPhone";

export function StageView() {
  const { mode, count } = readStageQuery();
  const files = SAMPLE_FILES.slice(0, 4);
  const selectedIds = mode === "selecting" ? files.slice(0, count).map((file) => file.id) : [];

  return (
    <div data-stage="root" className="flex min-h-[420px] w-full items-center justify-center bg-bg p-6 sm:p-10">
      <div data-stage="fixture" className="ps-stage rounded-[40px] p-5">
        <FilesPhone
          locale="zh"
          mode={mode}
          files={files}
          selectedIds={selectedIds}
          pressingId={null}
          pressProgress={0}
          openFileId={null}
          lastVerdict={mode === "selecting" ? "select" : null}
        />
      </div>
    </div>
  );
}
