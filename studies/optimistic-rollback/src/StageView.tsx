import { Bookmark, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { cn } from "./lib/utils";

export function StageView() {
  const { kind, state } = readStageQuery();
  const isSaved = state === "synced" || state === "syncing";
  const isError = state === "error";

  return (
    <div className="flex min-h-[360px] w-full items-center justify-center p-8 bg-surface">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-fg-muted">
              {kind === "delete" ? "Destructive" : "Optimistic"}
            </span>
            <h3 className="mt-2 text-[16px] font-semibold text-fg">
              {kind === "delete" ? "Production Database" : "Designing for Optimistic Perception"}
            </h3>
            <p className="mt-1 text-[12px] text-fg-muted">
              {isError
                ? "Network synchronization failed. Snapshot restored."
                : state === "syncing"
                  ? "UI mutated locally, syncing with remote server..."
                  : "State fully synced and committed."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium",
            isSaved
              ? "border-accent bg-accent/10 text-accent"
              : isError
                ? "border-border bg-surface text-fg-muted"
                : "border-border bg-surface text-fg",
          )}>
            <Bookmark className={cn("size-3.5", isSaved && "fill-current")} />
            <span>{isSaved ? "Saved" : isError ? "Reverted" : "Save"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {state === "syncing" && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <RefreshCw className="size-3 animate-spin" />
                syncing
              </span>
            )}
            {state === "synced" && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                synced
              </span>
            )}
            {state === "error" && (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <AlertTriangle className="size-3" />
                error (rolled back)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
