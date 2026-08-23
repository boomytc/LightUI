import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CITIES } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, TriggerButton } from "./Frame";
import { Popover } from "./Popover";

export function SelectDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(state === "open");
  const [value, setValue] = useState(state === "open" || state === "shanghai" ? "shanghai" : "");
  const current = CITIES.find((c) => c.id === value);

  return (
    <Frame title={locale === "en" ? "Profile · city" : "资料 · 所在城市"}>
      <FieldLabel>{locale === "en" ? "City" : "所在城市"}</FieldLabel>
      <TriggerButton
        ref={triggerRef}
        open={open}
        aria-haspopup="listbox"
        aria-label={locale === "en" ? "City" : "所在城市"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={current ? "text-fg" : "text-fg-subtle"}>
          {current ? pick(current.label, locale) : locale === "en" ? "Choose one" : "请选择"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-fg-muted" />
      </TriggerButton>
      <Popover open={open} onClose={() => setOpen(false)} triggerRef={triggerRef}>
        <ul role="listbox" aria-label={locale === "en" ? "Cities" : "城市"} className="max-h-56 overflow-y-auto p-1">
          {CITIES.map((city) => {
            const on = city.id === value;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    setValue(city.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[14px]",
                    on ? "bg-accent-soft" : "hover:bg-surface-2",
                  )}
                >
                  {pick(city.label, locale)}
                  {on ? <Check className="size-3.5 text-accent" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
    </Frame>
  );
}
