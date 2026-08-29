import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { Link } from "./Link";
import { CATEGORIES } from "../lib/categories";
import { messages } from "../lib/i18n";
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
  const copy = messages(locale);
  const catId = getNoteCategory(note);
  const catMeta = CATEGORIES.find((c) => c.id === catId);
  const categoryName = catMeta ? (locale === "en" ? catMeta.nameEn : catMeta.nameZh) : "";
  const related = relatedMetas(note);
  const readTime = estimateReadingTime(note.body, locale);

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md">
      <div>
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {categoryName ? (
              <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-fg-muted">
                {categoryName}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-fg-subtle">
              <Clock className="size-3" />
              <span>{readTime}</span>
            </span>
          </div>
          <DateStamp
            created={note.date}
            updated={note.updated}
            locale={locale}
            className="font-mono text-[11px] text-fg-subtle"
          />
        </div>

        {/* Note Title */}
        <h2 className="mt-3 text-[16px] font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
          <Link href={`/notes/${note.slug}`} className="no-underline">
            {note.title}
          </Link>
        </h2>

        {/* Note Summary */}
        {note.summary ? (
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted line-clamp-3">
            {note.summary}
          </p>
        ) : null}
      </div>

      {/* Bottom Row: Related Study Pill & Read Link */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        {related.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-fg-subtle">{copy.relatedStudyBadge}{locale === "en" ? ":" : "："}</span>
            {related.map((meta) => (
              <Link
                key={meta.slug}
                href={`/s/${meta.slug}`}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-bg px-2 py-0.5 text-[11px] font-medium text-fg-muted no-underline transition-colors hover:border-accent hover:text-accent"
              >
                <Sparkles className="size-3 text-accent" />
                <span>{studyTitle(meta, locale)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div />
        )}

        <Link
          href={`/notes/${note.slug}`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-fg-muted transition-colors group-hover:text-accent no-underline"
        >
          <span>{locale === "en" ? "Read" : "阅读"}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
