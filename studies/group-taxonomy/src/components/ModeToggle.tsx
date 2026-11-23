import type { GroupMode } from "../lib/machines.js";
import { useLocale } from "../lib/site-locale.js";

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: GroupMode;
  onChange: (mode: GroupMode) => void;
}) {
  const locale = useLocale();
  return (
    <div className="flex items-center gap-2">
      <div
        role="radiogroup"
        aria-label={locale === "en" ? "Comparison mode" : "对照模式"}
        className="mode-toggle"
      >
        <span
          className="mode-toggle-thumb"
          data-mode={mode}
          aria-hidden
        />
        <button
          type="button"
          role="radio"
          aria-checked={mode === "cards"}
          onClick={() => onChange("cards")}
          className={mode === "cards" ? "is-on" : ""}
        >
          {locale === "en" ? "Cards default" : "默认卡片"}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "grouped"}
          onClick={() => onChange("grouped")}
          className={mode === "grouped" ? "is-on" : ""}
        >
          {locale === "en" ? "Semantic group" : "语义分组"}
        </button>
      </div>
      <kbd className="hidden rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-fg-subtle sm:inline-block">
        T
      </kbd>
    </div>
  );
}
