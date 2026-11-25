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
    <header className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.875rem,1.4rem+1.6vw,2.625rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">
          {title}
        </h1>
        <p className="mt-3 max-w-[58ch] text-[0.9375rem] leading-[1.65] text-fg-muted">{lede}</p>
      </div>
      {children ? <div className="w-full shrink-0 sm:w-auto">{children}</div> : null}
    </header>
  );
}
