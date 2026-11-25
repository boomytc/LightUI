import { ArrowRight } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { Link } from "./Link";
import { CATEGORIES } from "../lib/categories";
import { studyTitle } from "../lib/localize";
import { estimateReadingTime, relatedMetas } from "./NoteItem";
import { getNoteCategory, type Note } from "../lib/notes";
import type { Locale } from "../lib/prefs";

export function NoteCard({
  note,
  locale,
}: {
  note: Note;
  locale: Locale;
}) {
  const catId = getNoteCategory(note);
  const catMeta = CATEGORIES.find((c) => c.id === catId);
  const categoryName = catMeta ? (locale === "en" ? catMeta.nameEn : catMeta.nameZh) : "";
  const related = relatedMetas(note);
  const readTime = estimateReadingTime(note.body, locale);
  const href = `/notes/${note.slug}`;

  return (
    <article className="group relative py-5 transition-colors duration-150 hover:bg-surface/60 sm:-mx-3 sm:rounded-lg sm:px-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem] md:items-baseline md:gap-10">
        <div className="min-w-0">
          <h2 className="text-[1.125rem] font-semibold leading-snug tracking-[-0.02em] text-fg transition-colors duration-150 group-hover:text-accent">
            <Link href={href} className="no-underline after:absolute after:inset-0 after:content-['']">
              {note.title}
            </Link>
          </h2>

          {note.summary ? (
            <p className="mt-1.5 max-w-[62ch] line-clamp-2 text-[0.9375rem] leading-[1.6] text-fg-muted">
              {note.summary}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[0.8125rem] text-fg-subtle md:flex-col md:items-end md:text-right">
          <div className="flex flex-wrap items-center gap-x-2 tabular-nums">
            {categoryName ? <span className="text-fg-muted">{categoryName}</span> : null}
            {categoryName ? <span aria-hidden="true">·</span> : null}
            <DateStamp created={note.date} updated={note.updated} locale={locale} />
            <span aria-hidden="true">·</span>
            <span>{readTime}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:justify-end">
            {related.map((meta) => (
              <Link
                key={meta.slug}
                href={`/s/${meta.slug}`}
                className="relative z-10 font-medium text-fg-muted no-underline transition-colors duration-150 hover:text-accent"
              >
                {studyTitle(meta, locale)}
              </Link>
            ))}
            <span aria-hidden="true" className="inline-flex items-center gap-1 font-medium text-accent">
              <span>{locale === "en" ? "Read" : "阅读"}</span>
              <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
