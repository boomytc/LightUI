import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Frame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      data-nav-frame=""
      className="@container min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      <div className="flex items-center gap-3 border-b border-border px-3 py-2.5 @min-[32rem]:px-4">
        <span className="flex gap-1" aria-hidden="true">
          <i className="size-2 rounded-full bg-[#ff5f57]" />
          <i className="size-2 rounded-full bg-[#febc2e]" />
          <i className="size-2 rounded-full bg-[#28c840]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] text-fg-subtle">{title}</p>
      </div>
      <div className="relative h-[28rem] min-h-[28rem] min-w-0">{children}</div>
    </div>
  );
}

export function FakeCards({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 @min-[32rem]:grid-cols-4">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="aspect-[4/3] rounded-lg bg-surface-2 ring-1 ring-border" />
      ))}
    </div>
  );
}

export function FakeLines({ n = 3 }: { n?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="h-2 rounded-full bg-surface-2" style={{ width: `${88 - i * 14}%` }} />
      ))}
    </div>
  );
}

export function HeroWash({ compact, dusk }: { compact?: boolean; dusk?: boolean }) {
  return (
    <div
      className={cn(
        dusk
          ? "bg-linear-to-br from-fg via-fg-muted to-accent"
          : "bg-linear-to-br from-accent-soft via-surface-2 to-bg-warm",
        compact ? "h-24" : "h-40",
      )}
    />
  );
}
