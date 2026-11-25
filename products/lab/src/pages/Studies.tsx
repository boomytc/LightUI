import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Page } from "../components/Page";
import { PageHero } from "../components/PageHero";
import { StudyCard } from "../components/StudyCard";
import { CATEGORIES, filterStudies, type CategoryId } from "../lib/categories";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { updateSearchParams, useSearchParams } from "../lib/nav";
import { usePrefs } from "../lib/prefs";

function resolveCategory(raw: string | null): CategoryId {
  return CATEGORIES.some((c) => c.id === raw) ? (raw as CategoryId) : "all";
}

export function Studies() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const allStudies = useMemo(
    () => loadStudies().filter((s) => s.meta.status !== "retired"),
    [],
  );

  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<CategoryId>(() =>
    resolveCategory(searchParams.get("category")),
  );
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(
    () => searchParams.get("tag") || undefined,
  );
  const syncTimerRef = useRef<number | null>(null);
  const lastSyncedSearchRef = useRef<string>(searchParams.toString());

  const cancelPendingQuerySync = () => {
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };

  const commitSearchParams = (updates: Record<string, string | null | undefined>) => {
    updateSearchParams(updates, { replace: true });
    lastSyncedSearchRef.current = new URLSearchParams(window.location.search).toString();
  };

  useEffect(() => {
    const currentSearch = searchParams.toString();
    if (currentSearch === lastSyncedSearchRef.current) return;
    lastSyncedSearchRef.current = currentSearch;
    cancelPendingQuerySync();
    setActiveCategory(resolveCategory(searchParams.get("category")));
    setSelectedTag(searchParams.get("tag") || undefined);
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  const handleCategoryChange = (catId: CategoryId) => {
    cancelPendingQuerySync();
    setActiveCategory(catId);
    setSelectedTag(undefined);
    commitSearchParams({
      category: catId === "all" ? null : catId,
      tag: null,
      q: searchQuery || null,
    });
  };

  const handleQueryChange = (q: string) => {
    setSearchQuery(q);
    cancelPendingQuerySync();
    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      commitSearchParams({ q: q || null });
    }, 250);
  };

  const handleClearQuery = () => {
    cancelPendingQuerySync();
    setSearchQuery("");
    commitSearchParams({ q: null });
  };

  const handleSelectTag = (tag: string | undefined) => {
    cancelPendingQuerySync();
    setSelectedTag(tag);
    commitSearchParams({ tag: tag || null, q: searchQuery || null });
  };

  const handleClearAll = () => {
    cancelPendingQuerySync();
    setSearchQuery("");
    setSelectedTag(undefined);
    setActiveCategory("all");
    commitSearchParams({ category: null, tag: null, q: null });
  };

  const filtered = filterStudies(allStudies, searchQuery, activeCategory, selectedTag);
  const activeCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory);
  const hasFilters = Boolean(searchQuery || selectedTag || activeCategory !== "all");

  return (
    <Page as="main" className="pb-24 pt-8 sm:pt-12">
      <PageHero title={copy.studiesTitle} lede={copy.studiesLede}>
        <div className="relative w-full sm:w-[20rem] sm:min-w-[20rem]">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            className="min-h-10 w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-[0.8125rem] text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-fg-subtle focus:border-border-strong focus:ring-2 focus:ring-ring"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-fg-subtle transition-colors duration-150 hover:text-fg"
              aria-label={copy.clearSearch}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </PageHero>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          aria-label={copy.studiesTitle}
          className="inline-flex w-fit max-w-full flex-wrap gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5"
        >
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
                    ? "rounded-md bg-surface px-3 py-1.5 text-[0.8125rem] font-semibold text-fg transition-colors duration-150"
                    : "rounded-md px-3 py-1.5 text-[0.8125rem] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[0.8125rem] text-fg-muted">
          <span className="tabular-nums">{copy.worksCount(filtered.length)}</span>
          {selectedTag ? (
            <button
              type="button"
              onClick={() => handleSelectTag(undefined)}
              aria-label={copy.clearTag(selectedTag)}
              className="inline-flex items-center gap-1 rounded-md border border-accent bg-accent-soft px-2 py-0.5 text-[0.8125rem] font-medium text-accent transition-colors duration-150 hover:bg-accent/15"
            >
              <span>#{selectedTag}</span>
              <X className="size-3" />
            </button>
          ) : null}
          {hasFilters ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[0.8125rem] font-medium text-accent transition-colors duration-150 hover:underline"
            >
              {copy.clearFilters}
            </button>
          ) : null}
        </div>
      </div>

      {activeCategoryMeta && activeCategory !== "all" ? (
        <p className="mt-3 text-[0.8125rem] text-fg-subtle">
          {locale === "en" ? activeCategoryMeta.descEn : activeCategoryMeta.descZh}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="mt-10 border-y border-dashed border-border py-16 text-center">
          <p className="text-[0.9375rem] text-fg-muted">
            {hasFilters ? copy.emptyFilteredStudy : copy.emptyStudy}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="mt-3 text-[0.8125rem] font-medium text-accent hover:underline"
            >
              {copy.clearFilters}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 grid gap-x-7 gap-y-11 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <StudyCard
              key={s.meta.slug}
              study={s}
              locale={locale}
              selectedTag={selectedTag}
              onSelectTag={(tag) => handleSelectTag(tag === selectedTag ? undefined : tag)}
            />
          ))}
        </div>
      )}
    </Page>
  );
}
