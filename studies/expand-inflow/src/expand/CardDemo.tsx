import { useState } from "react";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { DemoShell, HeightSlot, RestOfPage } from "./Frame";

const EXTRA = {
  zh: ["评审前先对目标", "只改这一页的交互", "记录未决，不当场拍板"],
  en: ["Align the goal before review", "Change only this page’s interaction", "Log open questions; do not decide live"],
};

export function CardDemo({
  state,
  compact = false,
}: {
  state?: string;
  compact?: boolean;
} = {}) {
  const locale = useLocale();
  const locked = state === "open" || state === "closed";
  const [open, setOpen] = useState(state === "open");
  const current = locked ? state === "open" : open;
  const extras = EXTRA[locale];

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · notes" : "Orbit · 笔记"}
      brand={locale === "en" ? "Notes" : "笔记"}
    >
      <div className="px-4 py-4 sm:px-5">
        <button
          type="button"
          aria-expanded={current}
          onClick={() => {
            if (locked) return;
            setOpen((v) => !v);
          }}
          className={cn(
            "w-full rounded-2xl border bg-surface px-4 py-4 text-left transition-colors",
            current ? "border-fg" : "border-border hover:border-border-strong",
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
            {locale === "en" ? "12 min · Product" : "12 分钟 · 产品"}
          </p>
          <h3 className="mt-2 text-[1.15rem] font-semibold tracking-tight">
            {locale === "en" ? "Design review checklist" : "设计评审清单"}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "The title stays here. Extra blocks wait for the card to grow, then fade in."
              : "标题还在这里。多出来的块等卡片长高，再淡进来。"}
          </p>
          <HeightSlot open={current} className="expand-card-extra">
            <div className="expand-card-fade mt-3 border-t border-border pt-3">
              <ul className="space-y-1.5 text-[13px] text-fg-muted">
                {extras.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[12px] font-medium text-surface">
                  {locale === "en" ? "Open" : "打开"}
                </span>
                <span className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12px] text-fg-muted">
                  {locale === "en" ? "Share" : "分享"}
                </span>
              </div>
            </div>
          </HeightSlot>
        </button>
      </div>
      <RestOfPage locale={locale} />
    </DemoShell>
  );
}
