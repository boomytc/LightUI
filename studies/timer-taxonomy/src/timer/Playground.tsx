import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, Pause, Play, Square } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import {
  PLAYGROUND_FOCUS_MINUTES,
  STAGE_NOW,
  displaySeconds,
  emptyTimer,
  end,
  formatDuration,
  occupiesChrome,
  pause,
  sessionProgress,
  shouldStopFocus,
  stageSnapshot,
  stageState,
  start,
  timerFromLock,
  type StageSnapshot,
  type StageState,
  type TimerState,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";
import { InnerNav, KindPair, TimeChip, Well, Window } from "./Frame";
import "./timer.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("focus");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= KINDS.length) {
        e.preventDefault();
        setActive(KINDS[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-playground="timer" data-kind={active} className="min-w-0 overflow-x-hidden">
      <DirectionPair locale={locale} active={active} onPick={setActive} />

      <div className="mt-6 mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 02</p>
          <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
          <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
        </div>
        <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
          {pick(meta.tells, locale)}
        </p>
      </div>

      <Contrast
        locale={locale}
        naive={pick(meta.naive, locale)}
        matched={pick(meta.matched, locale)}
        rung={pick(meta.zh, locale)}
      />

      <div key={meta.id} className="timer-kind-in mt-5">
        <KindDemo id={meta.id} onKind={setActive} layout="desk" />
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {meta.scenes.map((scene) => (
          <span
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </span>
        ))}
      </div>

      {meta.note ? <p className="mt-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

      <div className="mt-5">
        <SpecCard text={pick(meta.spec, locale)} locale={locale} />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {meta.rules.map((rule) => (
          <li
            key={rule.zh}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
          >
            {pick(rule, locale)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DirectionPair({
  locale,
  active,
  onPick,
}: {
  locale: Locale;
  active: KindId;
  onPick: (id: KindId) => void;
}) {
  const reduce = useReducedMotion();
  const heat = active === "stopwatch" ? 38 : 100;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-intent">
          {locale === "en" ? "Count up · no cap" : "正数累计 · 无上限"}
        </p>
        <p className="text-[11px] font-medium tracking-wide text-accent">
          {locale === "en" ? "Count down · stop at 0" : "倒数专注 · 到 0 停"}
        </p>
      </div>

      <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", reduce ? "" : "timer-heat")}
          style={{
            width: `${heat}%`,
            background:
              "linear-gradient(90deg, var(--color-intent) 0%, var(--color-accent) 100%)",
          }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {KINDS.map((kind) => {
          const on = kind.id === active;
          const up = kind.id === "stopwatch";
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => onPick(kind.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                on
                  ? "border-border-strong bg-play-glow shadow-card"
                  : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span
                className={cn("timer-dir-mark mt-0.5", on ? "text-accent" : "text-fg-subtle", reduce && "is-still")}
                data-dir={up ? "up" : "down"}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
              </span>
              <span className="min-w-0">
                <span className={cn("font-mono text-[10px] tracking-[0.14em] uppercase", on ? "text-accent" : "text-fg-subtle")}>
                  {up ? (locale === "en" ? "up" : "往上") : locale === "en" ? "down" : "往下"}
                </span>
                <span className="mt-1 block text-[15px] font-semibold tracking-tight">
                  {pick(kind.zh, locale)}
                </span>
                <span className="mt-1 block text-[13px] leading-snug text-fg-muted">
                  {up
                    ? locale === "en"
                      ? "From 0 up. No session percent."
                      : "从 0 往上。没有会话百分比。"
                    : locale === "en"
                      ? "From N down. Stops at 0 — no toast."
                      : "从 N 往下。到 0 停住，不要 toast。"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Contrast({
  locale,
  naive,
  matched,
  rung,
}: {
  locale: Locale;
  naive: string;
  matched: string;
  rung: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <aside className="rounded-xl border border-border bg-surface-2/70 px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
          {locale === "en" ? "One moving number" : "一律一个走着的数字"}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{naive}</p>
      </aside>
      <aside className="rounded-xl border border-intent/30 bg-intent-soft px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-intent uppercase">
          {locale === "en" ? "This direction" : "这一向"}
          <span className="ml-1.5 font-sans normal-case tracking-normal text-intent/70">{rung}</span>
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg">{matched}</p>
      </aside>
    </div>
  );
}

function SpecCard({ text, locale }: { text: string; locale: Locale }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-surface/45">
          {locale === "en" ? "Say it this way" : "说清楚"}
        </p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-surface/45 transition-colors hover:text-surface"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
        </button>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-surface/90">{text}</p>
    </div>
  );
}

function nowSeconds() {
  return Date.now() / 1000;
}

export function KindDemo({
  id,
  onKind,
  state,
  lock,
  layout = "stage",
}: {
  id: KindId;
  onKind?: (id: KindId) => void;
  state?: StageState;
  lock?: StageSnapshot;
  layout?: "desk" | "stage";
}) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const snap = lock ?? (state !== undefined ? stageSnapshot(id, stageState(state, id)) : null);
  const locked = snap !== null;
  const desk = layout === "desk";
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0]!;

  const [live, setLive] = useState(() => emptyTimer(id, PLAYGROUND_FOCUS_MINUTES));
  const [clock, setClock] = useState(() => nowSeconds());
  const [page, setPage] = useState<"timer" | "plan">("timer");

  useEffect(() => {
    if (locked || !live.running) return;
    if (reduced) {
      const tick = window.setInterval(() => setClock(nowSeconds()), 200);
      return () => window.clearInterval(tick);
    }
    let raf = 0;
    const loop = () => {
      setClock(nowSeconds());
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [locked, live.running, reduced]);

  useEffect(() => {
    if (locked) return;
    if (shouldStopFocus(live, clock)) setLive((t) => pause(t, clock));
  }, [locked, live, clock]);

  const timer = locked && snap ? timerFromLock(id, snap, STAGE_NOW) : live;
  const now = locked ? STAGE_NOW : clock;
  const pane = locked ? "timer" : page;
  const shown = formatDuration(displaySeconds(timer, now));
  const occupying = occupiesChrome(timer, now);
  const status = sessionFace(timer, now);
  const progress = sessionProgress(timer, now);

  function handleStart() {
    if (locked) return;
    const at = nowSeconds();
    setClock(at);
    setLive((cur) => start(cur, at));
  }

  function handlePause() {
    if (locked) return;
    const at = nowSeconds();
    setClock(at);
    setLive((cur) => pause(cur, at));
  }

  function handleEnd() {
    if (locked) return;
    setLive((cur) => end(cur));
  }

  const pageLabels = {
    timer: locale === "en" ? "Timer" : "计时",
    plan: locale === "en" ? "Plan" : "计划",
  };

  const chip = occupying ? (
    <TimeChip
      label={shown}
      running={timer.running}
      onClick={locked ? undefined : () => setPage("timer")}
    />
  ) : undefined;

  const body =
    pane === "plan" ? (
      <PlanPane locale={locale} layout={layout} />
    ) : (
      <TimerPane
        id={id}
        locale={locale}
        layout={layout}
        shown={shown}
        status={status}
        progress={progress}
        caption={pick(meta.caption, locale)}
        hint={
          id === "focus"
            ? locale === "en"
              ? `Focus · ${timer.focusMinutes} min`
              : `专注 ${timer.focusMinutes} 分钟`
            : pick(meta.hint, locale)
        }
        onStart={handleStart}
        onPause={handlePause}
        onEnd={handleEnd}
      />
    );

  if (desk) {
    return (
      <Well>
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <KindPair
            value={id}
            labels={{
              stopwatch: pick(KINDS[0]!.zh, locale),
              focus: pick(KINDS[1]!.zh, locale),
            }}
            onPick={locked ? undefined : onKind}
          />
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {chip}
            <InnerNav
              compact
              page={pane}
              labels={pageLabels}
              onPick={locked ? undefined : setPage}
            />
          </div>
        </div>
        <div key={pane} className="timer-pane-in">
          {body}
        </div>
      </Well>
    );
  }

  return (
    <Window
      title={pick(meta.window, locale)}
      chip={chip}
      nav={
        <InnerNav
          page={pane}
          labels={pageLabels}
          onPick={locked ? undefined : setPage}
        />
      }
    >
      <div key={pane} className="timer-pane-in">
        {body}
      </div>
    </Window>
  );
}

type Face = "idle" | "running" | "paused" | "done";

function sessionFace(t: TimerState, now: number): Face {
  if (t.mode === "focus" && !t.running && displaySeconds(t, now) === 0 && occupiesChrome(t, now)) {
    return "done";
  }
  if (t.running) return "running";
  if (occupiesChrome(t, now)) return "paused";
  return "idle";
}

function TimerPane({
  id,
  locale,
  layout,
  shown,
  status,
  progress,
  caption,
  hint,
  onStart,
  onPause,
  onEnd,
}: {
  id: KindId;
  locale: Locale;
  layout: "desk" | "stage";
  shown: string;
  status: Face;
  progress: number | null;
  caption: string;
  hint: string;
  onStart: () => void;
  onPause: () => void;
  onEnd: () => void;
}) {
  const desk = layout === "desk";
  const statusLabel =
    status === "running"
      ? locale === "en"
        ? "Running"
        : "进行中"
      : status === "paused"
        ? locale === "en"
          ? "Paused"
          : "已暂停"
        : status === "done"
          ? locale === "en"
            ? "Done"
            : "已完成"
          : locale === "en"
            ? "Idle"
            : "未开始";

  const startLabel =
    status === "paused"
      ? locale === "en"
        ? "Resume"
        : "继续"
      : locale === "en"
        ? "Start"
        : "开始";

  return (
    <div className={cn("min-w-0 overflow-x-hidden", desk ? "px-6 py-10 sm:px-10 sm:py-12" : "px-3 py-5")}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[12px] text-fg-muted">{hint}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            status === "running"
              ? "bg-accent-soft text-accent"
              : status === "done"
                ? "bg-intent-soft text-intent"
                : "bg-surface-2 text-fg-muted",
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className={cn("flex flex-col items-center", desk && "min-h-[18rem] justify-center")}>
        {progress == null ? (
          <TickDigits
            value={shown}
            dir="up"
            className={desk ? "text-[4.5rem] leading-none sm:text-[5.5rem]" : "text-[2.75rem] sm:text-[3.1rem]"}
          />
        ) : (
          <FocusRing progress={progress} label={shown} size={desk ? 240 : 176} done={status === "done"} />
        )}
        <p className={cn("text-[12px] text-fg-muted", desk ? "mt-4" : "mt-2")}>{caption}</p>
      </div>

      <div className={cn("flex flex-wrap items-center justify-center gap-2", desk ? "mt-8" : "mt-6")}>
        {status === "running" ? (
          <FaceButton tone="solid" onClick={onPause}>
            <Pause className="size-3.5" />
            {locale === "en" ? "Pause" : "暂停"}
          </FaceButton>
        ) : (
          <FaceButton tone="solid" onClick={onStart} disabled={status === "done"}>
            <Play className="size-3.5" />
            {startLabel}
          </FaceButton>
        )}
        <FaceButton tone="outline" onClick={onEnd} disabled={status === "idle"}>
          <Square className="size-3" />
          {locale === "en" ? "End" : "结束"}
        </FaceButton>
      </div>

      {id === "stopwatch" ? (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "No session ring. A stopwatch is elapsed time, not a percent."
            : "没有会话环。累计是已经过了多久，不是百分比。"}
        </p>
      ) : (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "The ring is this session, not today’s goal. Hitting 0 stops the clock — not a toast."
            : "环是这一段会话，不是今日目标。到 0 自己停住，不是一条 toast。"}
        </p>
      )}
    </div>
  );
}

function TickDigits({
  value,
  dir,
  className,
}: {
  value: string;
  dir: "up" | "down";
  className?: string;
}) {
  return (
    <p className={cn("timer-digits font-semibold tracking-tight", className)} aria-live="polite" aria-label={value}>
      {value.split("").map((ch, i) =>
        ch === ":" ? (
          <span key={`c-${i}`} className="timer-colon">
            :
          </span>
        ) : (
          <span key={`${i}-${ch}`} className={cn("timer-digit", dir === "down" && "is-down")}>
            {ch}
          </span>
        ),
      )}
    </p>
  );
}

function FocusRing({
  progress,
  label,
  size,
  done,
}: {
  progress: number;
  label: string;
  size: number;
  done: boolean;
}) {
  const stroke = size >= 224 ? 9 : 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  return (
    <div className={cn("timer-ring relative", done && "is-done")} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth={stroke}
        />
        <circle
          className="timer-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <TickDigits
          value={label}
          dir="down"
          className={size >= 224 ? "text-[2.75rem]" : "text-[2.35rem]"}
        />
      </div>
    </div>
  );
}

function FaceButton({
  tone,
  onClick,
  disabled,
  children,
}: {
  tone: "solid" | "outline";
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium disabled:opacity-35",
        tone === "solid"
          ? "bg-fg text-surface"
          : "border border-border-strong bg-surface text-fg",
      )}
    >
      {children}
    </button>
  );
}

function PlanPane({ locale, layout }: { locale: Locale; layout: "desk" | "stage" }) {
  const desk = layout === "desk";
  const rows =
    locale === "en"
      ? [
          { title: "Morning reading", meta: "Notes — not this session" },
          { title: "Outline a page", meta: "Writing" },
          { title: "Review draft", meta: "Later" },
        ]
      : [
          { title: "晨间阅读", meta: "笔记 · 不是这一段会话" },
          { title: "写一页提纲", meta: "写作" },
          { title: "复盘草稿", meta: "稍后" },
        ];

  return (
    <div
      className={cn(
        "min-w-0 overflow-x-hidden",
        desk ? "mx-auto max-w-lg px-6 py-8 sm:px-8" : "px-3 py-4",
      )}
    >
      <p className="text-[11px] font-medium tracking-[0.14em] text-fg-subtle uppercase">
        {locale === "en" ? "Plan" : "计划"}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "The session still occupies the top bar. It is not hidden on this page."
          : "会话还在顶栏。不是藏在这一页里。"}
      </p>
      <ul className="mt-3 grid min-w-0 gap-2">
        {rows.map((row) => (
          <li
            key={row.title}
            className="min-w-0 rounded-xl border border-border bg-surface-2 px-3 py-2.5"
          >
            <p className="truncate text-[13px] font-medium">{row.title}</p>
            <p className="mt-0.5 truncate text-[11px] text-fg-muted">{row.meta}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
