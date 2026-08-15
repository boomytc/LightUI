import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      data-film="fixture"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      <div className="border-b border-border px-4 py-2.5">
        <p className="truncate text-[12px] text-fg-subtle">{title}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-[13px] text-fg-muted">{children}</label>;
}

type TriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean };

export const TriggerButton = forwardRef<HTMLButtonElement, TriggerProps>(function TriggerButton(
  { open, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      className={
        className ??
        (open
          ? "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-accent bg-surface px-3 py-1.5 text-left text-[14px] outline-none"
          : "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-left text-[14px] outline-none transition-colors hover:border-accent")
      }
      {...props}
    >
      {children}
    </button>
  );
});
