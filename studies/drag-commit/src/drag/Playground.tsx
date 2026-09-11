import { useEffect, useState } from "react";
import { ArrowDownUp, ArrowLeftRight, Check, Copy, Inbox, Undo2 } from "lucide-react";
import { KINDS, type KindId, type KindTone } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import type { StageLock } from "../lib/stage-query";
import { cn } from "../lib/utils";
import { DropzoneDemo } from "./DropzoneDemo";
import { ReorderDemo } from "./ReorderDemo";
import { SnapbackDemo } from "./SnapbackDemo";
import { TransferDemo } from "./TransferDemo";
import "./drag.css";

const KIND_ICON: Record<KindId, typeof ArrowDownUp> = {
  reorder: ArrowDownUp,
  dropzone: Inbox,
  transfer: ArrowLeftRight,
  snapback: Undo2,
};

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("reorder");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

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
        aria-label={locale === "en" ? "Drag kinds" : "拖放种类"}
        className="grid grid-cols-2 gap-2 lg:grid-cols-4"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          const Icon = KIND_ICON[kind.id];
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              data-tone={kind.tone}
              aria-pressed={on}
              onClick={() => setActive(kind.id)}
              className={cn(
                "drag-kind-card min-w-0 rounded-2xl border px-3.5 py-3 text-left",
                on
                  ? "border-transparent bg-[var(--kind-soft)]"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-2",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    on ? "text-[var(--kind)]" : "text-fg-subtle",
                  )}
                >
                  {kind.index}
                </span>
                <Icon
                  className={cn("size-3.5", on ? "text-[var(--kind)]" : "text-fg-subtle")}
                  aria-hidden="true"
                />
              </span>
              <span className="mt-2 block text-[13px] font-semibold tracking-tight">
                {pick(kind.zh, locale)}
              </span>
              <span
                className={cn(
                  "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  on ? "bg-surface/80 text-[var(--kind)]" : "bg-surface-2 text-fg-muted",
                )}
              >
                {locale === "en" ? "Commits" : "提交"} {pick(kind.commit, locale)}
              </span>
              <span className="mt-2 block text-[11px] leading-snug text-fg-subtle">
                {pick(kind.tells, locale)}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums" style={{ color: toneColor(meta.tone) }}>
              {meta.index} / 04 · {pick(meta.commit, locale)}
            </p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.writes, locale)}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-fg-muted ring-1 ring-border"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? (
          <p className="mb-4 text-[13px] font-medium" style={{ color: toneColor(meta.tone) }}>
            {pick(meta.note, locale)}
          </p>
        ) : null}

        <KindDemo key={meta.id} id={meta.id} />

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

function toneColor(tone: KindTone): string {
  if (tone === "receive") return "var(--color-intent)";
  if (tone === "reject") return "var(--color-wrong)";
  if (tone === "transfer") return "var(--color-accent)";
  return "var(--color-predict)";
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
  compact = false,
  state = "idle",
}: {
  id: KindId;
  compact?: boolean;
  state?: StageLock;
}) {
  switch (id) {
    case "reorder":
      return <ReorderDemo compact={compact} lock={state} />;
    case "dropzone":
      return <DropzoneDemo compact={compact} lock={state} />;
    case "transfer":
      return <TransferDemo compact={compact} lock={state} />;
    case "snapback":
      return <SnapbackDemo compact={compact} lock={state} />;
  }
}
