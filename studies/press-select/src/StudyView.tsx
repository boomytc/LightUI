import { useEffect, useRef, useState } from "react";
import { SELECTION_FORMULAS, type SelectionMode } from "./lib/kinds";
import {
  DRIFT_TOLERANCE_PX,
  PRESS_HOLD_DELAY_MS,
  clearSelection,
  gestureVerdict,
  selectAll,
  shouldCancelHold,
  toggleSelection,
  type GestureVerdict,
} from "./lib/machines";
import { pick, useLocale } from "./lib/site-locale";
import { cn, SAMPLE_FILES } from "./lib/utils";
import { FilesPhone } from "./press/FilesPhone";

type ArmedKind = "hold" | "tap";

export function StudyView() {
  const locale = useLocale();

  const [mode, setMode] = useState<SelectionMode>("normal");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openFileId, setOpenFileId] = useState<string | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  const [driftPx, setDriftPx] = useState(0);
  const [driftVec, setDriftVec] = useState({ x: 0, y: 0 });
  const [heldMs, setHeldMs] = useState(0);
  const [lastVerdict, setLastVerdict] = useState<GestureVerdict | null>(null);
  const [scrollFlash, setScrollFlash] = useState(false);

  const startCoord = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const pressStartTime = useRef(0);
  const armedRef = useRef<{ kind: ArmedKind; fileId: string } | null>(null);
  const cancelledRef = useRef(false);
  const driftRef = useRef({ dx: 0, dy: 0, dist: 0 });
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const liveVerdict: GestureVerdict =
    pressingId && !cancelledRef.current
      ? gestureVerdict(heldMs, driftPx * driftPx, false)
      : lastVerdict === "pending"
        ? "pending"
        : lastVerdict ?? "pending";

  function stopTimers() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timerRef.current = null;
    rafRef.current = null;
  }

  function resetPressVisual() {
    setPressingId(null);
    setPressProgress(0);
    setDriftPx(0);
    setDriftVec({ x: 0, y: 0 });
    setHeldMs(0);
    startCoord.current = null;
    armedRef.current = null;
    driftRef.current = { dx: 0, dy: 0, dist: 0 };
  }

  function flashScroll() {
    setLastVerdict("scroll");
    setScrollFlash(true);
    window.setTimeout(() => setScrollFlash(false), 1400);
  }

  function exitSelect() {
    setMode("normal");
    setSelectedIds(clearSelection());
    setLastVerdict(null);
  }

  function handleRowPointerDown(event: React.PointerEvent, fileId: string) {
    if (event.button !== 0) return;
    if (openFileId) return;

    cancelledRef.current = false;
    startCoord.current = { x: event.clientX, y: event.clientY };
    pressStartTime.current = performance.now();
    setPressingId(fileId);
    setPressProgress(0);
    setDriftPx(0);
    setDriftVec({ x: 0, y: 0 });
    setHeldMs(0);
    setOpenFileId(null);
    driftRef.current = { dx: 0, dy: 0, dist: 0 };

    if (modeRef.current === "selecting") {
      armedRef.current = { kind: "tap", fileId };
      return;
    }

    armedRef.current = { kind: "hold", fileId };

    const tick = () => {
      const elapsed = performance.now() - pressStartTime.current;
      setHeldMs(elapsed);
      setPressProgress(Math.min(1, elapsed / PRESS_HOLD_DELAY_MS));
      if (elapsed < PRESS_HOLD_DELAY_MS && armedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = window.setTimeout(() => {
      if (cancelledRef.current || armedRef.current?.fileId !== fileId) return;
      stopTimers();
      armedRef.current = null;
      setMode("selecting");
      setSelectedIds([fileId]);
      setLastVerdict("select");
      resetPressVisual();
    }, PRESS_HOLD_DELAY_MS);
  }

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!armedRef.current || !startCoord.current) return;
      const dx = event.clientX - startCoord.current.x;
      const dy = event.clientY - startCoord.current.y;
      const dist = Math.hypot(dx, dy);
      driftRef.current = { dx, dy, dist };
      setDriftPx(dist);
      setDriftVec({ x: dx, y: dy });
      setHeldMs(performance.now() - pressStartTime.current);

      if (!shouldCancelHold(dx, dy)) return;

      cancelledRef.current = true;
      stopTimers();
      flashScroll();
      resetPressVisual();
    }

    function onUp() {
      const armed = armedRef.current;
      if (!armed) return;

      const elapsed = performance.now() - pressStartTime.current;
      const { dist } = driftRef.current;
      const verdict = gestureVerdict(elapsed, dist * dist, true);

      if (armed.kind === "tap") {
        if (!cancelledRef.current) {
          setSelectedIds((prev) => toggleSelection(prev, armed.fileId));
        }
        stopTimers();
        resetPressVisual();
        return;
      }

      stopTimers();
      if (cancelledRef.current) {
        resetPressVisual();
        return;
      }

      if (verdict === "open") {
        setOpenFileId(armed.fileId);
        setLastVerdict("open");
      } else if (verdict === "select") {
        setMode("selecting");
        setSelectedIds([armed.fileId]);
        setLastVerdict("select");
      }
      resetPressVisual();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  useEffect(() => {
    return () => stopTimers();
  }, []);

  const driftRatio = Math.min(1, driftPx / DRIFT_TOLERANCE_PX);
  const overDrift = driftPx > DRIFT_TOLERANCE_PX;
  const highlighted = pressingId ? liveVerdict : lastVerdict;

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-5 pb-6 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-12 lg:pb-8 lg:pt-6">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.4rem]">
            {locale === "en"
              ? "Does this press open the item, or activate multi-select?"
              : "列表中这一按，是直接打开还是激活批量选择？"}
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Tap opens. Hold still past 480ms to enter select. Slide past 8px and the hold dies — the list scrolls."
              : "单击打开；按住满 480ms 且位移在容差内进入多选；滑动超出 8px 立刻注销长按，交给滚动。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Press a row on the phone. The three lamps beside it follow the finger: open, select, or scroll."
            : "在手机里按一行。旁边三盏灯跟着手指走：打开、进入选择、还是滚动。"}
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2/70 px-5 py-3 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-fg-muted">{locale === "en" ? "Mode" : "模式"}</span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold",
                mode === "selecting"
                  ? "border-accent/30 bg-accent-soft text-accent"
                  : "border-border bg-surface text-fg-muted",
              )}
            >
              {mode === "selecting"
                ? locale === "en"
                  ? "selecting"
                  : "selecting · 多选"
                : locale === "en"
                  ? "browsing"
                  : "browsing · 浏览"}
            </span>
          </div>
          {mode === "selecting" && (
            <button type="button" onClick={exitSelect} className="text-[12px] font-medium text-accent">
              {locale === "en" ? "Exit select" : "退出选择"}
            </button>
          )}
        </div>

        <div className="grid gap-8 p-5 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-start md:p-7">
          <div className="ps-stage flex flex-col items-center justify-center rounded-2xl px-2 py-6 sm:py-8">
            <FilesPhone
              locale={locale}
              mode={mode}
              files={SAMPLE_FILES}
              selectedIds={selectedIds}
              pressingId={pressingId}
              pressProgress={pressProgress}
              openFileId={openFileId}
              lastVerdict={lastVerdict}
              scrollFlash={scrollFlash}
              interactive
              onRowPointerDown={handleRowPointerDown}
              onExitSelect={exitSelect}
              onSelectAll={() => setSelectedIds(selectAll(SAMPLE_FILES.map((file) => file.id)))}
              onCloseDetail={() => setOpenFileId(null)}
            />
          </div>

          <div className="min-w-0 space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {SELECTION_FORMULAS.map((item) => {
                const active =
                  highlighted === item.id ||
                  Boolean(pressingId && item.id === "select" && liveVerdict === "pending");
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "ps-outcome rounded-2xl border px-3 py-3 text-left transition-colors",
                      active ? outcomeActiveClass(item.id) : "border-border bg-surface-2/60",
                    )}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-fg-subtle">
                      {pick(item.eyebrow, locale)}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold tracking-tight text-fg">
                      {pick(item.title, locale)}
                    </p>
                    {active && lastVerdict === item.id && !pressingId && (
                      <p className="mt-1 text-[11px] font-medium">
                        {locale === "en" ? "Last result" : "刚才的结果"}
                      </p>
                    )}
                    {pressingId && item.id === "select" && liveVerdict === "pending" && (
                      <p className="mt-1 text-[11px] text-fg-muted">
                        {locale === "en" ? "Holding…" : "按住中…"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border bg-surface-2/50 p-4">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-fg-subtle uppercase">
                {locale === "en" ? "Live meters · same machine" : "实时门限 · 同一台机器"}
              </p>

              <div className="mt-3 space-y-3">
                <Meter
                  label={locale === "en" ? "Hold" : "按住"}
                  value={`${Math.min(PRESS_HOLD_DELAY_MS, Math.round(heldMs))} / ${PRESS_HOLD_DELAY_MS} ms`}
                  ratio={pressProgress}
                  tone="accent"
                />
                <Meter
                  label={locale === "en" ? "Drift" : "位移"}
                  value={`${driftPx.toFixed(1)} / ${DRIFT_TOLERANCE_PX} px`}
                  ratio={driftRatio}
                  tone={overDrift ? "wrong" : "muted"}
                />
              </div>

              <div className="mt-4 flex items-center justify-center">
                <DriftPad dx={driftVec.x} dy={driftVec.y} over={overDrift} locale={locale} />
              </div>

              <p className="mt-4 font-mono text-[12px] leading-relaxed text-fg">
                <span className="text-accent">{"> "}</span>
                {verdictCopy(lastVerdict, pressingId ? liveVerdict : lastVerdict, locale, selectedIds.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {SELECTION_FORMULAS.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
              {pick(item.eyebrow, locale)}
            </p>
            <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-fg">{pick(item.title, locale)}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{pick(item.desc, locale)}</p>
          </article>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How the three results stay apart" : "三种结果怎么拆开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Time is the select gate" : "1. 时间门只开给选择"}
              </span>
              <br />
              {locale === "en"
                ? "Under 480ms is still a tap. The hold ring must close before checkboxes appear."
                : "不满 480ms 仍是单击。圆环合拢之前，列表不挂勾选框。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Drift yields the list back" : "2. 位移立刻把列表还回去"}
              </span>
              <br />
              {locale === "en"
                ? "8px is a radius, not a vibe. Cross it and the timer is gone — even if you meant to hold."
                : "8px 是半径，不是感觉。越线就拆掉定时器，哪怕你本来想长按。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Select is a mode, not a checkbox column" : "3. 选择是模式，不是常驻勾选列"}
              </span>
              <br />
              {locale === "en"
                ? "Browsing keeps full-width text. Select mounts checks, a count, and a thumb dock — and Cancel is explicit."
                : "浏览时文字全宽。进入选择才挂上勾选、计数和拇指底栏；取消必须显式。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            gestureVerdict(heldMs, driftSq)
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`if (dx*dx + dy*dy > 64) return "scroll"
if (heldMs >= 480)     return "select"
if (released)          return "open"
return "pending"`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Scroll wins first. Select needs time. Open is whatever is left when you lift."
              : "滚动优先；选择要时间；剩下的抬起才是打开。"}
          </p>
        </article>
      </section>
    </div>
  );
}

function outcomeActiveClass(id: "open" | "select" | "scroll") {
  if (id === "open") return "border-intent/40 bg-intent-soft";
  if (id === "select") return "border-accent/40 bg-accent-soft";
  return "border-border-strong bg-surface";
}

function Meter({
  label,
  value,
  ratio,
  tone,
}: {
  label: string;
  value: string;
  ratio: number;
  tone: "accent" | "wrong" | "muted";
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 font-mono text-[11px]">
        <span className="text-fg-muted">{label}</span>
        <span className={cn("tabular-nums", tone === "wrong" ? "font-semibold text-wrong" : "text-fg")}>
          {value}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "accent" && "bg-accent",
            tone === "wrong" && "bg-wrong",
            tone === "muted" && "bg-fg-muted",
          )}
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}

function DriftPad({
  dx,
  dy,
  over,
  locale,
}: {
  dx: number;
  dy: number;
  over: boolean;
  locale: "zh" | "en";
}) {
  const scale = 44 / DRIFT_TOLERANCE_PX;
  const x = Math.max(-52, Math.min(52, dx * scale));
  const y = Math.max(-52, Math.min(52, dy * scale));

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative size-[132px] rounded-full border",
          over ? "border-wrong/50 bg-wrong-soft/70" : "border-border bg-surface",
        )}
      >
        <div className="absolute inset-[22px] rounded-full border border-dashed border-fg/25" />
        <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/35" />
        <span
          className={cn(
            "absolute top-1/2 left-1/2 size-2.5 rounded-full",
            over ? "bg-wrong" : "bg-accent",
          )}
          style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
        />
      </div>
      <p className="text-[11px] text-fg-subtle">
        {locale === "en" ? "Dashed ring = 8px radius" : "虚线圆 = 8px 容差半径"}
      </p>
    </div>
  );
}

function verdictCopy(
  last: GestureVerdict | null,
  live: GestureVerdict | null,
  locale: "zh" | "en",
  selected: number,
): string {
  const verdict = live ?? last;
  if (locale === "en") {
    if (verdict === "open") return "Quick release inside the radius → opened detail.";
    if (verdict === "select") return `Hold completed → selecting · ${selected} checked.`;
    if (verdict === "scroll") return "Drift left the 8px circle → hold cancelled, list may scroll.";
    if (verdict === "pending") return "Finger down. Watch the hold ring and the drift pad.";
    return "Ready. Tap, hold, or slide a row.";
  }
  if (verdict === "open") return "容差内短促抬起 → 已打开详情。";
  if (verdict === "select") return `长按达标 → 进入多选 · 已勾 ${selected} 项。`;
  if (verdict === "scroll") return "位移走出 8px 圆 → 长按注销，列表可以滚。";
  if (verdict === "pending") return "手指按下。看圆环与位移盘。";
  return "准备就绪。单击、按住或滑开一行。";
}
