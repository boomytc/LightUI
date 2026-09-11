import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react";
import { Coffee, MapPin, Navigation, Phone, Search, Share2 } from "lucide-react";
import { DEFAULT_SNAP_HEIGHTS, type SnapPoint } from "./lib/machines";
import { PLACE_DATA, SNAPS_META } from "./lib/kinds";
import { useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";
import "./sheet.css";

export const PHONE_WIDTH = 340;
export const PHONE_HEIGHT = 640;

function sheetProgress(height: number) {
  const span = DEFAULT_SNAP_HEIGHTS.full - DEFAULT_SNAP_HEIGHTS.peek;
  return Math.min(1, Math.max(0, (height - DEFAULT_SNAP_HEIGHTS.peek) / span));
}

type PhoneSheetProps = {
  height: number;
  snap: SnapPoint;
  isDragging?: boolean;
  isOverdrag?: boolean;
  settledFlash?: boolean;
  showSnapGuides?: boolean;
  previewSnap?: SnapPoint | null;
  innerScrollAllowed?: boolean;
  badge?: string | null;
  interactive?: boolean;
  sheetRootRef?: RefObject<HTMLDivElement | null>;
  contentRef?: RefObject<HTMLDivElement | null>;
  sheetAttr?: string;
  onHeaderPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onContentPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: ReactPointerEvent<HTMLDivElement>) => void;
};

export function PhoneSheet({
  height,
  snap,
  isDragging = false,
  isOverdrag = false,
  settledFlash = false,
  showSnapGuides = false,
  previewSnap = null,
  innerScrollAllowed = false,
  badge = null,
  interactive = false,
  sheetRootRef,
  contentRef,
  sheetAttr,
  onHeaderPointerDown,
  onContentPointerDown,
  onPointerMove,
  onPointerUp,
}: PhoneSheetProps) {
  const locale = useLocale();
  const progress = sheetProgress(height);
  const cafeName = PLACE_DATA.name.split(" · ")[0];

  return (
    <div
      className="relative isolate overflow-hidden rounded-[36px] border-[5px] border-fg/12 bg-surface shadow-menu ring-1 ring-border"
      style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT }}
    >
      <div className="pointer-events-none absolute top-3 left-1/2 z-40 h-5 w-28 -translate-x-1/2 rounded-full bg-fg/80" />

      <div
        className="sheet-map relative h-full overflow-hidden"
        style={{ "--sheet-progress": progress } as CSSProperties}
      >
        <div className="absolute -top-8 left-[18%] h-[760px] w-20 -rotate-[16deg] bg-accent/12 blur-[1px]" />
        <div className="absolute top-[18%] left-[8%] h-24 w-28 rounded-2xl bg-intent-soft/80" />
        <div className="absolute top-[58%] right-[10%] h-20 w-24 rounded-2xl bg-intent-soft/55" />

        <div className="absolute top-[30%] left-0 h-[5px] w-full bg-border-strong/70" />
        <div className="absolute top-[54%] left-0 h-[3px] w-full bg-border/80" />
        <div className="absolute top-0 left-[30%] h-full w-[5px] bg-border-strong/70" />
        <div className="absolute top-0 left-[70%] h-full w-[3px] bg-border/70" />

        <div className="absolute top-[10%] left-[8%] h-14 w-[72px] rounded-lg border border-border-strong bg-surface shadow-card" />
        <div className="absolute top-[38%] left-[74%] h-16 w-16 rounded-lg border border-border-strong bg-surface shadow-card" />
        <div className="absolute top-[66%] left-[10%] h-12 w-[78px] rounded-lg border border-border-strong bg-surface shadow-card" />
        <div className="absolute top-[22%] left-[48%] h-10 w-14 rounded-md border border-border-strong/80 bg-surface/85" />

        <div className="absolute top-9 right-4 left-4 z-10 flex h-10 items-center justify-between rounded-full border border-border bg-surface/92 px-3.5 shadow-card backdrop-blur-sm">
          <span className="text-[12px] text-fg-muted">
            {locale === "en" ? "Search nearby cafes" : "搜索附近咖啡、美食"}
          </span>
          <Search className="size-3.5 text-fg-subtle" />
        </div>

        <div className="absolute top-[36%] left-[46%] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="relative">
            {interactive ? <div className="sheet-pin-ring absolute inset-0 rounded-full bg-accent" /> : null}
            <div className="relative flex size-10 items-center justify-center rounded-full bg-accent text-accent-fg shadow-menu ring-4 ring-accent/20">
              <MapPin className="size-5" />
            </div>
          </div>
          <span className="mt-1.5 rounded-md border border-border/60 bg-surface/92 px-2 py-0.5 text-[11px] font-semibold text-fg shadow-card">
            {cafeName}
          </span>
        </div>

        <div className="sheet-map-scrim absolute inset-0 z-[15]" />
      </div>

      {showSnapGuides && (
        <SnapGuides height={height} snap={snap} previewSnap={previewSnap} isDragging={isDragging} />
      )}

      <div
        ref={sheetRootRef}
        data-sheet-root={sheetAttr ? undefined : interactive ? "true" : undefined}
        {...(sheetAttr ? { "data-sheet-stage": sheetAttr } : {})}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "sheet-panel absolute right-0 bottom-0 left-0 z-20 flex flex-col rounded-t-[28px] border-t border-border bg-surface shadow-menu",
          isDragging && "is-dragging",
          settledFlash && "is-settled",
          isOverdrag && "ring-1 ring-accent/35",
        )}
        style={{
          height,
          "--sheet-progress": progress,
        } as CSSProperties}
      >
        <div
          onPointerDown={onHeaderPointerDown}
          className={cn(
            "select-none",
            interactive && "touch-none cursor-grab active:cursor-grabbing",
          )}
        >
          <div className="flex h-8 w-full flex-col items-center justify-center pt-2">
            <div data-sheet-handle="true" className={cn("sheet-handle", isDragging && "is-hot")} />
            {interactive && (
              <span className="mt-1 text-[9px] tracking-[0.16em] text-fg-subtle uppercase">
                {isDragging
                  ? locale === "en"
                    ? "tracking"
                    : "跟手"
                  : locale === "en"
                    ? "drag"
                    : "拖动"}
              </span>
            )}
          </div>

          <div className="px-5 pt-1 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold tracking-tight text-fg">{cafeName}</h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="font-medium text-intent">{locale === "en" ? "Open" : "营业中"}</span>
                  <span className="text-fg-muted">{PLACE_DATA.distance}</span>
                </p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Coffee className="size-4" />
              </div>
            </div>

            <div
              className="mt-3 flex items-center gap-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-[12px] font-medium text-accent-fg shadow-card"
              >
                <Navigation className="size-3.5" />
                <span>{locale === "en" ? "Directions" : "导航"}</span>
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-fg hover:bg-surface"
                aria-label={locale === "en" ? "Call" : "电话"}
              >
                <Phone className="size-3.5" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-fg hover:bg-surface"
                aria-label={locale === "en" ? "Share" : "分享"}
              >
                <Share2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={contentRef}
          onPointerDown={onContentPointerDown}
          className={cn(
            "flex-1 space-y-4 border-t border-border/50 px-5 pt-3 pb-8 text-[12px] text-fg-muted select-none",
            interactive && "touch-none",
            innerScrollAllowed ? "overflow-y-auto" : "overflow-hidden",
          )}
        >
          <div>
            <p className="font-medium text-fg">
              {locale === "en" ? "Address & hours" : "地址与营业详情"}
            </p>
            <p className="mt-0.5">{PLACE_DATA.address}</p>
            <p className="mt-0.5 text-fg-subtle">{PLACE_DATA.status}</p>
          </div>

          <div>
            <p className="font-medium text-fg">
              {locale === "en" ? "Tags" : "特色服务与标签"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PLACE_DATA.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-border/70 bg-surface-2 px-2 py-0.5 text-[11px] text-fg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="font-medium text-fg">
                {locale === "en" ? "Reviews" : "顾客评价"}
              </p>
              <span className="text-[10px] text-accent">
                {innerScrollAllowed
                  ? locale === "en"
                    ? "List can scroll"
                    : "列表可滚"
                  : locale === "en"
                    ? "Scroll after full"
                    : "全屏后可滚"}
              </span>
            </div>
            <div className="space-y-2">
              {PLACE_DATA.reviews.map((review) => (
                <div
                  key={review.user}
                  className="rounded-xl border border-border/60 bg-surface-2/80 p-2.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-fg">{review.user}</span>
                    <span className="font-mono text-[10px] text-accent">5.0</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-fg/18" />

      {badge && (
        <div className="absolute top-[5.75rem] right-3 z-30 rounded-full border border-border/70 bg-surface/92 px-2.5 py-0.5 font-mono text-[10px] text-fg-muted shadow-card backdrop-blur-sm">
          {badge}
        </div>
      )}
    </div>
  );
}

function SnapGuides({
  height,
  snap,
  previewSnap,
  isDragging,
}: {
  height: number;
  snap: SnapPoint;
  previewSnap: SnapPoint | null;
  isDragging: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {SNAPS_META.map((item) => {
        const active = snap === item.id;
        const preview = previewSnap === item.id && isDragging;
        return (
          <div
            key={item.id}
            className="absolute right-0 left-0"
            style={{ bottom: item.height }}
          >
            <div
              className={cn(
                "h-px",
                active ? "bg-accent/70" : preview ? "bg-predict/70" : "bg-border-strong/80",
              )}
            />
          </div>
        );
      })}
      <div
        className={cn("sheet-caret absolute right-0 left-0", isDragging && "is-live")}
        style={{ bottom: height }}
      >
        <div className="h-0.5 bg-accent shadow-card" />
      </div>
    </div>
  );
}
