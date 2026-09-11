import type { ReactNode } from "react";

export function PageHero({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.85rem] font-semibold tracking-tight sm:text-[2.15rem]">{title}</h1>
        <p className="mt-2 max-w-[42rem] text-[15px] leading-relaxed text-fg-muted">{lede}</p>
      </div>
      {children ? <div className="w-full shrink-0 sm:w-auto">{children}</div> : null}
    </header>
  );
}
