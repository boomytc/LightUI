import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Page } from "../components/Page";
import { PageHero } from "../components/PageHero";
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
  const hasFilters = Boolean(searchQuery || selectedTag || activeCategory !== "all");

  return (
    <Page as="main" className="pb-24 pt-10 sm:pt-12">
      <PageHero title={copy.studiesTitle} lede={copy.studiesLede}>
        <div className="relative w-full sm:min-w-[20rem] sm:w-[20rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-8 text-[13px] text-fg shadow-xs outline-none transition-colors duration-150 placeholder:text-fg-subtle focus:border-border-strong focus:ring-2 focus:ring-ring"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-fg-subtle transition-colors hover:text-fg"
              aria-label={copy.clearFilters}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </PageHero>

      <div className="mt-5 flex flex-wrap gap-1 rounded-xl border border-border bg-surface-2/80 p-1">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory;
          const label = locale === "en" ? cat.nameEn : cat.nameZh;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "rounded-lg bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg shadow-xs"
                  : "rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-fg-muted">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span>{copy.worksCount(filtered.length)}</span>
          {activeCategoryMeta && activeCategory !== "all" ? (
            <span className="text-fg-subtle">
              · {locale === "en" ? activeCategoryMeta.descEn : activeCategoryMeta.descZh}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {selectedTag ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-accent">
              <span>#{selectedTag}</span>
              <button
                type="button"
                onClick={() => handleSelectTag(undefined)}
                className="rounded-sm text-fg-subtle transition-colors hover:text-fg"
                aria-label={copy.clearFilters}
              >
                <X className="size-3" />
              </button>
            </div>
          ) : null}
          {hasFilters ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[12px] font-medium text-accent transition-colors hover:underline"
            >
              {copy.clearFilters}
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-[14px] text-fg-muted">{hasFilters ? copy.emptyFilteredStudy : copy.emptyStudy}</p>
          {hasFilters ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="mt-3 text-[13px] font-medium text-accent hover:underline"
            >
              {copy.clearFilters}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filtered.map((s, i) => (
            <div
              key={s.meta.slug}
              className="lab-rise min-w-0"
              style={{ animationDelay: `${40 + Math.min(i, 11) * 40}ms` }}
            >
              <StudyCard
                meta={s.meta}
                StageView={s.StageView}
                locale={locale}
                selectedTag={selectedTag}
                onSelectTag={(tag) => handleSelectTag(tag)}
              />
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
