import type { ReactNode } from "react";

export function BrowserFrame({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent/70" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
        </div>
        <div className="rounded-full bg-surface px-3.5 py-0.5 font-mono text-[0.7rem] text-fg-muted border border-border">
          {url}
        </div>
        <div className="w-10" />
      </div>
      <div className="bg-surface">{children}</div>
    </div>
  );
}
