import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { CLASS_META, CLASS_ORDER, KINDS, type KindMeta } from "../lib/kinds";
import { type GestureClass, type KindId } from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import { GestureChart } from "./Plot";
import "./charts.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("brush");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

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
    <div data-playground="chart-read" className="min-w-0 overflow-x-hidden">
      <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? "Name the class, then the gesture" : "先定这一手是哪一类"}
      </p>
      <nav aria-label={locale === "en" ? "Chart gestures" : "读图手势"} className="chart-class-rail">
        {CLASS_ORDER.map((klass) => (
          <ClassGroup
            key={klass}
            klass={klass}
            active={active}
            locale={locale}
            onPick={setActive}
          />
        ))}
      </nav>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
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

        <div key={meta.id} className="chart-enter">
          <KindDemo id={meta.id} />
        </div>

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

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

function ClassGroup({
  klass,
  active,
  locale,
  onPick,
}: {
  klass: GestureClass;
  active: KindId;
  locale: Locale;
  onPick: (id: KindId) => void;
}) {
  const kinds = KINDS.filter((k) => k.klass === klass);
  const on = kinds.some((k) => k.id === active);
  const meta = CLASS_META[klass];

  return (
    <div className={cn("chart-class-group", on && "is-on")} data-class={klass}>
      <div className="chart-class-kicker">
        <p className={cn("text-[11px] font-medium tracking-[0.12em] uppercase", on ? "text-accent" : "text-fg-subtle")}>
          {pick(meta.label, locale)}
        </p>
        <span className="font-mono text-[10px] text-fg-subtle">{klass}</span>
      </div>
      <p className="mb-2 text-[11px] leading-snug text-fg-muted">{pick(meta.ask, locale)}</p>
      <div className="chart-class-chips">
        {kinds.map((kind) => {
          const selected = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={selected}
              onClick={() => onPick(kind.id)}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 py-1 text-left transition-colors",
                selected
                  ? "border-fg bg-fg text-surface"
                  : "border-border bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <span className={cn("font-mono text-[10px] tabular-nums", selected ? "text-surface/65" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="text-[12px] font-medium">{pick(kind.zh, locale)}</span>
            </button>
          );
        })}
      </div>
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
    <div className="mt-5 rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
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

export function KindDemo({
  id,
  state,
  compact = false,
}: {
  id: KindId;
  state?: string;
  compact?: boolean;
}) {
  const locale = useLocale();
  const meta: KindMeta = KINDS.find((k) => k.id === id) ?? KINDS[0]!;
  const locked = state !== undefined;

  return (
    <Window title={pick(meta.window, locale)} compact={compact}>
      <GestureChart kind={id} locked={locked} lockedState={state} />
    </Window>
  );
}
