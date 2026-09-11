import {
  Children,
  cloneElement,
  isValidElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { shownCopy, type CopySlot, type FieldMark, type LiveTone } from "../lib/machines";
import { cn } from "../lib/utils";

export function Field({
  id,
  label,
  mark,
  requiredSr,
  optionalLabel,
  helper,
  message,
  tone = "idle",
  stack = false,
  children,
}: {
  id: string;
  label: string;
  mark?: FieldMark;
  requiredSr?: string;
  optionalLabel?: string;
  helper?: string;
  message?: string;
  tone?: LiveTone;
  stack?: boolean;
  children: ReactNode;
}) {
  const slot: CopySlot = stack
    ? "none"
    : shownCopy({
        hasHelper: Boolean(helper),
        hasError: tone === "error" && Boolean(message),
        hasOk: tone === "ok" && Boolean(message),
      });
  const showHelper = stack ? Boolean(helper) : slot === "helper";
  const showError = stack ? Boolean(message) && tone === "error" : slot === "error";
  const showOk = !stack && slot === "ok";
  const describedBy = [
    showHelper ? `${id}-helper` : null,
    showError || showOk ? `${id}-msg` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const child = Children.map(children, (node) => {
    if (!isValidElement(node)) return node;
    return cloneElement(node as ReactElement<{ "aria-describedby"?: string }>, {
      "aria-describedby": describedBy || undefined,
    });
  });

  return (
    <div className="flex min-w-0 flex-col gap-1.5" data-tone={tone}>
      <div className="flex min-h-5 items-baseline gap-1.5">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
        </label>
        {mark?.star ? (
          <span className="fill-mark-in text-wrong" aria-hidden="true">
            *
          </span>
        ) : null}
        {mark?.srRequired && requiredSr ? <span className="sr-only">{requiredSr}</span> : null}
        {mark?.optional && optionalLabel ? (
          <span className="fill-mark-in rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-fg-subtle">
            {optionalLabel}
          </span>
        ) : null}
      </div>
      {child}
      {showHelper ? (
        <p id={`${id}-helper`} className="fill-msg-in text-[12px] leading-snug text-fg-muted">
          {helper}
        </p>
      ) : null}
      {showError ? (
        <p
          id={`${id}-msg`}
          className="fill-msg-in flex items-start gap-1.5 text-[12px] leading-snug text-wrong"
          role="alert"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
          <span>{message}</span>
        </p>
      ) : null}
      {showOk ? (
        <p id={`${id}-msg`} className="fill-msg-in flex items-start gap-1.5 text-[12px] leading-snug text-intent">
          <CircleCheck className="mt-px size-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}

const ring: Record<LiveTone | "focus", string> = {
  idle: "border-border-strong",
  focus: "border-accent shadow-[0_0_0_3px_var(--color-ring)]",
  error: "border-wrong bg-wrong-soft",
  ok: "border-intent bg-intent-soft",
};

const controlBase =
  "fill-control h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-[14px] text-fg outline-none placeholder:text-fg-subtle disabled:opacity-60";

export function FieldInput({
  tone = "idle",
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { tone?: LiveTone | "focus" }) {
  return (
    <input
      className={cn(
        controlBase,
        ring[tone],
        tone === "idle" && "focus:border-accent focus:shadow-[0_0_0_3px_var(--color-ring)]",
        tone === "error" && "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-wrong)_28%,transparent)]",
        className,
      )}
      aria-invalid={tone === "error"}
      {...props}
    />
  );
}

export function FieldSelect({
  tone = "idle",
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { tone?: LiveTone | "focus" }) {
  return (
    <select
      className={cn(
        controlBase,
        "fill-select pr-9",
        ring[tone],
        tone === "idle" && "focus:border-accent focus:shadow-[0_0_0_3px_var(--color-ring)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
