import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, MoreHorizontal, Send, Smile } from "lucide-react";
import { pick, useLocale } from "./lib/site-locale";
import {
  calcClampedMenuPosition,
  calcHoldProgress,
  DEFAULT_DRIFT_TOLERANCE_PX,
  DEFAULT_HOLD_DELAY_MS,
  DEFAULT_MENU_HEIGHT,
  DEFAULT_MENU_WIDTH,
  shouldCancelHold,
} from "./lib/machines";
import { CONTEXT_ACTIONS, FORMULA_CARDS, PLAY_CHAT, type ChatMessage } from "./lib/kinds";
import { cn } from "./lib/utils";

type Verdict = "idle" | "holding" | "opened" | "cancelled" | "short";

type ActiveMenu = {
  msgId: string;
  x: number;
  y: number;
  flippedY: boolean;
  originX: number;
  originY: number;
};

const RADAR_R = 52;
const RADAR_C = 64;

export function StudyView() {
  const locale = useLocale();
  const [messages] = useState<ChatMessage[]>(PLAY_CHAT);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu | null>(null);
  const [lastPlacement, setLastPlacement] = useState<{
    flippedY: boolean;
    x: number;
    y: number;
  } | null>(null);

  const [holdDelayMs, setHoldDelayMs] = useState(DEFAULT_HOLD_DELAY_MS);
  const [driftTolerancePx, setDriftTolerancePx] = useState(DEFAULT_DRIFT_TOLERANCE_PX);

  const [telemetry, setTelemetry] = useState<{
    holdingMsgId: string | null;
    elapsedMs: number;
    progress: number;
    driftPx: number;
    cancelled: boolean;
    verdict: Verdict;
  }>({
    holdingMsgId: null,
    elapsedMs: 0,
    progress: 0,
    driftPx: 0,
    cancelled: false,
    verdict: "idle",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pressPoint, setPressPoint] = useState<{ x: number; y: number } | null>(null);
  const [fingerPoint, setFingerPoint] = useState<{ x: number; y: number } | null>(null);

  const holdState = useRef<{
    timerId: number;
    rafId: number;
    startTime: number;
    startX: number;
    startY: number;
    msgId: string;
  } | null>(null);

  const phoneBodyRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const scrimDrag = useRef<{ y: number; scrollTop: number } | null>(null);

  useEffect(() => {
    return () => {
      if (!holdState.current) return;
      window.clearTimeout(holdState.current.timerId);
      cancelAnimationFrame(holdState.current.rafId);
    };
  }, []);

  function clientToPhone(clientX: number, clientY: number) {
    const box = phoneBodyRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0 };
    return { x: clientX - box.left, y: clientY - box.top };
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2000);
  }

  function openMenuAt(msgId: string, clientX: number, clientY: number) {
    const container = phoneBodyRef.current;
    if (!container) return;
    const box = container.getBoundingClientRect();
    const relX = clientX - box.left;
    const relY = clientY - box.top;

    const verdict = calcClampedMenuPosition(
      relX,
      relY,
      DEFAULT_MENU_WIDTH,
      DEFAULT_MENU_HEIGHT,
      box.width,
      box.height,
      12,
    );

    const next: ActiveMenu = {
      msgId,
      x: verdict.x,
      y: verdict.y,
      flippedY: verdict.flippedY,
      originX: relX - verdict.x,
      originY: relY - verdict.y,
    };
    setActiveMenu(next);
    setLastPlacement({ flippedY: verdict.flippedY, x: verdict.x, y: verdict.y });
    setPressPoint({ x: relX, y: relY });
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>, msgId: string) {
    if (e.button !== 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = performance.now();
    const pointerId = e.pointerId;
    const target = e.currentTarget;
    const origin = clientToPhone(startX, startY);
    setPressPoint(origin);
    setFingerPoint(origin);

    try {
      target.setPointerCapture(pointerId);
    } catch {
      /* ignore */
    }

    function updateProgress() {
      if (!holdState.current) return;
      const elapsed = performance.now() - startTime;
      const prog = calcHoldProgress(elapsed, holdDelayMs);
      setTelemetry((prev) => ({
        ...prev,
        elapsedMs: Math.round(elapsed),
        progress: prog,
      }));
      if (elapsed < holdDelayMs) {
        holdState.current.rafId = requestAnimationFrame(updateProgress);
      }
    }

    const timer = window.setTimeout(() => {
      openMenuAt(msgId, startX, startY);
      try {
        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }
      } catch {
        /* ignore */
      }
      setTelemetry((prev) => ({
        ...prev,
        holdingMsgId: null,
        elapsedMs: holdDelayMs,
        progress: 1,
        cancelled: false,
        verdict: "opened",
      }));
      holdState.current = null;
    }, holdDelayMs);

    const raf = requestAnimationFrame(updateProgress);

    holdState.current = {
      timerId: timer,
      rafId: raf,
      startTime,
      startX,
      startY,
      msgId,
    };

    setTelemetry({
      holdingMsgId: msgId,
      elapsedMs: 0,
      progress: 0,
      driftPx: 0,
      cancelled: false,
      verdict: "holding",
    });
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const state = holdState.current;
    if (!state) return;

    setFingerPoint(clientToPhone(e.clientX, e.clientY));

    const drift = Math.hypot(e.clientX - state.startX, e.clientY - state.startY);
    const shouldCancel = shouldCancelHold(
      state.startX,
      state.startY,
      e.clientX,
      e.clientY,
      driftTolerancePx,
    );

    setTelemetry((prev) => ({
      ...prev,
      driftPx: Math.round(drift),
      cancelled: shouldCancel,
    }));

    if (shouldCancel) {
      window.clearTimeout(state.timerId);
      cancelAnimationFrame(state.rafId);
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
      holdState.current = null;
      setTelemetry((prev) => ({
        ...prev,
        holdingMsgId: null,
        cancelled: true,
        verdict: "cancelled",
      }));
    }
  }

  function handlePointerUp(e?: ReactPointerEvent<HTMLDivElement>) {
    const state = holdState.current;
    if (state) {
      window.clearTimeout(state.timerId);
      cancelAnimationFrame(state.rafId);
      holdState.current = null;
      setTelemetry((prev) => ({
        ...prev,
        holdingMsgId: null,
        verdict: prev.verdict === "holding" ? "short" : prev.verdict,
      }));
    } else {
      setTelemetry((prev) => ({
        ...prev,
        holdingMsgId: null,
      }));
    }
    if (e) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
    }
  }

  function handleActionClick(actionLabel: string) {
    setActiveMenu(null);
    showToast(locale === "en" ? `Executed: ${actionLabel}` : `已执行：${actionLabel}`);
  }

  const driftOver = telemetry.driftPx > driftTolerancePx;
  const placement = activeMenu ?? lastPlacement;
  const holding = Boolean(telemetry.holdingMsgId);

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Does this hold open a nearby menu, or yield to scroll?"
              : "长按这一下，是弹出就近菜单，还是让路给滚动？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Hold in place ~460ms with drift ≤ 10px to open. Excess movement kills the timer so the feed can scroll. The menu hugs the touch and flips at the viewport edge."
              : "原地按住约 460ms 且位移 ≤ 10px 才触发；位移超标立刻销毁定时器，让路给滚动；菜单贴触控点，探出底边就向上翻转。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Press a bubble and wait. Then try the same press while sliding. Watch the 460ms charge, the 10px deadband, and whether the menu flips."
            : "先按住一条气泡等满门槛，再按住后滑开对照。看 460ms 蓄力、10px 容差环，以及菜单贴附还是翻转。"}
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2/50 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            {(
              [
                ["short", locale === "en" ? "Short tap" : "短触未满"],
                ["holding", locale === "en" ? "Charging" : "蓄力中"],
                ["opened", locale === "en" ? "Opened nearby" : "就近展开"],
                ["cancelled", locale === "en" ? "Yielded to scroll" : "让路滚动"],
              ] as const
            ).map(([key, label]) => {
              const on = telemetry.verdict === key;
              return (
                <span
                  key={key}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 font-medium transition-colors",
                    on && key === "holding" && "border-accent/40 bg-accent-soft text-accent",
                    on && key === "opened" && "border-intent/40 bg-intent-soft text-intent",
                    on && key === "cancelled" && "border-wrong/40 bg-wrong-soft text-wrong",
                    on && key === "short" && "border-border-strong bg-surface-2 text-fg",
                    !on && "border-border bg-surface text-fg-subtle",
                  )}
                >
                  {label}
                </span>
              );
            })}
          </div>
          <p className="font-mono text-[11px] text-fg-subtle">
            {holdDelayMs}ms · {driftTolerancePx}px
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[340px] rounded-[36px] border-4 border-fg/15 bg-surface p-3 shadow-card">
              <div className="absolute top-2 left-1/2 z-30 h-3.5 w-24 -translate-x-1/2 rounded-full bg-fg/10" />

              <div
                ref={phoneBodyRef}
                onWheel={(e) => {
                  if (activeMenu) {
                    setActiveMenu(null);
                    if (feedRef.current) feedRef.current.scrollTop += e.deltaY;
                  }
                }}
                className="relative flex h-[520px] flex-col overflow-hidden rounded-[26px] border border-border/60 bg-surface-2"
              >
                <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium text-fg-muted">
                  <span className="tabular-nums">9:41</span>
                  <span className="text-[10px]">5G · 100%</span>
                </div>

                <div className="flex items-center justify-between border-b border-border/60 bg-surface px-4 py-2">
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="size-4 text-accent" />
                    <div>
                      <h3 className="text-xs font-semibold text-fg">
                        {locale === "en" ? "Lin · mobile" : "林工 (移动交互组)"}
                      </h3>
                      <span className="text-[10px] text-fg-subtle">
                        {locale === "en" ? "Online" : "在线 · 正在输入..."}
                      </span>
                    </div>
                  </div>
                  <MoreHorizontal className="size-4 text-fg-muted" />
                </div>

                <div
                  ref={feedRef}
                  onScroll={() => {
                    if (activeMenu) setActiveMenu(null);
                  }}
                  className="flex-1 space-y-3.5 overflow-y-auto p-4 [touch-action:pan-y]"
                >
                  {messages.map((msg) => {
                    const isMe = msg.sender === "me";
                    const isHolding = telemetry.holdingMsgId === msg.id;
                    const isMenuActive = activeMenu?.msgId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={cn("flex flex-col", isMe ? "items-end" : "items-start", isMenuActive && "relative z-35")}
                      >
                        <span className="mb-0.5 px-1 text-[10px] text-fg-subtle">{msg.senderName}</span>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={
                            locale === "en"
                              ? `Hold ${msg.senderName}: ${msg.text}`
                              : `长按 ${msg.senderName}：${msg.text}`
                          }
                          onPointerDown={(e) => handlePointerDown(e, msg.id)}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            openMenuAt(msg.id, e.clientX, e.clientY);
                            setTelemetry((prev) => ({ ...prev, verdict: "opened", progress: 1, cancelled: false }));
                          }}
                          className={cn(
                            "relative max-w-[82%] cursor-pointer select-none rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed transition-[transform,box-shadow] duration-150",
                            isMe
                              ? "rounded-br-xs bg-accent text-accent-fg shadow-xs"
                              : "rounded-bl-xs border border-border/70 bg-surface text-fg shadow-xs",
                            isHolding && "scale-[0.98]",
                            isMenuActive && "z-35 scale-[0.98] shadow-menu ring-2 ring-accent/45",
                          )}
                        >
                          {msg.text}
                          {isHolding && <HoldArc progress={telemetry.progress} mine={isMe} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {holding && pressPoint && (
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div
                      className={cn(
                        "absolute rounded-full border",
                        driftOver ? "border-wrong/70 bg-wrong/10" : "border-accent/55 bg-accent/10",
                      )}
                      style={{
                        left: pressPoint.x - driftTolerancePx,
                        top: pressPoint.y - driftTolerancePx,
                        width: driftTolerancePx * 2,
                        height: driftTolerancePx * 2,
                      }}
                    />
                    {fingerPoint && (
                      <div
                        className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
                        style={{ left: fingerPoint.x, top: fingerPoint.y }}
                      />
                    )}
                  </div>
                )}

                {activeMenu && (
                  <div
                    onClick={() => setActiveMenu(null)}
                    onWheel={(e) => {
                      e.stopPropagation();
                      setActiveMenu(null);
                      if (feedRef.current) feedRef.current.scrollTop += e.deltaY;
                    }}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      if (touch) {
                        scrimDrag.current = {
                          y: touch.clientY,
                          scrollTop: feedRef.current?.scrollTop ?? 0,
                        };
                      }
                    }}
                    onTouchMove={(e) => {
                      const touch = e.touches[0];
                      if (touch && scrimDrag.current) {
                        const dy = touch.clientY - scrimDrag.current.y;
                        if (Math.abs(dy) > 4) {
                          setActiveMenu(null);
                          if (feedRef.current) {
                            feedRef.current.scrollTop = scrimDrag.current.scrollTop - dy;
                          }
                        }
                      } else {
                        setActiveMenu(null);
                      }
                    }}
                    onPointerDown={(e) => {
                      scrimDrag.current = {
                        y: e.clientY,
                        scrollTop: feedRef.current?.scrollTop ?? 0,
                      };
                    }}
                    onPointerMove={(e) => {
                      if (e.buttons > 0 && scrimDrag.current) {
                        const dy = e.clientY - scrimDrag.current.y;
                        if (Math.abs(dy) > 4) {
                          setActiveMenu(null);
                          if (feedRef.current) {
                            feedRef.current.scrollTop = scrimDrag.current.scrollTop - dy;
                          }
                        }
                      }
                    }}
                    className="tc-scrim absolute inset-0 z-30 bg-fg/15"
                  />
                )}

                {activeMenu && pressPoint && (
                  <svg className="pointer-events-none absolute inset-0 z-35 h-full w-full" aria-hidden>
                    <line
                      x1={pressPoint.x}
                      y1={pressPoint.y}
                      x2={activeMenu.x + 22}
                      y2={activeMenu.flippedY ? activeMenu.y + DEFAULT_MENU_HEIGHT : activeMenu.y}
                      className="stroke-accent/45"
                      strokeDasharray="3 4"
                      strokeWidth="1.25"
                    />
                    <circle cx={pressPoint.x} cy={pressPoint.y} r="3.5" className="fill-accent" />
                  </svg>
                )}

                {activeMenu && (
                  <div
                    className="tc-menu absolute z-40 w-[152px] overflow-hidden rounded-2xl border border-border bg-surface shadow-menu"
                    style={{
                      left: activeMenu.x,
                      top: activeMenu.y,
                      ["--tc-ox" as string]: `${activeMenu.originX}px`,
                      ["--tc-oy" as string]: `${activeMenu.originY}px`,
                      ["--tc-from-y" as string]: activeMenu.flippedY ? "-10px" : "10px",
                    }}
                  >
                    {CONTEXT_ACTIONS.slice(0, 3).map((act, i) => {
                      const Icon = act.icon;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleActionClick(pick(act.label, locale))}
                          style={{ ["--tc-i" as string]: i }}
                          className="tc-item flex w-full items-center justify-between border-b border-border/60 px-3.5 py-2.5 text-xs font-medium text-fg last:border-b-0 hover:bg-surface-2 active:bg-accent-soft active:text-accent"
                        >
                          <span>{pick(act.label, locale)}</span>
                          <Icon className="size-3.5 text-fg-muted" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {toastMessage && (
                  <div className="absolute right-6 bottom-14 left-6 z-50 rounded-xl bg-fg/95 px-3 py-2 text-center text-xs font-medium text-bg shadow-card">
                    {toastMessage}
                  </div>
                )}

                <div className="flex items-center gap-2 border-t border-border bg-surface p-3">
                  <Smile className="size-4 text-fg-muted" />
                  <div className="flex-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-fg-subtle">
                    {locale === "en" ? "Hold a bubble…" : "长按气泡试一手..."}
                  </div>
                  <div className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-fg">
                    <Send className="size-3.5" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 max-w-xs text-center text-xs text-fg-subtle">
              {locale === "en"
                ? "Last bubbles sit near the composer so a hold there flips upward."
                : "靠底的气泡用来看翻转；按住后滑开则立刻让路滚动。"}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Instrument
              label={locale === "en" ? "Hold charge · 460ms gate" : "长按蓄力 · 460ms 门限"}
              value={`${telemetry.elapsedMs}ms`}
              hint={
                locale === "en"
                  ? `Short tap stays a tap. Menu only after ${holdDelayMs}ms.`
                  : `短触仍是点击。满 ${holdDelayMs}ms 才就近展开。`
              }
            >
              <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    telemetry.verdict === "cancelled" ? "bg-wrong/70" : "bg-accent",
                    holding ? "" : "transition-[width] duration-200",
                  )}
                  style={{ width: `${Math.round(telemetry.progress * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] text-fg-subtle">
                <span>0</span>
                <span className="text-accent">{holdDelayMs}ms</span>
                <span>{Math.round(telemetry.progress * 100)}%</span>
              </div>
            </Instrument>

            <Instrument
              label={locale === "en" ? "Drift deadband · 10px" : "位移容差 · 10px"}
              value={`${telemetry.driftPx} / ${driftTolerancePx}px`}
              hint={
                locale === "en"
                  ? "Circle is actual size on the phone. Radar is magnified."
                  : "手机里的环是真实 10px；右侧雷达按比例放大。"
              }
              danger={driftOver}
            >
              <div className="mt-3 flex items-center gap-4">
                <DriftRadar driftPx={telemetry.driftPx} tolerancePx={driftTolerancePx} over={driftOver} />
                <div className="min-w-0 space-y-1.5 text-[12px] leading-relaxed text-fg-muted">
                  <p>
                    {locale === "en"
                      ? "Tremor inside the ring keeps charging."
                      : "环内颤动继续蓄力。"}
                  </p>
                  <p className={driftOver ? "font-medium text-wrong" : undefined}>
                    {locale === "en"
                      ? "Outside the ring: timer dies, scroll wins."
                      : "越出圆环：定时器销毁，滚动接管。"}
                  </p>
                </div>
              </div>
            </Instrument>

            <Instrument
              label={locale === "en" ? "Nearby placement" : "就近定位"}
              value={
                placement
                  ? placement.flippedY
                    ? locale === "en"
                      ? "Flipped ↑"
                      : "翻转 ↑"
                    : locale === "en"
                      ? "Attached ↓"
                      : "贴附 ↓"
                  : "—"
              }
              hint={
                locale === "en"
                  ? "Clamped in padding. Bottom overflow flips above the touch."
                  : "横向夹在 padding 内；探出底边则翻到触点上方。"
              }
            >
              <PlacementMap
                menu={placement}
                press={pressPoint}
                locale={locale}
              />
            </Instrument>

            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <p className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
                {locale === "en" ? "Compare thresholds" : "对照门槛"}
              </p>
              <p className="mt-2 text-[12px] font-medium text-fg">
                {locale === "en" ? "Hold delay" : "长按时间"}
              </p>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {[
                  { ms: 250, zh: "250 易误触", en: "250 easy miss" },
                  { ms: 460, zh: "460 推荐", en: "460 recommended" },
                  { ms: 800, zh: "800 偏钝", en: "800 sluggish" },
                ].map((item) => (
                  <button
                    key={item.ms}
                    type="button"
                    onClick={() => setHoldDelayMs(item.ms)}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-left text-[11px] font-medium transition-colors",
                      holdDelayMs === item.ms
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface text-fg-muted hover:text-fg",
                    )}
                  >
                    {locale === "en" ? item.en : item.zh}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] font-medium text-fg">
                {locale === "en" ? "Drift tolerance" : "位移容差"}
              </p>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {[
                  { px: 4, zh: "4 太紧", en: "4 too tight" },
                  { px: 10, zh: "10 推荐", en: "10 recommended" },
                  { px: 24, zh: "24 易吞滑", en: "24 steals scroll" },
                ].map((item) => (
                  <button
                    key={item.px}
                    type="button"
                    onClick={() => setDriftTolerancePx(item.px)}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-left text-[11px] font-medium transition-colors",
                      driftTolerancePx === item.px
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface text-fg-muted hover:text-fg",
                    )}
                  >
                    {locale === "en" ? item.en : item.zh}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {FORMULA_CARDS.map((item) => (
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
            {locale === "en" ? "How to tell the outcomes apart" : "怎么把三种结果分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. A context menu is not multi-select" : "1. 就近菜单不是长按多选"}
              </span>
              <br />
              {locale === "en"
                ? "Copy / reply / forward stay on this bubble. The page mode does not change."
                : "复制、回复、转发停在这一条上。页面不会切进带复选框的批处理态。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Drift cancel is not a failed hold" : "2. 位移注销不是长按失败"}
              </span>
              <br />
              {locale === "en"
                ? "Leaving the 10px ring is a successful yield to scroll, not a broken gesture."
                : "越出 10px 环是成功把滚动交回去，不是手势坏了。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Nearby is not a centered modal" : "3. 就近贴附不是居中弹窗"}
              </span>
              <br />
              {locale === "en"
                ? "The menu grows from the touch. If the bottom overflows, it flips up and stays fully on screen."
                : "菜单从触点长出来。探出底边就向上翻，始终完整可见。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            holdDisambiguation
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`hold = 460
deadband = 10

progress = min(1, elapsed / hold)
cancel = hypot(dx, dy) > deadband

if (cancel) clearTimeout(timer)  // scroll wins
if (elapsed >= hold) placeNear(touch)`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Clamp X in padding. If Y + height overflows, flip above the touch."
              : "横向在 padding 内夹紧。纵向若探出底边，翻到触点上方。"}
          </p>
        </article>
      </section>
    </div>
  );
}

function Instrument({
  label,
  value,
  hint,
  danger,
  children,
}: {
  label: string;
  value: string;
  hint: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">{label}</p>
        <p className={cn("font-mono text-[12px] font-semibold tabular-nums", danger ? "text-wrong" : "text-fg")}>
          {value}
        </p>
      </div>
      {children}
      <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">{hint}</p>
    </div>
  );
}

function HoldArc({ progress, mine }: { progress: number; mine: boolean }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, progress));
  return (
    <svg
      className="pointer-events-none absolute top-1.5 right-1.5 size-4"
      viewBox="0 0 20 20"
      aria-hidden
    >
      <circle cx="10" cy="10" r={r} className={mine ? "stroke-white/25" : "stroke-border-strong"} fill="none" strokeWidth="2" />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        strokeWidth="2"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={mine ? "stroke-white" : "stroke-accent"}
        transform="rotate(-90 10 10)"
      />
    </svg>
  );
}

function DriftRadar({
  driftPx,
  tolerancePx,
  over,
}: {
  driftPx: number;
  tolerancePx: number;
  over: boolean;
}) {
  const fillR = Math.min(RADAR_R * 1.28, (driftPx / Math.max(tolerancePx, 1)) * RADAR_R);
  return (
    <svg viewBox="0 0 128 128" className="size-[7.25rem] shrink-0" aria-hidden>
      <circle cx={RADAR_C} cy={RADAR_C} r={RADAR_R} className="fill-accent-soft stroke-accent/35" strokeWidth="1.25" />
      <circle
        cx={RADAR_C}
        cy={RADAR_C}
        r={Math.max(2, fillR)}
        className={over ? "fill-wrong/35" : "fill-accent/30"}
      />
      <circle cx={RADAR_C} cy={RADAR_C} r="2.5" className="fill-fg" />
      <text x={RADAR_C} y="122" textAnchor="middle" className="fill-fg-subtle" fontSize="9" fontFamily="var(--font-mono)">
        {tolerancePx}px
      </text>
    </svg>
  );
}

function PlacementMap({
  menu,
  press,
  locale,
}: {
  menu: { x: number; y: number; flippedY: boolean } | null;
  press: { x: number; y: number } | null;
  locale: "zh" | "en";
}) {
  const W = 168;
  const H = 118;
  const sx = W / 340;
  const sy = H / 520;
  const mx = menu ? menu.x * sx : 0;
  const my = menu ? menu.y * sy : 0;
  const mw = DEFAULT_MENU_WIDTH * sx;
  const mh = DEFAULT_MENU_HEIGHT * sy;
  const px = press ? press.x * sx : W * 0.45;
  const py = press ? press.y * sy : H * 0.42;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[118px] w-full" aria-hidden>
        <rect width={W} height={H} className="fill-surface-2" />
        {menu && (
          <rect
            x={mx}
            y={my}
            width={mw}
            height={mh}
            rx="4"
            className="fill-surface stroke-accent/70"
            strokeWidth="1.25"
          />
        )}
        {press && menu && (
          <line
            x1={px}
            y1={py}
            x2={mx + mw / 2}
            y2={menu.flippedY ? my + mh : my}
            className="stroke-accent/40"
            strokeDasharray="2 3"
          />
        )}
        <circle cx={px} cy={py} r="3" className={press ? "fill-accent" : "fill-fg-subtle"} />
      </svg>
      <p className="border-t border-border px-2.5 py-1.5 font-mono text-[10px] text-fg-subtle">
        {menu
          ? `${menu.flippedY ? (locale === "en" ? "flip" : "翻转") : locale === "en" ? "attach" : "贴附"}  ·  ${Math.round(menu.x)},${Math.round(menu.y)}`
          : locale === "en"
            ? "Hold near the composer to see a flip"
            : "按住底边气泡看翻转"}
      </p>
    </div>
  );
}
