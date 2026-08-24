import { ArrowUpRight } from "lucide-react";
import { BackLink } from "../components/BackLink";
import { Link } from "../components/Link";
import { NoteByline, relatedMetas } from "../components/NoteItem";
import { Page } from "../components/Page";
import { Markdown } from "../lib/Markdown";
import { messages } from "../lib/i18n";
import { loadNote } from "../lib/notes";
import { studyTitle } from "../lib/localize";
import { usePrefs } from "../lib/prefs";
import type { Locale } from "../lib/prefs";
import type { StudyMeta } from "../lib/study";

export function NotePage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const note = loadNote(slug, locale);

  if (!note) {
    return (
      <Page as="main" className="py-12">
        <p className="text-[15px] text-fg-muted">{copy.missingNote(slug)}</p>
        <Link href="/notes" className="mt-4 inline-block text-[13px] text-fg-muted no-underline hover:text-fg">
          {copy.allNotes}
        </Link>
      </Page>
    );
  }

  const related = relatedMetas(note);

  return (
    <Page as="article" className="pb-14 pt-8">
      <div className="lg:grid lg:grid-cols-[minmax(0,42rem)_minmax(16rem,22rem)] lg:items-start lg:gap-x-16">
        <div>
          <BackLink
            fallback="/notes"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 -ml-2 text-[13px] text-fg-muted no-underline hover:bg-surface-2 hover:text-fg"
          />
          <h1 className="mt-4 text-[1.8rem] font-semibold tracking-tight">{note.title}</h1>
          <NoteByline note={note} locale={locale} className="mt-2" />
          <div className="mt-6">
            <Markdown source={note.body} />
          </div>
        </div>
        {related.length > 0 ? (
          <aside className="mt-10 space-y-3 lg:sticky lg:top-24 lg:mt-12">
            {related.map((meta) => (
              <TryCard key={meta.slug} meta={meta} locale={locale} label={copy.tryWork} />
            ))}
          </aside>
        ) : null}
      </div>
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
  return (
    <Link
      href={`/s/${meta.slug}`}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 no-underline shadow-card transition-colors hover:border-border-strong hover:bg-surface-2"
    >
      <span className="min-w-0 text-[15px] font-semibold tracking-tight">{studyTitle(meta, locale)}</span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-fg">
        {label}
        <ArrowUpRight className="size-3.5 text-fg-subtle transition-colors group-hover:text-fg" />
      </span>
    </Link>
  );
}
