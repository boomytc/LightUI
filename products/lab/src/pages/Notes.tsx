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
  const lastSyncedQueryRef = useRef<string>(searchParams.get("q") || "");

  useEffect(() => {
    setCategory(resolveCategory(searchParams.get("category")));
    const urlQuery = searchParams.get("q") || "";
    if (syncTimerRef.current === null && urlQuery !== lastSyncedQueryRef.current) {
      lastSyncedQueryRef.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  const cancelPendingQuerySync = () => {
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };

  const handleCategoryChange = (catId: CategoryId) => {
    cancelPendingQuerySync();
    lastSyncedQueryRef.current = query;
    setCategory(catId);
    updateSearchParams(
      { category: catId === "all" ? null : catId, q: query || null },
      { replace: true },
    );
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    cancelPendingQuerySync();
    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      lastSyncedQueryRef.current = q;
      updateSearchParams({ q: q || null }, { replace: true });
    }, 250);
  };

  const handleClearQuery = () => {
    cancelPendingQuerySync();
    lastSyncedQueryRef.current = "";
    setQuery("");
    updateSearchParams({ q: null }, { replace: true });
  };

  const handleClearAll = () => {
    cancelPendingQuerySync();
    lastSyncedQueryRef.current = "";
    setQuery("");
    setCategory("all");
    updateSearchParams({ category: null, q: null }, { replace: true });
  };

  const filteredNotes = filterNotes(allNotes, query, category);
  const activeCategoryMeta = CATEGORIES.find((c) => c.id === category);
  const hasFilters = Boolean(query || category !== "all");

  return (
    <Page as="main" className="pb-24 pt-10 sm:pt-12">
      <PageHero title={copy.notesTitle} lede={copy.notesLede}>
        <div className="relative w-full sm:w-[20rem] sm:min-w-[20rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={copy.searchNotesPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-8 text-[13px] text-fg shadow-xs outline-none transition-colors duration-150 placeholder:text-fg-subtle focus:border-border-strong focus:ring-2 focus:ring-ring"
          />
          {query ? (
            <button
              type="button"
              onClick={handleClearQuery}
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
                  ? "rounded-lg bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg shadow-xs"
                  : "rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
              }
            >
              {title}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-fg-muted">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span>{copy.notesCount(filteredNotes.length)}</span>
          {activeCategoryMeta && category !== "all" ? (
            <span className="text-fg-subtle">
              · {locale === "en" ? activeCategoryMeta.descEn : activeCategoryMeta.descZh}
            </span>
          ) : null}
        </div>
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

      {filteredNotes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-[14px] text-fg-muted">{hasFilters ? copy.emptyFilteredNote : copy.emptyNote}</p>
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
          {filteredNotes.map((note, i) => (
            <div
              key={note.slug}
              className="lab-rise min-w-0"
              style={{ animationDelay: `${40 + Math.min(i, 11) * 40}ms` }}
            >
              <NoteCard note={note} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
