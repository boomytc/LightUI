import type { ReactNode } from "react";

export function BrowserFrame({
  url,
  toolbar,
  children,
}: {
  url: string;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-accent/70" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
        </div>
        <div className="hidden min-w-0 flex-1 truncate rounded-full border border-border bg-surface px-3 py-0.5 text-center font-mono text-[0.65rem] text-fg-muted sm:block">
          {url}
        </div>
        {toolbar ? <div className="shrink-0">{toolbar}</div> : <div className="w-10" />}
      </div>
      <div className="bg-surface">{children}</div>
    </div>
  );
}
