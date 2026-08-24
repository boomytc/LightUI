import { useLayoutEffect, useRef, useState } from "react";
import { sections } from "../lib/copy";
import {
  atStart,
  hidesNative,
  overflow,
  showsCue,
  showsTrack,
  stageFraction,
  type KindId,
  type StageState,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { CueHint } from "./CueHint";
import { TrackRail } from "./TrackRail";
import "../scroll.css";

export function Pane({
  kind,
  locale,
  lock,
}: {
  kind: KindId;
  locale: Locale;
  lock?: StageState;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const [max, setMax] = useState(0);
  const long = lock !== "fit";
  const copy = sections(locale, long);
  const hasOverflow = overflow(max);
  const start = atStart(top);
  const cue = showsCue(kind, hasOverflow, start);
  const track = showsTrack(kind, hasOverflow);
  const hideNative = hidesNative(kind);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      setMax(nextMax);
      setTop(el.scrollTop);
    };
    const onScroll = () => setTop(el.scrollTop);
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
    const frac = stageFraction(lock);
    const apply = () => {
      const nextMax = Math.max(0, el.scrollHeight - el.clientHeight);
      if (frac == null) {
        el.scrollTop = 0;
        return;
      }
      el.scrollTop = frac * nextMax;
    };
    apply();
    const id = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(id);
  }, [lock, kind, long, locale]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className="truncate text-[12px] text-fg-subtle">
            {locale === "en" ? "Long pane" : "长文稿"}
          </p>
        </div>
        <p className="font-mono text-[11px] tabular-nums text-fg-subtle">
          {hasOverflow ? `${Math.round((top / Math.max(max, 1)) * 100)}%` : locale === "en" ? "fits" : "装得下"}
        </p>
      </div>
      <div className="relative h-[22rem]">
        <div
          ref={ref}
          data-hide-native={hideNative ? "true" : "false"}
          className="scroll-pane absolute inset-0 overflow-y-auto px-5 py-4"
        >
          <article className="max-w-none space-y-5 pr-6">
            {copy.map(([title, body]) => (
              <section key={title}>
                <h3 className="text-[14px] font-semibold tracking-tight text-fg">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{body}</p>
              </section>
            ))}
          </article>
        </div>
        {track ? <TrackRail viewportRef={ref} locale={locale} /> : null}
        {cue ? <CueHint viewportRef={ref} locale={locale} /> : null}
      </div>
      <p className="border-t border-border px-3 py-2 text-[11px] text-fg-subtle">
        {pick(
          kind === "native"
            ? { zh: "系统拇指还在，连续拖。", en: "The OS thumb stays. Drag is continuous." }
            : kind === "cue"
              ? { zh: "只在顶上请人往下。离开就卸。", en: "Invite down only at the top. Unload after." }
              : { zh: "点列是比例，不是章节。", en: "The dots are a fraction, not sections." },
          locale,
        )}
      </p>
    </div>
  );
}
