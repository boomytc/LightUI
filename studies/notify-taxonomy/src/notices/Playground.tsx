import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { weight } from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { AlertDemo } from "./AlertDemo";
import { BadgeDemo } from "./BadgeDemo";
import { BannerDemo } from "./BannerDemo";
import { InboxDemo } from "./InboxDemo";
import { MarqueeDemo } from "./MarqueeDemo";
import { SnackbarDemo } from "./SnackbarDemo";
import { ToastDemo } from "./ToastDemo";

const WEIGHT_LABEL: Record<ReturnType<typeof weight>, { zh: string; en: string }> = {
  weak: { zh: "弱", en: "Weak" },
  mid: { zh: "中", en: "Mid" },
  strong: { zh: "强", en: "Strong" },
};

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("badge");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

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
    <div className="min-w-0">
      <nav
        aria-label={locale === "en" ? "Notice kinds" : "提示种类"}
        className="mb-5 flex flex-wrap gap-1.5"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          const rung = WEIGHT_LABEL[weight(kind.id)][locale];
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              onClick={() => setActive(kind.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] transition-colors",
                on
                  ? "border-fg bg-fg text-surface"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              <span className={cn("font-mono text-[10px] tabular-nums", on ? "text-surface/55" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="font-medium">{pick(kind.zh, locale)}</span>
              <span className={cn("text-[10px]", on ? "text-surface/55" : "text-fg-subtle")}>{rung}</span>
            </button>
          );
        })}
      </nav>

      <section className="min-w-0 overflow-x-hidden">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
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

        <KindDemo id={meta.id} />

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
