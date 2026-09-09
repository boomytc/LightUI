import { Coffee, MapPin, Navigation, Phone, Share2, Star } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { DEFAULT_SNAP_HEIGHTS } from "./lib/machines";
import { PLACE_DATA } from "./lib/kinds";

export function StageView() {
  const { snap } = readStageQuery();
  const currentHeight = DEFAULT_SNAP_HEIGHTS[snap];

  return (
    <div
      data-stage="root"
      className="flex min-h-dvh items-center justify-center bg-bg p-4 sm:p-8"
    >
      <div
        data-stage="fixture"
        className="relative flex h-[580px] w-full max-w-[340px] flex-col overflow-hidden rounded-[36px] border border-border bg-surface shadow-2xl"
      >
        {/* Phone Speaker Notch */}
        <div className="absolute top-3 left-1/2 z-30 h-4 w-28 -translate-x-1/2 rounded-full bg-border/40" />

        {/* Map Underlay Art */}
        <div className="relative flex-1 bg-surface-2 overflow-hidden select-none">
          {/* River */}
          <div className="absolute -top-10 left-1/4 h-[700px] w-16 -rotate-12 bg-accent/15 blur-[1px]" />
          {/* Roads */}
          <div className="absolute top-[28%] left-0 h-4 w-full bg-border/60" />
          <div className="absolute top-[52%] left-0 h-3 w-full bg-border/40" />
          <div className="absolute top-0 left-[28%] h-full w-4 bg-border/60" />
          <div className="absolute top-0 left-[68%] h-full w-3 bg-border/40" />
          {/* City blocks */}
          <div className="absolute top-[12%] left-[8%] h-14 w-20 rounded-lg bg-surface border border-border/40" />
          <div className="absolute top-[36%] left-[74%] h-16 w-16 rounded-lg bg-surface border border-border/40" />
          <div className="absolute top-[64%] left-[10%] h-12 w-20 rounded-lg bg-surface border border-border/40" />

          {/* Location Pin */}
          <div className="absolute top-[34%] left-[44%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-lg ring-4 ring-accent/20">
              <MapPin className="size-5" />
            </div>
            <span className="mt-1 rounded-md bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-fg shadow-sm border border-border/50">
              {PLACE_DATA.name.split(" · ")[0]}
            </span>
          </div>

          {/* Search bar mock */}
          <div className="absolute top-9 left-4 right-4 z-10 flex h-9 items-center justify-between rounded-full border border-border bg-surface/95 px-3 shadow-sm backdrop-blur-sm">
            <span className="text-xs text-fg-muted">搜索周边美食、咖啡...</span>
            <div className="size-5 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[10px]">
              🔍
            </div>
          </div>
        </div>

        {/* Bottom Sheet locked at snap height */}
        <div
          data-sheet-stage="sheet"
          className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-[28px] border-t border-border bg-surface shadow-2xl"
          style={{ height: currentHeight }}
        >
          {/* Drag Handle */}
          <div className="flex h-6 w-full items-center justify-center pt-2">
            <div className="h-1 w-10 rounded-full bg-fg-subtle/40" />
          </div>

          {/* Header Summary Area */}
          <div className="px-5 pt-1 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-fg tracking-tight">
                  {PLACE_DATA.name.split(" · ")[0]}
                </h3>
                <p className="mt-0.5 flex items-center gap-2 text-xs">
                  <span className="font-medium text-accent">营业中</span>
                  <span className="text-fg-muted">{PLACE_DATA.distance}</span>
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Coffee className="size-4" />
              </div>
            </div>

            {/* Quick Action Pills */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-accent-contrast shadow-sm"
              >
                <Navigation className="size-3.5" />
                <span>导航</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-xl border border-border bg-surface-2 p-2 text-fg hover:bg-surface"
              >
                <Phone className="size-3.5" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-xl border border-border bg-surface-2 p-2 text-fg hover:bg-surface"
              >
                <Share2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Extended Details Area */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 text-xs text-fg-muted space-y-4 border-t border-border/40 pt-3">
            <div>
              <p className="font-medium text-fg">地址与开放时间</p>
              <p className="mt-0.5">{PLACE_DATA.address}</p>
              <p className="mt-0.5 text-fg-subtle">{PLACE_DATA.status}</p>
            </div>

            <div>
              <p className="font-medium text-fg">设施特色</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {PLACE_DATA.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-surface-2 px-2 py-0.5 text-[11px] text-fg border border-border/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-fg mb-1.5">精选顾客评价</p>
              <div className="space-y-2">
                {PLACE_DATA.reviews.map((r) => (
                  <div key={r.user} className="rounded-xl border border-border/50 bg-surface-2/60 p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-fg">{r.user}</span>
                      <div className="flex text-amber-500">
                        <Star className="size-3 fill-current" />
                        <Star className="size-3 fill-current" />
                        <Star className="size-3 fill-current" />
                        <Star className="size-3 fill-current" />
                        <Star className="size-3 fill-current" />
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-fg-muted leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Indicator Badge */}
        <div className="absolute top-16 right-4 z-20 rounded-full border border-border/60 bg-surface/90 px-2.5 py-0.5 text-[10px] font-mono text-fg-muted shadow-sm backdrop-blur-sm">
          locked: {snap} ({currentHeight}px)
        </div>
      </div>
    </div>
  );
}
