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
}: {
  note: Note;
  locale: Locale;
  compact?: boolean;
}) {
  const related = relatedMetas(note);

  return (
    <li>
      <Link
        href={`/notes/${note.slug}`}
        className={
          compact
            ? "-mx-3 block rounded-xl px-3 py-4 no-underline transition-colors hover:bg-surface-2"
            : "-mx-3 block rounded-xl px-3 py-5 no-underline transition-colors hover:bg-surface-2 sm:-mx-4 sm:px-4"
        }
      >
        <span
          className={
            compact
              ? "block text-[15px] font-medium tracking-tight text-fg"
              : "block text-[16px] font-medium tracking-tight text-fg"
          }
        >
          {note.title}
        </span>
        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[12px] text-fg-subtle">
          {related.map((meta, i) => (
            <span key={meta.slug} className="contents">
              {i > 0 ? <span aria-hidden="true">·</span> : null}
              <span>{studyTitle(meta, locale)}</span>
            </span>
          ))}
          {related.length > 0 ? <span aria-hidden="true">·</span> : null}
          <DateStamp
            created={note.date}
            updated={note.updated}
            locale={locale}
            className="font-mono"
          />
        </span>
        {note.summary ? (
          <span
            className={
              compact
                ? "mt-1.5 block text-[13px] leading-relaxed text-fg-muted break-keep"
                : "mt-1.5 block text-[14px] leading-relaxed text-fg-muted break-keep"
            }
          >
            {note.summary}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

export function relatedMetas(note: Note): StudyMeta[] {
  return note.related
    .map((id) => loadStudy(id)?.meta)
    .filter((meta): meta is StudyMeta => Boolean(meta));
}
