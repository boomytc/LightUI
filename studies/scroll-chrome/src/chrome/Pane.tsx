import { useLayoutEffect, useRef, useState } from "react";
import { sections } from "../lib/copy";
import {
  atStart,
  dotCount,
  focusDot,
  fraction,
  hidesNative,
  lineLength,
  overflow,
  showsCue,
  showsTrack,
  stageFraction,
  type KindId,
  type StageState,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CueHint } from "./CueHint";
import { TrackRail } from "./TrackRail";
import "../scroll.css";

export type PaneMetrics = {
  top: number;
  max: number;
  heading: string;
  n: number;
  focus: number;
};

export function Pane({
  kind,
  locale,
  lock,
  seekKey = 0,
  followFraction,
  onFraction,
  onMetrics,
  variant = "window",
}: {
  kind: KindId;
  locale: Locale;
  lock?: StageState;
  seekKey?: number;
  followFraction?: number | null;
  onFraction?: (frac: number) => void;
  onMetrics?: (metrics: PaneMetrics) => void;
  variant?: "window" | "column";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const applyingRef = useRef(false);
  const onFractionRef = useRef(onFraction);
  const onMetricsRef = useRef(onMetrics);
  onFractionRef.current = onFraction;
  onMetricsRef.current = onMetrics;

  const [top, setTop] = useState(0);
  const [max, setMax] = useState(0);
  const [heading, setHeading] = useState("");
  const long = lock !== "fit";
  const copy = sections(locale, long);
  const hasOverflow = overflow(max);
  const start = atStart(top);
  const cue = showsCue(kind, hasOverflow, start);
  const track = showsTrack(kind, hasOverflow);
  const hideNative = hidesNative(kind);
  const frac = fraction(top, max);
  const n = dotCount(lineLength(ref.current?.clientHeight ?? 352));
  const focus = focusDot(frac, n);

  const report = (el: HTMLDivElement) => {
    const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
    const nextTop = el.scrollTop;
    const nodes = el.querySelectorAll<HTMLElement>("[data-sec]");
    let current = nodes[0]?.dataset.sec ?? "";
    for (const node of nodes) {
      if (node.offsetTop <= nextTop + 28) current = node.dataset.sec ?? current;
    }
    setMax(nextMax);
    setTop(nextTop);
    setHeading(current);
    const nextN = dotCount(lineLength(el.clientHeight));
    onMetricsRef.current?.({
      top: nextTop,
      max: nextMax,
      heading: current,
      n: nextN,
      focus: focusDot(fraction(nextTop, nextMax), nextN),
    });
    if (!applyingRef.current) {
      onFractionRef.current?.(fraction(nextTop, nextMax));
    }
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => report(el);
    const onScroll = () => report(el);
    sync();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const child = el.firstElementChild;
    if (child) ro.observe(child);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [kind, long, locale]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || lock == null) return;
    const locked = stageFraction(lock);
    const apply = () => {
      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      applyingRef.current = true;
      if (locked == null) {
        el.scrollTop = 0;
      } else {
        el.scrollTop = locked * nextMax;
      }
      report(el);
      requestAnimationFrame(() => {
        applyingRef.current = false;
      });
    };
    apply();
    const id = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(id);
  }, [lock, seekKey, kind, long, locale]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || followFraction == null || lock === "fit") return;
    const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
    const target = followFraction * nextMax;
    if (Math.abs(el.scrollTop - target) < 1) return;
    applyingRef.current = true;
    el.scrollTop = target;
    report(el);
    requestAnimationFrame(() => {
      applyingRef.current = false;
    });
  }, [followFraction, lock, kind, long, locale]);

  const job = pick(
    kind === "native"
      ? { zh: "系统条", en: "Native" }
      : kind === "cue"
        ? { zh: "邀请", en: "Cue" }
        : { zh: "轨道", en: "Track" },
    locale,
  );

  const metric =
    !hasOverflow
      ? locale === "en"
        ? "fits"
        : "装得下"
      : kind === "cue"
        ? start
          ? locale === "en"
            ? "on · at start"
            : "在 · 顶上"
          : locale === "en"
            ? "unloaded"
            : "已卸"
        : kind === "track"
          ? `${frac.toFixed(2)} · ${focus}/${Math.max(n - 1, 1)}`
          : frac.toFixed(2);

  const footer = pick(
    kind === "native"
      ? { zh: "系统拇指还在，连续拖。", en: "The OS thumb stays. Drag is continuous." }
      : kind === "cue"
        ? { zh: "只在顶上请人往下。离开就卸。", en: "Invite down only at the top. Unload after." }
        : { zh: "点列是比例，不是章节。", en: "The dots are a fraction, not sections." },
    locale,
  );

  return (
    <div
      data-kind={kind}
      data-cue={cue ? "on" : "off"}
      data-track={track ? "on" : "off"}
      className={cn(
        "relative overflow-hidden bg-surface",
        variant === "window" && "rounded-2xl border border-border shadow-card",
        variant === "column" && "h-full",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-border px-3 py-2.5",
          variant === "column" && kind === "cue" && "bg-accent-soft/40",
          variant === "column" && kind === "track" && "bg-surface-2",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {variant === "window" ? (
            <span className="flex gap-1" aria-hidden="true">
              <i className="size-2 rounded-full bg-[#ff5f57]" />
              <i className="size-2 rounded-full bg-[#febc2e]" />
              <i className="size-2 rounded-full bg-[#28c840]" />
            </span>
          ) : (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                kind === "cue" ? "bg-accent text-accent-fg" : "bg-fg text-surface",
              )}
            >
              {job}
            </span>
          )}
          <p className="truncate text-[12px] text-fg-subtle">
            {variant === "column"
              ? kind === "cue"
                ? locale === "en"
                  ? "Invitation only at the top"
                  : "只在顶上请人往下"
                : kind === "track"
                  ? locale === "en"
                    ? "Ticks are a fraction"
                    : "点是比例，不是章节"
                  : locale === "en"
                    ? "Long pane"
                    : "长文稿"
              : locale === "en"
                ? "Long pane"
                : "长文稿"}
          </p>
        </div>
        <p className="font-mono text-[11px] tabular-nums text-fg-subtle">{metric}</p>
      </div>
      <div className={cn("relative", variant === "window" ? "h-[22rem]" : "h-[22rem] sm:h-[24rem]")}>
        {kind === "cue" && cue ? <div className="scroll-cue-wash" aria-hidden="true" /> : null}
        {kind === "track" && track ? <div className="scroll-track-gutter" aria-hidden="true" /> : null}
        <div
          ref={ref}
          data-hide-native={hideNative ? "true" : "false"}
          className="scroll-pane absolute inset-0 overflow-y-auto px-5 py-4"
        >
          <article className="max-w-none space-y-5 pr-6">
            {copy.map(([title, body]) => (
              <section key={title}>
                <h3 data-sec={title} className="text-[14px] font-semibold tracking-tight text-fg">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{body}</p>
              </section>
            ))}
          </article>
        </div>
        {track ? <TrackRail viewportRef={ref} locale={locale} /> : null}
        {cue ? <CueHint viewportRef={ref} locale={locale} /> : null}
      </div>
      <p className="border-t border-border px-3 py-2 text-[11px] text-fg-subtle">
        {kind === "track" && hasOverflow && heading
          ? locale === "en"
            ? `Heading “${heading}” ≠ tick ${focus}/${Math.max(n - 1, 1)}`
            : `标题「${heading}」≠ 点 ${focus}/${Math.max(n - 1, 1)}`
          : footer}
      </p>
    </div>
  );
}
