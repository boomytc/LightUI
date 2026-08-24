import { ArrowUpRight, HelpCircle } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { getStudyCategory } from "../lib/categories";
import { messages } from "../lib/i18n";
import { studyAsks, studySummary, studyTitle } from "../lib/localize";
import { navigate } from "../lib/nav";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function StudyCard({
  meta,
  locale,
  onSelectTag,
}: {
  meta: StudyMeta;
  locale: Locale;
  onSelectTag?: (tag: string) => void;
}) {
  const href = `/s/${meta.slug}`;
  const copy = messages(locale);
  const asks = studyAsks(meta, locale);
  const categoryId = getStudyCategory(meta.slug);

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {meta.eyebrow ? (
                <p className="text-[11px] font-medium tracking-wide uppercase text-fg-subtle">
                  {meta.eyebrow}
                </p>
              ) : (
                <p className="text-[11px] font-medium tracking-wide uppercase text-accent/80">
                  {categoryId}
                </p>
              )}
            </div>
            <h2 className="mt-0.5 text-[1.25rem] font-semibold tracking-tight text-fg group-hover:text-accent transition-colors">
              {studyTitle(meta, locale)}
            </h2>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg" />
        </div>

        {asks ? (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[12px] font-medium text-fg">
            <HelpCircle className="size-3.5 shrink-0 mt-0.5 text-accent" />
            <span className="leading-snug">{asks}</span>
          </div>
        ) : null}

        <p className="mt-2.5 text-[13px] leading-relaxed text-fg-muted">
          {studySummary(meta, locale)}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {meta.tags?.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectTag?.(tag);
              }}
              className="rounded-md border border-border/80 bg-bg px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle transition-colors hover:border-border-strong hover:text-fg"
            >
              #{tag}
            </button>
          ))}
        </div>

        {meta.status !== "active" ? (
          <span
            className={
              meta.status === "draft"
                ? "rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent"
                : "rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-subtle"
            }
          >
            {meta.status === "draft" ? copy.statusDraft : copy.statusRetired}
          </span>
        ) : (
          <DateStamp
            created={meta.created}
            updated={meta.updated}
            locale={locale}
            className="font-mono text-[11px] text-fg-subtle"
          />
        )}
      </div>
    </a>
  );
}

