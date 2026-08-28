import { Check, FolderKanban, Download, Trash2, Share2 } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { cn, SAMPLE_FILES } from "./lib/utils";

export function StageView() {
  const { mode, count } = readStageQuery();
  const selectedList = SAMPLE_FILES.slice(0, count).map((f) => f.id);

  return (
    <div data-stage="root" className="flex min-h-[380px] w-full items-center justify-center p-8 bg-surface">
      <div data-stage="fixture" className="w-full max-w-[320px] rounded-[32px] border-4 border-fg/20 bg-surface p-4 shadow-2xl">
        <div className="flex items-center justify-between px-2 pt-1 pb-3">
          <span className="text-[12px] font-medium text-fg-muted">
            {mode === "selecting" ? "Cancel" : "Files"}
          </span>
          <h3 className="text-[14px] font-semibold text-fg">
            {mode === "selecting" ? `Selected (${selectedList.length})` : "Project Files"}
          </h3>
          <span className="w-6" />
        </div>

        <div className="space-y-2">
          {SAMPLE_FILES.slice(0, 3).map((file) => {
            const isSelected = selectedList.includes(file.id);

            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border p-3 select-none",
                  isSelected ? "bg-accent/5 border-accent/40" : "bg-surface",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-accent">
                  <FolderKanban className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-fg">{file.name}</p>
                  <p className="text-[10px] text-fg-muted">{file.size}</p>
                </div>

                {mode === "selecting" && (
                  <div
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full border",
                      isSelected
                        ? "border-accent bg-accent text-surface"
                        : "border-border bg-surface text-transparent",
                    )}
                  >
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {mode === "selecting" && (
          <div className="mt-4 flex items-center justify-around border-t border-border pt-3 text-[11px] text-fg-muted">
            <span className="flex items-center gap-1">
              <Download className="size-3.5" /> Download
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="size-3.5" /> Share
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <Trash2 className="size-3.5" /> Delete
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
