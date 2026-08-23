import { createContext, forwardRef, useContext, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

const LiveFillContext = createContext(false);

export function LiveFill({ children }: { children: ReactNode }) {
  return (
    <LiveFillContext.Provider value={true}>
      <div className="h-full min-h-0 flex-1">{children}</div>
    </LiveFillContext.Provider>
  );
}

export function useLiveFill() {
  return useContext(LiveFillContext);
}

export function Frame({ title, children }: { title: string; children: ReactNode }) {
  const fill = useLiveFill();
  return (
    <div
      data-live={fill ? "pane" : "compact"}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
        fill && "flex h-full min-h-[20rem] flex-col lg:min-h-[32rem]",
      )}
    >
      <div className="shrink-0 border-b border-border px-4 py-2.5">
        <p className="truncate text-[12px] text-fg-subtle">{title}</p>
      </div>
      <div
        className={cn(
          "p-5 sm:p-6",
          fill && "flex min-h-0 flex-1 flex-col p-6 sm:p-8 lg:px-10 lg:py-8",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-1 text-[13px] text-fg-muted">
      {children}
      {required ? (
        <span className="text-fg" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
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

export const fieldClass =
  "min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-[14px] outline-none placeholder:text-fg-subtle";
