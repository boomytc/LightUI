import { useRef } from "react";
import { Search } from "lucide-react";
import { PRESET_QUERIES } from "../lib/bm25/corpus.ts";
import { useLocale } from "../lib/site-locale.ts";
import { useLabStore } from "../lib/store.ts";
import { cn } from "../lib/utils.ts";

export function QueryDock() {
  const locale = useLocale();
  const query = useLabStore((s) => s.query);
  const setQuery = useLabStore((s) => s.setQuery);
  const composing = useRef(false);

  return (
    <div className="space-y-3">
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
        <input
          type="text"
          value={query}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={(e) => {
            composing.current = false;
            setQuery(e.currentTarget.value);
          }}
          onChange={(e) => {
            if (!composing.current) setQuery(e.target.value);
          }}
          placeholder={locale === "en" ? "Enter search query, e.g. 二零二四年第三季度营收" : "输入查询，例如：二零二四年第三季度营收"}
          className="h-11 w-full rounded-xl bg-surface border border-border pl-10 pr-4 text-sm text-fg placeholder:text-fg-subtle shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          aria-label={locale === "en" ? "Search query" : "检索查询"}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRESET_QUERIES.map((p) => (
          <button
            key={p.q}
            type="button"
            onClick={() => setQuery(p.q)}
            className={cn(
              "h-8 shrink-0 rounded-full px-3 text-xs font-medium border border-border shadow-xs transition-colors duration-150 cursor-pointer",
              query === p.q
                ? "bg-accent text-accent-fg border-transparent font-semibold"
                : "bg-surface text-fg-muted hover:text-fg hover:bg-surface-2",
            )}
          >
            {locale === "en" ? p.labelEn : p.labelZh}
          </button>
        ))}
      </div>
    </div>
  );
}
