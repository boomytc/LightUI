import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Page } from "../components/Page";
import { StudyCard } from "../components/StudyCard";
import { CATEGORIES, filterStudies, type CategoryId } from "../lib/categories";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { updateSearchParams, useSearchParams } from "../lib/nav";
import { usePrefs } from "../lib/prefs";

export function Studies() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const allStudies = loadStudies().filter((s) => s.meta.status !== "retired");

  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CategoryId) || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || undefined;

  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    CATEGORIES.some((c) => c.id === initialCategory) ? initialCategory : "all",
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initialTag);

  useEffect(() => {
    const cat = (searchParams.get("category") as CategoryId) || "all";
    if (CATEGORIES.some((c) => c.id === cat)) {
      setActiveCategory(cat);
    }
    setSearchQuery(searchParams.get("q") || "");
    setSelectedTag(searchParams.get("tag") || undefined);
  }, [searchParams]);

  const handleCategoryChange = (catId: CategoryId) => {
    setActiveCategory(catId);
    setSelectedTag(undefined);
    updateSearchParams({ category: catId === "all" ? null : catId, tag: null }, { replace: true });
  };

  const handleQueryChange = (q: string) => {
    setSearchQuery(q);
    updateSearchParams({ q: q || null }, { replace: true });
  };

  const handleSelectTag = (tag: string | undefined) => {
    setSelectedTag(tag);
    updateSearchParams({ tag: tag || null }, { replace: true });
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedTag(undefined);
    setActiveCategory("all");
    updateSearchParams({ category: null, tag: null, q: null }, { replace: true });
  };

  const filtered = filterStudies(allStudies, searchQuery, activeCategory, selectedTag);
  const activeCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <Page as="main" className="pb-20 pt-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[1.8rem] font-semibold tracking-tight sm:text-[2.2rem]">{copy.studiesTitle}</h1>
          <p className="mt-2 max-w-[42rem] text-[15px] leading-relaxed text-fg-muted">{copy.studiesLede}</p>
        </div>

        <div className="relative min-w-[16rem] sm:min-w-[20rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-8 text-[13px] text-fg shadow-sm outline-none transition-colors placeholder:text-fg-subtle focus:border-border-strong focus:ring-2 focus:ring-accent/20"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </header>

      {/* Category selector */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border/80 pb-4">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory;
          const label = locale === "en" ? cat.nameEn : cat.nameZh;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={
                isActive
                  ? "rounded-lg bg-fg px-3.5 py-1.5 text-[13px] font-medium text-surface shadow-sm"
                  : "rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[13px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Active filter summary and tag badge */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-fg-muted">
        <div className="flex items-center gap-2">
          <span>{copy.worksCount(filtered.length)}</span>
          {activeCategoryMeta && activeCategory !== "all" ? (
            <span className="text-fg-subtle">
              · {locale === "en" ? activeCategoryMeta.descEn : activeCategoryMeta.descZh}
            </span>
          ) : null}
        </div>

        {selectedTag ? (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-accent">
            <span>#{selectedTag}</span>
            <button
              type="button"
              onClick={() => handleSelectTag(undefined)}
              className="text-fg-subtle hover:text-fg"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-[14px] text-fg-muted">{copy.emptyStudy}</p>
          {(searchQuery || selectedTag || activeCategory !== "all") && (
            <button
              type="button"
              onClick={handleClearAll}
              className="mt-3 text-[13px] font-medium text-accent hover:underline"
            >
              {copy.clearFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((s) => (
            <StudyCard
              key={s.meta.slug}
              meta={s.meta}
              locale={locale}
              onSelectTag={(tag) => handleSelectTag(tag)}
            />
          ))}
        </div>
      )}
    </Page>
  );
}
