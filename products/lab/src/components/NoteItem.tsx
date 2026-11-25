import type { CSSProperties, ReactNode } from "react";
import { DateStamp } from "./DateStamp";
import { Link } from "./Link";
import { loadStudy } from "../lib/catalog";
import { parseDay, stampLabel } from "../lib/dates";
import { studyTitle } from "../lib/localize";
import type { Note } from "../lib/notes";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function NoteItem({
  note,
  locale,
  className,
  style,
}: {
  note: Note;
  locale: Locale;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li className={className} style={style}>
      <Link
        href={`/notes/${note.slug}`}
        className="group block py-4 no-underline transition-colors duration-150 hover:bg-surface/60 sm:-mx-3 sm:rounded-lg sm:px-3"
      >
        <span className="block text-[1.125rem] font-semibold leading-snug tracking-[-0.02em] text-fg transition-colors duration-150 group-hover:text-accent">
          {note.title}
        </span>
        <NoteByline note={note} locale={locale} className="mt-1.5" />
        {note.summary ? (
          <span className="mt-1.5 block line-clamp-2 text-[0.8125rem] leading-relaxed text-fg-muted">
            {note.summary}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

export function estimateReadingTime(body: string, locale: Locale): string {
  const len = body.trim().length;
  const minutes = Math.max(1, Math.ceil(len / (locale === "en" ? 900 : 450)));
  return locale === "en" ? `${minutes} min read` : `${minutes} 分钟阅读`;
}

export function NoteByline({
  note,
  locale,
  className,
}: {
  note: Note;
  locale: Locale;
  className?: string;
}) {
  const related = relatedMetas(note);
  const hasDate = Boolean(
    stampLabel(note.date, note.updated, locale) && (parseDay(note.updated) ?? parseDay(note.date)),
  );

  const segments: { key: string; node: ReactNode }[] = [];
  for (const meta of related) {
    segments.push({
      key: `rel-${meta.slug}`,
      node: <span className="font-medium text-fg-muted">{studyTitle(meta, locale)}</span>,
    });
  }
  if (hasDate) {
    segments.push({
      key: "date",
      node: (
        <DateStamp
          created={note.date}
          updated={note.updated}
          locale={locale}
          className="tabular-nums text-fg-subtle"
        />
      ),
    });
  }
  segments.push({
    key: "reading-time",
    node: <span className="tabular-nums text-fg-subtle">{estimateReadingTime(note.body, locale)}</span>,
  });

  return (
    <span
      className={
        className
          ? `flex flex-wrap items-baseline gap-x-2 text-[0.8125rem] ${className}`
          : "flex flex-wrap items-baseline gap-x-2 text-[0.8125rem]"
      }
    >
      {segments.map((segment, i) => (
        <span key={segment.key} className="contents">
          {i > 0 ? (
            <span aria-hidden="true" className="text-fg-subtle">
              ·
            </span>
          ) : null}
          {segment.node}
        </span>
      ))}
    </span>
  );
}

export function relatedMetas(note: Note): StudyMeta[] {
  return note.related
    .map((id) => loadStudy(id)?.meta)
    .filter((meta): meta is StudyMeta => Boolean(meta));
}
