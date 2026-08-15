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
      data-film="fixture"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      <div className="border-b border-border px-4 py-2.5">
        <p className="truncate text-[12px] text-fg-subtle">{title}</p>
      </div>
      <div className="relative h-[22rem]">{children}</div>
    </div>
  );
}

export function FakeCards({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
        compact ? "h-24" : "h-36",
      )}
    />
  );
}
