import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "../lib/utils";

export function DemoShell({
  compact = false,
  title,
  action,
  footer,
  children,
}: {
  compact?: boolean;
  title: string;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex min-w-0 flex-col overflow-hidden border border-border bg-surface shadow-card",
        compact ? "min-h-[22rem] rounded-2xl" : "h-[28rem] w-full rounded-2xl sm:h-[32rem]",
      )}
    >
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className="truncate text-[12px] text-fg-subtle">{title}</p>
        </div>
        {action}
      </div>
      <div className="relative min-h-0 min-w-0 flex-1">{children}</div>
      {footer ? (
        <div className="flex h-10 shrink-0 items-center border-t border-border px-4 text-[11px] text-fg-subtle">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function CardFace({
  title,
  meta,
  dim = false,
  className,
  style,
}: {
  title: string;
  meta: string;
  dim?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "flex h-14 items-center gap-3 rounded-xl border border-border bg-surface px-3",
        dim && "opacity-40",
        className,
      )}
    >
      <GripVertical className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight">{title}</p>
        <p className="text-[11px] text-fg-subtle">{meta}</p>
      </div>
    </div>
  );
}

export function ChipFace({
  title,
  dim = false,
  className,
}: {
  title: string;
  dim?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-border bg-surface px-3 text-[13px] font-medium",
        dim && "opacity-40",
        className,
      )}
    >
      {title}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "ghost" | "outline";
};

export function Btn({ tone = "ghost", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-7 shrink-0 items-center justify-center rounded-md px-2 text-[12px] font-medium outline-none",
        tone === "ghost" && "text-fg-muted hover:bg-surface-2 hover:text-fg",
        tone === "outline" && "border border-border-strong bg-surface text-fg hover:bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}
