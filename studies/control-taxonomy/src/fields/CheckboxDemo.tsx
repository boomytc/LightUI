import { useState } from "react";
import { Check } from "lucide-react";
import { INTEREST_MAX, INTERESTS } from "../lib/fixtures";
import { isCapped, toggleCapped } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Frame } from "./Frame";

export function CheckboxDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const [picked, setPicked] = useState<string[]>(
    state === "max" ? ["design", "write", "focus"] : ["design"],
  );

  return (
    <Frame title={locale === "en" ? "Profile · interests" : "资料 · 兴趣标签"}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[13px] text-fg-muted" id="interest-label">
          {locale === "en" ? "Interests" : "兴趣标签"}
        </p>
        <p className="text-[12px] tabular-nums text-fg-subtle">
          {picked.length}/{INTEREST_MAX}
        </p>
      </div>
      <div role="group" aria-labelledby="interest-label" className="grid grid-cols-2 gap-2">
        {INTERESTS.map((item) => {
          const on = picked.includes(item.id);
          const locked = isCapped(picked, item.id, INTEREST_MAX);
          return (
            <button
              key={item.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              data-state={item.id}
              disabled={locked}
              onClick={() => setPicked((curr) => toggleCapped(curr, item.id, INTEREST_MAX))}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                on ? "border-accent bg-accent-soft" : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-sm border",
                  on ? "border-accent bg-accent text-accent-fg" : "border-border-strong bg-surface",
                )}
                aria-hidden="true"
              >
                {on ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
              <span className="text-[14px] font-medium text-fg">{pick(item.label, locale)}</span>
            </button>
          );
        })}
      </div>
    </Frame>
  );
}
