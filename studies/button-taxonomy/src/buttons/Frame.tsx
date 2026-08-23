import type { ReactNode } from "react";
import { filled, weight, type KindId } from "../lib/machines";
import { cn } from "../lib/utils";

export function Window({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 max-w-[390px] overflow-x-hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className="truncate text-[12px] text-fg-subtle">{title}</p>
        </div>
      </div>
      <div className="min-w-0 overflow-x-hidden p-5">{children}</div>
    </div>
  );
}

export function ActionButton({
  kind,
  named,
  children,
}: {
  kind: KindId;
  named?: boolean;
  children: ReactNode;
}) {
  const rung = weight(kind);
  return (
    <button
      type="button"
      data-kind={kind}
      data-weight={rung}
      data-filled={filled(kind) ? "true" : "false"}
      data-named={named ? "true" : undefined}
      className={cn(
        "inline-flex h-10 w-fit shrink-0 items-center justify-center whitespace-nowrap text-[13px] font-medium",
        kind === "solid" && "rounded-lg bg-fg px-4 text-surface",
        kind === "outline" && "rounded-lg border border-border-strong bg-transparent px-4 text-fg",
        kind === "text" && "rounded-md px-2 text-fg-muted",
        named && "ring-2 ring-accent ring-offset-2 ring-offset-surface",
      )}
    >
      {children}
    </button>
  );
}
