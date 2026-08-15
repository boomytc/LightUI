import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { DateStamp } from "../components/DateStamp";
import { Link } from "../components/Link";
import { relatedMetas } from "../components/NoteItem";
import { Page } from "../components/Page";
import { Markdown } from "../lib/Markdown";
import { messages } from "../lib/i18n";
import { loadNote } from "../lib/notes";
import { studyEyebrow, studySummary, studyTitle } from "../lib/localize";
import { usePrefs } from "../lib/prefs";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function NotePage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const note = loadNote(slug, locale);

  if (!note) {
    return (
      <Page as="main" measure="prose" className="py-16">
        <p className="text-[15px] text-fg-muted">{copy.missingNote(slug)}</p>
        <Link href="/notes" className="mt-4 inline-block text-[13px] text-fg-muted no-underline hover:text-fg">
          {copy.allNotes}
        </Link>
      </Page>
    );
  }

  const related = relatedMetas(note);

  return (
    <Page as="article" measure="prose" className="py-12">
      <Link
        href="/notes"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 -ml-2 text-[13px] text-fg-muted no-underline hover:bg-surface-2 hover:text-fg"
      >
        <ArrowLeft className="size-3.5" />
        {copy.notesIndex}
      </Link>
      <h1 className="mt-5 text-[1.8rem] font-semibold tracking-tight">{note.title}</h1>
      <DateStamp
        created={note.date}
        updated={note.updated}
        locale={locale}
        className="mt-2 block font-mono text-[12px] text-fg-subtle"
      />
      <div className="mt-8">
        <Markdown source={note.body} />
      </div>
      {related.length > 0 ? (
        <aside className="mt-14 space-y-3">
          {related.map((meta) => (
            <TryCard key={meta.slug} meta={meta} locale={locale} label={copy.tryWork} />
          ))}
        </aside>
      ) : null}
    </Page>
  );
}

function TryCard({
  meta,
  locale,
  label,
}: {
  meta: StudyMeta;
  locale: Locale;
  label: string;
}) {
  const eyebrow = studyEyebrow(meta, locale);
  return (
    <Link
      href={`/s/${meta.slug}`}
      className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 no-underline shadow-card transition-colors hover:border-border-strong hover:bg-surface-2"
    >
      <span className="min-w-0">
        {eyebrow ? (
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
            {eyebrow}
          </span>
        ) : null}
        <span className={`block text-[1.05rem] font-semibold tracking-tight ${eyebrow ? "mt-2" : ""}`}>
          {studyTitle(meta, locale)}
        </span>
        <span className="mt-2 block text-[13px] leading-relaxed text-fg-muted break-keep">{studySummary(meta, locale)}</span>
        <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-fg">
          {label}
          <ArrowUpRight className="size-3.5 text-fg-subtle transition-colors group-hover:text-fg" />
        </span>
      </span>
    </Link>
  );
}
