import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "./Link";
import { messages } from "../lib/i18n";
import { getAdjacentNotes } from "../lib/notes";
import type { Locale } from "../lib/prefs";

export function NotePagination({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const copy = messages(locale);
  const { prev, next } = getAdjacentNotes(slug, locale);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label={locale === "en" ? "Note navigation" : "笔记翻页"}
      className="mt-12 grid gap-6 border-t border-border pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link href={`/notes/${prev.slug}`} className="group block text-left no-underline">
          <div className="flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle">
            <ArrowLeft className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
            <span>{copy.prevNoteLabel}</span>
          </div>
          <p className="mt-1.5 text-[0.9375rem] font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
            {prev.title}
          </p>
          {prev.summary ? (
            <p className="mt-1 line-clamp-2 text-[0.8125rem] text-fg-muted">{prev.summary}</p>
          ) : null}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/notes/${next.slug}`}
          className="group block text-left no-underline sm:text-right"
        >
          <div className="flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle sm:justify-end">
            <span>{copy.nextNoteLabel}</span>
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </div>
          <p className="mt-1.5 text-[0.9375rem] font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
            {next.title}
          </p>
          {next.summary ? (
            <p className="mt-1 line-clamp-2 text-[0.8125rem] text-fg-muted">{next.summary}</p>
          ) : null}
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
