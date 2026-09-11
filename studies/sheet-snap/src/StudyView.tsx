import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  DEFAULT_DAMPING,
  DEFAULT_SNAP_HEIGHTS,
  DEFAULT_VELOCITY_THRESHOLD,
  canScrollContent,
  clampHeight,
  computeVelocity,
  resolveSnapRelease,
  shouldHandoffToDrawer,
  type PointerSample,
  type SnapPoint,
} from "./lib/machines";
import {
  FORMULA,
  MODE_META,
  REASON_LABELS,
  SNAPS_META,
  type SnapMode,
} from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { useReducedMotion } from "./lib/use-reduced-motion";
import { cn } from "./lib/utils";
import { PhoneSheet } from "./PhoneSheet";
import {
  DiscreteTrack,
  SnapSideRail,
  VelocityMeter,
  phaseLabel,
  phaseOf,
} from "./SnapInstrument";

export function StudyView() {
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;

  const [snap, setSnap] = useState<SnapPoint>("half");
  const [height, setHeight] = useState<number>(DEFAULT_SNAP_HEIGHTS.half);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<SnapMode>("smart");
  const [lastVelocity, setLastVelocity] = useState(0);
  const [liveVelocity, setLiveVelocity] = useState(0);
  const [lastReason, setLastReason] = useState<string>("init");
  const [settledFlash, setSettledFlash] = useState(false);

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
  const settleTimer = useRef<number | null>(null);

  function updateHeight(nextH: number) {
    currentHeightRef.current = nextH;
    setHeight(nextH);
  }

  function flashSettle() {
    if (reduceMotionRef.current) return;
    if (settleTimer.current) window.clearTimeout(settleTimer.current);
    setSettledFlash(true);
    settleTimer.current = window.setTimeout(() => {
      setSettledFlash(false);
      settleTimer.current = null;
    }, 420);
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

  function heightForMode(rawTarget: number, activeMode: SnapMode) {
    if (activeMode === "hard_clamp") {
      return Math.max(
        DEFAULT_SNAP_HEIGHTS.peek,
        Math.min(DEFAULT_SNAP_HEIGHTS.full, rawTarget),
      );
    }
    const damping = activeMode === "static_nearest" ? 0.35 : DEFAULT_DAMPING;
    return clampHeight(
      rawTarget,
      DEFAULT_SNAP_HEIGHTS.peek,
      DEFAULT_SNAP_HEIGHTS.full,
      damping,
    );
  }

  function onHeaderPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    startDrawerDrag(e.clientY, sheetRootRef.current, e.pointerId);
  }

  function onContentPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if (snap !== "full") {
      startDrawerDrag(e.clientY, sheetRootRef.current, e.pointerId);
      return;
    }
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
    const now = performance.now();
    sampleBuffer.current.push({ t: now, y: e.clientY });
    if (sampleBuffer.current.length > 20) {
      sampleBuffer.current.shift();
    }
    setLiveVelocity(Number(computeVelocity(sampleBuffer.current, now).toFixed(2)));

    if (dragStart.current) {
      const start = dragStart.current;
      const dy = e.clientY - start.startY;
      const rawTarget = start.startH - dy;
      updateHeight(heightForMode(rawTarget, mode));
      return;
    }

    const innerStart = innerPointerStart.current;
    if (innerStart) {
      const dy = e.clientY - innerStart.startY;
      const projectedScrollTop = Math.max(0, innerStart.startScrollTop - dy);

      if (shouldHandoffToDrawer(innerStart.startScrollTop, projectedScrollTop, dy)) {
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

        const drawerDy = e.clientY - effectiveStartY;
        const rawTarget = DEFAULT_SNAP_HEIGHTS.full - drawerDy;
        updateHeight(heightForMode(rawTarget, mode));
        return;
      }

      if (contentRef.current) {
        contentRef.current.scrollTop = projectedScrollTop;
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
    setLiveVelocity(Number(vy.toFixed(2)));

    const activeH = currentHeightRef.current;
    if (mode === "static_nearest" || mode === "hard_clamp") {
      const verdict = resolveSnapRelease(activeH, 0, DEFAULT_SNAP_HEIGHTS, 9999);
      if (verdict.targetSnap !== "full" && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      setSnap(verdict.targetSnap);
      updateHeight(verdict.targetHeight);
      setLastReason("static_nearest");
      flashSettle();
    } else {
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
      flashSettle();
    }
  }

  function jumpTo(targetSnap: SnapPoint) {
    if (targetSnap !== "full" && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setSnap(targetSnap);
    updateHeight(DEFAULT_SNAP_HEIGHTS[targetSnap]);
    setLastReason("manual_tap");
    flashSettle();
  }

  const isOverdrag =
    height > DEFAULT_SNAP_HEIGHTS.full || height < DEFAULT_SNAP_HEIGHTS.peek;
  const innerScrollAllowed = canScrollContent(snap, isDragging);
  const shownVelocity = isDragging ? liveVelocity : lastVelocity;
  const preview = resolveSnapRelease(
    height,
    mode === "smart" ? (isDragging ? liveVelocity : 0) : 0,
    DEFAULT_SNAP_HEIGHTS,
    mode === "smart" ? DEFAULT_VELOCITY_THRESHOLD : 9999,
  );
  const phase = phaseOf(isDragging, isOverdrag);
  const velocityArmed =
    mode === "smart" && Math.abs(shownVelocity) >= DEFAULT_VELOCITY_THRESHOLD;
  const reasonCopy = REASON_LABELS[lastReason] ?? REASON_LABELS.init;

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold tracking-tight text-fg sm:text-[2.6rem] leading-[1.15]">
            {locale === "en"
              ? "A multi-snap sheet is not a binary open/close."
              : "多档抽屉不是二元开合。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Drag tracks 1:1 with overdrag damping. Release reads displacement and velocity, then lands on a discrete snap."
              : "拖动在标称区间全量跟手，越界加阻尼；松手按位移与速度落入离散档。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Watch the ticks stay put while the sheet edge moves. A flick past ±0.45 px/ms jumps a notch; a calm release takes the nearest."
            : "刻度不动，抽屉边沿连续走。超过 ±0.45 px/ms 甩动跃迁一档；慢放落入最近档。"}
        </p>
      </section>

      <div className="grid items-start gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col items-center">
          <div className="flex items-start gap-2">
            <SnapSideRail
              height={height}
              snap={snap}
              previewSnap={preview.targetSnap}
              isDragging={isDragging}
              isOverdrag={isOverdrag}
            />
            <PhoneSheet
              height={height}
              snap={snap}
              isDragging={isDragging}
              isOverdrag={isOverdrag}
              settledFlash={settledFlash}
              showSnapGuides
              previewSnap={preview.targetSnap}
              innerScrollAllowed={innerScrollAllowed}
              interactive
              sheetRootRef={sheetRootRef}
              contentRef={contentRef}
              onHeaderPointerDown={onHeaderPointerDown}
              onContentPointerDown={onContentPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>
          <p className="mt-4 max-w-sm text-center text-[12px] text-fg-muted">
            {locale === "en"
              ? "Grab the handle or the sheet body. Flick up from peek — smart mode jumps to half even if you never crossed the midpoint."
              : "抓住提手或抽屉本体拖。从摘要态向上轻甩：动量模式即使没过半也会升到半屏。"}
          </p>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[13px] font-semibold text-fg">
                {locale === "en" ? "Continuous height · discrete snaps" : "连续高度 · 离散档"}
              </h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  phase === "overdrag"
                    ? "bg-wrong-soft text-wrong"
                    : phase === "tracking"
                      ? "bg-accent-soft text-accent"
                      : "bg-intent-soft text-intent",
                )}
              >
                {phaseLabel(phase, locale)}
              </span>
            </div>
            <DiscreteTrack
              height={height}
              snap={snap}
              previewSnap={preview.targetSnap}
              isDragging={isDragging}
            />
            <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-xl border border-border/70 bg-surface-2/70 px-3 py-2.5">
                <p className="text-[10px] tracking-wide text-fg-subtle uppercase">
                  {locale === "en" ? "Live H" : "连续 H"}
                </p>
                <p className="mt-0.5 font-mono text-[17px] font-semibold text-fg tabular-nums">
                  {height}
                  <span className="ml-1 text-[11px] font-normal text-fg-subtle">px</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-surface-2/70 px-3 py-2.5">
                <p className="text-[10px] tracking-wide text-fg-subtle uppercase">
                  {isDragging
                    ? locale === "en"
                      ? "Would land"
                      : "松手将落入"
                    : locale === "en"
                      ? "Settled snap"
                      : "已落档"}
                </p>
                <p className="mt-0.5 text-[17px] font-semibold tracking-tight text-accent">
                  {pick(
                    SNAPS_META.find((item) => item.id === (isDragging ? preview.targetSnap : snap))
                      ?.name ?? SNAPS_META[1].name,
                    locale,
                  )}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-border/60 pt-4">
              <VelocityMeter velocity={shownVelocity} armed={velocityArmed} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="text-[13px] font-semibold text-fg">
              {locale === "en" ? "Release rule" : "裁决对照"}
            </h2>
            <div className="mt-3 grid gap-2">
              {MODE_META.map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMode(item.id)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active
                        ? item.id === "smart"
                          ? "border-accent bg-accent-soft ring-2 ring-accent/20"
                          : item.id === "hard_clamp"
                            ? "border-wrong bg-wrong-soft ring-2 ring-wrong/15"
                            : "border-border-strong bg-surface-2 ring-2 ring-fg/10"
                        : "border-border bg-surface hover:bg-surface-2",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-fg">{pick(item.name, locale)}</span>
                      {item.recommended && (
                        <span className="rounded-full bg-intent-soft px-2 py-px text-[10px] font-medium text-intent">
                          {locale === "en" ? "Rule" : "本题"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-fg-muted">{pick(item.hint, locale)}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="text-[13px] font-semibold text-fg">
              {locale === "en" ? "Jump to a snap" : "点按跳到档位"}
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SNAPS_META.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={snap === item.id}
                  onClick={() => jumpTo(item.id)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors",
                    snap === item.id
                      ? "border-accent bg-accent text-accent-fg shadow-card"
                      : "border-border bg-surface-2 text-fg hover:bg-surface",
                  )}
                >
                  <span className="text-[12px] font-semibold">{pick(item.name, locale)}</span>
                  <span className="mt-0.5 font-mono text-[10px] opacity-80">{item.height}px</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
              {pick(
                SNAPS_META.find((item) => item.id === snap)?.role ?? SNAPS_META[1].role,
                locale,
              )}
              {" · "}
              {pick(
                SNAPS_META.find((item) => item.id === snap)?.underlay ?? SNAPS_META[1].underlay,
                locale,
              )}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="text-[13px] font-semibold text-fg">
              {locale === "en" ? "Last release" : "上次松手"}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
              <Meter label="H" value={`${height}px`} />
              <Meter label="snap" value={snap} accent />
              <Meter label="vy" value={`${lastVelocity}`} />
              <Meter label={locale === "en" ? "rule" : "裁决"} value={pick(reasonCopy, locale)} />
            </div>
            <div className="sr-only" aria-live="polite">
              {snap} {height}px {pick(reasonCopy, locale)}
            </div>
            {mode !== "smart" &&
            Math.abs(lastVelocity) >= DEFAULT_VELOCITY_THRESHOLD &&
            lastReason === "static_nearest" ? (
              <p className="mt-3 rounded-xl border border-wrong/25 bg-wrong-soft px-3 py-2 text-[12px] text-wrong">
                {locale === "en"
                  ? "That flick was ignored. This mode only looks at release height."
                  : "这次甩动被忽略了。当前模式只看松手高度。"}
              </p>
            ) : lastReason === "velocity_up" || lastReason === "velocity_down" ? (
              <p className="mt-3 rounded-xl border border-intent/25 bg-intent-soft px-3 py-2 text-[12px] text-intent">
                {locale === "en"
                  ? "|vy| crossed 0.45, so the sheet jumped a notch instead of nearest."
                  : "|vy| 越过 0.45，按方向跃迁一档，而不是就近。"}
              </p>
            ) : lastReason === "nearest" ? (
              <p className="mt-3 text-[12px] leading-relaxed text-fg-subtle">
                {locale === "en"
                  ? "Velocity stayed under 0.45, so release quantized to the nearest snap."
                  : "速度不足 0.45，松手按距离落入最近档。"}
              </p>
            ) : null}
          </section>
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              {item.n}
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-0.5 text-[12px] text-fg-muted">{pick(item.example, locale)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How it decides" : "怎么判"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Track, then damp" : "1. 先跟手，再阻尼"}
              </span>
              <br />
              {locale === "en"
                ? "Inside [peek, full] height follows the pointer 1:1. Beyond the extrema, extra travel is multiplied by 0.20."
                : "在 peek 与 full 之间高度 1:1 跟手。越出极值后，超出量乘 0.20。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Velocity can skip the nearest" : "2. 速度可以跳过最近档"}
              </span>
              <br />
              {locale === "en"
                ? "A flick faster than 0.45 px/ms jumps one notch up or down. A slow release takes Euclidean nearest."
                : "快于 0.45 px/ms 的甩动升或降一档。慢放按欧氏距离落入最近档。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Inner scroll waits for full" : "3. 内滚动等到全屏"}
              </span>
              <br />
              {locale === "en"
                ? "Peek and half lock the list. Full lets the list scroll; only a down-drag at the top hands back to the sheet."
                : "摘要与半屏锁死列表。全屏才允许内滚；只有触顶再向下拉，才交回抽屉。"}
            </li>
          </ol>
        </article>
        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium tracking-[0.12em] text-surface/45 uppercase">
            resolveSnapRelease
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`if (vy < -0.45) return nextHigher
if (vy >  0.45) return nextLower
return nearest(height)`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Up is negative in screen space. Static-nearest mode zeroes velocity so a short flick can bounce back."
              : "屏幕坐标向上为负。静态模式把速度归零，短甩就可能弹回。"}
          </p>
        </article>
      </section>
    </div>
  );
}

function Meter({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface-2/70 px-3 py-2.5">
      <p className="text-[10px] tracking-wide text-fg-subtle uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 truncate font-mono text-[13px] font-semibold",
          accent ? "text-accent" : "text-fg",
        )}
      >
        {value}
      </p>
    </div>
  );
}
