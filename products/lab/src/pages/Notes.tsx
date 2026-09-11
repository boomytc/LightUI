import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { NoteCard } from "../components/NoteCard";
import { Page } from "../components/Page";
import { PageHero } from "../components/PageHero";
import { CATEGORIES, type CategoryId } from "../lib/categories";
import { messages } from "../lib/i18n";
import { updateSearchParams, useSearchParams } from "../lib/nav";
import { filterNotes, loadNotes } from "../lib/notes";
import { usePrefs } from "../lib/prefs";

export function Notes() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const allNotes = loadNotes(locale);

  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CategoryId) || "all";
  const initialQuery = searchParams.get("q") || "";

  const [category, setCategory] = useState<CategoryId>(
    CATEGORIES.some((c) => c.id === initialCategory) ? initialCategory : "all",
  );
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const cat = (searchParams.get("category") as CategoryId) || "all";
    if (CATEGORIES.some((c) => c.id === cat)) {
      setCategory(cat);
    }
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleCategoryChange = (catId: CategoryId) => {
    setCategory(catId);
    updateSearchParams({ category: catId === "all" ? null : catId }, { replace: true });
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    updateSearchParams({ q: q || null }, { replace: true });
  };

  const handleClearAll = () => {
    setQuery("");
    setCategory("all");
    updateSearchParams({ category: null, q: null }, { replace: true });
  };

  const filteredNotes = filterNotes(allNotes, query, category);
  const hasFilters = Boolean(query || category !== "all");

  return (
    <Page as="main" className="pb-24 pt-10 sm:pt-12">
      <PageHero title={copy.notesTitle} lede={copy.notesLede}>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={copy.searchNotesPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-surface py-1.5 pl-8 pr-8 text-[13px] text-fg shadow-xs outline-none transition-colors duration-150 placeholder:text-fg-subtle focus:border-border-strong focus:ring-2 focus:ring-ring"
          />
          {query ? (
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

      <div className="mt-4 flex items-center justify-between text-[12px] text-fg-subtle">
        <span>{copy.notesCount(filteredNotes.length)}</span>
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
        <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center text-[14px] text-fg-muted">
          <p>{hasFilters ? copy.emptyFilteredNote : copy.emptyNote}</p>
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
