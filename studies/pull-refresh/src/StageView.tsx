import { PullIndicator } from "./playground/PullIndicator";
import { readStageQuery } from "./lib/stage-query";
import { useLocale } from "./lib/site-locale";
import { cn, INITIAL_NEWS } from "./lib/utils";

export function StageView() {
  const locale = useLocale();
  const { state, pull } = readStageQuery();
  const atTop = state !== "idle";
  const ready = state === "ready";
  const refreshing = state === "refreshing";

  return (
    <div data-stage="root" className="flex min-h-[380px] w-full items-center justify-center bg-bg-warm p-8">
      <div data-stage="fixture" className="pull-phone w-full max-w-[320px] rounded-[32px] p-3">
        <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-fg/12" />
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="font-mono text-[10px] text-fg-subtle">9:41</span>
          <h3 className="text-[13px] font-semibold text-fg">
            {locale === "en" ? "Live Updates" : "资讯中心"}
          </h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              refreshing
                ? "bg-accent-soft text-accent"
                : ready
                  ? "bg-intent-soft text-intent"
                  : atTop
                    ? "bg-accent-soft text-accent"
                    : "bg-surface-2 text-fg-subtle",
            )}
          >
            {refreshing
              ? locale === "en"
                ? "Pinned"
                : "吸顶"
              : ready
                ? locale === "en"
                  ? "Ready"
                  : "达标"
                : locale === "en"
                  ? "Top edge"
                  : "顶边"}
          </span>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-border bg-surface-2">
          <div className="px-3 pt-2">
            <div
              className={cn(
                "pull-edge",
                refreshing ? "pull-edge-busy" : ready ? "pull-edge-ready" : "pull-edge-on",
              )}
            />
          </div>
          <div className="px-2 pb-2">
            <PullIndicator pullPx={pull} phase={state} locale={locale} />
            <div className="space-y-2 pt-1">
              {INITIAL_NEWS.slice(0, 2).map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-[12px] font-semibold text-fg">{item.title}</h4>
                    <span className="font-mono text-[10px] text-fg-subtle">{item.time}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-fg-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
