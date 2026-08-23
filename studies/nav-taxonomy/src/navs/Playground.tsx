import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { BreadcrumbDemo } from "./BreadcrumbDemo";
import { DrawerDemo } from "./DrawerDemo";
import { DropdownDemo } from "./DropdownDemo";
import { FloatingDemo } from "./FloatingDemo";
import { MegaDemo } from "./MegaDemo";
import { OverlayDemo } from "./OverlayDemo";
import { ScrollspyDemo } from "./ScrollspyDemo";
import { ShrinkDemo } from "./ShrinkDemo";
import { SidebarDemo } from "./SidebarDemo";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("floating");
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
    <div className="min-w-0 overflow-x-hidden">
      <nav
        aria-label={locale === "en" ? "Nav kinds" : "导航种类"}
        className="flex flex-wrap gap-1.5"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => setActive(kind.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-transparent bg-surface-2 hover:bg-surface",
              )}
            >
              <span className={cn("font-mono text-[10px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="font-medium">{pick(kind.zh, locale)}</span>
            </button>
          );
        })}
      </nav>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 09</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.lives, locale)}
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

        <div className="min-w-0">
          <KindDemo key={meta.id} id={meta.id} />
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

function SpecCard({ text, locale }: { text: string; locale: "zh" | "en" }) {
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

export function KindDemo({ id, defaultOpen }: { id: KindId; defaultOpen?: boolean }) {
  switch (id) {
    case "floating":
      return <FloatingDemo />;
    case "sidebar":
      return <SidebarDemo />;
    case "breadcrumb":
      return <BreadcrumbDemo />;
    case "dropdown":
      return <DropdownDemo defaultOpen={defaultOpen} />;
    case "mega":
      return <MegaDemo defaultOpen={defaultOpen} />;
    case "drawer":
      return <DrawerDemo defaultOpen={defaultOpen} />;
    case "overlay":
      return <OverlayDemo defaultOpen={defaultOpen} />;
    case "scrollspy":
      return <ScrollspyDemo />;
    case "shrink":
      return <ShrinkDemo />;
  }
}
