import { RefreshCw, Sparkles } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { INITIAL_NEWS } from "./lib/utils";

export function StageView() {
  const { state, pull } = readStageQuery();
  const isRefreshing = state === "refreshing";
  const isReady = state === "ready";

  return (
    <div className="flex min-h-[380px] w-full items-center justify-center p-8 bg-surface">
      <div className="w-full max-w-[320px] rounded-[32px] border-4 border-fg/20 bg-surface p-4 shadow-2xl">
        <div className="flex items-center justify-between px-2 pt-1 pb-3">
          <span className="text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
            Live Feed
          </span>
          <h3 className="text-[14px] font-semibold text-fg">Latest Updates</h3>
          <span className="w-6" />
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-muted/30 p-2">
          {/* Pull Header stage snapshot */}
          <div
            className="flex items-center justify-center overflow-hidden transition-[height] duration-75 text-[12px] text-fg-muted"
            style={{ height: `${pull}px` }}
          >
            {isRefreshing ? (
              <div className="flex items-center gap-1.5 text-accent font-medium">
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Refreshing...</span>
              </div>
            ) : isReady ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Sparkles className="size-3.5" />
                <span>Release to Refresh</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <RefreshCw className="size-3.5" />
                <span>Pull down</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {INITIAL_NEWS.slice(0, 2).map((item) => (
              <article key={item.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[12px] font-semibold text-fg">{item.title}</h4>
                  <span className="text-[10px] font-mono text-fg-subtle">{item.time}</span>
                </div>
                <p className="mt-1 text-[11px] text-fg-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
