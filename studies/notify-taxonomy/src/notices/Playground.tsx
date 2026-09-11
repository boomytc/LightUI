import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { autoDismissMs, persists, weight } from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";
import { AlertDemo } from "./AlertDemo";
import { BadgeDemo } from "./BadgeDemo";
import { BannerDemo } from "./BannerDemo";
import { InboxDemo } from "./InboxDemo";
import { MarqueeDemo } from "./MarqueeDemo";
import { SnackbarDemo } from "./SnackbarDemo";
import { ToastDemo } from "./ToastDemo";
import "./notify.css";

const WEIGHT_LABEL: Record<ReturnType<typeof weight>, { zh: string; en: string }> = {
  weak: { zh: "弱", en: "Weak" },
  mid: { zh: "中", en: "Mid" },
  strong: { zh: "强", en: "Strong" },
};

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("badge");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;
  const heat = (meta.scale / KINDS.length) * 100;

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
    <div data-playground="notify" data-kind={active} className="min-w-0">
      <Ladder selected={active} locale={locale} heat={heat} onPick={setActive} />

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {WEIGHT_LABEL[weight(meta.id)][locale]}
            <span className="mx-1.5 text-border-strong">·</span>
            {pick(meta.rung, locale)}
            <span className="mx-1.5 text-border-strong">·</span>
            {pick(meta.tells, locale)}
          </p>
        </div>

        <Contrast
          locale={locale}
          naive={pick(meta.naive, locale)}
          matched={pick(meta.matched, locale)}
          rung={pick(meta.rung, locale)}
        />

        <Readout id={meta.id} locale={locale} />

        <div className="mt-4 mb-3 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? <p className="mb-3 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

        <div key={meta.id} className="notify-kind-in">
          <KindDemo id={meta.id} />
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
      </section>
    </div>
  );
}

function Ladder({
  selected,
  locale,
  heat,
  onPick,
}: {
  selected: KindId;
  locale: Locale;
  heat: number;
  onPick: (id: KindId) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-intent">
          {locale === "en" ? "Glance · can miss" : "瞄一眼 · 可错过"}
        </p>
        <p className="text-[11px] font-medium tracking-wide text-wrong">
          {locale === "en" ? "Must see · must handle" : "必须看见 · 必须处理"}
        </p>
      </div>

      <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", reduce ? "" : "notify-heat")}
          style={{
            width: `${heat}%`,
            background:
              "linear-gradient(90deg, var(--color-intent) 0%, var(--color-accent) 46%, var(--color-wrong) 100%)",
          }}
        />
      </div>

      <nav
        aria-label={locale === "en" ? "Notice weight" : "打断档位"}
        className="-mx-1 overflow-x-auto pb-1"
      >
        <ol className="grid min-w-[44rem] grid-cols-7 gap-1.5 px-1 sm:min-w-0">
          {KINDS.map((kind) => {
            const on = selected === kind.id;
            const bar = 16 + kind.scale * 6;
            const rung = WEIGHT_LABEL[weight(kind.id)][locale];
            return (
              <li key={kind.id}>
                <button
                  type="button"
                  data-kind={kind.id}
                  aria-pressed={on}
                  onClick={() => onPick(kind.id)}
                  className={cn(
                    "flex h-full w-full flex-col rounded-xl border px-2 py-2.5 text-left transition-colors",
                    on
                      ? "border-fg bg-fg text-surface shadow-card"
                      : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-between gap-1 font-mono text-[10px] tabular-nums",
                      on ? "text-surface/50" : "text-fg-subtle",
                    )}
                  >
                    <span>{kind.index}</span>
                    <span>{rung}</span>
                  </span>
                  <span className="mt-1 text-[12px] font-semibold leading-tight">
                    {pick(kind.rung, locale)}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 line-clamp-2 text-[10px] leading-snug",
                      on ? "text-surface/55" : "text-fg-subtle",
                    )}
                  >
                    {pick(kind.zh, locale)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-2 block w-full rounded-sm",
                      on ? "bg-surface/35" : "bg-fg/12",
                    )}
                    style={{ height: bar }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
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
          {locale === "en" ? "Always a pop" : "一律弹一下"}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{naive}</p>
      </aside>
      <aside className="rounded-xl border border-intent/30 bg-intent-soft px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-intent uppercase">
          {locale === "en" ? "This rung" : "这一档"}
          <span className="ml-1.5 font-sans normal-case tracking-normal text-intent/70">{rung}</span>
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg">{matched}</p>
      </aside>
    </div>
  );
}

function Readout({ id, locale }: { id: KindId; locale: Locale }) {
  const ms = autoDismissMs(id);
  const keep = persists(id);
  const rung = WEIGHT_LABEL[weight(id)][locale];
  return (
    <p className="mt-3 font-mono text-[11px] leading-relaxed text-fg-subtle">
      weight {rung}
      <span className="mx-1.5 text-border-strong">·</span>
      {ms
        ? locale === "en"
          ? `gone in ${ms / 1000}s`
          : `${ms / 1000} 秒后消失`
        : locale === "en"
          ? "does not auto-dismiss"
          : "不自动消失"}
      <span className="mx-1.5 text-border-strong">·</span>
      {keep
        ? locale === "en"
          ? "stays on the record"
          : "留档或钉住"
        : locale === "en"
          ? "not a log"
          : "不留档"}
    </p>
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
    <div className="mb-4 flex items-center gap-3 rounded-xl bg-fg px-3 py-2 text-surface">
      <p className="shrink-0 text-[10px] font-medium tracking-wide text-surface/45">
        {locale === "en" ? "Say it" : "说清楚"}
      </p>
      <p className="min-w-0 flex-1 line-clamp-2 text-[12px] leading-snug text-surface/85">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-surface/45 transition-colors hover:text-surface"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
      </button>
    </div>
  );
}

export function KindDemo({ id, state }: { id: KindId; state?: string }) {
  switch (id) {
    case "badge":
      return <BadgeDemo state={state} />;
    case "toast":
      return <ToastDemo state={state} />;
    case "snackbar":
      return <SnackbarDemo state={state} />;
    case "marquee":
      return <MarqueeDemo state={state} />;
    case "inbox":
      return <InboxDemo state={state} />;
    case "alert":
      return <AlertDemo state={state} />;
    case "banner":
      return <BannerDemo state={state} />;
  }
}
