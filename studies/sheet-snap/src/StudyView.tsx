import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  Coffee,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Star,
  Activity,
  Zap,
  Gauge,
  ArrowDownUp,
  ShieldAlert,
} from "lucide-react";
import {
  DEFAULT_SNAP_HEIGHTS,
  DEFAULT_DAMPING,
  DEFAULT_VELOCITY_THRESHOLD,
  clampHeight,
  resolveSnapRelease,
  computeVelocity,
  canScrollContent,
  shouldHandoffToDrawer,
  type SnapPoint,
  type PointerSample,
} from "./lib/machines";
import { PLACE_DATA, SNAPS_META, FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";

type SnapMode = "smart" | "static_nearest" | "hard_clamp";

export function StudyView() {
  const locale = useLocale();
  const [snap, setSnap] = useState<SnapPoint>("half");
  const [height, setHeight] = useState<number>(DEFAULT_SNAP_HEIGHTS.half);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<SnapMode>("smart");
  const [lastVelocity, setLastVelocity] = useState(0);
  const [lastReason, setLastReason] = useState<string>("init");

  const currentHeightRef = useRef<number>(DEFAULT_SNAP_HEIGHTS.half);
  const sheetRootRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ startY: number; startH: number } | null>(null);
  const innerPointerStart = useRef<{
    startY: number;
    startScrollTop: number;
    pointerId: number;
  } | null>(null);
  const sampleBuffer = useRef<PointerSample[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  function updateHeight(nextH: number) {
    currentHeightRef.current = nextH;
    setHeight(nextH);
  }

  function startDrawerDrag(
    clientY: number,
    captureTarget?: HTMLElement | null,
    pointerId?: number,
    startH?: number,
    preserveBuffer?: boolean,
  ) {
    const target = captureTarget ?? sheetRootRef.current;
    if (target && pointerId !== undefined) {
      try {
        target.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }
    const initialH = startH ?? currentHeightRef.current;
    dragStart.current = { startY: clientY, startH: initialH };
    if (!preserveBuffer) {
      sampleBuffer.current = [{ t: performance.now(), y: clientY }];
    }
    setIsDragging(true);
  }

  function onHeaderPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    startDrawerDrag(e.clientY, sheetRootRef.current, e.pointerId);
  }

  function onContentPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if (snap !== "full") {
      // In peek or half, inner scroll is locked; drag moves the sheet
      startDrawerDrag(e.clientY, sheetRootRef.current, e.pointerId);
      return;
    }
    // In full state, inner list scrolling has priority
    if (sheetRootRef.current && e.pointerId !== undefined) {
      try {
        sheetRootRef.current.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    sampleBuffer.current = [{ t: performance.now(), y: e.clientY }];
    innerPointerStart.current = {
      startY: e.clientY,
      startScrollTop: contentRef.current?.scrollTop ?? 0,
      pointerId: e.pointerId,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    // Record sample for velocity calculation
    const now = performance.now();
    sampleBuffer.current.push({ t: now, y: e.clientY });
    if (sampleBuffer.current.length > 20) {
      sampleBuffer.current.shift();
    }

    // If sheet drag is active, update height
    if (dragStart.current) {
      const start = dragStart.current;
      // dy: positive when pulling down, negative when pulling up
      const dy = e.clientY - start.startY;
      const rawTarget = start.startH - dy;

      let nextH: number;
      if (mode === "hard_clamp") {
        nextH = Math.max(
          DEFAULT_SNAP_HEIGHTS.peek,
          Math.min(DEFAULT_SNAP_HEIGHTS.full, rawTarget),
        );
      } else {
        const damping = mode === "static_nearest" ? 0.35 : DEFAULT_DAMPING;
        nextH = clampHeight(
          rawTarget,
          DEFAULT_SNAP_HEIGHTS.peek,
          DEFAULT_SNAP_HEIGHTS.full,
          damping,
        );
      }

      updateHeight(nextH);
      return;
    }

    // If not dragging sheet, handle inner scroll and scroll-handoff at top boundary
    const innerStart = innerPointerStart.current;
    if (innerStart) {
      const dy = e.clientY - innerStart.startY;
      const projectedScrollTop = Math.max(0, innerStart.startScrollTop - dy);

      if (shouldHandoffToDrawer(innerStart.startScrollTop, projectedScrollTop, dy)) {
        // Handoff: at top boundary pulling down collapses sheet
        const pid = innerStart.pointerId;
        const effectiveStartY = innerStart.startY + Math.max(0, innerStart.startScrollTop);
        innerPointerStart.current = null;
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
        startDrawerDrag(
          effectiveStartY,
          sheetRootRef.current,
          pid,
          DEFAULT_SNAP_HEIGHTS.full,
          true,
        );

        // Immediately update height in the current frame to prevent pixel lag or sudden jumps
        const drawerDy = e.clientY - effectiveStartY;
        const rawTarget = DEFAULT_SNAP_HEIGHTS.full - drawerDy;
        let nextH: number;
        if (mode === "hard_clamp") {
          nextH = Math.max(
            DEFAULT_SNAP_HEIGHTS.peek,
            Math.min(DEFAULT_SNAP_HEIGHTS.full, rawTarget),
          );
        } else {
          const damping = mode === "static_nearest" ? 0.35 : DEFAULT_DAMPING;
          nextH = clampHeight(
            rawTarget,
            DEFAULT_SNAP_HEIGHTS.peek,
            DEFAULT_SNAP_HEIGHTS.full,
            damping,
          );
        }
        updateHeight(nextH);
        return;
      } else {
        // Scroll inner list
        if (contentRef.current) {
          contentRef.current.scrollTop = projectedScrollTop;
        }
      }
    }
  }

  function onPointerUp(e?: ReactPointerEvent<HTMLDivElement>) {
    if (e && sheetRootRef.current && e.pointerId !== undefined) {
      try {
        sheetRootRef.current.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    innerPointerStart.current = null;
    if (!dragStart.current) return;
    dragStart.current = null;
    setIsDragging(false);

    const now = performance.now();
    if (e && e.type !== "pointercancel") {
      sampleBuffer.current.push({ t: now, y: e.clientY });
    }
    const vy = computeVelocity(sampleBuffer.current, now);
    setLastVelocity(Number(vy.toFixed(2)));

    const activeH = currentHeightRef.current;
    if (mode === "static_nearest" || mode === "hard_clamp") {
      // Naive static nearest without velocity
      const verdict = resolveSnapRelease(activeH, 0, DEFAULT_SNAP_HEIGHTS, 9999);
      if (verdict.targetSnap !== "full" && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      setSnap(verdict.targetSnap);
      updateHeight(verdict.targetHeight);
      setLastReason("static_nearest");
    } else {
      // Smart velocity + displacement projection
      const verdict = resolveSnapRelease(
        activeH,
        vy,
        DEFAULT_SNAP_HEIGHTS,
        DEFAULT_VELOCITY_THRESHOLD,
      );
      if (verdict.targetSnap !== "full" && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      setSnap(verdict.targetSnap);
      updateHeight(verdict.targetHeight);
      setLastReason(verdict.reason);
    }
  }

  function jumpTo(targetSnap: SnapPoint) {
    if (targetSnap !== "full" && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setSnap(targetSnap);
    updateHeight(DEFAULT_SNAP_HEIGHTS[targetSnap]);
    setLastReason("manual_tap");
  }

  const isOverdrag =
    height > DEFAULT_SNAP_HEIGHTS.full || height < DEFAULT_SNAP_HEIGHTS.peek;
  const innerScrollAllowed = canScrollContent(snap, isDragging);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Formula Bar */}
      <div className="mb-8 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
          <Activity className="size-4" />
          <span>{locale === "en" ? "Interactive Rule Formula" : "交互法则 · 说清楚"}</span>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {FORMULA.map((item) => (
            <div key={item.n} className="rounded-xl border border-border/60 bg-surface-2/60 p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-contrast">
                  {item.n}
                </span>
                <span className="font-semibold text-fg text-sm">{pick(item.title, locale)}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                {pick(item.example, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
        {/* Left Column: Interactive Mobile Frame */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-[620px] w-[340px] flex-col overflow-hidden rounded-[38px] border-4 border-fg/10 bg-surface shadow-2xl ring-1 ring-border select-none">
            {/* Speaker cutout */}
            <div className="absolute top-3 left-1/2 z-30 h-4 w-28 -translate-x-1/2 rounded-full bg-border/50" />

            {/* Simulated Map */}
            <div className="relative flex-1 bg-surface-2 overflow-hidden">
              {/* River line */}
              <div className="absolute -top-10 left-1/4 h-[720px] w-18 -rotate-12 bg-accent/15 blur-[1px]" />
              {/* Roads */}
              <div className="absolute top-[28%] left-0 h-4 w-full bg-border/60" />
              <div className="absolute top-[52%] left-0 h-3 w-full bg-border/40" />
              <div className="absolute top-0 left-[28%] h-full w-4 bg-border/60" />
              <div className="absolute top-0 left-[68%] h-full w-3 bg-border/40" />
              {/* Blocks */}
              <div className="absolute top-[12%] left-[8%] h-14 w-20 rounded-lg bg-surface border border-border/40" />
              <div className="absolute top-[36%] left-[74%] h-16 w-16 rounded-lg bg-surface border border-border/40" />
              <div className="absolute top-[64%] left-[10%] h-12 w-20 rounded-lg bg-surface border border-border/40" />

              {/* Cafe Map Pin */}
              <div className="absolute top-[35%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-lg ring-4 ring-accent/20">
                  <MapPin className="size-5" />
                </div>
                <span className="mt-1 rounded-md bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-fg shadow-sm border border-border/50">
                  {PLACE_DATA.name.split(" · ")[0]}
                </span>
              </div>

              {/* Search Pill */}
              <div className="absolute top-10 left-4 right-4 z-10 flex h-9 items-center justify-between rounded-full border border-border bg-surface/95 px-3 shadow-sm backdrop-blur-sm">
                <span className="text-xs text-fg-muted">在附近搜索...</span>
                <span className="text-xs">☕️</span>
              </div>
            </div>

            {/* Draggable Bottom Sheet */}
            <div
              ref={sheetRootRef}
              data-sheet-root="true"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={cn(
                "absolute bottom-0 left-0 right-0 flex flex-col rounded-t-[28px] border-t border-border bg-surface shadow-2xl",
                !isDragging && "transition-[height] duration-250 ease-out",
                isOverdrag && "ring-2 ring-accent/30",
              )}
              style={{ height }}
            >
              {/* Drag Handle & Header Area */}
              <div
                onPointerDown={onHeaderPointerDown}
                className="touch-none select-none cursor-grab active:cursor-grabbing"
              >
                {/* Drag Handle Bar */}
                <div className="flex h-7 w-full items-center justify-center pt-2">
                  <div
                    className={cn(
                      "h-1.5 w-12 rounded-full transition-colors",
                      isDragging ? "bg-accent" : "bg-fg-subtle/40",
                    )}
                  />
                </div>

                {/* Sheet Header Summary */}
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

                  {/* Quick actions */}
                  <div
                    className="mt-3 flex items-center gap-2"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-accent-contrast shadow-sm cursor-pointer"
                    >
                      <Navigation className="size-3.5" />
                      <span>导航</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-xl border border-border bg-surface-2 p-2 text-fg hover:bg-surface cursor-pointer"
                    >
                      <Phone className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-xl border border-border bg-surface-2 p-2 text-fg hover:bg-surface cursor-pointer"
                    >
                      <Share2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Extended Details / Inner Scrollable Area */}
              <div
                ref={contentRef}
                onPointerDown={onContentPointerDown}
                className={cn(
                  "flex-1 px-5 pb-6 text-xs text-fg-muted space-y-4 border-t border-border/40 pt-3 select-none touch-none",
                  innerScrollAllowed ? "overflow-y-auto" : "overflow-hidden",
                )}
              >
                <div>
                  <p className="font-medium text-fg">地址与营业详情</p>
                  <p className="mt-0.5">{PLACE_DATA.address}</p>
                  <p className="mt-0.5 text-fg-subtle">{PLACE_DATA.status}</p>
                </div>

                <div>
                  <p className="font-medium text-fg">特色服务与标签</p>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-medium text-fg">顾客评价与反馈</p>
                    <span className="text-[10px] text-accent">
                      {innerScrollAllowed ? "已允许滚动" : "展开全屏后可滚动"}
                    </span>
                  </div>
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
          </div>
          <p className="mt-3 text-xs text-fg-muted text-center max-w-xs">
            按住抽屉顶部白色提手上下拖拽；试试快速向上或向下甩动（Flick）
          </p>
        </div>

        {/* Right Column: Controls, Comparison & Inspector */}
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold text-fg flex items-center gap-2">
              <Zap className="size-4 text-accent" />
              <span>{locale === "en" ? "Algorithm & Physics Mode" : "裁决算法与跟手模式"}</span>
            </h4>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setMode("smart")}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  mode === "smart"
                    ? "border-accent bg-accent-soft text-accent ring-2 ring-accent/20"
                    : "border-border bg-surface hover:bg-surface-2 text-fg-muted",
                )}
              >
                <div className="text-xs font-semibold text-fg">动量 + 弹性阻尼</div>
                <div className="mt-1 text-[11px] text-fg-muted leading-snug">
                  速度感应跃迁下一档，越界 0.20 阻尼（推荐）
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode("static_nearest")}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  mode === "static_nearest"
                    ? "border-accent bg-accent-soft text-accent ring-2 ring-accent/20"
                    : "border-border bg-surface hover:bg-surface-2 text-fg-muted",
                )}
              >
                <div className="text-xs font-semibold text-fg">纯静态距离吸附</div>
                <div className="mt-1 text-[11px] text-fg-muted leading-snug">
                  无速度感应，向上轻甩因未过半反弹缩回
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode("hard_clamp")}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  mode === "hard_clamp"
                    ? "border-accent bg-accent-soft text-accent ring-2 ring-accent/20"
                    : "border-border bg-surface hover:bg-surface-2 text-fg-muted",
                )}
              >
                <div className="text-xs font-semibold text-fg">生硬截断无阻尼</div>
                <div className="mt-1 text-[11px] text-fg-muted leading-snug">
                  拉过极值直接撞墙，失去触控物理弹性
                </div>
              </button>
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold text-fg flex items-center gap-2">
              <ArrowDownUp className="size-4 text-accent" />
              <span>{locale === "en" ? "Snap Points" : "离散吸附档位"}</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {SNAPS_META.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpTo(item.id)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border p-3 transition-colors text-center",
                    snap === item.id
                      ? "border-accent bg-accent text-accent-contrast shadow-sm"
                      : "border-border bg-surface-2 hover:bg-surface text-fg",
                  )}
                >
                  <span className="text-xs font-bold">{pick(item.name, locale)}</span>
                  <span className="text-[10px] opacity-80 mt-0.5">{item.height}px</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Telemetry Inspector */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold text-fg flex items-center gap-2">
              <Gauge className="size-4 text-accent" />
              <span>{locale === "en" ? "Realtime Telemetry" : "实时手势与物理遥测"}</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
                <span className="text-[11px] text-fg-muted">当前高度 H</span>
                <p className="mt-1 text-lg font-bold font-mono text-fg">{height}px</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
                <span className="text-[11px] text-fg-muted">当前档位 Snap</span>
                <p className="mt-1 text-lg font-bold font-mono text-accent uppercase">{snap}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
                <span className="text-[11px] text-fg-muted">释放速度 vy</span>
                <p className="mt-1 text-lg font-bold font-mono text-fg">{lastVelocity} px/ms</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
                <span className="text-[11px] text-fg-muted">裁决机制</span>
                <p className="mt-1 text-xs font-bold font-mono text-fg truncate">{lastReason}</p>
              </div>
            </div>

            {isOverdrag && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                <ShieldAlert className="size-4 shrink-0" />
                <span>当前触发越界阻尼 (Overdrag Damping active)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
