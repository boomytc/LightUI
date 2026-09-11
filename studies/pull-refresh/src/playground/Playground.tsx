import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { PHASE_COPY, type RefreshPhase } from "../lib/kinds";
import {
  calculatePull,
  DEFAULT_DAMPING,
  DEFAULT_MAX_PULL_PX,
  DEFAULT_THRESHOLD_PX,
  isThresholdMet,
  pullProgress,
  resolvePointerRelease,
  shouldTakeoverScroll,
} from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn, FRESH_NEWS_ITEM, INITIAL_NEWS, type NewsItem } from "../lib/utils";
import { PullIndicator } from "./PullIndicator";

const PHASES: RefreshPhase[] = ["idle", "pulling", "ready", "refreshing", "settled"];

export function Playground() {
  const locale = useLocale();

  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [phase, setPhase] = useState<RefreshPhase>("idle");
  const [pullPx, setPullPx] = useState(0);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [rawDy, setRawDy] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPullingRef = useRef(false);
  const pullPxRef = useRef(0);
  const timers = useRef<number[]>([]);

  pullPxRef.current = pullPx;

  useEffect(() => {
    return () => {
      for (const id of timers.current) window.clearTimeout(id);
    };
  }, []);

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function handlePointerDown(e: React.PointerEvent) {
    const el = containerRef.current;
    if (!el || !shouldTakeoverScroll(el.scrollTop, 1, phase === "refreshing")) return;

    isPullingRef.current = true;
    startY.current = e.clientY;
    setSettling(false);
    setDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetic pointer or already released */
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isPullingRef.current || phase === "refreshing") return;
    const dy = e.clientY - startY.current;
    setRawDy(Math.max(0, dy));

    if (dy <= 0) {
      setPullPx(0);
      setPhase("idle");
      return;
    }

    const calculated = calculatePull(dy);
    setPullPx(calculated);

    if (isThresholdMet(calculated)) {
      setPhase("ready");
    } else {
      setPhase("pulling");
    }
  }

  function handlePointerUp() {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    setDragging(false);
    setSettling(true);

    const verdict = resolvePointerRelease(pullPxRef.current);
    if (verdict.shouldRefresh) {
      setPhase("refreshing");
      setPullPx(verdict.targetHeight);

      later(() => {
        setNews((prev) => (prev.some((item) => item.id === FRESH_NEWS_ITEM.id) ? prev : [FRESH_NEWS_ITEM, ...prev]));
        setPhase("settled");
        setBannerMsg(locale === "en" ? "Fetched 1 new update" : "已拉取 1 条最新资讯");
        setPullPx(0);
        setRawDy(0);

        later(() => {
          setPhase("idle");
          setBannerMsg(null);
          setSettling(false);
        }, 1800);
      }, 1500);
    } else {
      setPhase("idle");
      setPullPx(0);
      setRawDy(0);
    }
  }

  function resetNews() {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
    isPullingRef.current = false;
    setNews(INITIAL_NEWS);
    setPhase("idle");
    setPullPx(0);
    setRawDy(0);
    setBannerMsg(null);
    setDragging(false);
    setSettling(false);
    const el = containerRef.current;
    if (el) {
      el.scrollTop = 0;
      setScrollTop(0);
    }
  }

  function seek(where: "top" | "mid") {
    const el = containerRef.current;
    if (!el || phase === "refreshing" || dragging) return;
    el.scrollTop = where === "top" ? 0 : 180;
    setScrollTop(el.scrollTop);
  }

  const atTop = scrollTop <= 0;
  const busy = phase === "refreshing";
  const movingDown = dragging && rawDy > 0;
  const takeover = shouldTakeoverScroll(scrollTop, movingDown ? rawDy : 0, busy);
  const qualified = isThresholdMet(pullPx);
  const progress = pullProgress(pullPx);
  const capped = pullPx >= DEFAULT_MAX_PULL_PX;
  const fingerCap = Math.round(DEFAULT_MAX_PULL_PX / DEFAULT_DAMPING);

  const edgeClass = busy
    ? "pull-edge-busy"
    : qualified
      ? "pull-edge-ready"
      : atTop
        ? "pull-edge-on"
        : "pull-edge-off";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2/70 px-5 py-3">
        <PhaseRail phase={phase} locale={locale} />
        <button
          type="button"
          onClick={resetNews}
          className="inline-flex items-center gap-1.5 text-[12px] text-fg-muted hover:text-fg"
        >
          <RotateCcw className="size-3.5" />
          {locale === "en" ? "Reset feed" : "重置列表"}
        </button>
      </div>

      <div className="grid gap-6 bg-bg-warm/80 p-5 md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] md:items-stretch lg:p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="pull-phone w-full max-w-[340px] rounded-[34px] p-3">
            <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-fg/12" />
            <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
              <span className="font-mono text-[10px] tabular-nums text-fg-subtle">9:41</span>
              <span className="text-[11px] font-semibold tracking-wide text-fg">
                {locale === "en" ? "Live Updates" : "资讯中心"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  atTop ? "bg-accent-soft text-accent" : "bg-surface-2 text-fg-subtle",
                )}
              >
                {atTop
                  ? locale === "en"
                    ? "Top edge"
                    : "顶边"
                  : locale === "en"
                    ? "Mid-list"
                    : "半腰"}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-[22px] border border-border bg-surface-2">
              <div className="px-4 pt-2">
                <div className={cn("pull-edge", edgeClass)} />
              </div>

              {bannerMsg && (
                <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-center gap-1.5 rounded-full bg-fg px-3 py-1.5 text-[11px] font-medium text-surface shadow-card">
                  <Check className="size-3 text-intent" />
                  <span>{bannerMsg}</span>
                </div>
              )}

              <div
                ref={containerRef}
                data-pull-feed="true"
                onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={cn(
                  "relative h-[300px] overflow-y-auto px-3 pb-3 select-none cursor-grab active:cursor-grabbing sm:h-[340px]",
                  dragging || busy ? "touch-none" : "touch-pan-y",
                )}
              >
                <PullIndicator pullPx={pullPx} phase={phase} locale={locale} settling={settling} />

                <div className="space-y-2 pt-1">
                  {news.map((item) => (
                    <article
                      key={item.id}
                      className={cn(
                        "rounded-xl border bg-surface p-3.5 shadow-[0_1px_0_rgb(23_24_28/0.03)]",
                        item.fresh
                          ? "border-accent/40 bg-accent-soft/70 ring-1 ring-accent/25"
                          : "border-border",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-[13px] font-semibold text-fg">{item.title}</h4>
                        <span className="shrink-0 font-mono text-[11px] text-fg-subtle">{item.time}</span>
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{item.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-fg-subtle">
              {locale === "en"
                ? "Pull down at the top. Mid-list scroll stays native."
                : "停在顶边再向下拉。半腰滚动仍是原生列表。"}
            </p>
          </div>
        </div>

        <Instrument
          locale={locale}
          atTop={atTop}
          movingDown={movingDown}
          takeover={takeover}
          busy={busy}
          rawDy={rawDy}
          pullPx={pullPx}
          qualified={qualified}
          progress={progress}
          capped={capped}
          fingerCap={fingerCap}
          phase={phase}
          onSeek={seek}
          canSeek={!busy && !dragging}
        />
      </div>
    </div>
  );
}

function PhaseRail({ phase, locale }: { phase: RefreshPhase; locale: ReturnType<typeof useLocale> }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {PHASES.map((id, index) => {
        const active = phase === id;
        return (
          <li key={id} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-fg-subtle/40">·</span>}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                active
                  ? id === "ready" || id === "settled"
                    ? "bg-intent-soft text-intent"
                    : id === "refreshing"
                      ? "bg-accent-soft text-accent"
                      : id === "pulling"
                        ? "bg-predict-soft text-predict"
                        : "bg-surface text-fg border border-border"
                  : "text-fg-subtle",
              )}
            >
              {pick(PHASE_COPY[id].label, locale)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Instrument({
  locale,
  atTop,
  movingDown,
  takeover,
  busy,
  rawDy,
  pullPx,
  qualified,
  progress,
  capped,
  fingerCap,
  phase,
  onSeek,
  canSeek,
}: {
  locale: ReturnType<typeof useLocale>;
  atTop: boolean;
  movingDown: boolean;
  takeover: boolean;
  busy: boolean;
  rawDy: number;
  pullPx: number;
  qualified: boolean;
  progress: number;
  capped: boolean;
  fingerCap: number;
  phase: RefreshPhase;
  onSeek: (where: "top" | "mid") => void;
  canSeek: boolean;
}) {
  const verdict = busy
    ? locale === "en"
      ? "Busy — refresh owns the header"
      : "刷新占用 · 不再接管新的下拉"
    : takeover
      ? locale === "en"
        ? "Taken over — damping the pull"
        : "已接管 · 位移按阻尼延伸"
      : atTop
        ? locale === "en"
          ? "At top — waiting for a downward pull"
          : "已在顶边 · 等一次向下"
        : locale === "en"
          ? "Mid-list — native scroll keeps the pointer"
          : "半腰 · 指针留给原生滚动";

  return (
    <div className="pull-instrument flex flex-col justify-between overflow-hidden rounded-2xl p-5">
      <div className="relative z-10 space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-surface/45">
            {locale === "en" ? "Takeover · Damping · Threshold" : "接管 · 阻尼 · 阈值"}
          </p>
          <p className="mt-2 text-[14px] font-medium leading-snug text-surface/90">{verdict}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <ConditionLamp
            on={atTop}
            label={locale === "en" ? "Top edge" : "顶边"}
            detail="scrollTop ≤ 0"
          />
          <ConditionLamp
            on={movingDown}
            label={locale === "en" ? "Down" : "向下"}
            detail="dy > 0"
          />
          <ConditionLamp
            on={takeover}
            label={locale === "en" ? "Take over" : "接管"}
            detail={locale === "en" ? "both true" : "两条件同时"}
            accent
          />
        </div>

        <div className="grid grid-cols-[72px_1fr] gap-4">
          <PullRuler pullPx={pullPx} qualified={qualified} busy={busy} />
          <div className="min-w-0 space-y-3">
            <Meter
              label={locale === "en" ? "Finger travel" : "手指位移"}
              value={rawDy}
              max={fingerCap}
              unit="px"
              hint={`dy`}
            />
            <Meter
              label={locale === "en" ? "Damped pull" : "阻尼位移"}
              value={pullPx}
              max={DEFAULT_MAX_PULL_PX}
              unit="px"
              hint={`min(${DEFAULT_MAX_PULL_PX}, dy × ${DEFAULT_DAMPING})`}
              accent
            />
            <p className="font-mono text-[11px] leading-relaxed text-surface/50">
              {capped
                ? locale === "en"
                  ? `Capped at ${DEFAULT_MAX_PULL_PX}px — extra finger travel adds no height.`
                  : `已顶到 ${DEFAULT_MAX_PULL_PX}px 上限，再拉手指也不加高。`
                : locale === "en"
                  ? `List follows ${Math.round(DEFAULT_DAMPING * 100)}% of the finger, then stops.`
                  : `列表只跟手指的 ${Math.round(DEFAULT_DAMPING * 100)}%，然后顶住。`}
            </p>
          </div>
        </div>

        <ThresholdTrack pullPx={pullPx} progress={progress} qualified={qualified} busy={busy} locale={locale} />
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
        <p className="text-[11px] leading-relaxed text-surface/45">
          {pick(PHASE_COPY[phase].hint, locale)}
        </p>
        <div className="flex gap-2">
          <SeekButton disabled={!canSeek} onClick={() => onSeek("mid")} active={!atTop}>
            {locale === "en" ? "Seek mid" : "滚到半腰"}
          </SeekButton>
          <SeekButton disabled={!canSeek} onClick={() => onSeek("top")} active={atTop}>
            {locale === "en" ? "Back to top" : "回到顶边"}
          </SeekButton>
        </div>
      </div>
    </div>
  );
}

function ConditionLamp({
  on,
  label,
  detail,
  accent = false,
}: {
  on: boolean;
  label: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-2.5 py-2",
        on
          ? accent
            ? "border-accent/40 bg-accent/15"
            : "border-white/16 bg-white/8"
          : "border-white/8 bg-black/20 opacity-70",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "size-1.5 rounded-full",
            on ? (accent ? "bg-accent" : "bg-intent") : "bg-surface/30",
          )}
        />
        <span className="text-[11px] font-semibold text-surface">{label}</span>
      </div>
      <p className="mt-1 font-mono text-[10px] text-surface/45">{detail}</p>
    </div>
  );
}

function Meter({
  label,
  value,
  max,
  unit,
  hint,
  accent = false,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  hint: string;
  accent?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-surface/55">{label}</span>
        <span className="font-mono text-[12px] tabular-nums text-surface">
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className={cn("h-full rounded-full", accent ? "bg-accent" : "bg-surface/55")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-[10px] text-surface/35">{hint}</p>
    </div>
  );
}

function PullRuler({
  pullPx,
  qualified,
  busy,
}: {
  pullPx: number;
  qualified: boolean;
  busy: boolean;
}) {
  const height = 156;
  const fill = Math.min(1, pullPx / DEFAULT_MAX_PULL_PX) * height;
  const threshold = (DEFAULT_THRESHOLD_PX / DEFAULT_MAX_PULL_PX) * height;

  return (
    <div className="relative h-[156px] w-full">
      <div className="absolute inset-y-0 left-6 right-2 rounded-full bg-white/8" />
      <div
        className={cn(
          "absolute bottom-0 left-6 right-2 rounded-full",
          busy || qualified ? "bg-intent" : "bg-accent",
        )}
        style={{ height: `${fill}px` }}
      />
      <div
        className="absolute left-4 right-1 h-px bg-intent/80"
        style={{ bottom: `${threshold}px` }}
      />
      <div className="absolute left-0 top-0 font-mono text-[9px] text-surface/40">{DEFAULT_MAX_PULL_PX}</div>
      <div
        className="absolute left-0 font-mono text-[9px] text-intent"
        style={{ bottom: `${threshold - 5}px` }}
      >
        {DEFAULT_THRESHOLD_PX}
      </div>
      <div className="absolute bottom-0 left-0 font-mono text-[9px] text-surface/40">0</div>
    </div>
  );
}

function ThresholdTrack({
  pullPx,
  progress,
  qualified,
  busy,
  locale,
}: {
  pullPx: number;
  progress: number;
  qualified: boolean;
  busy: boolean;
  locale: ReturnType<typeof useLocale>;
}) {
  const marker = Math.min(100, (pullPx / DEFAULT_MAX_PULL_PX) * 100);
  const thresholdPct = (DEFAULT_THRESHOLD_PX / DEFAULT_MAX_PULL_PX) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-surface/50">
          {locale === "en" ? "Release rule" : "松手规则"}
        </span>
        <span
          className={cn(
            "font-mono text-[11px] font-semibold",
            busy ? "text-accent" : qualified ? "text-intent" : "text-surface/70",
          )}
        >
          {busy
            ? locale === "en"
              ? `Pinned · ${DEFAULT_THRESHOLD_PX}px`
              : `吸顶 · ${DEFAULT_THRESHOLD_PX}px`
            : qualified
              ? locale === "en"
                ? "Will refresh"
                : "松手刷新"
              : pullPx <= 0
                ? locale === "en"
                  ? "Waiting for a pull"
                  : "尚未拉动"
                : locale === "en"
                  ? `Will snap back · ${Math.round(progress * 100)}%`
                  : `未达线 · 将复位 ${Math.round(progress * 100)}%`}
        </span>
      </div>
      <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-white/8">
        <div
          className="absolute inset-y-0 left-0 bg-white/10"
          style={{ width: `${thresholdPct}%` }}
        />
        <div
          className="absolute inset-y-0 bg-intent/25"
          style={{ left: `${thresholdPct}%`, right: 0 }}
        />
        <div
          className={cn("absolute inset-y-0 w-1.5 rounded-full", busy || qualified ? "bg-intent" : "bg-accent")}
          style={{ left: `calc(${marker}% - 3px)` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-surface/35">
        <span>0</span>
        <span>
          {DEFAULT_THRESHOLD_PX} · {locale === "en" ? "commit" : "提交"}
        </span>
        <span>
          {DEFAULT_MAX_PULL_PX} · {locale === "en" ? "cap" : "上限"}
        </span>
      </div>
    </div>
  );
}

function SeekButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: string;
  onClick: () => void;
  disabled: boolean;
  active: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40",
        active ? "bg-white/12 text-surface" : "text-surface/55 hover:bg-white/8 hover:text-surface",
      )}
    >
      {children}
    </button>
  );
}
