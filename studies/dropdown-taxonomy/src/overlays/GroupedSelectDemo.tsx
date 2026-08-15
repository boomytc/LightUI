import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { TEAMS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, TriggerButton } from "./Frame";
import { Popover } from "./Popover";

export function GroupedSelectDemo() {
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("linyi");
  const current = TEAMS.flatMap((g) => g.items).find((item) => item.id === value);

  return (
    <Frame title={locale === "en" ? "Start a review · member" : "发起评审 · 选择成员"}>
      <FieldLabel>{locale === "en" ? "Reviewer" : "评审成员"}</FieldLabel>
      <TriggerButton
        ref={triggerRef}
        open={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current ? pick(current.label, locale) : ""}</span>
        <ChevronDown className="size-4 shrink-0 text-fg-muted" />
      </TriggerButton>
      <Popover open={open} onClose={() => setOpen(false)} triggerRef={triggerRef}>
        <div className="max-h-72 overflow-y-auto p-1">
          {TEAMS.map((group) => (
            <div key={group.id} role="group" aria-label={pick(group.label, locale)}>
              <p className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-fg-subtle">
                {pick(group.label, locale)}
              </p>
              <ul>
                {group.items.map((item) => {
                  const on = item.id === value;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={on}
                        onClick={() => {
                          setValue(item.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[14px]",
                          on ? "bg-accent-soft" : "hover:bg-surface-2",
                        )}
                      >
                        {pick(item.label, locale)}
                        {on ? <Check className="size-3.5 text-accent" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Popover>
      <p className="mt-3 text-[12px] text-fg-subtle">
        {locale === "en"
          ? "Groups only file the list. There is no parent–child, and no path."
          : "分组只是整理选项，没有上下级，也不会拼成路径。"}
      </p>
    </Frame>
  );
}
