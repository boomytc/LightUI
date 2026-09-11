import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { CarouselDemo } from "./CarouselDemo";
import { Contrast, CutMap } from "./CutMap";
import "./slides.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("classic");
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
    <div data-playground="carousel" data-kind={active} className="min-w-0">
      <CutMap active={active} locale={locale} onPick={setActive} />

      <div className="mt-5 mb-3 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tabular-nums text-accent">{meta.index} / 08</p>
          <h2 className="mt-0.5 text-[1.25rem] font-semibold tracking-tight">{meta.name}</h2>
        </div>
        <p className="max-w-xl text-[13px] leading-snug text-fg-muted">
          {pick(meta.oneLiner, locale)}
          <span className="text-fg-subtle"> · {pick(meta.tells, locale)}</span>
        </p>
      </div>

      <Contrast
        locale={locale}
        naive={pick(meta.naive, locale)}
        matched={pick(meta.matched, locale)}
        cut={pick(meta.cut, locale)}
      />

      {meta.note ? <p className="mt-3 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

      <div key={meta.id} className="slide-kind-in mt-4">
        <KindDemo id={meta.id} />
      </div>

      <SpecCard text={pick(meta.spec, locale)} locale={locale} />

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {meta.scenes.map((scene) => (
          <li
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </li>
        ))}
        {meta.rules.map((rule) => (
          <li
            key={rule.zh}
            className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-fg-muted"
          >
            {pick(rule, locale)}
          </li>
        ))}
      </ul>
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
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <p className="shrink-0 pt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
        {locale === "en" ? "Say it this way" : "说清楚"}
      </p>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-fg-muted">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[11px] text-fg-subtle transition-colors hover:text-fg"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
      </button>
    </div>
  );
}

export function KindDemo({
  id,
  index,
  autoplay,
}: {
  id: KindId;
  index?: number;
  autoplay?: boolean;
}) {
  return <CarouselDemo key={id} id={id} index={index} autoplay={autoplay} />;
}
