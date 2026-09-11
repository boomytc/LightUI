import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  AXES,
  axisKinds,
  axisOf,
  mixedPair,
  placeLine,
  type AxisId,
} from "../lib/axes";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { AxisBoard } from "./AxisBoard";
import { BreadcrumbDemo } from "./BreadcrumbDemo";
import { BottomNavDemo } from "./BottomNavDemo";
import { DrawerDemo } from "./DrawerDemo";
import { DropdownDemo } from "./DropdownDemo";
import { FloatingDemo } from "./FloatingDemo";
import { MegaDemo } from "./MegaDemo";
import { OverlayDemo } from "./OverlayDemo";
import { ScrollspyDemo } from "./ScrollspyDemo";
import { ShrinkDemo } from "./ShrinkDemo";
import { SidebarDemo } from "./SidebarDemo";
import "./nav.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("floating");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];
  const axis = axisOf(active);
  const pair = mixedPair(active);
  const pairMeta = pair ? KINDS.find((k) => k.id === pair) : undefined;

  function select(id: KindId) {
    setActive(id);
  }

  function selectAxis(next: AxisId) {
    if (axisKinds(next).includes(active)) return;
    const first = axisKinds(next)[0];
    if (first) setActive(first);
  }

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
    <div data-playground="nav" data-kind={active} data-axis={axis} className="min-w-0 overflow-x-hidden">
      <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? "First name the question" : "先定这一问"}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {AXES.map((item) => {
          const on = item.id === axis;
          return (
            <button
              key={item.id}
              type="button"
              data-axis={item.id}
              onClick={() => selectAxis(item.id)}
              className={cn(
                "nav-axis-cell min-h-[4.75rem] rounded-2xl border px-3.5 py-3 text-left",
                on
                  ? "border-border-strong bg-play-glow shadow-card"
                  : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em]",
                  on ? "text-accent" : "text-fg-subtle",
                )}
              >
                {item.index}
              </span>
              <span className="mt-1 block text-[14px] font-semibold tracking-tight text-fg">
                {pick(item.label, locale)}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-fg-muted">
                {pick(item.ask, locale)}
              </span>
            </button>
          );
        })}
      </div>

      <nav
        aria-label={locale === "en" ? "Nav kinds" : "导航种类"}
        className="mt-4 flex flex-col gap-3"
      >
        {AXES.map((item) => (
          <div key={item.id} className="min-w-0">
            <p
              className={cn(
                "mb-1.5 text-[10px] font-medium tracking-[0.12em] uppercase",
                item.id === axis ? "text-accent" : "text-fg-subtle",
              )}
            >
              {pick(item.label, locale)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.kinds.map((id) => {
                const kind = KINDS.find((k) => k.id === id);
                if (!kind) return null;
                const on = kind.id === active;
                return (
                  <button
                    key={kind.id}
                    type="button"
                    data-kind={kind.id}
                    aria-pressed={on}
                    onClick={() => select(kind.id)}
                    className={cn(
                      "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[12px] leading-none",
                      on
                        ? "border-fg bg-fg text-surface shadow-card"
                        : "border-transparent bg-surface-2 text-fg-muted hover:bg-surface hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] tabular-nums",
                        on ? "text-surface/55" : "text-fg-subtle",
                      )}
                    >
                      {kind.index}
                    </span>
                    <span className="font-medium">{pick(kind.zh, locale)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 10</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <div className="flex max-w-xs flex-col items-start gap-1.5 sm:items-end">
            <p className="text-[12px] leading-relaxed text-fg-subtle sm:text-right">
              {pick(placeLine(active), locale)}
            </p>
            {pairMeta ? (
              <button
                type="button"
                onClick={() => select(pairMeta.id)}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
              >
                {locale === "en" ? "Easy mix-up · " : "容易混 · "}
                {pick(pairMeta.zh, locale)}
              </button>
            ) : null}
          </div>
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

        <AxisBoard kind={active} />

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

        <div key={meta.id} className="nav-in min-w-0">
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
    case "bottom":
      return <BottomNavDemo />;
  }
}
