import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindMeta } from "../lib/kinds";
import {
  hasAlt,
  markFor,
  stageState,
  type Followup,
  type KindId,
} from "../lib/machines";
import { loc, pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import { ChartMark } from "./Marks";
import "./charts.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("change");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav
        aria-label={locale === "en" ? "Chart intents" : "图表意图"}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              onClick={() => setActive(kind.id)}
              className={cn(
                "flex min-w-44 shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors lg:min-w-0 lg:w-full",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-transparent bg-transparent hover:bg-surface-2",
              )}
            >
              <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{pick(kind.zh, locale)}</span>
                <span className="block truncate text-[11px] text-fg-muted">{kind.name}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <section className="min-w-0 overflow-x-hidden">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 06</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? <p className="mb-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

        <KindDemo key={meta.id} id={meta.id} />

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
      </section>
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
    <div className="mb-5 rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
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

export function KindDemo({ id, state }: { id: KindId; state?: string }) {
  const locked = state === "primary" || state === "alt";
  const initial = locked ? stageState(state) : "primary";
  const [followup, setFollowup] = useState<Followup>(initial);
  const current = locked ? stageState(state ?? "") : followup;
  const locale = useLocale();
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0];
  const mark = markFor(id, current);
  const scene = sceneCopy(meta, current, locale);
  const showToggle = hasAlt(id) && !locked;

  return (
    <Window
      title={scene.window}
      action={
        showToggle ? (
          <FollowToggle
            meta={meta}
            value={current}
            locale={locale}
            onChange={setFollowup}
          />
        ) : undefined
      }
    >
      <div data-kind={id} data-mark={mark} data-followup={current} className="min-w-0 overflow-x-hidden">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{mark}</p>
        <h3 className="mt-1 text-[1.15rem] font-semibold tracking-tight">{scene.headline}</h3>
        <p className="mt-1 text-[13px] text-fg-muted">{scene.sub}</p>
        <div className="mt-4 min-w-0 overflow-x-hidden">
          <ChartMark mark={mark} locale={locale} />
        </div>
      </div>
    </Window>
  );
}

function FollowToggle({
  meta,
  value,
  locale,
  onChange,
}: {
  meta: KindMeta;
  value: Followup;
  locale: Locale;
  onChange: (next: Followup) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={locale === "en" ? "Follow-up" : "再收窄"}
      className="flex shrink-0 rounded-lg bg-surface-2 p-0.5"
    >
      {(["primary", "alt"] as const).map((id) => {
        const on = value === id;
        const item = id === "alt" ? meta.alt : meta.primary;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(id)}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
              on ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
            )}
          >
            {pick(item.label, locale)}
          </button>
        );
      })}
    </div>
  );
}

function sceneCopy(meta: KindMeta, followup: Followup, locale: Locale) {
  if (meta.id === "change" && followup === "alt") {
    return {
      window: pick(loc("累计 · 注册", "Cumulative · sign-ups"), locale),
      headline: pick(loc("累计注册", "Cumulative sign-ups"), locale),
      sub: pick(loc("万人 · 强调已经攒了多少", "10k people · how much has piled up"), locale),
    };
  }
  if (meta.id === "compare" && followup === "alt") {
    return {
      window: pick(loc("城市 · 订单", "City · orders"), locale),
      headline: pick(loc("城市订单榜", "City ranking"), locale),
      sub: pick(loc("单 · 名字横着写全", "orders · names written across"), locale),
    };
  }
  if (meta.id === "share" && followup === "alt") {
    return {
      window: pick(loc("季度 · 产品线", "Quarter · lines"), locale),
      headline: pick(loc("季度构成", "Quarter mix"), locale),
      sub: pick(loc("万元 · 内部再拆", "¥10k · split inside"), locale),
    };
  }
  if (meta.id === "relate" && followup === "alt") {
    return {
      window: pick(loc("活跃 · 时段", "Active · hours"), locale),
      headline: pick(loc("周 × 时段", "Week × hour"), locale),
      sub: pick(loc("颜色越深越活跃", "darker is more active"), locale),
    };
  }
  return {
    window: pick(meta.window, locale),
    headline: pick(meta.headline, locale),
    sub: pick(meta.sub, locale),
  };
}
