import { useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { SKILL_MAX, SKILLS } from "../lib/fixtures";
import { clearMulti, isBlocked, removeMulti, toggleMulti } from "../lib/multi-select";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, TriggerButton } from "./Frame";
import { Popover } from "./Popover";

export function MultiSelectDemo() {
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["design"]);

  return (
    <Frame title={locale === "en" ? "Profile · skills" : "个人资料 · 技能标签"}>
      <FieldLabel>{locale === "en" ? "Your skills" : "你的技能"}</FieldLabel>
      <TriggerButton
        ref={triggerRef}
        open={open}
        aria-haspopup="listbox"
        aria-label={locale === "en" ? "Your skills" : "你的技能"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-fg-subtle">{locale === "en" ? "Choose skills" : "选择技能"}</span>
          ) : (
            selected.map((id) => {
              const item = SKILLS.find((s) => s.id === id);
              if (!item) return null;
              const label = pick(item.label, locale);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-[13px] text-fg"
                >
                  {label}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={locale === "en" ? `Remove ${label}` : `移除 ${label}`}
                    className="grid size-4 place-items-center rounded-sm text-fg-muted hover:text-fg"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelected((prev) => removeMulti(prev, id));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        setSelected((prev) => removeMulti(prev, id));
                      }
                    }}
                  >
                    <X className="size-3" />
                  </span>
                </span>
              );
            })
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 text-fg-muted" />
      </TriggerButton>
      <Popover open={open} onClose={() => setOpen(false)} triggerRef={triggerRef}>
        <ul role="listbox" aria-multiselectable className="p-1">
          {SKILLS.map((skill) => {
            const on = selected.includes(skill.id);
            const blocked = isBlocked(selected, skill.id, SKILL_MAX);
            return (
              <li key={skill.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  disabled={blocked}
                  onClick={() => setSelected((prev) => toggleMulti(prev, skill.id, SKILL_MAX))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[14px]",
                    on && "bg-accent-soft",
                    blocked && "opacity-40",
                    !blocked && !on && "hover:bg-surface-2",
                    !blocked && on && "hover:bg-accent-soft",
                  )}
                >
                  {pick(skill.label, locale)}
                  {on ? <Check className="size-3.5 text-accent" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
      <p className="mt-3 text-[12px] tabular-nums text-fg-subtle">
        {locale === "en"
          ? `${selected.length} selected · max ${SKILL_MAX}`
          : `已选择 ${selected.length} 项 · 最多 ${SKILL_MAX} 项`}
        {selected.length > 0 ? (
          <>
            {" · "}
            <button
              type="button"
              className="text-accent underline-offset-2 hover:underline"
              onClick={() => setSelected(clearMulti())}
            >
              {locale === "en" ? "Clear all" : "一键清空"}
            </button>
          </>
        ) : null}
      </p>
    </Frame>
  );
}
