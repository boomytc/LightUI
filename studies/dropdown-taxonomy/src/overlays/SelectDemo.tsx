import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { ORDER_STATUSES } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, TriggerButton } from "./Frame";
import { Popover } from "./Popover";

export function SelectDemo() {
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const current = ORDER_STATUSES.find((o) => o.id === value);

  return (
    <Frame title={locale === "en" ? "Orders · status" : "订单管理 · 订单状态"}>
      <FieldLabel>{locale === "en" ? "Order status" : "订单状态"}</FieldLabel>
      <TriggerButton
        ref={triggerRef}
        open={open}
        aria-haspopup="listbox"
        aria-label={locale === "en" ? "Order status" : "订单状态"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={current ? "text-fg" : "text-fg-subtle"}>
          {current ? pick(current.label, locale) : locale === "en" ? "Choose a status" : "请选择状态"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-fg-muted" />
      </TriggerButton>
      <Popover open={open} onClose={() => setOpen(false)} triggerRef={triggerRef}>
        <ul role="listbox" aria-label={locale === "en" ? "Statuses" : "状态"} className="p-1">
          {ORDER_STATUSES.map((opt) => {
            const on = opt.id === value;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    setValue(opt.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[14px]",
                    on ? "bg-accent-soft" : "hover:bg-surface-2",
                  )}
                >
                  {pick(opt.label, locale)}
                  {on ? <Check className="size-3.5 text-accent" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
      <div className="mt-8 flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[13px]">
        <span className="text-fg-muted">#20260811</span>
        <span className={current ? "text-accent" : "text-fg-subtle"}>
          {current ? pick(current.label, locale) : locale === "en" ? "Unset" : "未设置"}
        </span>
      </div>
    </Frame>
  );
}
