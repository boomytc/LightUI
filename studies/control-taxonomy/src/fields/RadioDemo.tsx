import { useState } from "react";
import { SHIPPING } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Frame } from "./Frame";

const IDS = new Set(SHIPPING.map((s) => s.id));

export function RadioDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const initial = state && IDS.has(state) ? state : "standard";
  const [value, setValue] = useState(initial);

  return (
    <Frame title={locale === "en" ? "Checkout · shipping" : "结算 · 配送方式"}>
      <p className="mb-3 text-[13px] text-fg-muted" id="shipping-label">
        {locale === "en" ? "Shipping" : "配送方式"}
      </p>
      <div role="radiogroup" aria-labelledby="shipping-label" className="flex flex-col gap-2">
        {SHIPPING.map((item) => {
          const on = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={on}
              data-state={item.id}
              onClick={() => setValue(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                on ? "border-accent bg-accent-soft" : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full border",
                  on ? "border-accent bg-accent" : "border-border-strong bg-surface",
                )}
                aria-hidden="true"
              >
                {on ? <span className="size-1.5 rounded-full bg-accent-fg" /> : null}
              </span>
              <span>
                <span className="block text-[14px] font-medium text-fg">{pick(item.title, locale)}</span>
                <span className="block text-[12px] text-fg-subtle">{pick(item.hint, locale)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Frame>
  );
}
