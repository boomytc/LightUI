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
    <div className="mt-12 grid gap-4 border-t border-border/80 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/notes/${prev.slug}`}
          className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 text-left no-underline shadow-card transition-all duration-150 hover:border-border-strong hover:bg-surface-2"
        >
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>{copy.prevNoteLabel}</span>
            </div>
            <h3 className="mt-2 text-[14px] font-semibold text-fg group-hover:text-accent transition-colors">
              {prev.title}
            </h3>
            {prev.summary ? (
              <p className="mt-1 text-[12px] text-fg-muted line-clamp-2">
                {prev.summary}
              </p>
            ) : null}
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/notes/${next.slug}`}
          className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 text-right no-underline shadow-card transition-all duration-150 hover:border-border-strong hover:bg-surface-2"
        >
          <div>
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-fg-subtle">
              <span>{copy.nextNoteLabel}</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
            <h3 className="mt-2 text-[14px] font-semibold text-fg group-hover:text-accent transition-colors">
              {next.title}
            </h3>
            {next.summary ? (
              <p className="mt-1 text-[12px] text-fg-muted line-clamp-2">
                {next.summary}
              </p>
            ) : null}
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
