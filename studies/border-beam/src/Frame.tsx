import type { ReactNode } from "react";

export function Window({
  title,
  kicker,
  heading,
  footnote,
  children,
}: {
  title: string;
  kicker?: string;
  heading?: string;
  footnote?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full min-w-0 overflow-x-hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border px-3">
        <span className="flex gap-1" aria-hidden="true">
          <i className="size-2 rounded-full bg-[#ff5f57]" />
          <i className="size-2 rounded-full bg-[#febc2e]" />
          <i className="size-2 rounded-full bg-[#28c840]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] text-fg-subtle">{title}</p>
        <span className="w-8" aria-hidden="true" />
      </div>
      <div className="min-w-0 overflow-x-hidden px-4 py-4">
        {kicker ? (
          <p className="text-[11px] font-medium tracking-[0.16em] text-accent">{kicker}</p>
        ) : null}
        {heading ? (
          <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">{heading}</h3>
        ) : null}
        <div className={kicker || heading ? "mt-4 min-w-0" : "min-w-0"}>{children}</div>
        {footnote ? <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">{footnote}</p> : null}
      </div>
    </div>
  );
}
