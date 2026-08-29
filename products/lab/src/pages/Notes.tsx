import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { NoteCard } from "../components/NoteCard";
import { Page } from "../components/Page";
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

  return (
    <Page as="main" className="pb-24 pt-10">
      {/* Header */}
      <header className="border-b border-border/80 pb-6">
        <h1 className="text-[1.8rem] font-bold tracking-tight sm:text-[2.2rem]">
          {copy.notesTitle}
        </h1>
        <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-fg-muted sm:text-[15px]">
          {copy.notesLede}
        </p>
      </header>

      {/* Filter and Search Controls */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface-2 p-1">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            const title = locale === "en" ? cat.nameEn : cat.nameZh;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={
                  isSelected
                    ? "rounded-lg bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg shadow-xs transition-all"
                    : "rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted hover:text-fg transition-colors"
                }
              >
                {title}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative flex w-full items-center sm:w-72">
          <Search className="pointer-events-none absolute left-3 size-3.5 text-fg-subtle" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={copy.searchNotesPlaceholder}
            className="w-full rounded-xl border border-border bg-surface py-1.5 pl-8 pr-8 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-border-strong"
          />
          {query ? (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              className="absolute right-2.5 text-fg-subtle hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="mt-5 flex items-center justify-between text-[12px] text-fg-subtle">
        <span>{copy.notesCount(filteredNotes.length)}</span>
        {(query || category !== "all") && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[12px] font-medium text-accent hover:underline"
          >
            {copy.clearFilters}
          </button>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center text-[14px] text-fg-muted">
          <p>{copy.emptyNote}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {filteredNotes.map((note) => (
            <NoteCard key={note.slug} note={note} locale={locale} />
          ))}
        </div>
      )}
    </Page>
  );
}
