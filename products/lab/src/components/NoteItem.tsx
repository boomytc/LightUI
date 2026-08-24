import { DateStamp } from "./DateStamp";
import { Link } from "./Link";
import { loadStudy } from "../lib/catalog";
import { studyTitle } from "../lib/localize";
import type { Note } from "../lib/notes";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function NoteItem({
  note,
  locale,
  compact = false,
  className,
}: {
  note: Note;
  locale: Locale;
  compact?: boolean;
  className?: string;
}) {
  return (
    <li className={className}>
      <Link
        href={`/notes/${note.slug}`}
        className={compact ? "group block py-3.5 no-underline" : "group block py-4 no-underline"}
      >
        <span
          className={
            compact
              ? "block text-[15px] font-medium tracking-tight text-fg group-hover:text-accent"
              : "block text-[16px] font-medium tracking-tight text-fg group-hover:text-accent"
          }
        >
          {note.title}
        </span>
        <NoteByline note={note} locale={locale} className="mt-1.5" />
        {note.summary ? (
          <span className="mt-1.5 block text-[13px] leading-relaxed text-fg-muted break-keep">
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
  return (
    <span className={className ? `flex flex-wrap items-baseline gap-x-2 text-[12px] ${className}` : "flex flex-wrap items-baseline gap-x-2 text-[12px]"}>
      {related.map((meta, i) => (
        <span key={meta.slug} className="contents">
          {i > 0 ? <span aria-hidden="true">·</span> : null}
          <span className="font-medium text-fg-muted">{studyTitle(meta, locale)}</span>
        </span>
      ))}
      {related.length > 0 ? <span aria-hidden="true" className="text-fg-subtle">·</span> : null}
      <DateStamp
        created={note.date}
        updated={note.updated}
        locale={locale}
        className="font-mono text-fg-subtle"
      />
      <span aria-hidden="true" className="text-fg-subtle">·</span>
      <span className="font-mono text-[11px] text-fg-subtle">
        {estimateReadingTime(note.body, locale)}
      </span>
    </span>
  );
}

export function relatedMetas(note: Note): StudyMeta[] {
  return note.related
    .map((id) => loadStudy(id)?.meta)
    .filter((meta): meta is StudyMeta => Boolean(meta));
}
