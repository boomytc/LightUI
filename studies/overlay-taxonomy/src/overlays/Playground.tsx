import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { AxisReadout, Matrix } from "./Matrix";
import { DrawerDemo } from "./DrawerDemo";
import { ModalDemo } from "./ModalDemo";
import { PopoverDemo } from "./PopoverDemo";
import { SheetDemo } from "./SheetDemo";
import { TooltipDemo } from "./TooltipDemo";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("modal");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const n = Number(event.key);
      if (n >= 1 && n <= KINDS.length) {
        event.preventDefault();
        setActive(KINDS[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-playground="overlay" data-kind={active} className="min-w-0 overflow-x-hidden">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <p className="text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "Interrupt × attach" : "打断 × 贴附"}
        </p>
        <p className="hidden text-[11px] text-fg-subtle sm:block">
          {locale === "en" ? "Keys 1–5 pick a leaf." : "数字键 1–5 选一档。"}
        </p>
      </div>

      <Matrix active={active} locale={locale} onPick={setActive} />

      <section className="mt-7 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 05</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <div className="mt-1.5">
              <AxisReadout id={meta.id} locale={locale} />
            </div>
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

        <div key={meta.id} className="overlay-kind-in">
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
  open,
  compact = false,
}: {
  id: KindId;
  open?: boolean;
  compact?: boolean;
}) {
  switch (id) {
    case "modal":
      return <ModalDemo defaultOpen={open} compact={compact} />;
    case "drawer":
      return <DrawerDemo defaultOpen={open} compact={compact} />;
    case "popover":
      return <PopoverDemo defaultOpen={open} compact={compact} />;
    case "tooltip":
      return <TooltipDemo defaultOpen={open} compact={compact} />;
    case "sheet":
      return <SheetDemo defaultOpen={open} compact={compact} />;
  }
}
