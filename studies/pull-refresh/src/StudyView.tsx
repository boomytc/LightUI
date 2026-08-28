import { useState, useRef } from "react";
import { RefreshCw, ArrowDown, Check, Sparkles, RotateCcw } from "lucide-react";
import { REFRESH_FORMULAS, type RefreshPhase } from "./lib/kinds";
import {
  shouldTakeoverScroll,
  calculatePull,
  isThresholdMet,
  pullProgress,
  resolvePointerRelease,
  DEFAULT_THRESHOLD_PX,
} from "./lib/machines";
import { pick, useLocale } from "./lib/site-locale";
import { cn, INITIAL_NEWS, FRESH_NEWS_ITEM, type NewsItem } from "./lib/utils";

export function StudyView() {
  const locale = useLocale();

  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [phase, setPhase] = useState<RefreshPhase>("idle");
  const [pullPx, setPullPx] = useState<number>(0);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [rawDy, setRawDy] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);

  function handlePointerDown(e: React.PointerEvent) {
    const el = containerRef.current;
    if (!el || !shouldTakeoverScroll(el.scrollTop, 1, phase === "refreshing")) return;

    isPullingRef.current = true;
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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

    const verdict = resolvePointerRelease(pullPx);
    if (verdict.shouldRefresh) {
      setPhase("refreshing");
      setPullPx(verdict.targetHeight);

      // Simulate network request
      window.setTimeout(() => {
        setNews((prev) => (prev.some((item) => item.id === FRESH_NEWS_ITEM.id) ? prev : [FRESH_NEWS_ITEM, ...prev]));
        setPhase("settled");
        setBannerMsg(locale === "en" ? "Fetched 1 new update" : "已拉取 1 条最新资讯");
        setPullPx(0);

        window.setTimeout(() => {
          setPhase("idle");
          setBannerMsg(null);
        }, 1800);
      }, 900);
    } else {
      setPhase("idle");
      setPullPx(0);
      setRawDy(0);
    }
  }

  function resetNews() {
    setNews(INITIAL_NEWS);
    setPhase("idle");
    setPullPx(0);
    setRawDy(0);
    setBannerMsg(null);
  }

  const progress = pullProgress(pullPx);
  const isQualified = isThresholdMet(pullPx);

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "When does a downward pull take over scroll, and when does it commit a refresh?"
              : "下拉手势何时接管滚动、何时提交刷新？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Take over only at top boundary and moving down; apply physical damping dy × 0.42; release beyond 56px to commit and pin, snap back cleanly otherwise."
              : "顶边且向下才接管；位移应用阻尼并设上限；松手超阈值才提交刷新，未达阈值弹性复位。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Pull down the phone list below. Watch how the damping curve scales resistance before hitting the 56px release threshold."
            : "在下方手机列表中向下拖拽。观察 0.42 阻尼物理手感与 56px 临界阈值判定。"}
        </p>
      </section>

      {/* Main Interactive Stage */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Top telemetry bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted/40 px-5 py-3.5 text-[12px]">
          <div className="flex items-center gap-3">
            <span className="font-medium text-fg-muted">
              {locale === "en" ? "Gesture Phase:" : "手势相位:"}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-0.5 font-mono font-semibold",
                phase === "ready"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : phase === "refreshing"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : phase === "pulling"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : "bg-surface text-fg-muted border border-border",
              )}
            >
              "{phase}"
            </span>
          </div>

          <div className="flex items-center gap-4 text-fg-muted">
            <button
              type="button"
              onClick={resetNews}
              className="inline-flex items-center gap-1 text-fg-muted hover:text-fg text-[12px]"
            >
              <RotateCcw className="size-3.5" />
              {locale === "en" ? "Reset Feed" : "重置列表"}
            </button>
          </div>
        </div>

        {/* Dual Frame Playground */}
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Mobile Phone Simulator */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[340px] rounded-[36px] border-4 border-fg/20 bg-surface p-3 shadow-2xl">
              {/* Phone Header */}
              <div className="flex items-center justify-between px-3 pt-2 pb-2">
                <span className="text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
                  {locale === "en" ? "Feed" : "最新动态"}
                </span>
                <h3 className="text-[14px] font-semibold text-fg">
                  {locale === "en" ? "Live Updates" : "资讯中心"}
                </h3>
                <span className="w-8" />
              </div>

              {/* Scrollable Container with Pull Header */}
              <div className="relative overflow-hidden rounded-2xl bg-surface-muted/30">
                {/* Floating banner on success */}
                {bannerMsg && (
                  <div className="absolute inset-x-3 top-2 z-10 flex items-center justify-center gap-1.5 rounded-full bg-fg px-3 py-1.5 text-[11px] font-medium text-surface shadow-float animate-in fade-in slide-in-from-top-2">
                    <Check className="size-3 text-emerald-300" />
                    <span>{bannerMsg}</span>
                  </div>
                )}

                <div
                  ref={containerRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="relative h-[360px] overflow-y-auto px-3 pb-3 select-none touch-none cursor-grab active:cursor-grabbing"
                >
                  {/* Pull Indicator Area */}
                  <div
                    className="flex items-center justify-center overflow-hidden transition-[height] duration-75 text-[12px]"
                    style={{ height: `${pullPx}px` }}
                  >
                    <div className="flex items-center gap-2 text-fg-muted font-medium">
                      {phase === "refreshing" ? (
                        <>
                          <RefreshCw className="size-4 animate-spin text-accent" />
                          <span className="text-accent">{locale === "en" ? "Fetching..." : "正在获取..."}</span>
                        </>
                      ) : isQualified ? (
                        <>
                          <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {locale === "en" ? "Release to Refresh" : "松手立即刷新"}
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDown
                            className="size-4 transition-transform text-fg-muted"
                            style={{ transform: `rotate(${progress * 180}deg)` }}
                          />
                          <span>{locale === "en" ? "Pull down" : "继续下拉"}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* News list */}
                  <div className="space-y-2.5 pt-1">
                    {news.map((item) => (
                      <article
                        key={item.id}
                        className={cn(
                          "rounded-xl border border-border bg-surface p-3.5 transition-all",
                          item.fresh && "border-accent/40 bg-accent/5 ring-1 ring-accent/30",
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-[13px] font-semibold text-fg">{item.title}</h4>
                          <span className="shrink-0 text-[11px] font-mono text-fg-subtle">{item.time}</span>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{item.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-[11px] text-fg-subtle">
                {locale === "en"
                  ? "Drag downward to experience 0.42 damping & 56px threshold"
                  : "按住向下拖动体验 0.42 物理阻尼与 56px 临界阈值"}
              </p>
            </div>
          </div>

          {/* Telemetry Log & Physics Telemetry */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-muted/40 p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                {locale === "en" ? "Physical Damping & Threshold Telemetry" : "物理阻尼与临界阈值侦测"}
              </p>

              <div className="mt-4 space-y-2.5 font-mono text-[12px]">
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">raw_finger_dy</span>
                  <span className="font-semibold text-fg">{rawDy} px</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">dampened_pull_y (dy * 0.42)</span>
                  <span className="font-semibold text-accent">{pullPx} px</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">threshold_target</span>
                  <span className="font-semibold text-fg">{DEFAULT_THRESHOLD_PX} px</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="text-fg-muted">qualification</span>
                  <span
                    className={cn(
                      "font-semibold",
                      isQualified ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-fg-muted",
                    )}
                  >
                    {isQualified ? "QUALIFIED (>= 56px)" : `${Math.round(progress * 100)}% (Pull more)`}
                  </span>
                </div>
              </div>

              {/* Damping progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-fg-muted mb-1.5">
                  <span>{locale === "en" ? "Spring Tension:" : "弹簧拉力张度:"}</span>
                  <span className="font-mono">{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface border border-border">
                  <div
                    className={cn(
                      "h-full transition-all duration-75",
                      isQualified ? "bg-emerald-500" : "bg-accent",
                    )}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-fg-muted">
              {locale === "en"
                ? "Physical damping simulates elastic resistance. Releasing before 56px snaps back seamlessly without firing API requests."
                : "阻尼系数赋予列表弹簧般的受力质感。56px 临界门限确保未达标松手时无感复位，不产生无效网络请求。"}
            </p>
          </div>
        </div>
      </div>

      {/* Formula Cards */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {REFRESH_FORMULAS.map((item) => (
          <div key={item.id} className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
                {pick(item.eyebrow, locale)}
              </p>
              <h3 className="mt-1 text-[14px] font-semibold text-fg">{pick(item.title, locale)}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">{pick(item.desc, locale)}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Distinctions */}
      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "Boundary Guards & Settle Mechanics" : "边界防护与收起时序"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Guard against midway interception" : "1. 严格限制半腰不拦截"}
              </span>
              <br />
              {locale === "en"
                ? "If scrollTop > 0, scrolling up must be native. Only take over when resting exactly at scrollTop === 0."
                : "当容器不在顶部时，向上回滚必须保持原生体验；仅在 scrollTop === 0 且继续下拉时才接管手势。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Settle feedback before collapse" : "2. 数据就绪后给与明确反馈"}
              </span>
              <br />
              {locale === "en"
                ? "Do not slam shut instantly. Slide down a brief summary banner so the user acknowledges the new content."
                : "数据到达后不要瞬间闪关；滑出简短提示告知抓取结果，短暂停留后再平滑收回。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            Damping & Release Formula
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`if (scrollTop <= 0 && dy > 0) {
  pull = Math.min(120, dy * 0.42); // 阻尼
}

onPointerUp = () => {
  if (pull >= 56) {
    pinAt(56);
    fetchData(); // 提交刷新
  } else {
    snapBack(0); // 弹性复位
  }
};`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Damping curve prevents abrupt motion; threshold eliminates false positives."
              : "阻尼曲线防止突兀拉扯；阈值判定消除误触。"}
          </p>
        </article>
      </section>
    </div>
  );
}
