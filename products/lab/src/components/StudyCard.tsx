import { ArrowUpRight } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { messages } from "../lib/i18n";
import { studySummary, studyTitle } from "../lib/localize";
import { navigate } from "../lib/nav";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function StudyCard({ meta, locale }: { meta: StudyMeta; locale: Locale }) {
  const href = `/s/${meta.slug}`;
  const copy = messages(locale);

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors duration-150 hover:border-border-strong hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[1.25rem] font-semibold tracking-tight">{studyTitle(meta, locale)}</h2>
        <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg" />
      </div>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-fg-muted">{studySummary(meta, locale)}</p>
      {meta.status !== "active" ? (
        <div className="mt-4">
          <span
            className={
              meta.status === "draft"
                ? "rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent"
                : "rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-subtle"
            }
          >
            {meta.status === "draft" ? copy.statusDraft : copy.statusRetired}
          </span>
        </div>
      ) : (
        <DateStamp
          created={meta.created}
          updated={meta.updated}
          locale={locale}
          className="mt-4 font-mono text-[11px] text-fg-subtle"
        />
      )}
    </a>
  );
}
