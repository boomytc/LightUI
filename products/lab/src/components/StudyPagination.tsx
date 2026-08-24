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
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/s/${prev.meta.slug}`}
          className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 no-underline shadow-card transition-all duration-150 hover:border-border-strong hover:bg-surface-2"
        >
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>{copy.prevStudyLabel}</span>
            </div>
            <p className="mt-2 text-[14px] font-semibold text-fg group-hover:text-accent transition-colors">
              {studyTitle(prev.meta, locale)}
            </p>
            {prev.meta.asks ? (
              <p className="mt-1 text-[12px] text-fg-muted line-clamp-1">
                {studyAsks(prev.meta, locale)}
              </p>
            ) : null}
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/s/${next.meta.slug}`}
          className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 text-right no-underline shadow-card transition-all duration-150 hover:border-border-strong hover:bg-surface-2"
        >
          <div>
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-fg-subtle">
              <span>{copy.nextStudyLabel}</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-2 text-[14px] font-semibold text-fg group-hover:text-accent transition-colors">
              {studyTitle(next.meta, locale)}
            </p>
            {next.meta.asks ? (
              <p className="mt-1 text-[12px] text-fg-muted line-clamp-1">
                {studyAsks(next.meta, locale)}
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
