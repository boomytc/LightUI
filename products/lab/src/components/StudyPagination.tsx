import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "./Link";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";

export function StudyPagination({ slug, locale }: { slug: string; locale: Locale }) {
  const copy = messages(locale);
  const studies = loadStudies().filter((s) => s.meta.status !== "retired");
  const currentIndex = studies.findIndex((s) => s.meta.slug === slug);

  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? studies[currentIndex - 1] : null;
  const next = currentIndex < studies.length - 1 ? studies[currentIndex + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav
      aria-label={locale === "en" ? "Study navigation" : "研究翻页"}
      className="mt-10 grid gap-6 border-t border-border pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/s/${prev.meta.slug}`}
          className="group block no-underline"
        >
          <div className="flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle">
            <ArrowLeft className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
            <span>{copy.prevStudyLabel}</span>
          </div>
          <p className="mt-1.5 text-[0.9375rem] font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
            {studyTitle(prev.meta, locale)}
          </p>
          {prev.meta.asks ? (
            <p className="mt-1 line-clamp-1 text-[0.8125rem] text-fg-muted">
              {studyAsks(prev.meta, locale)}
            </p>
          ) : null}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/s/${next.meta.slug}`}
          className="group block text-left no-underline sm:text-right"
        >
          <div className="flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle sm:justify-end">
            <span>{copy.nextStudyLabel}</span>
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </div>
          <p className="mt-1.5 text-[0.9375rem] font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
            {studyTitle(next.meta, locale)}
          </p>
          {next.meta.asks ? (
            <p className="mt-1 line-clamp-1 text-[0.8125rem] text-fg-muted">
              {studyAsks(next.meta, locale)}
            </p>
          ) : null}
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
