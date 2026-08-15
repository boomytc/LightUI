import { ArrowUpRight } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { messages } from "../lib/i18n";
import { studyEyebrow, studySummary, studyTitle } from "../lib/localize";
import { navigate } from "../lib/nav";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function StudyCard({ meta, locale }: { meta: StudyMeta; locale: Locale }) {
  const href = `/s/${meta.slug}`;
  const eyebrow = studyEyebrow(meta, locale);

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
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{eyebrow}</p>
          ) : null}
          <h2 className="mt-2 text-[1.15rem] font-semibold tracking-tight">{studyTitle(meta, locale)}</h2>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg" />
      </div>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-fg-muted">{studySummary(meta, locale)}</p>
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <DateStamp
          created={meta.created}
          updated={meta.updated}
          locale={locale}
          className="mr-1 font-mono text-[11px] text-fg-subtle"
        />
        <StatusChip status={meta.status} locale={locale} />
        {meta.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-fg-muted">
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

function StatusChip({ status, locale }: { status: StudyMeta["status"]; locale: Locale }) {
  const copy = messages(locale);
  const label =
    status === "active" ? copy.statusActive : status === "draft" ? copy.statusDraft : copy.statusRetired;
  const tone =
    status === "active"
      ? "bg-intent-soft text-intent"
      : status === "draft"
        ? "bg-accent-soft text-accent"
        : "bg-surface-2 text-fg-subtle";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>{label}</span>;
}
