import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { NoteCard } from "../components/NoteCard";
import { Page } from "../components/Page";
import { PageHero } from "../components/PageHero";
import { CATEGORIES, type CategoryId } from "../lib/categories";
import { messages } from "../lib/i18n";
import { updateSearchParams, useSearchParams } from "../lib/nav";
import { filterNotes, loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";

function resolveCategory(raw: string | null): CategoryId {
  return CATEGORIES.some((c) => c.id === raw) ? (raw as CategoryId) : "all";
}

export function Notes() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const allNotes = loadNotes(locale);

  const searchParams = useSearchParams();
  const [category, setCategory] = useState<CategoryId>(() =>
    resolveCategory(searchParams.get("category")),
  );
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
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
    setCategory(resolveCategory(searchParams.get("category")));
    setQuery(searchParams.get("q") || "");
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
    setCategory(catId);
    commitSearchParams({ category: catId === "all" ? null : catId, q: query || null });
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    cancelPendingQuerySync();
    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      commitSearchParams({ q: q || null });
    }, 250);
  };

  const handleClearQuery = () => {
    cancelPendingQuerySync();
    setQuery("");
    commitSearchParams({ q: null });
  };

  const handleClearAll = () => {
    cancelPendingQuerySync();
    setQuery("");
    setCategory("all");
    commitSearchParams({ category: null, q: null });
  };

  const filteredNotes = filterNotes(allNotes, query, category);
  const activeCategoryMeta = CATEGORIES.find((c) => c.id === category);
  const hasFilters = Boolean(query || category !== "all");

  return (
    <Page as="main" className="pb-24 pt-8 sm:pt-12">
      <PageHero title={copy.notesTitle} lede={copy.notesLede}>
        <div className="relative w-full sm:w-[20rem] sm:min-w-[20rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={copy.searchNotesPlaceholder}
            className="min-h-10 w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-[0.8125rem] text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-fg-subtle focus:border-border-strong focus:ring-2 focus:ring-ring"
          />
          {query ? (
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
          aria-label={copy.notesTitle}
          className="inline-flex w-fit max-w-full flex-wrap gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            const title = locale === "en" ? cat.nameEn : cat.nameZh;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? "rounded-md bg-surface px-3 py-1.5 text-[0.8125rem] font-semibold text-fg transition-colors duration-150"
                    : "rounded-md px-3 py-1.5 text-[0.8125rem] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
                }
              >
                {title}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[0.8125rem] text-fg-muted">
          <span className="tabular-nums">{copy.notesCount(filteredNotes.length)}</span>
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

      {activeCategoryMeta && category !== "all" ? (
        <p className="mt-3 text-[0.8125rem] text-fg-subtle">
          {locale === "en" ? activeCategoryMeta.descEn : activeCategoryMeta.descZh}
        </p>
      ) : null}

      {filteredNotes.length === 0 ? (
        <div className="mt-10 border-y border-dashed border-border py-16 text-center">
          <p className="text-[0.9375rem] text-fg-muted">
            {hasFilters ? copy.emptyFilteredNote : copy.emptyNote}
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
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {filteredNotes.map((note) => (
            <li key={note.slug}>
              <NoteCard note={note} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
