import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindMeta } from "../lib/kinds";
import {
  hasAlt,
  markFor,
  stageState,
  type Followup,
  type KindId,
  type Mark,
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
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
    <div data-playground="chart-taxonomy" className="chart-playground">
      <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? "Name the intent, then the mark" : "先定要看什么，再选痕迹"}
      </p>
      <nav
        aria-label={locale === "en" ? "Chart intents" : "图表意图"}
        data-intent-row=""
        className="chart-intent-row"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          const mark = markFor(kind.id, "primary");
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => setActive(kind.id)}
              className={cn("chart-intent", on && "is-on")}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em]",
                  on ? "text-accent" : "text-fg-subtle",
                )}
              >
                {kind.index}
              </span>
              <IntentGlyph mark={mark} />
              <span className="truncate text-[13px] font-semibold tracking-tight text-fg">
                {pick(kind.zh, locale)}
              </span>
              <span className="truncate font-mono text-[10px] text-fg-subtle">{mark}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-5 min-w-0">
        <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 06</p>
        <h2 className="mt-1 text-[1.45rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
        <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
        {meta.note ? <p className="mt-2 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}
      </div>

      <div className="chart-work mt-4">
        <div className="chart-work-pane">
          <KindDemo key={meta.id} id={meta.id} />
        </div>
        <SpecCaption text={pick(meta.spec, locale)} scenes={meta} locale={locale} />
      </div>

      <ul className="mt-4 flex min-w-0 flex-wrap gap-2 overflow-x-hidden">
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

function IntentGlyph({ mark }: { mark: Mark }) {
  const stroke = "currentColor";
  return (
    <svg viewBox="0 0 48 22" className="chart-intent-glyph" aria-hidden="true">
      {mark === "line" || mark === "area" ? (
        <path
          d="M2 16 10 12 18 14 26 7 34 9 46 3"
          fill={mark === "area" ? "currentColor" : "none"}
          fillOpacity={mark === "area" ? 0.22 : 1}
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      ) : null}
      {mark === "column" || mark === "bar" ? (
        mark === "column" ? (
          <>
            <rect x="4" y="10" width="6" height="10" rx="1.2" fill={stroke} />
            <rect x="14" y="4" width="6" height="16" rx="1.2" fill={stroke} opacity="0.72" />
            <rect x="24" y="8" width="6" height="12" rx="1.2" fill={stroke} opacity="0.5" />
            <rect x="34" y="6" width="6" height="14" rx="1.2" fill={stroke} opacity="0.85" />
          </>
        ) : (
          <>
            <rect x="4" y="3" width="38" height="4" rx="1.2" fill={stroke} />
            <rect x="4" y="9" width="28" height="4" rx="1.2" fill={stroke} opacity="0.7" />
            <rect x="4" y="15" width="18" height="4" rx="1.2" fill={stroke} opacity="0.45" />
          </>
        )
      ) : null}
      {mark === "pie" ? (
        <path
          d="M24 2 A9 9 0 1 1 15.4 17.4 L24 11 Z"
          fill={stroke}
          fillOpacity="0.28"
          stroke={stroke}
          strokeWidth="1.4"
        />
      ) : null}
      {mark === "scatter" ? (
        <>
          <circle cx="10" cy="15" r="2" fill={stroke} />
          <circle cx="18" cy="11" r="2" fill={stroke} opacity="0.75" />
          <circle cx="26" cy="9" r="2" fill={stroke} />
          <circle cx="34" cy="6" r="2" fill={stroke} opacity="0.7" />
          <circle cx="40" cy="4" r="2" fill={stroke} />
        </>
      ) : null}
      {mark === "funnel" ? (
        <>
          <path d="M6 3 H42 L38 9 H10 Z" fill={stroke} />
          <path d="M12 11 H36 L33 16 H15 Z" fill={stroke} opacity="0.65" />
          <path d="M17 18 H31 L29 21 H19 Z" fill={stroke} opacity="0.4" />
        </>
      ) : null}
      {mark === "radar" ? (
        <path
          d="M24 3 L34 9 L31 19 L17 19 L14 9 Z"
          fill={stroke}
          fillOpacity="0.2"
          stroke={stroke}
          strokeWidth="1.3"
        />
      ) : null}
    </svg>
  );
}

function SpecCaption({
  text,
  scenes,
  locale,
}: {
  text: string;
  scenes: KindMeta;
  locale: Locale;
}) {
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
    <aside className="chart-spec" data-spec="">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-fg-subtle">
          {locale === "en" ? "Say it this way" : "说清楚"}
        </p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-fg-subtle transition-colors hover:text-fg"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
        </button>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{text}</p>
      <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
        {scenes.scenes.map((scene) => pick(scene, locale)).join(" · ")}
      </p>
    </aside>
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
        <div className="chart-pane mt-4" data-chart-pane="">
          <div key={mark} className="chart-enter">
            <ChartMark mark={mark} locale={locale} />
          </div>
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
