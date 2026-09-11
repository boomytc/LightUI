import { ArrowUpRight, HelpCircle } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { categoryLabel, getStudyCategory } from "../lib/categories";
import { messages } from "../lib/i18n";
import { studyAsks, studySummary, studyTitle } from "../lib/localize";
import { navigate } from "../lib/nav";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function StudyCard({
  meta,
  locale,
  onSelectTag,
  selectedTag,
}: {
  meta: StudyMeta;
  locale: Locale;
  onSelectTag?: (tag: string) => void;
  selectedTag?: string;
}) {
  const href = `/s/${meta.slug}`;
  const copy = messages(locale);
  const asks = studyAsks(meta, locale);
  const categoryId = getStudyCategory(meta.slug);

  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      className="lab-card group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card motion-safe:hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:shadow-menu"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-accent">
              {meta.eyebrow || categoryLabel(categoryId, locale)}
            </p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-tight text-fg transition-colors duration-150 group-hover:text-accent">
              {studyTitle(meta, locale)}
            </h2>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg" />
        </div>

        {asks ? (
          <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[12px] font-medium text-fg">
            <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <span className="leading-snug">{asks}</span>
          </div>
        ) : null}

        <p className="mt-2.5 text-[13px] leading-relaxed text-fg-muted line-clamp-3">
          {studySummary(meta, locale)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex flex-wrap gap-1">
          {meta.tags?.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSelectTag) {
                  onSelectTag(tag);
                } else {
                  navigate(`/studies?tag=${tag}`);
                }
              }}
              className={
                selectedTag === tag
                  ? "rounded-md border border-accent bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent"
                  : "rounded-md border border-border/80 bg-bg px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle transition-colors duration-150 hover:border-border-strong hover:text-fg"
              }
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
