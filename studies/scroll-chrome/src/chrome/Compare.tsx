import { useEffect, useState } from "react";
import { CONTRAST, SCENE_LOCKS } from "../lib/kinds";
import {
  atStart,
  focusDot,
  overflow,
  showsCue,
  showsTrack,
  stageFraction,
  type KindId,
  type StageState,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Pane, type PaneMetrics } from "./Pane";

export function Compare({
  locale,
  scene,
  onScene,
}: {
  locale: Locale;
  scene: StageState;
  onScene: (scene: StageState) => void;
}) {

  const [frac, setFrac] = useState(0);
  const [leader, setLeader] = useState<{ kind: KindId; scene: StageState } | null>(null);
  const [seekKey, setSeekKey] = useState(0);
  const [trackMeta, setTrackMeta] = useState<PaneMetrics>({
    top: 0,
    max: 0,
    heading: "",
    n: 6,
    focus: 0,
  });

  useEffect(() => {
    setLeader(null);
    setFrac(stageFraction(scene) ?? 0);
  }, [scene]);

  const has = overflow(trackMeta.max);
  const start = atStart(trackMeta.top);
  const cueOn = showsCue("cue", has, start);
  const trackOn = showsTrack("track", has);
  const last = Math.max(trackMeta.n - 1, 1);
  const focus = focusDot(frac, trackMeta.n);

  function pickScene(next: StageState) {
    setLeader(null);
    setFrac(stageFraction(next) ?? 0);
    setSeekKey((n) => n + 1);
    onScene(next);
  }

  function lead(kind: KindId) {
    return (next: number) => {
      setLeader({ kind, scene });
      setFrac(next);
    };
  }

  const following = leader && leader.scene === scene ? leader.kind : null;

  return (
    <div data-playground="scroll-chrome" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "Same article · two jobs" : "同一篇长文 · 两根条"}
          </p>
          <p className="mt-1 text-[14px] text-fg-muted">
            {locale === "en"
              ? "Scroll either pane. The cue unloads after the first screen. The track stays and reports a fraction — not the heading in view."
              : "随便滚一边。邀请离开顶上就卸。轨道还在，报的是比例——不是眼前这个标题。"}
          </p>
        </div>
        <p className="hidden text-[11px] text-fg-subtle sm:block">
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            1
          </kbd>
          –
          <kbd className="ml-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            4
          </kbd>
          <span className="ml-1.5">{locale === "en" ? "lock a place" : "锁到同一处"}</span>
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {SCENE_LOCKS.map((item, index) => {
          const on = scene === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-scene={item.id}
              aria-pressed={on}
              onClick={() => pickScene(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                on
                  ? "bg-fg text-surface"
                  : "border border-border bg-surface text-fg-muted hover:text-fg",
              )}
            >
              <span className="font-mono text-[10px] opacity-60">{index + 1}</span>
              <span className="ml-1.5">{pick(item.zh, locale)}</span>
            </button>
          );
        })}
      </div>
      <p className="mb-4 text-[12px] text-fg-subtle">
        {pick(SCENE_LOCKS.find((item) => item.id === scene)?.hint ?? SCENE_LOCKS[0]!.hint, locale)}
      </p>

      <div className="scroll-desk grid overflow-hidden rounded-2xl border border-border bg-border shadow-card md:grid-cols-2">
        <div className="scroll-desk-col min-w-0 bg-surface" data-job="cue">
          <Pane
            kind="cue"
            locale={locale}
            lock={scene}
            seekKey={seekKey}
            variant="column"
            followFraction={following && following !== "cue" ? frac : null}
            onFraction={lead("cue")}
          />
        </div>
        <div className="scroll-desk-col min-w-0 bg-surface" data-job="track">
          <Pane
            kind="track"
            locale={locale}
            lock={scene}
            seekKey={seekKey}
            variant="column"
            followFraction={following && following !== "track" ? frac : null}
            onFraction={lead("track")}
            onMetrics={setTrackMeta}
          />
        </div>
      </div>

      <div className="scroll-ledger mt-3 grid gap-px overflow-hidden rounded-2xl border border-fg bg-fg text-surface sm:grid-cols-2">
        <LedgerCell
          label={locale === "en" ? "Cue" : "邀请"}
          value={cueOn ? (locale === "en" ? "on" : "在") : locale === "en" ? "unloaded" : "已卸"}
          detail={
            locale === "en"
              ? "showsCue = overflow && atStart"
              : "showsCue = 溢出 且 还在顶上"
          }
          live={cueOn}
        />
        <LedgerCell
          label={locale === "en" ? "Track" : "轨道"}
          value={
            trackOn
              ? `${frac.toFixed(2)} · ${focus}/${last}`
              : locale === "en"
                ? "hidden"
                : "hidden"
          }
          detail={
            trackOn
              ? locale === "en"
                ? `focus = round(fraction × (n − 1)) · heading “${trackMeta.heading || "—"}” is not a tick`
                : `focus = round(fraction × (n − 1)) · 标题「${trackMeta.heading || "—"}」不是点`
              : locale === "en"
                ? "showsTrack = track && overflow"
                : "showsTrack = track 且 溢出"
          }
          live={trackOn}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.15fr)_minmax(0,1.15fr)] gap-2 border-b border-border bg-surface-2/70 px-4 py-2 text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          <span>{locale === "en" ? "When" : "何时"}</span>
          <span>{locale === "en" ? "Always a cooler bar" : "一律更酷的条"}</span>
          <span>{locale === "en" ? "Split by job" : "按职责分"}</span>
        </div>
        {CONTRAST.map((row) => (
          <div
            key={row.when.zh}
            className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.15fr)_minmax(0,1.15fr)] gap-2 border-b border-border px-4 py-2.5 last:border-b-0"
          >
            <p className="text-[13px] font-medium text-fg">{pick(row.when, locale)}</p>
            <p className="text-[12px] text-fg-muted">{pick(row.naive, locale)}</p>
            <p className="text-[12px] text-fg">{pick(row.split, locale)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function LedgerCell({
  label,
  value,
  detail,
  live,
}: {
  label: string;
  value: string;
  detail: string;
  live: boolean;
}) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[10px] font-medium tracking-[0.14em] text-surface/45 uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-[18px] font-semibold tracking-tight tabular-nums",
          live ? "text-surface" : "text-surface/45",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-surface/50">{detail}</p>
    </div>
  );
}
